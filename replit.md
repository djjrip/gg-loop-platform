# GG Loop - Gaming Membership Rewards Platform

## ⚠️ URGENT REMINDERS
- **RIOT_API_KEY expires Friday, Nov 14th 2025 @ 11:37 AM PT** - Renew at https://developer.riotgames.com/ before expiration!

## Recent Changes (November 2025)
- **Beta Launch Preparation Complete**: Platform ready for soft launch with 10-20 beta testers
- **Manual Fulfillment System**: Admin dashboard for managing reward redemptions (digital gift cards and physical shipments)
- **New Member Onboarding**: Interactive welcome modal with guided tour explaining platform features, tiers, and rewards
- **Beta Tester Invitation**: Production-ready invitation template with realistic 48-72 hour fulfillment SLA
- **Transaction Safety**: Implemented atomic rollback for failed redemptions with proper refund mechanism
- **Admin Security**: Multi-layer access control with client-side redirects and server-side adminMiddleware

## Overview
GG Loop is a tiered membership program for gamers that provides fixed monthly point allocations redeemable for gaming gear, peripherals, and subscriptions. The platform integrates match stats tracking, leaderboards, achievement displays, and sponsored challenge bonuses to boost community engagement and recognize player dedication. The core vision is to transform gaming passion into tangible membership perks, providing a unique loyalty program for dedicated gamers and aspiring content creators.

The platform operates on a sustainable membership model with three subscription tiers: Basic ($5/month with 3,000 monthly points), Pro ($12/month with 10,000 monthly points), and Elite ($25/month with 25,000 monthly points). Points are allocated automatically each billing cycle and can be redeemed for rewards from the catalog. Optional sponsored challenges provide capped bonus points beyond the monthly allocation. Points are membership perks - not cash equivalents - and expire after 12 months to maintain program sustainability.

## User Preferences
I prefer detailed explanations. I want iterative development. Ask before making major changes. Do not make changes to the `shared/` folder. Do not make changes to the file `design_guidelines.md`.

## System Architecture

