#!/usr/bin/env node

/**
 * INNOVATION: Success metrics dashboard generator
 * Creates visual progress tracking for goal achievement
 * 100% data-driven, shows real progress vs goals
 */

import { db } from "../server/db.js";
import { users, subscriptions } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from 'fs/promises';

// Define success metrics and goals
const goals = {
    users: {
        week1: 10,
        week2: 25,
        week3: 50,
        month1: 100
    },
    revenue: {
        week1: 25,
        week2: 100,
        week3: 250,
        month1: 500
    },
    conversion: {
        week1: 10, // 10%
        week2: 15,
        week3: 20,
        month1: 25
    }
};

async function generateSuccessMetrics() {
    console.log('🎯 Generating Success Metrics Dashboard...\n');

    // Get current metrics
    const [totalUsers] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users);

    const [activeSubs] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(subscriptions)
        .where(sql`${subscriptions.status} = 'active'`);

    // Calculate MRR (simplified - using $10 average)
    const mrr = (activeSubs.count || 0) * 10;

    // Calculate conversion rate
    const conversionRate = totalUsers.count > 0
        ? (activeSubs.count / totalUsers.count * 100).toFixed(1)
        : 0;

    // Determine current week (rough estimate based on platform age)
    const platformStartDate = new Date('2024-10-01'); // Adjust to actual start
    const now = new Date();
    const daysSinceLaunch = Math.floor((now.getTime() - platformStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.ceil(daysSinceLaunch / 7), 4);

    // Calculate progress toward goals
    const userGoal = currentWeek === 1 ? goals.users.week1 :
        currentWeek === 2 ? goals.users.week2 :
            currentWeek === 3 ? goals.users.week3 : goals.users.month1;

    const revenueGoal = currentWeek === 1 ? goals.revenue.week1 :
        currentWeek === 2 ? goals.revenue.week2 :
            currentWeek === 3 ? goals.revenue.week3 : goals.revenue.month1;

    const conversionGoal = currentWeek === 1 ? goals.conversion.week1 :
        currentWeek === 2 ? goals.conversion.week2 :
            currentWeek === 3 ? goals.conversion.week3 : goals.conversion.month1;

    const userProgress = (totalUsers.count / userGoal * 100).toFixed(1);
    const revenueProgress = (mrr / revenueGoal * 100).toFixed(1);
    const conversionProgress = (parseFloat(conversionRate) / conversionGoal * 100).toFixed(1);

    // Console output
    console.log(`📅 Week ${currentWeek} Progress Report\n`);

    console.log('👥 USERS:');
    console.log(`   Current: ${totalUsers.count}`);
    console.log(`   Goal: ${userGoal}`);
    console.log(`   Progress: ${userProgress}%`);
    console.log(`   ${getProgressBar(parseFloat(userProgress))}\n`);

    console.log('💰 REVENUE (MRR):');
    console.log(`   Current: $${mrr}`);
    console.log(`   Goal: $${revenueGoal}`);
    console.log(`   Progress: ${revenueProgress}%`);
    console.log(`   ${getProgressBar(parseFloat(revenueProgress))}\n`);

    console.log('📈 CONVERSION RATE:');
    console.log(`   Current: ${conversionRate}%`);
    console.log(`   Goal: ${conversionGoal}%`);
    console.log(`   Progress: ${conversionProgress}%`);
    console.log(`   ${getProgressBar(parseFloat(conversionProgress))}\n`);

    // Overall health score
    const avgProgress = (parseFloat(userProgress) + parseFloat(revenueProgress) + parseFloat(conversionProgress)) / 3;
    console.log('🏆 OVERALL HEALTH:');
    console.log(`   Score: ${avgProgress.toFixed(1)}%`);
    console.log(`   ${getHealthStatus(avgProgress)}\n`);

    // Save metrics
    const metrics = {
        timestamp: new Date().toISOString(),
        week: currentWeek,
        current: {
            users: totalUsers.count,
            revenue: mrr,
            conversion: parseFloat(conversionRate)
        },
        goals: {
            users: userGoal,
            revenue: revenueGoal,
            conversion: conversionGoal
        },
        progress: {
            users: parseFloat(userProgress),
            revenue: parseFloat(revenueProgress),
            conversion: parseFloat(conversionProgress),
            overall: parseFloat(avgProgress.toFixed(1))
        }
    };

    // Save to file
    const dataPath = 'data/success-metrics.json';
    await fs.mkdir('data', { recursive: true });

    // Load historical
    let history = [];
    try {
        const existing = await fs.readFile(dataPath, 'utf-8');
        history = JSON.parse(existing);
    } catch { }

    history.push(metrics);
    if (history.length > 30) history = history.slice(-30); // Keep 30 days

    await fs.writeFile(dataPath, JSON.stringify(history, null, 2));

    // Generate tweet
    console.log('🐦 TWEET-READY UPDATE:\n');
    console.log(`Week ${currentWeek} Update:
📊 Users: ${totalUsers.count}/${userGoal} (${userProgress}%)
💰 MRR: $${mrr}/$${revenueGoal} (${revenueProgress}%)
📈 Conversion: ${conversionRate}%/${conversionGoal}% (${conversionProgress}%)

${getMotivationalMessage(avgProgress)}

#BuildInPublic #GamingStartup`);

    console.log(`\n💾 Data saved to: ${dataPath}`);
}

function getProgressBar(percent) {
    const filled = Math.floor(percent / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percent}%`;
}

function getHealthStatus(percent) {
    if (percent >= 90) return '🟢 Excellent - On track for all goals!';
    if (percent >= 70) return '🟡 Good - Minor adjustments needed';
    if (percent >= 50) return '🟠 Fair - Focus required on lagging metrics';
    return '🔴 Needs Attention - Significant gaps vs goals';
}

function getMotivationalMessage(percent) {
    if (percent >= 90) return 'Crushing it! 🚀';
    if (percent >= 70) return 'Solid progress. Keep pushing! 💪';
    if (percent >= 50) return 'Making moves. Stay consistent. 📈';
    return 'Early days. Every step counts. 🎯';
}

generateSuccessMetrics().catch(console.error);

/*
USAGE:
node scripts/track-success-metrics.js

RUN DAILY:
Track progress toward weekly/monthly goals
Auto-generates tweet summaries
Shows visual progress bars
*/
