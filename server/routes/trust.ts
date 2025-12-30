import { Router } from "express";
import { TrustScoreService } from "../services/trustScoreService";
import { db } from "../database";
import { trustScoreEvents } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Middleware to ensure user is authenticated is applied in the main routes.ts

/**
 * GET /api/trust/score
 * Returns the current trust score, tier, and breakdown for the authenticated user.
 */
router.get("/score", async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const result = await TrustScoreService.getTrustScore(userId);
        res.json(result);
    } catch (error) {
        console.error("Error fetching trust score:", error);
        res.status(500).json({ error: "Failed to fetch trust score" });
    }
});

/**
 * GET /api/trust/history
 * Returns the history of trust score events for the authenticated user.
 */
router.get("/history", async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const limit = req.query.limit ? Number(req.query.limit) : 20;

        const events = await db
            .select()
            .from(trustScoreEvents)
            .where(eq(trustScoreEvents.userId, userId))
            .orderBy(desc(trustScoreEvents.createdAt))
            .limit(limit);

        res.json(events);
    } catch (error) {
        console.error("Error fetching trust history:", error);
        res.status(500).json({ error: "Failed to fetch trust history" });
    }
});

/**
 * POST /api/trust/recalculate (Admin or Debug Only)
 * Forces a recalculation of the user's trust score.
 */
router.post("/recalculate", async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const result = await TrustScoreService.calculateTrustScore(userId);
        res.json(result);
    } catch (error) {
        console.error("Error recalculating trust score:", error);
        res.status(500).json({ error: "Failed to recalculate trust score" });
    }
});

export default router;
