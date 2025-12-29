/**
 * API ROUTES - GROWTH SYSTEMS
 * Exposes new viral mechanics to frontend
 */

import { Router } from 'express';
import {
    processReferralSignup,
    getReferralStats,
    REFERRAL_REWARDS
} from './referral-system';
import {
    getLiveActivityFeed,
    getLiveStats
} from './live-activity';
import {
    updateLoginStreak,
    getNextMilestone
} from './streak-system';
import {
    getActiveChallenges,
    dailyChallengeJob
} from './daily-challenges';

const router = Router();

// ============================================================================
// REFERRAL SYSTEM
// ============================================================================

/**
 * GET /api/growth/referrals/stats
 * Get user's referral statistics
 */
router.get('/referrals/stats', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const stats = await getReferralStats(req.user.id);
        res.json({
            ...stats,
            rewards: REFERRAL_REWARDS,
            shareUrl: `https://ggloop.io?ref=${req.user.referralCode}`
        });
    } catch (error) {
        console.error('Referral stats error:', error);
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});

/**
 * GET /api/growth/referrals/code
 * Get user's unique referral code
 */
router.get('/referrals/code', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
        code: req.user.referralCode,
        shareUrl: `https://ggloop.io?ref=${req.user.referralCode}`,
        shareMessage: `Join me on GG Loop! Play games, earn real rewards. Use my code: ${req.user.referralCode}`
    });
});

// ============================================================================
// LIVE ACTIVITY FEED
// ============================================================================

/**
 * GET /api/growth/activity/live
 * Public endpoint - no auth required
 */
router.get('/activity/live', async (req, res) => {
    try {
        const feed = await getLiveActivityFeed();
        res.json(feed);
    } catch (error) {
        console.error('Activity feed error:', error);
        res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
});

/**
 * GET /api/growth/stats/live
 * Public platform stats
 */
router.get('/stats/live', async (req, res) => {
    try {
        const stats = await getLiveStats();
        res.json(stats);
    } catch (error) {
        console.error('Live stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============================================================================
// STREAK SYSTEM
// ============================================================================

/**
 * POST /api/growth/streaks/check
 * Update user's login streak
 * Called automatically on login
 */
router.post('/streaks/check', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const result = await updateLoginStreak(req.user.id);
        const nextMilestone = getNextMilestone(result.streak);

        res.json({
            ...result,
            nextMilestone
        });
    } catch (error) {
        console.error('Streak check error:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

/**
 * GET /api/growth/streaks/status
 * Get current streak status
 */
router.get('/streaks/status', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const nextMilestone = getNextMilestone(req.user.loginStreak || 0);

    res.json({
        currentStreak: req.user.loginStreak || 0,
        longestStreak: req.user.longestStreak || 0,
        nextMilestone
    });
});

// ============================================================================
// DAILY CHALLENGES
// ============================================================================

/**
 * GET /api/growth/challenges/daily
 * Get today's active challenges
 */
router.get('/challenges/daily', async (req, res) => {
    try {
        const challenges = await getActiveChallenges();
        res.json(challenges);
    } catch (error) {
        console.error('Challenges error:', error);
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
});

/**
 * POST /api/growth/challenges/generate
 * Admin only: Manually trigger daily challenge generation
 */
router.post('/challenges/generate', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isFounder) {
        return res.status(403).json({ error: 'Admin only' });
    }

    try {
        const result = await dailyChallengeJob();
        res.json(result);
    } catch (error) {
        console.error('Challenge generation error:', error);
        res.status(500).json({ error: 'Failed to generate challenge' });
    }
});

export default router;
