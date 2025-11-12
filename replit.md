# GG Loop - Gaming Rewards Platform

## Overview
GG Loop is a web platform designed to reward gamers with real-world value through a subscription-based model. It integrates a performance-based points economy, a tiered rewards catalog, leaderboards, and achievement tracking to boost engagement and recognize player skill. The platform's core vision is to transform gaming achievements into tangible rewards, providing a unique proposition for dedicated gamers and aspiring content creators.

The platform operates on a sustainable economic model with a 100:1 point-to-dollar conversion ratio. It offers Basic ($5/month), Pro ($12/month), and Elite ($25/month) subscription tiers, each with specific monthly earning caps, tier multipliers, and subscription bonuses to ensure profitability and provide value. The system is designed to allow users to generate a net profit from their gaming activities, addressing the pain points of "struggling streamers" who seek to monetize their passion.

## User Preferences
I prefer detailed explanations. I want iterative development. Ask before making major changes. Do not make changes to the `shared/` folder. Do not make changes to the file `design_guidelines.md`.

## System Architecture

### UI/UX Decisions
The platform features a complete UI redesign inspired by NBA Top Shot, incorporating premium collectible card layouts with rarity tiers (Common/Rare/Epic/Legendary). The color palette uses muted terracotta (#B8724D) and sage green (#5F6D4E), complemented by generous white space and sunset-inspired warm tones for a clean, modern aesthetic. Typography includes Inter for headings and JetBrains Mono for numbers and stats. The frontend is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

### Technical Implementations
The backend is powered by Express.js with TypeScript. Data persistence is handled by PostgreSQL (Neon) using Drizzle ORM. Authentication uses multi-provider OAuth with Discord, Twitch, and Google via Passport.js, alongside Replit Auth (OIDC). Stripe is integrated for subscription payment processing. TanStack Query v5 is utilized for state management. Automatic match synchronization via Riot API runs every 10 minutes for League of Legends and Valorant.

### Feature Specifications
*   **Multi-Provider Authentication**: Users can log in via Discord, Twitch, or Google OAuth. Unified login page (`/login`) presents all three options with consistent branding. Session management uses httpOnly/secure cookies with proper CSRF protection. User profiles are automatically created/updated on successful authentication.
*   **Automatic Riot Match Sync**: Background service runs every 10 minutes to sync League of Legends and Valorant matches via Riot API. Processes match outcomes (wins/losses) and automatically awards points to subscribers based on tier multipliers. Only same-day matches are eligible for point rewards. Matches are stored in `processedRiotMatches` table with deduplication to prevent double-counting.
*   **Performance Dashboard**: Dedicated stats page (`/stats`) displays user's match history, win/loss records, win rate percentage, and total points earned from synced Riot matches. Features real-time data fetching via `/api/riot/matches` endpoint. Shows linked Riot accounts for both League and Valorant with account verification status.
*   **Riot Account Linking**: Users can link League of Legends and/or Valorant accounts in Settings page using Riot ID (GameName#TagLine) and region selection. Backend validates accounts via Riot API and stores PUUID for match tracking. Supports both NA and EU regions.
*   **Subscription System**: Three tiers (Basic, Pro, Elite) with sustainable economics (100:1 point ratio, monthly earning caps, tier multipliers, subscription bonuses). Payments are processed via Stripe Checkout with webhook automation for point awards.
*   **Points Engine**: Defines rules for point acquisition (e.g., match wins, achievements, tournaments), enforces monthly and daily earning caps, and ensures transactional integrity with race-safe PostgreSQL advisory locks. Points expire after 12 months.
*   **Rewards Catalog**: Offers rewards priced at the 100:1 ratio, ranging from low-tier badges to high-value items like gift cards and gaming gear. Features automatic inventory management and transactional redemption processes.
*   **My Rewards System**: A dedicated section (`/my-rewards`) for users to view claimed rewards, fulfillment status, and tracking information. Displays reward images, points spent, and contextual guidance based on reward type.
*   **Gaming Webhook Integration**: Securely integrates with gaming platforms using HMAC-SHA256 validation for automatic point awards based on match wins, achievements, and tournament placements. Includes robust validation, error handling, and event deduplication.
*   **Trophy Case (Public Profiles)**: A premium collectible display system (`/profile/:username` or `/profile/:userId`) with an NBA Top Shot aesthetic, showcasing TrophyCards with rarity tiers, serial numbers, and achievement dates.
*   **Manual Match Reporting**: Simplified backup system (`/report-match`) allowing users to submit match wins manually. Screenshot upload functionality has been removed in favor of automatic Riot API sync. Manual submissions still trigger instant point awards and cache invalidation.
*   **Username System**: Supports custom usernames for improved profile URLs (`/profile/username`), implemented with a unique constraint in the database.
*   **Founder's Badge**: Automatically assigned to the first 100 users, providing a sequential badge number and bonus points, secured by PostgreSQL advisory locks.
*   **Recent Earnings**: A homepage activity feed displaying the last 5 match wins across all users in real-time.
*   **Sponsored Challenges**: Enables users to earn bonus points beyond monthly caps through brand-sponsored challenges. Features automatic progress tracking, claim flows, and race-safe completion tracking.
*   **Twitch Account Linking**: Secure OAuth integration allowing users to link Twitch accounts (Settings page). Features CSRF state validation, encrypted token storage via twitchAPI.encryptToken, and displays linked username as a purple badge on public profiles. Implements proper unlink functionality with database user resolution.

### System Design Choices
The database schema includes core tables for users, games, subscriptions, point transactions, rewards, achievements, leaderboards, and match submissions, with appropriate foreign keys and unique constraints. Key design principles include transactional safety for all point operations, idempotency for webhook events, comprehensive error handling, and real-time cache invalidation.

## External Dependencies
*   **Database**: PostgreSQL (Neon)
*   **ORM**: Drizzle ORM
*   **Authentication**: Passport.js (Discord, Twitch, Google OAuth), Replit Auth (OIDC)
*   **Payments**: Stripe (for subscription billing and webhooks)
*   **Gaming APIs**: Riot Games API (League of Legends, Valorant match data)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod

## Recent Changes (November 12, 2025 - 8:30 AM TikTok Launch)

### ✅ **CREDIBILITY FEATURES (November 12, 2025 - Pre-Launch)**
*   **Monthly Earnings Summary**: Stats page now shows a "Proof of Income" card displaying points earned this month, cash equivalent at 100:1 ratio, subscription cost, and net profit/loss. Always visible for linked accounts (even with $0 earnings). Negative net profit styled in amber with "$X from break-even" messaging for credibility with skeptical family/friends.
*   **Earnings Calculator**: Home page widget with interactive slider (0-20 wins/day, default 5) and tier selector showing projected monthly earnings. Displays breakdown: points per win, monthly wins, total points, subscription cost, net profit. Designed to help users demonstrate income potential to others.
*   **Footer Contact Update**: Changed support email from support@ggloop.io to info@ggloop.io
*   **Architect Review**: PASS ✓ - Fixed critical bug where Monthly Earnings Summary only showed with matches > 0. Now displays for all linked accounts with proper validation.

### ✅ **PRE-LAUNCH FIXES (Completed Overnight - Ready for Production)**
*   **Settings Navigation Fix**: Added Header component to Settings page - users can now navigate back to Home
*   **Riot Disconnect Bug Fix**: Corrected frontend disconnect endpoint from `/api/riot/unlink-account` to `/api/riot/:gameId/disconnect` to match backend routes
*   **Stats Page Enhancement**: Added real-time match sync progress indicator showing countdown to next Riot API sync (every 10 minutes) with visual progress bar
*   **Valorant Verification UX**: Improved instructions with blue info card and clearer steps for Player Title field
*   **Testing Completed**: Quick Start flow (valid/invalid Riot IDs, duplicate emails), navigation links, Riot linking/disconnect, subscription endpoints
*   **Architect Review**: PASS ✓ - No blocking defects, deployment ready for 8:30 AM launch

### ✅ **Earlier Today (November 12, 2025)**
*   Added controller favicon (replacing Replit icon)
*   Integrated Discord (https://discord.gg/rEXCFjJ4) and TikTok (@gg.loop) social links in footer
*   Added Header component to Referrals page for consistent navigation
*   Fixed TypeScript errors in Referrals.tsx with safe non-null assertions
*   Fixed Twitch OAuth callback URLs in Twitch Developer Console
*   Server restarted and verified running correctly

## Recent Changes (November 11, 2025)
*   ✅ Implemented multi-provider OAuth authentication (Discord, Twitch, Google)
*   ✅ Created unified login page with all authentication options
*   ✅ Built automatic Riot API match sync service (10-minute intervals)
*   ✅ Added Performance Dashboard (`/stats`) with match history and statistics
*   ✅ Removed screenshot upload feature from manual match reporting
*   ✅ Updated header navigation to prioritize automated stats tracking
*   ✅ Fixed subscription trial endpoint bug (referral → referrals)
*   ✅ All changes reviewed and approved by architect with no blocking defects