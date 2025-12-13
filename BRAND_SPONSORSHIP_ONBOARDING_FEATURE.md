# BRAND SPONSORSHIP ONBOARDING FEATURE
**"Choose Your Sponsor" System Specification (Documentation Only)**

Last Updated: December 10, 2025

---

## ⚠️ CRITICAL: DOCUMENTATION ONLY

This is a **FEATURE SPECIFICATION DOCUMENT**. NO CODE IMPLEMENTATION. This document describes what the feature would look like when built. Use this as a blueprint for future development.

---

## CONCEPT OVERVIEW

### The Vision
When new users sign up for GG LOOP, they choose a brand sponsor (Nike, Adidas, Logitech, etc.). This choice becomes their **player identity** - like signing with a team in the NBA or choosing a faction in an MMO.

### Cultural Parallel: NIL Deals + NBA Free Agency
- **NIL (Name, Image, Likeness):** College athletes choose brand sponsors
- **NBA Free Agency:** Players sign with teams, wear their colors, rep their brand
- **GG LOOP:** Gamers choose brand sponsors, earn their rewards, build their identity

### Why This Works
1. **Player Identity:** "I'm a Nike Rookie" feels better than "I'm a user"
2. **Brand Loyalty:** Creates emotional connection to sponsor
3. **Gamification:** Choosing a sponsor is the first "quest"
4. **Revenue:** Brands pay for exclusive access to their cohort
5. **Cultural Authenticity:** Mirrors real-world athlete sponsorships

---

## USER FLOW (ONBOARDING)

### Step 1: Sign Up (Standard)
```
User creates account:
- Username
- Email
- Password
- OAuth (Google/Twitch/Discord)
```

### Step 2: Choose Your Sponsor (NEW)
```
Welcome to GG LOOP!

Before you start earning, choose your sponsor.

This is like signing your first endorsement deal. Choose wisely - you can only switch once per year.

[Grid of Brand Cards]

┌────────────┐ ┌────────────┐ ┌────────────┐
│    NIKE    │ │   ADIDAS   │ │  LOGITECH  │
│  [Logo]    │ │  [Logo]    │ │  [Logo]    │
│            │ │            │ │            │
│ Basketball │ │  Esports   │ │   Setup    │
│   Culture  │ │   Focus    │ │   Grind    │
│            │ │            │ │            │
│ [Choose]   │ │ [Choose]   │ │ [Choose]   │
└────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│   RAZER    │ │   TARGET   │ │ CASH APP   │
│  [Logo]    │ │  [Logo]    │ │  [Logo]    │
│            │ │            │ │            │
│  Premium   │ │   Budget   │ │   Money    │
│   Gaming   │ │   Smart    │ │   Grind    │
│            │ │            │ │            │
│ [Choose]   │ │ [Choose]   │ │ [Choose]   │
└────────────┘ └────────────┘ └────────────┘

[Skip for Now] (gray button, bottom right)
```

### Step 3: Confirm Choice
```
You chose: NIKE

As a Nike Rookie, you'll:
• Earn bonus points on Nike missions
• Unlock exclusive Nike rewards
• Rep Nike colors on your profile
• Join the Nike community

This choice lasts 1 year. You can switch once after that.

[Confirm] [Go Back]
```

### Step 4: Welcome to the Team
```
Welcome to Team Nike! 🏀

Your first mission:
"Hoops Grind: Play 10 NBA 2K games"

Reward: 500 bonus points + Nike Rookie badge

[Start Mission] [View Profile]
```

---

## PLAYER IDENTITY SYSTEM

### Brand Tiers (Progression)
Each sponsor has 4 tiers (like NBA contracts):

**Tier 1: Rookie** (0-5,000 points)
- Badge: "[Brand] Rookie"
- Profile Border: Basic brand color
- Bonus: +5% points on brand missions

**Tier 2: Starter** (5,001-25,000 points)
- Badge: "[Brand] Starter"
- Profile Border: Animated brand color
- Bonus: +10% points on brand missions

**Tier 3: All-Star** (25,001-100,000 points)
- Badge: "[Brand] All-Star"
- Profile Border: Premium animated border
- Bonus: +15% points on brand missions
- Unlock: Exclusive brand rewards

**Tier 4: Legend** (100,001+ points)
- Badge: "[Brand] Legend"
- Profile Border: Elite animated border
- Bonus: +20% points on brand missions
- Unlock: Early access to brand drops

