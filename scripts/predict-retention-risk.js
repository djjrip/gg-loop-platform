#!/usr/bin/env node

/**
 * INNOVATION: User retention predictor
 * Predicts which users are at risk of churning
 * Uses simple heuristics based on activity patterns
 */

import { db } from "../server/db.js";
import { users, verificationProofs } from "@shared/schema";
import { sql, desc, eq } from "drizzle-orm";
import fs from 'fs/promises';

interface RetentionRisk {
    userId: string;
    username: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    signals: string[];
    recommendation: string;
    daysUntilChurn: number;
}

async function predictRetentionRisk() {
    console.log('🔮 Predicting User Retention Risk...\n');

    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

    const risks: RetentionRisk[] = [];

    for (const user of allUsers) {
        const signals: string[] = [];
        let riskScore = 0;

        // Calculate days since signup
        const daysSinceSignup = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate days since last login
        const daysSinceLogin = user.lastLoginAt
            ? Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
            : daysSinceSignup;

        // Risk Signal 1: Inactive for 7+ days
        if (daysSinceLogin >= 7) {
            riskScore += 30;
            signals.push(`Inactive for ${daysSinceLogin} days`);
        }

        // Risk Signal 2: No points earned
        if (!user.totalPoints || user.totalPoints === 0) {
            riskScore += 25;
            signals.push('Never earned points');
        }

        // Risk Signal 3: Signed up but never used desktop app
        const proofCount = await db
            .select({ count: sql < number > `COUNT(*)` })
            .from(verificationProofs)
            .where(eq(verificationProofs.userId, user.id));

        if (proofCount[0].count === 0) {
            riskScore += 20;
            signals.push('Desktop app never used');
        }

        // Risk Signal 4: Low engagement (signed up >14 days ago, <100 points)
        if (daysSinceSignup > 14 && (user.totalPoints || 0) < 100) {
            riskScore += 15;
            signals.push('Low engagement after 2 weeks');
        }

        // Risk Signal 5: No subscription after 30 days
        if (daysSinceSignup > 30 && !user.subscriptionStatus) {
            riskScore += 10;
            signals.push('No subscription after 30 days');
        }

        // Determine risk level
        let riskLevel: RetentionRisk['riskLevel'];
        if (riskScore >= 75) riskLevel = 'critical';
        else if (riskScore >= 50) riskLevel = 'high';
        else if (riskScore >= 25) riskLevel = 'medium';
        else riskLevel = 'low';

        // Predict days until churn (rough heuristic)
        let daysUntilChurn = 90; // Default
        if (riskLevel === 'critical') daysUntilChurn = 3;
        else if (riskLevel === 'high') daysUntilChurn = 7;
        else if (riskLevel === 'medium') daysUntilChurn = 14;

        // Generate recommendation
        let recommendation = '';
        if (signals.includes('Never earned points')) {
            recommendation = 'Send onboarding email with step-by-step guide';
        } else if (signals.includes('Desktop app never used')) {
            recommendation = 'Email with desktop app tutorial video';
        } else if (daysSinceLogin >= 7) {
            recommendation = 'Re-engagement campaign: "We miss you" email';
        } else if (signals.includes('No subscription after 30 days')) {
            recommendation = 'Offer limited-time discount or free trial';
        } else {
            recommendation = 'Keep nurturing with weekly updates';
        }

        risks.push({
            userId: user.id,
            username: user.username || 'Unknown',
            riskLevel,
            riskScore,
            signals,
            recommendation,
            daysUntilChurn
        });
    }

    // Sort by risk score (highest first)
    risks.sort((a, b) => b.riskScore - a.riskScore);

    // Console output
    console.log('📊 RETENTION RISK ANALYSIS\n');

    const critical = risks.filter(r => r.riskLevel === 'critical');
    const high = risks.filter(r => r.riskLevel === 'high');
    const medium = risks.filter(r => r.riskLevel === 'medium');
    const low = risks.filter(r => r.riskLevel === 'low');

    console.log(`🚨 CRITICAL (${critical.length}):`);
    critical.forEach(r => {
        console.log(`   ${r.username} - ${r.riskScore}% risk`);
        console.log(`      Signals: ${r.signals.join(', ')}`);
        console.log(`      Action: ${r.recommendation}\n`);
    });

    console.log(`⚠️  HIGH (${high.length}):`);
    high.forEach(r => {
        console.log(`   ${r.username} - ${r.riskScore}% risk`);
        console.log(`      Action: ${r.recommendation}\n`);
    });

    console.log(`📝 MEDIUM (${medium.length}): Monitor closely`);
    console.log(`✅ LOW (${low.length}): Healthy retention\n`);

    // Save to file
    const dataPath = 'data/retention-risk.json';
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: risks.length,
            critical: critical.length,
            high: high.length,
            medium: medium.length,
            low: low.length
        },
        risks
    }, null, 2));

    console.log(`💾 Report saved to: ${dataPath}`);

    // Action plan
    console.log('\n📋 IMMEDIATE ACTIONS:\n');
    console.log('1. Email critical risk users TODAY');
    console.log('2. Set up re-engagement automation for inactive users');
    console.log('3. Improve onboarding for users who never earn points');
    console.log('4. Create desktop app tutorial video\n');

    // Export email list for critical/high
    const urgentEmails = [...critical, ...high]
        .filter(r => r.userId) // Has email
        .map(r => ({ username: r.username, action: r.recommendation }));

    if (urgentEmails.length > 0) {
        console.log('📧 URGENT EMAIL LIST:\n');
        urgentEmails.forEach(u => {
            console.log(`   • ${u.username}: ${u.action}`);
        });
    }
}

predictRetentionRisk().catch(console.error);

/*
USAGE:
node scripts/predict-retention-risk.js

INTEGRATE WITH:
- Email automation (send-email-campaign.js)
- Daily briefing (run before morning report)
- Dashboard (show at-risk users)

AUTOMATE:
Run daily to catch users before they churn
*/
