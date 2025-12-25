import { Router } from "express";
import { db } from "../db";
import { riotAccounts, processedRiotMatches } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { RiotApiService } from "../riotApi";
import { pointsEngine, EARNING_RULES } from "../pointsEngine";

const matchSyncRouter = Router();

// Rate limit tracking (in-memory for now, should be Redis in production)
const syncCooldowns = new Map<string, number>();
const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between syncs

/**
 * POST /api/riot/sync-matches
 * 
 * Syncs recent matches for the logged-in user's linked Riot account.
 * Awards points for verified wins that haven't been processed yet.
 * 
 * Rate limited to 1 sync per hour per user.
 */
matchSyncRouter.post("/sync-matches", async (req: any, res) => {
    try {
        // 1. Verify user is authenticated
        const user = req.user || req.dbUser;
        if (!user?.id) {
            return res.status(401).json({ error: "You must be logged in to sync matches" });
        }

        const userId = user.id;

        // 2. Check rate limit
        const lastSync = syncCooldowns.get(userId);
        const now = Date.now();
        if (lastSync && (now - lastSync) < SYNC_COOLDOWN_MS) {
            const remainingMs = SYNC_COOLDOWN_MS - (now - lastSync);
            const remainingMin = Math.ceil(remainingMs / 60000);
            return res.status(429).json({
                error: `Rate limited. Try again in ${remainingMin} minutes.`,
                retryAfterMs: remainingMs
            });
        }

        // 3. Get user's linked Riot account
        const [riotAccount] = await db.select()
            .from(riotAccounts)
            .where(eq(riotAccounts.userId, userId));

        if (!riotAccount) {
            return res.status(400).json({
                error: "No Riot account linked. Please link your account in Settings first.",
                needsLink: true
            });
        }

        // 4. Check if Riot API key is configured
        if (!process.env.RIOT_API_KEY) {
            console.error("RIOT_API_KEY not configured");
            return res.status(503).json({
                error: "Match verification temporarily unavailable",
                code: "API_NOT_CONFIGURED"
            });
        }

        // 5. Initialize Riot API and fetch recent wins
        let riotApi: RiotApiService;
        try {
            riotApi = new RiotApiService();
        } catch (error) {
            console.error("Failed to initialize Riot API:", error);
            return res.status(503).json({ error: "Match verification temporarily unavailable" });
        }

        // Update rate limit BEFORE making API calls
        syncCooldowns.set(userId, now);

        // Fetch wins from last 24 hours
        const recentWins = await riotApi.getRecentWins(
            riotAccount.puuid,
            riotAccount.region || 'americas',
            24 // hours
        );

        // 6. Filter out already-processed matches
        const newWins = [];
        for (const win of recentWins) {
            // Check if this match was already processed for this riot account
            const [existing] = await db.select()
                .from(processedRiotMatches)
                .where(and(
                    eq(processedRiotMatches.matchId, win.matchId),
                    eq(processedRiotMatches.riotAccountId, riotAccount.id)
                ));

            if (!existing) {
                newWins.push(win);
            }
        }

        // 7. Award points for new wins
        const pointsAwarded = [];
        for (const win of newWins) {
            try {
                // Get base points from earning rules
                const rule = EARNING_RULES.MATCH_WIN;
                const basePoints = rule?.basePoints || 10;

                // Award points
                const transaction = await pointsEngine.awardPoints(
                    userId,
                    basePoints,
                    "match_win",
                    win.matchId,
                    "riot_lol_match",
                    `${win.championName} - ${win.kills}/${win.deaths}/${win.assists}`
                );

                // Mark match as processed
                await db.insert(processedRiotMatches).values({
                    riotAccountId: riotAccount.id,
                    matchId: win.matchId,
                    gameEndedAt: new Date(win.gameEndTimestamp),
                    isWin: true,
                    pointsAwarded: basePoints,
                }).onConflictDoNothing();

                pointsAwarded.push({
                    matchId: win.matchId,
                    champion: win.championName,
                    kda: `${win.kills}/${win.deaths}/${win.assists}`,
                    points: basePoints
                });
            } catch (error) {
                console.error(`Failed to process match ${win.matchId}:`, error);
                // Continue processing other matches
            }
        }

        // 8. Return summary
        res.json({
            success: true,
            matchesChecked: recentWins.length,
            newWinsFound: newWins.length,
            pointsAwarded: pointsAwarded,
            totalPointsEarned: pointsAwarded.reduce((sum, m) => sum + m.points, 0),
            message: newWins.length > 0
                ? `Found ${newWins.length} new wins! Earned ${pointsAwarded.reduce((sum, m) => sum + m.points, 0)} points.`
                : "No new wins found since last sync.",
            nextSyncAvailable: now + SYNC_COOLDOWN_MS
        });

    } catch (error: any) {
        console.error("Match sync error:", error);

        // Handle specific Riot API errors
        if (error.code === 429) {
            return res.status(429).json({
                error: "Riot API rate limit exceeded. Try again in a few minutes."
            });
        }

        res.status(500).json({
            error: "Failed to sync matches. Please try again later.",
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/riot/sync-status
 * 
 * Returns the current sync status for the user.
 */
matchSyncRouter.get("/sync-status", async (req: any, res) => {
    try {
        const user = req.user || req.dbUser;
        if (!user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = user.id;
        const lastSync = syncCooldowns.get(userId);
        const now = Date.now();

        // Check if Riot account is linked
        const [riotAccount] = await db.select()
            .from(riotAccounts)
            .where(eq(riotAccounts.userId, userId));

        res.json({
            hasLinkedRiot: !!riotAccount,
            gameName: riotAccount?.gameName,
            tagLine: riotAccount?.tagLine,
            lastSyncAt: lastSync ? new Date(lastSync).toISOString() : null,
            canSync: !lastSync || (now - lastSync) >= SYNC_COOLDOWN_MS,
            nextSyncAvailable: lastSync ? lastSync + SYNC_COOLDOWN_MS : now,
            cooldownRemaining: lastSync ? Math.max(0, SYNC_COOLDOWN_MS - (now - lastSync)) : 0
        });
    } catch (error) {
        console.error("Sync status error:", error);
        res.status(500).json({ error: "Failed to get sync status" });
    }
});

export default matchSyncRouter;
