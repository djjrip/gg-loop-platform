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
*   **Multi-Provider Authentication**: Users can log in via Discord, Twitch, or Google OAuth.
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
*   **Authentication**: Passport.js (Discord, Twitch, Google OAuth), Replit Auth (OIDC)
*   **Payments**: Stripe
*   **Reward Fulfillment**: Tango Card API (planned integration for gift card delivery)
*   **Gaming APIs**: Riot Games API (League of Legends, Valorant)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod