# Schema Changes Needed for Future Features

This document outlines database schema changes required for features that couldn't be implemented due to the "Do not modify shared/" preference.

## 1. Referral Program

**Required Tables:**

```typescript
// Add to shared/schema.ts

// Referral codes table
export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Referrals tracking table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  referralCodeId: varchar("referral_code_id").notNull().references(() => referralCodes.id),
  status: varchar("status").notNull().default("pending"), // pending, converted, rewarded
  conversionDate: timestamp("conversion_date"), // When referred user subscribed
  rewardAmount: integer("reward_amount").default(0), // Bonus points earned
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**Reward Structure:**
- Referrer earns 50 points when friend signs up (free tier)
- Referrer earns 200 points when friend subscribes ($5 tier)
- Referrer earns 500 points when friend subscribes ($10 tier)
- Friend gets 25 point signup bonus

**Implementation Steps:**
1. Add tables to shared/schema.ts
2. Run `npm run db:push --force` to sync schema
3. Add referral code generation to user registration
4. Create API endpoints:
   - GET /api/user/referral-code - Get user's referral code
   - GET /api/user/referrals - Get user's referral stats
   - POST /api/referrals/track - Track referral signup
5. Add referral parameter to signup URL: `/?ref=CODE`
6. Award points on subscription webhook event

## 2. Free Trial Tier

**Required Schema Changes:**

```typescript
// Add to subscriptions table in shared/schema.ts
export const subscriptions = pgTable("subscriptions", {
  // ... existing fields ...
  tier: varchar("tier").notNull().default("free"), // Add "free" as an option
  trialEndsAt: timestamp("trial_ends_at"), // When free trial expires
  limitedFeatures: boolean("limited_features").default(false), // Feature flags
});

// Free tier limits table
export const freeTrialLimits = pgTable("free_trial_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  maxPoints: integer("max_points").notNull().default(100), // Max 100 points on free tier
  matchesThisMonth: integer("matches_this_month").notNull().default(0),
  maxMatchesPerMonth: integer("max_matches_per_month").notNull().default(10),
  resetAt: timestamp("reset_at").notNull(), // Monthly reset
});
```

**Free Tier Limits:**
- Max 100 points total (can't accumulate more)
- Max 10 match wins tracked per month
- No reward redemption (must upgrade to redeem)
- Public profile enabled (for portfolio building)
- Can use referral system
- Can see leaderboards but not compete for top spots

**Implementation Steps:**
1. Add fields to subscriptions and create freeTrialLimits table
2. Run `npm run db:push --force`
3. Modify webhook endpoints to check tier limits
4. Add "Upgrade to Premium" CTAs throughout free experience
5. Create tier comparison page showing upgrade benefits
6. Update points engine to respect free tier caps

## 3. Username Field (for Better Profile URLs)

**Required Change:**

```typescript
// Add to users table in shared/schema.ts
export const users = pgTable("users", {
  // ... existing fields ...
  username: varchar("username", { length: 30 }).unique(), // Optional, auto-generated from email or custom
  usernameLastChanged: timestamp("username_last_changed"),
});
```

**Benefits:**
- Better URLs: `/profile/epicgamer123` vs `/profile/uuid-long-string`
- Shareable, memorable profile links
- SEO-friendly

**Implementation:**
1. Add username field (nullable initially)
2. Run `npm run db:push --force`
3. Generate usernames from email for existing users
4. Add username claim/edit UI
5. Update Profile route to accept username OR ID
6. Add validation (alphanumeric, 3-30 chars, no profanity)

## 4. Streaming Integration (Future Research)

**Requires:**
- Research Twitch API for stream status
- Research YouTube Live API
- Design bonus points for "Streaming GG Loop Gameplay"
- Consider privacy/verification requirements

**Potential Schema:**

```typescript
export const streamingAccounts = pgTable("streaming_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // twitch, youtube
  platformUserId: varchar("platform_user_id").notNull(),
  platformUsername: varchar("platform_username").notNull(),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
  lastStreamedAt: timestamp("last_streamed_at"),
}, (table) => ({
  userPlatformUnique: sql`UNIQUE(user_id, platform)`,
}));
```

## Priority Order

1. **Username field** - Small change, big UX improvement (DO THIS FIRST)
2. **Referral Program** - Viral growth mechanic, critical for launch
3. **Free Trial** - Removes barrier to entry, increases conversions
4. **Streaming Integration** - Long-term feature, requires extensive research

## Migration Safety

All these changes are **additive only** - they don't modify existing data structures or break existing functionality. Safe to implement by:

1. Make schema changes in shared/schema.ts
2. Run `npm run db:push --force` to sync
3. Existing data remains unchanged
4. New features work alongside existing features

**IMPORTANT:** Never change existing ID column types or remove columns. Always add new nullable columns.
