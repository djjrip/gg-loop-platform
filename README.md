# GG Loop - Gaming Membership Rewards Platform

> Membership rewards for gamers. Play ranked matches → Earn points → Redeem rewards.

## 🎯 Overview

GG Loop is a tiered membership program for gamers that provides fixed monthly point allocations redeemable for gaming gear, peripherals, and subscriptions. The platform integrates match stats tracking, leaderboards, and achievement displays to boost community engagement.

**Current Status:** MVP presentation layer ready for pitching/demoing

### Membership Tiers

- **Basic**: $5/month → 3,000 monthly points
- **Pro**: $12/month → 10,000 monthly points  
- **Elite**: $25/month → 25,000 monthly points

Points can be redeemed for:
- Gaming gear (mice, keyboards, headsets)
- Gift cards (Steam, Amazon, PlayStation, Xbox)
- Subscriptions (Discord Nitro, game services)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- TanStack Query v5 (state management)
- Wouter (routing)

**Backend:**
- Express.js + TypeScript
- PostgreSQL (Neon) via Drizzle ORM
- Passport.js (multi-provider auth)
- Stripe (subscription payments)
- PayPal (alternative payments)

**Integrations:**
- Riot Games API (League of Legends, Valorant)
- Discord/Twitch/Google OAuth
- Replit Auth (OIDC)

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                Marketing Layer                       │
│  ├─ Landing page (/)                                │
│  ├─ Partner page (/partners)                        │
│  └─ About, Terms, Privacy                           │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                   User App                           │
│  ├─ Dashboard (/stats)                              │
│  ├─ Rewards shop (/shop)                            │
│  ├─ Settings (/settings)                            │
│  └─ My rewards (/my-rewards)                        │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                  Admin Tools                         │
│  ├─ Founder controls (/admin/founder-controls)     │
│  ├─ Points management (manual adjustments)          │
│  ├─ Audit logging (all admin actions)               │
│  ├─ Fulfillment dashboard                           │
│  └─ Rewards catalog management                      │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                 Core Backend                         │
│  ├─ Auth system (5 providers)                       │
│  ├─ Points engine (allocations, transactions)       │
│  ├─ Subscription system (Stripe/PayPal)             │
│  ├─ Riot API sync (10-minute intervals)             │
│  └─ Database layer (PostgreSQL)                     │
└─────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Replit account (recommended)
- PostgreSQL database (included in Replit)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gg-loop.git
   cd gg-loop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create/configure these secrets in Replit:
   
   **Required:**
   - `DATABASE_URL` - PostgreSQL connection string (auto-configured in Replit)
   - `SESSION_SECRET` - Random string for session encryption
   - `BASE_URL` - Your app URL (e.g., `https://yourapp.replit.dev`)
   
   **Authentication (at least one required):**
   - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`
   - `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   
   **Payments:**
   - `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLIC_KEY`
   - `STRIPE_BASIC_PRICE_ID` / `STRIPE_PRO_PRICE_ID` / `STRIPE_ELITE_PRICE_ID`
   - `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
   
   **Riot API:**
   - `RIOT_API_KEY` - For match syncing (get from https://developer.riotgames.com/)
   
   **Optional (Reward Fulfillment - future integrations):**
   - `TREMENDOUS_API_KEY` - For gift card fulfillment (example)
   - Note: Tango Card integration was previously considered but is not currently active. If a gift-card partner is selected in the future, relevant env vars would be documented here.

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## 👤 User Management

### Creating Admin Users

Admin access is controlled by the `ADMIN_EMAILS` environment variable:

```env
ADMIN_EMAILS=admin@example.com,founder@ggloop.com
```

Users with emails in this list get access to:
- `/admin` - Admin dashboard
- `/admin/founder-controls` - Manual point adjustments
- `/admin/rewards` - Rewards catalog management
- `/fulfillment` - Order fulfillment

### Granting Points Manually

1. Navigate to `/admin/founder-controls`
2. Enter user email
3. Select adjustment type:
   - **Grant** - Add points (monthly allocation, bonus, correction)
   - **Deduct** - Remove points (redemption failed, correction)
4. Enter amount and reason
5. All adjustments are logged in `audit_log` table

### Viewing Audit Logs

All admin actions are tracked:
- Who made the change
- What was changed
- When it happened
- Why it happened (reason provided)

Access audit logs at `/admin/founder-controls` → "Audit Log" tab

## 💰 Points System

### Point Allocation

**Monthly Allocation** (automatic on billing date):
- Basic tier: 3,000 points
- Pro tier: 10,000 points
- Elite tier: 25,000 points

**Match Wins** (automatic via Riot API sync):
- Configured per game in database
- Example: 50 points per ranked win

**Sponsored Challenges** (planned):
- Bonus points for specific achievements
- Capped per month to maintain sustainability

### Point Expiration

- All points expire after 12 months
- Prevents point hoarding
- Maintains program sustainability
- Users notified 30 days before expiration

### Transaction Types

Points engine supports:
- `subscription_renewal` - Monthly allocation
- `match_win` - Automatic from Riot API
- `manual_grant` - Admin adjustment
- `manual_deduct` - Admin adjustment
- `reward_redemption` - Point spending
- `challenge_bonus` - Sponsored challenges
- `expiration` - 12-month cleanup

## 🎮 Riot API Integration

### Automatic Match Syncing

- Runs every 10 minutes (background service)
- Syncs League of Legends and Valorant matches
- Awards points automatically for ranked wins
- Updates user stats and leaderboards

### Linking Riot Accounts

Users can link accounts at `/settings`:

1. Enter Riot ID (format: `GameName#TAG`)
2. Select region
3. System verifies account exists
4. Matches sync automatically going forward

