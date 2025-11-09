import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  totalPoints: integer("total_points").notNull().default(0),
  gamesConnected: integer("games_connected").notNull().default(0),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  players: integer("players").notNull().default(0),
  avgScore: integer("avg_score").notNull().default(0),
  challenges: integer("challenges").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const userGames = pgTable("user_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  accountName: text("account_name"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  score: integer("score").notNull(),
  rank: integer("rank").notNull(),
  period: text("period").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userGamePeriodUnique: sql`UNIQUE(user_id, game_id, period)`,
}));

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  title: text("title").notNull(),
  description: text("description"),
  pointsAwarded: integer("points_awarded").notNull(),
  achievedAt: timestamp("achieved_at").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
});

export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, totalPoints: true, gamesConnected: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, isActive: true });
export const insertUserGameSchema = createInsertSchema(userGames).omit({ id: true, connectedAt: true });
export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({ id: true, updatedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, achievedAt: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true, inStock: true });
export const insertUserRewardSchema = createInsertSchema(userRewards).omit({ id: true, redeemedAt: true, status: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertUserGame = z.infer<typeof insertUserGameSchema>;
export type UserGame = typeof userGames.$inferSelect;

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;
