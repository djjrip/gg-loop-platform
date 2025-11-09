import { db } from "./db";
import { 
  users, games, userGames, leaderboardEntries, achievements, rewards, userRewards,
  subscriptions, subscriptionEvents, pointTransactions,
  type User, type InsertUser, type UpsertUser,
  type Game, type InsertGame,
  type UserGame, type InsertUserGame,
  type LeaderboardEntry, type InsertLeaderboardEntry,
  type Achievement, type InsertAchievement,
  type Reward, type InsertReward,
  type UserReward, type InsertUserReward,
  type Subscription, type InsertSubscription,
  type SubscriptionEvent, type InsertSubscriptionEvent,
  type PointTransaction
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { pointsEngine } from "./pointsEngine";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  getAllGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  getUserGames(userId: string): Promise<(UserGame & { game: Game })[]>;
  connectUserGame(userGame: InsertUserGame): Promise<UserGame>;
  
  getLeaderboard(gameId: string, period: string, limit?: number): Promise<(LeaderboardEntry & { user: User })[]>;
  upsertLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  
  getUserAchievements(userId: string, limit?: number): Promise<(Achievement & { game: Game })[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  getAllRewards(): Promise<Reward[]>;
  getUserRewards(userId: string): Promise<(UserReward & { reward: Reward })[]>;
  redeemReward(userReward: InsertUserReward): Promise<UserReward>;
  
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(subscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription>;
  logSubscriptionEvent(event: InsertSubscriptionEvent): Promise<SubscriptionEvent>;
  
  getPointTransactions(userId: string, limit?: number): Promise<PointTransaction[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId || null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllGames(): Promise<Game[]> {
    return db.select().from(games).where(eq(games.isActive, true));
  }

  async getGame(id: string): Promise<Game | undefined> {
    const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
    return result[0];
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const result = await db.insert(games).values(insertGame).returning();
    return result[0];
  }

  async getUserGames(userId: string): Promise<(UserGame & { game: Game })[]> {
    const result = await db
      .select()
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(eq(userGames.userId, userId));
    
    return result.map(r => ({ ...r.user_games, game: r.games }));
  }

  async connectUserGame(insertUserGame: InsertUserGame): Promise<UserGame> {
    const result = await db.insert(userGames).values(insertUserGame).returning();
    await db.update(users)
      .set({ gamesConnected: sql`${users.gamesConnected} + 1` })
      .where(eq(users.id, insertUserGame.userId));
    return result[0];
  }

  async getLeaderboard(gameId: string, period: string, limit: number = 10): Promise<(LeaderboardEntry & { user: User })[]> {
    const result = await db
      .select()
      .from(leaderboardEntries)
      .innerJoin(users, eq(leaderboardEntries.userId, users.id))
      .where(and(
        eq(leaderboardEntries.gameId, gameId),
        eq(leaderboardEntries.period, period)
      ))
      .orderBy(leaderboardEntries.rank)
      .limit(limit);
    
    return result.map(r => ({ ...r.leaderboard_entries, user: r.users }));
  }

  async upsertLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const result = await db.insert(leaderboardEntries)
      .values(entry)
      .onConflictDoUpdate({
        target: [leaderboardEntries.userId, leaderboardEntries.gameId, leaderboardEntries.period],
        set: {
          score: entry.score,
          rank: entry.rank,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();
    return result[0];
  }

  async getUserAchievements(userId: string, limit: number = 10): Promise<(Achievement & { game: Game })[]> {
    const result = await db
      .select()
      .from(achievements)
      .innerJoin(games, eq(achievements.gameId, games.id))
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.achievedAt))
      .limit(limit);
    
    return result.map(r => ({ ...r.achievements, game: r.games }));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    return await db.transaction(async (tx) => {
      const [achievement] = await tx.insert(achievements).values(insertAchievement).returning();
      
      await pointsEngine.awardPoints(
        insertAchievement.userId,
        insertAchievement.pointsAwarded,
        "ACHIEVEMENT",
        achievement.id,
        "achievement",
        insertAchievement.title,
        tx
      );
      
      return achievement;
    });
  }

  async getAllRewards(): Promise<Reward[]> {
    return db.select().from(rewards).where(eq(rewards.inStock, true));
  }

  async getUserRewards(userId: string): Promise<(UserReward & { reward: Reward })[]> {
    const result = await db
      .select()
      .from(userRewards)
      .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
      .where(eq(userRewards.userId, userId))
      .orderBy(desc(userRewards.redeemedAt));
    
    return result.map(r => ({ ...r.user_rewards, reward: r.rewards }));
  }

  async redeemReward(insertUserReward: InsertUserReward): Promise<UserReward> {
    return await db.transaction(async (tx) => {
      const reward = await tx.select().from(rewards).where(eq(rewards.id, insertUserReward.rewardId)).limit(1).for("update");
      if (!reward[0]) {
        throw new Error("Reward not found");
      }

      if (!reward[0].inStock) {
        throw new Error("Reward is out of stock");
      }

      if (reward[0].stock !== null && reward[0].stock <= 0) {
        throw new Error("Reward is out of stock");
      }

      await pointsEngine.spendPoints(
        insertUserReward.userId,
        insertUserReward.pointsSpent,
        "REWARD_REDEMPTION",
        reward[0].id,
        "reward",
        `Redeemed: ${reward[0].title}`,
        tx
      );

      const [userReward] = await tx.insert(userRewards).values(insertUserReward).returning();

      if (reward[0].stock !== null) {
        await tx
          .update(rewards)
          .set({ 
            stock: sql`${rewards.stock} - 1`,
            inStock: sql`${rewards.stock} > 1`
          })
          .where(eq(rewards.id, reward[0].id));
      }

      return userReward;
    });
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    return subscription;
  }

  async logSubscriptionEvent(insertEvent: InsertSubscriptionEvent): Promise<SubscriptionEvent> {
    const [event] = await db.insert(subscriptionEvents).values(insertEvent).returning();
    return event;
  }

  async getPointTransactions(userId: string, limit: number = 50): Promise<PointTransaction[]> {
    return pointsEngine.getTransactionHistory(userId, limit);
  }

  async checkEventProcessed(stripeEventId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(subscriptionEvents)
      .where(eq(subscriptionEvents.stripeEventId, stripeEventId))
      .limit(1);
    return result.length > 0;
  }
}

export const storage = new DbStorage();
