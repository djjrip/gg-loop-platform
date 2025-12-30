import { db } from "../database";
import { users, ggCoinTransactions, userBadges, virtualBadges } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Free Tier Economics
export const FREE_TIER_MONTHLY_POINT_CAP = 100; // $1 worth
export const GG_COINS_PER_WIN = 10;
export const GG_COINS_PER_STREAK_MILESTONE = 50; // Every 7 days
export const GG_COINS_FOR_BASIC_TRIAL = 500; // ~50 wins or 10 weeks of streaks
export const BASIC_TRIAL_DURATION_DAYS = 7;

/**
 * Award GG Coins to a user
 */
export async function awardGgCoins(
  userId: string,
  amount: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
): Promise<number> {
  // Use transaction with FOR UPDATE lock to prevent race conditions
  return await db.transaction(async (tx: any) => {
    const [user] = await tx.select().from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .for("update");
    
    if (!user) throw new Error("User not found");

    const newBalance = user.ggCoins + amount;

    // Update user balance
    await tx.update(users)
      .set({ ggCoins: newBalance })
      .where(eq(users.id, userId));

    // Record transaction
    await tx.insert(ggCoinTransactions).values({
      userId,
      amount,
      reason,
      sourceType,
      sourceId,
      balanceAfter: newBalance,
    });

    return newBalance;
  });
}

/**
 * Check and update login streak, award GG Coins for milestones
 */
export async function updateLoginStreak(userId: string): Promise<{ 
  currentStreak: number; 
  coinsAwarded: number;
  badgeUnlocked?: string;
}> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const lastLogin = user.lastLoginAt;
  
  let newStreak = 1;
  let coinsAwarded = 0;
  let badgeUnlocked: string | undefined;

  if (lastLogin) {
    const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    // Within 48 hours = streak continues
    if (hoursSinceLastLogin < 48) {
      const daysSinceLastLogin = Math.floor(hoursSinceLastLogin / 24);
      if (daysSinceLastLogin >= 1) {
        newStreak = (user.loginStreak || 0) + 1;
      } else {
        // Same day login, don't increment
        newStreak = user.loginStreak || 1;
      }
    }
    // More than 48 hours = streak breaks
    else {
      newStreak = 1;
    }
  }

  // Award GG Coins for streak milestones (every 7 days)
  if (newStreak % 7 === 0 && newStreak > (user.loginStreak || 0)) {
    coinsAwarded = GG_COINS_PER_STREAK_MILESTONE;
    await awardGgCoins(
      userId,
      coinsAwarded,
      `${newStreak}-day login streak milestone!`,
      'streak',
      String(newStreak)
    );
  }

  // Update user streak data
  await db.update(users)
    .set({
      lastLoginAt: now,
      loginStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak || 0),
    })
    .where(eq(users.id, userId));

  // Check for streak badges
  if (newStreak === 7) {
    badgeUnlocked = await unlockBadgeByCondition(userId, 'streak_7');
  } else if (newStreak === 30) {
    badgeUnlocked = await unlockBadgeByCondition(userId, 'streak_30');
  } else if (newStreak === 100) {
    badgeUnlocked = await unlockBadgeByCondition(userId, 'streak_100');
  }

  return { currentStreak: newStreak, coinsAwarded, badgeUnlocked };
}

/**
 * Unlock a badge for a user by condition
 */
export async function unlockBadgeByCondition(
  userId: string,
  condition: string
): Promise<string | undefined> {
  const [badge] = await db
    .select()
    .from(virtualBadges)
    .where(and(
      eq(virtualBadges.unlockCondition, condition),
      eq(virtualBadges.isActive, true)
    ))
    .limit(1);

  if (!badge) return undefined;

  // Check if already unlocked
  const existing = await db
    .select()
    .from(userBadges)
    .where(and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badge.id)
    ))
    .limit(1);

  if (existing.length > 0) return undefined;

  // Unlock the badge
  await db.insert(userBadges).values({
    userId,
    badgeId: badge.id,
  });

  // Award GG Coins if badge has a reward
  if (badge.ggCoinsReward > 0) {
    await awardGgCoins(
      userId,
      badge.ggCoinsReward,
      `Badge unlocked: ${badge.name}`,
      'badge_unlock',
      badge.id
    );
  }

  return badge.name;
}

/**
 * Redeem GG Coins for Basic trial
 */
export async function redeemBasicTrial(userId: string): Promise<boolean> {
  // Use transaction to prevent race conditions
  return await db.transaction(async (tx: any) => {
    const [user] = await tx.select().from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .for("update");
    
    if (!user) throw new Error("User not found");

    if (user.ggCoins < GG_COINS_FOR_BASIC_TRIAL) {
      throw new Error(`Need ${GG_COINS_FOR_BASIC_TRIAL} GG Coins (you have ${user.ggCoins})`);
    }

    // Check if already has active trial
    if (user.freeTrialEndsAt && user.freeTrialEndsAt > new Date()) {
      throw new Error("You already have an active trial");
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + BASIC_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const newBalance = user.ggCoins - GG_COINS_FOR_BASIC_TRIAL;

    // Deduct coins and activate trial atomically
    await tx.update(users)
      .set({
        ggCoins: newBalance,
        freeTrialStartedAt: now,
        freeTrialEndsAt: trialEnd,
      })
      .where(eq(users.id, userId));

    // Record transaction
    await tx.insert(ggCoinTransactions).values({
      userId,
      amount: -GG_COINS_FOR_BASIC_TRIAL,
      reason: `Redeemed ${BASIC_TRIAL_DURATION_DAYS}-day Basic trial`,
      sourceType: 'trial_redemption',
      balanceAfter: newBalance,
    });

    return true;
  });
}

/**
 * Get user's free tier status
 */
export async function getFreeTierStatus(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  const hasActiveTrial = user.freeTrialEndsAt && user.freeTrialEndsAt > new Date();
  const canRedeemTrial = user.ggCoins >= GG_COINS_FOR_BASIC_TRIAL && !hasActiveTrial;

  return {
    ggCoins: user.ggCoins,
    coinsNeeded: Math.max(0, GG_COINS_FOR_BASIC_TRIAL - user.ggCoins),
    canRedeemTrial,
    hasActiveTrial,
    trialEndsAt: user.freeTrialEndsAt,
    currentStreak: user.loginStreak || 0,
    longestStreak: user.longestStreak || 0,
    xpLevel: user.xpLevel || 1,
    xpPoints: user.xpPoints || 0,
  };
}
