/**
 * NEXUS Distribution Engine - Content Synthesizer
 * Converts signals into authentic, builder-focused content
 */

import { DistributionSignal, ContentDraft } from './types';
import { distributionConfig } from './config';

/**
 * Generate X (Twitter) post from signal
 * Short-form, authentic, builder-focused
 */
export function synthesizeTwitterPost(signal: DistributionSignal): ContentDraft {
    let content = '';

    switch (signal.type) {
        case 'new_deploy':
            content = `🚀 ${signal.title}\n\n${signal.description}\n\n${signal.proof || 'ggloop.io'}`;
            break;

        case 'feature_shipped':
            content = `📦 shipped: ${signal.title.toLowerCase()}\n\n${signal.description}`;
            break;

        case 'failure_resolved':
            content = `✅ fixed: ${signal.title.replace('Fixed: ', '').toLowerCase()}\n\n${signal.description}\n\nno more silent failures.`;
            break;

        case 'innovation_executed':
            content = `💡 new capability: ${signal.title.replace('Innovation: ', '')}\n\n${signal.description}\n\nbuilding leverage, not just features.`;
            break;

        case 'milestone_reached':
            content = `🎯 ${signal.title}\n\n${signal.description}`;
            break;

        case 'system_insight':
            content = `🧠 insight: ${signal.title}\n\n${signal.description}`;
            break;

        default:
            content = `${signal.title}\n\n${signal.description}`;
    }

    // Ensure under character limit
    if (content.length > distributionConfig.content.twitterMaxLength) {
        content = content.substring(0, distributionConfig.content.twitterMaxLength - 3) + '...';
    }

    return {
        channel: 'twitter',
        content,
        signal,
        createdAt: new Date(),
        proof: signal.proof,
    };
}

/**
 * Generate Reddit post from signal
 * Long-form builder log style
 */
export function synthesizeRedditPost(signal: DistributionSignal): ContentDraft {
    const title = generateRedditTitle(signal);
    const content = generateRedditContent(signal);

    return {
        channel: 'reddit',
        title,
        content,
        subreddit: distributionConfig.reddit.subreddit,
        signal,
        createdAt: new Date(),
        proof: signal.proof,
    };
}

/**
 * Generate Reddit post title
 */
function generateRedditTitle(signal: DistributionSignal): string {
    switch (signal.type) {
        case 'new_deploy':
            return `[Build Log] Deployed: ${signal.title}`;
        case 'feature_shipped':
            return `[Shipped] ${signal.title}`;
        case 'failure_resolved':
            return `[Fixed] ${signal.title} - what broke and how I fixed it`;
        case 'innovation_executed':
            return `[System Design] ${signal.title.replace('Innovation: ', '')}`;
        case 'milestone_reached':
            return `[Milestone] ${signal.title}`;
        default:
            return `[Update] ${signal.title}`;
    }
}

/**
 * Generate Reddit post content (builder log style)
 */
function generateRedditContent(signal: DistributionSignal): string {
    const now = new Date().toISOString().split('T')[0];

    let content = `## Builder Log - ${now}\n\n`;

    content += `### What happened\n${signal.description}\n\n`;

    if (signal.proof) {
        content += `### Proof\n[Live on ggloop.io](${signal.proof})\n\n`;
    }

    switch (signal.type) {
        case 'failure_resolved':
            content += `### What broke\nA failure in our system was detected and fixed automatically.\n\n`;
            content += `### What I learned\nBuilding systems that self-heal is more valuable than never breaking.\n\n`;
            break;
        case 'innovation_executed':
            content += `### Why this matters\nThis removes an entire class of problems, not just one bug.\n\n`;
            content += `### Technical approach\nBuilding leverage through automation rather than manual fixes.\n\n`;
            break;
        default:
            content += `### Context\nBuilding GG LOOP - a platform for gamers to track progress and earn rewards.\n\n`;
    }

    content += `---\n\n*Shipping in public. No hype, just building.*`;

    return content;
}

/**
 * Select best channel for a signal
 */
export function selectChannel(signal: DistributionSignal): 'twitter' | 'reddit' | 'both' {
    // High priority signals go to both
    if (signal.priority === 'high') {
        return 'both';
    }

    // Failure resolved = good for Reddit (detailed story)
    if (signal.type === 'failure_resolved' || signal.type === 'innovation_executed') {
        return 'reddit';
    }

    // Quick updates = Twitter
    return 'twitter';
}
