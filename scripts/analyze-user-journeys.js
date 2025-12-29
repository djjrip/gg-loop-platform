#!/usr/bin/env node

/**
 * INNOVATION: Real-time user journey tracker
 * Logs every user action to understand behavior patterns
 * 100% authentic data for product decisions
 */

import { db } from "../server/db.js";
import { users, userRewards, verificationProofs } from "@shared/schema";
import { desc, sql } from "drizzle-orm";
import fs from 'fs/promises';
import path from 'path';

interface UserJourney {
    userId: string;
    username: string;
    signupDate: Date;
    lastActive: Date;
    totalPoints: number;
    rewardsRedeemed: number;
    gamesPlayed: string[];
    conversionProbability: number;
    blockingIssues: string[];
    nextBestAction: string;
}

async function analyzeUserJourneys() {
    console.log('🔍 Analyzing user journeys...\n');

    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

    const journeys: UserJourney[] = [];

    for (const user of allUsers) {
        // Get redemption count
        const redemptions = await db
            .select({ count: sql < number > `COUNT(*)` })
            .from(userRewards)
            .where(eq(userRewards.userId, user.id));

        // Get verification proofs to see what games they've played
        const proofs = await db
            .select()
            .from(verificationProofs)
            .where(eq(verificationProofs.userId, user.id))
            .limit(10);

        const gamesPlayed = [...new Set(proofs.map(p => p.sourceType))];

        // Calculate conversion probability
        const daysSinceSignup = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const hasPoints = user.totalPoints > 0;
        const hasRedeemed = redemptions[0]?.count > 0;
        const isActive = user.lastLoginAt &&
            (Date.now() - new Date(user.lastLoginAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

        let probability = 0;
        if (hasPoints) probability += 30;
        if (hasRedeemed) probability += 40;
        if (isActive) probability += 20;
        if (gamesPlayed.length > 0) probability += 10;

        // Identify blocking issues
        const blockingIssues = [];
        if (!hasPoints) blockingIssues.push("No points earned yet");
        if (!gamesPlayed.length) blockingIssues.push("Desktop app not used");
        if (!isActive) blockingIssues.push("Inactive for 7+ days");
        if (daysSinceSignup > 7 && !hasRedeemed) blockingIssues.push("No redemptions after 7 days");

        // Determine next best action
        let nextBestAction = "Email onboarding checklist";
        if (hasPoints && !hasRedeemed) nextBestAction = "Prompt to redeem rewards";
        if (gamesPlayed.length > 0 && !user.subscriptionStatus) nextBestAction = "Offer subscription trial";
        if (hasRedeemed && !user.subscriptionStatus) nextBestAction = "Convert to paid user";
        if (!isActive) nextBestAction = "Re-engagement campaign";

        journeys.push({
            userId: user.id,
            username: user.username || 'Unknown',
            signupDate: new Date(user.createdAt),
            lastActive: new Date(user.lastLoginAt || user.createdAt),
            totalPoints: user.totalPoints || 0,
            rewardsRedeemed: redemptions[0]?.count || 0,
            gamesPlayed,
            conversionProbability: probability,
            blockingIssues,
            nextBestAction,
        });
    }

    // Generate report
    console.log('📊 USER JOURNEY ANALYSIS\n');
    console.log(`Total Users: ${journeys.length}\n`);

    journeys.forEach((journey, i) => {
        console.log(`👤 User ${i + 1}: ${journey.username}`);
        console.log(`   Signup: ${journey.signupDate.toLocaleDateString()}`);
        console.log(`   Last Active: ${journey.lastActive.toLocaleDateString()}`);
        console.log(`   Points: ${journey.totalPoints}`);
        console.log(`   Redemptions: ${journey.rewardsRedeemed}`);
        console.log(`   Games: ${journey.gamesPlayed.join(', ') || 'None'}`);
        console.log(`   Conversion %: ${journey.conversionProbability}%`);

        if (journey.blockingIssues.length > 0) {
            console.log(`   🚫 Blockers: ${journey.blockingIssues.join(', ')}`);
        }

        console.log(`   ✅ Next Action: ${journey.nextBestAction}\n`);
    });

    // Save to file
    const reportPath = path.join(process.cwd(), 'data', 'user-journeys.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(journeys, null, 2));

    console.log(`💾 Report saved to: ${reportPath}`);

    // Generate action plan
    console.log('\n📋 IMMEDIATE ACTIONS:\n');

    const highProbability = journeys.filter(j => j.conversionProbability >= 50);
    const needsOnboarding = journeys.filter(j => j.totalPoints === 0);
    const inactive = journeys.filter(j =>
        (Date.now() - journey.lastActive.getTime()) > 7 * 24 * 60 * 60 * 1000
    );

    console.log(`🔥 High Conversion (${highProbability.length}):`);
    highProbability.forEach(j => console.log(`   - ${j.username}: ${j.nextBestAction}`));

    console.log(`\n📚 Needs Onboarding (${needsOnboarding.length}):`);
    needsOnboarding.forEach(j => console.log(`   - ${j.username}: ${j.nextBestAction}`));

    console.log(`\n💤 Inactive (${inactive.length}):`);
    inactive.forEach(j => console.log(`   - ${j.username}: ${j.nextBestAction}`));
}

// Run analysis
analyzeUserJourneys().catch(console.error);
