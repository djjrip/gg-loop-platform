/**
 * Revenue Analytics API
 * Real-time metrics for autonomous revenue monitoring
 * 
 * Endpoints:
 * GET /api/admin/analytics/revenue - MRR, ARR, growth rates
 * GET /api/admin/analytics/conversions - Trial conversion rates
 * GET /api/admin/analytics/users - Signup trends
 * GET /api/admin/analytics/referrals - Top referrers
 */

import { db } from '../database';
import { users, pointsTransactions } from '@shared/schema';
import { sql, eq, and, gte } from 'drizzle-orm';

interface RevenueMetrics {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    activeSubscribers: number;
    trialingUsers: number;
    freeUsers: number;
    growthRate: number; // % change from last month
}

interface ConversionMetrics {
    trialToProRate: number;
    freeToProRate: number;
    averageTrialLength: number;
    totalConversions: number;
}

interface UserMetrics {
    totalUsers: number;
    signupsToday: number;
    signupsThisWeek: number;
    signupsThisMonth: number;
    weekOverWeekGrowth: number;
}

interface TopReferrer {
    userId: string;
    email: string;
    firstName: string;
    referralCount: number;
    estimatedRevenue: number;
}

/**
 * Calculate Monthly Recurring Revenue
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
    // Count active subscribers by tier
    const [proCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            eq(users.subscriptionStatus, 'active'),
            eq(users.subscriptionTier, 'pro')
        ));

    const [eliteCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            eq(users.subscriptionStatus, 'active'),
            eq(users.subscriptionTier, 'elite')
        ));

    const [trialingCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'trialing'));

    const [freeCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'inactive'));

    const mrr = (proCount.count * 9.99) + (eliteCount.count * 24.99);
    const arr = mrr * 12;

    // Calculate growth rate (compare to last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [lastMonthSubs] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            eq(users.subscriptionStatus, 'active'),
            gte(users.createdAt, lastMonth)
        ));

    const totalActive = proCount.count + eliteCount.count;
    const growthRate = lastMonthSubs.count > 0
        ? ((totalActive - lastMonthSubs.count) / lastMonthSubs.count) * 100
        : 0;

    return {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        activeSubscribers: totalActive,
        trialingUsers: trialingCount.count,
        freeUsers: freeCount.count,
        growthRate: Math.round(growthRate * 10) / 10,
    };
}

/**
 * Calculate conversion rates
 */
export async function getConversionMetrics(): Promise<ConversionMetrics> {
    // Trial users who converted to paid
    const [conversions] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            eq(users.subscriptionStatus, 'active'),
            sql`trial_ends_at IS NOT NULL` // Had a trial
        ));

    // Total trial users ever
    const [totalTrials] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`trial_ends_at IS NOT NULL`);

    const trialToProRate = totalTrials.count > 0
        ? (conversions.count / totalTrials.count) * 100
        : 0;

    // Free users who went straight to paid (no trial)
    const [freeConversions] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            eq(users.subscriptionStatus, 'active'),
            sql`trial_ends_at IS NULL`
        ));

    const [totalFree] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'inactive'));

    const freeToProRate = totalFree.count > 0
        ? (freeConversions.count / totalFree.count) * 100
        : 0;

    return {
        trialToProRate: Math.round(trialToProRate * 10) / 10,
        freeToProRate: Math.round(freeToProRate * 10) / 10,
        averageTrialLength: 7, // Fixed for now
        totalConversions: conversions.count + freeConversions.count,
    };
}

/**
 * Get user growth metrics
 */
export async function getUserMetrics(): Promise<UserMetrics> {
    const [total] = await db.select({ count: sql<number>`count(*)` })
        .from(users);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [signupsToday] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, today));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [signupsThisWeek] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, weekAgo));

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [signupsThisMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, monthAgo));

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [lastWeekSignups] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(
            gte(users.createdAt, twoWeeksAgo),
            sql`created_at < ${weekAgo}`
        ));

    const weekOverWeekGrowth = lastWeekSignups.count > 0
        ? ((signupsThisWeek.count - lastWeekSignups.count) / lastWeekSignups.count) * 100
        : 0;

    return {
        totalUsers: total.count,
        signupsToday: signupsToday.count,
        signupsThisWeek: signupsThisWeek.count,
        signupsThisMonth: signupsThisMonth.count,
        weekOverWeekGrowth: Math.round(weekOverWeekGrowth * 10) / 10,
    };
}

/**
 * Get top referrers
 */
export async function getTopReferrers(limit: number = 10): Promise<TopReferrer[]> {
    const topUsers = await db.select({
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        referralCount: users.referralCount,
    })
        .from(users)
        .where(sql`referral_count > 0`)
        .orderBy(sql`referral_count DESC`)
        .limit(limit);

    return topUsers.map(user => ({
        ...user,
        estimatedRevenue: user.referralCount * 9.99 * 0.4, // Assume 40% convert to Pro
    }));
}
