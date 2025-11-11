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
The backend is powered by Express.js with TypeScript. Data persistence is handled by PostgreSQL (Neon) using Drizzle ORM. Authentication is managed via Replit Auth (OIDC), and Stripe is integrated for subscription payment processing. TanStack Query v5 is utilized for state management.

### Feature Specifications
*   **Subscription System**: Three tiers (Basic, Pro, Elite) with sustainable economics (100:1 point ratio, monthly earning caps, tier multipliers, subscription bonuses). Payments are processed via Stripe Checkout with webhook automation for point awards.
*   **Points Engine**: Defines rules for point acquisition (e.g., match wins, achievements, tournaments), enforces monthly and daily earning caps, and ensures transactional integrity with race-safe PostgreSQL advisory locks. Points expire after 12 months.
*   **Rewards Catalog**: Offers rewards priced at the 100:1 ratio, ranging from low-tier badges to high-value items like gift cards and gaming gear. Features automatic inventory management and transactional redemption processes.
*   **My Rewards System**: A dedicated section (`/my-rewards`) for users to view claimed rewards, fulfillment status, and tracking information. Displays reward images, points spent, and contextual guidance based on reward type.
*   **Gaming Webhook Integration**: Securely integrates with gaming platforms using HMAC-SHA256 validation for automatic point awards based on match wins, achievements, and tournament placements. Includes robust validation, error handling, and event deduplication.
*   **Trophy Case (Public Profiles)**: A premium collectible display system (`/profile/:username` or `/profile/:userId`) with an NBA Top Shot aesthetic, showcasing TrophyCards with rarity tiers, serial numbers, and achievement dates.
*   **Manual Match Reporting**: A self-service system (`/report-match`) allowing users to submit match wins, receive instant point awards, and view submission history. Implements JSON API and real-time cache invalidation.
*   **Username System**: Supports custom usernames for improved profile URLs (`/profile/username`), implemented with a unique constraint in the database.
*   **Founder's Badge**: Automatically assigned to the first 100 users, providing a sequential badge number and bonus points, secured by PostgreSQL advisory locks.
*   **Recent Earnings**: A homepage activity feed displaying the last 5 match wins across all users in real-time.
*   **Sponsored Challenges**: Enables users to earn bonus points beyond monthly caps through brand-sponsored challenges. Features automatic progress tracking, claim flows, and race-safe completion tracking.

### System Design Choices
The database schema includes core tables for users, games, subscriptions, point transactions, rewards, achievements, leaderboards, and match submissions, with appropriate foreign keys and unique constraints. Key design principles include transactional safety for all point operations, idempotency for webhook events, comprehensive error handling, and real-time cache invalidation.

## External Dependencies
*   **Database**: PostgreSQL (Neon)
*   **ORM**: Drizzle ORM
*   **Authentication**: Replit Auth (OIDC)
*   **Payments**: Stripe (for subscription billing and webhooks)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod