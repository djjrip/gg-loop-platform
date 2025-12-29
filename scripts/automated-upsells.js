#!/usr/bin/env node

/**
 * REVENUE SYSTEM: Automated upsell engine
 * Identifies upgrade opportunities, sends targeted offers
 * Increases average revenue per user (ARPU)
 */

import { db } from "../server/db.js";
import { users, subscriptions, verificationProofs } from "@shared/schema";
import { sql, eq, and, gte } from "drizzle-orm";
import fs from 'fs/promises';

async function findUpsellOpportunities() {
    console.log('📈 AUTOMATED UPSELL ENGINE\n');

    // Find users on basic plan who should upgrade
    const basicUsers = await db
        .select({
            userId: users.id,
            username: users.username,
            email: users.email,
            totalPoints: users.totalPoints,
            planId: subscriptions.planId
        })
        .from(users)
        .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
        .where(and(
            eq(subscriptions.planId, 'basic_monthly'),
            eq(subscriptions.status, 'active')
        ));

    console.log(`Found ${basicUsers.length} users on Basic plan\n`);

    const upsellTargets = [];

    for (const user of basicUsers) {
        // Calculate usage intensity
        const [proofCount] = await db
            .select({ count: sql < number > `COUNT(*)` })
            .from(verificationProofs)
            .where(eq(verificationProofs.userId, user.userId));

        const usageScore = proofCount.count;
        const pointsScore = user.totalPoints || 0;

        // Upsell criteria
        let upsellTier = null;
        let reason = '';
        let estimatedRevenueIncrease = 0;

        if (usageScore > 50 || pointsScore > 5000) {
            // Heavy user → Elite
            upsellTier = 'elite_monthly';
            reason = 'High usage - would benefit from Elite features';
            estimatedRevenueIncrease = 20; // $25 - $5
        } else if (usageScore > 20 || pointsScore > 2000) {
            // Moderate user → Pro
            upsellTier = 'pro_monthly';
            reason = 'Regular user - Pro tier unlocks more value';
            estimatedRevenueIncrease = 7; // $12 - $5
        }

        if (upsellTier) {
            upsellTargets.push({
                userId: user.userId,
                username: user.username,
                email: user.email,
                currentPlan: 'basic',
                recommendedPlan: upsellTier.replace('_monthly', ''),
                reason,
                usageScore,
                pointsScore,
                revenueIncrease: estimatedRevenueIncrease
            });
        }
    }

    console.log(`🎯 UPSELL OPPORTUNITIES: ${upsellTargets.length}\n`);

    let totalPotentialMRR = 0;

    upsellTargets.forEach(target => {
        console.log(`${target.username}:`);
        console.log(`  Current: ${target.currentPlan} ($5/mo)`);
        console.log(`  Recommend: ${target.recommendedPlan} (+$${target.revenueIncrease}/mo)`);
        console.log(`  Reason: ${target.reason}`);
        console.log(`  Usage: ${target.usageScore} verifications, ${target.pointsScore} points\n`);

        totalPotentialMRR += target.revenueIncrease;
    });

    console.log('═'.repeat(60));
    console.log(`\n💰 TOTAL UPSELL POTENTIAL: +$${totalPotentialMRR}/month\n`);

    if (totalPotentialMRR > 0) {
        console.log(`If all ${upsellTargets.length} users upgrade:`);
        console.log(`  Monthly: +$${totalPotentialMRR}`);
        console.log(`  Annual: +$${totalPotentialMRR * 12}\n`);
    }

    // Generate upsell emails
    console.log('═'.repeat(60));
    console.log('\n📧 UPSELL EMAIL TEMPLATES:\n');

    const proTemplate = `Subject: You're getting a lot of value from GG LOOP 🎮

Hey {username},

I noticed you've verified {usage_count} matches and earned {points} points on GG LOOP.

You're clearly getting value from the platform. Have you considered Pro?

Pro unlocks:
• 2x point multiplier
• Priority support
• Exclusive rewards
• Advanced stats

Just $12/month (instead of $5).

Worth it for power users like you.

Upgrade: https://ggloop.io/subscription

- Jayson`;

    const eliteTemplate = `Subject: Elite tier built for users like you

{username},

{usage_count} verified matches. {points} points earned.

You're in the top 10% of GG LOOP users.

Elite tier was literally built for people like you:
• 3x point multiplier
• First access to new games
• Custom rewards
• Direct line to founder (me)

$25/month. Worth every penny for serious gamers.

See the difference: https://ggloop.io/subscription

- Jayson`;

    console.log('PRO UPSELL TEMPLATE:');
    console.log(proTemplate);
    console.log('\n' + '═'.repeat(60) + '\n');
    console.log('ELITE UPSELL TEMPLATE:');
    console.log(eliteTemplate);
    console.log('\n');

    // Save opportunities
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile('data/upsell-opportunities.json', JSON.stringify({
        timestamp: new Date().toISOString(),
        targets: upsellTargets,
        potentialMRR: totalPotentialMRR,
        templates: { pro: proTemplate, elite: eliteTemplate }
    }, null, 2));

    console.log('💾 Upsell data saved to data/upsell-opportunities.json\n');

    // Execution plan
    console.log('═'.repeat(60));
    console.log('\n✅ EXECUTION PLAN:\n');
    console.log('1. Review upsell targets in data/upsell-opportunities.json');
    console.log('2. Personalize emails with actual usage data');
    console.log('3. Send to top 3 candidates first');
    console.log('4. Track conversion rate');
    console.log('5. Scale to all targets if 1+ converts\n');

    console.log('Expected conversion: 20-30% (industry standard)');
    console.log(`Expected revenue: $${(totalPotentialMRR * 0.25).toFixed(0)}/month\n`);
}

findUpsellOpportunities().catch(console.error);

/*
UPSELL STRATEGY:

Basic → Pro: Regular users (20+ verifications)
Basic → Elite: Power users (50+ verifications)

Pro → Elite: Users hitting Pro limits

TIMING:
Send after 30 days on current plan
Re-send every 60 days if no action

AUTHENTIC APPROACH:
"You're using this a lot. Upgrade makes sense."
No fake urgency. Just honest value prop.
*/
