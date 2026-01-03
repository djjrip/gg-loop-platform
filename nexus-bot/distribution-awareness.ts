/**
 * NEXUS Distribution Awareness
 * Detects external signals and penalizes building without distribution
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface DistributionSignals {
    siteIsLive: boolean;
    desktopAppReleased: boolean;
    lastSocialActivity: Date | null;
    daysSinceLastDistribution: number;
    distributionScore: number; // 0-100
    diagnosis: string;
}

/**
 * Analyze distribution signals
 */
export function analyzeDistribution(): DistributionSignals {
    let siteIsLive = true; // Assume site is live (verified by Business Bot)
    let desktopAppReleased = false;
    let lastSocialActivity: Date | null = null;
    let daysSinceLastDistribution = 0;

    // Check if desktop app exists
    try {
        const desktopPath = path.resolve(process.cwd(), '../gg-loop-desktop');
        if (fs.existsSync(desktopPath)) {
            desktopAppReleased = true;
        }
    } catch { }

    // Check for recent social/distribution commits
    try {
        const socialCommits = execSync(
            'git log --oneline --since="30 days ago" --grep="twitter\\|social\\|post\\|announce\\|release" -i',
            { encoding: 'utf-8' }
        ).trim();

        if (socialCommits.length > 0) {
            // Get date of most recent social commit
            const dateStr = execSync(
                'git log --format=%ct --since="30 days ago" --grep="twitter\\|social\\|post\\|announce\\|release" -i -1',
                { encoding: 'utf-8' }
            ).trim();

            if (dateStr) {
                lastSocialActivity = new Date(parseInt(dateStr) * 1000);
            }
        }
    } catch { }

    // Calculate days since distribution
    if (lastSocialActivity) {
        daysSinceLastDistribution = Math.floor(
            (Date.now() - lastSocialActivity.getTime()) / (1000 * 60 * 60 * 24)
        );
    } else {
        daysSinceLastDistribution = 30; // Max tracked
    }

    // Calculate distribution score
    let distributionScore = 100;

    // Penalize lack of recent distribution
    if (daysSinceLastDistribution > 7) {
        distributionScore -= 30;
    } else if (daysSinceLastDistribution > 3) {
        distributionScore -= 15;
    }

    // Penalize if desktop released but not announced
    if (desktopAppReleased && daysSinceLastDistribution > 7) {
        distributionScore -= 20;
    }

    // Ensure score is in range
    distributionScore = Math.max(0, Math.min(100, distributionScore));

    // Generate diagnosis
    let diagnosis = '';
    if (distributionScore >= 80) {
        diagnosis = 'Distribution is healthy. Recent signals detected.';
    } else if (distributionScore >= 50) {
        diagnosis = 'Distribution lagging. Consider posting an update.';
    } else if (distributionScore >= 30) {
        diagnosis = 'WARNING: Building without telling anyone. Distribution is critical.';
    } else {
        diagnosis = 'CRITICAL: No distribution activity. All building effort is wasted without visibility.';
    }

    return {
        siteIsLive,
        desktopAppReleased,
        lastSocialActivity,
        daysSinceLastDistribution,
        distributionScore,
        diagnosis,
    };
}

/**
 * Check if distribution is blocking progress
 */
export function isDistributionBlocking(signals: DistributionSignals): boolean {
    return signals.distributionScore < 50;
}

/**
 * Get distribution recommendation
 */
export function getDistributionRecommendation(signals: DistributionSignals): string {
    if (signals.distributionScore >= 80) {
        return 'Continue current distribution cadence.';
    }

    if (signals.desktopAppReleased && signals.daysSinceLastDistribution > 3) {
        return 'Desktop app shipped but not amplified. Post about v1.0.0 launch on X/Twitter.';
    }

    if (signals.daysSinceLastDistribution > 7) {
        return 'Post a platform update. Options: feature announcement, user milestone, behind-the-scenes.';
    }

    return 'Create one piece of distribution content today.';
}
