/**
 * RETENTION API ROUTES
 * Endpoints for churn prevention and engagement
 */

import { Router } from 'express';
import {
    analyzeChurnRisk,
    getSmartRecommendations,
    checkEngagementTriggers
} from '../retention-engine';

const router = Router();

/**
 * GET /api/retention/churn-risk
 * Analyze user's churn risk
 */
router.get('/churn-risk', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const profile = await analyzeChurnRisk(req.user.id);
        res.json(profile);
    } catch (error) {
        console.error('Churn risk analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze churn risk' });
    }
});

/**
 * GET /api/retention/recommendations
 * Get smart reward recommendations
 */
router.get('/recommendations', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const recommendations = await getSmartRecommendations(req.user.id);
        res.json(recommendations);
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

/**
 * GET /api/retention/triggers
 * Check engagement triggers for user
 */
router.get('/triggers', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const triggers = await checkEngagementTriggers(req.user.id);
        res.json({ triggers });
    } catch (error) {
        console.error('Triggers check error:', error);
        res.status(500).json({ error: 'Failed to check triggers' });
    }
});

/**
 * GET /api/retention/dashboard
 * Admin dashboard: View all high-risk users
 */
router.get('/dashboard', async (req, res) => {
    // TODO: Add admin middleware
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Get all users and analyze churn risk
        // This would be optimized in production with DB queries
        res.json({
            message: 'Churn dashboard - analyze all users',
            note: 'Run batch analysis job to populate this data'
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

export default router;
