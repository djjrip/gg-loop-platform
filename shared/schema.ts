// Schema definition
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb, serial } from "drizzle-orm/pg-core";
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
  ggCoins: integer("gg_coins").notNull().default(0), // Virtual currency for unlocking trials
  primaryGame: varchar("primary_game"), // User's favorite game (free-form text)
  gamesConnected: integer("games_connected").notNull().default(0),
  twitchId: varchar("twitch_id").unique(),
  twitchUsername: varchar("twitch_username"),
  twitchAccessToken: text("twitch_access_token"),
  twitchRefreshToken: text("twitch_refresh_token"),
  twitchConnectedAt: timestamp("twitch_connected_at"),
  tiktokOpenId: varchar("tiktok_open_id").unique(),
  tiktokUnionId: varchar("tiktok_union_id"),
  tiktokUsername: varchar("tiktok_username"),
  tiktokAccessToken: text("tiktok_access_token"),
  tiktokRefreshToken: text("tiktok_refresh_token"),
  tiktokConnectedAt: timestamp("tiktok_connected_at"),
  shippingAddress: text("shipping_address"),
  shippingCity: varchar("shipping_city"),
  shippingState: varchar("shipping_state"),
  shippingZip: varchar("shipping_zip"),
  shippingCountry: varchar("shipping_country").default("US"),
  referralCode: varchar("referral_code", { length: 10 }).unique(),
  referredBy: varchar("referred_by").references((): any => users.id),
  isFounder: boolean("is_founder").notNull().default(false),
  founderNumber: integer("founder_number"),
  freeTrialStartedAt: timestamp("free_trial_started_at"),
  freeTrialEndsAt: timestamp("free_trial_ends_at"),
  lastLoginAt: timestamp("last_login_at"),
  loginStreak: integer("login_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  xpLevel: integer("xp_level").notNull().default(1),
  xpPoints: integer("xp_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  founderNumberUnique: sql`UNIQUE(founder_number) WHERE founder_number IS NOT NULL`,
}));

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  pointsAwarded: integer("points_awarded").default(0),
  tier: integer("tier").default(0),
  completionReason: varchar("completion_reason"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_referrals_referrer").on(table.referrerId),
  index("idx_referrals_referred").on(table.referredUserId),
  sql`UNIQUE(referrer_id, referred_user_id)`,
]);

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
  riotPuuid: varchar("riot_puuid", { length: 78 }),
  riotGameName: varchar("riot_game_name"),
  riotTagLine: varchar("riot_tag_line"),
  riotRegion: varchar("riot_region"),
  steamId: varchar("steam_id"),
  verifiedAt: timestamp("verified_at"),
  lastMatchCheck: timestamp("last_match_check"),
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
  trackingNumber: text("tracking_number"),
  fulfillmentNotes: text("fulfillment_notes"),
  fulfilledAt: timestamp("fulfilled_at"),
  shippingAddress: text("shipping_address"),
  shippingCity: varchar("shipping_city"),
  shippingState: varchar("shipping_state"),
  shippingZip: varchar("shipping_zip"),
  shippingCountry: varchar("shipping_country"),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  paypalSubscriptionId: varchar("paypal_subscription_id").unique(),
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
  riotMatchId: varchar("riot_match_id"),
  verifiedViaRiot: boolean("verified_via_riot").default(false),
  matchData: jsonb("match_data"),
  status: varchar("status").notNull().default("pending"),
  pointsAwarded: integer("points_awarded"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  // Verification system fields
  verificationScore: integer("verification_score").default(0), // 0-100 automated confidence
  fraudFlags: jsonb("fraud_flags"), // Array of detected issues
  proofUrls: jsonb("proof_urls"), // DEPRECATED - use verificationProofs table
  verificationMethod: varchar("verification_method").default("pending"), // auto, manual, hybrid, pending
}, (table) => ({
  idxMatchSubmissionsUser: index("idx_match_submissions_user").on(table.userId),
  idxMatchSubmissionsStatus: index("idx_match_submissions_status").on(table.status),
  uniqUserRiotMatch: sql`UNIQUE(user_id, riot_match_id) WHERE riot_match_id IS NOT NULL`,
}));