### API Key Management

⚠️ **Important:** Riot API keys expire

- Development keys: 24 hours
- Production keys: Require application approval
- Renewal required before expiration

Get keys at: https://developer.riotgames.com/

## 🎁 Rewards Integration

### Current State (MVP)

**Mock Data:**
- Static rewards in `client/src/pages/Shop.tsx`
- No real redemption
- "Redeem (Coming Soon)" buttons

**Purpose:**
- Clean presentation for pitches/demos
- No dependencies on external APIs
- Fast, reliable loading

### Integration Hooks

Ready for implementation in `server/integrations/`:

**Tremendous (Recommended):**
```typescript
// server/integrations/tremendous/index.ts
import TremendousIntegration from './integrations/tremendous';

const tremendous = new TremendousIntegration({
  apiKey: process.env.TREMENDOUS_API_KEY
});

// Fetch catalog
const items = await tremendous.getCatalog();

// Fulfill order
const result = await tremendous.fulfillOrder(orderId);
```

**Printful (Physical Merch):**
```typescript
// server/integrations/printful/index.ts
import PrintfulIntegration from './integrations/printful';

const printful = new PrintfulIntegration({
  apiKey: process.env.PRINTFUL_API_KEY
});

const products = await printful.getCatalog();
```

See `server/integrations/README.md` for full integration guide.

## 📊 Database Schema

### Core Tables

- `users` - User accounts and auth
- `subscriptions` - Membership tier subscriptions
- `point_transactions` - All point movements
- `rewards` - Rewards catalog
- `user_rewards` - Claimed rewards
- `audit_log` - Admin action logging
- `riot_accounts` - Linked Riot accounts
- `riot_matches` - Synced match history

### Point Transaction Integrity

All point operations use database transactions:
- Atomic updates (all-or-nothing)
- Balance validation (can't go negative)
- Audit trail (every change logged)

## 🔐 Security

### Authentication

Multi-provider OAuth:
- Discord
- Twitch  
- Google
- Replit Auth (OIDC)

Session management:
- Express sessions with PostgreSQL store
- Secure cookie settings
- Session expiration

### Admin Protection

- Email whitelist via `ADMIN_EMAILS`
- All admin actions logged
- No public admin routes

### API Security

- Passport.js middleware
- Session-based auth
- CSRF protection (planned)

## 🚢 Deployment

### Replit Deployment (Recommended)

1. Connect GitHub repository to Replit
2. Configure secrets in Replit dashboard
3. Database auto-configured
4. Click "Deploy" → Automatic builds
5. Custom domain support available

### Manual Deployment

**Requirements:**
- Node.js 18+
- PostgreSQL 14+
- HTTPS (for OAuth callbacks)

**Steps:**
1. Set all environment variables
2. Run `npm run db:push` to initialize database
3. Build frontend: `npm run build`
4. Start server: `npm start`
5. Configure reverse proxy (nginx)

## 📈 Roadmap

### Phase 1: Founder Controls ✅
- Manual point adjustments
- Audit logging
- System health monitoring
- Spending limits

### Phase 2: MVP Cleanup ✅
- Simplified landing page
- Partner page
- Clean user dashboard
- Riot ID connection UI
- Mock rewards catalog

### Phase 3: Reward Fulfillment (Next)
- Integrate Tremendous API
- Real redemption flow
- Order tracking
- Fulfillment notifications

### Phase 4: Enhanced Features
- Sponsored challenges
- Leaderboards
- Public profiles
- Achievement system

### Phase 5: Growth
- Referral program
- Content creator partnerships
- Mobile app
- Additional games

## 🐛 Troubleshooting

### Common Issues

**"Gift-card provider API URL invalid"**
- Expected behavior in MVP when no gift-card fulfillment provider is configured
- Using mock data instead
- Implement Tremendous or another partner in Phase 3 (Tango Card previously considered but not active)

**"Riot API key expired"**
- Renew at https://developer.riotgames.com/
- Update `RIOT_API_KEY` secret
- Restart workflow

**"Points not updating"**
- Check `/admin/founder-controls` for system health
- Verify Riot account linked correctly
- Check match sync service logs

**"Payment failed"**
- Verify Stripe keys are correct
- Check Stripe Dashboard for errors
- Ensure test mode matches environment

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a private project. Contact founder before contributing.

## 📞 Support

- Email: support@ggloop.com
- Discord: https://discord.gg/ggloop
- Partnerships: partnerships@ggloop.com

---

**Built with ❤️ for gamers who deserve rewards for their dedication**
