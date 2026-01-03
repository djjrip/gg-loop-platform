/**
 * NEXUS Content Generator
 * 
 * Generates fresh, authentic content for each angle.
 * No hype. Plain English. References current shipped features.
 */

interface ContentOutput {
    twitter: string;
    reddit: {
        title: string;
        content: string;
        subreddit: string;
    };
}

// Current shipped features (source of truth)
const SHIPPED_FEATURES = [
    'Live platform at ggloop.io',
    'Twitch authentication working',
    'Riot Games account linking',
    'Desktop verification app (built)',
    'Points and rewards system',
    'Subscription tiers (Standard, Premium, VIP)',
    'NEXUS autonomous operating brain',
    'Founder desktop app with real-time beacon',
    'Autonomous distribution engine',
    'Zero-friction auto-authentication',
];

const CURRENT_GAPS = [
    'No users beyond beta',
    'Zero marketing spend',
    'Desktop app not publicly released',
    'No strategic partnerships yet',
];

const WOULD_UNLOCK = [
    '$5K marketing budget for targeted gaming ads',
    'Strategic partnership with esports organization',
    'Content consistency (now automated)',
    'Public desktop app launch',
];

/**
 * Generate content for a specific angle
 */
export function generateContent(angle: string): ContentOutput {
    switch (angle) {
        case 'build_log':
            return generateBuildLog();
        case 'shipping_proof':
            return generateShippingProof();
        case 'failure_fix':
            return generateFailureFix();
        case 'product_value':
            return generateProductValue();
        case 'monetization_clarity':
            return generateMonetizationClarity();
        case 'investor_signal':
            return generateInvestorSignal();
        case 'founder_reality':
            return generateFounderReality();
        case 'system_design':
            return generateSystemDesign();
        case 'automation_lesson':
            return generateAutomationLesson();
        default:
            return generateFounderReality();
    }
}

function generateBuildLog(): ContentOutput {
    return {
        twitter: `Build log — ${new Date().toLocaleDateString()}

Shipped:
→ NEXUS now runs autonomously
→ Distribution engine with safety gates
→ Reality-first credential handling

Next: Public desktop app release

ggloop.io`,
        reddit: {
            title: `[Build Log] Week ${getWeekNumber()} - NEXUS Autonomous Brain`,
            content: `## What I Built This Week

### NEXUS Operating Brain
An autonomous system that:
- Monitors platform health 24/7
- Detects when I'm building without distributing
- Forces content creation before more building
- Self-heals when APIs fail

### Distribution Engine
- Generates content from shipped features
- Posts to Twitter and Reddit automatically
- Rotates angles to avoid repetition
- Respects rate limits

### Current State
${SHIPPED_FEATURES.slice(0, 5).map(f => `- ${f}`).join('\n')}

### What's Missing
${CURRENT_GAPS.map(g => `- ${g}`).join('\n')}

---

*Building in public. No hype.*`,
            subreddit: 'BuildYourVibe',
        },
    };
}

function generateShippingProof(): ContentOutput {
    const feature = SHIPPED_FEATURES[Math.floor(Math.random() * SHIPPED_FEATURES.length)];
    return {
        twitter: `Shipped: ${feature}

Not a mockup. Not a prototype. In production.

ggloop.io`,
        reddit: {
            title: `[Shipped] ${feature}`,
            content: `## Just Shipped

**${feature}**

This is live in production right now, not a demo.

### Why This Matters
Every shipped feature is leverage. It compounds over time.

### Next Up
Working on public desktop app release.

---

*Real shipping, not announcement theater.*`,
            subreddit: 'SideProject',
        },
    };
}

function generateFailureFix(): ContentOutput {
    return {
        twitter: `Failure → Fix pattern this week:

Problem: Distribution kept saying "credentials missing" even when they worked

Fix: Reality-first logic. If a post succeeded, channel is VALID. Period.

Never question what works.`,
        reddit: {
            title: `[Postmortem] When Your System Contradicts Reality`,
            content: `## The Bug

My distribution system kept blocking posts, claiming "credentials missing."

But I could clearly see tweets had posted successfully.

## The Root Cause

The credential verifier was running startup checks that failed (network timeout), but the actual posting worked fine.

Two different code paths. Split brain.

## The Fix

**Reality-first principle:**
- If a post succeeds → Channel is VALID (period)
- Execution success is the highest authority signal
- Never re-question something that worked within 24h

## The Lesson

Trust execution over configuration. Observed reality > preflight checks.

---

*Building systems that don't fight themselves.*`,
            subreddit: 'BuildYourVibe',
        },
    };
}

function generateProductValue(): ContentOutput {
    return {
        twitter: `GG LOOP = Competitive gaming accountability

→ Link your Riot/Twitch accounts
→ Track real performance
→ Earn points for consistency
→ Redeem for gaming gear

For gamers who want to prove they're improving.

ggloop.io`,
        reddit: {
            title: `Building a Gaming Accountability Platform`,
            content: `## The Problem

Gamers want to improve but have no accountability system.

## The Solution

GG LOOP connects to your gaming accounts and tracks real performance:
- Riot Games integration (Valorant, LoL)
- Twitch streaming verification
- Points for consistency
- Subscription tiers with benefits

## Current State
- Platform live
- Core features working
- Desktop verification app built
- Zero marketing budget

## What I'm Learning

Building the product is only 20% of the work. Distribution is everything.

---

*Would love feedback from anyone in the gaming space.*`,
            subreddit: 'startups',
        },
    };
}