export const streamingSessions = pgTable("streaming_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").references(() => games.id),
  gameName: text("game_name"),
  streamStartedAt: timestamp("stream_started_at").notNull(),
  streamEndedAt: timestamp("stream_ended_at"),
  durationMinutes: integer("duration_minutes"),
  viewerCount: integer("viewer_count"),
  pointsAwarded: integer("points_awarded").default(0),
  twitchStreamId: varchar("twitch_stream_id"),
  status: varchar("status").notNull().default("active"),
  lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Verification system fields
  clipUrls: jsonb("clip_urls"), // DEPRECATED - use verificationProofs table
  viewershipVerified: boolean("viewership_verified").default(false),
  streamQualityScore: integer("stream_quality_score"), // 0-100 quality assessment
}, (table) => [
  index("idx_streaming_sessions_user").on(table.userId),
  index("idx_streaming_sessions_status").on(table.status),
]);

export const riotAccounts = pgTable("riot_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  puuid: text("puuid").notNull(),
  gameName: text("game_name").notNull(),
  tagLine: text("tag_line").notNull(),
  region: varchar("region").notNull(),
  game: varchar("game").notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  idxRiotAccountsUser: index("idx_riot_accounts_user").on(table.userId),
  idxRiotAccountsPuuid: index("idx_riot_accounts_puuid").on(table.puuid),
  uniqUserGame: sql`UNIQUE(user_id, game)`,
  gameCheck: sql`CHECK (game IN ('league', 'valorant', 'tft'))`,
}));

export const processedRiotMatches = pgTable("processed_riot_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  riotAccountId: varchar("riot_account_id").notNull().references(() => riotAccounts.id, { onDelete: 'cascade' }),
  matchId: text("match_id").notNull(),
  gameEndedAt: timestamp("game_ended_at").notNull(),
  isWin: boolean("is_win").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  transactionId: varchar("transaction_id").references(() => pointTransactions.id),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
}, (table) => ({
  idxProcessedRiotMatchesAccount: index("idx_processed_riot_matches_account").on(table.riotAccountId),
  uniqAccountMatch: sql`UNIQUE(riot_account_id, match_id)`,
}));

// ============================================================================
// VERIFICATION SYSTEM - Proof File Storage
// ============================================================================

export const verificationProofs = pgTable("verification_proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),

  // Link to source (match submission, streaming session, or challenge)
  sourceType: varchar("source_type").notNull(), // 'match_submission', 'streaming_session', 'challenge'
  sourceId: varchar("source_id").notNull(), // ID of the linked record

  // File details
  fileUrl: text("file_url").notNull(), // GCS or S3 URL
  fileType: varchar("file_type").notNull(), // 'image', 'video', 'replay'
  fileSizeBytes: integer("file_size_bytes").notNull(),
  fileName: varchar("file_name").notNull(),

  // Metadata
  uploadedFromIp: varchar("uploaded_from_ip"),
  fileMetadata: jsonb("file_metadata"), // EXIF data, video duration, etc.

  // Verification status
  status: varchar("status").notNull().default("pending"), // pending, verified, rejected, flagged
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_verification_proofs_user").on(table.userId),
  index("idx_verification_proofs_source").on(table.sourceType, table.sourceId),
  index("idx_verification_proofs_status").on(table.status),
]);

export const fraudDetectionLogs = pgTable("fraud_detection_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),

  // Detection details
  detectionType: varchar("detection_type").notNull(), // 'duplicate_submission', 'impossible_timing', 'ip_mismatch', 'device_fingerprint', 'pattern_anomaly'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  riskScore: integer("risk_score").notNull(), // 0-100

  // Context
  sourceType: varchar("source_type"), // 'match_submission', 'streaming_session', 'challenge', 'point_transaction'
  sourceId: varchar("source_id"),
  detectionData: jsonb("detection_data").notNull(), // Detailed fraud indicators

  // Resolution
  status: varchar("status").notNull().default("pending"), // pending, reviewed, dismissed, confirmed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken"), // 'none', 'warning', 'points_reversed', 'account_suspended'

  // Tracking
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_fraud_logs_user").on(table.userId),
  index("idx_fraud_logs_severity").on(table.severity),
  index("idx_fraud_logs_status").on(table.status),
  index("idx_fraud_logs_created").on(table.createdAt),
]);

