/**
 * GG LOOP Business Bot - Deployment Enforcement Agent
 * Detects stale deploys and commit mismatches
 */

import { HealthCheck, DeploymentStatus } from './types';
import { config } from './config';
import { getRunningDeployInfo } from './watchdog-backend';
import { execSync } from 'child_process';

/**
 * Get the latest commit SHA from local git
 */
function getLatestLocalCommit(): string | null {
    try {
        const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        return sha.substring(0, 7); // Short SHA
    } catch {
        return null;
    }
}

/**
 * Get the latest commit timestamp from local git
 */
function getLatestCommitTime(): Date | null {
    try {
        const timestamp = execSync('git log -1 --format=%ct', { encoding: 'utf-8' }).trim();
        return new Date(parseInt(timestamp) * 1000);
    } catch {
        return null;
    }
}

/**
 * Check if the running deployment matches the latest code
 */
export async function checkDeployment(): Promise<{
    status: DeploymentStatus | null;
    checks: HealthCheck[];
}> {
    const checks: HealthCheck[] = [];

    const localCommit = getLatestLocalCommit();
    const commitTime = getLatestCommitTime();
    const runningInfo = await getRunningDeployInfo();

    if (!localCommit) {
        checks.push({
            name: 'Git Status',
            status: 'WARN',
            message: 'Could not determine local git commit',
            timestamp: new Date(),
        });
        return { status: null, checks };
    }

    if (!runningInfo) {
        checks.push({
            name: 'Deployment Check',
            status: 'FAIL',
            message: 'Could not reach production to verify deployment',
            timestamp: new Date(),
        });
        return { status: null, checks };
    }

    // Calculate staleness
    const minutesSinceCommit = commitTime
        ? Math.floor((Date.now() - commitTime.getTime()) / 60000)
        : 0;

    // Check if deploy is stale based on uptime
    // If server uptime is very high but recent commits exist, flag as stale
    const uptimeMinutes = runningInfo.uptime / 60;
    const isStale = minutesSinceCommit > config.thresholds.staleDeployMinutes &&
        uptimeMinutes > minutesSinceCommit;

    const status: DeploymentStatus = {
        lastGitCommit: localCommit,
        runningCommit: runningInfo.deploymentTest || 'unknown',
        isStale,
        staleDurationMinutes: isStale ? minutesSinceCommit : undefined,
    };

    if (isStale) {
        checks.push({
            name: 'Deploy Freshness',
            status: 'FAIL',
            message: `Deploy is stale: Commit ${localCommit} pushed ${minutesSinceCommit} min ago but server uptime is ${Math.floor(uptimeMinutes)} min`,
            timestamp: new Date(),
            details: {
                localCommit,
                uptimeMinutes: Math.floor(uptimeMinutes),
                minutesSinceCommit,
            },
        });
    } else {
        checks.push({
            name: 'Deploy Freshness',
            status: 'PASS',
            message: 'Deployment appears up-to-date',
            timestamp: new Date(),
            details: { localCommit, uptimeMinutes: Math.floor(uptimeMinutes) },
        });
    }

    return { status, checks };
}

/**
 * Generate runbook instruction for stale deploy
 * Provides EXACT Railway click path - no ambiguity
 */
export function generateDeployRunbook(status: DeploymentStatus): string {
    if (!status.isStale) {
        return '';
    }

    return `
## ⚠️ STALE DEPLOY DETECTED — IMMEDIATE ACTION REQUIRED

**Problem:** Commit \`${status.lastGitCommit}\` pushed ${status.staleDurationMinutes} min ago but NOT deployed.

---

### EXACT STEPS TO FIX (Railway Dashboard)

1. **OPEN:** https://railway.app/dashboard
2. **CLICK:** "GG-LOOP-PLATFORM" project tile
3. **CLICK:** "Deployments" in left sidebar
4. **CLICK:** Blue "Deploy" button (top right corner)
5. **SELECT:** Latest commit from dropdown (\`${status.lastGitCommit}\`)
6. **WAIT:** 3-5 minutes for build

---

### IF AUTO-DEPLOY IS DISABLED

1. **GO TO:** Settings tab → Triggers section
2. **ENABLE:** "Deploy on push" for \`main\` branch
3. **SAVE:** Configuration

---

### VERIFY FIX WORKED

After deploy completes:
- ✅ https://ggloop.io shows homepage (not maintenance)
- ✅ \`npm run business-bot:run\` reports HEALTHY
- ✅ Server uptime < 5 minutes

---
`.trim();
}
