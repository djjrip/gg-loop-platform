import { db } from "./db";
import { 
  users, games, userGames, leaderboardEntries, achievements, rewards, userRewards,
  subscriptions, subscriptionEvents, pointTransactions, apiPartners, gamingEvents, matchSubmissions,
  type User, type InsertUser, type UpsertUser,
  type Game, type InsertGame,
  type UserGame, type InsertUserGame,
  type LeaderboardEntry, type InsertLeaderboardEntry,
  type Achievement, type InsertAchievement,
  type Reward, type InsertReward,
  type UserReward, type InsertUserReward,
  type Subscription, type InsertSubscription,
  type SubscriptionEvent, type InsertSubscriptionEvent,
  type PointTransaction,
  type ApiPartner, type InsertApiPartner,
  type GamingEvent, type InsertGamingEvent,
  type MatchSubmission, type InsertMatchSubmission
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { pointsEngine } from "./pointsEngine";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByOidcSub(oidcSub: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  updateUsername(userId: string, username: string): Promise<User>;
  connectTwitchAccount(oidcSub: string, twitchData: { twitchId: string; twitchUsername: string; accessToken: string; refreshToken: string }): Promise<User>;
  disconnectTwitchAccount(userId: string): Promise<User>;
  
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
  
  getApiPartner(apiKey: string): Promise<ApiPartner | undefined>;
  createApiPartner(partner: InsertApiPartner & { apiSecret: string }): Promise<ApiPartner>;
  updateApiPartner(partnerId: string, updates: Partial<InsertApiPartner>): Promise<ApiPartner>;
  
  logGamingEvent(event: InsertGamingEvent): Promise<GamingEvent>;
  updateGamingEvent(eventId: string, updates: Partial<{ status: string; pointsAwarded: number | null; transactionId: string | null; errorMessage: string | null; retryCount: number; processedAt: Date }>): Promise<GamingEvent>;
  getEventByExternalId(partnerId: string, externalEventId: string): Promise<GamingEvent | undefined>;
  
  getUserMatchSubmissions(userId: string): Promise<(MatchSubmission & { game: Game })[]>;
  createMatchSubmission(submission: InsertMatchSubmission): Promise<MatchSubmission>;
  updateMatchSubmission(submissionId: string, updates: Partial<{ status: string; pointsAwarded: number | null; reviewedBy: string | null; reviewNotes: string | null; reviewedAt: Date }>): Promise<MatchSubmission>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByOidcSub(oidcSub: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.oidcSub, oidcSub)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.oidcSub,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
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

  async updateUsername(userId: string, username: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async connectTwitchAccount(oidcSub: string, twitchData: { twitchId: string; twitchUsername: string; accessToken: string; refreshToken: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        twitchId: twitchData.twitchId,
        twitchUsername: twitchData.twitchUsername,
        twitchAccessToken: twitchData.accessToken,
        twitchRefreshToken: twitchData.refreshToken,
        twitchConnectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.oidcSub, oidcSub))
      .returning();
    return user;
  }

  async disconnectTwitchAccount(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        twitchId: null,
        twitchUsername: null,
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchConnectedAt: null,
        updatedAt: new Date(),
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

  async getApiPartner(apiKey: string): Promise<ApiPartner | undefined> {
    const result = await db.select().from(apiPartners).where(eq(apiPartners.apiKey, apiKey)).limit(1);
    return result[0];
  }

  async createApiPartner(partner: InsertApiPartner & { apiSecret: string }): Promise<ApiPartner> {
    const [newPartner] = await db
      .insert(apiPartners)
      .values(partner)
      .returning();
    
    return newPartner;
  }

  async updateApiPartner(partnerId: string, updates: Partial<InsertApiPartner>): Promise<ApiPartner> {
    const [partner] = await db
      .update(apiPartners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiPartners.id, partnerId))
      .returning();
    return partner;
  }

  async logGamingEvent(event: InsertGamingEvent): Promise<GamingEvent> {
    const [gamingEvent] = await db.insert(gamingEvents).values(event).returning();
    return gamingEvent;
  }

  async updateGamingEvent(
    eventId: string,
    updates: Partial<{ status: string; pointsAwarded: number | null; transactionId: string | null; errorMessage: string | null; retryCount: number; processedAt: Date }>
  ): Promise<GamingEvent> {
    const [event] = await db
      .update(gamingEvents)
      .set(updates)
      .where(eq(gamingEvents.id, eventId))
      .returning();
    return event;
  }

  async getEventByExternalId(partnerId: string, externalEventId: string): Promise<GamingEvent | undefined> {
    const result = await db
      .select()
      .from(gamingEvents)
      .where(and(
        eq(gamingEvents.partnerId, partnerId),
        eq(gamingEvents.externalEventId, externalEventId)
      ))
      .limit(1);
    return result[0];
  }

  async getUserMatchSubmissions(userId: string): Promise<(MatchSubmission & { game: Game })[]> {
    const result = await db
      .select({
        matchSubmission: matchSubmissions,
        game: games,
      })
      .from(matchSubmissions)
      .innerJoin(games, eq(matchSubmissions.gameId, games.id))
      .where(eq(matchSubmissions.userId, userId))
      .orderBy(desc(matchSubmissions.submittedAt));
    
    return result.map(row => ({
      ...row.matchSubmission,
      game: row.game,
      gameName: row.game.title,
    })) as (MatchSubmission & { game: Game })[];
  }

  async createMatchSubmission(submission: InsertMatchSubmission): Promise<MatchSubmission> {
    const [newSubmission] = await db
      .insert(matchSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async updateMatchSubmission(
    submissionId: string,
    updates: Partial<{ status: string; pointsAwarded: number | null; reviewedBy: string | null; reviewNotes: string | null; reviewedAt: Date }>
  ): Promise<MatchSubmission> {
    const [submission] = await db
      .update(matchSubmissions)
      .set(updates)
      .where(eq(matchSubmissions.id, submissionId))
      .returning();
    return submission;
  }
}

export const storage = new DbStorage();
