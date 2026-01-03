/**
 * NEXUS Autonomous Distribution Engine - Governor Mode
 * 
 * REALITY-FIRST PRINCIPLE:
 * - Execution success is the highest authority signal
 * - Never re-question a channel that worked within 24 hours
 * - Governor Mode acts with confidence, not paranoia
 */

import * as fs from 'fs';
import * as path from 'path';
import { DistributionMemory, ContentDraft, PostRecord } from './types';
import { distributionConfig } from './config';
import { detectSignals, getTopSignal } from './signal-detector';
import { synthesizeTwitterPost, synthesizeRedditPost, selectChannel } from './content-synthesizer';
import { runSafetyChecks } from './safety-gate';
import { executeDistribution } from './executor';
import { getAvailableChannels, getStatusForFounder, quickVerify } from './credential-verifier';

const MEMORY_PATH = distributionConfig.output.memoryFile;
const QUEUE_PATH = path.resolve(__dirname, 'queued_posts.json');

interface QueuedPost {
    draft: ContentDraft;
    queuedAt: string;
    retryCount: number;
    channel: string;
}

/**
 * Load distribution memory
 */
function loadMemory(): DistributionMemory {
    try {
        const memPath = path.resolve(process.cwd(), MEMORY_PATH);
        if (fs.existsSync(memPath)) {
            return JSON.parse(fs.readFileSync(memPath, 'utf-8'));
        }
    } catch { }
    return {
        lastTwitterPost: null,
        lastRedditPost: null,
        postHistory: [],
        postingStreak: 0,
        totalPosts: 0,
    };
}

/**
 * Save distribution memory
 */
