import { db } from "./db";
import { users, pointTransactions, subscriptions } from "@shared/schema";
import type { InsertPointTransaction, PointTransaction } from "@shared/schema";
import { eq, and, sql, gte } from "drizzle-orm";

type DbOrTx = typeof db | any;

export interface EarningRule {
  type: string;
  basePoints: number;
  tierMultipliers: Record<string, number>;
  dailyCap?: number;
  monthlyCap?: number;
}

// Monthly subscription point allocations per tier
// These are fixed monthly grants awarded via subscription renewal
export const MONTHLY_SUBSCRIPTION_POINTS = {
  basic: 3000,   // Basic tier: 3,000 points/month
  pro: 10000,    // Pro tier: 10,000 points/month
  elite: 25000,  // Elite tier: 25,000 points/month
};

// DEPRECATED: Old point-to-dollar conversion system (no longer used)
// Points are now awarded as fixed monthly allocations, not tied to gameplay performance
export const POINTS_PER_DOLLAR = 100;

// DEPRECATED: Monthly earning caps (no longer enforced)
// Points are now distributed as capped monthly allocations via subscription tier
export const MONTHLY_EARNING_CAPS = {
  basic: 400,
  pro: 800,
  elite: 1500,
};

export const EARNING_RULES: Record<string, EarningRule> = {
  SUBSCRIPTION_MONTHLY: {
    type: "subscription_monthly",
    basePoints: 100,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  MATCH_WIN: {
    type: "match_win",
    basePoints: 5,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
    dailyCap: 50,
  },
  DAILY_CHALLENGE: {
    type: "daily_challenge",
    basePoints: 10,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
    dailyCap: 30,
  },
  WEEKLY_CHALLENGE: {
    type: "weekly_challenge",
    basePoints: 25,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  RANK_UP: {
    type: "rank_up",
    basePoints: 20,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  ACHIEVEMENT: {
    type: "achievement",
    basePoints: 15,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  LEADERBOARD_TOP: {
    type: "leaderboard_top",
    basePoints: 100,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  TOURNAMENT_PLACEMENT: {
    type: "tournament_placement",
    basePoints: 50,
    tierMultipliers: { basic: 1.0, pro: 2.0, elite: 3.0 },
  },
  FOUNDER_BONUS: {
    type: "founder_bonus",
    basePoints: 1000,
    tierMultipliers: { basic: 1.0, pro: 1.0, elite: 1.0 }, // Fixed 1,000 points regardless of tier
  },
};

export class PointsEngine {
  async getUserBalance(userId: string, dbOrTx: DbOrTx = db): Promise<number> {
    const user = await dbOrTx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) throw new Error("User not found");

    const expiredPoints = await this.getExpiredUnclaimedPoints(userId, dbOrTx);
    return user[0].totalPoints - expiredPoints;
  }

  async getExpiredUnclaimedPoints(userId: string, dbOrTx: DbOrTx = db): Promise<number> {
    const now = new Date();
    const result = await dbOrTx
      .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.isExpired, false),
          gte(pointTransactions.amount, 0),
          sql`${pointTransactions.expiresAt} IS NOT NULL`,
          sql`${pointTransactions.expiresAt} < NOW()`
        )
      );

    return Number(result[0]?.total || 0);
  }

  async getExpiringPoints(userId: string, daysThreshold: number = 30, dbOrTx: DbOrTx = db): Promise<{ amount: number; earliestExpiration: Date | null }> {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    // Get total expiring positive transactions
    const result = await dbOrTx
      .select({
        total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)`,
        earliest: sql<Date>`MIN(${pointTransactions.expiresAt})`
      })
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.isExpired, false),
          gte(pointTransactions.amount, 0),
          sql`${pointTransactions.expiresAt} IS NOT NULL`,
          sql`${pointTransactions.expiresAt} > NOW()`,
          sql`${pointTransactions.expiresAt} <= NOW() + interval '${sql.raw(daysThreshold.toString())} days'`
        )
      );

    const expiringTotal = Number(result[0]?.total || 0);

    // Get user's current available balance to avoid showing already-spent points
    const userBalance = await this.getUserBalance(userId, dbOrTx);

    // Only warn about points they actually have (not already spent)
    const actualExpiringAmount = Math.min(expiringTotal, Math.max(0, userBalance));

    return {
      amount: actualExpiringAmount,
      earliestExpiration: result[0]?.earliest || null
    };
  }

  async awardPoints(
    userId: string,
    amount: number,
    type: string,
    sourceId?: string,
    sourceType?: string,
    description?: string,
    dbOrTx?: DbOrTx
  ): Promise<PointTransaction> {
    if (amount <= 0) throw new Error("Amount must be positive");

    const rule = EARNING_RULES[type.toUpperCase()];
    if (!rule) throw new Error("Invalid earning type");

    const executeAward = async (tx: DbOrTx) => {
      const userSub = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      const tier = userSub[0]?.tier || "basic";
      const multiplier = rule.tierMultipliers[tier] || 1.0;
      const finalAmount = Math.floor(amount * multiplier);

      if (rule.dailyCap) {
        const dailyTotal = await this.getDailyEarnings(userId, type, tx);
        if (dailyTotal + finalAmount > rule.dailyCap) {
          throw new Error(`Daily cap of ${rule.dailyCap} points reached for ${type}`);
        }
      }

      // DEPRECATED: Monthly earning caps no longer enforced
      // Points are now distributed as fixed monthly allocations via subscription tier
      // Legacy cap checking disabled to support new compliance-friendly model
      // const monthlyCap = MONTHLY_EARNING_CAPS[tier as keyof typeof MONTHLY_EARNING_CAPS];
      // if (monthlyCap) {
      //   const monthlyTotal = await this.getMonthlyEarnings(userId, tx);
      //   if (monthlyTotal + finalAmount > monthlyCap) {
      //     throw new Error(`Monthly earning cap of ${monthlyCap} points reached for ${tier} tier.`);
      //   }
      // }

      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for("update");
      if (!user[0]) throw new Error("User not found");

      const expiredPoints = await this.getExpiredUnclaimedPoints(userId, tx);
      const effectiveBalance = user[0].totalPoints - expiredPoints;
      const newBalance = user[0].totalPoints + finalAmount;

      const expiresAtDate = new Date();
      expiresAtDate.setMonth(expiresAtDate.getMonth() + 12);

      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount: finalAmount,
          type,
          sourceId,
          sourceType,
          balanceAfter: newBalance,
          description: description || `Earned from ${type}`,
          expiresAt: expiresAtDate,
        })
        .returning();

      await tx
        .update(users)
        .set({ totalPoints: newBalance, updatedAt: sql`NOW()` })
        .where(eq(users.id, userId));

      return transaction;
    };

    if (dbOrTx) {
      return executeAward(dbOrTx);
    } else {
      return await db.transaction(executeAward);
    }
  }

  async awardSponsoredPoints(
    userId: string,
    amount: number,
    challengeId: string,
    challengeTitle: string,
    dbOrTx?: DbOrTx
  ): Promise<PointTransaction> {
    if (amount <= 0) throw new Error("Amount must be positive");

    const executeAward = async (tx: DbOrTx) => {
      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for("update");
      if (!user[0]) throw new Error("User not found");

      const newBalance = user[0].totalPoints + amount;

      const expiresAtDate = new Date();
      expiresAtDate.setMonth(expiresAtDate.getMonth() + 12);

      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount,
          type: "sponsored_challenge",
          sourceId: challengeId,
          sourceType: "challenge",
          balanceAfter: newBalance,
          description: `Bonus from challenge: ${challengeTitle}`,
          expiresAt: expiresAtDate,
        })
        .returning();

      await tx
        .update(users)
        .set({ totalPoints: newBalance, updatedAt: sql`NOW()` })
        .where(eq(users.id, userId));

      return transaction;
    };

    if (dbOrTx) {
      return executeAward(dbOrTx);
    } else {
      return await db.transaction(executeAward);
    }
  }

  async awardMonthlySubscriptionPoints(
    userId: string,
    tier: string,
    invoiceId: string,
    dbOrTx?: DbOrTx
  ): Promise<PointTransaction | null> {
    const amount = MONTHLY_SUBSCRIPTION_POINTS[tier as keyof typeof MONTHLY_SUBSCRIPTION_POINTS];

    if (!amount) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const executeAward = async (tx: DbOrTx) => {
      // Idempotency check: Has this invoice already been processed?
      const existing = await tx
        .select()
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, userId),
            eq(pointTransactions.type, "subscription_monthly"),
            eq(pointTransactions.sourceId, invoiceId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`Monthly points already awarded for invoice ${invoiceId}`);
        return null;
      }

      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for("update");
      if (!user[0]) throw new Error("User not found");

      const newBalance = user[0].totalPoints + amount;

      const expiresAtDate = new Date();
      expiresAtDate.setMonth(expiresAtDate.getMonth() + 12);

      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount,
          type: "subscription_monthly",
          sourceId: invoiceId,
          sourceType: "invoice",
          balanceAfter: newBalance,
          description: `${tier.toUpperCase()} tier monthly points`,
          expiresAt: expiresAtDate,
        })
        .returning();

      await tx
        .update(users)
        .set({ totalPoints: newBalance, updatedAt: sql`NOW()` })
        .where(eq(users.id, userId));

      console.log(`[PointsEngine] Awarded ${amount} monthly points to user ${userId} (${tier} tier)`);
      return transaction;
    };

    if (dbOrTx) {
      return executeAward(dbOrTx);
    } else {
      return await db.transaction(executeAward);
    }
  }

  async spendPoints(
    userId: string,
    amount: number,
    type: string,
    sourceId?: string,
    sourceType?: string,
    description?: string,
    dbOrTx?: DbOrTx
  ): Promise<PointTransaction> {
    if (amount <= 0) throw new Error("Amount must be positive");

    const executeSpend = async (tx: DbOrTx) => {
      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for("update");
      if (!user[0]) throw new Error("User not found");

      const expiredPoints = await this.getExpiredUnclaimedPoints(userId, tx);
      const effectiveBalance = user[0].totalPoints - expiredPoints;

      if (effectiveBalance < amount) {
        throw new Error(`Insufficient points. Have: ${effectiveBalance}, Need: ${amount}`);
      }

      const newBalance = user[0].totalPoints - amount;

      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount: -amount,
          type,
          sourceId,
          sourceType,
          balanceAfter: newBalance,
          description: description || `Spent on ${type}`,
        })
        .returning();

      await tx
        .update(users)
        .set({ totalPoints: newBalance, updatedAt: sql`NOW()` })
        .where(eq(users.id, userId));

      return transaction;
    };

    if (dbOrTx) {
      return executeSpend(dbOrTx);
    } else {
      return await db.transaction(executeSpend);
    }
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<PointTransaction[]> {
    return await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(sql`${pointTransactions.createdAt} DESC`)
      .limit(limit);
  }

  async getDailyEarnings(userId: string, type: string, dbOrTx: DbOrTx = db): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await dbOrTx
      .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.type, type),
          gte(pointTransactions.createdAt, today),
          gte(pointTransactions.amount, 0)
        )
      );

    return Number(result[0]?.total || 0);
  }

  async getMonthlyEarnings(userId: string, dbOrTx: DbOrTx = db): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await dbOrTx
      .select({ total: sql<number>`COALESCE(SUM(${pointTransactions.amount}), 0)` })
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          gte(pointTransactions.amount, 0),
          gte(pointTransactions.createdAt, startOfMonth)
        )
      );

    return Number(result[0]?.total || 0);
  }

  async markExpiredPoints(userId: string): Promise<void> {
    const now = new Date();
    await db
      .update(pointTransactions)
      .set({ isExpired: true })
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.isExpired, false),
          gte(pointTransactions.amount, 0),
          sql`${pointTransactions.expiresAt} IS NOT NULL`,
          sql`${pointTransactions.expiresAt} < NOW()`
        )
      );
  }
}

export const pointsEngine = new PointsEngine();
