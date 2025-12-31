import { db } from "../database";
import { subscriptions, users, xPostLogs } from "../../shared/schema";
import { eq, count, sql, and, gte } from "drizzle-orm";

interface RevenueSnapshot {
    mrr: number;
    activeSubscribers: number;
    newToday: number;
    churnedToday: number;
    conversionRate: number;
    lifetimeValue: number;
}

interface DailyRevenue {
    date: string;
    revenue: number;
    newSubs: number;
    churned: number;
    net: number;
}

/**
 * Revenue Tracking Service
 * Real-time monitoring of subscriptions, MRR, churn, and conversions
 */
export class RevenueTracker {

    /**
     * Get current revenue snapshot
     */
    async getSnapshot(): Promise<RevenueSnapshot> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Active subscribers by tier
            const activeSubs = await db
                .select({
                    tier: subscriptions.tier,
                    count: count(),
                })
                .from(subscriptions)
                .where(eq(subscriptions.status, 'active'))
                .groupBy(subscriptions.tier);

            // Calculate MRR (Monthly Recurring Revenue)
            const tierPricing = { basic: 5, pro: 12, elite: 25 };
            let mrr = 0;
            let totalActive = 0;

            activeSubs.forEach(({ tier, count: tierCount }) => {
                const price = tierPricing[tier as keyof typeof tierPricing] || 0;
                mrr += price * tierCount;
                totalActive += tierCount;
            });

            // New subscriptions today
            const [newSubsResult] = await db
                .select({ count: count() })
                .from(subscriptions)
                .where(
                    and(
                        eq(subscriptions.status, 'active'),
                        gte(subscriptions.createdAt, today)
                    )
                );

            // Churned today (status changed to canceled/past_due)
            const [churnResult] = await db
                .select({ count: count() })
                .from(subscriptions)
                .where(
                    and(
                        sql`${subscriptions.status} IN ('canceled', 'past_due')`,
                        gte(subscriptions.updatedAt, today)
                    )
                );

            // Total users for conversion rate
            const [totalUsersResult] = await db
                .select({ count: count() })
                .from(users);

            const totalUsers = totalUsersResult?.count || 1;
            const conversionRate = (totalActive / totalUsers) * 100;

            // Lifetime Value (simplified: MRR / Active Subs * 12 months avg retention)
            const avgLTV = totalActive > 0 ? (mrr / totalActive) * 12 : 0;

            return {
                mrr,
                activeSubscribers: totalActive,
                newToday: newSubsResult?.count || 0,
                churnedToday: churnResult?.count || 0,
                conversionRate: Math.round(conversionRate * 100) / 100,
                lifetimeValue: Math.round(avgLTV * 100) / 100,
            };

        } catch (error) {
            console.error('[Revenue Tracker] Failed to get snapshot:', error);
            return {
                mrr: 0,
                activeSubscribers: 0,
                newToday: 0,
                churnedToday: 0,
                conversionRate: 0,
                lifetimeValue: 0,
            };
        }
    }

    /**
     * Get daily revenue history for charts
     */
    async getDailyRevenue(days: number = 30): Promise<DailyRevenue[]> {
        try {
            // This would ideally come from a daily_revenue_snapshots table
            // For now, returning structure for future implementation
            const results: DailyRevenue[] = [];

            for (let i = days; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                results.push({
                    date: date.toISOString().split('T')[0],
                    revenue: 0,
                    newSubs: 0,
                    churned: 0,
                    net: 0,
                });
            }

            return results;

        } catch (error) {
            console.error('[Revenue Tracker] Failed to get daily revenue:', error);
            return [];
        }
    }

    /**
     * Log revenue snapshot to database (for historical tracking)
     */
    async logSnapshot() {
        const snapshot = await this.getSnapshot();
        console.log('[Revenue Tracker] Daily Snapshot:', {
            MRR: `$${snapshot.mrr}`,
            Active: snapshot.activeSubscribers,
            New: snapshot.newToday,
            Churned: snapshot.churnedToday,
            'Conversion Rate': `${snapshot.conversionRate}%`,
            LTV: `$${snapshot.lifetimeValue}`,
        });

        // TODO: Store in daily_revenue_snapshots table
        return snapshot;
    }

    /**
     * Check for revenue milestones and alert
     */
    async checkMilestones(snapshot: RevenueSnapshot) {
        const milestones = [100, 500, 1000, 5000, 10000];

        milestones.forEach(milestone => {
            if (snapshot.mrr >= milestone && snapshot.mrr < milestone + 100) {
                console.log(`🎉 [Revenue Tracker] MILESTONE: $${milestone} MRR reached!`);
                // TODO: Send Slack notification
            }
        });
    }
}

// Export singleton
export const revenueTracker = new RevenueTracker();

// Start daily revenue logging
export function startRevenueTracking() {
    console.log('[Revenue Tracker] Starting daily revenue monitoring...');

    // Log snapshot every hour
    setInterval(async () => {
        const snapshot = await revenueTracker.logSnapshot();
        await revenueTracker.checkMilestones(snapshot);
    }, 60 * 60 * 1000);

    // Run immediately
    revenueTracker.logSnapshot();
}
