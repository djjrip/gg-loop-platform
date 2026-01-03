/**
 * NEXUS API Routes - SECURITY HARDENED + AUTO-AUTH
 * 
 * PUBLIC/PRIVATE SPLIT:
 * - /api/nexus/status → Sanitized outcome-level data ONLY
 * - /api/nexus/health → Simple health check
 * - /api/nexus/founder → AUTH-GATED, full cognition, founder-only
 * 
 * AUTH METHODS:
 * - Session-based (web login)
 * - Bearer token (desktop app auto-auth)
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

const router = Router();

// Founder tokens (in production, use Redis/DB)
const founderTokens = new Map<string, { userId: number; expiresAt: Date }>();

// Founder emails
const FOUNDER_EMAILS = (process.env.ADMIN_EMAILS || 'jaysonquindao@gmail.com').split(',').map(e => e.trim());

/**
 * Founder authentication middleware
 * Accepts both session auth and Bearer token (for desktop app)
 */
async function requireFounder(req: any, res: Response, next: NextFunction) {
    try {
        const { storage } = await import('../storage');

        // METHOD 1: Bearer Token (Desktop App Auto-Auth)
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const stored = founderTokens.get(tokenHash);

            if (stored && new Date() < stored.expiresAt) {
                const user = await storage.getUser(stored.userId);
                if (user) {
                    req.dbUser = user;
                    req.isFounderToken = true;
                    return next();
                }
            }
        }

        // METHOD 2: Session Auth (Web Login)
        if (req.isAuthenticated && req.isAuthenticated() && req.user?.oidcSub) {
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
    } catch (error) {
        return res.status(500).json({ error: 'Authentication check failed' });
    }
}

/**
 * Generate founder token (called from desktop app after web login)
 * POST /api/nexus/token
 */
