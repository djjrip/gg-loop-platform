/**
 * 💰 REVENUE ANALYTICS API
 * 
 * Real-time revenue tracking, subscription metrics, redemption analytics
 * Built for CEO/admin dashboard
 */

import { Router } from 'express';
import { db } from '../db';
import { subscriptions, users, userRewards, rewards, pointTransactions } from '@shared/schema';
import { eq, and, gte, lte, sql, desc, count, sum } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Admin-only middleware
const adminOnly = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  if (!user[0] || !adminEmails.includes(user[0].email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

/**
 * GET /api/admin/revenue/overview
 * Real-time revenue overview
 */
router.get('/overview', isAuthenticated, adminOnly, async (req, res) => {
  try {
    // Get active subscriptions
    const activeSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const tierPricing: Record<string, number> = {
      'basic': 5,
      'pro': 12,
      'elite': 25
    };

    // Calculate monthly recurring revenue (MRR)
    const mrr = activeSubs.reduce((sum, sub) => {
      return sum + (tierPricing[sub.tier] || 0);
    }, 0);

    // Calculate total revenue (MRR + one-time redemptions)
    const fulfilledRewards = await db
      .select({
        realValue: rewards.realValue
      })
      .from(userRewards)
      .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
      .where(eq(userRewards.status, 'fulfilled'));

    const redemptionRevenue = fulfilledRewards.reduce((sum, r) => sum + (r.realValue || 0), 0) / 100; // Convert cents to dollars

    // Get user counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const totalUsers = userCount?.count || 0;

    // Get conversion rate
    const conversionRate = totalUsers > 0 ? (activeSubs.length / totalUsers) * 100 : 0;

    // Get pending redemptions value
    const pendingRewards = await db
      .select({
        realValue: rewards.realValue
      })
      .from(userRewards)
      .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
      .where(eq(userRewards.status, 'pending'));

    const pendingValue = pendingRewards.reduce((sum, r) => sum + (r.realValue || 0), 0) / 100;

    res.json({
      mrr,
      totalRevenue: mrr + redemptionRevenue,
      activeSubscriptions: activeSubs.length,
      totalUsers,
      conversionRate: Number(conversionRate.toFixed(2)),
      redemptionRevenue,
      pendingRedemptionsValue: pendingValue,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Revenue overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/revenue/trends
 * Revenue trends over time
 */
router.get('/trends', isAuthenticated, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Subscription revenue by day
    const subRevenue = await db
      .select({
        date: sql<string>`DATE(${subscriptions.createdAt})`,
        revenue: sql<number>`SUM(CASE 
          WHEN ${subscriptions.tier} = 'basic' THEN 5
          WHEN ${subscriptions.tier} = 'pro' THEN 12
          WHEN ${subscriptions.tier} = 'elite' THEN 25
          ELSE 0
        END)`
      })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, 'active'),
        gte(subscriptions.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${subscriptions.createdAt})`)
      .orderBy(sql`DATE(${subscriptions.createdAt})`);

    // Redemption revenue by day
    const redemptionRevenue = await db
      .select({
        date: sql<string>`DATE(${userRewards.redeemedAt})`,
        revenue: sql<number>`SUM(${rewards.realValue}) / 100.0`
      })
      .from(userRewards)
      .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
      .where(and(
        eq(userRewards.status, 'fulfilled'),
        gte(userRewards.redeemedAt, startDate)
      ))
      .groupBy(sql`DATE(${userRewards.redeemedAt})`)
      .orderBy(sql`DATE(${userRewards.redeemedAt})`);

    res.json({
      subscriptionRevenue: subRevenue,
      redemptionRevenue,
      period: `${days} days`,
      startDate: startDate.toISOString()
    });
  } catch (error: any) {
    console.error('Revenue trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/revenue/top-rewards
 * Top redeemed rewards by value
 */
router.get('/top-rewards', isAuthenticated, adminOnly, async (req, res) => {
  try {
    const topRewards = await db
      .select({
        rewardTitle: rewards.title,
        redemptionCount: count(),
        totalValue: sql<number>`SUM(${rewards.realValue}) / 100.0`,
        totalCommissions: sql<number>`SUM(${rewards.affiliateCommission || 0}) / 100.0`
      })
      .from(userRewards)
      .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
      .where(eq(userRewards.status, 'fulfilled'))
      .groupBy(rewards.id, rewards.title)
      .orderBy(desc(sql`SUM(${rewards.realValue})`))
      .limit(10);

    res.json({ topRewards });
  } catch (error: any) {
    console.error('Top rewards error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

