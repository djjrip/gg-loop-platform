/**
 * OPERATIONAL METRICS API
 * Backend for Revenue Command Center dashboard
 * Consolidates all revenue and growth metrics
 */
import { Router } from 'express';
import { db } from '../database';
import { users, subscriptions, rewardClaims } from '../../shared/schema';
import { eq, gte, sql } from 'drizzle-orm';
import { getAffiliateRevenue } from '../affiliate-revenue';
import { analyzeChurnRisk } from '../retention-engine';
const router = Router();
/**
 * GET /api/admin/operational-metrics
 * Real-time operational dashboard metrics
 */
router.get('/operational-metrics', async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Active users (logged in last 30 days)
        const activeUsersResult = await db
            .select({ count: sql `COUNT(*)` })
            .from(users)
            .where(gte(users.lastLoginAt, thirtyDaysAgo));
        const activeUsers = Number(activeUsersResult[0]?.count || 0);
        // MRR from active subscriptions
        const activeSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));
        const tierPricing = {
            'basic': 5,
            'pro': 12,
            'elite': 25
        };
        const subscriptionMRR = activeSubscriptions.reduce((sum, sub) => {
            return sum + (tierPricing[sub.tier] || 0);
        }, 0);
        // Affiliate revenue (last 30 days)
        const affiliateData = await getAffiliateRevenue(thirtyDaysAgo, now);
        const affiliateRevenue30Days = affiliateData.totalCommission / 100; // Convert cents to dollars
        // Churn rate calculation
        const totalUsers = await db
            .select({ count: sql `COUNT(*)` })
            .from(users);
        const totalUserCount = Number(totalUsers[0]?.count || 0);
        const churned = totalUserCount > 0 ? (totalUserCount - activeUsers) / totalUserCount : 0;
        // Average redemption value
        const redemptions = await db
            .select()
            .from(rewardClaims)
            .where(gte(rewardClaims.createdAt, thirtyDaysAgo));
        const totalRedemptionValue = redemptions.reduce((sum, r) => sum + (r.pointsSpent || 0), 0);
        const avgRedemptionValue = redemptions.length > 0
            ? (totalRedemptionValue / redemptions.length) / 100 // Points to dollars approximation
            : 0;
        // Viral coefficient (simplified: referrals per user)
        const usersWithReferrals = await db
            .select({ userId: users.id, referralCode: users.referralCode })
            .from(users)
            .where(sql `${users.referredByCode} IS NOT NULL`);
        const viralCoefficient = activeUsers > 0 ? usersWithReferrals.length / activeUsers : 0;
        res.json({
            activeUsers,
            subscriptionMRR,
            affiliateRevenue30Days,
            churnRate: churned,
            avgRedemptionValue,
            viralCoefficient,
            timestamp: now.toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching operational metrics:', error);
        res.status(500).json({ error: 'Failed to fetch operational metrics' });
    }
});
/**
 * GET /api/admin/churn-risks
 * Get list of high-risk users
 */
router.get('/churn-risks', async (req, res) => {
    try {
        // Get all active subscription users
        const activeSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'))
            .limit(50);
        const churnRisks = [];
        for (const sub of activeSubscriptions) {
            const user = await db.query.users.findFirst({
                where: eq(users.id, sub.userId)
            });
            if (!user)
                continue;
            const risk = await analyzeChurnRisk(user.id);
            // Only include medium, high, or critical risks
            if (['medium', 'high', 'critical'].includes(risk.riskLevel)) {
                churnRisks.push({
                    userId: user.id,
                    username: user.username || 'Unknown',
                    riskLevel: risk.riskLevel,
                    riskScore: risk.riskScore,
                    factors: risk.factors
                });
            }
        }
        // Sort by risk score (highest first)
        churnRisks.sort((a, b) => b.riskScore - a.riskScore);
        res.json(churnRisks);
    }
    catch (error) {
        console.error('Error fetching churn risks:', error);
        res.status(500).json({ error: 'Failed to fetch churn risks' });
    }
});
/**
 * GET /api/admin/revenue-summary
 * Quick revenue summary for command center
 */
router.get('/revenue-summary', async (req, res) => {
    try {
        const today = new Date();
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Get affiliate revenue for different periods
        const affiliateLast7 = await getAffiliateRevenue(last7Days, today);
        const affiliateLast30 = await getAffiliateRevenue(last30Days, today);
        // Get subscription count
        const subsCount = await db
            .select({ count: sql `COUNT(*)` })
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));
        const activeSubscriptions = Number(subsCount[0]?.count || 0);
        // Calculate total revenue
        const tierPricing = {
            'basic': 5,
            'pro': 12,
            'elite': 25
        };
        const subs = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));
        const monthlyRecurring = subs.reduce((sum, sub) => {
            return sum + (tierPricing[sub.tier] || 0);
        }, 0);
        res.json({
            last7Days: {
                affiliateCommission: affiliateLast7.totalCommission / 100,
                subscriptionRevenue: monthlyRecurring * 0.25, // Weekly approximation
                total: (affiliateLast7.totalCommission / 100) + (monthlyRecurring * 0.25)
            },
            last30Days: {
                affiliateCommission: affiliateLast30.totalCommission / 100,
                subscriptionRevenue: monthlyRecurring,
                total: (affiliateLast30.totalCommission / 100) + monthlyRecurring
            },
            activeSubscriptions,
            projectedMonthly: ((affiliateLast7.totalCommission / 100) * 4.3) + monthlyRecurring,
            timestamp: today.toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching revenue summary:', error);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
});
export default router;