export const verificationQueue = pgTable("verification_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Item details
  itemType: varchar("item_type").notNull(), // 'match_submission', 'fraud_alert', 'proof_review'
  itemId: varchar("item_id").notNull(), // ID of the item to review
  userId: varchar("user_id").notNull().references(() => users.id), // User being reviewed

  // Priority and status
  priority: integer("priority").notNull().default(1), // 1=low, 2=medium, 3=high, 4=critical
  status: varchar("status").notNull().default("pending"), // pending, in_review, completed, skipped

  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedAt: timestamp("assigned_at"),

  // SLA tracking
  createdAt: timestamp("created_at").notNull().defaultNow(),
  dueBy: timestamp("due_by"), // SLA deadline
  completedAt: timestamp("completed_at"),

  // Context
  queueMetadata: jsonb("queue_metadata"), // Additional context for review
}, (table) => [
  index("idx_verification_queue_status").on(table.status),
  index("idx_verification_queue_priority").on(table.priority),
  index("idx_verification_queue_assigned").on(table.assignedTo),
  index("idx_verification_queue_user").on(table.userId),
  sql`UNIQUE(item_type, item_id)`, // Prevent duplicate queue entries
]);

export const virtualBadges = pgTable("virtual_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  rarity: varchar("rarity").notNull().default("common"), // common, rare, epic, legendary
  unlockCondition: text("unlock_condition").notNull(),
  ggCoinsRequired: integer("gg_coins_required").default(0),
  ggCoinsReward: integer("gg_coins_reward").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => virtualBadges.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
}, (table) => ({
  uniqUserBadge: sql`UNIQUE(user_id, badge_id)`,
}));

export const ggCoinTransactions = pgTable("gg_coin_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  sourceType: varchar("source_type"), // win, streak, referral, etc
  sourceId: varchar("source_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_gg_coin_tx_user").on(table.userId),
]);

export const upsertUserSchema = createInsertSchema(users).omit({ totalPoints: true, gamesConnected: true, ggCoins: true, twitchAccessToken: true, twitchRefreshToken: true, referralCode: true, freeTrialStartedAt: true, freeTrialEndsAt: true, lastLoginAt: true, loginStreak: true, longestStreak: true, xpLevel: true, xpPoints: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, totalPoints: true, gamesConnected: true, ggCoins: true, twitchAccessToken: true, twitchRefreshToken: true, referralCode: true, freeTrialStartedAt: true, freeTrialEndsAt: true, lastLoginAt: true, loginStreak: true, longestStreak: true, xpLevel: true, xpPoints: true, createdAt: true, updatedAt: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true, completedAt: true, pointsAwarded: true, tier: true, status: true });
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
export const insertStreamingSessionSchema = createInsertSchema(streamingSessions).omit({ id: true, createdAt: true, status: true, lastCheckedAt: true, pointsAwarded: true });
export const insertRiotAccountSchema = createInsertSchema(riotAccounts).omit({ id: true, lastSyncedAt: true, createdAt: true, updatedAt: true });
export const insertProcessedRiotMatchSchema = createInsertSchema(processedRiotMatches).omit({ id: true, processedAt: true });
export const insertVirtualBadgeSchema = createInsertSchema(virtualBadges).omit({ id: true, createdAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, unlockedAt: true });
export const insertGgCoinTransactionSchema = createInsertSchema(ggCoinTransactions).omit({ id: true, createdAt: true });

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

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

export type InsertStreamingSession = z.infer<typeof insertStreamingSessionSchema>;
export type StreamingSession = typeof streamingSessions.$inferSelect;

export type InsertRiotAccount = z.infer<typeof insertRiotAccountSchema>;
export type RiotAccount = typeof riotAccounts.$inferSelect;

export type InsertProcessedRiotMatch = z.infer<typeof insertProcessedRiotMatchSchema>;
export type ProcessedRiotMatch = typeof processedRiotMatches.$inferSelect;

