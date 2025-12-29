#!/usr/bin/env node

/**
 * INNOVATION: Revenue milestone automation
 * Automatically celebrates and capitalizes on revenue milestones
 * Posts achievements, sends notifications, updates marketing
 */

import { db } from "../server/db.js";
import { subscriptions } from "@shared/schema";
import { sql, gte } from "drizzle-orm";
import fs from 'fs/promises';

const MILESTONES = [
    { amount: 25, message: "First $25 MRR! 🎉" },
    { amount: 50, message: "$50 MRR - Growing! 📈" },
    { amount: 100, message: "$100 MRR Achieved! 💯" },
    { amount: 250, message: "Quarter way to $1K! 🚀" },
    { amount: 500, message: "$500 MRR - Half way! ⭐" },
    { amount: 1000, message: "$1K MRR MILESTONE! 🏆" },
    { amount: 2500, message: "$2.5K MRR - Scaling! 📊" },
    { amount: 5000, message: "$5K MRR ACHIEVED! 🎯" },
    { amount: 10000, message: "$10K MRR - FIVE FIGURES! 💰" }
];

async function checkRevenueMilestones() {
    console.log('💰 Checking Revenue Milestones...\n');

    // Calculate current MRR
    const activeSubs = await db
        .select()
        .from(subscriptions)
        .where(sql`${subscriptions.status} = 'active'`);

    let mrr = 0;
    activeSubs.forEach(sub => {
        if (sub.planId === 'basic_monthly') mrr += 5;
        else if (sub.planId === 'pro_monthly') mrr += 12;
        else if (sub.planId === 'elite_monthly') mrr += 25;
    });

    console.log(`Current MRR: $${mrr}`);
    console.log(`Active Subscribers: ${activeSubs.length}\n`);

    // Load milestone history
    let history = [];
    try {
        const data = await fs.readFile('data/milestone-history.json', 'utf-8');
        history = JSON.parse(data);
    } catch { }

    const achieved = history.map(h => h.milestone);

    // Check for new milestones
    const newMilestones = MILESTONES.filter(m =>
        mrr >= m.amount && !achieved.includes(m.amount)
    );

    if (newMilestones.length > 0) {
        console.log('🎉 NEW MILESTONES ACHIEVED!\n');

        for (const milestone of newMilestones) {
            console.log(`✅ ${milestone.message}`);

            // Log milestone
            history.push({
                milestone: milestone.amount,
                achievedAt: new Date().toISOString(),
                mrr: mrr,
                subscribers: activeSubs.length
            });

            // Generate celebration content
            const tweet = generateCelebrationTweet(milestone.amount, mrr, activeSubs.length);
            const linkedIn = generateLinkedInPost(milestone.amount, mrr);

            console.log('\n📱 TWEET THIS:');
            console.log(tweet);
            console.log('\n💼 LINKEDIN POST:');
            console.log(linkedIn);
            console.log('\n---\n');
        }

        // Save updated history
        await fs.mkdir('data', { recursive: true });
        await fs.writeFile('data/milestone-history.json', JSON.stringify(history, null, 2));

        // Save celebration content
        const content = newMilestones.map(m => ({
            milestone: m.amount,
            tweet: generateCelebrationTweet(m.amount, mrr, activeSubs.length),
            linkedIn: generateLinkedInPost(m.amount, mrr)
        }));

        await fs.writeFile(
            'data/celebration-content.json',
            JSON.stringify(content, null, 2)
        );

        console.log('💾 Celebration content saved to data/celebration-content.json\n');

    } else {
        console.log('No new milestones reached.');
        const next = MILESTONES.find(m => m.amount > mrr);
        if (next) {
            const remaining = next.amount - mrr;
            const subsNeeded = Math.ceil(remaining / 10); // Avg $10/user
            console.log(`\nNext milestone: $${next.amount} MRR`);
            console.log(`Need: $${remaining} more (~${subsNeeded} subscribers)\n`);
        }
    }
}

function generateCelebrationTweet(milestone, currentMRR, subs) {
    const days = Math.floor((Date.now() - new Date('2024-10-01').getTime()) / (1000 * 60 * 60 * 24));

    return `Just hit $${milestone} MRR on @ggloopllc! 🎉

Built from bankruptcy in ${days} days
${subs} amazing subscribers
100% bootstrapped
$0 raised

Every dollar proves the concept works.

Building in public. Every milestone matters.

#BuildInPublic #SaaS #Gaming`;
}

function generateLinkedInPost(milestone, currentMRR) {
    return `🎯 Milestone: $${milestone} MRR Achieved

I'm excited to share that GG LOOP just crossed $${milestone} in monthly recurring revenue.

The Journey:
• Started from Chapter 7 bankruptcy
• Built the entire platform solo
• $0 funding raised
• 100% bootstrapped
• Every feature built based on real user feedback

Key Learnings:
1. Authenticity > Marketing hype
2. Real users > vanity metrics  
3. Consistent execution > perfect planning
4. Revenue validates product-market fit

What's Next:
We're focused on reaching $1,000 MRR by continuing to deliver value to our gaming community. Every subscriber helps us build better features.

To everyone who believed in the vision early - thank you. This is just the beginning.

#Entrepreneurship #SaaS #GamingIndustry #Bootstrapped #BuildInPublic`;
}

async function automateRevenueCelebration() {
    await checkRevenueMilestones();

    // Auto-update website stats
    console.log('\n📊 TODO: Update website with current MRR');
    console.log('📊 TODO: Update pitch deck with revenue proof');
    console.log('📊 TODO: Update investor materials\n');
}

automateRevenueCelebration().catch(console.error);

/*
USAGE:

# Check milestones manually
node scripts/revenue-milestones.js

# Automate (run after every new subscription)
- Add to webhook handler
- Or run daily via cron
- Or trigger from payment success

INTEGRATION:
Import and call after successful subscription:
```javascript
import { checkRevenueMilestones } from './scripts/revenue-milestones.js';
await checkRevenueMilestones();
```
*/
