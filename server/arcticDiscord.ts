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
    const url = discordOAuth.createAuthorizationURL(state, ["identify", "email"]);
    res.redirect(url);
}

/**
 * Handles the Discord callback, exchanges the code for tokens, fetches the user profile,
 * upserts the user in our DB, creates a minimal session (only oidcSub), and redirects home.
 */
export async function handleDiscordCallback(req: Request, res: Response) {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
        return res.redirect("/");
    }
    // Verify state if we stored it earlier
    if (req.session.discordState && req.session.discordState !== state) {
        console.error("Discord OAuth state mismatch");
        return res.redirect("/");
    }
    try {
        const tokens = await discordOAuth.validateAuthorizationCode(code);
        // Fetch user profile from Discord API
        const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await userRes.json();

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
        await storage.upsertUser({
            oidcSub,
            email: authUser.email,
            firstName: profile.username,
            lastName: "",
            profileImageUrl: authUser.profileImage,
        });

        // Regenerate session and login with minimal object
        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.redirect("/");
            }
            req.login({ oidcSub }, (loginErr) => {
                if (loginErr) {
                    console.error("Login error:", loginErr);
                    return res.redirect("/");
                }
                // Optionally update streak, points, etc. (reuse existing logic if needed)
                res.redirect("/");
            });
        });
    } catch (e) {
        console.error("Discord OAuth callback error:", e);
        res.redirect("/");
    }
}
