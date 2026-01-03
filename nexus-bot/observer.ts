/**
 * NEXUS - Unified Observer
 * Aggregates all subsystem health into single truth
 */

import * as fs from 'fs';
import * as path from 'path';
import { SubsystemHealth } from './types';
import { nexusConfig } from './config';

/**
 * Read Business Bot status
 */
function readBusinessBotStatus(): { state: string; checks: any[] } | null {
    try {
        const statusPath = path.resolve(process.cwd(), 'business-bot/status.json');
        if (fs.existsSync(statusPath)) {
            return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Read AOE status
 */
function readAOEStatus(): { state: string; stagnationDays: number } | null {
    try {
        const statusPath = path.resolve(process.cwd(), 'autonomous-output-engine/output-status.json');
        if (fs.existsSync(statusPath)) {
            return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Aggregate all subsystem health
 */
export function observeSubsystems(): SubsystemHealth {
    const botStatus = readBusinessBotStatus();
    const aoeStatus = readAOEStatus();

    // Default health
    const health: SubsystemHealth = {
        frontend: { status: 'ok' },
        backend: { status: 'ok' },
        database: { status: 'ok' },
        deploy: { status: 'fresh' },
        output: { status: 'producing' },
    };

    // Parse Business Bot checks
    if (botStatus) {
        const checks = botStatus.checks || [];

        const frontendCheck = checks.find((c: any) => c.name === 'Frontend Serving');
        if (frontendCheck) {
            health.frontend.status = frontendCheck.status === 'PASS' ? 'ok' : 'down';
        }

        const backendCheck = checks.find((c: any) => c.name === 'Backend API');
        if (backendCheck) {
            health.backend.status = backendCheck.status === 'PASS' ? 'ok' : 'down';
        }

        const dbCheck = checks.find((c: any) => c.name === 'Database Connection');
        if (dbCheck) {
            health.database.status = dbCheck.status === 'PASS' ? 'ok' : 'down';
        }

        const deployCheck = checks.find((c: any) => c.name === 'Deploy Freshness');
        if (deployCheck) {
            health.deploy.status = deployCheck.status === 'PASS' ? 'fresh' : 'stale';
        }

        // Check if bot reported BROKEN state
        if (botStatus.state === 'BROKEN') {
            // Mark most likely culprit
            if (health.frontend.status === 'ok') health.frontend.status = 'degraded';
        }
    } else {
        // No bot status = potential issue
        health.backend.status = 'degraded';
    }

    // Parse AOE status
    if (aoeStatus) {
        switch (aoeStatus.state) {
            case 'PRODUCING':
                health.output.status = 'producing';
                break;
            case 'READY_BUT_IDLE':
                health.output.status = 'idle';
                break;
            case 'STALLED':
                health.output.status = 'stalled';
                break;
            case 'MISALIGNED':
                health.output.status = 'misaligned';
                break;
        }
    } else {
        // No AOE status = assume idle
        health.output.status = 'idle';
    }

    return health;
}

/**
 * Check if platform is in broken state
 */
export function isPlatformBroken(health: SubsystemHealth): boolean {
    return (
        health.frontend.status === 'down' ||
        health.backend.status === 'down' ||
        health.database.status === 'down' ||
        health.deploy.status === 'failed'
    );
}

/**
 * Check if output pipeline is broken
 */
export function isOutputBroken(health: SubsystemHealth): boolean {
    return health.output.status === 'stalled';
}

/**
 * Detect risky drift (slow degradation)
 */
export function detectRiskyDrift(health: SubsystemHealth): boolean {
    const degradedCount = [
        health.frontend.status === 'degraded',
        health.backend.status === 'degraded',
        health.database.status === 'degraded',
        health.deploy.status === 'stale',
    ].filter(Boolean).length;

    return degradedCount >= 2;
}
