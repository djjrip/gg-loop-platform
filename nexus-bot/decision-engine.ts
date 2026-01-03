/**
 * NEXUS - Decision Engine
 * Classifies state and determines actions
 */

import { NexusState, AutoAction, SubsystemHealth, PreventionUpgrade } from './types';
import { nexusConfig } from './config';

/**
 * Classify NEXUS state from subsystem health
 */
export function classifyNexusState(health: SubsystemHealth): NexusState {
    // Priority 1: Platform broken
    if (
        health.frontend.status === 'down' ||
        health.backend.status === 'down' ||
        health.database.status === 'down'
    ) {
        return 'BROKEN_PLATFORM';
    }

    // Priority 2: Output pipeline broken
    if (health.output.status === 'stalled') {
        return 'BROKEN_OUTPUT_PIPELINE';
    }

    // Priority 3: Risky drift (multiple degradations)
    const degradedCount = [
        health.frontend.status === 'degraded',
        health.backend.status === 'degraded',
        health.database.status === 'degraded',
        health.deploy.status === 'stale',
    ].filter(Boolean).length;

    if (degradedCount >= 2) {
        return 'RISKY_DRIFT';
    }

    // Priority 4: Misaligned (building without distribution)
    if (health.output.status === 'misaligned') {
        return 'MISALIGNED_BUILDING_NO_DISTRIBUTION';
    }

    // Priority 5: Idle but stable
    if (health.output.status === 'idle') {
        return 'STABLE_BUT_IDLE';
    }

    // Default: All systems go
    return 'STABLE_AND_PRODUCING';
}

/**
 * Generate reason string for state
 */
export function generateReason(state: NexusState, health: SubsystemHealth): string {
    switch (state) {
        case 'STABLE_AND_PRODUCING':
            return 'All systems healthy. Active output being generated. Momentum is positive.';

        case 'STABLE_BUT_IDLE':
            return 'Platform is stable but no meaningful output is being produced. Time to ship.';

        case 'MISALIGNED_BUILDING_NO_DISTRIBUTION':
            return 'Heavy technical work happening but no growth or distribution. Features without users = wasted effort.';

        case 'BROKEN_PLATFORM':
            const broken = [];
            if (health.frontend.status === 'down') broken.push('frontend');
            if (health.backend.status === 'down') broken.push('backend');
            if (health.database.status === 'down') broken.push('database');
            return `CRITICAL: Platform infrastructure failure. Affected: ${broken.join(', ')}. Must restore immediately.`;

        case 'BROKEN_OUTPUT_PIPELINE':
            return 'CRITICAL: No meaningful output for extended period. This is a momentum emergency requiring immediate action.';

        case 'RISKY_DRIFT':
            return 'WARNING: Multiple subsystems showing degradation. If unchecked, this leads to breakdown. Address now.';

        default:
            return 'Unknown state.';
    }
}

/**
 * Determine auto-actions NEXUS performs
 */
export function determineAutoActions(state: NexusState, health: SubsystemHealth): AutoAction[] {
    const actions: AutoAction[] = [];

    // Always: Health monitoring
    actions.push({
        description: 'Monitoring all subsystems via Business Bot',
        status: 'running',
    });

    // Always: Output tracking
    actions.push({
        description: 'Tracking output via AOE',
        status: 'running',
    });

    // State-specific autos
    if (state === 'BROKEN_PLATFORM') {
        actions.push({
            description: 'SAFE MODE: Pausing innovation, focus on restore',
            status: 'running',
        });
    }

    if (health.deploy.status === 'stale') {
        actions.push({
            description: 'Flagging stale deploy for attention',
            status: 'completed',
        });
    }

    return actions;
}

/**
 * Determine next action for founder (only if required)
 */
export function determineNextAction(state: NexusState, health: SubsystemHealth): string | null {
    switch (state) {
        case 'STABLE_AND_PRODUCING':
            return null; // No action needed

        case 'STABLE_BUT_IDLE':
            return 'Ship ONE visible output today. Post, push, or publish something.';

        case 'MISALIGNED_BUILDING_NO_DISTRIBUTION':
            return 'STOP BUILDING. Create one piece of content showcasing what was built.';

        case 'BROKEN_PLATFORM':
            if (health.frontend.status === 'down') {
                return 'Go to Railway → Deployments → Click Deploy. Frontend needs rebuild.';
            }
            if (health.backend.status === 'down') {
                return 'Check Railway logs for server crash. Restart if needed.';
            }
            return 'Check Railway dashboard for infrastructure issues.';

        case 'BROKEN_OUTPUT_PIPELINE':
            return 'Momentum emergency: Commit to shipping ONE thing within 24 hours.';

        case 'RISKY_DRIFT':
            return 'Multiple systems degrading. Run business-bot:run and address warnings.';

        default:
            return null;
    }
}

/**
 * Generate 2 prevention upgrades based on state
 */
export function generatePreventionUpgrades(state: NexusState): PreventionUpgrade[] {
    const upgrades: PreventionUpgrade[] = [];

    switch (state) {
        case 'BROKEN_PLATFORM':
            upgrades.push({
                id: 'auto-deploy-webhook',
                type: 'leverage',
                title: 'Railway Auto-Deploy Verification',
                description: 'Add startup check that verifies Railway auto-deploy is enabled and working',
                effort: 'low',
                impact: 'high',
            });
            upgrades.push({
                id: 'deploy-alert',
                type: 'efficiency',
                title: 'Deploy Failure Alert',
                description: 'Add Discord/email notification when deploy fails silently',
                effort: 'medium',
                impact: 'high',
            });
            break;

        case 'STABLE_BUT_IDLE':
        case 'BROKEN_OUTPUT_PIPELINE':
            upgrades.push({
                id: 'content-queue',
                type: 'leverage',
                title: 'Pre-written Content Queue',
                description: 'Build queue of 5 ready-to-post updates so output never stalls',
                effort: 'medium',
                impact: 'high',
            });
            upgrades.push({
                id: 'daily-output-prompt',
                type: 'efficiency',
                title: 'Daily Output Reminder',
                description: 'Automated morning prompt asking "What will you ship today?"',
                effort: 'low',
                impact: 'medium',
            });
            break;

        case 'MISALIGNED_BUILDING_NO_DISTRIBUTION':
            upgrades.push({
                id: 'ship-then-build',
                type: 'leverage',
                title: 'Ship-Then-Build Protocol',
                description: 'Rule: Every new feature must have distribution plan BEFORE building',
                effort: 'low',
                impact: 'high',
            });
            upgrades.push({
                id: 'feature-announcement-template',
                type: 'efficiency',
                title: 'Feature Announcement Template',
                description: 'Pre-built template that converts any commit into a social post',
                effort: 'low',
                impact: 'medium',
            });
            break;

        default:
            upgrades.push({
                id: 'metric-dashboard',
                type: 'leverage',
                title: 'Single Metric Dashboard',
                description: 'One glanceable page showing: Users, Revenue, Output velocity',
                effort: 'medium',
                impact: 'high',
            });
            upgrades.push({
                id: 'weekly-digest',
                type: 'efficiency',
                title: 'Automated Weekly Digest',
                description: 'Auto-generate founder summary of what shipped and what stalled',
                effort: 'medium',
                impact: 'medium',
            });
    }

    return upgrades;
}
