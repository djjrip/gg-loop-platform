/**
 * NEXUS Distribution Engine - Executor (Environment Unified)
 * 
 * PRINCIPLE: Uses env-discovery to find credentials
 * regardless of which env var alias is used.
 */

import { ContentDraft, PostRecord } from './types';
import { distributionConfig } from './config';
import { markChannelSuccess, markChannelFailure, classifyError } from './credential-verifier';
import { getTwitterCredentials, getRedditCredentials, logEnvVars } from './env-discovery';

/**
 * Post to Twitter
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
        const { TwitterApi } = await import('twitter-api-v2');

        // Use unified credential discovery
        const creds = getTwitterCredentials();

        if (!creds) {
            console.log('[Distribution] Twitter credentials not found - checking env vars:');
            logEnvVars();
            record.error = 'INVALID_CREDENTIALS';
            markChannelFailure('twitter', 'INVALID_CREDENTIALS', 'No valid credentials found');
            return record;
        }

        console.log('[Distribution] Twitter credentials found via env-discovery');

        const client = new TwitterApi({
            appKey: creds.appKey,
            appSecret: creds.appSecret,
            accessToken: creds.accessToken,
            accessSecret: creds.accessSecret,
        });

        const result = await client.v2.tweet(draft.content);

        record.success = true;
        record.id = result.data.id;

        // CRITICAL: Mark channel as valid after successful execution
        markChannelSuccess('twitter');

        console.log(`[Distribution] ✅ Posted to Twitter: ${result.data.id}`);

    } catch (error: any) {
        const reason = classifyError(error);
        record.error = reason;
        markChannelFailure('twitter', reason, error.message);
        console.error(`[Distribution] Twitter failed: ${reason} - ${error.message}`);
    }

    return record;
}

/**
 * Post to Reddit
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
        // Use unified credential discovery
        const creds = getRedditCredentials();

        if (!creds) {
            record.error = 'INVALID_CREDENTIALS';
            markChannelFailure('reddit', 'INVALID_CREDENTIALS', 'No valid credentials found');
            saveDraftForManualPost(draft);
            return record;
        }

        console.log('[Distribution] Reddit credentials found via env-discovery');

        const Snoowrap = (await import('snoowrap')).default;
        const reddit = new Snoowrap({
            userAgent: 'GGLoop Distribution Bot',
            clientId: creds.clientId,
            clientSecret: creds.clientSecret,
            username: creds.username,
            password: creds.password,
        });

        const subreddit = await reddit.getSubreddit(draft.subreddit || distributionConfig.reddit.subreddit);
        const submission = await subreddit.submitSelfpost({
            title: draft.title || 'GG LOOP Update',
            text: draft.content,
        });

        record.success = true;
        record.id = submission.name;

        // CRITICAL: Mark channel as valid after successful execution
        markChannelSuccess('reddit');

        console.log(`[Distribution] ✅ Posted to Reddit: ${submission.name}`);

    } catch (error: any) {
        const reason = classifyError(error);
        record.error = reason;
        markChannelFailure('reddit', reason, error.message);
        console.error(`[Distribution] Reddit failed: ${reason} - ${error.message}`);
        saveDraftForManualPost(draft);
    }

    return record;
}

/**
 * Save draft for manual posting
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
    console.log(`[Distribution] 📄 Draft saved for manual posting`);
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
        error: 'UNKNOWN',
    };
}