function generateMonetizationClarity(): ContentOutput {
    return {
        twitter: `GG LOOP monetization (honest):

Ready: Subscription tiers
Premature: Power automation
Potential: White-label for orgs

Not selling. Observing what people actually want.

ggloop.io`,
        reddit: {
            title: `[Monetization] When to Start Charging`,
            content: `## Current State

Built the product. Zero users paying yet.

## What I've Learned

### Ready to Monetize
- Subscription tiers are built (Standard, Premium, VIP)
- Payment processing ready
- Value proposition clear

### Too Early
- Power automation features (need usage data first)
- Enterprise/org licensing (need proof of demand)

### My Approach

Not forcing monetization. Watching what users actually do, then charging for that.

## The Question

When did you start charging? What signals did you wait for?

---

*Building revenue, not just products.*`,
            subreddit: 'startups',
        },
    };
}

function generateInvestorSignal(): ContentOutput {
    return {
        twitter: `Execution velocity this week:

→ 15 commits
→ 3 major features shipped
→ Zero downtime
→ Autonomous distribution running

Building leverage, not just features.

ggloop.io`,
        reddit: {
            title: `[Progress] What Solo Development Actually Looks Like`,
            content: `## This Week's Reality

### Shipped
- NEXUS autonomous operating brain
- Distribution engine with retry logic
- Desktop founder app
- Reality-first credential handling

### Numbers
- 15 commits
- 3 major features
- Zero downtime
- Platform healthy

### What I'm Optimizing For

Execution velocity + technical leverage.

Every system I build should multiply future output.

---

*Not looking for funding. Just documenting the journey.*`,
            subreddit: 'SideProject',
        },
    };
}

function generateFounderReality(): ContentOutput {
    return {
        twitter: `Founder reality check:

Built: ${SHIPPED_FEATURES.length} features
Users: ~0
Revenue: $0
Runway: Self-funded

The product works. Distribution is the real problem.

ggloop.io`,
        reddit: {
            title: `[Honest] The Gap Between Building and Growing`,
            content: `## Where I Am

- Platform: Live and working
- Features: ${SHIPPED_FEATURES.length} shipped
- Users: Basically zero
- Revenue: $0
- Marketing: $0 spent

## The Real Problem

I built a complete product. Nobody knows it exists.

Classic indie dev trap: building is comfortable, marketing is not.

## What I'm Doing About It

Built an autonomous system that forces me to distribute before building more.

NEXUS literally blocks new features until I announce what shipped.

## The Lesson

If you know you'll skip marketing, build a system that makes it automatic.

---

*Being honest about where I am.*`,
            subreddit: 'BuildYourVibe',
        },
    };
}

function generateSystemDesign(): ContentOutput {
    return {
        twitter: `System design win:

Built NEXUS with 6 states:
- STABLE_AND_PRODUCING (green)
- STABLE_BUT_IDLE (yellow)  
- MISALIGNED (orange)
- BROKEN_PLATFORM (red)
- BROKEN_OUTPUT (red)
- RISKY_DRIFT (purple)

One beacon. Full visibility.`,
        reddit: {
            title: `[System Design] A 6-State Operating Model for Solo Founders`,
            content: `## The Problem

As a solo founder, I couldn't tell if I was making progress or just busy.

## The Solution

Created NEXUS with 6 possible states:

| State | Color | Meaning |
|-------|-------|---------|
| STABLE_AND_PRODUCING | 🟢 | Healthy + shipping |
| STABLE_BUT_IDLE | 🟡 | Working but stalled |
| MISALIGNED | 🟠 | Building without distributing |
| BROKEN_PLATFORM | 🔴 | Infrastructure down |
| BROKEN_OUTPUT | 🔴 | Can't ship |
| RISKY_DRIFT | 🟣 | Trending wrong direction |

## How It Works

1. Every 30 min, observe all systems
2. Classify into one state
3. Take appropriate action automatically

## The Insight

State machines aren't just for code. They work for businesses too.

---

*What mental models help you track progress?*`,
            subreddit: 'BuildYourVibe',
        },
    };
}

function generateAutomationLesson(): ContentOutput {
    return {
        twitter: `Automation lesson:

I kept building but forgot to announce.

So I built a system that blocks me from coding until I distribute.

Forced behavior > optional behavior.`,
        reddit: {
            title: `[Lesson] Automating Your Own Weaknesses`,
            content: `## My Weakness

I love building. I hate marketing.

Result: Shipped features nobody knew about.

## The Fix

Built an autonomous system (NEXUS) that:
1. Detects when I'm building without distributing
2. Blocks further development
3. Forces content creation
4. Posts automatically

## The Principle

**If you know you'll skip something, automate it.**

Don't rely on discipline. Build systems that force the behavior.

## What I Automated
- Distribution (tweets, Reddit posts)
- Health monitoring
- State classification
- Content generation

## The Result

GG LOOP now distributes without me thinking about it.

---

*What have you automated to fix your weaknesses?*`,
            subreddit: 'BuildYourVibe',
        },
    };
}

function getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
}

export { SHIPPED_FEATURES, CURRENT_GAPS, WOULD_UNLOCK };
