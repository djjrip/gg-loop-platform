import { sql } from "drizzle-orm";
import { text, integer, index } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, varchar, integer as pgInt, timestamp, boolean, index as pgIndex, jsonb } from "drizzle-orm/pg-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Detect which database we're using
const usePostgres = process.env.DATABASE_URL?.includes('postgres') || process.env.NODE_ENV === 'production';

// Helper for UUID generation
const uuid = () => crypto.randomUUID();

// Create table function based on environment
const createTable = usePostgres ? pgTable : sqliteTable;
const textType = usePostgres ? varchar : text;
const intType = usePostgres ? pgInt : integer;
const timestampType = usePostgres
    ? (name: string) => timestamp(name)
    : (name: string) => integer(name, { mode: "timestamp" });
const boolType = usePostgres
    ? (name: string) => boolean(name)
    : (name: string) => integer(name, { mode: "boolean" });
const jsonType = usePostgres
    ? (name: string) => jsonb(name)
    : (name: string) => text(name, { mode: "json" });

// Sessions table
export const sessions = usePostgres
    ? pgTable(
        "sessions",
        {
            sid: varchar("sid").primaryKey(),
            sess: jsonb("sess").notNull(),
            expire: timestamp("expire").notNull(),
        },
        (table) => ({
            expireIdx: pgIndex("IDX_session_expire").on(table.expire),
        })
    )
    : sqliteTable(
        "sessions",
        {
            sid: text("sid").primaryKey(),
            sess: text("sess", { mode: "json" }).notNull(),
            expire: integer("expire", { mode: "timestamp" }).notNull(),
        },
        (table) => ({
            expireIdx: index("IDX_session_expire").on(table.expire),
        })
    );

// For the rest of the tables, I'll create a PostgreSQL version since that's what Railway needs
// The SQLite version you already have will work locally

export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    oidcSub: varchar("oidc_sub").unique(),
    username: varchar("username").unique(),
    email: varchar("email").unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    totalPoints: pgInt("total_points").notNull().default(0),
    ggCoins: pgInt("gg_coins").notNull().default(0),
    primaryGame: varchar("primary_game"),
    gamesConnected: pgInt("games_connected").notNull().default(0),
    stripeCustomerId: varchar("stripe_customer_id").unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
    twitchId: varchar("twitch_id").unique(),
    twitchUsername: varchar("twitch_username"),
    twitchAccessToken: pgText("twitch_access_token"),
    twitchRefreshToken: pgText("twitch_refresh_token"),
    twitchConnectedAt: timestamp("twitch_connected_at"),
    tiktokOpenId: varchar("tiktok_open_id").unique(),
    tiktokUnionId: varchar("tiktok_union_id"),
    tiktokUsername: varchar("tiktok_username"),
    tiktokAccessToken: pgText("tiktok_access_token"),
    tiktokRefreshToken: pgText("tiktok_refresh_token"),
    tiktokConnectedAt: timestamp("tiktok_connected_at"),
    shippingAddress: pgText("shipping_address"),
    shippingCity: varchar("shipping_city"),
    shippingState: varchar("shipping_state"),
    shippingZip: varchar("shipping_zip"),
    shippingCountry: varchar("shipping_country").default("US"),
    referralCode: varchar("referral_code", { length: 10 }).unique(),
    referredBy: varchar("referred_by").references((): any => users.id),
    isFounder: boolean("is_founder").notNull().default(false),
    founderNumber: pgInt("founder_number"),
    freeTrialStartedAt: timestamp("free_trial_started_at"),
    freeTrialEndsAt: timestamp("free_trial_ends_at"),
    lastLoginAt: timestamp("last_login_at"),
    loginStreak: pgInt("login_streak").notNull().default(0),
    longestStreak: pgInt("longest_streak").notNull().default(0),
    xpLevel: pgInt("xp_level").notNull().default(1),
    xpPoints: pgInt("xp_points").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    founderNumberUnique: sql`UNIQUE(founder_number) WHERE founder_number IS NOT NULL`,
}));

// I'll create a script that generates the full PostgreSQL schema
// This is getting complex - let me create a simpler solution
