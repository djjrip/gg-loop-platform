import { db } from "./db";
import { 
  users, games, userGames, leaderboardEntries, achievements, rewards, userRewards,
  type User, type InsertUser, type UpsertUser,
  type Game, type InsertGame,
  type UserGame, type InsertUserGame,
  type LeaderboardEntry, type InsertLeaderboardEntry,
  type Achievement, type InsertAchievement,
  type Reward, type InsertReward,
  type UserReward, type InsertUserReward
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  
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

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db.update(users)
      .set({ totalPoints: sql`${users.totalPoints} + ${points}` })
      .where(eq(users.id, userId));
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
    const result = await db.insert(achievements).values(insertAchievement).returning();
    await this.updateUserPoints(insertAchievement.userId, insertAchievement.pointsAwarded);
    return result[0];
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
    const reward = await db.select().from(rewards).where(eq(rewards.id, insertUserReward.rewardId)).limit(1);
    if (!reward[0]) {
      throw new Error("Reward not found");
    }
    
    const user = await this.getUser(insertUserReward.userId);
    if (!user || user.totalPoints < reward[0].pointsCost) {
      throw new Error("Insufficient points");
    }
    
    const result = await db.insert(userRewards).values(insertUserReward).returning();
    await db.update(users)
      .set({ totalPoints: sql`${users.totalPoints} - ${reward[0].pointsCost}` })
      .where(eq(users.id, insertUserReward.userId));
    
    return result[0];
  }
}

export const storage = new DbStorage();
