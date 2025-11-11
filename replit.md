# GG Loop - Gaming Rewards Platform

## Overview
GG Loop is a web platform that enables gamers to earn real-world rewards through a subscription model. It features a performance-based points economy, a tiered rewards catalog, leaderboards, and achievement tracking to incentivize engagement and reward player skill. The platform aims to bridge the gap between gaming achievements and tangible value, offering a unique value proposition for dedicated gamers.

## Target User Persona
**"The Struggling Streamer" - Core User Profile:**
- **Demographics**: 18-30 years old, passionate gamer, aspiring content creator
- **Pain Points**: 
  - Streams to 5-50 viewers, minimal Twitch revenue
  - Spends $50-100/month on gaming subscriptions/items, gets no financial return
  - Wants to build gaming career but needs income to justify time investment
  - Lacks credibility/portfolio to attract sponsors or brand deals
- **What They Need From GG Loop**:
  - Immediate monetary value from gaming (even small amounts validate their passion)
  - Public profile to showcase skills and build credibility
  - Easy sharing of achievements to grow social media presence
  - Referral income to build community around their brand
  - Low barrier to entry (free trial, then $5/month)
  - Path to sponsorships and brand partnerships as they grow
- **Success Metrics**: Turn $5/month subscription into $30-45/month in rewards = net profit while gaming

## User Preferences
I prefer detailed explanations. I want iterative development. Ask before making major changes. Do not make changes to the `shared/` folder. Do not make changes to the file `design_guidelines.md`.

## System Architecture

### UI/UX Decisions
**November 2025 Update**: Complete UI redesign to NBA Top Shot aesthetic with premium collectible card layouts, rarity tiers (Common/Rare/Epic/Legendary), muted terracotta (#B8724D) and sage green (#5F6D4E) color palette, generous white space, and sunset-inspired warm tones. The platform now features a clean, modern design inspired by premium collectibles rather than underground gaming. Typography includes Inter for headings and JetBrains Mono for numbers and stats. The frontend is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

### Technical Implementations
The backend uses Express.js with TypeScript. PostgreSQL (Neon) with Drizzle ORM handles data persistence. Authentication is managed via Replit Auth (OIDC), and Stripe is integrated for subscription payments. TanStack Query v5 is used for state management.

### Feature Specifications
*   **Subscription System**: Offers a Basic tier ($5/month) with a 10:1 points-to-value ratio (10 points = $1 reward value). Includes base and performance-based monthly points. Payments are processed via Stripe Checkout, with webhooks automating point awards.
*   **Points Engine**: Defines rules for earning points (e.g., subscription, match wins, achievements, daily challenges, tournament placements). Points expire after 12 months, and daily caps are enforced for certain activities. All point operations ensure transactional integrity.
*   **Rewards Catalog**: Structured into four tiers (100-350, 400-800, 1200-3000, 5000+ points) offering diverse rewards from gift cards to elite items. Includes automatic inventory management and transactional redemption processes.
*   **Gaming Webhook Integration**: Securely integrates with gaming platforms using HMAC-SHA256 signature validation. Endpoints for match wins, achievements, and tournament placements automatically award points. Includes robust validation, error handling, and event deduplication to prevent fraudulent or duplicate point awards. API partners are managed with hashed secrets and active status checks.
*   **TikTok Content Generator**: Static template library with 12 viral script templates for marketing GG Loop on TikTok. Includes hooks, body copy, CTAs, hashtags, pro tips, and trending sounds guidance. Zero automation - manual copy/paste workflow.
*   **Trophy Case (Public Profiles)**: ✅ LIVE - Premium collectible display system with NBA Top Shot aesthetic. Features TrophyCard component with rarity tiers (Common/Rare/Epic/Legendary), serial numbers, achievement dates, and responsive grid layout. Profile page at `/profile/:username` or `/profile/:userId` shows user stats, trophy collection, and gaming activity.
*   **Manual Match Reporting**: ✅ LIVE - Self-service match win submission system at `/report-match`. Users select game, match type (Competitive/Ranked/Tournament), add notes, and receive instant point awards. Implements JSON API, auto-approval flow, real-time cache invalidation for immediate header point updates. Includes submission history with status tracking. Database table: `match_submissions`.
*   **Username System**: ✅ LIVE - Custom username support for better profile URLs. Users can be accessed via `/profile/username` in addition to UUID. Database schema includes `username` field with unique constraint.
*   **Founder's Badge**: ✅ LIVE - Automatic founder status for first 100 users. Race-safe assignment via PostgreSQL advisory locks (lock ID 1001), sequential numbering (#1-#100), +500 bonus points per founder. UNIQUE index prevents duplicates. Visible on profiles with gold gradient badge. Database fields: `is_founder`, `founder_number`.
*   **Recent Earnings**: ✅ LIVE - Homepage activity feed showing last 5 match wins across all users with game name, points earned, and relative timestamps ("2 hours ago"). Updates in real-time as new matches are reported.

### Planned Features (Next Up)
*   **Screenshot Upload for Match Wins**: Add image upload capability to match submission flow with storage integration
*   **Referral Program**: Viral growth system where users earn bonus points for bringing friends to the platform
*   **Free Trial Tier**: Limited free tier to let gamers try the platform before subscribing, removing barrier to entry
*   **Social Sharing**: One-click share achievements and milestones to Twitter/TikTok for free marketing and social proof
*   **Business Dashboard Enhancement**: Connect to real database metrics for live launch readiness tracking
*   **SMS Milestone Alerts**: Text notifications for business milestones (first signup, revenue goals, user counts) via Twilio integration
*   **Real-Time Notifications**: WebSocket integration for instant point updates and achievement notifications

### System Design Choices
The database schema includes core tables for users (with username and founder support), games, subscriptions, point transactions, rewards, achievements, leaderboard entries, and match submissions, with appropriate foreign keys and unique constraints for data integrity and performance. Key implementation details include transactional safety for all point operations (including founder assignment with advisory locks), idempotency for webhook events and point awards, comprehensive error handling, and real-time cache invalidation for instant UI updates.

### Documentation Files
*   **KICKSTARTER_STRATEGY.md**: Complete campaign guide with budget ($25K-$50K), reward tiers ($10-$250), marketing timeline, and launch strategy
*   **DISCORD_PITCH.md**: Step-by-step guide for pitching to Riot Games Developer Relations community

### Recent Changes (November 11, 2025)
*   **Riot Account Linking (In Progress)**: Built secure 2-step verification system for League of Legends. Users enter Riot ID → get verification code → enter in League client → account verified. Backend uses Riot's official third-party code API for ownership proof. Session-based with 10-minute expiration. Settings page UI complete with region selector, copy-to-clipboard, step-by-step instructions.
*   **Security Fixes**: Fixed critical vulnerability where anyone could claim any Riot account. Now requires proof of ownership via in-game verification code.
*   **Blockers Discovered**: Valorant verification won't work (Riot doesn't provide third-party code API for Valorant). Missing rate limiting on verification endpoints (security risk). Valorant card needs to be removed before launch.
*   **Next Steps**: Remove Valorant card, add rate limiting to protect API key, test League linking end-to-end, then ship automatic verified match wins for League players.

