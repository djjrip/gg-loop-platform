/**
 * 🎁 REFERRAL SYSTEM AUTOMATION
 *
 * Auto-award referral bonuses
 * Track conversions
 * Generate referral links
 */
import { db } from '../database';
import { users, subscriptions, pointTransactions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { pointsEngine } from '../pointsEngine';
const REFERRAL_BONUS = 500; // Points for referrer
const REFERRAL_BONUS_NEW_USER = 500; // Points for new user
/**
 * Process referral when new user signs up
 */
export async function processReferral(newUserId, referralCode) {
    if (!referralCode)
        return;
    try {
        // Find referrer by code
        const [referrer] = await db
            .select()
            .from(users)
            .where(eq(users.referralCode, referralCode))
            .limit(1);
        if (!referrer)
            return;
        // Update new user's referredBy field
        await db
            .update(users)
            .set({ referredBy: referrer.id })
            .where(eq(users.id, newUserId));
        // Award bonus to referrer
        await pointsEngine.awardPoints(referrer.id, REFERRAL_BONUS, 'referral_bonus', newUserId, 'referral', `Referral bonus: ${referralCode}`);
        // Award bonus to new user
        await pointsEngine.awardPoints(newUserId, REFERRAL_BONUS_NEW_USER, 'referral_signup_bonus', referrer.id, 'referral', `Signup bonus from referral: ${referralCode}`);
        console.log(`✅ Referral processed: ${referralCode} - ${REFERRAL_BONUS} points to referrer, ${REFERRAL_BONUS_NEW_USER} to new user`);
    }
    catch (error) {
        console.error('Referral processing error:', error);
    }
}
/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId) {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user || !user.referralCode)
            return null;
        // Count successful referrals (users who signed up with this code)
        const [referralCount] = await db
            .select({ count: sql `COUNT(*)` })
            .from(users)
            .where(eq(users.referredBy, user.id));
        // Count referrals who subscribed
        const subscribedReferrals = await db
            .select({ count: sql `COUNT(DISTINCT ${subscriptions.userId})` })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.userId, users.id))
            .where(and(eq(users.referredBy, user.id), eq(subscriptions.status, 'active')));
        return {
            referralCode: user.referralCode,
            referralLink: `https://ggloop.io/signup?ref=${user.referralCode}`,
            totalReferrals: referralCount?.count || 0,
            subscribedReferrals: subscribedReferrals[0]?.count || 0,
            totalBonusEarned: REFERRAL_BONUS * (referralCount?.count || 0)
        };
    }
    catch (error) {
        console.error('Get referral stats error:', error);
        return null;
    }
}
/**
 * Run referral automation
 */
export async function runReferralAutomation() {
    console.log('🎁 Running referral automation...');
    try {
        // Process any pending referrals (users with referredBy but no bonus awarded yet)
        // This is handled during signup, but we can check for any missed ones
        const newUsers = await db
            .select()
            .from(users)
            .where(sql `${users.referredBy} IS NOT NULL`)
            .limit(100);
        // Check if referral bonuses were already awarded by checking point transactions
        for (const user of newUsers) {
            if (user.referredBy) {
                // Check if bonus was already awarded
                const [existingBonus] = await db
                    .select()
                    .from(pointTransactions)
                    .where(and(eq(pointTransactions.userId, user.id), eq(pointTransactions.type, 'referral_signup_bonus')))
                    .limit(1);
                if (!existingBonus) {
                    // Bonus not awarded yet, find referrer and award
                    const [referrer] = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, user.referredBy))
                        .limit(1);
                    if (referrer) {
                        await pointsEngine.awardPoints(user.id, REFERRAL_BONUS_NEW_USER, 'referral_signup_bonus', referrer.id, 'referral', `Signup bonus from referral`);
                    }
                }
            }
        }
        console.log(`✅ Referral automation complete: ${newUsers.length} referrals processed`);
    }
    catch (error) {
        console.error('Referral automation error:', error);
    }
}
