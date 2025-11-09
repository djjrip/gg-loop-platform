# GG Loop - Gaming Rewards Platform

## Overview
GG Loop is a web platform that enables gamers to earn real-world rewards through a subscription model. It features a performance-based points economy, a tiered rewards catalog, leaderboards, and achievement tracking to incentivize engagement and reward player skill. The platform aims to bridge the gap between gaming achievements and tangible value, offering a unique value proposition for dedicated gamers.

## User Preferences
I prefer detailed explanations. I want iterative development. Ask before making major changes. Do not make changes to the `shared/` folder. Do not make changes to the file `design_guidelines.md`.

## System Architecture

### UI/UX Decisions
The platform features a dark, "underground" aesthetic inspired by gaming culture, using orange accents (`#FF6600`) on dark backgrounds. Typography includes Inter for headings and JetBrains Mono for numbers and stats, aligning with a gaming-focused, Discord/Twitch-inspired interface. The frontend is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

### Technical Implementations
The backend uses Express.js with TypeScript. PostgreSQL (Neon) with Drizzle ORM handles data persistence. Authentication is managed via Replit Auth (OIDC), and Stripe is integrated for subscription payments. TanStack Query v5 is used for state management.

### Feature Specifications
*   **Subscription System**: Offers a Basic tier ($5/month) with a 10:1 points-to-value ratio (10 points = $1 reward value). Includes base and performance-based monthly points. Payments are processed via Stripe Checkout, with webhooks automating point awards.
*   **Points Engine**: Defines rules for earning points (e.g., subscription, match wins, achievements, daily challenges, tournament placements). Points expire after 12 months, and daily caps are enforced for certain activities. All point operations ensure transactional integrity.
*   **Rewards Catalog**: Structured into four tiers (100-350, 400-800, 1200-3000, 5000+ points) offering diverse rewards from gift cards to elite items. Includes automatic inventory management and transactional redemption processes.
*   **Gaming Webhook Integration**: Securely integrates with gaming platforms using HMAC-SHA256 signature validation. Endpoints for match wins, achievements, and tournament placements automatically award points. Includes robust validation, error handling, and event deduplication to prevent fraudulent or duplicate point awards. API partners are managed with hashed secrets and active status checks.

### System Design Choices
The database schema includes core tables for users, games, subscriptions, point transactions, rewards, achievements, and leaderboard entries, with appropriate foreign keys and unique constraints for data integrity and performance. Key implementation details include transactional safety for all point operations, idempotency for webhook events and point awards, and comprehensive error handling.

## External Dependencies
*   **Database**: PostgreSQL (via Neon)
*   **ORM**: Drizzle ORM
*   **Authentication**: Replit Auth (OIDC)
*   **Payments**: Stripe (for subscription billing and webhooks)
*   **Frontend Libraries**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5
*   **Backend Framework**: Express.js
*   **Validation**: Zod (for schema validation)