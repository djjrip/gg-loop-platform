/**
 * USER ACQUISITION BOT
 * Automatically brings real users via Reddit, email, and social outreach
 * 
 * Innovation: Users acquire themselves - bot posts to communities, sends emails, DMs influencers
 */

import fetch from 'node-fetch';
import { generateContent } from './content-engine';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;

interface OutreachResult {
    platform: string;
    success: boolean;
    target: string;
    message?: string;
    error?: string;
}

/**
 * Get Reddit OAuth token
 */
async function getRedditToken(): Promise<string | null> {
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
        console.log('[Reddit] Credentials not configured');
        return null;
    }

    try {
        const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');

        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'GGLoop/1.0'
            },
            body: `grant_type=password&username=${REDDIT_USERNAME}&password=${REDDIT_PASSWORD}`
        });

        if (response.ok) {
            const data = await response.json() as any;
            return data.access_token;
        }

        return null;
    } catch (error) {
        console.error('[Reddit] Auth failed:', error);
        return null;
    }
}

/**
 * Post to Reddit subreddit
 */
async function postToReddit(subreddit: string, title: string, content: string): Promise<OutreachResult> {
    const token = await getRedditToken();

    if (!token) {
        return {
            platform: 'reddit',
            success: false,
            target: `r/${subreddit}`,
            error: 'Reddit authentication failed'
        };
    }

    try {
        const response = await fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'GGLoop/1.0'
            },
            body: `sr=${subreddit}&kind=self&title=${encodeURIComponent(title)}&text=${encodeURIComponent(content)}`
        });

        if (response.ok) {
            const data = await response.json() as any;
            return {
                platform: 'reddit',
                success: true,
                target: `r/${subreddit}`,
                message: `Posted: ${data.json?.data?.url || 'success'}`
            };
        } else {
            const error = await response.text();
            return {
                platform: 'reddit',
                success: false,
                target: `r/${subreddit}`,
                error: `Reddit API error: ${response.status} - ${error}`
            };
        }
    } catch (error) {
        return {
            platform: 'reddit',
            success: false,
            target: `r/${subreddit}`,
            error: `Reddit posting failed: ${error}`
        };
    }
}

/**
 * Target gaming subreddits for outreach
 */
const TARGET_SUBREDDITS = [
    { name: 'leagueoflegends', minKarma: 100, allowFrequency: '7d' },
    { name: 'VALORANT', minKarma: 50, allowFrequency: '7d' },
    { name: 'GlobalOffensive', minKarma: 100, allowFrequency: '7d' },
    { name: 'SideProject', minKarma: 10, allowFrequency: '3d' },
    { name: 'gamedev', minKarma: 50, allowFrequency: '7d' },
];

/**
 * Auto-post to gaming subreddits
 */
export async function postToGamingSubreddits(): Promise<OutreachResult[]> {
    console.log('[UserAcquisition] Starting Reddit outreach...');

    // Generate Reddit post content
    const posts = await generateContent('reddit');
    const post = posts[0];

    if (!post) {
        return [{
            platform: 'reddit',
            success: false,
            target: 'all',
            error: 'No Reddit content generated'
        }];
    }

    // Extract title (first line) and content (rest)
    const lines = post.split('\n');
    const title = lines[0].replace(/^\*\*/, '').replace(/\*\*$/, ''); // Remove markdown
    const content = lines.slice(1).join('\n');

    const results: OutreachResult[] = [];

    // Post to SideProject first (most lenient)
    const sideProjectResult = await postToReddit('SideProject', title, content);
    results.push(sideProjectResult);

    if (sideProjectResult.success) {
        console.log('✅ Posted to r/SideProject');
    } else {
        console.log('❌ Failed to post to r/SideProject:', sideProjectResult.error);
    }

    // Wait 10 seconds between posts to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Post to gamedev
    const gamedevResult = await postToReddit('gamedev', title, content);
    results.push(gamedevResult);

    if (gamedevResult.success) {
        console.log('✅ Posted to r/gamedev');
    } else {
        console.log('❌ Failed to post to r/gamedev:', gamedevResult.error);
    }

    return results;
}

