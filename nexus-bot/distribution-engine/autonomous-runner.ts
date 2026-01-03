/**
 * NEXUS Autonomous Distribution Runner
 * 
 * This is the main entry point for autonomous distribution.
 * Runs on startup and executes immediately if MISALIGNED.
 * 
 * Usage: npx tsx nexus-bot/distribution-engine/autonomous-runner.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    loadSchedulerState,
    saveSchedulerState,
    canPostTwitter,
    canPostReddit,
    getNextAngle,
    markAngleUsed,
    recordTwitterPost,
    recordRedditPost,
    resetDailyCounters,
    getSchedulerStatus,
} from './scheduler';
import { generateContent } from './content-generator';
import { executeDistribution } from './executor';
import { markChannelSuccess, markChannelFailure, classifyError, getAvailableChannels } from './credential-verifier';
import { ContentDraft } from './types';

const NEXUS_STATUS_PATH = path.resolve(__dirname, '../NEXUS_STATUS.md');

/**
 * Execute autonomous distribution cycle
 */
async function runAutonomousCycle(): Promise<void> {
    console.log('\n' + '█'.repeat(60));
    console.log('█ NEXUS AUTONOMOUS DISTRIBUTION');
    console.log('█'.repeat(60) + '\n');

    const state = loadSchedulerState();
    resetDailyCounters(state);

    console.log(`📊 Scheduler: ${getSchedulerStatus(state)}`);

    // Check what we can post
    const twitterCheck = canPostTwitter(state);
    const redditCheck = canPostReddit(state);

    let twitterPosted = false;
    let redditPosted = false;

    // TWITTER
    if (twitterCheck.canPost) {
        console.log('\n🐦 TWITTER: Executing...');
        const angle = getNextAngle(state);
        const content = generateContent(angle);

        console.log(`   Angle: ${angle}`);
        console.log(`   Content: "${content.twitter.substring(0, 60)}..."`);

        // Create draft
        const draft: ContentDraft = {
            channel: 'twitter',
            content: content.twitter,
            signal: {
                type: 'scheduled_post',
                title: `Scheduled: ${angle}`,
                description: 'Autonomous distribution',
                timestamp: new Date().toISOString(),
                priority: 'high',
            },
            createdAt: new Date().toISOString(),
        };

        // Execute
        const result = await executeDistribution(draft);

        if (result.success) {
            console.log(`   ✅ Posted: ${result.id}`);
            markAngleUsed(state, angle);
            recordTwitterPost(state);
            markChannelSuccess('twitter');
            twitterPosted = true;
        } else {
            console.log(`   ❌ Failed: ${result.error}`);
            if (result.error === 'RATE_LIMIT') {
                console.log('   ⏳ Rate limited - will retry in 90 minutes');
            }
        }
    } else {
        console.log(`\n🐦 TWITTER: Skipped (${twitterCheck.reason})`);
    }

    // REDDIT
    if (redditCheck.canPost) {
        console.log('\n📕 REDDIT: Executing...');
        const angle = getNextAngle(state);
        const content = generateContent(angle);

        console.log(`   Angle: ${angle}`);
        console.log(`   Title: "${content.reddit.title}"`);

        // Create draft
        const draft: ContentDraft = {
            channel: 'reddit',
            content: content.reddit.content,
            title: content.reddit.title,
            subreddit: content.reddit.subreddit,
            signal: {
                type: 'scheduled_post',
                title: `Scheduled: ${angle}`,
                description: 'Autonomous distribution',
                timestamp: new Date().toISOString(),
                priority: 'high',
            },
            createdAt: new Date().toISOString(),
        };

        // Execute
        const result = await executeDistribution(draft);

        if (result.success) {
            console.log(`   ✅ Posted: ${result.id}`);
            markAngleUsed(state, angle);
            recordRedditPost(state);
            markChannelSuccess('reddit');
            redditPosted = true;
        } else {
            console.log(`   ❌ Failed: ${result.error}`);
        }
    } else {
        console.log(`\n📕 REDDIT: Skipped (${redditCheck.reason})`);
    }

    // Save state
    saveSchedulerState(state);

    // Update NEXUS_STATUS.md
    updateNexusStatus(state, twitterPosted, redditPosted);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`📊 RESULTS: Twitter ${twitterPosted ? '✅' : '⏳'} | Reddit ${redditPosted ? '✅' : '⏳'}`);
    console.log(`📊 TOTALS: ${state.twitterPostsToday}/4 today | ${state.twitterPostsThisMonth}/100 month`);
    console.log('═'.repeat(60) + '\n');
}

/**
 * Update NEXUS_STATUS.md with current state
 */
function updateNexusStatus(state: any, twitterPosted: boolean, redditPosted: boolean): void {
    const now = new Date().toISOString();
    const content = `# NEXUS — GG LOOP Operating Brain

**Last Check:** ${now}  
**Mode:** AUTONOMOUS DISTRIBUTION

---

## 🟢 STATE: DISTRIBUTING

Autonomous distribution engine running. Maximizing visibility.

---

## EXECUTIVE SUMMARY (3 sentences)

**Reality:** Distribution engine executing automatically.  
**Progress:** ${state.twitterPostsToday}/4 tweets today, ${state.twitterPostsThisMonth}/100 this month.  
**Next:** Continuous posting on schedule until cap reached.

---

## 📊 DISTRIBUTION STATUS

| Channel | Today | This Month | Cap | Status |
|---------|-------|------------|-----|--------|
| Twitter | ${state.twitterPostsToday} | ${state.twitterPostsThisMonth} | 100 | ${twitterPosted ? '✅ Just posted' : '⏳ Scheduled'} |
| Reddit | - | - | 2/week | ${redditPosted ? '✅ Just posted' : '⏳ Scheduled'} |

---

## 🔄 CADENCE

| Channel | Rate | Spacing | Next Window |
|---------|------|---------|-------------|
| Twitter | 3-4/day | 6h min | ${getNextWindow(state.lastTwitterPost, 6)} |
| Reddit | 1/48-72h | 48h min | ${getNextWindow(state.lastRedditPost, 48)} |

---

## 🎯 ANGLE ROTATION

Last used: ${state.lastAngle || 'None'}

Available angles (72h cooldown):
- build_log
- shipping_proof
- failure_fix
- product_value
- monetization_clarity
- investor_signal
- founder_reality
- system_design
- automation_lesson

---

## 💡 AUTONOMOUS GUARANTEES

- ✅ Runs without founder input
- ✅ Respects rate limits
- ✅ Rotates content angles
- ✅ Auto-retries on failure
- ✅ Updates status after each post

---

*NEXUS autonomous distribution: Maximizing visibility. Zero friction.*
`;

    fs.writeFileSync(NEXUS_STATUS_PATH, content, 'utf-8');
}

function getNextWindow(lastPost: string | null, hoursSpacing: number): string {
    if (!lastPost) return 'Now';
    const nextTime = new Date(new Date(lastPost).getTime() + hoursSpacing * 60 * 60 * 1000);
    if (nextTime <= new Date()) return 'Now';
    return nextTime.toLocaleTimeString();
}

// Execute immediately
runAutonomousCycle().catch(console.error);
