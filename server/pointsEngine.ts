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

export const EARNING_RULES: Record<string, EarningRule> = {
  SUBSCRIPTION_MONTHLY: {
    type: "subscription_monthly",
    basePoints: 100,
    tierMultipliers: { basic: 1.0, premium: 2.0 },
  },
  MATCH_WIN: {
    type: "match_win",
    basePoints: 5,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
    dailyCap: 50,
  },
  DAILY_CHALLENGE: {
    type: "daily_challenge",
    basePoints: 10,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
    dailyCap: 30,
  },
  WEEKLY_CHALLENGE: {
    type: "weekly_challenge",
    basePoints: 25,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
  },
  RANK_UP: {
    type: "rank_up",
    basePoints: 20,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
  },
  ACHIEVEMENT: {
    type: "achievement",
    basePoints: 15,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
  },
  LEADERBOARD_TOP: {
    type: "leaderboard_top",
    basePoints: 100,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
  },
  TOURNAMENT_PLACEMENT: {
    type: "tournament_placement",
    basePoints: 50,
    tierMultipliers: { basic: 1.0, premium: 1.5 },
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
          sql`${pointTransactions.expiresAt} < ${now}`
        )
      );
    
    return Number(result[0]?.total || 0);
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

      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for("update");
      if (!user[0]) throw new Error("User not found");

      const expiredPoints = await this.getExpiredUnclaimedPoints(userId, tx);
      const effectiveBalance = user[0].totalPoints - expiredPoints;
      const newBalance = user[0].totalPoints + finalAmount;

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 12);

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
          expiresAt,
        })
        .returning();

      await tx
        .update(users)
        .set({ totalPoints: newBalance, updatedAt: new Date() })
        .where(eq(users.id, userId));

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
        .set({ totalPoints: newBalance, updatedAt: new Date() })
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
          sql`${pointTransactions.expiresAt} < ${now}`
        )
      );
  }
}

export const pointsEngine = new PointsEngine();
