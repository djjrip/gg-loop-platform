/**
 * LIVE ACTIVITY FEED
 * Real-time public feed of platform activity
 * Innovation: FOMO + social proof + transparency
 */

import { db } from '../server/db';
import { userRewards, users, pointTransactions } from '../shared/schema';
import { desc, sql } from 'drizzle-orm';

export interface ActivityEvent {
    id: string;
    type: 'redemption' | 'signup' | 'game_played' | 'milestone';
    message: string;
    timestamp: Date;
    location?: string; // City, State (privacy-safe)
    points?: number;
    reward?: string;
}

/**
 * Get recent platform activity (last 24 hours)
 * Privacy: Only shows city/state, no names or IDs
 */
export async function getRecentActivity(limit: number = 20): Promise<ActivityEvent[]> {
    const activities: ActivityEvent[] = [];

    // Recent redemptions
    const redemptions = await db
        .select({
            id: userRewards.id,
            userId: userRewards.userId,
            rewardId: userRewards.rewardId,
            pointsSpent: userRewards.pointsSpent,
            redeemedAt: userRewards.redeemedAt,
            city: users.shippingCity,
            state: users.shippingState
        })
        .from(userRewards)
        .innerJoin(users, sql`${users.id} = ${userRewards.userId}`)
        .where(sql`${userRewards.redeemedAt} > NOW() - INTERVAL '24 hours'`)
        .orderBy(desc(userRewards.redeemedAt))
        .limit(10);

    for (const redemption of redemptions) {
        const location = redemption.state
            ? `${redemption.city || 'Someone'}, ${redemption.state}`
            : 'Someone';

        activities.push({
            id: redemption.id,
            type: 'redemption',
            message: `${location} just redeemed a reward`,
            timestamp: redemption.redeemedAt!,
            points: redemption.pointsSpent,
            location: redemption.state || undefined
        });
    }

    // Recent signups (last 10)
    const signups = await db
        .select({
            id: users.id,
            createdAt: users.createdAt,
            state: users.shippingState
        })
        .from(users)
        .where(sql`${users.createdAt} > NOW() - INTERVAL '24 hours'`)
        .orderBy(desc(users.createdAt))
        .limit(10);

    for (const signup of signups) {
        const location = signup.state || 'Somewhere';
        activities.push({
            id: signup.id,
            type: 'signup',
            message: `New user from ${location} joined GG Loop`,
            timestamp: signup.createdAt!,
            location: signup.state || undefined
        });
    }

    // Sort by timestamp, most recent first
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, limit);
}

/**
 * Get live user count (online now)
 * Defined as: active in last 10 minutes
 */
export async function getLiveUserCount(): Promise<number> {
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.lastLoginAt} > NOW() - INTERVAL '10 minutes'`);

    return result[0]?.count || 0;
}

/**
 * Get platform stats for live display
 */
export async function getLiveStats() {
    const [totalUsers, totalRedemptions, liveUsers] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(userRewards),
        getLiveUserCount()
    ]);

    return {
        totalUsers: totalUsers[0]?.count || 0,
        totalRedemptions: totalRedemptions[0]?.count || 0,
        liveUsers
    };
}

/**
 * PUBLIC API ENDPOINT: /api/activity/live
 */
export async function getLiveActivityFeed() {
    const [activity, stats] = await Promise.all([
        getRecentActivity(15),
        getLiveStats()
    ]);

    return {
        activity,
        stats,
        timestamp: new Date().toISOString()
    };
}
