// GG Loop API - Self-serve developer access
import { Router } from 'express';
import { db } from '../database';
import { users, pointTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Generate API key for developers
router.post('/api/v1/developer/register', async (req, res) => {
    const { email, companyName, useCase } = req.body;

    const apiKey = `gg_${crypto.randomBytes(32).toString('hex')}`;

    // Store in database (you'll need an api_keys table)
    // For now, return the key

    res.json({
        success: true,
        apiKey,
        message: 'API key generated. Free tier: 10K calls/month',
        docs: 'https://ggloop.io/docs/api'
    });
});

// Award points via API (what other platforms will use)
router.post('/api/v1/points/award', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const { userId, points, reason } = req.body;

    if (!apiKey || !apiKey.toString().startsWith('gg_')) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    // Award points
    // This is what tournament platforms, Discord bots, etc. will call

    res.json({
        success: true,
        userId,
        pointsAwarded: points,
        newBalance: 1000 // fetch from DB
    });
});

// Get user stats via API
router.get('/api/v1/users/:userId/stats', async (req, res) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    const { userId } = req.params;

    // Return user stats
    res.json({
        userId,
        totalPoints: 5000,
        level: 10,
        achievements: [],
        verified: true
    });
});

export default router;
