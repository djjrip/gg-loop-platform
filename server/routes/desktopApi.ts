/**
 * Desktop App API Routes
 * 
 * Endpoints for GG LOOP Desktop verification app:
 * - POST /api/desktop/login - Email/password login
 * - POST /api/desktop/request-code - Request login code
 * - POST /api/desktop/verify-code - Verify login code
 * - POST /api/desktop/verify-match - Verify a completed match
 * - GET /api/desktop/balance - Get user's points balance
 */

import { Router } from 'express';
import { db } from '../database';
import { users, pointTransactions, processedRiotMatches, riotAccounts } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { pointsEngine, EARNING_RULES } from '../pointsEngine';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const desktopApiRouter = Router();

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'desktop-app-secret';

// In-memory login codes (should use Redis in production)
const loginCodes = new Map<string, { code: string; expires: number }>();

/**
 * Generate a simple 6-digit code
 */
function generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate JWT token for desktop app
 */
function generateToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email, source: 'desktop' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify JWT token
 */
function verifyToken(token: string): { userId: string; email: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return { userId: decoded.userId, email: decoded.email };
    } catch {
        return null;
    }
}

/**
 * Middleware to verify desktop auth
 */
function requireDesktopAuth(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    const user = verifyToken(token);

    if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.desktopUser = user;
    next();
}

/**
 * POST /api/desktop/request-code
 * Request a login code via email
 */
desktopApiRouter.post('/request-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        // Check if user exists
        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()));

        if (!user) {
            // Don't reveal if user exists
            return res.json({ success: true, message: 'If account exists, code will be sent' });
        }

        // Generate and store code
        const code = generateCode();
        loginCodes.set(email.toLowerCase(), {
            code,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // TODO: Send email with code via SendGrid
        console.log(`[Desktop] Login code for ${email}: ${code}`);

        res.json({ success: true, message: 'Code sent to email' });
    } catch (error: any) {
        console.error('Request code error:', error);
        res.status(500).json({ error: 'Failed to send code' });
    }
});

/**
 * POST /api/desktop/verify-code
 * Verify login code and issue token
 */
desktopApiRouter.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code required' });
        }

        const storedCode = loginCodes.get(email.toLowerCase());

        if (!storedCode || storedCode.code !== code || storedCode.expires < Date.now()) {
            return res.status(401).json({ error: 'Invalid or expired code' });
        }

        // Clear used code
        loginCodes.delete(email.toLowerCase());

        // Get user
        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()));

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate token
        const token = generateToken(user.id, user.email || '');

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                totalPoints: user.totalPoints
            }
        });
    } catch (error: any) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * POST /api/desktop/verify-match
 * Verify a completed match from desktop app
 */
desktopApiRouter.post('/verify-match', requireDesktopAuth, async (req: any, res) => {
    try {
        const { userId } = req.desktopUser;
        const { gameId, gameName, startTime, endTime, sessionDuration } = req.body;

        if (!gameId || !gameName) {
            return res.status(400).json({ error: 'gameId and gameName required' });
        }

        // Check if match already processed
        const matchKey = `desktop:${userId}:${gameId}`;

        // Find user's riot account
        const [riotAccount] = await db.select()
            .from(riotAccounts)
            .where(eq(riotAccounts.userId, userId));

        // Check for duplicate
        const [existing] = await db.select()
            .from(processedRiotMatches)
            .where(eq(processedRiotMatches.matchId, matchKey))
            .limit(1);

        if (existing) {
            return res.status(400).json({
                error: 'Match already verified',
                message: 'This match has already been processed'
            });
        }

        // Award points based on session duration
        const rule = EARNING_RULES.MATCH_WIN;
        let pointsToAward = rule?.basePoints || 10;

        // Bonus for longer sessions (30+ min = 15 pts, 60+ min = 25 pts)
        if (sessionDuration >= 3600) { // 60+ minutes
            pointsToAward = 25;
        } else if (sessionDuration >= 1800) { // 30+ minutes
            pointsToAward = 15;
        }

        // Award points
        await pointsEngine.awardPoints(
            userId,
            pointsToAward,
            'desktop_verification',
            matchKey,
            'desktop_app',
            `${gameName} session - ${Math.round(sessionDuration / 60)} min`
        );

        // Record as processed
        if (riotAccount) {
            await db.insert(processedRiotMatches).values({
                riotAccountId: riotAccount.id,
                matchId: matchKey,
                gameEndedAt: new Date(endTime || Date.now()),
                isWin: true,
                pointsAwarded: pointsToAward,
            }).onConflictDoNothing();
        }

        console.log(`[Desktop] Verified match for ${userId}: ${gameName} - ${pointsToAward} pts`);

        res.json({
            success: true,
            pointsAwarded: pointsToAward,
            message: `Earned ${pointsToAward} points for ${gameName}!`
        });
    } catch (error: any) {
        console.error('Verify match error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * GET /api/desktop/balance
 * Get user's current points balance
 */
desktopApiRouter.get('/balance', requireDesktopAuth, async (req: any, res) => {
    try {
        const { userId } = req.desktopUser;

        const [user] = await db.select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            totalPoints: user.totalPoints,
            tier: user.subscriptionTier
        });
    } catch (error: any) {
        console.error('Balance error:', error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

/**
 * GET /api/desktop/status
 * Health check for desktop app
 */
desktopApiRouter.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
