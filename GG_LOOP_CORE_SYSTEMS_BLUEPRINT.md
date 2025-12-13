# GG LOOP LLC - CORE SYSTEMS BLUEPRINT
**The Single Source of Truth for Brand, Product, Tech, and Business**

**Last Updated:** December 10, 2025  
**Owner:** Jayson BQ, Founder & CEO  
**Status:** Living Document - CEO Approval Required for Changes

---

## TABLE OF CONTENTS

1. [Brand & Design DNA](#1-brand--design-dna)
2. [Product Scope (As of Today)](#2-product-scope-as-of-today)
3. [Product Vision (Next 6 Months)](#3-product-vision-next-6-months)
4. [Tech Architecture (Current + AWS Target)](#4-tech-architecture-current--aws-target)
5. [Safety & Compliance Rules](#5-safety--compliance-rules)
6. [Engineering Governance](#6-engineering-governance)
7. [Copywriting Ruleset](#7-copywriting-ruleset)
8. [Business Model Blueprint](#8-business-model-blueprint)
9. [Owner Override Ruleset](#9-owner-override-ruleset)

---

## 1. BRAND & DESIGN DNA

### Core Identity
**GG Loop is the gaming rewards platform built for the culture.**

We're not corporate. We're not sterile. We're basketball courts, sneaker culture, and late-night gaming sessions. We're the platform for players who never felt seen by the mainstream gaming industry.

### Color Palette

**Primary Colors:**
- **Copper/Rose-Gold** (`#C87941`, `#B8860B`) - Our signature metallic accent
- **Deep Black** (`#0A0A0A`, `#1A1A1A`) - Primary background
- **Off-White** (`#F5F5F5`, `#E5E5E5`) - Text and contrast

**Accent Colors:**
- **Warm Orange** (`#FF6B35`, `#FF8C42`) - CTAs and highlights
- **Muted Gold** (`#D4AF37`) - Secondary accents
- **Dark Gray** (`#2A2A2A`, `#3A3A3A`) - Cards and containers

**CRITICAL RULE: NO GREEN ON PUBLIC PAGES**
- ❌ Green is reserved for admin/founder tools ONLY
- ❌ Never use green for user-facing CTAs, buttons, or highlights
- ✅ Use copper, orange, or gold for public-facing elements

### Typography

**Headings:**
- **Orbitron** - Bold, futuristic, gaming-forward
- Use for: Page titles, hero headlines, section headers

**Body Text:**
- **Inter** - Clean, readable, modern
- Use for: Paragraphs, descriptions, UI text

**Code/Monospace:**
- **JetBrains Mono** - Technical, developer-friendly
- Use for: Stats, numbers, technical displays

### Aesthetic Rules

**DO:**
- ✅ Use dark mode by default (light mode optional)
- ✅ Glassmorphism effects (backdrop-blur, transparency)
- ✅ Subtle gradients (copper to gold, orange to red)
- ✅ Micro-animations (hover effects, transitions)
- ✅ Basketball/sneaker culture imagery
- ✅ Street culture energy (authentic, not corporate)

**DON'T:**
- ❌ Bright neon colors (except controlled accents)
- ❌ Corporate blue/green color schemes
- ❌ Generic stock photos
- ❌ Overly polished "Silicon Valley" aesthetic
- ❌ Anything that feels like a bank or insurance company

### Brand Tone & Voice

**We Sound Like:**
- A friend who's been grinding ranked all night
- The homie who always has your back
- The coach who pushes you but believes in you
- The culture curator who knows what's real

**We DON'T Sound Like:**
- Corporate PR speak
- Fake hype or overpromising
- Condescending or preachy
- Desperate or salesy

**Key Phrases:**
- "Built for the culture"
- "Play. Earn. Loop."
- "Healing the inner gamer"
- "For the players who never felt seen"
- "One match at a time"

---

## 2. PRODUCT SCOPE (AS OF TODAY)

### ✅ WHAT'S LIVE & STABLE

#### Authentication
- **Google OAuth** - Sign in with Google account
- **Discord OAuth** - Sign in with Discord account
- **Twitch OAuth** - Sign in with Twitch account
- **Session Management** - Secure, persistent login sessions
- **User Profiles** - Basic profile pages with stats display

#### Points System
- **Manual Points Awards** - Founder can award points to users via admin dashboard
- **Points Balance Display** - Users see current points on Stats page
- **Points History** - Transaction log visible to users
- **Points Deduction** - Automatic deduction when redeeming rewards

#### Rewards Catalog
- **Shop Page** - Browse available rewards (gift cards, gaming gear, merch)
- **Reward Categories** - Organized by type (Gift Cards, Gaming Gear, Exclusive Merch)
- **Stock Management** - Admin can mark items in/out of stock
- **Manual Fulfillment** - All redemptions processed manually by founder (2-5 business days)
- **Redemption Requests** - Users click "Request Reward" to claim
- **My Rewards Page** - View claimed rewards and pending requests

#### Disclaimers & Transparency
- **Homepage Hero** - "request rewards (manual fulfillment)" in subtitle
- **Shop Banner** - Prominent alert explaining manual fulfillment process
- **Shop Buttons** - "Request Reward" (not "Redeem Reward")
- **Stats Page** - "Browse Rewards" button (not "Redeem Points")
- **My Rewards** - Empty state clarifies manual fulfillment timeline
- **Footer** - Company identity, founder info, contact email

#### Admin Controls
- **Founder Dashboard** - Admin-only access (`/admin`)
- **User Management** - View all users, ban/unban, adjust points manually
- **Rewards Management** - Add/edit/delete rewards, manage inventory
- **Fulfillment Dashboard** - Process reward redemption requests
- **System Status** - Monitor platform health and errors
- **Audit Logs** - Track all admin actions

#### System Safety
- **Error Handlers** - Graceful shutdown on fatal errors (Railway auto-restarts)
- **Circuit Breaker** - Match sync service stops after 3 consecutive failures
- **Health Endpoint** - `/health` returns server status for monitoring
- **Alert System** - Critical errors notify founder via email/SMS (Resend + Twilio)
- **Single Footer** - Duplicate rendering bug fixed

### ⚠️ WHAT'S MANUAL (NOT AUTOMATED)

- **Points Awards** - Founder manually awards points (no auto-match tracking yet)
- **Reward Fulfillment** - Founder manually processes all redemptions (2-5 days)
- **User Verification** - Founder manually verifies Riot accounts
- **Stock Management** - Founder manually updates reward inventory
- **Referral Tracking** - System tracks referrals but doesn't auto-award points

### ❌ WHAT'S DISABLED (INTENTIONALLY)

#### Subscriptions
- **PayPal Checkout** - Disabled (backend routes not implemented)
- **Stripe Checkout** - Not configured
- **Paid Tiers** - Not accepting payments
- **Subscription Benefits** - Not active
- **Honest Messaging** - "We're working on payment integration" toast on click

#### Automated Features
- **Auto-Match Points** - Riot API tracking works but doesn't award points
- **Instant Fulfillment** - No automated reward delivery
- **Auto-Payouts** - No cash or gift card automation
- **Affiliate Commissions** - Program exists but not paying out

### 🔍 WHAT'S IN DEVELOPMENT (NOT LIVE)

- **Desktop App** - Riot match verification client (planned)
- **Automated Points** - Match-based point earning (requires desktop app)
- **Payment Processing** - Stripe integration for subscriptions
- **Instant Rewards** - API-based digital reward delivery
- **Leaderboards** - Competitive rankings with rewards

---

## 3. PRODUCT VISION (NEXT 6 MONTHS)

### Phase 1: Payment Infrastructure (Month 1-2)
**Goal:** Accept money safely and deliver value

**Deliverables:**
- ✅ Stripe integration (replace PayPal)
- ✅ Subscription checkout flow
- ✅ Webhook handling for payment events
- ✅ Subscription management dashboard
- ✅ Cancellation and refund flows

**Success Criteria:**
- Users can subscribe to Bronze/Silver/Gold tiers
- Payments process successfully
- Subscriptions auto-renew monthly
- Users can cancel anytime

### Phase 2: Desktop App + Auto-Match Verification (Month 2-4)
**Goal:** Verify gameplay without manual intervention

**Deliverables:**
- ✅ Electron desktop app for Windows/Mac
- ✅ Riot Games API integration for match verification
- ✅ Secure match data transmission to backend
- ✅ Automated point awards based on verified matches
- ✅ Anti-cheat measures (prevent fake match data)

**Success Criteria:**
- App detects Riot client running
- Matches verified within 5 minutes of completion
- Points awarded automatically
- No false positives or exploits

### Phase 3: Automated Fulfillment System (Month 3-5)
**Goal:** Instant digital reward delivery

**Deliverables:**
- ✅ API integrations with reward providers (Tango Card, Tremendous, etc.)
- ✅ Automated gift card code delivery via email
- ✅ Real-time inventory management
- ✅ Fraud detection and prevention
- ✅ Instant fulfillment for digital rewards

**Success Criteria:**
- Gift cards delivered within 60 seconds
- 99%+ success rate
- Zero fraud incidents
- Users receive codes via email automatically

### Phase 4: Referral System (Month 4-5)
**Goal:** Viral growth through word-of-mouth

**Deliverables:**
- ✅ Unique referral codes per user
- ✅ Automated point awards for referrer + referee
- ✅ Referral leaderboard
- ✅ Bonus tiers (5 refs = bonus, 10 refs = bigger bonus)
- ✅ Social sharing tools

**Success Criteria:**
- 20%+ of new users come from referrals
- Referrers earn points automatically
- Leaderboard drives competition

### Phase 5: Creator Program (Month 5-6)
**Goal:** Partner with streamers and content creators

**Deliverables:**
- ✅ Creator dashboard
- ✅ Custom referral links with tracking
- ✅ Commission structure (% of referred subscriptions)
- ✅ Creator-exclusive rewards
- ✅ Monthly payout system

**Success Criteria:**
- 10+ active creators
- Creators drive 30%+ of new subscriptions
- Payouts processed monthly via PayPal/Stripe

### Phase 6: AWS Migration (Month 4-6)
**Goal:** Scale infrastructure for growth

**Deliverables:**
- ✅ EC2 instances for backend
- ✅ RDS PostgreSQL for database
- ✅ Redis for caching and sessions
- ✅ S3 for static assets and user uploads
- ✅ CloudFront CDN for global delivery
- ✅ Auto-scaling and load balancing

**Success Criteria:**
- 99.9% uptime
- Sub-200ms response times globally
- Handle 10,000+ concurrent users
- Zero downtime deployments

---

## 4. TECH ARCHITECTURE (CURRENT + AWS TARGET)

### Current Stack (Railway)

```
┌─────────────────────────────────────────┐
│          GITHUB (main branch)           │
│  - Auto-deploy on push to main          │
│  - Build: npm run build                 │
│  - Start: npm start                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         RAILWAY (Production)            │
│  - Node.js runtime                      │
│  - Express server (port 5000)           │
│  - Vite build output (dist/public)      │
│  - Health check: /health                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      NEON POSTGRESQL (Database)         │
│  - Serverless PostgreSQL                │
│  - Auto-scaling                         │
│  - Connection pooling                   │
└─────────────────────────────────────────┘
```

**What's Missing:**
- ❌ Redis for caching and sessions (using MemoryStore)
- ❌ CDN for static assets (Railway serves directly)
- ❌ Load balancing (single Railway instance)
- ❌ Auto-scaling (manual scaling only)
- ❌ S3 for file uploads (no user uploads yet)

### Target Stack (AWS)

```
┌─────────────────────────────────────────┐
│          GITHUB (main branch)           │
│  - GitHub Actions CI/CD                 │
│  - Build: npm run build                 │
│  - Deploy to EC2 via SSH                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      CLOUDFRONT (CDN)                   │
│  - Global edge caching                  │
│  - SSL/TLS termination                  │
│  - DDoS protection                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   APPLICATION LOAD BALANCER (ALB)       │
│  - Health checks                        │
│  - Auto-scaling triggers                │
│  - SSL offloading                       │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  EC2 Instance │   │  EC2 Instance │
│   (Backend)   │   │   (Backend)   │
│  - Node.js    │   │  - Node.js    │
│  - Express    │   │  - Express    │
│  - PM2        │   │  - PM2        │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────┐
│      ELASTICACHE REDIS (Cache)          │
│  - Session storage                      │
│  - Rate limiting                        │
│  - Leaderboard caching                  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      RDS POSTGRESQL (Database)          │
│  - Multi-AZ deployment                  │
│  - Automated backups                    │
│  - Read replicas                        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         S3 (Static Assets)              │
│  - User uploads                         │
│  - Reward images                        │
│  - Backup storage                       │
└─────────────────────────────────────────┘
```

### AWS Services Breakdown

**Compute:**
- **EC2** - t3.medium instances (2 vCPU, 4GB RAM) for backend
- **Auto Scaling** - Scale 2-10 instances based on CPU/memory
- **ALB** - Application Load Balancer for traffic distribution

**Database:**
- **RDS PostgreSQL** - db.t3.medium (2 vCPU, 4GB RAM)
- **Multi-AZ** - Automatic failover for high availability
- **Automated Backups** - Daily snapshots, 7-day retention

**Caching:**
- **ElastiCache Redis** - cache.t3.micro (1 vCPU, 0.5GB RAM)
- **Session Storage** - Replace MemoryStore with Redis
- **Leaderboard Cache** - Real-time rankings

**Storage:**
- **S3** - User uploads, reward images, backups
- **CloudFront** - CDN for global asset delivery

**Networking:**
- **VPC** - Isolated network for security
- **Security Groups** - Firewall rules
- **Route 53** - DNS management

**Monitoring:**
- **CloudWatch** - Logs, metrics, alarms
- **X-Ray** - Distributed tracing
- **SNS** - Alert notifications

### Cost Estimate (AWS)

**Monthly Costs:**
- EC2 (2x t3.medium): ~$60
- RDS (db.t3.medium): ~$50
- ElastiCache (cache.t3.micro): ~$15
- S3 + CloudFront: ~$20
- Data Transfer: ~$10
- **Total: ~$155/month**

**AWS Credits:**
- Startup credits: $5,000 (covers ~32 months)
- AWS Activate: Additional $1,000-$100,000 (if approved)

---

## 5. SAFETY & COMPLIANCE RULES

### Critical Safety Rules

**1. NO AUTOMATIC GAMEPLAY REWARDS UNTIL DESKTOP APP**
- ❌ Do NOT award points automatically for matches until desktop app is live
- ❌ Do NOT trust client-side match data without verification
- ✅ Only award points manually via admin dashboard
- ✅ Desktop app required for anti-cheat and verification

**2. NO SUBSCRIPTION PROMISES UNTIL PAYMENTS ARE ACTIVE**
- ❌ Do NOT enable PayPal/Stripe checkout until backend is production-ready
- ❌ Do NOT promise subscription benefits until we can deliver them
- ✅ Show subscription page but disable checkout
- ✅ Display honest "We're working on it" messaging

**3. MANUAL FULFILLMENT DISCLAIMERS EVERYWHERE**
- ✅ Homepage: "request rewards (manual fulfillment)"
- ✅ Shop: Prominent banner explaining 2-5 business days
- ✅ Shop buttons: "Request Reward" (not "Redeem")
- ✅ Stats: "Browse Rewards" (not "Redeem Points")
- ✅ My Rewards: Empty state mentions manual fulfillment

**4. REQUIRED FOOTER COMPLIANCE**
- ✅ Company name: "GG LOOP LLC"
- ✅ Founder: "Jayson BQ" (privacy)
- ✅ Contact: "info@ggloop.io"
- ✅ Riot Games disclaimer (required)
- ✅ Copyright notice
- ✅ Footer appears exactly once per page

**5. REQUIRED LEGAL STATEMENTS**

**Riot Games Disclaimer (Footer):**
> "GG Loop isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc."

**Manual Fulfillment (Shop Page):**
> "All reward redemptions are processed manually by our team. Please allow 2-5 business days for fulfillment. Rewards are subject to availability."

**Subscription Disclaimer (Subscription Page):**
> "We're working on payment integration. Please check back soon or contact support at info@ggloop.io"

### Data Privacy Rules

**User Data:**
- ✅ Collect only necessary data (email, username, OAuth tokens)
- ✅ Store passwords hashed (bcrypt)
- ✅ Use HTTPS everywhere
- ✅ Session cookies with secure flags
- ❌ Never sell user data
- ❌ Never share data without consent

**Riot API Compliance:**
- ✅ Follow Riot API Terms of Service
- ✅ Rate limit API requests (20 req/sec, 100 req/2min)
- ✅ Cache match data to reduce API calls
- ✅ Display Riot disclaimer on all pages
- ❌ Never scrape or abuse Riot API

### Security Rules

**Authentication:**
- ✅ Use OAuth 2.0 for all logins (Google, Discord, Twitch)
- ✅ Implement CSRF protection
- ✅ Use secure session cookies
- ❌ Never store plaintext passwords
- ❌ Never expose API keys in client code

**Admin Access:**
- ✅ Restrict `/admin` routes to founder email only
- ✅ Log all admin actions (audit trail)
- ✅ Require re-authentication for sensitive actions
- ❌ Never expose admin endpoints publicly

**API Security:**
- ✅ Validate all user inputs
- ✅ Sanitize database queries (prevent SQL injection)
- ✅ Rate limit API endpoints
- ✅ Use environment variables for secrets
- ❌ Never commit secrets to Git

---

## 6. ENGINEERING GOVERNANCE

### Branch Rules

**main (Production)**
- ✅ Always deployable
- ✅ Protected branch (no direct commits)
- ✅ Requires CEO approval for merges
- ✅ Auto-deploys to Railway on push
- ❌ Never push broken code to main

**ggloop-staging (Development)**
- ✅ Feature development and testing
- ✅ Can be unstable
- ✅ Merge to main only after CEO approval
- ✅ Used for Level 4+ work

**Feature Branches**
- ✅ Create for new features (`feature/subscription-checkout`)
- ✅ Merge to `ggloop-staging` first
- ✅ Delete after merge

### Deployment Rules

**Railway Auto-Deploy:**
- ✅ Triggers on push to `main`
- ✅ Runs `npm run build` automatically
- ✅ Starts with `npm start`
- ✅ Health check on `/health`
- ❌ Never deploy without testing locally first

**Manual Deploy Steps:**
1. Test locally (`npm run dev`)
2. Run build (`npm run build`)
3. Test production build (`npm start`)
4. Commit to `ggloop-staging`
5. Get CEO approval
6. Merge to `main`
7. Push to GitHub
8. Railway auto-deploys

### Testing Rules

**Before Every Deploy:**
- ✅ Run `npm run build` locally (must pass)
- ✅ Test critical routes (/, /shop, /login, /admin)
- ✅ Verify no console errors
- ✅ Check `/health` endpoint returns 200
- ✅ Test on mobile viewport

**After Every Deploy:**
- ✅ Verify site loads on ggloop.io
- ✅ Check `/health` endpoint
- ✅ Test login flow
- ✅ Verify no broken links
- ✅ Check footer appears once

### Critical Safety Rules

**1. CEO APPROVAL REQUIRED FOR MAIN MERGES**
- ❌ AG cannot merge to main without explicit CEO command
- ❌ AG cannot deploy to production without CEO approval
- ✅ AG can work on `ggloop-staging` freely
- ✅ AG must request approval before merging

**2. NO AUTO-DEPLOY WITHOUT TESTING**
- ❌ Never push to main without local testing
- ❌ Never merge without running `npm run build`
- ✅ Always test production build locally first
- ✅ Always verify health endpoint works

**3. ROLLBACK PROCEDURE**
If production breaks:
1. Identify last known good commit
2. `git revert <bad-commit>` OR `git reset --hard <good-commit>`
3. Push to main immediately
4. Railway auto-deploys rollback
5. Investigate issue on `ggloop-staging`

**4. EMERGENCY HOTFIX PROTOCOL**
For critical production bugs:
1. Create hotfix branch from main
2. Fix bug with minimal changes
3. Test locally
4. Get CEO approval (can be verbal/Slack)
5. Merge directly to main
6. Document in commit message

---

## 7. COPYWRITING RULESET

### Words We DO Use

**Empowering:**
- "Earn" (points, rewards)
- "Request" (rewards)
- "Browse" (catalog)
- "Join" (community)
- "Play" (your favorite games)

**Honest:**
- "Manual fulfillment"
- "2-5 business days"
- "Subject to availability"
- "We're working on it"
- "Coming soon"

**Cultural:**
- "Built for the culture"
- "For the players who never felt seen"
- "Healing the inner gamer"
- "One match at a time"
- "Play. Earn. Loop."

### Words We NEVER Use (Until Live)

**Overpromising:**
- ❌ "Instant" (rewards) - until automated fulfillment is live
- ❌ "Guaranteed" (earnings) - we can't guarantee anything
- ❌ "Automatic" (points) - until desktop app is live
- ❌ "Redeem" (implies instant) - use "Request" instead
- ❌ "Cash out" - we don't offer cash payouts

**Misleading:**
- ❌ "Earn money playing games" - not accurate yet
- ❌ "Get paid to play" - not true until subscriptions are live
- ❌ "Free money" - cringe and misleading
- ❌ "Easy money" - sets wrong expectations
- ❌ "Passive income" - not what we offer

**Corporate Speak:**
- ❌ "Leverage" (use "use" instead)
- ❌ "Synergy" (just no)
- ❌ "Ecosystem" (use "platform" or "community")
- ❌ "Disruptive" (overused)
- ❌ "Revolutionary" (let users decide)

### Mandatory Disclaimers

**Homepage Hero:**
> "The gaming rewards platform built for the culture. Join the community, earn points, and request rewards (manual fulfillment)."

**Shop Page Banner:**
> "All reward redemptions are processed manually by our team. Please allow 2-5 business days for fulfillment. Rewards are subject to availability."

**Subscription Page:**
> "We're working on payment integration. Please check back soon or contact support at info@ggloop.io"

**My Rewards Empty State:**
> "You haven't claimed any rewards yet. Browse our catalog and request rewards with your points (manual fulfillment, 2-5 days)!"

**Footer Riot Disclaimer:**
> "GG Loop isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc."

### Messaging Per Route

**Homepage (/):**
- Focus: Community, culture, belonging
- Tone: Welcoming, authentic, aspirational
- CTA: "Join the Community" or "Get Started"
- Must mention: Manual fulfillment in hero text

**Shop (/shop):**
- Focus: Browse rewards, understand process
- Tone: Transparent, helpful, realistic
- CTA: "Request Reward" (not "Redeem")
- Must show: Manual fulfillment banner at top

**Stats (/stats):**
- Focus: Track progress, see points
- Tone: Motivational, competitive, clear
- CTA: "Browse Rewards" (not "Redeem Points")
- Must show: Current points balance prominently

**Subscription (/subscription):**
- Focus: Future benefits, honest timeline
- Tone: Transparent, aspirational, patient
- CTA: Disabled with "Coming Soon" message
- Must show: "We're working on it" disclaimer

**My Rewards (/my-rewards):**
- Focus: Track claimed rewards, set expectations
- Tone: Helpful, transparent, patient
- Empty State: Mention manual fulfillment timeline
- Must show: Pending vs. Fulfilled status

**Admin Pages (/admin/*):**
- Focus: Founder tools, system management
- Tone: Technical, precise, powerful
- Color: Green allowed (admin-only)
- Must show: Audit logs for all actions

---

## 8. BUSINESS MODEL BLUEPRINT

### Revenue Streams

**1. Subscriptions (Primary Revenue)**

**Bronze Tier - $4.99/month**
- 500 bonus points on signup
- 10% bonus on all point earnings
- Early access to new rewards
- Bronze badge on profile

**Silver Tier - $9.99/month**
- 1,200 bonus points on signup
- 25% bonus on all point earnings
- Priority fulfillment (1-3 days instead of 2-5)
- Silver badge on profile
- Exclusive monthly reward

**Gold Tier - $19.99/month**
- 3,000 bonus points on signup
- 50% bonus on all point earnings
- VIP fulfillment (same-day for digital rewards)
- Gold badge on profile
- Exclusive monthly reward + surprise gift
- Direct line to founder (Discord DM)

**Target:**
- 1,000 subscribers by Month 6
- Average $10/month per subscriber
- **$10,000/month recurring revenue**

**2. Affiliate/Creator Commissions (Secondary Revenue)**

**Creator Tiers:**
- **Micro** (100-1K followers): 10% of referred subscriptions
- **Mid** (1K-10K followers): 15% of referred subscriptions
- **Macro** (10K+ followers): 20% of referred subscriptions + custom deals

**Target:**
- 50 active creators by Month 6
- Each drives 10 subscriptions/month average
- **$2,500/month in creator-driven revenue**
- Pay out 15% average = $375/month in commissions

**3. Sponsored Rewards (Future Revenue)**

**Model:**
- Partner with brands (Razer, HyperX, Logitech, etc.)
- They provide products at cost or free
- We feature them prominently in catalog
- They get exposure to engaged gaming audience

**Target:**
- 5 brand partnerships by Month 12
- $5,000/month in sponsored reward value
- **$1,000/month in partnership fees**

### Cost Model

**Current Costs (Railway):**
- Railway hosting: $20/month
- Neon PostgreSQL: $0 (free tier)
- Domain (ggloop.io): $12/year
- **Total: ~$21/month**

**Target Costs (AWS):**
- EC2 + RDS + Redis: $155/month
- S3 + CloudFront: $20/month
- Monitoring + misc: $25/month
- **Total: ~$200/month**

**AWS Credits:**
- Startup credits: $5,000 (covers 25 months)
- AWS Activate: $1,000-$100,000 (if approved)
- **Effective cost: $0/month for 2+ years**

**Other Costs:**
- Stripe fees: 2.9% + $0.30 per transaction
- Reward fulfillment: Variable (gift cards at face value)
- Creator commissions: 15% of referred subscriptions
- Email/SMS alerts: $10/month (Resend + Twilio)

**Break-Even Analysis:**
- Fixed costs: $200/month (AWS) + $10/month (alerts) = $210/month
- Need: 21 subscribers at $9.99/month to break even
- **Target: 100 subscribers by Month 3 = $1,000/month revenue**

### Unit Economics

**Per Subscriber (Average $10/month):**
- Revenue: $10.00
- Stripe fee: -$0.59 (5.9%)
- AWS cost: -$0.20 (allocated)
- Net profit: **$9.21/month per subscriber**

**Per Reward Redemption:**
- User spends: 1,000 points (example)
- Reward cost: $10 gift card
- Fulfillment time: 2-5 days (manual)
- Margin: $0 (rewards at cost, not profit center)

**Creator Economics:**
- Creator refers 10 subscribers at $9.99/month = $99.90 revenue
- Creator commission: 15% = $14.99/month
- Net to GG Loop: $84.91/month
- **Still profitable with creator commissions**

### AWS Credit Utilization Plan

**Phase 1 (Month 1-3): Foundation**
- Use credits for EC2 + RDS setup
- Migrate from Railway to AWS
- Burn rate: ~$200/month = $600 total

**Phase 2 (Month 4-6): Scale**
- Add auto-scaling, Redis, CloudFront
- Increase instance sizes as traffic grows
- Burn rate: ~$300/month = $900 total

**Phase 3 (Month 7-12): Growth**
- Add more EC2 instances for load balancing
- Upgrade RDS for performance
- Add S3 for user uploads
- Burn rate: ~$500/month = $3,000 total

**Total Credits Used (Year 1): $4,500**
**Remaining Credits: $500** (buffer for spikes)

**Revenue Target (Year 1):**
- Month 3: 100 subscribers = $1,000/month
- Month 6: 500 subscribers = $5,000/month
- Month 12: 1,000 subscribers = $10,000/month
- **Year 1 Total Revenue: ~$50,000**

---

## 9. OWNER OVERRIDE RULESET

### Final Authority

**Jayson BQ (Founder & CEO) has final authority on:**
- ✅ All product decisions
- ✅ All brand decisions
- ✅ All deployment approvals
- ✅ All feature prioritization
- ✅ All partnership decisions
- ✅ All financial decisions

**AG (Technical Execution Agent) must:**
- ✅ Follow this blueprint exactly
- ✅ Request CEO approval before merging to main
- ✅ Request CEO approval before deploying to production
- ✅ Request CEO approval before building new features
- ❌ Never auto-deploy without explicit permission
- ❌ Never merge to main without CEO command
- ❌ Never build features not in this blueprint

### CEO Override Commands

**Emergency Commands:**
- "EMERGENCY HOTFIX" - AG can patch production immediately
- "ROLLBACK NOW" - AG reverts to last known good commit
- "STOP EVERYTHING" - AG halts all work and reports status

**Approval Commands:**
- "APPROVED - MERGE TO MAIN" - AG can merge staging to main
- "APPROVED - DEPLOY" - AG can push to production
- "APPROVED - BUILD FEATURE X" - AG can implement specific feature

**Level Commands:**
- "ADVANCE TO LEVEL X" - AG can work on higher-level tasks
- "RESET TO LEVEL X" - AG returns to specified level
- "LEVEL FREEZE" - AG cannot advance levels without approval

### Blueprint Modification Rules

**This document can only be modified by:**
- ✅ Jayson BQ (Founder & CEO)
- ✅ AG with explicit CEO approval

**Modification process:**
1. CEO requests change
2. AG updates document
3. AG commits to `ggloop-staging`
4. CEO reviews and approves
5. AG merges to `main`
6. Document becomes new source of truth

**Version Control:**
- ✅ Track all changes in Git
- ✅ Include "Last Updated" date at top
- ✅ Document major changes in commit messages
- ❌ Never modify without CEO knowledge

### Escalation Protocol

**If AG encounters:**
- Ambiguity in requirements → Ask CEO for clarification
- Conflict between rules → Ask CEO to resolve
- Technical impossibility → Explain to CEO and propose alternatives
- Security concern → Alert CEO immediately
- Production outage → Execute emergency protocol, then report

**AG must NEVER:**
- ❌ Guess CEO's intent
- ❌ Make assumptions about priorities
- ❌ Implement features not in blueprint
- ❌ Deploy without approval
- ❌ Change brand/design without approval

---

## APPENDIX: QUICK REFERENCE

### Current Status
- **Level:** 3.5 - Stable Production + Documentation
- **Production:** ggloop.io (live and stable)
- **Latest Commit:** 1035ca0 (Privacy updates + Level 4 fixes)
- **Branch:** main
- **Deployment:** Railway (auto-deploy on push)

### Key Contacts
- **Founder:** Jayson BQ
- **Email:** info@ggloop.io
- **Support:** info@ggloop.io

### Key URLs
- **Production:** https://ggloop.io
- **Health Check:** https://ggloop.io/health
- **Admin:** https://ggloop.io/admin
- **GitHub:** https://github.com/djjrip/gg-loop-platform

### Emergency Procedures
1. **Site Down:** Check Railway logs, verify health endpoint, rollback if needed
2. **Build Failure:** Check build logs, fix errors, test locally, redeploy
3. **Security Issue:** Alert CEO immediately, take site offline if critical
4. **Data Breach:** Alert CEO, preserve logs, notify users if required

---

**END OF BLUEPRINT**

This document is the single source of truth for GG Loop LLC. All decisions, code, and communications must align with this blueprint. CEO approval required for any deviations.

**Last Updated:** December 10, 2025  
**Next Review:** January 10, 2026  
**Owner:** Jayson BQ, Founder & CEO
