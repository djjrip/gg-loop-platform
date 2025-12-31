import { Router } from "express";
import { storage } from "../storage";
import { db } from "../database";
import { users, auditLog, type User, rewardClaims, rewardTypes, insertRewardTypeSchema, updateRewardClaimSchema } from "../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { FulfillmentService } from "../services/fulfillmentService";

const router = Router();

// Admin Middleware (Duplicated for safety/isolation)
const adminMiddleware = async (req: any, res: any, next: any) => {
    try {
        if (!req.isAuthenticated() || !req.user?.oidcSub) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const oidcSub = req.user.oidcSub;
        const dbUser = await storage.getUserByOidcSub(oidcSub);
        if (!dbUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // MVP: Owner email check
        const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
        if (!ADMIN_EMAILS.includes(dbUser.email || '')) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.dbUser = dbUser;
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        res.status(500).json({ message: "Failed to authenticate admin" });
    }
};

// Apply middleware to all routes
router.use(adminMiddleware);

// System Status
router.get("/system-status", async (req, res) => {
    try {
        // Check DB
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;

        // Check External APIs
        const fulfillmentConfigured = !!process.env.AMAZON_INCENTIVES_API_KEY || !!process.env.BLACKHAWK_API_KEY;

        res.json({
            database: { status: "healthy", latency: dbLatency },
            fulfillment: { status: fulfillmentConfigured ? "configured" : "not_configured" },
            serverTime: new Date().toISOString(),
            uptime: process.uptime(),
        });
    } catch (error) {
        res.status(500).json({ database: { status: "unhealthy", error: String(error) } });
    }
});

// User Management - List
router.get("/users", async (req, res) => {
    try {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt || sql`now()`)).limit(100);
        res.json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// User Management - Adjust Points
router.post("/users/:id/points", async (req, res) => {
    const { points, reason } = req.body;
    const targetUserId = req.params.id;
    const adminUser = req.dbUser as User;

    if (!adminUser || !adminUser.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Update points
        await storage.updateUserPoints(targetUserId, points);

        // Log to audit_log
        await db.insert(auditLog).values({
            adminId: adminUser.id,
            action: "POINTS_ADJUSTMENT",
            targetId: targetUserId,
            details: { points, reason },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error adjusting points:", error);
        res.status(500).json({ message: "Failed to adjust points" });
    }
});

// Audit Logs
router.get("/audit-logs", async (req, res) => {
    try {
        const logs = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(50);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
});

// ============================================================================
// Manual Fulfillment System Routes
// ============================================================================

const fulfillmentService = new FulfillmentService();

// Get Mission Control dashboard metrics
router.get("/fulfillment/metrics", async (req, res) => {
    try {
        const adminUser = req.dbUser as User;
        const metrics = await fulfillmentService.getMissionControlMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching fulfillment metrics:", error);
        res.status(500).json({ message: "Failed to fetch metrics" });
    }
});

// Get reward types
router.get("/fulfillment/reward-types", async (req, res) => {
    try {
        const rewards = await db.select().from(rewardTypes);
        res.json(rewards);
    } catch (error) {
        console.error("Error fetching reward types:", error);
        res.status(500).json({ message: "Failed to fetch reward types" });
    }
});

// Create reward type
router.post("/fulfillment/reward-types", async (req, res) => {
    try {
        const adminUser = req.dbUser as User;
        const parsed = insertRewardTypeSchema.parse(req.body);

        const result = await db.insert(rewardTypes).values(parsed).returning();

        await fulfillmentService.logAction(
            adminUser.id,
            adminUser.email || "unknown",
            "REWARD_TYPE_CREATED",
            adminUser.id,
            { rewardTypeId: result[0].id, name: parsed.name }
        );

        res.json(result[0]);
    } catch (error) {
        console.error("Error creating reward type:", error);
        res.status(500).json({ message: "Failed to create reward type" });
    }
});

// Get claims (with filters and pagination)
router.get("/fulfillment/claims", async (req, res) => {
    try {
        const status = req.query.status as string | undefined;
        const userId = req.query.userId as string | undefined;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
        const offset = parseInt(req.query.offset as string) || 0;

        const { claims, total } = await fulfillmentService.getClaimsFiltered(
            { status, userId },
            limit,
            offset
        );

        res.json({ claims, total, limit, offset });
    } catch (error) {
        console.error("Error fetching claims:", error);
        res.status(500).json({ message: "Failed to fetch claims" });
    }
});

// Get pending claims queue
router.get("/fulfillment/claims/pending", async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
        const offset = parseInt(req.query.offset as string) || 0;

        const { claims, total } = await fulfillmentService.getPendingClaims(limit, offset);
        res.json({ claims, total, limit, offset });
    } catch (error) {
        console.error("Error fetching pending claims:", error);
        res.status(500).json({ message: "Failed to fetch pending claims" });
    }
});

// Get single claim
router.get("/fulfillment/claims/:id", async (req, res) => {
    try {
        const claim = await db.select().from(rewardClaims).where(eq(rewardClaims.id, req.params.id));

        if (!claim || claim.length === 0) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.json(claim[0]);
    } catch (error) {
        console.error("Error fetching claim:", error);
        res.status(500).json({ message: "Failed to fetch claim" });
    }
});

// Update claim status (fulfill/reject)
router.patch("/fulfillment/claims/:id", async (req, res) => {
    try {
        const adminUser = req.dbUser as User;
        const claimId = req.params.id;

        const update = updateRewardClaimSchema.parse(req.body);
        const updatedClaim = await fulfillmentService.updateClaimStatus(claimId, adminUser.id, update);

        // Log the action
        const actionType = update.status === "fulfilled" ? "REWARD_CLAIM_FULFILLED" :
            update.status === "rejected" ? "REWARD_CLAIM_REJECTED" :
                "REWARD_CLAIM_UPDATED";

        await fulfillmentService.logAction(
            adminUser.id,
            adminUser.email || "unknown",
            actionType,
            updatedClaim.userId,
            {
                claimId,
                status: update.status,
                fulfillmentMethod: update.fulfillmentMethod,
                fulfillmentNotes: update.fulfillmentNotes,
                rejectedReason: update.rejectedReason,
            }
        );

        res.json(updatedClaim);
    } catch (error) {
        console.error("Error updating claim:", error);
        res.status(500).json({ message: "Failed to update claim" });
    }
});

// Get streamer stats
router.get("/fulfillment/streamer-stats", async (req, res) => {
    try {
        const metrics = await fulfillmentService.getMissionControlMetrics();
        res.json({ streamerMetrics: metrics.streamerMetrics });
    } catch (error) {
        console.error("Error fetching streamer stats:", error);
        res.status(500).json({ message: "Failed to fetch streamer stats" });
    }
});

export default router;