### Example: Nike Player Identity
```
Profile Display:

┌─────────────────────────────────────┐
│ [Nike Swoosh Border - Animated]     │
│                                     │
│     [Profile Picture]               │
│                                     │
│     @jaysonbq                       │
│     Nike All-Star ⭐                │
│                                     │
│     15,432 Total Points             │
│     Nike Missions: 47 Completed     │
│                                     │
│     [View Nike Rewards]             │
└─────────────────────────────────────┘
```

---

## BRAND-SPECIFIC QUESTS

### Nike Quests
1. **Hoops Grind:** Play 50 NBA 2K games (5,000 points)
2. **Ranked Sweat:** Win 100 ranked matches in any game (10,000 points)
3. **Sneaker Culture:** Share Nike setup photo on Discord (1,000 points)
4. **Flight School:** Reach Diamond in any game (25,000 points)

### Logitech G Quests
1. **Setup Upgrade:** Play 100 hours with Logitech gear (5,000 points)
2. **Competitive Edge:** Win 50 ranked matches (10,000 points)
3. **Creator Content:** Post setup tour on TikTok (1,000 points)
4. **Pro Grind:** Reach top 500 in any leaderboard (25,000 points)

### Cash App Quests
1. **Money Moves:** Earn 10,000 points total (5,000 bonus points)
2. **Cash Grind:** Complete 25 missions (10,000 points)
3. **Payout Ready:** Redeem first reward (1,000 points)
4. **Millionaire Mindset:** Earn 100,000 points total (25,000 bonus points)

---

## BRAND BOOSTS (TEMPORARY EVENTS)

### Nike Boost Weekend
```
NIKE BOOST WEEKEND
December 15-17

All Nike players earn DOUBLE POINTS on:
• NBA 2K missions
• Basketball-related quests
• Nike reward redemptions

Plus: Top 10 Nike players win exclusive Nike gear

[View Leaderboard]
```

### Logitech G Flash Sale
```
LOGITECH G FLASH SALE
24 Hours Only

Logitech players get 50% OFF:
• Logitech G Pro Mouse (5,000 points → 2,500 points)
• Logitech G Keyboard (10,000 points → 5,000 points)

[Shop Now]
```

---

## COSMETIC PROFILE IDENTITY

