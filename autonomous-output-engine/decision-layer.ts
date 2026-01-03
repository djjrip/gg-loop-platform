/**
 * GG LOOP Autonomous Output Engine - Decision Layer
 * Classifies output state and recommends actions
 */

import { OutputState, OutputStatus, OutputEvent, NextAction, PlatformContext, GitActivity } from './types';
import { aoeConfig } from './config';

/**
 * Core decision logic - TECHNICAL STATE → BUSINESS ACTION
 */
export function classifyOutputState(
    context: PlatformContext,
    git: GitActivity,
    events: OutputEvent[],
    stagnationDays: number
): OutputState {
    const meaningfulEvents = events.filter(e => e.impact !== 'low');
    const recentMeaningful = meaningfulEvents.filter(e =>
        Date.now() - e.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    // STALLED: Platform stable but no meaningful output for extended period
    if (context.isHealthy && stagnationDays >= aoeConfig.thresholds.stalledDays) {
        return 'STALLED';
    }

    // READY_BUT_IDLE: Platform healthy, recent activity but no impact
    if (context.isHealthy && git.commitsLast7Days > 0 && recentMeaningful.length === 0) {
        return 'READY_BUT_IDLE';
    }

    // MISALIGNED: Lots of product work but no growth/business output
    const productCount = events.filter(e => e.category === 'product').length;
    const growthBusinessCount = events.filter(e => e.category === 'growth' || e.category === 'business').length;

    if (productCount > 5 && growthBusinessCount === 0) {
        return 'MISALIGNED';
    }

    // PRODUCING: Active meaningful output
    if (recentMeaningful.length > 0) {
        return 'PRODUCING';
    }

    // Default to READY_BUT_IDLE if nothing matches
    return 'READY_BUT_IDLE';
}

/**
 * Generate diagnosis string
 */
export function generateDiagnosis(
    state: OutputState,
    context: PlatformContext,
    git: GitActivity,
    stagnationDays: number
): string {
    switch (state) {
        case 'PRODUCING':
            return `Active production underway. ${git.commitsLast7Days} commits in the last 7 days with meaningful impact.`;

        case 'READY_BUT_IDLE':
            return `Platform is healthy and stable, but no high-impact output has been shipped recently. Time to ship something that matters.`;

        case 'STALLED':
            return `ALERT: No meaningful output for ${stagnationDays} days. The platform is stable but nothing is being produced. This is a momentum problem.`;

        case 'MISALIGNED':
            return `Heavy product/technical work is happening, but no growth or business output. Features without distribution = wasted effort.`;

        default:
            return 'Unknown state.';
    }
}

/**
 * Recommend next actions based on state
 */
export function recommendActions(
    state: OutputState,
    context: PlatformContext,
    git: GitActivity,
    events: OutputEvent[]
): NextAction[] {
    const actions: NextAction[] = [];

    switch (state) {
        case 'STALLED':
            actions.push({
                priority: 'critical',
                category: 'growth',
                action: 'Ship ONE visible output today',
                reason: 'Momentum is dying. Any forward motion beats paralysis.',
            });
            actions.push({
                priority: 'high',
                category: 'product',
                action: 'Identify the smallest shippable feature and release it',
                reason: 'Small wins compound. Break the stall.',
            });
            break;

        case 'READY_BUT_IDLE':
            actions.push({
                priority: 'high',
                category: 'growth',
                action: 'Post a platform update on X/Twitter',
                reason: 'Platform is stable. Time to tell people about it.',
            });
            actions.push({
                priority: 'medium',
                category: 'business',
                action: 'Send one outreach email to potential partner',
                reason: 'Stable platform = ready for partnerships.',
            });
            break;

        case 'MISALIGNED':
            actions.push({
                priority: 'critical',
                category: 'growth',
                action: 'Stop building, start distributing',
                reason: 'Product without users = vanity project.',
            });
            actions.push({
                priority: 'high',
                category: 'growth',
                action: 'Create one piece of content showcasing recent features',
                reason: 'Translate technical work into user-facing value.',
            });
            break;

        case 'PRODUCING':
            // Keep going, but suggest balance
            if (!git.hasContentChanges) {
                actions.push({
                    priority: 'medium',
                    category: 'growth',
                    action: 'Document what was shipped for external consumption',
                    reason: 'Production is happening but not being broadcast.',
                });
            }
            break;
    }

    // Always add a business action if none exist
    const hasBusinessAction = actions.some(a => a.category === 'business');
    if (!hasBusinessAction) {
        actions.push({
            priority: 'low',
            category: 'business',
            action: 'Review monetization readiness',
            reason: 'Regular revenue pulse check.',
        });
    }

    return actions;
}

/**
 * Determine if something is blocking output
 */
export function detectBlocker(
    context: PlatformContext,
    state: OutputState
): string | undefined {
    if (!context.isHealthy) {
        return 'Platform health issues must be resolved first.';
    }

    if (!context.frontendLive) {
        return 'Frontend is down - fix before any user-facing output.';
    }

    if (!context.deployFresh) {
        return 'Stale deploy detected - push latest changes to production.';
    }

    if (state === 'STALLED') {
        return 'No technical blocker detected. This is a decision/action problem, not a systems problem.';
    }

    return undefined;
}
