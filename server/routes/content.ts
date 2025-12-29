/**
 * CONTENT ENGINE API
 * Endpoints for automated content generation
 */

import { Router } from 'express';
import { generateContent, generateDailyContentBatch, getContentStrategy } from '../content-engine';

const router = Router();

/**
 * GET /api/content/generate/:platform
 * Generate content for specific platform
 */
router.get('/generate/:platform', async (req, res) => {
    try {
        const platform = req.params.platform as 'tiktok' | 'twitter' | 'reddit' | 'discord';

        if (!['tiktok', 'twitter', 'reddit', 'discord'].includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const content = await generateContent(platform);

        res.json({
            platform,
            content,
            count: content.length,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

/**
 * GET /api/content/daily-batch
 * Generate full daily content batch
 */
router.get('/daily-batch', async (req, res) => {
    try {
        const batch = await generateDailyContentBatch();

        res.json(batch);
    } catch (error) {
        console.error('Error generating daily batch:', error);
        res.status(500).json({ error: 'Failed to generate daily batch' });
    }
});

/**
 * GET /api/content/strategy
 * Get content recommendations
 */
router.get('/strategy', async (req, res) => {
    try {
        const strategy = await getContentStrategy();

        res.json(strategy);
    } catch (error) {
        console.error('Error getting strategy:', error);
        res.status(500).json({ error: 'Failed to get strategy' });
    }
});

export default router;