### UI/UX Decisions
The platform features a complete UI redesign inspired by NBA Top Shot, incorporating premium collectible card layouts with rarity tiers (Common/Rare/Epic/Legendary). The color palette uses muted terracotta (#B8724D) and sage green (#5F6D4E), complemented by generous white space and sunset-inspired warm tones for a clean, modern aesthetic. Typography includes Inter for headings and JetBrains Mono for numbers and stats. The frontend is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

### Technical Implementations
The backend is powered by Express.js with TypeScript. Data persistence is handled by PostgreSQL (Neon) using Drizzle ORM. Authentication uses multi-provider OAuth with Discord, Twitch, and Google via Passport.js, alongside Replit Auth (OIDC). Stripe is integrated for subscription payment processing. TanStack Query v5 is utilized for state management. Automatic match synchronization via Riot API runs every 10 minutes for League of Legends and Valorant.

### Feature Specifications
*   **Multi-Provider Authentication**: Users can log in via Discord, Twitch, Google, or TikTok OAuth.
*   **Automatic Riot Match Sync**: Background service runs every 10 minutes to sync League of Legends and Valorant matches for stats tracking.
*   **Performance Dashboard**: Dedicated stats page displays user's match history, win/loss records, win rate, and total points earned from synced Riot matches.
*   **Riot Account Linking**: Users can link League of Legends and/or Valorant accounts in Settings page.
*   **Subscription System**: Three membership tiers with fixed monthly point allocations processed via Stripe Checkout.
*   **Points Engine**: Manages point allocation and redemption with transactional integrity. All points expire after 12 months.
*   **Rewards Catalog**: Offers rewards priced in points with automatic inventory management and transactional redemption.
*   **My Rewards System**: A dedicated section for users to view claimed rewards, fulfillment status, and tracking information.
*   **Manual Reward Fulfillment**: Admin dashboard for processing redemptions with 48-72 hour turnaround. Supports digital gift card codes and physical shipment tracking.
*   **New Member Onboarding**: Interactive welcome modal with guided tour for first-time users explaining tiers, rewards, and platform features.
*   **Admin Fulfillment Dashboard**: Secure admin-only interface at /admin/fulfillment for managing pending and fulfilled redemptions with comprehensive test coverage.
*   **Gaming Webhook Integration**: Securely integrates with gaming platforms using HMAC-SHA256 validation for automatic point awards based on match wins, achievements, and tournament placements.
*   **Trophy Case (Public Profiles)**: A premium collectible display system showcasing TrophyCards with rarity tiers and achievement dates.
*   **Manual Match Reporting**: Allows users to report match results for stats tracking accuracy.
*   **Username System**: Supports custom usernames for improved profile URLs.
*   **Founder's Badge**: Automatically assigned to the first 100 users, providing a sequential badge number and bonus points.
*   **Recent Activity**: A homepage activity feed displaying the last 5 match wins across all users.
*   **Sponsored Challenges**: Enables users to unlock capped bonus points beyond monthly tier allocations through brand-sponsored challenges.
*   **Twitch Account Linking**: Secure OAuth integration allowing users to link Twitch accounts.
*   **Affiliate Outreach Program**: Dedicated portal for applying to become a GG Loop affiliate with automatic email notifications.

### System Design Choices
The database schema includes core tables for users, games, subscriptions, point transactions, rewards, achievements, leaderboards, and match submissions. Key design principles include transactional safety for all point operations, idempotency for webhook events, comprehensive error handling, and real-time cache invalidation.

## External Dependencies
*   **Database**: PostgreSQL (Neon)
*   **ORM**: Drizzle ORM
*   **Authentication**: Passport.js (Discord, Twitch, Google, TikTok OAuth), Replit Auth (OIDC)
*   **Payments**: Stripe
*   **Reward Fulfillment**: Example partners (Tremendous) — Tango Card previously considered; not active. Gift-card fulfillment is a future integration.
*   **Gaming APIs**: Riot Games API (League of Legends, Valorant)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod

## Setup Instructions

### TikTok Login Kit OAuth Setup

**Purpose**: Enable users to log in to GG Loop using their TikTok accounts.

**⚠️ Important**: TikTok Login Kit requires app approval before it works in production. The entire process takes 5-7 business days.

#### Step 1: Create TikTok Developer Account
1. Visit https://developers.tiktok.com/
2. Sign in with your TikTok account
3. Complete developer registration

#### Step 2: Create a New App
1. Go to **Manage Apps** in the developer portal
2. Click **Create App**
3. Fill in required details:
   - **App Name**: GG Loop
   - **App Category**: Gaming & Entertainment
   - **App Description**: Gaming membership rewards platform with tiered subscriptions, points redemption, and match stats tracking
   - **App Icon**: Upload GG Loop logo (512x512px minimum)

#### Step 3: Add Login Kit Product
1. In your app dashboard, click **Add Products**
2. Select **Login Kit**
3. Configure Login Kit settings:
   - **Redirect URIs**: Add these URLs (one per line):
     - Production: `https://ggloop.io/api/auth/tiktok/callback`
     - Development: `https://YOUR_REPL_URL.replit.dev/api/auth/tiktok/callback`
   - **Terms of Service URL**: `https://ggloop.io/terms`
   - **Privacy Policy URL**: `https://ggloop.io/privacy`

#### Step 4: Get API Credentials
1. Navigate to **Manage Apps** → Select your app
2. Copy your credentials:
   - **Client Key** (this is your CLIENT_ID)
   - **Client Secret** (keep this secure!)

#### Step 5: Add Environment Secrets in Replit
1. In Replit, go to **Tools** → **Secrets**
2. Add these secrets:
   ```
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   ```

#### Step 6: Submit for Review
1. In TikTok Developer Portal, click **Submit for Review**
2. Wait 1-3 business days for approval
3. You'll receive an email when approved

**⚠️ Before Approval**: TikTok OAuth will redirect to an error page. After approval, it will work seamlessly.

**Scopes Requested**: `user.info.basic` (display name, avatar, open_id)

**Note**: TikTok Login Kit does NOT provide user email addresses. We generate virtual emails in the format: `{open_id}@tiktok.ggloop.io`

---

### TikTok Integration Opportunities

**Current Implementation**: TikTok Login Kit (OAuth authentication)

**Future Opportunities**:
1. **TikTok Gaming Partnership Program**: Apply at https://cp-game.tiktok.com/ for official collaborations
2. **BytePlus Creator Rewards**: Explore partnership with BytePlus (TikTok's tech division) for creator reward systems
3. **Share Kit**: Enable members to share GG Loop rewards/achievements to TikTok (future enhancement)
4. **Content Posting API**: Auto-post weekly leaderboards to founder's TikTok (@jaysonbq) (future enhancement)

**⚠️ TikTok Live API Limitation**: TikTok does NOT offer an official public API for:
- Live stream events (gifts, comments, follows)
- Custom point/reward systems for viewers
- Automated point earning based on live engagement

**Unofficial libraries exist** (tiktok-live-connector) but violate TikTok ToS and are not production-ready. For scalable point earning through live streaming, consider **Twitch API** (already integrated) or **YouTube Live API** as alternatives.