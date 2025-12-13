/**
 * Reddit Auto-Poster
 * Posts to gaming subreddits automatically via Reddit API
 * 
 * Setup:
 * 1. Create Reddit app: reddit.com/prefs/apps
 * 2. Add credentials to .env:
 *    REDDIT_CLIENT_ID=your_client_id
 *    REDDIT_CLIENT_SECRET=your_secret
 *    REDDIT_USERNAME=your_username
 *    REDDIT_PASSWORD=your_password
 * 
 * Usage: node server/marketing/redditBot.js
 * Or add to Railway cron: 0 10 * * 1 (Every Monday 10 AM)
 */

import fetch from 'node-fetch';

interface RedditPost {
    subreddit: string;
    title: string;
    text: string;
    flairText?: string;
}

const POSTS: RedditPost[] = [
    {
        subreddit: 'beermoney',
        title: 'Earning rewards playing games - GG LOOP',
        text: `I've been using this platform that pays you to game.

**How it works:**
- Connect your gaming accounts
- Earn points for daily logins
- Win matches = more points
- Redeem for gift cards, merch, etc.

Free to join, 7-day Pro trial included.

Check it out: https://ggloop.io

Mods delete if not allowed 🙏`,
    },
    {
        subreddit: 'gaming',
        title: 'Platform that actually pays gamers',
        text: `Found a gaming rewards platform that's pretty cool.

You link your accounts, play games you already play, earn points, redeem rewards.

Not a scam - already redeemed a $10 Steam card.

Free: https://ggloop.io`,
    },
    {
        subreddit: 'passive_income',
        title: 'Gaming rewards platform - passive income while gaming',
        text: `If you game anyway, might as well get paid for it.

**GG LOOP rewards you for:**
- Daily logins (50 points)
- Winning matches
- Referring friends (200+ bonus points)

**Redeem for:**
- Gift cards (Steam, Amazon)
- Gaming merch
- Exclusive perks

Free 7-day trial: https://ggloop.io`,
    },
];

/**
 * Get Reddit OAuth token
 */
async function getRedditToken(): Promise<string> {
    const auth = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'password',
            username: process.env.REDDIT_USERNAME || '',
            password: process.env.REDDIT_PASSWORD || '',
        }),
    });

    const data = await response.json();
    return data.access_token;
}

/**
 * Post to subreddit
 */
async function postToSubreddit(token: string, post: RedditPost): Promise<boolean> {
    try {
        const response = await fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'GGLoopBot/1.0',
            },
            body: new URLSearchParams({
                sr: post.subreddit,
                kind: 'self',
                title: post.title,
                text: post.text,
                api_type: 'json',
            }),
        });

        const data = await response.json();

        if (data.json?.errors?.length > 0) {
            console.error(`❌ Error posting to r/${post.subreddit}:`, data.json.errors);
            return false;
        }

        console.log(`✅ Posted to r/${post.subreddit}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to post to r/${post.subreddit}:`, error);
        return false;
    }
}

/**
 * Run weekly Reddit marketing
 */
async function runWeeklyPosts() {
    console.log('🤖 Starting Reddit auto-posting...');

    try {
        const token = await getRedditToken();
        console.log('✅ Authenticated with Reddit');

        // Post to one subreddit per day (rotate)
        const dayOfWeek = new Date().getDay();
        const post = POSTS[dayOfWeek % POSTS.length];

        await postToSubreddit(token, post);

        console.log('✅ Reddit marketing complete');
    } catch (error) {
        console.error('❌ Reddit bot error:', error);
    }
}

// Run if called directly
if (require.main === module) {
    runWeeklyPosts()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { runWeeklyPosts };
