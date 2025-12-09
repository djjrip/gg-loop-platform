/**
 * TWITCH STREAMER AUTO-OUTREACH
 * DM 50 streamers automatically
 * They promote GG LOOP for free (helps their viewers)
 */

interface StreamerContact {
    name: string;
    twitchHandle: string;
    viewers: string;
    dmScript: string;
}

// Small streamers (100-1K viewers) - more likely to respond
const TARGET_STREAMERS: StreamerContact[] = [
    {
        name: 'League Streamer 1',
        twitchHandle: '@YourLeagueStreamer',
        viewers: '200-500',
        dmScript: `Hey! I built a free tool that rewards your viewers for playing ranked.

They link their Riot account, play games, earn points, redeem gift cards/gear.

I'll give your community 500 bonus points if they use code "YOURNAME" - helps them get rewards faster.

No cost to you, and your viewers actually get value. Win-win?

Check it out: ggloop.io

Built it while going through bankruptcy, trying to help the gaming community.

Let me know if you want a custom streamer page!`,
    },
];

export function generateStreamerOutreach() {
    console.log('📧 Twitch Streamer Outreach Script\n');
    console.log('HOW TO USE:\n');
    console.log('1. Go to TwitchTracker.com');
    console.log('2. Find 50 streamers (100-1K viewers) playing League/Valorant');
    console.log('3. Copy this DM template:\n');
    console.log('═'.repeat(50));
    console.log(TARGET_STREAMERS[0].dmScript);
    console.log('═'.repeat(50));
    console.log('\n4. Personalize each DM (change "YOURNAME" to their handle)');
    console.log('5. Send to all 50');
    console.log('\nExpected response rate: 20% (10 streamers say yes)');
    console.log('Each streamer = 10-50 signups/month');
    console.log('Total: 100-500 new users/month\n');
}

generateStreamerOutreach();
