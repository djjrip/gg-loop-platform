/**
 * REVENUE OPTIMIZATION API
 * Endpoints for dynamic pricing and margin optimization
 */

import { Router } from 'express';
import { optimizeAffiliateSource, calculateDynamicPoints, getRecommendationForUser } from '../revenue-optimizer';
import { db } from '../database';
import { rewards } from '../../shared/schema';

const router = Router();

/**
 * GET /api/optimizer/best-source/:rewardId
 * Get optimal affiliate source for a reward
 */
router.get('/best-source/:rewardId', async (req, res) => {
    try {
        const { rewardId } = req.params;

        const reward = await db.query.rewards.findFirst({
            where: (rewards, { eq }) => eq(rewards.id, rewardId)
        });

        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }

        const optimization = await optimizeAffiliateSource(rewardId, reward.realValue);

        res.json(optimization);
    } catch (error) {
        console.error('Error optimizing source:', error);
        res.status(500).json({ error: 'Failed to optimize affiliate source' });
    }
});

/**
 * GET /api/optimizer/dynamic-price/:rewardId
 * Calculate dynamic points cost for a reward
 */
router.get('/dynamic-price/:rewardId', async (req, res) => {
    try {
        const { rewardId } = req.params;

        const reward = await db.query.rewards.findFirst({
            where: (rewards, { eq }) => eq(rewards.id, rewardId)
        });

        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }

        const dynamicPoints = await calculateDynamicPoints(rewardId, reward.pointsCost);

        res.json({
            rewardId,
            basePoints: reward.pointsCost,
            dynamicPoints,
            savings: reward.pointsCost - dynamicPoints,
            reason: dynamicPoints < reward.pointsCost ? 'High margin discount' :
                dynamicPoints > reward.pointsCost ? 'Low margin adjustment' :
                    'Optimal pricing'
        });
    } catch (error) {
        console.error('Error calculating dynamic price:', error);
        res.status(500).json({ error: 'Failed to calculate dynamic price' });
    }
});

/**
 * GET /api/optimizer/recommendations
 * Get personalized recommendations (A/B tested)
 */
router.get('/recommendations', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const allRewards = await db.query.rewards.findMany({
            where: (rewards, { eq }) => eq(rewards.isActive, true)
        });

        const user = req.user;
        const userPoints = user.totalPoints || 0;

        const result = getRecommendationForUser(user.id, userPoints, allRewards);

        res.json({
            strategy: result.strategy,
            recommendations: result.recommendations,
            note: 'Algorithm auto-selected via A/B testing'
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

export default router;