export type InsertVirtualBadge = z.infer<typeof insertVirtualBadgeSchema>;
export type VirtualBadge = typeof virtualBadges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export type InsertGgCoinTransaction = z.infer<typeof insertGgCoinTransactionSchema>;
export type GgCoinTransaction = typeof ggCoinTransactions.$inferSelect;

export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
  contactEmail: varchar("contact_email"),
  contactName: varchar("contact_name"),
  totalBudget: integer("total_budget").notNull().default(0),
  spentBudget: integer("spent_budget").notNull().default(0),
  status: varchar("status").notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusCheck: sql`CHECK (status IN ('active', 'paused', 'inactive'))`,
  budgetCheck: sql`CHECK (spent_budget <= total_budget)`,
}));

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  spentBudget: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Sponsor = typeof sponsors.$inferSelect;

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id),
  title: text("title").notNull(),
  description: text("description"),
  sponsorName: varchar("sponsor_name"),
  sponsorLogo: text("sponsor_logo"),
  gameId: varchar("game_id").references(() => games.id),
  requirementType: varchar("requirement_type").notNull(),
  requirementCount: integer("requirement_count").notNull(),
  bonusPoints: integer("bonus_points").notNull(),
  totalBudget: integer("total_budget").notNull(),
  pointsDistributed: integer("points_distributed").notNull().default(0),
  maxCompletions: integer("max_completions"),
  currentCompletions: integer("current_completions").notNull().default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  requirementTypeCheck: sql`CHECK (requirement_type IN ('match_wins', 'hours_played', 'rank_achieved', 'achievement_unlock'))`,
  budgetCheck: sql`CHECK (points_distributed <= total_budget)`,
  completionsCheck: sql`CHECK (current_completions <= COALESCE(max_completions, current_completions))`,
  positiveCountCheck: sql`CHECK (requirement_count > 0 AND bonus_points > 0 AND total_budget > 0)`,
}));

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  pointsDistributed: true,
  currentCompletions: true,
  createdAt: true,
  updatedAt: true,
});

export const challengeCompletions = pgTable("challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").notNull().default(0),
  completedAt: timestamp("completed_at"),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  pointsAwarded: integer("points_awarded").notNull(),
  transactionId: varchar("transaction_id").references(() => pointTransactions.id),
  fraudCheckPassed: boolean("fraud_check_passed").default(true),
  fraudReason: text("fraud_reason"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userChallengeUnique: sql`UNIQUE(user_id, challenge_id)`,
  progressCheck: sql`CHECK (progress >= 0)`,
  pointsAwardedCheck: sql`CHECK (points_awarded >= 0)`,
}));

export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions).omit({
  id: true,
  transactionId: true,
  fraudCheckPassed: true,
  fraudReason: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertChallengeCompletion = z.infer<typeof insertChallengeCompletionSchema>;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;

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

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  taskId: varchar("task_id").notNull(),
  taskLabel: text("task_label").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_checklist_date").on(table.date),
  sql`UNIQUE(date, task_id)`,
]);

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  adminEmail: varchar("admin_email").notNull(),
  action: varchar("action").notNull(),
  targetUserId: varchar("target_user_id").references(() => users.id),
  details: jsonb("details").notNull(),
  ipAddress: varchar("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [
  index("idx_audit_target").on(table.targetUserId),
  index("idx_audit_admin").on(table.adminUserId),
  index("idx_audit_timestamp").on(table.timestamp),
]);

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  timestamp: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

export const affiliateApplications = pgTable("affiliate_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  applicationData: jsonb("application_data").notNull(),
  commissionTier: varchar("commission_tier").default("standard"),
  monthlyEarnings: integer("monthly_earnings").default(0),
  totalEarnings: integer("total_earnings").default(0),
  payoutEmail: varchar("payout_email"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_affiliate_user").on(table.userId),
  index("idx_affiliate_status").on(table.status),
]);

