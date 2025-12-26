import { Router } from "express";
import { z } from "zod";
import crypto from 'crypto';
import { db } from "../db";
import { riotAccounts } from "@shared/schema";
import { eq } from "drizzle-orm";

const riotAuthRouter = Router();

// ===========================================
// COMPLIANCE: Riot API Access Control
// Set RIOT_API_ENABLED=false to disable Riot OAuth (for TOS compliance)
// Only enable when you have production API approval
// ===========================================
const RIOT_API_ENABLED = process.env.RIOT_API_ENABLED === 'true';
const COMPLIANCE_MESSAGE = "Riot account linking is temporarily disabled while we finalize production API approval. Please use Discord or other login methods in the meantime. Follow @ggloopllc for updates!";

// ===========================================
// MICRO-STEP B: Endpoint 1 - Init OAuth
// ===========================================
riotAuthRouter.post("/oauth/init", (req, res) => {
    try {
        // COMPLIANCE CHECK: Block if Riot API is disabled
        if (!RIOT_API_ENABLED) {
            console.log("[Riot OAuth] Blocked - RIOT_API_ENABLED is false (TOS compliance mode)");
            return res.status(503).json({
                error: "Riot linking temporarily unavailable",
                message: COMPLIANCE_MESSAGE,
                compliance: true
            });
        }

        const clientId = process.env.RIOT_CLIENT_ID;
        const redirectUri = process.env.RIOT_REDIRECT_URI;

        if (!clientId || !redirectUri) {
            console.error("Riot OAuth Init Failed: Missing Env Vars");
            return res.status(500).json({ error: "Riot OAuth configuration missing" });
        }

        // Generate secure random state (CSRF protection)
        const state = crypto.randomBytes(16).toString('hex');
        // In a real flow, we should store 'state' in session to verify callback.
        // For now, assume session-based storage if available, or just returning it for client usage.
        if (req.session) {
            (req.session as any).riotOAuthState = state;
        }

        const scope = "openid"; // Minimal scope
        // Construct Riot Authorize URL
        const authUrl = `https://auth.riotgames.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

        res.json({
            url: authUrl,
            state: state
        });

    } catch (error) {
        console.error("Riot OAuth Init Error:", error);
        res.status(500).json({ error: "Failed to initialize Riot OAuth" });
    }
});

// ===========================================
// MICRO-STEP C: Endpoint 2 - Callback
// ===========================================
riotAuthRouter.post("/oauth/callback", async (req, res) => {
    try {
        // COMPLIANCE CHECK: Block if Riot API is disabled
        if (!RIOT_API_ENABLED) {
            console.log("[Riot OAuth Callback] Blocked - RIOT_API_ENABLED is false");
            return res.status(503).json({
                error: "Riot linking temporarily unavailable",
                message: COMPLIANCE_MESSAGE,
                compliance: true
            });
        }

        const { code, state } = req.body;
        const sessionState = (req.session as any)?.riotOAuthState;

        // 1. Validate State (Anti-CSRF)
        if (!state || !sessionState || state !== sessionState) {
            console.error("Riot OAuth State Mismatch", { state, sessionState });
            return res.status(400).json({ error: "Invalid OAuth state" });
        }

        // Clean up state
        delete (req.session as any).riotOAuthState;

        // 2. Env Var Check (Runtime)
        const clientId = process.env.RIOT_CLIENT_ID;
        const clientSecret = process.env.RIOT_CLIENT_SECRET;
        const redirectUri = process.env.RIOT_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            console.error("Riot OAuth Callback Failed: Missing Env Vars");
            return res.status(500).json({
                error: "Configuration Error",
                detail: "Missing RIOT_CLIENT_ID, RIOT_CLIENT_SECRET, or RIOT_REDIRECT_URI"
            });
        }

        // 3. Exchange Code for Token
        const tokenResponse = await fetch("https://auth.riotgames.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code as string,
                redirect_uri: redirectUri
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Riot Token Exchange Failed", errorText);
            return res.status(400).json({ error: "Failed to exchange token with Riot" });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        // NOTE: We do NOT store tokens persistently as per strict privacy rules.

        // 4. Fetch Riot Identity (Account Info)
        // Using 'americas' as a routing value for Account API (this is for RSO account info, not game specific)
        const userinfoResponse = await fetch("https://americas.api.riotgames.com/riot/account/v1/accounts/me", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!userinfoResponse.ok) {
            console.error("Riot UserInfo Failed", await userinfoResponse.text());
            return res.status(400).json({ error: "Failed to fetch Riot Account Info" });
        }

        const riotAccount = await userinfoResponse.json();
        // riotAccount = { puuid, gameName, tagLine }

        // 5. Store/Link Account (Minimal Data)
        let userId: string | null = null;

        // Attempt to find user from session
        if ((req as any).user && (req as any).user.id) {
            userId = (req as any).user.id;
        } else if ((req.session as any).passport?.user?.id) {
            userId = (req.session as any).passport.user.id;
        } else if ((req as any).dbUser?.id) {
            userId = (req as any).dbUser.id;
        }

        // IMPORTANT: The session persistence depends on how the client calls this.
        // If the client (browser) calls this, the session cookie is sent.
        // If the client calls this, and they are logged in, we have the user.

        if (!userId) {
            return res.status(401).json({ error: "User must be logged in to link Riot Account" });
        }

        const gameContext = 'league';
        const region = 'americas';

        await db.insert(riotAccounts).values({
            userId: userId,
            puuid: riotAccount.puuid,
            gameName: riotAccount.gameName,
            tagLine: riotAccount.tagLine,
            region: region,
            game: gameContext,
            lastSyncedAt: new Date(),
        })
            .onConflictDoUpdate({
                target: [riotAccounts.userId, riotAccounts.game],
                set: {
                    puuid: riotAccount.puuid,
                    gameName: riotAccount.gameName,
                    tagLine: riotAccount.tagLine,
                    lastSyncedAt: new Date(),
                    updatedAt: new Date()
                }
            });

        res.json({
            success: true,
            linked: true,
            gameName: riotAccount.gameName,
            tagLine: riotAccount.tagLine
        });

    } catch (error: any) {
        console.error("Riot OAuth Callback Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ===========================================
// MICRO-STEP D: Endpoint 3 - Status Check
// ===========================================
riotAuthRouter.get("/status", async (req, res) => {
    try {
        // Return compliance mode status if disabled
        if (!RIOT_API_ENABLED) {
            return res.json({
                linked: false,
                complianceMode: true,
                message: COMPLIANCE_MESSAGE
            });
        }

        const user = (req as any).user;
        if (!user || !user.id) {
            return res.json({ linked: false, complianceMode: false });
        }

        const [account] = await db.select().from(riotAccounts).where(eq(riotAccounts.userId, user.id));

        if (!account) {
            return res.json({ linked: false, complianceMode: false });
        }

        res.json({
            linked: true,
            account: {
                gameName: account.gameName,
                tagLine: account.tagLine,
                lastSyncAt: account.lastSyncAt,
                game: account.game,
                region: account.region
            }
        });

    } catch (error) {
        console.error("Riot Link Status Error:", error);
        res.status(500).json({ error: "Failed to check status" });
    }
});

export default riotAuthRouter;
