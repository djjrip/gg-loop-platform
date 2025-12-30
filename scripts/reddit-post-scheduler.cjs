#!/usr/bin/env node
/**
 * REDDIT POST SCHEDULER
 * Autonomous community seeding across developer subreddits
 * Run: node scripts/reddit-post-scheduler.cjs
 */

const SUBREDDIT_TARGETS = [
    {
        sub: 'r/webdev',
        title: 'Built a gamified IDE tracker - your flow state = XP',
        body: `Been coding for 6+ hours straight and realized: why isn't my IDE rewarding me for this?

Built **Vibe Coding** - tracks VS Code/Cursor activity and gives you XP for coding sessions. The longer you're in flow state, the more you earn.

**How it works:**
- 10 XP/minute for coding (any language)
- Tracks focus time, not just idle editor open
- Builder Tier (\\$12/mo) gets 2x XP multiplier
- Exchange XP for gift cards, swag, etc.

Started as a gaming rewards platform (GG LOOP), pivoted when I realized developers are the real gamers. Built the campaign in 72 hours, deployed to production yesterday.

**Tech:** TypeScript, React, Express, PostgreSQL, AWS, Railway

Live at: [ggloop.io/vibe-coding](https://ggloop.io/vibe-coding)

Curious what y'all think. Too gimmicky or actually useful?`,
        scheduled: false,
        posted: false
    },
    {
        sub: 'r/programming',
        title: 'Get paid to code: turning flow state into rewards',
        body: `**Concept:** What if your IDE tracked your coding sessions and rewarded you for time spent in flow state?

I built Vibe Coding to test this idea:
- Detects when you're actively coding (not idle)
- Gives XP based on focus time  
- XP converts to real rewards

**Why I built this:**
- Came from bankruptcy, taught myself to code
- Spent 90 days building a gaming rewards platform
- Realized developers ARE gamers - we grind harder than anyone

**Revenue model:**
- Free: 10 XP/min
- Builder Tier (\\$12/mo): 20 XP/min (2x multiplier)
- Testing if developers will pay for gamification

**Tech details:**
- VS Code extension tracks activity
- Express backend with PostgreSQL
- Real-time XP calculation
- Deployed on Railway (learned module resolution the hard way)

Is this something you'd use? Or is gamifying coding cringe?

Live: [ggloop.io/vibe-coding](https://ggloop.io/vibe-coding)`,
        scheduled: false,
        posted: false
    },
    {
        sub: 'r/IndieHackers',
        title: '$0 to first customer: 72-hour campaign launch',
        body: `**Context:** Built GG LOOP (gaming rewards platform) in 90 days from bankruptcy. Launched with 5 users, \\$0 revenue.

**The Pivot (72 hours ago):**
Realized gamers don't just play - they code. Built "Vibe Coding" campaign:
- Get paid for coding sessions in VS Code/Cursor
- Gamified XP system (10 XP/min, 20 with paid tier)
- Builder Tier: \\$12/mo for 2x multiplier

**What I shipped in 72h:**
- Landing page (static HTML + React)
- VS Code extension (activity tracking)
- Email infrastructure (AWS SES)
- AI Twitter automation (Bedrock)
- Reddit community (r/BuildYourVibe)
- Revenue tracking automation
- 5 TikTok scripts ready

**Deployment hell:**
- 16 Railway attempts (ESM/CommonJS nightmares)
- PostCSS had to be CommonJS not ESM
- tsx module resolution broke everything
- Final fix: proper .js extensions + compiled TypeScript

**Current status:**
- Production LIVE (just fixed today)
- 0 paying customers (yet)
- First goal: \\$12 MRR (1 Builder Tier signup)

**Question for IH community:**
How do you get your FIRST paying customer when you're completely unknown? Email blast? DMs? Paid ads?

Live campaign: [ggloop.io/vibe-coding](https://ggloop.io/vibe-coding)

Building in public. Every number is real.`,
        scheduled: false,
        posted: false
    }
];

async function scheduleNextPost() {
    console.log('📅 REDDIT POST SCHEDULER\n');
    console.log(`Current time: ${new Date().toLocaleString()}\n`);

    const unposted = SUBREDDIT_TARGETS.filter(p => !p.posted);

    if (unposted.length === 0) {
        console.log('✅ All posts already scheduled/posted\n');
        return;
    }

    console.log('📋 SCHEDULED POSTS:\n');
    SUBREDDIT_TARGETS.forEach((post, idx) => {
        const status = post.posted ? '✅ POSTED' : post.scheduled ? '⏰ SCHEDULED' : '⚪ PENDING';
        console.log(`${idx + 1}. ${post.sub}: ${status}`);
        console.log(`   Title: ${post.title.substring(0, 50)}...`);
    });

    console.log('\n📌 POSTING GUIDELINES:\n');
    console.log('1. Wait 24-48h between posts to different subs');
    console.log('2. Engage authentically in comments');
    console.log('3. Don\'t self-promote in other threads');
    console.log('4. Respond to feedback within 2h\n');

    console.log('🎯 RECOMMENDED SCHEDULE:\n');
    console.log('Day 1: r/webdev (technical audience)');
    console.log('Day 2: r/programming (broader dev community)');
    console.log('Day 3: r/IndieHackers (entrepreneurial angle)\n');

    console.log('⚠️  MANUAL ACTION REQUIRED:\n');
    console.log('These posts require human review before posting.');
    console.log('Copy content from SUBREDDIT_TARGETS array above.\n');
}

scheduleNextPost();

module.exports = { SUBREDDIT_TARGETS };
