/**
 * STREAK MULTIPLIER SYSTEM
 * Exponential rewards for daily login consistency
 * Innovation: Retention mechanism that compounds engagement
 */
import { db } from '../server/db';
import { users, pointTransactions } from '../shared/schema';
import { eq } from 'drizzle-orm';
// Streak tier multipliers
const STREAK_MULTIPLIERS = {
    1: 1.0, // Days 1-6: Normal points
    7: 1.5, // Week 1 complete: 1.5x
    14: 2.0, // Week 2 complete: 2x
    30: 3.0, // Month complete: 3x
    60: 4.0, // 2 months: 4x
    90: 5.0 // 3 months: 5x (max)
};
/**
 * Get multiplier for current streak
 */
export function getStreakMultiplier(streak) {
    if (streak >= 90)
        return 5.0;
    if (streak >= 60)
        return 4.0;
    if (streak >= 30)
        return 3.0;
    if (streak >= 14)
        return 2.0;
    if (streak >= 7)
        return 1.5;
    return 1.0;
}
/**
 * Update user's login streak
 * Called on each login
 */
export async function updateLoginStreak(userId) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });
    if (!user)
        throw new Error('User not found');
    const now = new Date();
    const lastLogin = user.lastLoginAt;
    let newStreak = 1;
    let bonusPoints = 0;
    if (lastLogin) {
        const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
        // Within 24-48 hours = streak continues
        if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin < 48) {
            newStreak = (user.loginStreak || 0) + 1;
            // Milestone bonuses
            if (newStreak === 7)
                bonusPoints = 100; // Week 1
            if (newStreak === 14)
                bonusPoints = 250; // Week 2
            if (newStreak === 30)
                bonusPoints = 500; // Month
            if (newStreak === 60)
                bonusPoints = 1000; // 2 months
            if (newStreak === 90)
                bonusPoints = 2000; // 3 months
        }
        // Less than 24 hours = same day, no increment
        else if (hoursSinceLastLogin < 24) {
            newStreak = user.loginStreak || 1;
        }
        // More than 48 hours = streak broken
        else {
            newStreak = 1;
        }
    }
    // Update user
    const longestStreak = Math.max(newStreak, user.longestStreak || 0);
    await db.update(users)
        .set({
        lastLoginAt: now,
        loginStreak: newStreak,
        longestStreak
    })
        .where(eq(users.id, userId));
    // Award milestone bonus if earned
    if (bonusPoints > 0) {
        const newBalance = user.totalPoints + bonusPoints;
        await db.update(users)
            .set({ totalPoints: newBalance })
            .where(eq(users.id, userId));
        await db.insert(pointTransactions).values({
            userId,
            amount: bonusPoints,
            type: 'streak_milestone',
            sourceId: newStreak.toString(),
            sourceType: 'streak',
            balanceAfter: newBalance,
            description: `${newStreak}-day streak milestone bonus`
        });
        console.log(`✅ Streak milestone: ${userId} earned ${bonusPoints} (${newStreak} days)`);
    }
    return {
        streak: newStreak,
        multiplier: getStreakMultiplier(newStreak),
        bonusAwarded: bonusPoints,
        isNewRecord: newStreak === longestStreak && newStreak > 1
    };
}
/**
 * Apply streak multiplier to points
 */
export function applyStreakMultiplier(basePoints, streak) {
    const multiplier = getStreakMultiplier(streak);
    return Math.floor(basePoints * multiplier);
}
/**
 * Get next milestone info for user
 */
export function getNextMilestone(currentStreak) {
    const milestones = [7, 14, 30, 60, 90];
    const next = milestones.find(m => m > currentStreak);
    if (!next) {
        return {
            days: 90,
            reward: 2000,
            multiplier: 5.0,
            isMax: true
        };
    }
    const rewards = {
        7: 100,
        14: 250,
        30: 500,
        60: 1000,
        90: 2000
    };
    return {
        days: next,
        daysRemaining: next - currentStreak,
        reward: rewards[next],
        multiplier: getStreakMultiplier(next),
        isMax: false
    };
}