### Recent Changes (November 10, 2025)
*   **Recent Earnings Feed**: Homepage now displays real-time activity feed showing last 5 match wins across all users with game name, points earned, and time-ago display
*   **Founder's Badge System**: ✅ LIVE & PRODUCTION-READY - First 100 users automatically receive founder status with sequential badge numbers (#1-#100) and +500 bonus points. Features race-safe assignment using PostgreSQL advisory locks (pg_advisory_xact_lock), transactional integrity, and UNIQUE index safeguard. All 15 existing users awarded founder status (#1-#15)
*   **Kickstarter Strategy**: Created comprehensive campaign documentation (KICKSTARTER_STRATEGY.md) with $25K-$50K goal, reward tiers, marketing timeline, and February 2025 launch plan
*   **Discord Pitch Guide**: Created step-by-step guide (DISCORD_PITCH.md) for applying to Riot Games Developer Relations community with prototype requirements and messaging strategy

### Recent Changes (November 9, 2025)
*   **Trophy Case UI**: Complete redesign with NBA Top Shot-inspired collectible cards, rarity tier system, serial numbers, and premium aesthetic
*   **Manual Match Reporting**: Production-ready self-service match win submission with instant point awards and real-time UI updates
*   **Username System**: Added username field to users table with dual lookup support (UUID or username) for better profile URLs
*   **Navigation**: Added prominent "Report Win" link in header for easy access to match submission
*   **Bug Fixes**: Fixed match submission FormData → JSON conversion, auth cache invalidation, UX messaging to reflect instant approval

## External Dependencies
*   **Database**: PostgreSQL (via Neon)
*   **ORM**: Drizzle ORM
*   **Authentication**: Replit Auth (OIDC)
*   **Payments**: Stripe (for subscription billing and webhooks)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod (for schema validation)