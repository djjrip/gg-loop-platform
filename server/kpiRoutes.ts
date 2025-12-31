import { Router } from "express";
import { db } from "./database";
import { users, pointTransactions, subscriptions, userRewards, challenges, challengeCompletions } from "../shared/schema";
import { sql, gte, and, eq, desc } from "drizzle-orm";

const router = Router();

// Maintenance status (in-memory for now, could be moved to DB)
let maintenanceStatus = {
    active: false,
    message: "",
    severity: "info" as "info" | "warning" | "error",
    estimatedEnd: null as string | null,
};

// Get maintenance status (public endpoint)
router.get("/api/maintenance/status", (req, res) => {
    res.json(maintenanceStatus);
});

// Set maintenance status (admin only)
router.post("/api/admin/maintenance", async (req: any, res) => {
    // Admin check
    if (!req.isAuthenticated() || !req.user?.oidcSub) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { active, message, severity, estimatedEnd } = req.body;

    maintenanceStatus = {
        active: active ?? maintenanceStatus.active,
        message: message ?? maintenanceStatus.message,
        severity: severity ?? maintenanceStatus.severity,
        estimatedEnd: estimatedEnd ?? maintenanceStatus.estimatedEnd,
    };

    console.log(`[MAINTENANCE] Status updated:`, maintenanceStatus);

    res.json({ success: true, status: maintenanceStatus });
});

// Comprehensive KPI Dashboard
router.get("/api/admin/kpi-dashboard", async (req: any, res) => {
    try {
        // Admin check
        if (!req.isAuthenticated() || !req.user?.oidcSub) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // User Metrics
        const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
        const [newUsers24h] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, last24h));
        const [newUsers7d] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, last7d));
        const [activeUsers] = await db.select({ count: sql<number>`count(distinct ${users.id})::int` }).from(users)
            .innerJoin(pointTransactions, eq(users.id, pointTransactions.userId))
            .where(gte(pointTransactions.createdAt, last7d));

        // Revenue Metrics
        const [totalRevenue] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::float` }).from(subscriptions);
        const [revenue24h] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::float` }).from(subscriptions).where(gte(subscriptions.createdAt, last24h));
        const [revenue7d] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::float` }).from(subscriptions).where(gte(subscriptions.createdAt, last7d));
        const [revenue30d] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::float` }).from(subscriptions).where(gte(subscriptions.createdAt, last30d));

        // Points Economy
        const [totalPointsIssued] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::int` }).from(pointTransactions).where(sql`amount > 0`);
        const [totalPointsSpent] = await db.select({ sum: sql<number>`COALESCE(SUM(ABS(amount)), 0)::int` }).from(pointTransactions).where(sql`amount < 0`);
        const [pointsIssued24h] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)::int` }).from(pointTransactions).where(and(sql`amount > 0`, gte(pointTransactions.createdAt, last24h)));

        // Engagement Metrics
        const [totalRedemptions] = await db.select({ count: sql<number>`count(*)::int` }).from(userRewards);
        const [redemptions24h] = await db.select({ count: sql<number>`count(*)::int` }).from(userRewards).where(gte(userRewards.redeemedAt, last24h));
        const [totalChallenges] = await db.select({ count: sql<number>`count(*)::int` }).from(challenges);
        const [completedChallenges] = await db.select({ count: sql<number>`count(*)::int` }).from(challengeCompletions);

        // Top Users by Points
        const topUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            totalPoints: users.totalPoints,
            isFounder: users.isFounder,
            founderNumber: users.founderNumber,
        }).from(users).orderBy(desc(users.totalPoints)).limit(10);

        // Recent Activity
        const recentTransactions = await db.select({
            id: pointTransactions.id,
            userId: pointTransactions.userId,
            amount: pointTransactions.amount,
            type: pointTransactions.type,
            description: pointTransactions.description,
            createdAt: pointTransactions.createdAt,
        }).from(pointTransactions).orderBy(desc(pointTransactions.createdAt)).limit(20);

        res.json({
            users: {
                total: totalUsers.count,
                new24h: newUsers24h.count,
                new7d: newUsers7d.count,
                active7d: activeUsers.count,
                growth24h: totalUsers.count > 0 ? ((newUsers24h.count / totalUsers.count) * 100).toFixed(2) : "0",
                growth7d: totalUsers.count > 0 ? ((newUsers7d.count / totalUsers.count) * 100).toFixed(2) : "0",
            },
            revenue: {
                total: totalRevenue.sum || 0,
                last24h: revenue24h.sum || 0,
                last7d: revenue7d.sum || 0,
                last30d: revenue30d.sum || 0,
                mrr: (revenue30d.sum || 0) / 30, // Rough MRR estimate
            },
            points: {
                totalIssued: totalPointsIssued.sum || 0,
                totalSpent: totalPointsSpent.sum || 0,
                circulating: (totalPointsIssued.sum || 0) - (totalPointsSpent.sum || 0),
                issued24h: pointsIssued24h.sum || 0,
                burnRate: totalPointsIssued.sum > 0 ? ((totalPointsSpent.sum / totalPointsIssued.sum) * 100).toFixed(2) : "0",
            },
            engagement: {
                totalRedemptions: totalRedemptions.count,
                redemptions24h: redemptions24h.count,
                totalChallenges: totalChallenges.count,
                completedChallenges: completedChallenges.count,
                completionRate: totalChallenges.count > 0 ? ((completedChallenges.count / totalChallenges.count) * 100).toFixed(2) : "0",
            },
            topUsers,
            recentActivity: recentTransactions,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("[KPI Dashboard] Error:", error);
        res.status(500).json({ message: "Failed to fetch KPI data" });
    }
});

export default router;
