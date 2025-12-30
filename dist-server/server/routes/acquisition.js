/**
 * USER ACQUISITION API
 * Endpoints for automated user acquisition campaigns
 */
import { Router } from 'express';
import { postToGamingSubreddits, runUserAcquisitionCampaign, sendColdEmail, findStreamers } from '../user-acquisition';
const router = Router();
/**
 * POST /api/acquisition/reddit
 * Post to gaming subreddits
 */
router.post('/reddit', async (req, res) => {
    try {
        const results = await postToGamingSubreddits();
        res.json({
            posted: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        });
    }
    catch (error) {
        console.error('Error posting to Reddit:', error);
        res.status(500).json({ error: 'Failed to post to Reddit' });
    }
});
/**
 * POST /api/acquisition/campaign
 * Run full user acquisition campaign
 */
router.post('/campaign', async (req, res) => {
    try {
        const results = await runUserAcquisitionCampaign();
        res.json(results);
    }
    catch (error) {
        console.error('Error running campaign:', error);
        res.status(500).json({ error: 'Failed to run campaign' });
    }
});
/**
 * POST /api/acquisition/email
 * Send cold email
 */
router.post('/email', async (req, res) => {
    try {
        const { to, template, name } = req.body;
        if (!to || !template || !name) {
            return res.status(400).json({ error: 'Missing required fields: to, template, name' });
        }
        const result = await sendColdEmail(to, template, name);
        res.json(result);
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});
/**
 * GET /api/acquisition/streamers/:game
 * Find streamers for a game
 */
router.get('/streamers/:game', async (req, res) => {
    try {
        const { game } = req.params;
        const minViewers = parseInt(req.query.minViewers) || 100;
        const streamers = await findStreamers(game, minViewers);
        res.json({
            game,
            minViewers,
            count: streamers.length,
            streamers
        });
    }
    catch (error) {
        console.error('Error finding streamers:', error);
        res.status(500).json({ error: 'Failed to find streamers' });
    }
});
export default router;