router.post('/token', async (req: any, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.oidcSub) {
            return res.status(401).json({ error: 'Login to ggloop.io first' });
        }

        const { storage } = await import('../storage');
        const user = await storage.getUserByOidcSub(req.user.oidcSub);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isFounder = user.isFounder || FOUNDER_EMAILS.includes(user.email || '');
        if (!isFounder) {
            return res.status(403).json({ error: 'Founder access required' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Expires in 90 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        founderTokens.set(tokenHash, { userId: user.id, expiresAt });

        res.json({ success: true, token, expiresAt: expiresAt.toISOString() });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Validate founder token
 * POST /api/nexus/validate
 */
router.post('/validate', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.json({ valid: false });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = founderTokens.get(tokenHash);

    if (!stored || new Date() > stored.expiresAt) {
        return res.json({ valid: false });
    }

    res.json({ valid: true, expiresAt: stored.expiresAt.toISOString() });
});

/**
 * Sanitize state for public consumption
 * Removes all internal reasoning and sensitive data
 */
function sanitizeForPublic(status: any): any {
    // Map internal states to public-friendly versions
    const publicStateMap: Record<string, string> = {
        'STABLE_AND_PRODUCING': 'HEALTHY',
        'STABLE_BUT_IDLE': 'HEALTHY',
        'MISALIGNED_BUILDING_NO_DISTRIBUTION': 'HEALTHY',
        'BROKEN_PLATFORM': 'MAINTENANCE',
        'BROKEN_OUTPUT_PIPELINE': 'MAINTENANCE',
        'RISKY_DRIFT': 'HEALTHY',
    };

    return {
        status: publicStateMap[status.state] || 'UNKNOWN',
        operational: !['BROKEN_PLATFORM', 'BROKEN_OUTPUT_PIPELINE'].includes(status.state),
        lastCheck: status.timestamp,
    };
}

/**
 * GET /api/nexus/status
 * PUBLIC ENDPOINT - Sanitized outcome data only
 * Never exposes: reasoning, confidence, enforcement, uncertainty
 */
router.get('/status', (req, res) => {
    try {
        const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');

        if (fs.existsSync(statusPath)) {
            const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
            res.json(sanitizeForPublic(status));
        } else {
            res.json({
                status: 'INITIALIZING',
                operational: true,
                lastCheck: null,
            });
        }
    } catch (error: any) {
        res.json({
            status: 'UNKNOWN',
            operational: true,
            lastCheck: null,
        });
    }
});

/**
 * GET /api/nexus/health
 * PUBLIC ENDPOINT - Simple binary health check
 */
router.get('/health', (req, res) => {
    const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');
    const exists = fs.existsSync(statusPath);

    res.json({
        healthy: exists,
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /api/nexus/founder
 * PRIVATE ENDPOINT - Full cognition, founder-only
 * Requires authentication + founder status
 * Returns human-readable narrative, not raw JSON dump
 */
router.get('/founder', requireFounder, (req, res) => {
    try {
        const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');

        if (!fs.existsSync(statusPath)) {
            return res.json({
                narrative: 'NEXUS has not been initialized yet. Run: npm run nexus:run',
                state: 'NOT_INITIALIZED',
                actionRequired: true,
                nextStep: 'Initialize NEXUS to begin autonomous operations',
            });
        }

        const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));

        // Build human-readable narrative for founder
        const narrative = buildFounderNarrative(status);

        res.json({
            narrative,
            state: status.state,
            reason: status.reason,
            actionRequired: !!status.nextAction,
            nextStep: status.nextAction || 'No action required - NEXUS is handling operations',
            innovation: {
                leverage: status.innovation?.leverageUpgrade?.title,
                efficiency: status.innovation?.efficiencyUpgrade?.title,
                details: status.innovation,
            },
            autoActions: status.autoActions,
            preventionUpgrades: status.preventionUpgrades,
            safeMode: status.inSafeMode,
            runCount: status.runCount,
            lastRun: status.timestamp,
            // Full cognition data for founder only
            _internal: {
                failureMemory: status.failureMemory,
                rawState: status,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to read NEXUS status',
            details: error.message,
        });
    }
});

/**
 * Build human-readable narrative for founder
 */
function buildFounderNarrative(status: any): string {
    const stateDescriptions: Record<string, string> = {
        'STABLE_AND_PRODUCING': 'Everything is running smoothly. You are shipping and the platform is healthy.',
        'STABLE_BUT_IDLE': 'The platform is stable, but nothing is being shipped. Time to create something.',
        'MISALIGNED_BUILDING_NO_DISTRIBUTION': 'Heavy building happening, but nobody knows about it. Stop and tell the world.',
        'BROKEN_PLATFORM': 'CRITICAL: The platform is broken. Fix this immediately before anything else.',
        'BROKEN_OUTPUT_PIPELINE': 'CRITICAL: No output is happening. This is a momentum emergency.',
        'RISKY_DRIFT': 'WARNING: Multiple things are degrading. Address this before it becomes critical.',
    };

    let narrative = stateDescriptions[status.state] || 'Unknown state.';

    if (status.nextAction) {
        narrative += `\n\nYOUR NEXT STEP: ${status.nextAction}`;
    }

    if (status.innovation?.leverageUpgrade) {
        narrative += `\n\nNEXUS suggests: ${status.innovation.leverageUpgrade.title}`;
    }

    return narrative;
}

/**
 * Parse markdown file for key data
 * Simple parsing for NEXUS_HEARTBEAT.md structure
 */
function parseHeartbeat(markdown: string): any {
    const lines = markdown.split('\n');
    const result: any = {
        status: 'UNKNOWN',
        lastPulse: null,
        systemStatus: 'UNKNOWN',
        lastAction: null,
        lastActionTime: null,
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse status
        if (line.includes('**STATUS:**')) {
            const match = line.match(/\*\*STATUS:\*\*\s*(.+)/);
            if (match) result.status = match[1].trim();
        }
        
        // Parse last pulse
        if (line.includes('**LAST PULSE:**')) {
            const match = line.match(/\*\*LAST PULSE:\*\*\s*(.+)/);
            if (match) result.lastPulse = match[1].trim();
        }
        
        // Parse system status from table
        if (line.includes('| System Status |')) {
            const nextLine = lines[i + 1]?.trim() || '';
            const match = nextLine.match(/\|\s*(.+?)\s*\|/);
            if (match) result.systemStatus = match[1].trim();
        }
        
        // Parse last action
        if (line.includes('| Last Action |')) {
            const nextLine = lines[i + 1]?.trim() || '';
            const match = nextLine.match(/\|\s*(.+?)\s*\|/);
            if (match) result.lastAction = match[1].trim();
        }
        
        // Parse last action time
        if (line.includes('| Last Action Time |')) {
            const nextLine = lines[i + 1]?.trim() || '';
            const match = nextLine.match(/\|\s*(.+?)\s*\|/);
            if (match) result.lastActionTime = match[1].trim();
        }
    }

    return result;
}

/**
 * Parse activity feed for last N entries
 */
function parseActivityFeed(markdown: string, limit: number = 3): any[] {
    const lines = markdown.split('\n');
    const activities: any[] = [];
    let inTable = false;
    let headerSkipped = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect table start
        if (line.includes('| Time |') && line.includes('Action |')) {
            inTable = true;
            headerSkipped = false;
            continue;
        }
        
        // Skip header separator
        if (inTable && line.match(/^\|[\s\-:]+\|/)) {
            headerSkipped = true;
            continue;
        }
        
        // Parse table rows
        if (inTable && headerSkipped && line.startsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 3) {
                activities.push({
                    time: parts[0],
                    action: parts[1],
                    system: parts[2] || '',
                    status: parts[3] || '',
                    impact: parts[4] || '',
                });
            }
        }
        
        // Stop at end of table or section
        if (inTable && line === '---') {
            break;
        }
    }

    return activities.slice(0, limit);
}

/**
 * GET /api/nexus/heartbeat
 * Read NEXUS_HEARTBEAT.md and return parsed data
 */
router.get('/heartbeat', requireFounder, (req, res) => {
    try {
        const heartbeatPath = path.resolve(process.cwd(), 'REPORTS/CANONICAL/NEXUS_HEARTBEAT.md');
        
        if (!fs.existsSync(heartbeatPath)) {
            return res.json({
                status: 'NOT_FOUND',
                lastPulse: null,
                systemStatus: 'UNKNOWN',
                lastAction: null,
                lastActionTime: null,
                error: 'NEXUS_HEARTBEAT.md not found',
            });
        }

        const markdown = fs.readFileSync(heartbeatPath, 'utf-8');
        const parsed = parseHeartbeat(markdown);
        
        res.json(parsed);
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to read heartbeat',
            details: error.message,
        });
    }
});

/**
 * GET /api/nexus/activity
 * Read NEXUS_ACTIVITY_FEED.md and return last N entries
 */
router.get('/activity', requireFounder, (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 3;
        const activityPath = path.resolve(process.cwd(), 'REPORTS/CANONICAL/NEXUS_ACTIVITY_FEED.md');
        
        if (!fs.existsSync(activityPath)) {
            return res.json({
                activities: [],
                error: 'NEXUS_ACTIVITY_FEED.md not found',
            });
        }

        const markdown = fs.readFileSync(activityPath, 'utf-8');
        const activities = parseActivityFeed(markdown, limit);
        
        res.json({ activities });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to read activity feed',
            details: error.message,
        });
    }
});

