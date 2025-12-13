// server/arcticDiscord.ts
import { Discord } from "arctic"; // corrected export name
import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";

// Extend session type for discordState
declare module "express-session" {
    interface SessionData {
        discordState?: string;
    }
}

// Environment variables – ensure they exist in .env
const clientId = process.env.DISCORD_CLIENT_ID as string;
const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
const baseUrl = process.env.BASE_URL || "https://ggloop.io";

// Initialize arctic Discord client
const discordOAuth = new Discord(clientId, clientSecret, `${baseUrl}/api/auth/discord/callback`);

/**
 * Returns the URL the user should be redirected to for Discord login.
 * Includes a random state string for CSRF protection.
 */
export function getDiscordAuthUrl(req: Request, res: Response) {
    const state = crypto.randomBytes(16).toString("hex");
    // Store state in session for verification later (optional but recommended)
    req.session.discordState = state;
    const url = discordOAuth.createAuthorizationURL(state, { scopes: ["identify", "email"] });
    res.redirect(url.toString());
}

/**
 * Handles the Discord callback, exchanges the code for tokens, fetches the user profile,
 * upserts the user in our DB, creates a minimal session (only oidcSub), and redirects home.
 */
export async function handleDiscordCallback(req: Request, res: Response) {
    console.log("[Arctic] Starting Discord callback handling");
    const { code, state } = req.query as { code?: string; state?: string };

    if (!code || !state) {
        console.error("[Arctic] Missing code or state");
        return res.redirect("/");
    }

    // Verify state if we stored it earlier
    if (req.session.discordState && req.session.discordState !== state) {
        console.error("[Arctic] Discord OAuth state mismatch");
        return res.redirect("/");
    }

    try {
        console.log("[Arctic] Validating authorization code...");
        const tokens = await discordOAuth.validateAuthorizationCode(code);
        const accessToken = tokens.accessToken;
        console.log("[Arctic] Tokens received. Access token length:", accessToken.length);

        // Fetch user profile from Discord API
        console.log("[Arctic] Fetching user profile...");
        const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userRes.ok) {
            throw new Error(`Failed to fetch Discord profile: ${userRes.status} ${userRes.statusText}`);
        }

        const profile = await userRes.json();
        console.log("[Arctic] Profile fetched:", profile.id, profile.username);

        const oidcSub = `discord:${profile.id}`;
        const authUser = {
            provider: "discord" as const,
            providerId: profile.id,
            oidcSub,
            email: profile.email ?? "",
            displayName: profile.username,
            profileImage: profile.avatar
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                : undefined,
        };

        // Upsert user (basic info only – no Date objects)
        console.log("[Arctic] Upserting user to DB...");
        await storage.upsertUser({
            oidcSub,
            email: authUser.email,
            firstName: profile.username,
            lastName: "",
            profileImageUrl: authUser.profileImage,
        });
        console.log("[Arctic] User upserted.");

        // Regenerate session and login with minimal object
        console.log("[Arctic] Regenerating session...");
        req.session.regenerate((err) => {
            if (err) {
                console.error("[Arctic] Session regeneration error:", err);
                return res.status(500).json({ error: "Session regeneration failed", details: err.message });
            }

            console.log("[Arctic] Logging in user with oidcSub:", oidcSub);
            req.login({ oidcSub }, (loginErr) => {
                if (loginErr) {
                    console.error("[Arctic] Login error:", loginErr);
                    return res.status(500).json({ error: "Login failed", details: loginErr.message });
                }
                // Optionally update streak, points, etc. (reuse existing logic if needed)
                console.log("[Arctic] Login successful. Redirecting to /");
                res.redirect("/");
            });
        });
    } catch (e: any) {
        console.error("[Arctic] Discord OAuth callback CRITICAL error:", e);
        // RETURN THE ERROR TO THE USER SO WE CAN SEE IT
        res.status(500).json({
            message: "Critical Error in Discord Callback",
            error: e.message,
            stack: e.stack,
            type: e.constructor.name
        });
    }
}