export const insertAffiliateApplicationSchema = createInsertSchema(affiliateApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAffiliateApplication = z.infer<typeof insertAffiliateApplicationSchema>;
export type AffiliateApplication = typeof affiliateApplications.$inferSelect;

export const charities = pgTable("charities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  website: varchar("website"),
  logo: varchar("logo"),
  category: varchar("category").notNull(),
  impactMetric: varchar("impact_metric"),
  impactValue: varchar("impact_value"),
  totalDonated: integer("total_donated").default(0),
  featuredOrder: integer("featured_order"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCharitySchema = createInsertSchema(charities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCharity = z.infer<typeof insertCharitySchema>;
export type Charity = typeof charities.$inferSelect;

export const charityCampaigns = pgTable("charity_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  charityId: varchar("charity_id").notNull().references(() => charities.id),
  title: varchar("title").notNull(),
  description: text("description"),
  goalAmount: integer("goal_amount"),
  currentAmount: integer("current_amount").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_campaign_charity").on(table.charityId),
]);

export const insertCharityCampaignSchema = createInsertSchema(charityCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCharityCampaign = z.infer<typeof insertCharityCampaignSchema>;
export type CharityCampaign = typeof charityCampaigns.$inferSelect;

// ============================================================================
// Manual Fulfillment System + Founder Mission Control
// ============================================================================

export const rewardTypes = pgTable("reward_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // GIFT_CARD_AMAZON, GIFT_CARD_STEAM, GIFT_CARD_RIOT, GROCERIES_DELIVERY, CASH_APP, PAYPAL
  pointsCost: integer("points_cost").notNull(),
  realValue: integer("real_value").notNull(), // USD equivalent in cents
  category: varchar("category").notNull(), // "digital", "delivery", "cash"
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  fulfillmentType: varchar("fulfillment_type").notNull().default("manual"), // "manual" or "api" (future)
  externalProviderId: varchar("external_provider_id"), // Amazon, Blackhawk Network, etc (future APIs)
  externalSkuId: varchar("external_sku_id"), // Product SKU for API fulfillment
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_reward_types_active").on(table.isActive),
  index("idx_reward_types_type").on(table.type),
]);

export const rewardClaims = pgTable("reward_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardTypeId: varchar("reward_type_id").notNull().references(() => rewardTypes.id),
  status: varchar("status").notNull().default("pending"), // pending, in_progress, fulfilled, rejected
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  fulfillmentMethod: varchar("fulfillment_method"), // "email", "manual_code", "shipped", etc
  fulfillmentData: jsonb("fulfillment_data"), // Flexible storage: { "code": "...", "externalTransactionId": "...", etc }
  fulfillmentNotes: text("fulfillment_notes"), // Founder notes during fulfillment
  adminNotes: text("admin_notes"), // Internal notes about the claim
  pointsSpent: integer("points_spent").notNull(),
  userEmail: varchar("user_email"), // Denormalized for faster lookup
  userDisplayName: varchar("user_display_name"), // Denormalized for reports
  fulfilledBy: varchar("fulfilled_by").references(() => users.id), // Admin who fulfilled
  fulfilledAt: timestamp("fulfilled_at"),
  rejectedReason: text("rejected_reason"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_reward_claims_status").on(table.status),
  index("idx_reward_claims_user").on(table.userId),
  index("idx_reward_claims_claimed_at").on(table.claimedAt),
  index("idx_reward_claims_fulfilled_at").on(table.fulfilledAt),
]);

export const fulfillmentMetrics = pgTable("fulfillment_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  period: varchar("period").notNull(), // "2025-01-20" or "2025-W03"
  periodType: varchar("period_type").notNull(), // "daily", "weekly", "monthly"
  totalClaimsCreated: integer("total_claims_created").notNull().default(0),
  totalClaimsFulfilled: integer("total_claims_fulfilled").notNull().default(0),
  totalClaimsRejected: integer("total_claims_rejected").notNull().default(0),
  totalClaimsPending: integer("total_claims_pending").notNull().default(0),
  totalPointsSpent: integer("total_points_spent").notNull().default(0),
  totalUsdSpent: integer("total_usd_spent").notNull().default(0), // cents
  claimsByType: jsonb("claims_by_type"), // { "GIFT_CARD_AMAZON": 12, "CASH_APP": 5, ... }
  topStreamersByClaimsCount: jsonb("top_streamers_by_claims"), // [{ "streamerId": "...", "displayName": "...", "claimCount": 5 }, ...]
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  sql`UNIQUE(period, period_type)`,
  index("idx_fulfillment_metrics_period").on(table.period),
]);

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const insertRewardTypeSchema = createInsertSchema(rewardTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardClaimSchema = createInsertSchema(rewardClaims).omit({
  id: true,
  claimedAt: true,
  fulfilledAt: true,
  rejectedAt: true,
  updatedAt: true,
  fulfilledBy: true,
  rejectedBy: true,
});

export const updateRewardClaimSchema = z.object({
  status: z.enum(["pending", "in_progress", "fulfilled", "rejected"]),
  fulfillmentMethod: z.string().optional(),
  fulfillmentData: z.record(z.any()).optional(),
  fulfillmentNotes: z.string().optional(),
  rejectedReason: z.string().optional(),
});

export const insertFulfillmentMetricsSchema = createInsertSchema(fulfillmentMetrics).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type InsertRewardType = z.infer<typeof insertRewardTypeSchema>;
export type RewardType = typeof rewardTypes.$inferSelect;

export type InsertRewardClaim = z.infer<typeof insertRewardClaimSchema>;
export type RewardClaim = typeof rewardClaims.$inferSelect;
export type UpdateRewardClaim = z.infer<typeof updateRewardClaimSchema>;

export type InsertFulfillmentMetrics = z.infer<typeof insertFulfillmentMetricsSchema>;
export type FulfillmentMetrics = typeof fulfillmentMetrics.$inferSelect;

// ============================================================================
// VERIFICATION SYSTEM - Zod Schemas
// ============================================================================

export const insertVerificationProofSchema = createInsertSchema(verificationProofs).omit({
  id: true,
  createdAt: true,
  verifiedBy: true,
  verifiedAt: true,
});

export const insertFraudDetectionLogSchema = createInsertSchema(fraudDetectionLogs).omit({
  id: true,
  createdAt: true,
  reviewedBy: true,
  reviewedAt: true,
});

export const insertVerificationQueueSchema = createInsertSchema(verificationQueue).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  assignedAt: true,
});

// ============================================================================
// VERIFICATION SYSTEM - TypeScript Types
// ============================================================================

export type InsertVerificationProof = z.infer<typeof insertVerificationProofSchema>;
export type VerificationProof = typeof verificationProofs.$inferSelect;

export type InsertFraudDetectionLog = z.infer<typeof insertFraudDetectionLogSchema>;
export type FraudDetectionLog = typeof fraudDetectionLogs.$inferSelect;

export type InsertVerificationQueue = z.infer<typeof insertVerificationQueueSchema>;
export type VerificationQueue = typeof verificationQueue.$inferSelect;

// === LEVEL 12: ANTI-CHEAT LITE TABLES ===

export const antiCheatViolations = pgTable("anti_cheat_violations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  violationType: varchar("violation_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  evidence: jsonb("evidence"),
  fraudScoreImpact: integer("fraud_score_impact").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id)
});

