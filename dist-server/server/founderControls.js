import { db } from "./database";
import { users, pointTransactions, auditLog } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
// Log all admin actions
export async function logAuditEntry(entry) {
    await db.insert(auditLog).values({
        adminUserId: entry.adminUserId,
        adminEmail: entry.adminEmail,
        action: entry.action,
        targetUserId: entry.targetUserId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        timestamp: new Date(),
    });
}
// Get audit log for a user
export async function getUserAuditLog(userId, limit = 50) {
    return await db
        .select()
        .from(auditLog)
        .where(eq(auditLog.targetUserId, userId))
        .orderBy(desc(auditLog.timestamp))
        .limit(limit);
}
// Get all audit logs (founder view)
export async function getAllAuditLogs(limit = 100) {
    return await db
        .select()
        .from(auditLog)
        .orderBy(desc(auditLog.timestamp))
        .limit(limit);
}
// Manual Point Adjustment
export async function adjustUserPoints(adminUserId, adminEmail, targetUserId, amount, reason, ipAddress) {
    // Get current points
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);
    if (!user) {
        throw new Error("User not found");
    }
    const beforePoints = user.totalPoints;
    const afterPoints = beforePoints + amount;
    if (afterPoints < 0) {
        throw new Error("Cannot adjust points below zero");
    }
    // Create point transaction
    await db.insert(pointTransactions).values({
        userId: targetUserId,
        amount,
        type: amount > 0 ? "admin_credit" : "admin_debit",
        description: `Manual adjustment by admin: ${reason}`,
        adminRef: adminUserId,
        createdAt: new Date(),
    });
    // Update user points
    await db
        .update(users)
        .set({ totalPoints: afterPoints })
        .where(eq(users.id, targetUserId));
    // Log to audit trail
    await logAuditEntry({
        adminUserId,
        adminEmail,
        action: "points_adjust",
        targetUserId,
        details: {
            before: beforePoints,
            after: afterPoints,
            reason,
            amount,
        },
        ipAddress,
    });
    return {
        success: true,
        beforePoints,
        afterPoints,
        adjustment: amount,
    };
}
// Default spending limits
export const DEFAULT_SPENDING_LIMITS = {
    perUserDailyRedemptions: 3,
    perUserMonthlyValue: 500,
    globalDailyValue: 5000,
    globalHourlyRedemptions: 100,
    largeRedemptionCooling: 60, // 1 hour
    largeRedemptionThreshold: 100,
};
// Check if user can redeem based on spending limits
export async function checkSpendingLimits(userId, rewardValue) {
    const limits = DEFAULT_SPENDING_LIMITS;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // Check per-user daily redemptions
    const userDailyRedemptions = await db
        .select({ count: sql `count(*)` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, today)));
    if (Number(userDailyRedemptions[0]?.count || 0) >= limits.perUserDailyRedemptions) {
        return {
            allowed: false,
            reason: `Daily redemption limit reached (${limits.perUserDailyRedemptions}/day)`,
        };
    }
    // Check per-user monthly value
    const userMonthlyValue = await db
        .select({ total: sql `sum(abs(${pointTransactions.amount}))` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, thisMonth)));
    const monthlySpent = Number(userMonthlyValue[0]?.total || 0) / 1000; // Convert points to dollars
    if (monthlySpent + rewardValue > limits.perUserMonthlyValue) {
        return {
            allowed: false,
            reason: `Monthly spending limit reached ($${limits.perUserMonthlyValue}/month)`,
        };
    }
    // Check global daily value
    const globalDailyValue = await db
        .select({ total: sql `sum(abs(${pointTransactions.amount}))` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, today)));
    const dailyIssued = Number(globalDailyValue[0]?.total || 0) / 1000;
    if (dailyIssued + rewardValue > limits.globalDailyValue) {
        return {
            allowed: false,
            reason: `Global daily limit reached ($${limits.globalDailyValue}/day). Please try tomorrow.`,
        };
    }
    // Check global hourly redemptions
    const globalHourlyRedemptions = await db
        .select({ count: sql `count(*)` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, oneHourAgo)));
    if (Number(globalHourlyRedemptions[0]?.count || 0) >= limits.globalHourlyRedemptions) {
        return {
            allowed: false,
            reason: "System busy. Please try again in a few minutes.",
        };
    }
    // Check large redemption cooling period
    if (rewardValue >= limits.largeRedemptionThreshold) {
        const coolingMinutesAgo = new Date(now.getTime() - limits.largeRedemptionCooling * 60 * 1000);
        const recentLargeRedemption = await db
            .select()
            .from(pointTransactions)
            .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, coolingMinutesAgo)))
            .limit(1);
        if (recentLargeRedemption.length > 0) {
            return {
                allowed: false,
                reason: `Please wait ${limits.largeRedemptionCooling} minutes between large redemptions`,
            };
        }
    }
    return { allowed: true };
}
// Check for velocity abuse (too many redemptions too fast)
export async function checkVelocityAbuse(userId) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRedemptions = await db
        .select({ count: sql `count(*)` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, tenMinutesAgo)));
    const count = Number(recentRedemptions[0]?.count || 0);
    if (count >= 5) {
        return {
            id: `fraud-${Date.now()}-${userId}`,
            userId,
            type: "velocity",
            severity: "high",
            details: {
                redemptionsIn10Min: count,
                threshold: 5,
            },
            status: "pending",
            createdAt: new Date(),
        };
    }
    return null;
}
// Get all pending fraud alerts
export async function getPendingFraudAlerts() {
    // This would query a fraudAlerts table
    // For now, return empty array (implement table in next phase)
    return [];
}
// System Health Metrics
export async function getSystemHealth() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // Payment health (simplified - would integrate with Stripe/PayPal)
    const paymentHealth = {
        successRate: 98.5, // Placeholder
        failedCount: 3,
        lastFailure: null,
    };
    // Reward fulfillment health
    const pendingFulfillments = await db
        .select({ count: sql `count(*)` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.type, "redemption"), gte(pointTransactions.createdAt, last24h)));
    // User activity
    const newSignups = await db
        .select({ count: sql `count(*)` })
        .from(users)
        .where(gte(users.createdAt, last24h));
    return {
        timestamp: now,
        payment: paymentHealth,
        rewards: {
            pending: Number(pendingFulfillments[0]?.count || 0),
            apiStatus: "healthy", // Would check Tremendous API
        },
        users: {
            newSignups24h: Number(newSignups[0]?.count || 0),
            activeSubscriptions: 0, // Would query subscriptions table
        },
        matchSync: {
            lastSync: now,
            status: "healthy",
            failedCount: 0,
        },
    };
}
