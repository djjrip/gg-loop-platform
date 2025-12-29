#!/usr/bin/env node

/**
 * INNOVATION: Automated user acquisition funnel
 * Tracks conversion at each stage, identifies drop-off points
 * Suggests optimizations based on data
 */

import { db } from "../server/db.js";
import { users, subscriptions, verificationProofs } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from 'fs/promises';

async function analyzeFunnel() {
    console.log('🔄 Analyzing User Acquisition Funnel...\n');

    // Stage 1: Total signups
    const [totalUsers] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users);

    // Stage 2: Activated (earned points)
    const [activated] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users)
        .where(sql`${users.totalPoints} > 0`);

    // Stage 3: Used desktop app
    const [appUsers] = await db
        .select({ count: sql < number > `COUNT(DISTINCT ${verificationProofs.userId})` })
        .from(verificationProofs);

    // Stage 4: Subscribed
    const [subscribers] = await db
        .select({ count: sql < number > `COUNT(DISTINCT ${subscriptions.userId})` })
        .from(subscriptions)
        .where(sql`${subscriptions.status} = 'active'`);

    // Calculate conversion rates
    const activationRate = (activated.count / totalUsers.count * 100).toFixed(1);
    const appRate = (appUsers.count / totalUsers.count * 100).toFixed(1);
    const conversionRate = (subscribers.count / totalUsers.count * 100).toFixed(1);

    const funnel = {
        timestamp: new Date().toISOString(),
        stages: {
            signup: {
                count: totalUsers.count,
                percentage: 100
            },
            activation: {
                count: activated.count,
                percentage: parseFloat(activationRate),
                dropOff: totalUsers.count - activated.count
            },
            appUsage: {
                count: appUsers.count,
                percentage: parseFloat(appRate),
                dropOff: activated.count - appUsers.count
            },
            subscription: {
                count: subscribers.count,
                percentage: parseFloat(conversionRate),
                dropOff: appUsers.count - subscribers.count
            }
        }
    };

    // Visual funnel
    console.log('📊 CONVERSION FUNNEL:\n');
    console.log(`Signup:        ${totalUsers.count} users (100%)`);
    console.log(`  ↓ ${activationRate}% convert`);
    console.log(`Activation:    ${activated.count} users (${activationRate}%)`);
    console.log(`  ↓ Drop: ${funnel.stages.activation.dropOff} users`);
    console.log(`App Usage:     ${appUsers.count} users (${appRate}%)`);
    console.log(`  ↓ Drop: ${funnel.stages.appUsage.dropOff} users`);
    console.log(`Subscription:  ${subscribers.count} users (${conversionRate}%)`);
    console.log(`  ↓ Drop: ${funnel.stages.subscription.dropOff} users\n`);

    // Identify biggest drop-off
    const dropOffs = [
        { stage: 'Signup → Activation', count: funnel.stages.activation.dropOff },
        { stage: 'Activation → App', count: funnel.stages.appUsage.dropOff },
        { stage: 'App → Subscription', count: funnel.stages.subscription.dropOff }
    ];

    dropOffs.sort((a, b) => b.count - a.count);
    const biggestLeak = dropOffs[0];

    console.log('🔴 BIGGEST LEAK:\n');
    console.log(`Stage: ${biggestLeak.stage}`);
    console.log(`Lost: ${biggestLeak.count} users\n`);

    // Optimization suggestions
    console.log('💡 OPTIMIZATION SUGGESTIONS:\n');

    if (biggestLeak.stage === 'Signup → Activation') {
        console.log('1. Improve onboarding flow');
        console.log('2. Add welcome email with clear first steps');
        console.log('3. Show quick wins (earn points fast)');
        console.log('4. Gamify first-time experience\n');
    } else if (biggestLeak.stage === 'Activation → App') {
        console.log('1. Make desktop app download more prominent');
        console.log('2. Add in-app prompts to download');
        console.log('3. Create app tutorial video');
        console.log('4. Offer bonus points for first app use\n');
    } else {
        console.log('1. Offer free trial or discount');
        console.log('2. Better communicate subscription benefits');
        console.log('3. Show value before asking for payment');
        console.log('4. Add social proof (testimonials)\n');
    }

    // Save funnel data
    await fs.mkdir('data', { recursive: true });

    // Load historical
    let history = [];
    try {
        const data = await fs.readFile('data/funnel-analysis.json', 'utf-8');
        history = JSON.parse(data);
    } catch { }

    history.push(funnel);
    if (history.length > 30) history = history.slice(-30); // Keep 30 days

    await fs.writeFile('data/funnel-analysis.json', JSON.stringify(history, null, 2));

    console.log('💾 Funnel data saved to data/funnel-analysis.json\n');

    // Calculate trend if we have historical data
    if (history.length > 1) {
        const previous = history[history.length - 2];
        const currentConv = funnel.stages.subscription.percentage;
        const previousConv = previous.stages.subscription.percentage;
        const trend = currentConv - previousConv;

        if (trend > 0) {
            console.log(`📈 Conversion improving: +${trend.toFixed(1)}% vs last check`);
        } else if (trend < 0) {
            console.log(`📉 Conversion declining: ${trend.toFixed(1)}% vs last check`);
        } else {
            console.log(`➡️  Conversion stable: ${currentConv}%`);
        }
    }
}

analyzeFunnel().catch(console.error);

/*
USAGE:

# Run funnel analysis
node scripts/funnel-analysis.js

# Automate (daily tracking)
Run via cron or add to daily-run.js

OPTIMIZATION WORKFLOW:
1. Run funnel analysis
2. Identify biggest leak
3. Implement suggested fix
4. Run again in 1 week
5. Measure improvement
6. Iterate

GOAL: Maximize conversion rate at each stage
*/
