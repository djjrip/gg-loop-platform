/**
 * NEXUS Autonomous Distribution Engine - Main Orchestrator
 * 
 * THE COMPLETE PIPELINE:
 * Signal Detection → Content Synthesis → Safety Gate → Execution → Feedback
 * 
 * Usage: npx tsx nexus-bot/distribution-engine/index.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { DistributionMemory, ContentDraft, PostRecord } from './types';
import { distributionConfig } from './config';
import { detectSignals, getTopSignal } from './signal-detector';
import { synthesizeTwitterPost, synthesizeRedditPost, selectChannel } from './content-synthesizer';
import { runSafetyChecks } from './safety-gate';
import { executeDistribution } from './executor';

const MEMORY_PATH = distributionConfig.output.memoryFile;

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
 * Update posting streak
 */
function updateStreak(memory: DistributionMemory): void {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const postedYesterday = memory.postHistory.some(p =>
        new Date(p.postedAt).getTime() > yesterday && p.success
    );

    if (postedYesterday) {
        memory.postingStreak++;
    } else {
        memory.postingStreak = 0;
    }
}

/**
 * Generate distribution status report
 */
function generateStatusReport(memory: DistributionMemory, result: 'posted' | 'skipped', details: string): string {
    const report = {
        timestamp: new Date().toISOString(),
        result,
        details,
        stats: {
            totalPosts: memory.totalPosts,
            postingStreak: memory.postingStreak,
            postsThisWeek: memory.postHistory.filter(p =>
                new Date(p.postedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
            ).length,
        },
    };

    return JSON.stringify(report, null, 2);
}

/**
 * THE MAIN DISTRIBUTION RUN
 */
export async function runDistribution(dryRun: boolean = false): Promise<void> {
    console.log('\n' + '▓'.repeat(60));
    console.log('▓ NEXUS DISTRIBUTION ENGINE');
    console.log('▓'.repeat(60) + '\n');

    const memory = loadMemory();
    updateStreak(memory);

    // PHASE 1: SIGNAL DETECTION
    console.log('📡 DETECTING signals...');
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

    // PHASE 2: CHANNEL SELECTION
    const channelChoice = selectChannel(topSignal);
    console.log(`\n📌 CHANNEL: ${channelChoice}`);

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

    if (safeDrafts.length === 0) {
        console.log('   ⚠️ All drafts blocked by safety gate');
        console.log('\n✅ Distribution run complete (skipped).\n');
        return;
    }

    for (const { draft } of safeDrafts) {
        if (dryRun) {
            console.log(`   [DRY RUN] Would post to ${draft.channel}:`);
            console.log(`   ${draft.content.substring(0, 100)}...`);

            // Save draft for review
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

        } else {
            const record = await executeDistribution(draft);
            memory.postHistory.push(record);

            if (record.success) {
                memory.totalPosts++;
                if (draft.channel === 'twitter') {
                    memory.lastTwitterPost = record.postedAt;
                } else if (draft.channel === 'reddit') {
                    memory.lastRedditPost = record.postedAt;
                }
                console.log(`   ✅ Posted to ${draft.channel}`);
            } else {
                console.log(`   ❌ Failed: ${record.error}`);
            }
        }
    }

    // PHASE 6: SAVE & REPORT
    saveMemory(memory);

    const statusReport = generateStatusReport(
        memory,
        safeDrafts.length > 0 ? 'posted' : 'skipped',
        `Processed ${signals.length} signals, ${safeDrafts.length} posts attempted`
    );

    // Save log
    const logPath = path.resolve(process.cwd(), distributionConfig.output.logFile);
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let logs: any[] = [];
    if (fs.existsSync(logPath)) {
        try { logs = JSON.parse(fs.readFileSync(logPath, 'utf-8')); } catch { }
    }
    logs.push(JSON.parse(statusReport));
    fs.writeFileSync(logPath, JSON.stringify(logs.slice(-50), null, 2), 'utf-8'); // Keep last 50

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 STATS: ${memory.totalPosts} total posts | ${memory.postingStreak} day streak`);
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
