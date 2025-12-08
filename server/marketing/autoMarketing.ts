/**
 * Marketing Automation Master Script
 * Runs all marketing bots automatically
 * 
 * Usage: node server/marketing/autoMarketing.js
 * 
 * Add to Railway as cron job:
 * - Daily: 0 10 * * * (10 AM daily)
 * - Weekly: 0 10 * * 1 (Monday 10 AM)
 */

import { runWeeklyPosts } from './redditBot';
import { scheduleTweets } from './twitterScheduler';
import { announceToDiscord } from './discordAnnouncer';

async function runDailyMarketing() {
    console.log('🚀 Starting automated marketing...\n');

    const startTime = Date.now();

    try {
        // Discord announcements (daily)
        console.log('📢 Step 1: Discord...');
        await announceToDiscord();
        console.log('');

        // Check if it's Monday for Reddit
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 1) { // Monday
            console.log('📝 Step 2: Reddit (Monday only)...');
            await runWeeklyPosts();
            console.log('');
        }

        // Twitter scheduling (run once per month to schedule 30 days)
        const dayOfMonth = new Date().getDate();
        if (dayOfMonth === 1) { // First day of month
            console.log('🐦 Step 3: Twitter (Monthly scheduling)...');
            await scheduleTweets();
            console.log('');
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Marketing automation complete in ${elapsed}s`);

    } catch (error) {
        console.error('❌ Marketing automation error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runDailyMarketing()
        .then(() => {
            console.log('\n🎉 All marketing tasks complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { runDailyMarketing };
