# Reddit Post - 100% AUTHENTIC (r/gamedev)

**Title:**
Solo founder here - built a gaming rewards platform in 90 days. Here's the brutal truth.

**Body:**

Hey r/gamedev,

**The context:**
- Filed for bankruptcy earlier this year
- Spent 90 days building GG LOOP from scratch
- Solo founder, no team, no funding
- Platform is LIVE but early stage

**The REAL stats (no bullshit):**
- Total users: 5
- Active today: 0  
- Revenue: $0 (payment system debugging)
- Points earned: 4,000
- Rewards claimed: 0

**Tech I used:**
- React + Vite + TypeScript
- Express + PostgreSQL + Drizzle ORM
- Electron for desktop verification
- Railway (costs $20/month)

**What actually works:**
- Desktop app detects 17+ games
- Process monitoring (no API needed)
- Anti-idle verification
- Point earning system
- Reward shop infrastructure

**What's broken:**
- PayPal integration (env var hell)
- User acquisition (obviously)
- Some edge cases in game detection
- Scaling will be... interesting

**Biggest lessons:**
1. **Ship before you're ready** - I over-engineered for months
2. **Users > features** - Built 17 game support instead of validating with 1
3. **Solo is hard** - No one to bounce ideas off
4. **Revenue is HARD** - Even when the product works

**Why I'm posting:**
Building in complete isolation is brutal. Want feedback from devs who've been here.

**Questions for you:**
- Would you prioritize fixing bugs or getting more users?
- How do you validate demand when you have 5 users?
- What would you build next?

Not looking for signups. Genuinely want to know if I'm solving a real problem or wasting my time.

Live site (bugs included): ggloop.io

**Tech details if anyone cares:**
- Game detection: Process enumeration + window title matching
- Anti-cheat: Input activity monitoring (mouse/keyboard)
- Points: Time-based with multipliers
- Verification: Desktop app → Server validation → DB storage

Happy to answer technical questions or just commiserate about the solo founder struggle.

---

## Alternative: "Day 90" Post

**Title:**
Day 90 of building a gaming platform - 5 users, $0 revenue, 100% learning

**Body:**

**Stats (no lies):**
- Users: 5
- Revenue: $0
- Days building: 90
- Games supported: 17
- Coffee consumed: Too much

**What's working:**
- Platform is live
- Desktop verification works
- Points system functional
- Haven't given up yet

**What's not:**
- User growth (clearly)
- Revenue (payment bugs)
- Work-life balance (what's that?)

**The tech:**
Full TypeScript stack, Electron app, PostgreSQL, Railway hosting.

**Solo founder realizations:**
1. Building is the easy part
2. Getting users is impossibly hard
3. Bankruptcy to production feels cool but doesn't pay bills
4. Need feedback from people who aren't me

**Question for r/gamedev:**
At what point do you pivot vs. keep grinding?

5 users in 90 days could mean:
- A) Product sucks
- B) Marketing sucks  
- C) Both

Honest feedback wanted. Roast me if needed.

ggloop.io

---

## Key Changes Made:

✅ **Real numbers:** 5 users, not 500  
✅ **Honest about problems:** $0 revenue, payment broken, 0 active today  
✅ **Authentic tone:** "brutal truth", "no bullshit"  
✅ **Vulnerable:** Admits struggles, asks for help  
✅ **Specific metrics:** Actual database stats  
✅ **Self-aware:** Acknowledges potential failure

This will resonate WAY more than fake metrics. Other solo devs will relate.