### Profile Customization
**Nike Player Profile:**
- **Border Color:** Nike Orange (#FF6B35)
- **Badge:** Nike Swoosh + Tier (Rookie/Starter/All-Star/Legend)
- **Background:** Optional Nike-themed background
- **Emotes:** Nike-exclusive emotes (🏀, 👟, 🔥)

**Logitech G Player Profile:**
- **Border Color:** Logitech Blue (#00B8FC)
- **Badge:** Logitech G Logo + Tier
- **Background:** RGB-themed background
- **Emotes:** Gaming-exclusive emotes (🖱️, ⌨️, 🎮)

### Discord Integration
```
Discord Role Assignment:
• Nike Rookie
• Nike Starter
• Nike All-Star
• Nike Legend

Channel Access:
• #nike-rookies (all Nike players)
• #nike-all-stars (All-Star+ only)
• #nike-legends (Legend only)
```

---

## SINGLE BRAND-PURCHASE REQUIREMENT (OPTIONAL)

### Concept: Prove Your Loyalty
To unlock **Legend** tier, players must prove brand loyalty by making ONE real-world purchase from their sponsor.

**How It Works:**
1. Player reaches 100,000 points (Legend threshold)
2. System prompts: "Prove your loyalty - make one Nike purchase"
3. Player uploads receipt or uses affiliate link
4. Manual verification by GG LOOP team
5. Legend tier unlocked

**Why This Works:**
- Brands get real conversions (not just engagement)
- Players feel like real sponsored athletes
- Creates authentic brand-player relationship
- Optional (can still progress without it)

**Example:**
```
You've reached 100,000 points!

To unlock Nike Legend status, prove your loyalty:

Option 1: Make a Nike purchase (any amount)
Option 2: Use our Nike affiliate link for your next buy
Option 3: Upload receipt from recent Nike purchase

[Upload Receipt] [Use Affiliate Link] [Skip for Now]
```

---

## RE-SIGNING PERIOD (ONCE OR TWICE IN A LIFETIME)

### The Rule: Choose Wisely
- **Initial Choice:** Permanent for 1 year
- **First Re-Sign:** After 1 year, can switch once
- **Second Re-Sign:** After 2 years, can switch again
- **After That:** Locked in for life (or until brand partnership ends)

### Why This Matters
1. **Commitment:** Forces players to think strategically
2. **Brand Loyalty:** Rewards long-term sponsorship
3. **Cultural Authenticity:** Mirrors NBA free agency
4. **Anti-Gaming:** Prevents players from switching for every promo

### Re-Signing Flow
```
You've been with Nike for 1 year!

Time to decide: Stay or explore free agency?

Option 1: Re-sign with Nike
• Keep your Nike Legend status
• Unlock Nike Loyalty Bonus (10,000 points)
• Continue earning Nike rewards

Option 2: Explore Free Agency
• Choose a new sponsor
• Start as Rookie with new brand
• Lose Nike tier (but keep points)

This is your FIRST re-sign. You get ONE more after this.

[Re-Sign with Nike] [Explore Free Agency]
```

---

## CULTURAL REASONING

### Why This System Feels Right

**1. Authenticity**
- Real athletes have sponsors
- Real gamers rep brands
- GG LOOP mirrors real-world dynamics

**2. Identity**
- "I'm a Nike All-Star" > "I'm a user"
- Profile becomes a badge of honor
- Community forms around brands

**3. Gamification**
- Choosing a sponsor is the first quest
- Tier progression feels like leveling up
- Re-signing creates strategic moments

**4. Revenue**
- Brands pay for exclusive cohorts
- Players drive real conversions
- Win-win-win (brand, player, GG LOOP)

**5. Community**
- Nike players vs Adidas players (friendly rivalry)
- Brand-specific Discord channels
- Leaderboards by sponsor

---

## MULTI-BRAND COEXISTENCE

### How Brands Work Together
See **MULTI_BRAND_ECOSYSTEM_RULES.md** for full details.

**Quick Summary:**
- **Category Exclusivity:** Only one sneaker brand per player (Nike OR Adidas, not both)
- **Cross-Category Freedom:** Can be Nike + Logitech + Cash App (different categories)
- **Competition Strengthens Platform:** Nike vs Adidas rivalry drives engagement

---

## TECHNICAL REQUIREMENTS (FOR FUTURE IMPLEMENTATION)

### Database Schema (Conceptual)
```sql
-- User Sponsors Table
CREATE TABLE user_sponsors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  brand_id INTEGER REFERENCES brands(id),
  tier VARCHAR(50), -- 'rookie', 'starter', 'all-star', 'legend'
  points_earned INTEGER DEFAULT 0,
  signed_at TIMESTAMP DEFAULT NOW(),
  can_resign_at TIMESTAMP, -- 1 year from signed_at
  resign_count INTEGER DEFAULT 0, -- max 2
  loyalty_verified BOOLEAN DEFAULT FALSE -- for Legend tier
);

-- Brand Quests Table
CREATE TABLE brand_quests (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER REFERENCES brands(id),
  name VARCHAR(255),
  description TEXT,
  points_reward INTEGER,
  tier_required VARCHAR(50), -- 'rookie', 'starter', etc.
  active BOOLEAN DEFAULT TRUE
);

-- User Quest Progress Table
CREATE TABLE user_quest_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  quest_id INTEGER REFERENCES brand_quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP
);
```

### API Endpoints (Conceptual)
```
GET /api/brands - List all available sponsors
GET /api/user/sponsor - Get user's current sponsor
POST /api/user/sponsor - Choose initial sponsor
PUT /api/user/sponsor/resign - Re-sign or switch sponsor
GET /api/user/sponsor/quests - Get brand-specific quests
POST /api/user/sponsor/quest/complete - Complete brand quest
GET /api/user/sponsor/rewards - Get brand-specific rewards
```

---

## IMPLEMENTATION CHECKLIST (FOR FUTURE)

When ready to build:

- [ ] Design brand card UI (onboarding)
- [ ] Create brand tier badge system
- [ ] Build profile border animations
- [ ] Implement quest system (brand-specific)
- [ ] Add re-signing logic (1 year timer)
- [ ] Create Discord role integration
- [ ] Build loyalty verification flow
- [ ] Add brand boost events
- [ ] Create leaderboards by sponsor
- [ ] Test multi-brand coexistence
- [ ] Get brand approval before launch

---

**Questions? Ready to build this?**  
Contact: Jayson BQ (info@ggloop.io)
