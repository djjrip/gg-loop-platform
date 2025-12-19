
import { TwitterApi } from 'twitter-api-v2';

// 🛑 STOP: You must add your valid Twitter API Credentials below
// The credentials found in temp_hunter_2/EMPIRE-MEMORY.md were REVOKED (401 Unauthorized).
// Please generate new keys at developer.twitter.com or copy them from Railway Dashboard.

const appKey = "YOUR_CONSUMER_KEY";
const appSecret = "YOUR_CONSUMER_SECRET";
const accessToken = "YOUR_ACCESS_TOKEN";
const accessSecret = "YOUR_ACCESS_TOKEN_SECRET";

const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
});

const TWEETS = [
    "Direction: We are building the identity layer for competitive gaming. No aggressive monetization, no promised riches. Just a loop: Play -> Verify -> Earn. V1 is live. #ggloop",
    "Founder update: Personal site is live. Theme is locked. Now focusing 100% on the loop mechanics. Transparency is the only marketing strategy we need.",
    "Trust Score V1 is live. It penalizes smurfs and rewards consistency. If you verify your Riot ID and play on Desktop, you’re already earning. Check your dashboard."
];

async function main() {
    console.log("🐦 Initializing Mission 2 Tweet Sequence (Node.js)...");

    if (appKey === "YOUR_CONSUMER_KEY") {
        console.error("❌ ERROR: You must update this script with valid Twitter Credentials before running.");
        process.exit(1);
    }

    try {
        const me = await client.v2.me();
        console.log(`✅ Authenticated as: @${me.data.username}`);
    } catch (e) {
        console.error(`❌ Authentication Failed:`, e);
        process.exit(1);
    }

    for (let i = 0; i < TWEETS.length; i++) {
        const text = TWEETS[i];
        console.log(`\n[${i + 1}/3] Posting: ${text.substring(0, 50)}...`);

        try {
            const response = await client.v2.tweet(text);
            console.log(`   ✅ Posted! ID: ${response.data.id}`);

            if (i < TWEETS.length - 1) {
                console.log("   ⏳ Waiting 60 seconds...");
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        } catch (e) {
            console.error(`   ❌ Failed to post tweet ${i + 1}:`, e);
            process.exit(1);
        }
    }

    console.log("\n✅ Mission 2 Complete: All tweets posted.");
}

main();
