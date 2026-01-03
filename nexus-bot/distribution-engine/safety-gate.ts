/**
 * NEXUS Distribution Engine - Safety Gate
 * Prevents posting when platform is broken or content is duplicate
 */

import * as fs from 'fs';
import * as path from 'path';
import { SafetyCheckResult, ContentDraft, DistributionMemory } from './types';
import { distributionConfig } from './config';

/**
 * Run all safety checks before posting
 */
export function runSafetyChecks(draft: ContentDraft, memory: DistributionMemory): SafetyCheckResult {
    // Check 1: Platform state
    const platformCheck = checkPlatformState();
    if (!platformCheck.canPost) return platformCheck;

    // Check 2: Rate limit
    const rateLimitCheck = checkRateLimit(draft, memory);
    if (!rateLimitCheck.canPost) return rateLimitCheck;

    // Check 3: Duplicate detection
    const duplicateCheck = checkDuplicate(draft, memory);
    if (!duplicateCheck.canPost) return duplicateCheck;

    // Check 4: Burnout prevention
    const burnoutCheck = checkBurnoutPrevention(memory);
    if (!burnoutCheck.canPost) return burnoutCheck;

    return { canPost: true };
}

/**
 * Check if platform is in a state where posting is safe
 */
function checkPlatformState(): SafetyCheckResult {
    try {
        const nexusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');
        if (fs.existsSync(nexusPath)) {
            const status = JSON.parse(fs.readFileSync(nexusPath, 'utf-8'));

            if (distributionConfig.safety.blockedNexusStates.includes(status.state)) {
                return {
                    canPost: false,
                    reason: `Platform state is ${status.state} - posting blocked until stable`,
                };
            }
        }
    } catch { }

    return { canPost: true };
}

/**
 * Check rate limits per channel
 */
function checkRateLimit(draft: ContentDraft, memory: DistributionMemory): SafetyCheckResult {
    const now = Date.now();

    if (draft.channel === 'twitter' && memory.lastTwitterPost) {
        const hoursSince = (now - new Date(memory.lastTwitterPost).getTime()) / (1000 * 60 * 60);
        if (hoursSince < distributionConfig.twitter.minHoursBetweenPosts) {
            return {
                canPost: false,
                reason: `Twitter rate limit: ${Math.ceil(distributionConfig.twitter.minHoursBetweenPosts - hoursSince)} hours until next post allowed`,
            };
        }
    }

    if (draft.channel === 'reddit' && memory.lastRedditPost) {
        const hoursSince = (now - new Date(memory.lastRedditPost).getTime()) / (1000 * 60 * 60);
        if (hoursSince < distributionConfig.reddit.minHoursBetweenPosts) {
            return {
                canPost: false,
                reason: `Reddit rate limit: ${Math.ceil(distributionConfig.reddit.minHoursBetweenPosts - hoursSince)} hours until next post allowed`,
            };
        }
    }

    return { canPost: true };
}

/**
 * Check for duplicate content
 */
function checkDuplicate(draft: ContentDraft, memory: DistributionMemory): SafetyCheckResult {
    // Check if same signal type was posted recently (last 24 hours)
    const recentPosts = memory.postHistory.filter(p =>
        new Date(p.postedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    for (const post of recentPosts) {
        if (post.signalType === draft.signal.type && post.channel === draft.channel) {
            return {
                canPost: false,
                reason: `Duplicate signal type ${draft.signal.type} already posted in last 24 hours`,
            };
        }

        // Check content similarity (simple check)
        if (post.content.substring(0, 50) === draft.content.substring(0, 50)) {
            return {
                canPost: false,
                reason: 'Similar content already posted recently',
            };
        }
    }

    return { canPost: true };
}

/**
 * Prevent burnout from over-posting
 */
function checkBurnoutPrevention(memory: DistributionMemory): SafetyCheckResult {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const postsThisWeek = memory.postHistory.filter(p =>
        new Date(p.postedAt).getTime() > weekAgo
    ).length;

    if (postsThisWeek >= distributionConfig.innovation.burnoutPreventionMaxPerWeek) {
        return {
            canPost: false,
            reason: `Burnout prevention: ${postsThisWeek}/${distributionConfig.innovation.burnoutPreventionMaxPerWeek} posts this week`,
        };
    }

    return { canPost: true };
}