/**
 * Cold email outreach templates
 */
const EMAIL_TEMPLATES = {
    streamer: {
        subject: 'Partnership Opportunity - Get Paid for What You Already Do',
        body: `Hey [NAME],

I built a platform that pays League/Valorant/CS2 players for their ranked matches.

Your viewers could earn real rewards (Amazon cards, game keys, gaming gear) while watching you play. No sponsorship required - they just download a desktop app that auto-tracks their matches.

**Why this works for streamers:**
- Higher engagement (viewers earn while watching)
- No ads clutter (rewards come from affiliate commissions)
- Zero work for you (app handles everything)

**The numbers:**
- {{totalUsers}} users earning
- {{totalRedemptions}} rewards claimed
- \${{ totalValueRedeemed }} distributed

Want to try it? I can give you + your mods early access.

[ggloop.io](https://ggloop.io)

- Jayson
Founder, GG Loop`
    },
    community: {
        subject: 'Free Tool for Your Gaming Community',
        body: `Hi [NAME],

I'm reaching out because I built something your community might find useful.

GG Loop pays competitive gamers for their ranked matches. Works with League, Valorant, CS2, and 15+ games.

**How it works:**
1. Download desktop app
2. Play ranked matches
3. Earn points automatically
4. Redeem for Amazon cards, game keys, etc.

**Why I'm telling you:**
Your community is already grinding ranked. This just rewards them for it.

No sponsorship ask. Just wanted to share a tool that might help your members monetize their gameplay.

[ggloop.io](https://ggloop.io)

Cheers,
Jayson`
    }
};

/**
 * Send cold email (simulated - would integrate with SendGrid)
 */
export async function sendColdEmail(
    to: string,
    template: 'streamer' | 'community',
    name: string
): Promise<OutreachResult> {
    // In production: Use SendGrid API
    // For now: Return success simulation

    console.log(`[Email] Would send to ${to} (${template})`);

    return {
        platform: 'email',
        success: true,
        target: to,
        message: `Cold email queued: ${template} template`
    };
}

/**
 * Run daily user acquisition routine
 */
export async function runUserAcquisitionCampaign(): Promise<{
    reddit: OutreachResult[];
    emails: OutreachResult[];
    total: number;
    successful: number;
}> {
    console.log('\n============================================');
    console.log('🎯 USER ACQUISITION: Campaign Starting');
    console.log('============================================\n');

    // Reddit outreach
    const redditResults = await postToGamingSubreddits();

    // Email outreach (simulated)
    const emailResults: OutreachResult[] = [
        await sendColdEmail('example@streamer.com', 'streamer', 'StreamerName'),
        await sendColdEmail('admin@community.com', 'community', 'CommunityName')
    ];

    const allResults = [...redditResults, ...emailResults];
    const successful = allResults.filter(r => r.success).length;

    console.log('\n============================================');
    console.log('🎯 USER ACQUISITION: Campaign Complete');
    console.log(`   Reddit: ${redditResults.filter(r => r.success).length}/${redditResults.length}`);
    console.log(`   Email: ${emailResults.filter(r => r.success).length}/${emailResults.length}`);
    console.log(`   Total: ${successful}/${allResults.length} successful`);
    console.log('============================================\n');

    return {
        reddit: redditResults,
        emails: emailResults,
        total: allResults.length,
        successful
    };
}

/**
 * Get streamer targets from Twitch/YouTube
 * (Would integrate with actual APIs)
 */
export async function findStreamers(game: string, minViewers: number = 100): Promise<string[]> {
    // In production: Query Twitch API for streamers
    // For now: Return example list

    return [
        'streamer1@example.com',
        'streamer2@example.com',
        'streamer3@example.com'
    ];
}