/**
 * GET /api/nexus/revenue
 * Read FIRST_REVENUE_LOOP.md and return revenue status
 */
router.get('/revenue', requireFounder, (req, res) => {
    try {
        const revenuePath = path.resolve(process.cwd(), 'REPORTS/CANONICAL/FIRST_REVENUE_LOOP.md');
        
        if (!fs.existsSync(revenuePath)) {
            return res.json({
                status: 'NOT_FOUND',
                offer: 'Founding Member $29 Lifetime',
                payments: 0,
                clicks: 0,
                error: 'FIRST_REVENUE_LOOP.md not found',
            });
        }

        const markdown = fs.readFileSync(revenuePath, 'utf-8');
        const lines = markdown.split('\n');
        
        // Simple parsing for revenue loop status
        const result: any = {
            status: 'ACTIVE',
            offer: 'Founding Member $29 Lifetime',
            payments: 0,
            clicks: 0,
        };

        for (const line of lines) {
            if (line.includes('**STATUS:**')) {
                const match = line.match(/\*\*STATUS:\*\*\s*(.+)/);
                if (match) result.status = match[1].trim();
            }
            if (line.includes('| Payments |')) {
                const match = line.match(/\|\s*Payments\s*\|\s*(\d+)/);
                if (match) result.payments = parseInt(match[1]);
            }
            if (line.includes('| Clicks |')) {
                const match = line.match(/\|\s*Clicks\s*\|\s*(\d+)/);
                if (match) result.clicks = parseInt(match[1]);
            }
        }
        
        res.json(result);
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to read revenue loop',
            details: error.message,
        });
    }
});

/**
 * GET /api/nexus/founding-members-count
 * PUBLIC ENDPOINT - Returns count of Founding Members
 * Used for "Proof of Life" counter on homepage
 */
router.get('/founding-members-count', (req, res) => {
    try {
        // TODO: Replace with actual database query when Founding Member tracking is implemented
        // For now, return 0 as we're in manual validation phase
        // When members are added manually, update this endpoint to query the database
        
        // Example future query (not implemented yet):
        // const count = await db.select({ count: sql<number>`count(*)` })
        //   .from(users)
        //   .where(eq(users.subscriptionTier, 'founding_member'));
        
        res.json({
            count: 0,
            limit: 50,
            message: 'Be the first.',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        res.json({
            count: 0,
            limit: 50,
            message: 'Be the first.',
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;
