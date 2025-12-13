/**
 * Twitter Auto-Scheduler via Buffer API
 * Auto-posts tweets to @GGLoopOfficial
 * 
 * Setup:
 * 1. Create Buffer account: buffer.com
 * 2. Get API token: buffer.com/developers/api
 * 3. Add to .env: BUFFER_ACCESS_TOKEN=your_token
 * 
 * Usage: node server/marketing/twitterScheduler.js
 * Schedules 30 days of tweets automatically
 */

import fetch from 'node-fetch';

interface TweetTemplate {
    text: string;
    delayDays: number; // Post X days from now
}

const TWEET_SCHEDULE: TweetTemplate[] = [
    { text: `Gaming actually pays now 🎮💰\n\nConnect accounts → Win matches → Get rewards\n\nFree to start: ggloop.io\n\n#gaming #rewards`, delayDays: 0 },
    { text: `Just launched: Earn 2x points as Pro member\n\n• $10 Steam cards\n• Gaming merch\n• Exclusive badges\n\n7-day free trial: ggloop.io`, delayDays: 2 },
    { text: `Your squad joins = you get bonus points\n\n3 friends = 200pts\n5 friends = 500pts\n10 friends = 1500pts\n\nStart earning: ggloop.io`, delayDays: 4 },
    { text: `Daily login = 50 points\n7-day streak = 100 bonus\n30-day streak = 500 bonus\n\nConsistency pays on GG LOOP\n\nggloop.io`, delayDays: 7 },
    { text: `Just redeemed a $25 Amazon gift card 🎁\n\nAll from gaming I was already doing\n\nFree platform: ggloop.io`, delayDays: 10 },
    { text: `Pro tip: Refer friends during your free trial\n\nYou earn 2x points on referral bonuses\n\n= Stack rewards faster\n\nggloop.io`, delayDays: 14 },
    { text: `OG Members get exclusive status badges\n\nEarly adopters = recognized forever\n\nJoin now: ggloop.io\n\n#FOMO`, delayDays: 17 },
    { text: `Shop update:\n\n• Gaming peripherals\n• Premium merch\n• Gift cards\n• Discord roles\n\nAll redeemable with points: ggloop.io/shop`, delayDays: 21 },
    { text: `Free vs Pro comparison:\n\nFree: 1x points\nPro: 2x points\nElite: 3x points\n\nSame effort, triple rewards\n\nggloop.io/subscription`, delayDays: 24 },
    { text: `Weekend grind = Monday rewards 💪\n\nYour gaming session just became profitable\n\nggloop.io`, delayDays: 28 },
];

/**
 * Schedule tweets via Buffer API
 */
async function scheduleTweets() {
    console.log('📅 Scheduling tweets via Buffer...');

    const token = process.env.BUFFER_ACCESS_TOKEN;
    if (!token) {
        console.error('❌ BUFFER_ACCESS_TOKEN not found in .env');
        return;
    }

    // Get Buffer profiles (connected social accounts)
    const profilesResponse = await fetch('https://api.bufferapp.com/1/profiles.json', {
        headers: { Authorization: `Bearer ${token}` },
    });
    const profiles = await profilesResponse.json();

    const twitterProfile = profiles.find((p: any) => p.service === 'twitter');
    if (!twitterProfile) {
        console.error('❌ No Twitter account connected to Buffer');
        return;
    }

    console.log(`✅ Found Twitter profile: ${twitterProfile.formatted_username}`);

    let scheduled = 0;

    for (const tweet of TWEET_SCHEDULE) {
        const scheduledTime = new Date();
        scheduledTime.setDate(scheduledTime.getDate() + tweet.delayDays);
        scheduledTime.setHours(12, 0, 0, 0); // Noon each day

        try {
            const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    profile_ids: [twitterProfile.id],
                    text: tweet.text,
                    scheduled_at: Math.floor(scheduledTime.getTime() / 1000).toString(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log(`   ✅ Scheduled for ${scheduledTime.toDateString()}`);
                scheduled++;
            } else {
                console.error(`   ❌ Failed:`, result.message);
            }

            // Rate limit: wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`   ❌ Error scheduling tweet:`, error);
        }
    }

    console.log(`\n✅ Scheduled ${scheduled}/${TWEET_SCHEDULE.length} tweets`);
    console.log(`📅 Next 30 days automated!`);
}

// Run if called directly
if (require.main === module) {
    scheduleTweets()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { scheduleTweets };
