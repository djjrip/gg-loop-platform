/**
 * 🎯 CONVERSION OPTIMIZATION
 * 
 * A/B testing, checkout flow optimization
 * Revenue maximization
 */

import { db } from '../database';
import { users, subscriptions, userRewards } from "../../shared/schema";
import { eq, and, gte, sql } from 'drizzle-orm';

interface ConversionMetrics {
  signupToSubscription: number;
  pointsToRedemption: number;
  freeToPaid: number;
  averageTimeToSubscribe: number;
}

/**
 * Analyze conversion funnels
 */
export async function analyzeConversions(): Promise<ConversionMetrics> {
  try {
    // Signup to subscription rate
    const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [subscribedUsers] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${subscriptions.userId})` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const signupToSubscription = totalUsers.count > 0
      ? (subscribedUsers.count / totalUsers.count) * 100
      : 0;

    // Points to redemption rate
    const [usersWithPoints] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`${users.totalPoints} > 0`);

    const [usersWhoRedeemed] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userRewards.userId})` })
      .from(userRewards);

    const pointsToRedemption = usersWithPoints.count > 0
      ? (usersWhoRedeemed.count / usersWithPoints.count) * 100
      : 0;

    // Free to paid conversion
    const [freeUsers] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(sql`${subscriptions.id} IS NULL`);

    const freeToPaid = totalUsers.count > 0
      ? ((totalUsers.count - freeUsers.count) / totalUsers.count) * 100
      : 0;

    // Average time to subscribe
    const timeToSubscribe = await db
      .select({
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (${subscriptions.createdAt} - ${users.createdAt})) / 86400)`
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.status, 'active'));

    return {
      signupToSubscription: Number(signupToSubscription.toFixed(2)),
      pointsToRedemption: Number(pointsToRedemption.toFixed(2)),
      freeToPaid: Number(freeToPaid.toFixed(2)),
      averageTimeToSubscribe: Number((timeToSubscribe[0]?.avgDays || 0).toFixed(1))
    };
  } catch (error) {
    console.error('Conversion analysis error:', error);
    return {
      signupToSubscription: 0,
      pointsToRedemption: 0,
      freeToPaid: 0,
      averageTimeToSubscribe: 0
    };
  }
}

/**
 * Generate optimization recommendations
 */
export async function getOptimizationRecommendations() {
  const metrics = await analyzeConversions();
  const recommendations: string[] = [];

  if (metrics.signupToSubscription < 5) {
    recommendations.push('Low subscription conversion - Consider free trial extension or lower entry price');
  }

  if (metrics.pointsToRedemption < 10) {
    recommendations.push('Low redemption rate - Add lower-cost rewards or improve shop visibility');
  }

  if (metrics.freeToPaid < 3) {
    recommendations.push('Low free-to-paid conversion - Improve subscription value proposition');
  }

  if (metrics.averageTimeToSubscribe > 30) {
    recommendations.push('Long time to subscribe - Add urgency or limited-time offers');
  }

  return {
    metrics,
    recommendations,
    priority: recommendations.length > 0 ? 'high' : 'low'
  };
}

