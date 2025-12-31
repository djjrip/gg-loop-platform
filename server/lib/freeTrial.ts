/**
 * Free Trial Automation
 * Gives new users 7-day Pro trial automatically
 * Converts them to paid after they experience premium benefits
 * 
 * Strategy: Let them taste 2x points for a week, then they're hooked
 */

import { db } from '../database';
import { users } from "../../shared/schema";
import { eq } from 'drizzle-orm';

export interface TrialStatus {
    isTrialing: boolean;
    daysRemaining: number;
    expiresAt: Date | null;
    hasExpired: boolean;
}

/**
 * Activate free trial for new user
 * Called during signup
 */
export async function activateFreeTrial(userId: string): Promise<void> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

    await db.update(users)
        .set({
            subscriptionStatus: 'trialing',
            subscriptionTier: 'pro',
            trialEndsAt: trialEndDate,
        })
        .where(eq(users.id, userId));

    console.log(`✅ Activated 7-day Pro trial for user ${userId}`);
}

/**
 * Check if user's trial has expired
 * Run this on every request or via cron job
 */
export async function checkTrialExpiration(userId: string): Promise<TrialStatus> {
    const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        return {
            isTrialing: false,
            daysRemaining: 0,
            expiresAt: null,
            hasExpired: false,
        };
    }

    // Not on trial
    if (user.subscriptionStatus !== 'trialing' || !user.trialEndsAt) {
        return {
            isTrialing: false,
            daysRemaining: 0,
            expiresAt: null,
            hasExpired: false,
        };
    }

    const now = new Date();
    const expiresAt = new Date(user.trialEndsAt);
    const hasExpired = now > expiresAt;

    if (hasExpired) {
        // Downgrade to free tier
        await db.update(users)
            .set({
                subscriptionStatus: 'inactive',
                subscriptionTier: null,
                trialEndsAt: null,
            })
            .where(eq(users.id, userId));

        console.log(`⏰ Trial expired for user ${userId}, downgraded to free`);

        return {
            isTrialing: false,
            daysRemaining: 0,
            expiresAt,
            hasExpired: true,
        };
    }

    // Trial still active
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    return {
        isTrialing: true,
        daysRemaining,
        expiresAt,
        hasExpired: false,
    };
}

/**
 * Get trial reminder message based on days remaining
 */
export function getTrialReminderMessage(daysRemaining: number): string {
    if (daysRemaining === 1) {
        return "⚠️ Last day of Pro trial! Upgrade now to keep 2x points forever.";
    }
    if (daysRemaining <= 3) {
        return `⏰ ${daysRemaining} days left of Pro trial. Upgrade to keep earning 2x points!`;
    }
    return `✨ ${daysRemaining} days left of Pro trial. You're earning 2x points!`;
}

/**
 * Calculate points earned during trial
 * Shows user what they gained vs what they would have as free
 */
export function calculateTrialValue(pointsEarned: number): {
    withTrial: number;
    withoutTrial: number;
    bonusEarned: number;
} {
    const withoutTrial = Math.floor(pointsEarned / 2); // They got 2x
    const bonusEarned = pointsEarned - withoutTrial;

    return {
        withTrial: pointsEarned,
        withoutTrial,
        bonusEarned,
    };
}

/**
 * Post-trial conversion message
 * Shows user what they'll lose if they don't upgrade
 */
export function getPostTrialMessage(totalPoints: number): {
    title: string;
    message: string;
    lostValue: number;
} {
    const value = calculateTrialValue(totalPoints);

    return {
        title: "Your Pro Trial Has Ended",
        message: `You earned ${value.bonusEarned.toLocaleString()} BONUS points during your trial. Keep earning 2x by upgrading to Pro for just $9.99/month.`,
        lostValue: value.bonusEarned,
    };
}

/**
 * Cron job to expire trials
 * Run daily via Railway cron
 */
export async function expireTrials(): Promise<number> {
    console.log('🔍 Checking for expired trials...');

    const expiredUsers = await db.select()
        .from(users)
        .where(eq(users.subscriptionStatus, 'trialing'));

    let expired = 0;

    for (const user of expiredUsers) {
        const status = await checkTrialExpiration(user.id);
        if (status.hasExpired) {
            expired++;
        }
    }

    console.log(`✅ Expired ${expired} trials`);
    return expired;
}
