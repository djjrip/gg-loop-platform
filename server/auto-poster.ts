/**
 * AUTO-POSTER SYSTEM
 * Automatically posts generated content to social media
 * 
 * Innovation: Content generates itself AND posts itself. Zero manual work.
 */

import fetch from 'node-fetch';
import { generateContent } from './content-engine';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
const DISCORD_CONTENT_WEBHOOK = process.env.DISCORD_CONTENT_WEBHOOK;

interface PostResult {
    platform: string;
    success: boolean;
    posted: string;
    url?: string;
    error?: string;
}

/**
 * Post to Twitter via API v2
 */
async function postToTwitter(content: string): Promise<PostResult> {
    if (!TWITTER_BEARER_TOKEN) {
        return {
            platform: 'twitter',
            success: false,
            posted: content,
            error: 'Twitter credentials not configured'
        };
    }

    try {
        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: content })
        });

        if (response.ok) {
            const data = await response.json() as any;
            return {
                platform: 'twitter',
                success: true,
                posted: content,
                url: `https://twitter.com/user/status/${data.data.id}`
            };
        } else {
            const error = await response.text();
            return {
                platform: 'twitter',
                success: false,
                posted: content,
                error: `Twitter API error: ${response.status} - ${error}`
            };
        }
    } catch (error) {
        return {
            platform: 'twitter',
            success: false,
            posted: content,
            error: `Twitter posting failed: ${error}`
        };
    }
}

/**
 * Post to Discord via webhook
 */
async function postToDiscord(content: string): Promise<PostResult> {
    if (!DISCORD_CONTENT_WEBHOOK) {
        return {
            platform: 'discord',
            success: false,
            posted: content,
            error: 'Discord webhook not configured'
        };
    }

    try {
        const response = await fetch(DISCORD_CONTENT_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                username: 'GG Loop Marketing',
                avatar_url: 'https://ggloop.io/logo.png'
            })
        });

        if (response.ok) {
            return {
                platform: 'discord',
                success: true,
                posted: content
            };
        } else {
            return {
                platform: 'discord',
                success: false,
                posted: content,
                error: `Discord webhook error: ${response.status}`
            };
        }
    } catch (error) {
        return {
            platform: 'discord',
            success: false,
            posted: content,
            error: `Discord posting failed: ${error}`
        };
    }
}

/**
 * Auto-post daily Twitter thread
 */
export async function autoPostTwitterThread(): Promise<PostResult> {
    console.log('[AutoPoster] Generating Twitter thread...');

    const threads = await generateContent('twitter');
    const thread = threads[0]; // Get first thread

    if (!thread) {
        return {
            platform: 'twitter',
            success: false,
            posted: '',
            error: 'No Twitter content generated'
        };
    }

    console.log('[AutoPoster] Posting to Twitter:', thread.substring(0, 50) + '...');
    return await postToTwitter(thread);
}

/**
 * Auto-post daily Discord update
 */
export async function autoPostDiscordUpdate(): Promise<PostResult> {
    console.log('[AutoPoster] Generating Discord update...');

    const updates = await generateContent('discord');
    const update = updates[0];

    if (!update) {
        return {
            platform: 'discord',
            success: false,
            posted: '',
            error: 'No Discord content generated'
        };
    }

    console.log('[AutoPoster] Posting to Discord:', update.substring(0, 50) + '...');
    return await postToDiscord(update);
}

/**
 * Run full daily posting routine
 */
export async function runDailyPostingRoutine(): Promise<PostResult[]> {
    console.log('\n============================================');
    console.log('🤖 AUTO-POSTER: Daily Routine Starting');
    console.log('============================================\n');

    const results: PostResult[] = [];

    // Post Twitter thread
    const twitterResult = await autoPostTwitterThread();
    results.push(twitterResult);

    if (twitterResult.success) {
        console.log('✅ Twitter posted successfully');
        if (twitterResult.url) console.log(`   URL: ${twitterResult.url}`);
    } else {
        console.log('❌ Twitter posting failed:', twitterResult.error);
    }

    // Wait 5 seconds between posts
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Post Discord update
    const discordResult = await autoPostDiscordUpdate();
    results.push(discordResult);

    if (discordResult.success) {
        console.log('✅ Discord posted successfully');
    } else {
        console.log('❌ Discord posting failed:', discordResult.error);
    }

    console.log('\n============================================');
    console.log('🤖 AUTO-POSTER: Daily Routine Complete');
    console.log(`   Twitter: ${twitterResult.success ? '✅' : '❌'}`);
    console.log(`   Discord: ${discordResult.success ? '✅' : '❌'}`);
    console.log('============================================\n');

    return results;
}

/**
 * Test posting (manual trigger)
 */
export async function testPosting(): Promise<{ twitter: PostResult; discord: PostResult }> {
    const twitterTest = await postToTwitter('🧪 Testing GG Loop auto-poster system. If you see this, automation is working! 🤖');
    const discordTest = await postToDiscord('🧪 **Testing auto-poster system**\n\nIf you see this, automation is live! 🤖');

    return {
        twitter: twitterTest,
        discord: discordTest
    };
}
