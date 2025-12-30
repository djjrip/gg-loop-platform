import { db } from "./database";
import { users, pointTransactions, referrals } from "../shared/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
// Creator tier thresholds
export const CREATOR_TIERS = {
    ROOKIE: { min: 0, max: 9999, name: "Rookie Creator", payoutMin: 0 },
    RISING: { min: 10000, max: 49999, name: "Rising Star", payoutMin: 25 },
    VETERAN: { min: 50000, max: 99999, name: "Veteran Creator", payoutMin: 50 },
    ELITE: { min: 100000, max: Infinity, name: "Elite Creator", payoutMin: 100 }
};
export function getCreatorTier(totalXP) {
    if (totalXP >= CREATOR_TIERS.ELITE.min)
        return CREATOR_TIERS.ELITE;
    if (totalXP >= CREATOR_TIERS.VETERAN.min)
        return CREATOR_TIERS.VETERAN;
    if (totalXP >= CREATOR_TIERS.RISING.min)
        return CREATOR_TIERS.RISING;
    return CREATOR_TIERS.ROOKIE;
}
export async function getCreatorStats(userId) {
    const xpResult = await db
        .select({ totalXP: sql `COALESCE(SUM(${pointTransactions.amount}), 0)` })
        .from(pointTransactions)
        .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.verified, true), gte(pointTransactions.amount, 0)));
    const totalXP = xpResult[0]?.totalXP || 0;
    const currentTier = getCreatorTier(totalXP);
    let nextTier = null, xpToNextTier = 0, nextTierProgress = 0;
    if (currentTier.name === "Rookie Creator") {
        nextTier = "Rising Star";
        xpToNextTier = CREATOR_TIERS.RISING.min - totalXP;
        nextTierProgress = (totalXP / CREATOR_TIERS.RISING.min) * 100;
    }
    else if (currentTier.name === "Rising Star") {
        nextTier = "Veteran Creator";
        xpToNextTier = CREATOR_TIERS.VETERAN.min - totalXP;
        nextTierProgress = ((totalXP - CREATOR_TIERS.RISING.min) / (CREATOR_TIERS.VETERAN.min - CREATOR_TIERS.RISING.min)) * 100;
    }
    else if (currentTier.name === "Veteran Creator") {
        nextTier = "Elite Creator";
        xpToNextTier = CREATOR_TIERS.ELITE.min - totalXP;
        nextTierProgress = ((totalXP - CREATOR_TIERS.VETERAN.min) / (CREATOR_TIERS.ELITE.min - CREATOR_TIERS.VETERAN.min)) * 100;
    }
    const referralStats = await db.select({ total: sql `COUNT(*)`, active: sql `COUNT(CASE WHEN ${users.lastLogin} > NOW() - INTERVAL '30 days' THEN 1 END)` }).from(referrals).leftJoin(users, eq(referrals.referredUserId, users.id)).where(eq(referrals.referrerId, userId));
    const totalReferrals = referralStats[0]?.total || 0;
    const activeReferrals = referralStats[0]?.active || 0;
    const estimatedEarnings = totalXP * 0.01;
    const gamesResult = await db.select({ count: sql `COUNT(DISTINCT ${pointTransactions.id})` }).from(pointTransactions).where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.verified, true)));
    const gamesPlayed = gamesResult[0]?.count || 0;
    return { totalXP, gamesPlayed, tier: currentTier, nextTier, nextTierProgress, xpToNextTier, referrals: { total: totalReferrals, active: activeReferrals }, earnings: { estimated: estimatedEarnings, currency: "USD" } };
}
export async function getCreatorLeaderboard(limit = 100) {
    const leaderboard = await db.select({ userId: users.id, username: users.username, totalXP: sql `COALESCE(SUM(${pointTransactions.amount}), 0)`, gamesPlayed: sql `COUNT(DISTINCT ${pointTransactions.id})`, fraudScore: users.fraudScore }).from(users).leftJoin(pointTransactions, and(eq(pointTransactions.userId, users.id), eq(pointTransactions.verified, true))).where(and(sql `${users.fraudScore} <= 30`, eq(users.banned, false))).groupBy(users.id, users.username, users.fraudScore).orderBy(desc(sql `COALESCE(SUM(${pointTransactions.amount}), 0)`)).limit(limit);
    return leaderboard.map((entry, index) => ({ rank: index + 1, userId: entry.userId, username: entry.username, totalXP: entry.totalXP, gamesPlayed: entry.gamesPlayed, tier: getCreatorTier(entry.totalXP), fraudScore: entry.fraudScore }));
}
export async function getReferralDetails(userId) {
    const referralList = await db.select({ referredUserId: referrals.referredUserId, referredUsername: users.username, referredAt: referrals.createdAt, lastLogin: users.lastLogin, totalXP: sql `COALESCE(SUM(${pointTransactions.amount}), 0)` }).from(referrals).leftJoin(users, eq(referrals.referredUserId, users.id)).leftJoin(pointTransactions, and(eq(pointTransactions.userId, referrals.referredUserId), eq(pointTransactions.verified, true))).where(eq(referrals.referrerId, userId)).groupBy(referrals.referredUserId, users.username, referrals.createdAt, users.lastLogin);
    return referralList.map(ref => ({ userId: ref.referredUserId, username: ref.referredUsername, referredAt: ref.referredAt, lastActive: ref.lastLogin, totalXP: ref.totalXP, isActive: ref.lastLogin && new Date(ref.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }));
}
export async function checkPayoutEligibility(userId) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user)
        return { eligible: false, reason: "User not found" };
    if (user.banned)
        return { eligible: false, reason: "Account is banned" };
    if ((user.fraudScore || 0) > 30)
        return { eligible: false, reason: "Fraud score too high (must be =30)" };
    const stats = await getCreatorStats(userId);
    const minPayout = stats.tier.payoutMin;
    if (stats.earnings.estimated < minPayout)
        return { eligible: false, reason: `Minimum payout for ${stats.tier.name} is $${minPayout}`, currentEarnings: stats.earnings.estimated, minimumRequired: minPayout };
    return { eligible: true, amount: stats.earnings.estimated, tier: stats.tier.name };
}