function saveMemory(memory: DistributionMemory): void {
    const memPath = path.resolve(process.cwd(), MEMORY_PATH);
    const dir = path.dirname(memPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(memPath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Load queued posts for retry
 */
function loadQueue(): QueuedPost[] {
    try {
        if (fs.existsSync(QUEUE_PATH)) {
            return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));
        }
    } catch { }
    return [];
}

/**
 * Save queue
 */
function saveQueue(queue: QueuedPost[]): void {
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf-8');
}

/**
 * Add to retry queue
 */
function queueForRetry(draft: ContentDraft): void {
    const queue = loadQueue();

    // Check for duplicates
    const exists = queue.some(q =>
        q.draft.content === draft.content &&
        q.draft.channel === draft.channel
    );

    if (!exists) {
        queue.push({
            draft,
            queuedAt: new Date().toISOString(),
            retryCount: 0,
            channel: draft.channel,
        });
        saveQueue(queue);
        console.log(`   📋 Queued for auto-retry: ${draft.channel}`);
    }
}

/**
 * Update posting streak
 */
function updateStreak(memory: DistributionMemory): void {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const postedYesterday = memory.postHistory.some(p =>
        new Date(p.postedAt).getTime() > yesterday && p.success
    );
    memory.postingStreak = postedYesterday ? memory.postingStreak + 1 : 0;
}

/**
 * Save ready-to-post content for manual assist mode
 */
function saveManualContent(drafts: ContentDraft[]): void {
    const manualPath = path.resolve(__dirname, 'manual_ready.json');
    fs.writeFileSync(manualPath, JSON.stringify({
        preparedAt: new Date().toISOString(),
        message: 'Distribution channels recovering. Content ready for manual posting.',
        drafts: drafts.map(d => ({
            channel: d.channel,
            title: d.title,
            content: d.content,
            subreddit: d.subreddit,
        })),
    }, null, 2), 'utf-8');
}

/**
 * THE MAIN DISTRIBUTION RUN - GOVERNOR MODE (REALITY-FIRST)
 */
export async function runDistribution(dryRun: boolean = false): Promise<void> {
    console.log('\n' + '▓'.repeat(60));
    console.log('▓ NEXUS DISTRIBUTION ENGINE - REALITY-FIRST');
    console.log('▓'.repeat(60) + '\n');

    const memory = loadMemory();
    updateStreak(memory);

    // PHASE 0: QUICK CHANNEL CHECK (no blocking verification)
    console.log('🔐 CHECKING channel availability...');
    const channelStatus = quickVerify();
    const availableChannels = getAvailableChannels();

    console.log(`   Status: ${getStatusForFounder()}`);
    console.log(`   Available: ${availableChannels.length > 0 ? availableChannels.join(', ') : 'attempting all'}`);


    // PHASE 1: SIGNAL DETECTION
    console.log('\n📡 DETECTING signals...');
    const signals = detectSignals();
    console.log(`   Found ${signals.length} signals`);

    if (signals.length === 0) {
        console.log('   ⚠️ No signals detected - nothing to distribute');
        console.log('\n✅ Distribution run complete (no action).\n');
        return;
    }

    const topSignal = getTopSignal(signals);
    if (!topSignal) {
        console.log('   ⚠️ No actionable signal');
        return;
    }

    console.log(`   Top signal: [${topSignal.priority}] ${topSignal.type} - ${topSignal.title}`);

    // PHASE 2: CHANNEL SELECTION (based on available channels)
    let channelChoice = selectChannel(topSignal);

    // Filter to only available channels
    if (channelChoice === 'both') {
        if (!availableChannels.includes('twitter') && availableChannels.includes('reddit')) {
            channelChoice = 'reddit';
        } else if (availableChannels.includes('twitter') && !availableChannels.includes('reddit')) {
            channelChoice = 'twitter';
        } else if (availableChannels.length === 0) {
            channelChoice = 'both'; // Will fall through to manual mode
        }
    } else if (!availableChannels.includes(channelChoice as any)) {
        // Preferred channel unavailable, try other
        if (availableChannels.length > 0) {
            channelChoice = availableChannels[0];
        }
    }

    console.log(`\n📌 CHANNEL: ${channelChoice} (filtered by availability)`);

    // PHASE 3: CONTENT SYNTHESIS
    console.log('\n✍️  SYNTHESIZING content...');
    const drafts: ContentDraft[] = [];

    if (channelChoice === 'twitter' || channelChoice === 'both') {
        const twitterDraft = synthesizeTwitterPost(topSignal);
        drafts.push(twitterDraft);
        console.log(`   Twitter draft: "${twitterDraft.content.substring(0, 50)}..."`);
    }

    if (channelChoice === 'reddit' || channelChoice === 'both') {
        const redditDraft = synthesizeRedditPost(topSignal);
        drafts.push(redditDraft);
        console.log(`   Reddit draft: "${redditDraft.title}"`);
    }

    // PHASE 4: SAFETY CHECKS
    console.log('\n🛡️  RUNNING safety checks...');
    const safetyResults: Array<{ draft: ContentDraft; canPost: boolean; reason?: string }> = [];

    for (const draft of drafts) {
        const result = runSafetyChecks(draft, memory);
        safetyResults.push({ draft, ...result });
        console.log(`   ${draft.channel}: ${result.canPost ? '✅ SAFE' : '❌ BLOCKED'} ${result.reason || ''}`);
    }

    // PHASE 5: EXECUTION
    console.log('\n📤 EXECUTING distribution...');

    const safeDrafts = safetyResults.filter(r => r.canPost);

    // Handle no available channels - MANUAL ASSIST MODE
    if (availableChannels.length === 0 && !dryRun) {
        console.log('   ⚠️ All channels unavailable - entering MANUAL ASSIST MODE');
        saveManualContent(safeDrafts.map(s => s.draft));

        for (const { draft } of safeDrafts) {
            queueForRetry(draft);
        }

        console.log('   📋 Content queued for auto-retry');
        console.log('   📝 Manual content saved to manual_ready.json');
        console.log('\n' + '═'.repeat(60));
        console.log('📊 MANUAL ASSIST MODE ACTIVE');
        console.log(`   Next auto-retry: ${credStatus.nextRetry || 'On next run'}`);
        console.log('═'.repeat(60) + '\n');
        return;
    }

    if (safeDrafts.length === 0) {
        console.log('   ⚠️ All drafts blocked by safety gate');
        console.log('\n✅ Distribution run complete (skipped).\n');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const { draft } of safeDrafts) {
        // Check if this specific channel is available
        const channelAvailable = availableChannels.includes(draft.channel as any);

        if (dryRun) {
            console.log(`   [DRY RUN] Would post to ${draft.channel}:`);
            console.log(`   ${draft.content.substring(0, 100)}...`);

            const draftPath = path.resolve(process.cwd(), distributionConfig.output.draftsFile);
            const dir = path.dirname(draftPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            let existingDrafts: ContentDraft[] = [];
            if (fs.existsSync(draftPath)) {
                try { existingDrafts = JSON.parse(fs.readFileSync(draftPath, 'utf-8')); } catch { }
            }
            existingDrafts.push(draft);
            fs.writeFileSync(draftPath, JSON.stringify(existingDrafts, null, 2), 'utf-8');
            console.log(`   📄 Draft saved to ${draftPath}`);

        } else if (!channelAvailable) {
            // Channel not available - queue for retry, don't fail loudly
            console.log(`   ⏳ ${draft.channel} unavailable - queuing for auto-retry`);
            queueForRetry(draft);
            failCount++;

        } else {
            // Channel available - execute
            const record = await executeDistribution(draft);
            memory.postHistory.push(record);

            if (record.success) {
                memory.totalPosts++;
                successCount++;
                if (draft.channel === 'twitter') {
                    memory.lastTwitterPost = record.postedAt;
                } else if (draft.channel === 'reddit') {
                    memory.lastRedditPost = record.postedAt;
                }
                console.log(`   ✅ Posted to ${draft.channel}`);
            } else {
                console.log(`   ❌ Failed: ${record.error}`);
                queueForRetry(draft);
                failCount++;
            }
        }
    }

    // PHASE 6: SAVE & REPORT
    saveMemory(memory);

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 STATS: ${memory.totalPosts} total | ${memory.postingStreak} day streak | ${successCount} posted | ${failCount} queued`);
    console.log('═'.repeat(60));
    console.log('\n✅ Distribution run complete.\n');
}

// CLI entry point
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No actual posts will be made\n');
}

runDistribution(dryRun).catch(console.error);

export { runDistribution as default };
