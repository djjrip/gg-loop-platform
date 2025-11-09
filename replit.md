# GG Loop - Gaming Rewards Platform

## Project Overview
GG Loop is a web platform where gamers earn real-world rewards through a $5/month subscription model. The platform features performance-based point earning, tiered rewards catalog, leaderboards, and achievement tracking.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OIDC)
- **Payments**: Stripe (subscription billing)
- **State Management**: TanStack Query v5

## Design System
- **Theme**: Dark underground aesthetic
- **Primary Color**: Orange (#FF6600) accents on near-black backgrounds
- **Typography**: 
  - Headings: Inter (600, 700, 800 weights)
  - Numbers/Stats: JetBrains Mono
- **Style**: Gaming-focused with Discord/Twitch-inspired UI patterns

## Core Features

### Subscription System
- **Tiers**: Basic ($5/month), Premium ($10/month - not yet implemented)
- **Points Economy**: 10:1 ratio (10 points = $1 in reward value)
- **Monthly Points**: 
  - Basic: 150 base points + 150-300 performance points = 300-450 total
  - Premium: 300 base points + performance multipliers
- **Payment**: Stripe Checkout integration
- **Webhooks**: Automated point awarding on successful payments

### Points Engine
- **Earning Rules**: Defined in `server/pointsEngine.ts`
  - SUBSCRIPTION_MONTHLY: 150-300 points based on tier
  - MATCH_WIN: 10 points with tier multipliers
  - ACHIEVEMENT: Varies by achievement
  - DAILY_CHALLENGE: 5 points (50/day cap)
  - TOURNAMENT_PLACEMENT: 25-100 points
- **Expiration**: Points expire after 12 months
- **Daily Caps**: Enforced for certain earning types
- **Transaction Integrity**: All point operations use database transactions

### Rewards Catalog
- **Tier 1**: 100-350 points ($10-$35 value) - Gift cards, digital content
- **Tier 2**: 400-800 points ($40-$80 value) - Premium items
- **Tier 3**: 1200-3000 points ($120-$300 value) - High-value rewards
- **Tier 4**: 5000+ points ($500+ value) - Elite rewards
- **Stock Management**: Automatic inventory tracking
- **Redemption**: Transactional with stock locking

## Database Schema

### Core Tables
- **users**: User profiles with points balance, Stripe customer IDs
- **games**: Supported games catalog
- **user_games**: Connected gaming accounts
- **subscriptions**: Active subscription records with Stripe IDs
- **subscription_events**: Webhook event log for idempotency
- **point_transactions**: Complete ledger with balance snapshots
- **rewards**: Rewards catalog with stock management
- **user_rewards**: Redemption history
- **achievements**: User achievement records
- **leaderboard_entries**: Performance rankings

### Key Constraints
- `point_transactions`: UNIQUE(user_id, source_type, source_id) - prevents duplicate awards
- `subscription_events`: UNIQUE(stripe_event_id) - webhook idempotency
- All foreign keys properly indexed for performance

## API Routes

### Authentication
- `GET /api/auth/user` - Get current authenticated user

### Subscription
- `POST /api/create-checkout-session` - Create Stripe checkout (requires auth)
- `GET /api/subscription/status` - Get subscription status (requires auth)
- `POST /api/subscription/cancel` - Cancel at period end (requires auth)
- `POST /api/webhooks/stripe` - Stripe webhook handler (public, signature verified)

### Points
- `GET /api/points/balance` - Get effective points balance (requires auth)
- `GET /api/points/transactions` - Get transaction history (requires auth)

### Rewards
- `GET /api/rewards` - List available rewards
- `GET /api/user/rewards` - Get user's redemptions (requires auth)
- `POST /api/user/rewards/redeem` - Redeem reward (requires auth)

### Games & Leaderboards
- `GET /api/games` - List supported games
- `GET /api/games/:id` - Get game details
- `GET /api/user/games` - Get connected games (requires auth)
- `POST /api/user/games` - Connect game account (requires auth)
- `GET /api/leaderboard/:gameId/:period` - Get leaderboard
- `GET /api/user/achievements` - Get achievements (requires auth)

## Stripe Integration

### Environment Variables Required
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret
- `STRIPE_BASIC_PRICE_ID` - Price ID for basic tier
- `STRIPE_PREMIUM_PRICE_ID` - Price ID for premium tier (optional)
- `VITE_STRIPE_PUBLIC_KEY` - Public key for frontend

### Webhook Events Handled
- `customer.subscription.created` - Create subscription record
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Mark as canceled
- `invoice.payment_succeeded` - Award monthly points
- `invoice.payment_failed` - Mark subscription as past_due

### Security Features
- Webhook signature verification
- Idempotency via `subscription_events` table
- Metadata propagation (userId, tier) to subscriptions
- Customer ID reuse for returning users

## Development

### Running Locally
The "Start application" workflow runs:
```bash
npm run dev
```
This starts both Express backend and Vite frontend on the same port (5000).

### Database Operations
```bash
npm run db:push        # Sync schema to database
npm run db:studio      # Open Drizzle Studio GUI
```

### Testing Subscriptions
1. Set up Stripe keys in environment
2. Create test products/prices in Stripe Dashboard
3. Use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Test checkout flow with test card: 4242 4242 4242 4242

## Project Structure
```
├── client/              # Frontend React app
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components (wouter routing)
│       ├── lib/         # Query client, utilities
│       └── App.tsx      # Root component
├── server/              # Backend Express app
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database abstraction layer
│   ├── pointsEngine.ts  # Points earning/spending logic
│   ├── replitAuth.ts    # Authentication setup
│   └── seed.ts          # Database seeding
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema + Zod validation
└── design_guidelines.md # Frontend design system
```

## Key Implementation Details

### Transactional Safety
- Points engine accepts transaction context (dbOrTx parameter)
- All point operations wrapped in database transactions
- Row locking prevents concurrent redemption overselling
- Balance snapshots recorded in every transaction

### Idempotency
- Webhook events logged before mutations
- Duplicate events return 200 (don't retry)
- Unique constraints prevent double-awards
- Point awards use (userId, sourceType, sourceId) uniqueness

### Error Handling
- Graceful degradation when Stripe not configured
- Safe invoice parsing with fallbacks
- Expired points excluded from spendable balance
- Detailed error logging for debugging

## Future Enhancements
- Premium tier implementation
- Real-time leaderboard updates (WebSocket)
- Social features (follows, comments, shares)
- Game integrations via APIs
- Mobile app (React Native)
- Tournament system
- Team/guild features
