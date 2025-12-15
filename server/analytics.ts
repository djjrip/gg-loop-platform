import { db } from "./db";
import { users, pointTransactions, referrals, fraudDetectionLogs } from "../shared/schema";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";
import { getCached, CacheKeys } from "./cache";

// ========================================
// LEVEL 13: ANALYTICS ENGINE (CACHED)
// ========================================
// Real-time analytics with fraud gating
// Performance optimized with caching layer

interface AnalyticsEvent {
  userId: number;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

// Track analytics event (Direct DB write, no cache needed for write)
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, event.userId)
  });

  if (!user || user.banned) {
    throw new Error("User not found or banned");
  }

  // Fraud gating
  if ((user.fraudScore || 0) > 30) {
    console.warn(`Event tracking blocked for user ${event.userId} - fraud score too high`);
    return;
  }

  // In real implementation, this would insert into DB
  console.log(`[ANALYTICS] ${event.eventType}:`, {
    userId: event.userId,
    data: event.eventData,
    timestamp: event.timestamp
  });
}

// Get platform overview metrics (Cached 15 min)
export async function getPlatformOverview() {
  return await getCached(
    CacheKeys.platformOverview(),
    async () => {
      const now = new Date();
      const day24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Total users
      const totalUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(and(
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));
      
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Total XP
      const totalXPResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          eq(pointTransactions.verified, true),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      const totalXP = totalXPResult[0]?.total || 0;

      // New users 24h
       const newUsers24h = await db
        .select({ count: count() })
        .from(users)
        .where(and(
          gte(users.createdAt, day24Ago),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      // Active users 24h
      const activeUsers24h = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${pointTransactions.userId})` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          gte(pointTransactions.createdAt, day24Ago),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      return {
        users: { 
          totalUsers,
          newUsers24h: newUsers24h[0]?.count || 0,
          activeUsers24h: activeUsers24h[0]?.count || 0
        },
        engagement: {
          avgXPPerUser: totalUsers > 0 ? totalXP / totalUsers : 0
        },
        revenue: { totalXP }
      };
    }
  );
}

// Get user analytics (Cached 15 min)
export async function getUserAnalytics(userId: number) {
  return await getCached(
    CacheKeys.userAnalytics(userId),
    async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) throw new Error("User not found");

      const totalXPResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
        .from(pointTransactions)
        .where(and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.verified, true)
        ));

      return {
        totalXP: totalXPResult[0]?.total || 0,
        fraudScore: user.fraudScore || 0
      };
    }
  );
}

// Get engagement metrics (Cached 15 min)
export async function getEngagementMetrics() {
  return await getCached(
    CacheKeys.engagementMetrics(),
    async () => {
      const now = new Date();
      const day1Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dauResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${pointTransactions.userId})` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          gte(pointTransactions.createdAt, day1Ago),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      const mauResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${pointTransactions.userId})` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          gte(pointTransactions.createdAt, day30Ago),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      const dau = dauResult[0]?.count || 0;
      const mau = mauResult[0]?.count || 0;

      return {
        dau,
        mau,
        dauMauRatio: mau > 0 ? (dau / mau) * 100 : 0
      };
    }
  );
}

// Get revenue metrics (Cached 15 min)
export async function getRevenueMetrics() {
  return await getCached(
    CacheKeys.revenueMetrics(),
    async () => {
      const now = new Date();
      const day1Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const totalXPResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          eq(pointTransactions.verified, true),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      const xpLast24hResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
        .from(pointTransactions)
        .leftJoin(users, eq(pointTransactions.userId, users.id))
        .where(and(
          gte(pointTransactions.createdAt, day1Ago),
          eq(pointTransactions.verified, true),
          sql`${users.fraudScore} <= 30`,
          eq(users.banned, false)
        ));

      return {
        totalXP: totalXPResult[0]?.total || 0,
        xpLast24h: xpLast24hResult[0]?.total || 0
      };
    }
  );
}
