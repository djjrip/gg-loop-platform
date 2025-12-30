import crypto from 'crypto';
export function generateReferralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        const randomByte = crypto.randomBytes(1)[0];
        const index = randomByte % chars.length;
        code += chars[index];
    }
    return code;
}
export const REFERRAL_TIERS = [
    {
        minReferrals: 1,
        pointsPerReferral: 50,
        bonusPoints: 0,
        name: 'Bronze',
    },
    {
        minReferrals: 3,
        pointsPerReferral: 75,
        bonusPoints: 150,
        name: 'Silver',
    },
    {
        minReferrals: 10,
        pointsPerReferral: 100,
        bonusPoints: 500,
        name: 'Gold',
    },
    {
        minReferrals: 25,
        pointsPerReferral: 150,
        bonusPoints: 1500,
        name: 'Platinum',
    },
    {
        minReferrals: 50,
        pointsPerReferral: 200,
        bonusPoints: 5000,
        name: 'Diamond',
    },
];
/**
 * SQUAD BONUS: "Bring Your Squad"
 * Viral growth mechanic - reward users who bring groups of friends quickly
 */
export const SQUAD_MILESTONES = [
    {
        referralsNeeded: 3,
        daysLimit: 7,
        bonusPoints: 200,
        name: 'Squad Starter',
        description: 'Bring 3 friends in 7 days',
    },
    {
        referralsNeeded: 5,
        daysLimit: 14,
        bonusPoints: 500,
        name: 'Squad Leader',
        description: 'Bring 5 friends in 2 weeks',
    },
    {
        referralsNeeded: 10,
        daysLimit: 30,
        bonusPoints: 1500,
        name: 'Squad Commander',
        description: 'Bring 10 friends in 30 days',
    },
];
/**
 * Check if user has unlocked any squad milestones
 * Returns the milestones they've achieved
 */
export function checkSquadMilestones(referrals, previouslyAwarded = []) {
    const now = new Date();
    const results = [];
    for (const milestone of SQUAD_MILESTONES) {
        const alreadyAwarded = previouslyAwarded.includes(milestone.name);
        // Count referrals within the time window
        const cutoffDate = new Date(now.getTime() - milestone.daysLimit * 24 * 60 * 60 * 1000);
        const recentReferrals = referrals.filter(r => r.createdAt >= cutoffDate);
        const earned = recentReferrals.length >= milestone.referralsNeeded && !alreadyAwarded;
        results.push({ milestone, earned });
    }
    return results;
}
export function calculateReferralReward(totalReferrals) {
    let currentTier = null;
    let totalPoints = 0;
    for (const tier of REFERRAL_TIERS) {
        if (totalReferrals >= tier.minReferrals) {
            currentTier = tier;
        }
    }
    if (!currentTier) {
        return { tier: null, totalPoints: 0 };
    }
    const reversedTiers = [...REFERRAL_TIERS].reverse();
    for (let i = 1; i <= totalReferrals; i++) {
        const tierForThisReferral = reversedTiers.find(t => i >= t.minReferrals) || REFERRAL_TIERS[0];
        totalPoints += tierForThisReferral.pointsPerReferral;
        const tierUnlocked = REFERRAL_TIERS.find(t => t.minReferrals === i);
        if (tierUnlocked) {
            totalPoints += tierUnlocked.bonusPoints;
        }
    }
    return { tier: currentTier, totalPoints };
}
export const FREE_TRIAL_DURATION_DAYS = 7;
export const FREE_TRIAL_DAILY_POINTS = 100;
export const FREE_TRIAL_QUEST_MILESTONES = [
    { day: 1, points: 50, title: 'Complete First Match', description: 'Report your first win' },
    { day: 3, points: 100, title: 'Stay Active', description: 'Play 3 matches this week' },
    { day: 5, points: 150, title: 'Build Momentum', description: 'Earn 500 total points' },
    { day: 7, points: 200, title: 'Trial Complete!', description: 'Subscribe to keep earning' },
];
