/**
 * AUTO-POSTER API ROUTES
 * Endpoints for automated posting system
 */

import { Router } from 'express';
import {
    autoPostTwitterThread,
    autoPostDiscordUpdate,
    runDailyPostingRoutine,
    testPosting
} from '../auto-poster';

const router = Router();

/**
 * POST /api/auto-post/twitter
 * Post generated Twitter thread
 */
router.post('/twitter', async (req, res) => {
    try {
        const result = await autoPostTwitterThread();
        res.json(result);
    } catch (error) {
        console.error('Error auto-posting to Twitter:', error);
        res.status(500).json({ error: 'Failed to auto-post to Twitter' });
    }
});

/**
 * POST /api/auto-post/discord
 * Post generated Discord update
 */
router.post('/discord', async (req, res) => {
    try {
        const result = await autoPostDiscordUpdate();
        res.json(result);
    } catch (error) {
        console.error('Error auto-posting to Discord:', error);
        res.status(500).json({ error: 'Failed to auto-post to Discord' });
    }
});

/**
 * POST /api/auto-post/daily-routine
 * Run full daily posting routine
 */
router.post('/daily-routine', async (req, res) => {
    try {
        const results = await runDailyPostingRoutine();

        const summary = {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };

        res.json(summary);
    } catch (error) {
        console.error('Error running daily routine:', error);
        res.status(500).json({ error: 'Failed to run daily routine' });
    }
});

/**
 * POST /api/auto-post/test
 * Test posting system
 */
router.post('/test', async (req, res) => {
    try {
        const results = await testPosting();
        res.json(results);
    } catch (error) {
        console.error('Error testing auto-poster:', error);
        res.status(500).json({ error: 'Failed to test auto-poster' });
    }
});

export default router;
