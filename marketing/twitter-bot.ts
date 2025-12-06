/**
 * Automated Twitter Marketing Bot
 * 
 * Posts daily content to Twitter/X
 * Engages with gaming community
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

interface Tweet {
    text: string;
    scheduledTime?: Date;
}

class TwitterMarketingBot {
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly accessToken: string;
    private readonly accessSecret: string;

    constructor() {
        this.apiKey = process.env.TWITTER_API_KEY || '';
        this.apiSecret = process.env.TWITTER_API_SECRET || '';
        this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
        this.accessSecret = process.env.TWITTER_ACCESS_SECRET || '';
    }

    /**
     * Generate OAuth signature for Twitter API v1.1
     */
    private generateOAuthSignature(method: string, url: string, params: any) {
        const oauthParams = {
            oauth_consumer_key: this.apiKey,
            oauth_token: this.accessToken,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_nonce: crypto.randomBytes(16).toString('hex'),
            oauth_version: '1.0',
            ...params
        };

        // Create parameter string
        const paramString = Object.keys(oauthParams)
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
            .join('&');

        // Create signature base string
        const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

        // Create signing key
        const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessSecret)}`;

        // Generate signature
        const signature = crypto
            .createHmac('sha1', signingKey)
            .update(signatureBase)
            .digest('base64');

        oauthParams['oauth_signature'] = signature;

        return oauthParams;
    }

    /**
     * Post a tweet
     */
    public async postTweet(text: string): Promise<boolean> {
        try {
            const url = 'https://api.twitter.com/2/tweets';

            const response = await axios.post(
                url,
                { text },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ Tweet posted: ${text.substring(0, 50)}...`);
            return true;
        } catch (error: any) {
            console.error('❌ Failed to post tweet:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get daily tweet content (rotating templates)
     */
    private getDailyTweets(): Tweet[] {
        const today = new Date().getDay(); // 0-6 (Sunday-Saturday)

        const weeklySchedule: Tweet[] = [
            // Sunday
            {
                text: `🎮 New week, new grind!\n\nEvery ranked game you play on GG Loop earns you points.\n\nRedeem for real rewards - gift cards, gaming gear, subscriptions.\n\nStart earning: ggloop.io`
            },
            // Monday
            {
                text: `💰 Your gaming stats should earn you more than just bragging rights.\n\nGG Loop turns your Valorant/League performance into real rewards.\n\nFree to join: ggloop.io`
            },
            // Tuesday
            {
                text: `📊 Track your stats. Earn points. Get rewards.\n\nIt's that simple.\n\nGG Loop is live for Valorant and League players.\n\nggloop.io`
            },
            // Wednesday
            {
                text: `🏆 Competitive gaming should be rewarding.\n\nThat's why we built GG Loop.\n\nPlay → Earn → Redeem\n\nBeta is live: ggloop.io`
            },
            // Thursday
            {
                text: `🎁 New rewards just dropped in the shop!\n\nFrom $10 gift cards to RTX 4060s.\n\nEarn points playing ranked: ggloop.io/shop`
            },
            // Friday
            {
                text: `🔥 Weekend grind starts now!\n\nEvery ranked win = more points on GG Loop.\n\nRedeem for Discord Nitro, Steam cards, gaming gear.\n\nggloop.io`
            },
            // Saturday
            {
                text: `💡 Why GG Loop?\n\n✅ Free to join\n✅ Real rewards\n✅ Auto-tracking\n✅ No gameplay automation\n\nJust link your account and start earning.\n\nggloop.io`
            }
        ];

        return [weeklySchedule[today]];
    }

    /**
     * Get engagement tweets (replies to gaming community)
     */
    private getEngagementTweets(): string[] {
        return [
            `Same! That's why I built GG Loop - your wins should earn you real rewards 🎮`,
            `Have you tried GG Loop? We reward competitive gaming performance with real prizes!`,
            `This is exactly what GG Loop solves! Check it out: ggloop.io`,
            `Facts! Your rank should earn you more than just bragging rights. That's why GG Loop exists.`
        ];
    }

    /**
     * Run daily posting schedule
     */
    public async runDailySchedule() {
        console.log('🤖 Twitter Marketing Bot started');

        const tweets = this.getDailyTweets();

        for (const tweet of tweets) {
            await this.postTweet(tweet.text);

            // Wait 1 hour between tweets to avoid spam detection
            await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
        }
    }

    /**
     * Post milestone tweet
     */
    public async postMilestone(users: number) {
        const milestones = [10, 25, 50, 100, 250, 500, 1000];

        if (milestones.includes(users)) {
            const tweet = `🎉 ${users} gamers are now earning rewards on GG Loop!\n\nThank you to our amazing community.\n\nWant to join? ggloop.io\n\n#gaming #valorant #leagueoflegends`;

            await this.postTweet(tweet);
        }
    }

    /**
     * Post reward redemption celebration
     */
    public async postRedemption(rewardName: string) {
        const tweet = `🎁 Someone just redeemed: ${rewardName}!\n\nYour gaming performance = real rewards.\n\nStart earning: ggloop.io`;

        await this.postTweet(tweet);
    }

    /**
     * Generate setup instructions
     */
    public static generateSetupInstructions(): string {
        return `
# Twitter Marketing Bot Setup

## Step 1: Create Twitter Developer Account

1. Go to https://developer.twitter.com/
2. Sign up for a developer account
3. Create a new app
4. Enable OAuth 2.0

## Step 2: Get API Credentials

1. Go to your app settings
2. Navigate to "Keys and tokens"
3. Generate:
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret
   - Bearer Token

## Step 3: Add to .env

\`\`\`
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token
\`\`\`

## Step 4: Test

Run: \`npm run marketing:twitter:test\`

## Step 5: Start Automation

Run: \`npm run marketing:twitter:start\`

## Best Practices

- Post 1-2 times per day max
- Engage with gaming community
- Use relevant hashtags
- Respond to comments
- Share user wins
- Post milestones

## Content Calendar

- Monday: Platform benefits
- Tuesday: Stats/metrics
- Wednesday: User testimonials
- Thursday: New rewards
- Friday: Weekend motivation
- Saturday: How it works
- Sunday: Week ahead preview
`;
    }
}

// Export
export const twitterBot = new TwitterMarketingBot();

// If running directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args[0] === 'setup') {
        console.log(TwitterMarketingBot.generateSetupInstructions());
    } else if (args[0] === 'test') {
        twitterBot.postTweet('Testing GG Loop automated marketing! 🎮').then(() => {
            console.log('✅ Test complete');
            process.exit(0);
        });
    } else {
        twitterBot.runDailySchedule();
    }
}