export const rateLimitState = pgTable("rate_limit_state", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  xpSyncCount: integer("xp_sync_count").default(0),
  matchVerifyCount: integer("match_verify_count").default(0),
  lastXpSync: timestamp("last_xp_sync"),
  lastMatchVerify: timestamp("last_match_verify"),
  cooldownUntil: timestamp("cooldown_until"),
  windowStart: timestamp("window_start").defaultNow()
});

// === LEVEL 13: ANALYTICS TABLES ===

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow(),
  sessionId: varchar("session_id", { length: 255 })
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  pageViews: integer("page_views").default(0),
  actionsCount: integer("actions_count").default(0)
});

export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newUsers: integer("new_users").default(0),
  totalXP: integer("total_xp").default(0),
  avgXPPerUser: integer("avg_xp_per_user").default(0),
  fraudViolations: integer("fraud_violations").default(0)
});

export const conversionFunnels = pgTable("conversion_funnels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  signupDate: timestamp("signup_date").defaultNow(),
  firstXPDate: timestamp("first_xp_date"),
  firstReferralDate: timestamp("first_referral_date"),
  creatorTierDate: timestamp("creator_tier_date"),
  timeToFirstXP: integer("time_to_first_xp"), // in hours
  timeToFirstReferral: integer("time_to_first_referral"), // in hours
  timeToCreatorTier: integer("time_to_creator_tier") // in hours
});
