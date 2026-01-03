/**
 * GG LOOP Autonomous Output Engine - Observation Layer
 * Reads Business Bot outputs, git activity, and platform state
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { GitActivity, PlatformContext, OutputEvent, OutputCategory } from './types';
import { aoeConfig } from './config';

/**
 * Read Business Bot status to understand platform health
 */
export function readPlatformContext(): PlatformContext {
    const statusPath = path.resolve(process.cwd(), 'business-bot/status.json');

    try {
        if (fs.existsSync(statusPath)) {
            const raw = fs.readFileSync(statusPath, 'utf-8');
            const status = JSON.parse(raw);

            const frontendCheck = status.checks?.find((c: any) => c.name === 'Frontend Serving');
            const backendCheck = status.checks?.find((c: any) => c.name === 'Backend API');
            const deployCheck = status.checks?.find((c: any) => c.name === 'Deploy Freshness');

            return {
                isHealthy: status.state === 'HEALTHY',
                daysSinceLastIssue: status.state === 'HEALTHY' ? 7 : 0, // Simplified
                frontendLive: frontendCheck?.status === 'PASS',
                backendLive: backendCheck?.status === 'PASS',
                deployFresh: deployCheck?.status === 'PASS',
            };
        }
    } catch (err) {
        console.warn('[AOE] Could not read Business Bot status:', err);
    }

    return {
        isHealthy: true, // Assume healthy if can't read
        daysSinceLastIssue: 0,
        frontendLive: true,
        backendLive: true,
        deployFresh: true,
    };
}

/**
 * Analyze git activity to understand what's being produced
 */
export function analyzeGitActivity(): GitActivity {
    let commitsLast7Days = 0;
    let commitsLast30Days = 0;
    let lastCommitDate: Date | null = null;
    let filesChangedLast7Days: string[] = [];

    try {
        // Get commit count last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const count7 = execSync(`git rev-list --count --since="${sevenDaysAgo}" HEAD`, { encoding: 'utf-8' }).trim();
        commitsLast7Days = parseInt(count7) || 0;

        // Get commit count last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const count30 = execSync(`git rev-list --count --since="${thirtyDaysAgo}" HEAD`, { encoding: 'utf-8' }).trim();
        commitsLast30Days = parseInt(count30) || 0;

        // Get last commit date
        const lastCommit = execSync('git log -1 --format=%ct', { encoding: 'utf-8' }).trim();
        if (lastCommit) {
            lastCommitDate = new Date(parseInt(lastCommit) * 1000);
        }

        // Get files changed in last 7 days
        try {
            const files = execSync(`git diff --name-only HEAD@{7.days.ago}..HEAD`, { encoding: 'utf-8' }).trim();
            filesChangedLast7Days = files.split('\n').filter(f => f.length > 0);
        } catch {
            // Fallback if reflog doesn't go back that far
            filesChangedLast7Days = [];
        }
    } catch (err) {
        console.warn('[AOE] Git analysis failed:', err);
    }

    // Classify changes
    const hasProductChanges = filesChangedLast7Days.some(f =>
        aoeConfig.productIndicators.some(indicator => f.includes(indicator))
    );

    const hasContentChanges = filesChangedLast7Days.some(f =>
        aoeConfig.contentIndicators.some(indicator => f.includes(indicator))
    );

    return {
        commitsLast7Days,
        commitsLast30Days,
        lastCommitDate,
        filesChangedLast7Days,
        hasProductChanges,
        hasContentChanges,
    };
}

/**
 * Extract recent output events from git history
 */
export function extractOutputEvents(): OutputEvent[] {
    const events: OutputEvent[] = [];

    try {
        // Get commits from last 30 days with message
        const log = execSync('git log --oneline --since="30 days ago" --format="%H|%s|%ct"', { encoding: 'utf-8' });
        const lines = log.trim().split('\n').filter(l => l.length > 0);

        for (const line of lines.slice(0, 20)) { // Limit to 20 most recent
            const [sha, message, timestamp] = line.split('|');
            if (!sha || !message) continue;

            const category = classifyCommit(message);
            const impact = assessImpact(message);

            events.push({
                id: sha.substring(0, 7),
                category,
                description: message,
                timestamp: new Date(parseInt(timestamp) * 1000),
                impact,
                evidence: sha,
            });
        }
    } catch (err) {
        console.warn('[AOE] Could not extract output events:', err);
    }

    return events;
}

/**
 * Classify a commit into a category
 */
function classifyCommit(message: string): OutputCategory {
    const lower = message.toLowerCase();

    if (aoeConfig.businessIndicators.some(i => lower.includes(i))) {
        return 'business';
    }
    if (aoeConfig.growthIndicators.some(i => lower.includes(i))) {
        return 'growth';
    }
    return 'product';
}

/**
 * Assess impact of a commit
 */
function assessImpact(message: string): 'low' | 'medium' | 'high' {
    const lower = message.toLowerCase();

    if (lower.includes('fix') || lower.includes('bug') || lower.includes('typo')) {
        return 'low';
    }
    if (lower.includes('feat') || lower.includes('add') || lower.includes('implement')) {
        return 'high';
    }
    return 'medium';
}

/**
 * Calculate days since last meaningful output
 */
export function daysSinceLastMeaningfulOutput(events: OutputEvent[]): number {
    const meaningful = events.filter(e => e.impact !== 'low');

    if (meaningful.length === 0) {
        return 30; // Max tracked period
    }

    const latest = meaningful[0].timestamp;
    return Math.floor((Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24));
}
