/**
 * NEXUS API Routes
 * Exposes NEXUS state for founder visibility
 * Read-only, safe, never crashes the app
 */

import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * GET /api/nexus/status
 * Returns current NEXUS state in JSON
 * Founder can see state without technical interpretation
 */
router.get('/status', (req, res) => {
    try {
        const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');

        if (fs.existsSync(statusPath)) {
            const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
            res.json({
                success: true,
                state: status.state,
                reason: status.reason,
                autoActions: status.autoActions,
                nextAction: status.nextAction,
                innovation: {
                    leverage: status.innovation?.leverageUpgrade?.title || 'None',
                    efficiency: status.innovation?.efficiencyUpgrade?.title || 'None',
                },
                lastCheck: status.timestamp,
                runCount: status.runCount,
                inSafeMode: status.inSafeMode || false,
            });
        } else {
            // NEXUS hasn't run yet
            res.json({
                success: true,
                state: 'NOT_INITIALIZED',
                reason: 'NEXUS has not run yet. Run: npm run nexus:run',
                autoActions: [],
                nextAction: 'Initialize NEXUS by running: npm run nexus:run',
                innovation: { leverage: 'Pending', efficiency: 'Pending' },
                lastCheck: null,
                runCount: 0,
                inSafeMode: false,
            });
        }
    } catch (error: any) {
        // Graceful degradation - never crash
        res.json({
            success: false,
            state: 'ERROR',
            reason: `Failed to read NEXUS status: ${error.message}`,
            autoActions: [],
            nextAction: 'Check NEXUS configuration',
            innovation: { leverage: 'Error', efficiency: 'Error' },
            lastCheck: null,
            runCount: 0,
            inSafeMode: true,
        });
    }
});

/**
 * GET /api/nexus/innovation
 * Returns just the innovation proposals
 */
router.get('/innovation', (req, res) => {
    try {
        const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');

        if (fs.existsSync(statusPath)) {
            const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
            res.json({
                success: true,
                leverage: status.innovation?.leverageUpgrade || null,
                efficiency: status.innovation?.efficiencyUpgrade || null,
                preventionUpgrades: status.preventionUpgrades || [],
            });
        } else {
            res.json({
                success: false,
                message: 'NEXUS not initialized',
            });
        }
    } catch (error: any) {
        res.json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * GET /api/nexus/health
 * Simple health check for NEXUS subsystem
 */
router.get('/health', (req, res) => {
    const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');
    const exists = fs.existsSync(statusPath);

    res.json({
        nexus: exists ? 'operational' : 'not_initialized',
        lastStatus: exists ? 'available' : 'pending',
    });
});

export default router;
