/**
 * VIRAL REFERRAL SYSTEM - ACTIVATION
 * Leverages existing schema.referrals table
 * Innovation: Compound rewards = exponential growth
 */
import { db } from '../server/db';
import { referrals, pointTransactions, users } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
// REFERRAL REWARD TIERS
const REFERRAL_REWARDS = {
    signup: 100, // Both get 100 points when referred user signs up
    firstGame: 50, // Referrer gets 50 when referred user plays first game
    firstRedemption: 10 // Referrer gets 10% of redemption value
};
/**
 * Step 1: User A shares referral code
 * Step 2: User B signs up with code → both get 100 points
 */
export async function processReferralSignup(referrerId, newUserId) {
    // Create referral record
    await db.insert(referrals).values({
        referrerId,
        referredUserId: newUserId,
        status: 'pending',
        pointsAwarded: 0
    });
    // Award signup bonus to BOTH users
    await awardPoints(referrerId, REFERRAL_REWARDS.signup, 'referral_signup', newUserId);
    await awardPoints(newUserId, REFERRAL_REWARDS.signup, 'referred_bonus', referrerId);
    // Update referral status
    await db.update(referrals)
        .set({
        status: 'activated',
        activatedAt: new Date(),
        pointsAwarded: REFERRAL_REWARDS.signup * 2,
        tier: 1
    })
        .where(and(eq(referrals.referrerId, referrerId), eq(referrals.referredUserId, newUserId)));
    console.log(`✅ Referral activated: ${referrerId} → ${newUserId}`);
}
/**
 * Step 3: User B plays first game → User A gets bonus
 */
export async function processReferralFirstGame(userId) {
    // Find who referred this user
    const referral = await db.query.referrals.findFirst({
        where: eq(referrals.referredUserId, userId)
    });
    if (!referral)
        return;
    // Award bonus to referrer
    await awardPoints(referral.referrerId, REFERRAL_REWARDS.firstGame, 'referral_first_game', userId);
    // Update referral tier
    await db.update(referrals)
        .set({ tier: 2 })
        .where(eq(referrals.id, referral.id));
    console.log(`✅ Referral tier 2: ${referral.referrerId} earned ${REFERRAL_REWARDS.firstGame} (referred user played first game)`);
}
/**
 * Step 4: User B redeems → User A gets 10% value
 */
export async function processReferralRedemption(userId, pointsSpent) {
    const referral = await db.query.referrals.findFirst({
        where: eq(referrals.referredUserId, userId)
    });
    if (!referral)
        return;
    // 10% of redemption value
    const bonus = Math.floor(pointsSpent * 0.1);
    await awardPoints(referral.referrerId, bonus, 'referral_redemption', userId);
    // Mark as completed
    await db.update(referrals)
        .set({
        status: 'completed',
        completedAt: new Date(),
        tier: 3,
        completionReason: 'first_redemption'
    })
        .where(eq(referrals.id, referral.id));
    console.log(`✅ Referral completed: ${referral.referrerId} earned ${bonus} (10% of redemption)`);
}
// Helper: Award points with transaction
async function awardPoints(userId, amount, type, sourceId) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });
    if (!user)
        throw new Error('User not found');
    const newBalance = user.totalPoints + amount;
    // Update user points
    await db.update(users)
        .set({ totalPoints: newBalance })
        .where(eq(users.id, userId));
    // Log transaction
    await db.insert(pointTransactions).values({
        userId,
        amount,
        type,
        sourceId,
        sourceType: 'referral',
        balanceAfter: newBalance,
        description: `Referral reward: ${type}`
    });
}
/**
 * PUBLIC API: Get user's referral stats
 */
export async function getReferralStats(userId) {
    const referred = await db.query.referrals.findMany({
        where: eq(referrals.referrerId, userId)
    });
    const totalEarned = referred.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
    const activated = referred.filter(r => r.status === 'activated' || r.status === 'completed').length;
    const completed = referred.filter(r => r.status === 'completed').length;
    return {
        totalReferred: referred.length,
        activated,
        completed,
        totalEarned,
        pendingEarnings: referred
            .filter(r => r.status === 'pending')
            .length * REFERRAL_REWARDS.signup
    };
}
export { REFERRAL_REWARDS };
