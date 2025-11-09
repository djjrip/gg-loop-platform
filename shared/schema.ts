import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  oidcSub: varchar("oidc_sub").unique(),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  totalPoints: integer("total_points").notNull().default(0),
  gamesConnected: integer("games_connected").notNull().default(0),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  realValue: integer("real_value").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  tier: integer("tier").notNull().default(1),
  stock: integer("stock"),
  sku: varchar("sku"),
  fulfillmentType: varchar("fulfillment_type").notNull().default("manual"),
  inStock: boolean("in_stock").notNull().default(true),
});

export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  pointsSpent: integer("points_spent").notNull(),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  fulfillmentData: jsonb("fulfillment_data"),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  tier: varchar("tier").notNull().default("basic"),
  status: varchar("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAt: timestamp("cancel_at"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: varchar("type").notNull(),
  sourceId: varchar("source_id"),
  sourceType: varchar("source_type"),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  isExpired: boolean("is_expired").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_point_tx_user").on(table.userId),
  index("idx_point_tx_source").on(table.sourceType, table.sourceId),
  sql`UNIQUE NULLS NOT DISTINCT(user_id, source_type, source_id)`,
]);

export const subscriptionEvents = pgTable("subscription_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  eventType: varchar("event_type").notNull(),
  stripeEventId: varchar("stripe_event_id").unique(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiPartners = pgTable("api_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  apiKey: varchar("api_key").notNull().unique(),
  apiSecret: varchar("api_secret").notNull(), // Store plaintext secret for HMAC validation
  isActive: boolean("is_active").notNull().default(true),
  webhookUrl: text("webhook_url"),
  rateLimit: integer("rate_limit").notNull().default(1000),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gamingEvents = pgTable("gaming_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => apiPartners.id),
  userId: varchar("user_id").references(() => users.id),
  gameId: varchar("game_id").references(() => games.id),
  eventType: varchar("event_type").notNull(),
  eventData: jsonb("event_data"),
  pointsAwarded: integer("points_awarded"),
  transactionId: varchar("transaction_id").references(() => pointTransactions.id),
  externalEventId: varchar("external_event_id").notNull(),
  status: varchar("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  idxGamingEventsUser: index("idx_gaming_events_user").on(table.userId),
  idxGamingEventsPartner: index("idx_gaming_events_partner").on(table.partnerId),
  idxGamingEventsStatus: index("idx_gaming_events_status").on(table.status),
  uniqPartnerEvent: sql`UNIQUE(partner_id, external_event_id)`,
}));

export const matchSubmissions = pgTable("match_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  matchType: varchar("match_type").notNull(),
  notes: text("notes"),
  screenshotUrl: text("screenshot_url"),
  status: varchar("status").notNull().default("pending"),
  pointsAwarded: integer("points_awarded"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => [
  index("idx_match_submissions_user").on(table.userId),
  index("idx_match_submissions_status").on(table.status),
]);

export const upsertUserSchema = createInsertSchema(users).omit({ totalPoints: true, gamesConnected: true, stripeCustomerId: true, stripeSubscriptionId: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, totalPoints: true, gamesConnected: true, stripeCustomerId: true, stripeSubscriptionId: true, createdAt: true, updatedAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, isActive: true });
export const insertUserGameSchema = createInsertSchema(userGames).omit({ id: true, connectedAt: true });
export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({ id: true, updatedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, achievedAt: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true, inStock: true, tier: true, stock: true, sku: true, fulfillmentType: true });
export const insertUserRewardSchema = createInsertSchema(userRewards).omit({ id: true, redeemedAt: true, status: true, fulfillmentData: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ id: true, isExpired: true, createdAt: true });
export const insertSubscriptionEventSchema = createInsertSchema(subscriptionEvents).omit({ id: true, createdAt: true });
export const insertApiPartnerSchema = createInsertSchema(apiPartners).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGamingEventSchema = createInsertSchema(gamingEvents).omit({ id: true, createdAt: true, status: true, retryCount: true, processedAt: true });
export const insertMatchSubmissionSchema = createInsertSchema(matchSubmissions).omit({ id: true, submittedAt: true, status: true, reviewedAt: true, reviewedBy: true, reviewNotes: true, pointsAwarded: true });

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertUserGame = z.infer<typeof insertUserGameSchema>;
export type UserGame = typeof userGames.$inferSelect;

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type LeaderboardEntryWithUser = LeaderboardEntry & { user: User };

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;

export type InsertSubscriptionEvent = z.infer<typeof insertSubscriptionEventSchema>;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;

export type InsertApiPartner = z.infer<typeof insertApiPartnerSchema>;
export type ApiPartner = typeof apiPartners.$inferSelect;

export type InsertGamingEvent = z.infer<typeof insertGamingEventSchema>;
export type GamingEvent = typeof gamingEvents.$inferSelect;

export type InsertMatchSubmission = z.infer<typeof insertMatchSubmissionSchema>;
export type MatchSubmission = typeof matchSubmissions.$inferSelect;

export const gamingWebhookBaseSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  userId: z.string().uuid("Invalid user ID"),
  gameId: z.string().uuid("Invalid game ID").optional(),
  externalEventId: z.string().min(1, "External event ID is required"),
  timestamp: z.number().int().positive("Timestamp must be a positive integer"),
});

export const matchWinWebhookSchema = gamingWebhookBaseSchema.extend({
  matchData: z.record(z.any()).optional(),
});

export const achievementWebhookSchema = gamingWebhookBaseSchema.extend({
  achievementData: z.object({
    title: z.string().optional(),
    pointsAwarded: z.number().int().min(1).max(100, "Achievement points capped at 100"),
  }),
});

export const tournamentWebhookSchema = gamingWebhookBaseSchema.extend({
  tournamentData: z.object({
    placement: z.number().int().min(1),
    tournamentName: z.string().optional(),
  }),
});
