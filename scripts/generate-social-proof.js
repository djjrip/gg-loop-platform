#!/usr/bin/env node

/**
 * INNOVATION: Authentic social proof generator
 * Uses REAL data to create genuine testimonials and stats
 * No fake numbers - only database truth
 */

import { db } from "../server/db.js";
import { users, userRewards, xPostLogs } from "@shared/schema";
import { sql, desc } from "drizzle-orm";
import fs from 'fs/promises';

async function generateSocialProof() {
    console.log('🎯 Generating authentic social proof...\n');

    // Real platform stats
    const [totalUsers] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(users);

    const [totalPoints] = await db
        .select({ total: sql < number > `COALESCE(SUM(${users.totalPoints}), 0)` })
        .from(users);

    const [totalRedemptions] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(userRewards);

    const [twitterPosts] = await db
        .select({ count: sql < number > `COUNT(*)` })
        .from(xPostLogs);

    // Get most engaged user
    const topUser = await db
        .select()
        .from(users)
        .orderBy(desc(users.totalPoints))
        .limit(1);

    const stats = {
        users: totalUsers.count || 0,
        points: totalPoints.total || 0,
        redemptions: totalRedemptions.count || 0,
        tweets: twitterPosts.count || 0,
        topPlayer: topUser[0]?.username || 'N/A',
        topPoints: topUser[0]?.totalPoints || 0,
    };

    console.log('📊 REAL STATS:\n');
    console.log(`Users: ${stats.users}`);
    console.log(`Total Points Earned: ${stats.points.toLocaleString()}`);
    console.log(`Rewards Redeemed: ${stats.redemptions}`);
    console.log(`Twitter Posts: ${stats.tweets}`);
    console.log(`Top Player: ${stats.topPlayer} (${stats.topPoints} points)\n`);

    // Generate authentic social proof snippets
    const proofs = [];

    // Stat-based proofs
    if (stats.users > 0) {
        proofs.push({
            type: 'stat',
            text: `${stats.users} early adopters testing the platform`,
            authentic: true,
        });
    }

    if (stats.points > 0) {
        proofs.push({
            type: 'stat',
            text: `${stats.points.toLocaleString()} points earned by real players`,
            authentic: true,
        });
    }

    if (stats.redemptions > 0) {
        proofs.push({
            type: 'stat',
            text: `${stats.redemptions} rewards claimed and fulfilled`,
            authentic: true,
        });
    }

    // Journey-based proofs (authentic framing)
    proofs.push({
        type: 'journey',
        text: 'Built in 90 days by a solo founder during bankruptcy',
        authentic: true,
    });

    proofs.push({
        type: 'journey',
        text: 'From broke to building - real startup story',
        authentic: true,
    });

    // Platform maturity (honest)
    proofs.push({
        type: 'maturity',
        text: 'Early stage - your feedback shapes the product',
        authentic: true,
    });

    proofs.push({
        type: 'maturity',
        text: 'Not perfect, but it works - and improving daily',
        authentic: true,
    });

    // Save social proof
    const outputPath = 'data/social-proof.json';
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify({
        generated: new Date().toISOString(),
        stats,
        proofs,
    }, null, 2));

    console.log(`💾 Social proof saved to: ${outputPath}\n`);

    // Generate copy-paste snippets
    console.log('📝 COPY-PASTE SOCIAL PROOF:\n');

    console.log('For Homepage:');
    console.log(`"${stats.users} players earning rewards | ${stats.points.toLocaleString()} points distributed"\n`);

    console.log('For Twitter Bio:');
    console.log(`Gaming rewards platform | ${stats.users} early users | Built in public from bankruptcy\n`);

    console.log('For Reddit Posts:');
    console.log(`"Platform Stats: ${stats.users} users, ${stats.points.toLocaleString()} points earned, ${stats.redemptions} rewards claimed"\n`);

    console.log('For Discord/Email:');
    console.log(`"Join ${stats.users} players earning rewards for their gameplay"\n`);

    // Generate tweet thread
    console.log('🐦 AUTHENTIC TWEET THREAD:\n');

    const tweets = [
        `90 days ago: Filed for bankruptcy\nToday: Live gaming platform\n\nThe journey: 🧵`,

        `REAL stats (no BS):\n• ${stats.users} users\n• ${stats.points.toLocaleString()} points earned\n• ${stats.redemptions} rewards claimed\n• $0 revenue (yet)`,

        `What's working:\n• Desktop verification ✅\n• Point earnings ✅\n• Reward shop ✅\n\nWhat's broken:\n• User growth 😅\n• Revenue 😅\n• Sleep schedule 😅`,

        `Built with:\n• React + TypeScript\n• Electron for game detection\n• PostgreSQL\n• 100% solo\n• 0% BS`,

        `The brutal truth:\n${stats.users} users in 90 days isn't great.\n\nBut each one taught me something.\n\nBuilding in public = accountability.`,

        `Next milestone: 50 users\n\nIf you're a gamer or dev, check it out:\nggloop.io\n\nFeedback > signups.`,
    ];

    tweets.forEach((tweet, i) => {
        console.log(`${i + 1}/${tweets.length}: ${tweet}\n`);
    });

    // Save tweet thread
    await fs.writeFile('data/tweet-thread.txt', tweets.join('\n\n---\n\n'));
    console.log('💾 Tweet thread saved to: data/tweet-thread.txt');
}

generateSocialProof().catch(console.error);
