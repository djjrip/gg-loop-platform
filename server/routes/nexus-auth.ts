/**
 * NEXUS Founder Auth - Server-Side Token Generation & Validation
 * Device-bound auto-auth for zero-friction founder access
 */

import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory token store (in production, use Redis/DB)
const founderTokens = new Map<string, { userId: number; deviceId: string; createdAt: Date; expiresAt: Date }>();

// Founder email(s) - from env or hardcoded for now
const FOUNDER_EMAILS = (process.env.ADMIN_EMAILS || 'jaysonquindao@gmail.com').split(',').map(e => e.trim());

/**
 * Generate device-bound founder token
 * POST /api/nexus/auth/token
 * 
 * Called once after successful ggloop.io login from desktop app
 * Returns encrypted token bound to device
 */
router.post('/token', async (req: any, res) => {
    try {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.oidcSub) {
            return res.status(401).json({ error: 'Login to ggloop.io first' });
        }

        // Get user from storage
        const { storage } = await import('../storage');
        const user = await storage.getUserByOidcSub(req.user.oidcSub);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Verify founder status
        const isFounder = user.isFounder || FOUNDER_EMAILS.includes(user.email || '');
        if (!isFounder) {
            return res.status(403).json({ error: 'Founder access required' });
        }

        // Get device fingerprint from request
        const deviceId = req.body.deviceId || req.headers['x-device-id'] ||
            crypto.createHash('sha256').update(req.headers['user-agent'] || '').digest('hex').substring(0, 16);

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Store token (expires in 90 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        founderTokens.set(tokenHash, {
            userId: user.id,
            deviceId,
            createdAt: new Date(),
            expiresAt,
        });

        res.json({
            success: true,
            token,
            expiresAt: expiresAt.toISOString(),
            message: 'Founder token generated. Store securely.',
        });

    } catch (error: any) {
        res.status(500).json({ error: 'Token generation failed', details: error.message });
    }
});

/**
 * Validate founder token
 * POST /api/nexus/auth/validate
 * 
 * Called by desktop app on startup to check if token is valid
 */
router.post('/validate', async (req, res) => {
    try {
        const { token, deviceId } = req.body;

        if (!token) {
            return res.status(400).json({ valid: false, error: 'Token required' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const stored = founderTokens.get(tokenHash);

        if (!stored) {
            return res.json({ valid: false, error: 'Token not found or expired' });
        }

        // Check expiration
        if (new Date() > stored.expiresAt) {
            founderTokens.delete(tokenHash);
            return res.json({ valid: false, error: 'Token expired' });
        }

        // Check device (optional - for added security)
        if (deviceId && stored.deviceId !== deviceId) {
            return res.json({ valid: false, error: 'Device mismatch' });
        }

        // Get user info
        const { storage } = await import('../storage');
        const user = await storage.getUser(stored.userId);

        res.json({
            valid: true,
            userId: stored.userId,
            email: user?.email,
            expiresAt: stored.expiresAt.toISOString(),
        });

    } catch (error: any) {
        res.status(500).json({ valid: false, error: error.message });
    }
});

/**
 * Revoke founder token
 * DELETE /api/nexus/auth/token
 */
router.delete('/token', (req, res) => {
    const { token } = req.body;

    if (token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        founderTokens.delete(tokenHash);
    }

    res.json({ success: true, message: 'Token revoked' });
});

/**
 * Middleware to validate founder token from Authorization header
 */
export async function validateFounderToken(req: any, res: any, next: any) {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const stored = founderTokens.get(tokenHash);

        if (stored && new Date() < stored.expiresAt) {
            const { storage } = await import('../storage');
            const user = await storage.getUser(stored.userId);
            if (user) {
                req.dbUser = user;
                req.isFounderToken = true;
                return next();
            }
        }
    }

    // Fall back to session auth
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.oidcSub) {
        const { storage } = await import('../storage');
        const user = await storage.getUserByOidcSub(req.user.oidcSub);
        if (user) {
            const isFounder = user.isFounder || FOUNDER_EMAILS.includes(user.email || '');
            if (isFounder) {
                req.dbUser = user;
                return next();
            }
        }
    }

    return res.status(401).json({ error: 'Founder authentication required' });
}

export default router;
