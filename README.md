# 🎮 GG LOOP

**Real Rewards for Real Gamers. No Crypto. No BS.**

[![deployed](https://img.shields.io/badge/deployed-online-success)](https://ggloop.io)
[![platform](https://img.shields.io/badge/platform-web%20%2B%20desktop-blue)](https://ggloop.io)
[![built](https://img.shields.io/badge/built-in%20public-orange)](https://github.com/djjrip/gg-loop-platform)

---

## What is GG LOOP?

A rewards platform where gamers earn verified points for actual gameplay, then redeem for gift cards and gear.

**Not another crypto scam.** Just straightforward: Play → Verify → Earn → Loop.

- 🎯 **Desktop app** tracks your gameplay (Valorant, League, CS2, etc.)
- ⚡ **Anti-idle system** only counts active play
- 💰 **Real rewards** - Steam, Amazon, PlayStation gift cards
- 🏆 **No blockchain**, no tokens, no fake promises

---

## Live Platform

**Production:** [ggloop.io](https://ggloop.io)

- 8 rewards available in shop
- Affiliate tracking built-in
- PostgreSQL database
- Deployed on Railway

---

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Riot Sign-On, Google OAuth, Twitch OAuth
- **Services:** PayPal subscriptions, email marketing

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **State:** TanStack Query
- **Icons:** Lucide React

### Desktop App
- **Framework:** Electron
- **Game Detection:** Process monitoring (17+ games)
- **Anti-Cheat:** Activity verification, rate limiting

---

## Features

### For Players
✅ Track gameplay automatically  
✅ Earn points for active play time  
✅ Redeem for real gift cards  
✅ Trust score system (anti-smurf)  
✅ Leaderboards & achievements  

### For Admins
✅ Revenue analytics dashboard  
✅ Automated fulfillment (< $50)  
✅ Daily business reports  
✅ Email marketing system  
✅ Referral tracking  

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- Riot Games API key (dev key works)

### Setup
```bash
# Clone repo
git clone https://github.com/djjrip/gg-loop-platform.git
cd gg-loop-platform

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Start dev server
npm run dev
```

### Required Environment Variables
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_EMAILS=your@email.com

# OAuth (optional for local dev)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
RIOT_API_KEY=...
```

---

## Desktop App

The desktop app verifies gameplay locally without needing API access.

### Supported Games
Valorant • League of Legends • CS2 • Dota 2 • Apex Legends • Fortnite • Overwatch 2 • and 10+ more

### How It Works
1. Detects game processes running on your PC
2. Tracks mouse/keyboard activity
3. Awards points for verified active play
4. No API calls - 100% local verification

### Build Desktop App
```bash
cd gg-loop-desktop
npm install
npm run build
```

---

## API Endpoints

### Public
- `GET /api/health` - Platform health status
- `GET /api/rewards` - Available shop rewards
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/riot` - Riot Sign-On

### Admin (requires auth)
- `GET /api/admin/users` - User management
- `GET /api/admin/revenue/overview` - Revenue analytics
- `GET /api/admin/fulfillment/pending` - Pending redemptions
- `POST /api/admin/fulfillment/fulfill` - Mark as fulfilled

---

## Business Model

### Revenue Streams
1. **Affiliate Commissions** - $0.50-$4.00 per redemption
2. **Subscriptions** - $5-25/month (basic/pro/elite tiers)
3. **Future:** Brand partnerships, sponsored tournaments

### Current Status
- Platform: Live
- Users: Early access
- Revenue: Affiliate links active
- Funding: Bootstrapped

---

## Project Structure

```
gg-loop-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Routes (Home, Shop, Admin, etc.)
│   │   └── components/    # Reusable UI components
├── server/                # Express backend
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── automation/        # Cron jobs, fulfillment
│   └── middleware/        # Auth, admin checks
├── shared/                # Shared types + schema
│   └── schema.ts          # Drizzle ORM schema
├── gg-loop-desktop/       # Electron app
└── scripts/               # Deployment, setup scripts
```

---

## Contributing

We're building in public, but this is a solo founder project. Contributions are welcome for:

- Bug fixes
- Performance improvements
- Documentation

**NOT accepting:**
- Major feature changes without discussion
- Cryptocurrency/blockchain integrations
- Predatory mechanics

---

## Philosophy

### What GG LOOP is:
✅ Fair rewards for time invested  
✅ Transparent pricing and mechanics  
✅ Real value, not hype  
✅ Built for gamers, by a gamer  

### What GG LOOP is NOT:
❌ A crypto/NFT platform  
❌ Get-rich-quick scheme  
❌ Pay-to-win mechanics  
❌ Exploitative business model  

---

## Roadmap

- [x] Desktop app with game detection
- [x] Points system + shop
- [x] Admin fulfillment dashboard
- [x] Revenue analytics
- [ ] Riot API production key
- [ ] Steam account linking
- [ ] Tournaments & challenges
- [ ] Mobile app (PWA)

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Contact

**Founder:** Jayson Quindao  
**Email:** jaysonquindao@ggloop.io  
**Platform:** [ggloop.io](https://ggloop.io)  
**Twitter:** [@ggloop](https://twitter.com/search?q=%23ggloop)

---

## Acknowledgments

Built with:
- Railway (deployment)
- Drizzle ORM
- TanStack Query
- Riot Games API
- Many late nights and energy drinks

**Filipino-American founder building anti-BS gaming infrastructure.**

---

_Last updated: December 28, 2025_
