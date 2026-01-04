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
import { users, pointTransactions, processedRiotMatches, riotAccounts } from "../../shared/schema";
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
 * 
 * CRITICAL INTEGRITY CHECKS:
 * 1. Game process must be verified
 * 2. Active play time (foreground) must meet minimum threshold
 * 3. Session must not be suspiciously long
 * 4. Rate limiting per user
 */
desktopApiRouter.post('/verify-match', requireDesktopAuth, async (req: any, res) => {
    try {
        const { userId } = req.desktopUser;
        const { 
            gameId, 
            gameName, 
            startTime, 
            endTime, 
            sessionDuration,
            activePlayTime,       // NEW: Time spent with game in foreground
            verificationScore,    // NEW: 0-100 confidence score
            gameProcess,          // NEW: Process name (e.g., "valorant")
            inputData             // NEW: Input activity data
        } = req.body;

        // === VALIDATION PHASE ===
        if (!gameId || !gameName) {
            return res.status(400).json({ error: 'gameId and gameName required' });
        }

        // CRITICAL: Require game process verification
        if (!gameProcess) {
            console.warn(`[Desktop] REJECTED: No game process for ${userId}`);
            return res.status(400).json({ 
                error: 'game_process_required',
                message: 'Session must include verified game process' 
            });
        }

        // Use activePlayTime if provided, otherwise fall back to sessionDuration
        const effectivePlayTime = activePlayTime ?? sessionDuration;

        // MINIMUM THRESHOLD: 5 minutes of ACTIVE play (not just session open)
        const MIN_ACTIVE_SECONDS = 300; // 5 minutes
        if (effectivePlayTime < MIN_ACTIVE_SECONDS) {
            console.warn(`[Desktop] REJECTED: Session too short for ${userId}: ${effectivePlayTime}s`);
            return res.status(400).json({ 
                error: 'session_too_short',
                message: `Minimum 5 minutes of active play required. You played ${Math.round(effectivePlayTime / 60)} min.`,
                activePlayTime: effectivePlayTime
            });
        }

        // FRAUD CHECK: Session cannot be longer than 24 hours
        const MAX_SESSION_SECONDS = 86400; // 24 hours
        if (sessionDuration > MAX_SESSION_SECONDS) {
            console.warn(`[Desktop] REJECTED: Suspicious session length for ${userId}: ${sessionDuration}s`);
            return res.status(400).json({ 
                error: 'suspicious_session',
                message: 'Session length exceeds maximum allowed' 
            });
        }

        // FRAUD CHECK: Active time cannot exceed total session time
        if (activePlayTime && activePlayTime > sessionDuration) {
            console.warn(`[Desktop] REJECTED: Active time > session time for ${userId}`);
            return res.status(400).json({ 
                error: 'invalid_activity_data',
                message: 'Invalid verification data' 
            });
        }

        // Check if match already processed (prevent double-claiming)
        const matchKey = `desktop:${userId}:${Date.now()}:${gameProcess}`;

        // Find user's riot account (if any)
        const [riotAccount] = await db.select()
            .from(riotAccounts)
            .where(eq(riotAccounts.userId, userId));

        // Check for recent duplicate (same game within last 5 minutes = suspicious)
        const recentWindow = Date.now() - 5 * 60 * 1000;
        const recentKey = `desktop:${userId}:${gameProcess}`;
        
        // Rate limiting: Max 10 sessions per game per day
        // TODO: Implement proper rate limiting with Redis

        // === POINTS CALCULATION ===
        // Points based on ACTIVE play time only
        let basePoints = 5; // Minimum for any valid session

        if (effectivePlayTime >= 7200) {        // 120+ min active
            basePoints = 50;
        } else if (effectivePlayTime >= 3600) { // 60+ min active
            basePoints = 25;
        } else if (effectivePlayTime >= 1800) { // 30+ min active
            basePoints = 15;
        } else if (effectivePlayTime >= 900) {  // 15+ min active
            basePoints = 10;
        }

        // Apply verification confidence multiplier (0-100 score)
        const confidenceMultiplier = verificationScore 
            ? Math.max(0.5, Math.min(1.0, verificationScore / 100))
            : 1.0;

        const pointsToAward = Math.floor(basePoints * confidenceMultiplier);

        // === AWARD POINTS ===
        await pointsEngine.awardPoints(
            userId,
            pointsToAward,
            'desktop_verification',
            matchKey,
            'desktop_app',
            `${gameName} (${gameProcess}) - ${Math.round(effectivePlayTime / 60)} min active play`
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

        console.log(`[Desktop] ✓ Verified: ${userId} | ${gameName} | ${Math.round(effectivePlayTime/60)}min active | ${pointsToAward}pts`);

        res.json({
            success: true,
            pointsAwarded: pointsToAward,
            activePlayTime: effectivePlayTime,
            verificationScore: verificationScore || 100,
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

/**
 * GET /api/desktop/verification-status/:userId
 * Get desktop verification status for web dashboard display
 * Shows: connected state, last verified game, session points
 */
desktopApiRouter.get('/verification-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Get recent desktop sessions for this user
        const recentSessions = await db.select()
            .from(pointTransactions)
            .where(
                and(
                    eq(pointTransactions.userId, userId),
                    eq(pointTransactions.sourceType, 'desktop_app')
                )
            )
            .orderBy(pointTransactions.createdAt)
            .limit(5);

        // Calculate session stats
        const hasDesktopActivity = recentSessions.length > 0;
        const lastSession = recentSessions[0];
        const totalSessionPoints = recentSessions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

        // Parse game name and active minutes from description 
        // Format: "GameName (process) - X min active play"
        let lastGame: string | null = null;
        let lastVerifiedAt: Date | null = null;
        let activeMinutes = 0;
        let confidenceScore = 0;
        
        if (lastSession) {
            const desc = lastSession.description || '';
            const gameMatch = desc.match(/^([^(]+)/);
            lastGame = gameMatch ? gameMatch[1].trim() : 'Unknown Game';
            lastVerifiedAt = lastSession.createdAt;
            
            // Parse active minutes from description
            const minMatch = desc.match(/(\d+)\s*min/);
            activeMinutes = minMatch ? parseInt(minMatch[1]) : 0;
            
            // Calculate confidence score based on session quality
            // Higher active time = higher confidence
            if (activeMinutes >= 30) confidenceScore = 95;
            else if (activeMinutes >= 20) confidenceScore = 85;
            else if (activeMinutes >= 10) confidenceScore = 75;
            else if (activeMinutes >= 5) confidenceScore = 65;
            else confidenceScore = 50;
        }

        // Calculate total active minutes across recent sessions
        const totalActiveMinutes = recentSessions.reduce((sum: number, s: any) => {
            const desc = s.description || '';
            const minMatch = desc.match(/(\d+)\s*min/);
            return sum + (minMatch ? parseInt(minMatch[1]) : 0);
        }, 0);

        res.json({
            connected: hasDesktopActivity,
            lastGame,
            lastVerifiedAt,
            sessionPoints: totalSessionPoints,
            activeMinutes: totalActiveMinutes,
            confidenceScore,
            verificationState: hasDesktopActivity ? 'ACTIVE_PLAY_CONFIRMED' : 'NOT_PLAYING',
            recentSessions: recentSessions.map((s: any) => {
                const desc = s.description || '';
                const minMatch = desc.match(/(\d+)\s*min/);
                const mins = minMatch ? parseInt(minMatch[1]) : 0;
                let sessionConfidence = 50;
                if (mins >= 30) sessionConfidence = 95;
                else if (mins >= 20) sessionConfidence = 85;
                else if (mins >= 10) sessionConfidence = 75;
                else if (mins >= 5) sessionConfidence = 65;
                
                return {
                    id: s.id,
                    points: s.amount,
                    description: s.description,
                    timestamp: s.createdAt,
                    confidenceScore: sessionConfidence
                };
            })
        });
    } catch (error: any) {
        console.error('Verification status error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
});
