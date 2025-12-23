import { Router } from "express";
import { syncUserByUserId, type SyncStats } from "../matchSyncService";

const matchesRouter = Router();

matchesRouter.post("/sync", async (req, res) => {
    try {
        // Auth check - should use middleware, but checking req.user for now as per prompt pattern
        // Assuming session/passport populates req.user
        const user = (req as any).user;

        if (!user || !user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const stats: SyncStats = await syncUserByUserId(user.id);

        res.json({
            success: true,
            matchesFetched: stats.fetched,
            matchesNewInserted: stats.inserted,
            matchesSkipped: stats.skipped,
            lastSyncAt: new Date()
        });

    } catch (error: any) {
        console.error("Match Sync Invalid:", error);

        if (error.message === "No linked Riot account found") {
            return res.status(404).json({ error: "No Riot account linked. Please link your Riot account first." });
        }

        res.status(500).json({ error: "Failed to sync matches" });
    }
});

export default matchesRouter;
