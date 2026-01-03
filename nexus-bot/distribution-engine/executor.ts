/**
 * NEXUS Distribution Engine - Distribution Executor
 * Posts to X (Twitter) and Reddit
 */

import { ContentDraft, PostRecord, DistributionMemory } from './types';
import { distributionConfig } from './config';

/**
 * Post to Twitter
 * Uses existing Twitter API integration
 */
export async function postToTwitter(draft: ContentDraft): Promise<PostRecord> {
    const record: PostRecord = {
        id: `twitter-${Date.now()}`,
        channel: 'twitter',
        content: draft.content,
        signalType: draft.signal.type,
        postedAt: new Date(),
        success: false,
    };

    try {
        // Dynamic import to avoid breaking if Twitter not configured
        const { TwitterApi } = await import('twitter-api-v2');

        const appKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CONSUMER_KEY;
        const appSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CONSUMER_SECRET;
        const accessToken = process.env.TWITTER_ACCESS_TOKEN;
        const accessSecret = process.env.TWITTER_ACCESS_SECRET;

        if (!appKey || !appSecret || !accessToken || !accessSecret) {
            record.error = 'Twitter credentials not configured';
            console.log('[Distribution] Twitter credentials missing - skipping');
            return record;
        }

        const client = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
        });

        const result = await client.v2.tweet(draft.content);
        record.success = true;
        record.id = result.data.id;
        console.log(`[Distribution] ✅ Posted to Twitter: ${result.data.id}`);

    } catch (error: any) {
        record.error = error.message;
        console.error('[Distribution] Twitter post failed:', error.message);
    }

    return record;
}

/**
 * Post to Reddit
 * Uses Reddit API (snoowrap)
 */
export async function postToReddit(draft: ContentDraft): Promise<PostRecord> {
    const record: PostRecord = {
        id: `reddit-${Date.now()}`,
        channel: 'reddit',
        content: draft.content,
        signalType: draft.signal.type,
        postedAt: new Date(),
        success: false,
    };

    try {
        // Check for Reddit credentials
        const clientId = process.env.REDDIT_CLIENT_ID;
        const clientSecret = process.env.REDDIT_CLIENT_SECRET;
        const username = process.env.REDDIT_USERNAME;
        const password = process.env.REDDIT_PASSWORD;

        if (!clientId || !clientSecret || !username || !password) {
            record.error = 'Reddit credentials not configured';
            console.log('[Distribution] Reddit credentials missing - saving draft for manual post');

            // Save draft to file for manual posting
            saveDraftForManualPost(draft);
            return record;
        }

        // Dynamic import snoowrap
        const Snoowrap = (await import('snoowrap')).default;

        const reddit = new Snoowrap({
            userAgent: 'GGLoop Distribution Bot',
            clientId,
            clientSecret,
            username,
            password,
        });

        const subreddit = await reddit.getSubreddit(draft.subreddit || distributionConfig.reddit.subreddit);
        const submission = await subreddit.submitSelfpost({
            title: draft.title || 'GG LOOP Update',
            text: draft.content,
        });

        record.success = true;
        record.id = submission.name;
        console.log(`[Distribution] ✅ Posted to Reddit: ${submission.name}`);

    } catch (error: any) {
        record.error = error.message;
        console.error('[Distribution] Reddit post failed:', error.message);

        // Save draft for manual posting
        saveDraftForManualPost(draft);
    }

    return record;
}

/**
 * Save draft for manual posting when API fails
 */
function saveDraftForManualPost(draft: ContentDraft): void {
    const fs = require('fs');
    const path = require('path');

    const draftsPath = path.resolve(process.cwd(), distributionConfig.output.draftsFile);
    const dir = path.dirname(draftsPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let drafts: ContentDraft[] = [];
    if (fs.existsSync(draftsPath)) {
        try {
            drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
        } catch { }
    }

    drafts.push(draft);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2), 'utf-8');
    console.log(`[Distribution] Draft saved to ${draftsPath}`);
}

/**
 * Execute distribution for a draft
 */
export async function executeDistribution(draft: ContentDraft): Promise<PostRecord> {
    if (draft.channel === 'twitter') {
        return postToTwitter(draft);
    } else if (draft.channel === 'reddit') {
        return postToReddit(draft);
    }

    return {
        id: `unknown-${Date.now()}`,
        channel: draft.channel,
        content: draft.content,
        signalType: draft.signal.type,
        postedAt: new Date(),
        success: false,
        error: 'Unknown channel',
    };
}
