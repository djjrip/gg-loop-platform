#!/usr/bin/env node

/**
 * INNOVATION: Growth velocity tracker
 * Tracks week-over-week growth metrics
 * Identifies what's working vs. what's not
 */

import { db } from "../server/db.js";
import { users, userRewards, subscriptions } from "@shared/schema";
import { sql, and, gte } from "drizzle-orm";
import fs from 'fs/promises';

async function trackGrowthVelocity() {
    console.log('📈 Tracking Growth Velocity...\n');

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // This week's signups
    const [thisWeekSignups] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users)
        .where(gte(users.createdAt, oneWeekAgo));

    // Last week's signups
    const [lastWeekSignups] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users)
        .where(and(
            gte(users.createdAt, twoWeeksAgo),
            sql`${users.createdAt} < ${oneWeekAgo}`
        ));

    // This week's subscriptions
    const [thisWeekSubs] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(subscriptions)
        .where(gte(subscriptions.createdAt, oneWeekAgo));

    // Last week's subscriptions
    const [lastWeekSubs] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(subscriptions)
        .where(and(
            gte(subscriptions.createdAt, twoWeeksAgo),
            sql`${subscriptions.createdAt} < ${oneWeekAgo}`
        ));

    // Calculate growth rates
    const signupGrowth = lastWeekSignups.count > 0
        ? ((thisWeekSignups.count - lastWeekSignups.count) / lastWeekSignups.count * 100).toFixed(1)
        : 'N/A';

    const subGrowth = lastWeekSubs.count > 0
        ? ((thisWeekSubs.count - lastWeekSubs.count) / lastWeekSubs.count * 100).toFixed(1)
        : 'N/A';

    // Get total stats
    const [totalUsers] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users);

    const [totalSubs] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(subscriptions)
        .where(sql`${subscriptions.status} = 'active'`);

    const metrics = {
        timestamp: new Date().toISOString(),
        signups: {
            thisWeek: thisWeekSignups.count,
            lastWeek: lastWeekSignups.count,
            growth: signupGrowth,
            total: totalUsers.count
        },
        subscriptions: {
            thisWeek: thisWeekSubs.count,
            lastWeek: lastWeekSubs.count,
            growth: subGrowth,
            total: totalSubs.count
        },
        conversionRate: totalUsers.count > 0
            ? (totalSubs.count / totalUsers.count * 100).toFixed(1) + '%'
            : '0%'
    };

    // Console output
    console.log('📊 GROWTH VELOCITY REPORT\n');
    console.log('Signups:');
    console.log(`  This Week: ${metrics.signups.thisWeek}`);
    console.log(`  Last Week: ${metrics.signups.lastWeek}`);
    console.log(`  Growth: ${metrics.signups.growth}%`);
    console.log(`  Total: ${metrics.signups.total}\n`);

    console.log('Subscriptions:');
    console.log(`  This Week: ${metrics.subscriptions.thisWeek}`);
    console.log(`  Last Week: ${metrics.subscriptions.lastWeek}`);
    console.log(`  Growth: ${metrics.subscriptions.growth}%`);
    console.log(`  Total (Active): ${metrics.subscriptions.total}\n`);

    console.log(`Conversion Rate: ${metrics.conversionRate}\n`);

    // Insights
    console.log('💡 INSIGHTS:\n');

    if (metrics.signups.thisWeek > metrics.signups.lastWeek) {
        console.log('✅ Signup growth is POSITIVE - keep doing what you\'re doing');
    } else if (metrics.signups.thisWeek === metrics.signups.lastWeek) {
        console.log('⚠️  Signup growth is FLAT - try new acquisition channels');
    } else {
        console.log('❌ Signup growth is NEGATIVE - reevaluate marketing strategy');
    }

    if (metrics.subscriptions.thisWeek > metrics.subscriptions.lastWeek) {
        console.log('✅ Subscription growth is POSITIVE - conversion funnel working');
    } else if (metrics.subscriptions.thisWeek === 0 && metrics.subscriptions.lastWeek === 0) {
        console.log('⚠️  No subscriptions yet - focus on converting existing users');
    } else {
        console.log('❌ Subscription growth declining - check pricing/value prop');
    }

    const convRate = parseFloat(metrics.conversionRate);
    if (convRate < 5) {
        console.log('⚠️  Low conversion rate - improve onboarding or offer trial');
    } else if (convRate >= 5 && convRate < 15) {
        console.log('✅ Decent conversion rate - optimize for scale');
    } else {
        console.log('🚀 Excellent conversion rate - scale acquisition now!');
    }

    // Save to file
    const dataPath = 'data/growth-velocity.json';
    await fs.mkdir('data', { recursive: true });

    // Load historical data
    let history = [];
    try {
        const existing = await fs.readFile(dataPath, 'utf-8');
        history = JSON.parse(existing);
    } catch {
        // File doesn't exist yet
    }

    history.push(metrics);

    // Keep last 12 weeks
    if (history.length > 12) {
        history = history.slice(-12);
    }

    await fs.writeFile(dataPath, JSON.stringify(history, null, 2));
    console.log(`\n💾 Data saved to: ${dataPath}`);

    // Tweet-ready summary
    console.log('\n🐦 TWEET-READY SUMMARY:\n');
    console.log(`Week ${history.length} Update:
• ${metrics.signups.thisWeek} new users (${metrics.signups.growth}% vs last week)
• ${metrics.subscriptions.thisWeek} new subscribers
• ${metrics.conversionRate} conversion rate
• ${metrics.signups.total} total users

Building in public. Every user matters. 🎮`);
}

trackGrowthVelocity().catch(console.error);

/*
USAGE:
node scripts/track-growth-velocity.js

AUTOMATE:
Run weekly (every Monday at 9 AM):
- Windows: Task Scheduler
- Linux: crontab -e → 0 9 * * 1 node /path/to/script.js
- Node: Use node-cron in a monitoring service
*/
