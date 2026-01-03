/**
 * NEXUS Distribution Engine - Signal Detector
 * Reads NEXUS outputs and detects distribution-worthy signals
 */

import * as fs from 'fs';
import * as path from 'path';
import { DistributionSignal, SignalType } from './types';

/**
 * Read NEXUS status and extract signals
 */
export function detectSignals(): DistributionSignal[] {
    const signals: DistributionSignal[] = [];

    // Read NEXUS status
    const nexusStatus = readNexusStatus();
    if (nexusStatus) {
        // Detect state changes that are newsworthy
        if (nexusStatus.state === 'STABLE_AND_PRODUCING') {
            signals.push({
                type: 'milestone_reached',
                title: 'Platform healthy and producing',
                description: 'All systems operational, active development happening',
                timestamp: new Date(),
                priority: 'medium',
            });
        }

        // Innovation executed = always newsworthy
        if (nexusStatus.innovation) {
            signals.push({
                type: 'innovation_executed',
                title: `Innovation: ${nexusStatus.innovation.leverageUpgrade?.title || 'New capability'}`,
                description: nexusStatus.innovation.leverageUpgrade?.description || '',
                timestamp: new Date(),
                priority: 'high',
            });
        }
    }

    // Read Business Bot status for deploy signals
    const botStatus = readBusinessBotStatus();
    if (botStatus) {
        if (botStatus.state === 'HEALTHY') {
            const frontendCheck = botStatus.checks?.find((c: any) => c.name === 'Frontend Serving');
            if (frontendCheck?.status === 'PASS') {
                signals.push({
                    type: 'new_deploy',
                    title: 'Site live and verified',
                    description: 'Frontend serving correctly, all health checks passing',
                    timestamp: new Date(),
                    proof: 'https://ggloop.io',
                    priority: 'medium',
                });
            }
        }
    }

    // Read AOE status for output signals
    const aoeStatus = readAOEStatus();
    if (aoeStatus) {
        if (aoeStatus.outputCountLast7Days > 0) {
            signals.push({
                type: 'feature_shipped',
                title: `${aoeStatus.outputCountLast7Days} outputs in last 7 days`,
                description: 'Active development and shipping cadence',
                timestamp: new Date(),
                priority: 'low',
            });
        }
    }

    // Check for recent resolved failures (from NEXUS memory)
    const nexusMemory = readNexusMemory();
    if (nexusMemory) {
        const recentResolved = nexusMemory.failureHistory?.filter((f: any) =>
            f.resolved &&
            new Date(f.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        );

        for (const failure of recentResolved || []) {
            signals.push({
                type: 'failure_resolved',
                title: `Fixed: ${failure.type}`,
                description: failure.description,
                timestamp: new Date(failure.timestamp),
                priority: 'high',
            });
        }
    }

    return signals;
}

/**
 * Read NEXUS status JSON
 */
function readNexusStatus(): any {
    try {
        const statusPath = path.resolve(process.cwd(), 'nexus-bot/nexus-status.json');
        if (fs.existsSync(statusPath)) {
            return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Read Business Bot status
 */
function readBusinessBotStatus(): any {
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
function readAOEStatus(): any {
    try {
        const statusPath = path.resolve(process.cwd(), 'autonomous-output-engine/output-status.json');
        if (fs.existsSync(statusPath)) {
            return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Read NEXUS memory
 */
function readNexusMemory(): any {
    try {
        const memPath = path.resolve(process.cwd(), 'nexus-bot/memory.json');
        if (fs.existsSync(memPath)) {
            return JSON.parse(fs.readFileSync(memPath, 'utf-8'));
        }
    } catch { }
    return null;
}

/**
 * Get highest priority signal
 */
export function getTopSignal(signals: DistributionSignal[]): DistributionSignal | null {
    if (signals.length === 0) return null;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    signals.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return signals[0];
}
