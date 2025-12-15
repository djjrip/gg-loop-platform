import { db } from "./db";
import { users, xpTransactions, referrals, fraudAlerts } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

// Creator tier thresholds
export const CREATOR_TIERS = {
  ROOKIE: { min: 0, max: 9999, name: "Rookie Creator", payoutMin: 0 },
  RISING: { min: 10000, max: 49999, name: "Rising Star", payoutMin: 25 },
  VETERAN: { min: 50000, max: 99999, name: "Veteran Creator", payoutMin: 50 },
  ELITE: { min: 100000, max: Infinity, name: "Elite Creator", payoutMin: 100 }
};

export function getCreatorTier(totalXP: number) {
  if (totalXP >= CREATOR_TIERS.ELITE.min) return { tier: "ELITE", ...CREATOR_TIERS.ELITE };
  if (totalXP >= CREATOR_TIERS.VETERAN.min) return { tier: "VETERAN", ...CREATOR_TIERS.VETERAN };
  if (totalXP >= CREATOR_TIERS.RISING.min) return { tier: "RISING", ...CREATOR_TIERS.RISING };
  return { tier: "ROOKIE", ...CREATOR_TIERS.ROOKIE };
}

// Get creator stats for a user
export async function getCreatorStats(userId: number) {
  const xpResult = await db
    .select({
      totalXP: sql`COALESCE(SUM(C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{xpTransactions.amount}), 0)`,
      gamesPlayed: sql`COUNT(DISTINCT C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{xpTransactions.gameId})`,
      lastActivity: sql`MAX(C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{xpTransactions.createdAt})`
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        eq(xpTransactions.verified, true),
        gte(xpTransactions.amount, 0)
      )
    );

  const totalXP = xpResult[0]?.totalXP || 0;
  const tierInfo = getCreatorTier(totalXP);
  
  return {
    totalXP,
    tier: tierInfo
  };
}

export async function getCreatorLeaderboard(limit: number = 100) {
  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      totalXP: sql`COALESCE(SUM(C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{xpTransactions.amount}), 0)`
    })
    .from(users)
    .leftJoin(xpTransactions, eq(xpTransactions.userId, users.id))
    .where(sql`C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{users.fraudScore} <= 30`)
    .groupBy(users.id)
    .orderBy(desc(sql`COALESCE(SUM(C:\Users\Jayson Quindao\.gemini\antigravity\playground\stellar-satellite{xpTransactions.amount}), 0)`))
    .limit(limit);

  return leaderboard;
}
