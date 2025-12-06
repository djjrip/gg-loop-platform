/**
 * Automated Reddit Marketing Bot
 * 
 * Handles posting to gaming subreddits on a schedule
 * Uses Reddit API to post content automatically
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface RedditPost {
    subreddit: string;
    title: string;
    body: string;
    scheduled: Date;
}

class RedditMarketingBot {
    private accessToken: string = '';
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly username: string;
    private readonly password: string;

    constructor() {
        this.clientId = process.env.REDDIT_CLIENT_ID || '';
        this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
        this.username = process.env.REDDIT_USERNAME || '';
        this.password = process.env.REDDIT_PASSWORD || '';
    }

    /**
     * Authenticate with Reddit API
     */
    private async authenticate() {
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(
                'https://www.reddit.com/api/v1/access_token',
                new URLSearchParams({
                    grant_type: 'password',
                    username: this.username,
                    password: this.password
                }),
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'GGLoop/1.0.0'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            console.log('✅ Authenticated with Reddit');
            return true;
        } catch (error) {
            console.error('❌ Reddit authentication failed:', error);
            return false;
        }
    }

    /**
     * Post to a subreddit
     */
    private async postToSubreddit(subreddit: string, title: string, body: string) {
        if (!this.accessToken) {
            await this.authenticate();
        }

        try {
            const response = await axios.post(
                'https://oauth.reddit.com/api/submit',
                new URLSearchParams({
                    sr: subreddit,
                    kind: 'self',
                    title: title,
                    text: body,
                    api_type: 'json'
                }),
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'GGLoop/1.0.0'
                    }
                }
            );

            console.log(`✅ Posted to r/${subreddit}: ${title}`);
            return response.data;
        } catch (error: any) {
            console.error(`❌ Failed to post to r/${subreddit}:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Get pre-written posts for different subreddits
     */
    private getScheduledPosts(): RedditPost[] {
        return [
            {
                subreddit: 'valorant',
                title: 'I built a platform where Valorant players earn points for performance and redeem rewards - now in open beta',
                body: `Hey Valorant community! I just launched GG Loop - a platform that tracks your Valorant stats (rank, KDA, win rate) and gives you points you can redeem for real rewards.

**What you get:**
- Points for every ranked game (based on rank, KDA, wins)
- Redeem points for: Gift cards, Discord Nitro, gaming gear, and more
- Leaderboards to compete with friends
- New games being added (League, CS2 coming soon)

**Currently in open beta** - free to join, no hidden fees.

We're looking for early users and feedback. If you play competitive games, come check it out!

Link: ggloop.io

Happy to answer any questions!`,
                scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            },
            {
                subreddit: 'leagueoflegends',
                title: 'Built a platform that rewards League players for their performance - open beta',
                body: `Hey summoners! I built GG Loop - earn points for your League performance and redeem them for real rewards.

**How it works:**
- Link your Riot account
- Play ranked games
- Earn points based on your performance
- Redeem for gift cards, subscriptions, gaming gear

**What makes it different:**
- Automatic tracking via Riot API
- No gameplay automation (fully compliant)
- Real rewards, not just in-game items
- Free to join

Currently in beta with Valorant and League support. Would love your feedback!

Link: ggloop.io`,
                scheduled: new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 days
            },
            {
                subreddit: 'gaming',
                title: 'I built a platform that rewards competitive gaming - any gamers here?',
                body: `Hey r/gaming! I just launched GG Loop - a platform that tracks your competitive gaming stats and rewards your performance.

**The idea:**
You spend hours grinding ranked games. Your stats improve. Your rank goes up. But you get nothing tangible for it.

GG Loop fixes that. Play games → earn points → redeem real rewards.

**Currently supports:**
- Valorant
- League of Legends
- More games coming soon

**Rewards include:**
- Gift cards (Amazon, Steam, PlayStation)
- Subscriptions (Discord Nitro, Spotify, Xbox Game Pass)
- Gaming gear (headsets, mice, keyboards)

Open beta is live - completely free to join.

Would love feedback from the community!

Link: ggloop.io`,
                scheduled: new Date(Date.now() + 72 * 60 * 60 * 1000) // 3 days
            }
        ];
    }

    /**
     * Run the posting schedule
     */
    public async runSchedule() {
        console.log('🤖 Reddit Marketing Bot started');

        const posts = this.getScheduledPosts();

        for (const post of posts) {
            const timeUntilPost = post.scheduled.getTime() - Date.now();

            if (timeUntilPost > 0) {
                console.log(`⏰ Scheduled post to r/${post.subreddit} in ${Math.round(timeUntilPost / 1000 / 60 / 60)} hours`);

                setTimeout(async () => {
                    await this.postToSubreddit(post.subreddit, post.title, post.body);
                }, timeUntilPost);
            }
        }
    }

    /**
     * Post immediately (for testing)
     */
    public async postNow(subreddit: string = 'test') {
        console.log(`🚀 Posting to r/${subreddit} now...`);

        const testPost = {
            title: 'Testing GG Loop - Gaming Rewards Platform',
            body: 'This is a test post for the GG Loop platform. Please ignore!'
        };

        await this.postToSubreddit(subreddit, testPost.title, testPost.body);
    }

    /**
     * Generate setup instructions
     */
    public static generateSetupInstructions(): string {
        return `
# Reddit Marketing Bot Setup

## Step 1: Create Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - Name: GG Loop Marketing Bot
   - App type: Select "script"
   - Description: Automated marketing for GG Loop
   - About URL: https://ggloop.io
   - Redirect URI: http://localhost:8080
4. Click "Create app"
5. Copy the client ID (under the app name)
6. Copy the client secret

## Step 2: Add to .env

Add these to your .env file:

\`\`\`
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
\`\`\`

## Step 3: Test

Run: \`npm run marketing:reddit:test\`

## Step 4: Start Automation

Run: \`npm run marketing:reddit:start\`

## Important Notes

- Don't spam! Reddit will ban you.
- Post to each subreddit max once per week
- Read subreddit rules before posting
- Engage with comments on your posts
- Be authentic, not salesy

## Recommended Posting Schedule

- Monday: r/valorant
- Wednesday: r/leagueoflegends
- Friday: r/gaming
- Rotate other gaming subreddits weekly
`;
    }
}

// Export
export const redditBot = new RedditMarketingBot();

// If running directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args[0] === 'setup') {
        console.log(RedditMarketingBot.generateSetupInstructions());
    } else if (args[0] === 'test') {
        redditBot.postNow('test').then(() => {
            console.log('✅ Test complete');
            process.exit(0);
        });
    } else {
        redditBot.runSchedule();
    }
}
