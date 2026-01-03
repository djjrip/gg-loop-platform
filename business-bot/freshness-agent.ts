/**
 * GG LOOP Business Bot - Business Freshness Agent
 * Monitors marketing and content staleness (detection only, no posting)
 */

import { HealthCheck, BusinessFreshness } from './types';
import { config } from './config';
import { execSync } from 'child_process';

/**
 * Get the date of the last code commit
 */
function getLastCodeChangeDate(): Date | null {
    try {
        const timestamp = execSync('git log -1 --format=%ct', { encoding: 'utf-8' }).trim();
        return new Date(parseInt(timestamp) * 1000);
    } catch {
        return null;
    }
}

/**
 * Get the date of the last content-related commit (pages, copy)
 */
function getLastContentUpdate(): Date | null {
    try {
        // Look for changes in client/src/pages or any .tsx files
        const timestamp = execSync(
            'git log -1 --format=%ct -- "client/src/pages/*.tsx" "client/src/components/*.tsx"',
            { encoding: 'utf-8' }
        ).trim();
        if (timestamp) {
            return new Date(parseInt(timestamp) * 1000);
        }
    } catch {
        // Fall back to general code change
    }
    return getLastCodeChangeDate();
}

/**
 * Check if Twitter/X automation has recent activity
 * This is a HOOK - checks for evidence but doesn't post
 */
function checkSocialActivityHook(): Date | null {
    // Look for twitter automation logs or scheduled post files
    try {
        const timestamp = execSync(
            'git log -1 --format=%ct -- "scripts/*twitter*" ".github/workflows/twitter*"',
            { encoding: 'utf-8' }
        ).trim();
        if (timestamp) {
            return new Date(parseInt(timestamp) * 1000);
        }
    } catch {
        // No social automation detected
    }
    return null;
}

/**
 * Calculate days since a date
 */
function daysSince(date: Date | null): number {
    if (!date) return 999; // Unknown = very stale
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check overall business freshness
 */
export function checkBusinessFreshness(): {
    freshness: BusinessFreshness;
    checks: HealthCheck[];
} {
    const checks: HealthCheck[] = [];

    const lastCodeChange = getLastCodeChangeDate();
    const lastContentUpdate = getLastContentUpdate();
    const lastSocialActivity = checkSocialActivityHook();

    // Calculate most stale metric
    const daysStale = Math.min(
        daysSince(lastCodeChange),
        daysSince(lastContentUpdate)
    );

    const freshness: BusinessFreshness = {
        lastCodeChange: lastCodeChange || undefined,
        lastContentUpdate: lastContentUpdate || undefined,
        lastSocialActivity: lastSocialActivity || undefined,
        daysStale,
    };

    // Check code freshness
    const codeDays = daysSince(lastCodeChange);
    if (codeDays >= config.thresholds.stalenessCriticalDays) {
        checks.push({
            name: 'Code Freshness',
            status: 'WARN',
            message: `No code changes for ${codeDays} days`,
            timestamp: new Date(),
            details: { lastChange: lastCodeChange?.toISOString() },
        });
    } else {
        checks.push({
            name: 'Code Freshness',
            status: 'PASS',
            message: `Last code change: ${codeDays} days ago`,
            timestamp: new Date(),
        });
    }

    // Check content freshness
    const contentDays = daysSince(lastContentUpdate);
    if (contentDays >= config.thresholds.stalenessCriticalDays) {
        checks.push({
            name: 'Content Freshness',
            status: 'WARN',
            message: `No content updates for ${contentDays} days`,
            timestamp: new Date(),
        });
    }

    // Check social activity (informational only)
    if (!lastSocialActivity) {
        checks.push({
            name: 'Social Activity',
            status: 'WARN',
            message: 'No social automation detected (hook available but not wired)',
            timestamp: new Date(),
        });
    }

    return { freshness, checks };
}
