/**
 * RETENTION & ENGAGEMENT ENGINE
 * Maximize LTV by reducing churn and increasing activity
 * 
 * Revenue Impact:
 * - Reduced churn = Higher MRR
 * - More engagement = More redemptions = More affiliate commission
 * - Smart recommendations = Higher-value redemptions
 */

import { db } from '../database';
import { users, userRewards, rewards } from '../../shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

interface ChurnRiskProfile {
    userId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    factors: string[];
    recommendedActions: string[];
}

interface SmartRecommendation {
    rewardId: string;
    title: string;
    pointsCost: number;
    category: string;
    reason: string;
    priority: number;
}

/**
 * CHURN PREDICTION
 * Identify users at risk of canceling subscription
 */
export async function analyzeChurnRisk(userId: string): Promise<ChurnRiskProfile> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) throw new Error('User not found');

    let riskScore = 0;
    const factors: string[] = [];

    // Factor 1: Last login recency
    const daysSinceLogin = user.lastLoginAt
        ? Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

    if (daysSinceLogin > 14) {
        riskScore += 40;
        factors.push('No login in 14+ days');
    } else if (daysSinceLogin > 7) {
        riskScore += 25;
        factors.push('No login in 7+ days');
    } else if (daysSinceLogin > 3) {
        riskScore += 10;
        factors.push('Low recent activity');
    }

    // Factor 2: Streak status
    const currentStreak = user.loginStreak || 0;
    if (currentStreak === 0) {
        riskScore += 20;
        factors.push('Lost login streak');
    } else if (currentStreak < 3) {
        riskScore += 10;
        factors.push('Low engagement streak');
    }

    // Factor 3: Points balance vs redemptions
    const redemptions = await db.query.userRewards.findMany({
        where: eq(userRewards.userId, userId)
    });

    const hasRedeemed = redemptions.length > 0;
    const pointsBalance = user.totalPoints || 0;

    if (!hasRedeemed && pointsBalance > 5000) {
        riskScore += 15;
        factors.push('High points, never redeemed');
    }

    // Factor 4: Subscription status
    if (user.subscriptionStatus !== 'active') {
        riskScore += 35;
        factors.push('Subscription not active');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Recommended actions
    const recommendedActions: string[] = [];
    if (daysSinceLogin > 7) {
        recommendedActions.push('Send re-engagement email with bonus points offer');
    }
    if (currentStreak === 0 && user.longestStreak > 5) {
        recommendedActions.push('Send streak recovery reminder');
    }
    if (!hasRedeemed && pointsBalance > 5000) {
        recommendedActions.push('Highlight "You can redeem now!" message');
    }
    if (user.subscriptionStatus !== 'active') {
        recommendedActions.push('Reactivation campaign with 50% off first month');
    }

    return {
        userId,
        riskLevel,
        riskScore,
        factors,
        recommendedActions
    };
}

/**
 * SMART REWARD RECOMMENDATIONS
 * Suggest rewards based on user behavior and points balance
 */
export async function getSmartRecommendations(userId: string): Promise<SmartRecommendation[]> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) return [];

    const pointsBalance = user.totalPoints || 0;
    const recommendations: SmartRecommendation[] = [];

    // Get all rewards user can afford
    const affordableRewards = await db.query.rewards.findMany({
        where: and(
            sql`${rewards.pointsCost} <= ${pointsBalance}`,
            eq(rewards.isActive, true)
        ),
        orderBy: desc(rewards.pointsCost),
        limit: 20
    });

    // Get user's redemption history
    const userRedemptions = await db.query.userRewards.findMany({
        where: eq(userRewards.userId, userId),
        limit: 10
    });

    const redeemedCategories = new Set(
        userRedemptions.map(r => r.rewardCategory).filter(Boolean)
    );

    // Recommendation 1: Close to a milestone reward
    for (const reward of affordableRewards) {
        const percentOfBalance = (reward.pointsCost / pointsBalance) * 100;

        if (percentOfBalance >= 80 && percentOfBalance <= 100) {
            recommendations.push({
                rewardId: reward.id,
                title: reward.title,
                pointsCost: reward.pointsCost,
                category: reward.category,
                reason: `You're ${pointsBalance - reward.pointsCost} points away from this reward!`,
                priority: 100
            });
        }
    }

    // Recommendation 2: Popular in user's preferred category
    if (redeemedCategories.size > 0) {
        const preferredCategory = Array.from(redeemedCategories)[0];
        const categoryRewards = affordableRewards.filter(r => r.category === preferredCategory);

        for (const reward of categoryRewards.slice(0, 3)) {
            recommendations.push({
                rewardId: reward.id,
                title: reward.title,
                pointsCost: reward.pointsCost,
                category: reward.category,
                reason: `Based on your ${preferredCategory} redemptions`,
                priority: 80
            });
        }
    }

    // Recommendation 3: High-value rewards (best bang for buck)
    const highValueRewards = affordableRewards
        .filter(r => r.realValue && r.pointsCost > 0)
        .map(r => ({
            ...r,
            valueRatio: r.realValue / r.pointsCost
        }))
        .sort((a, b) => b.valueRatio - a.valueRatio)
        .slice(0, 3);

    for (const reward of highValueRewards) {
        recommendations.push({
            rewardId: reward.id,
            title: reward.title,
            pointsCost: reward.pointsCost,
            category: reward.category,
            reason: `Best value: ${((reward.valueRatio / 100) * 100).toFixed(0)}% return`,
            priority: 70
        });
    }

    // Sort by priority and return top 5
    return recommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5);
}

/**
 * ENGAGEMENT TRIGGERS
 * Identify when to send notifications/emails
 */
export interface EngagementTrigger {
    userId: string;
    triggerType: 'streak_risk' | 'points_milestone' | 'new_reward' | 'churn_risk';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    message: string;
    actionUrl?: string;
}

export async function checkEngagementTriggers(userId: string): Promise<EngagementTrigger[]> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) return [];

    const triggers: EngagementTrigger[] = [];
    const now = new Date();
    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

    // Trigger 1: Streak at risk (23+ hours since last login)
    if (lastLogin) {
        const hoursSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
        const currentStreak = user.loginStreak || 0;

        if (hoursSinceLogin >= 23 && currentStreak > 0) {
            triggers.push({
                userId,
                triggerType: 'streak_risk',
                priority: currentStreak >= 7 ? 'urgent' : 'high',
                message: `Your ${currentStreak}-day streak expires in ${24 - Math.floor(hoursSinceLogin)} hour(s)!`,
                actionUrl: '/stats'
            });
        }
    }

    // Trigger 2: Points milestone reached
    const pointsBalance = user.totalPoints || 0;
    const milestones = [1000, 2500, 5000, 10000, 25000];

    for (const milestone of milestones) {
        if (pointsBalance >= milestone && pointsBalance < milestone + 500) {
            triggers.push({
                userId,
                triggerType: 'points_milestone',
                priority: 'medium',
                message: `You've reached ${milestone} points! Check out what you can redeem.`,
                actionUrl: '/shop'
            });
        }
    }

    // Trigger 3: Churn risk
    const churnRisk = await analyzeChurnRisk(userId);
    if (churnRisk.riskLevel === 'high' || churnRisk.riskLevel === 'critical') {
        triggers.push({
            userId,
            triggerType: 'churn_risk',
            priority: 'urgent',
            message: 'We miss you! Come back for a special bonus.',
            actionUrl: '/subscription'
        });
    }

    return triggers;
}

export { ChurnRiskProfile, SmartRecommendation };
