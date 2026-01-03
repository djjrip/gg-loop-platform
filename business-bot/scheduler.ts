/**
 * GG LOOP Business Bot - Production Scheduler
 * Autonomous execution tied to server runtime
 * Runs every 15 minutes without blocking main app
 */

import { runBusinessBot } from './index';

let isRunning = false;
let lastRunTime: Date | null = null;
let consecutiveFailures = 0;

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Execute a single bot run with error isolation
 */
async function executeBotRun(): Promise<void> {
    if (isRunning) {
        console.log('[BusinessBot] Skipping run - previous execution still in progress');
        return;
    }

    isRunning = true;
    const startTime = Date.now();

    try {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[BusinessBot] Scheduled run starting at ${new Date().toISOString()}`);
        console.log(`${'═'.repeat(60)}\n`);

        const status = await runBusinessBot();

        // Reset failure counter on success
        consecutiveFailures = 0;
        lastRunTime = new Date();

        // Log execution summary
        const durationMs = Date.now() - startTime;
        console.log(`\n[BusinessBot] Run completed in ${durationMs}ms`);
        console.log(`[BusinessBot] State: ${status.state}`);

        // Hard failure escalation
        if (status.state === 'BROKEN') {
            console.error(`\n${'!'.repeat(60)}`);
            console.error('[BusinessBot] ⚠️  HARD FAILURE DETECTED');
            console.error(`[BusinessBot] Next Action: ${status.nextAction}`);
            if (status.runbookStep) {
                console.error(`[BusinessBot] Runbook:\n${status.runbookStep}`);
            }
            console.error(`${'!'.repeat(60)}\n`);

            // Increment failure counter for escalation tracking
            consecutiveFailures++;

            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                console.error(`[BusinessBot] CRITICAL: ${consecutiveFailures} consecutive failures detected`);
                // Future: trigger notification hook here
            }
        }

    } catch (error: any) {
        consecutiveFailures++;
        console.error(`[BusinessBot] Execution error: ${error.message}`);
        console.error(`[BusinessBot] Consecutive failures: ${consecutiveFailures}`);

        // Don't crash the main app
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.error('[BusinessBot] CRITICAL: Multiple consecutive failures - check system health');
        }
    } finally {
        isRunning = false;
    }
}

/**
 * Start the autonomous scheduler
 * Called once during server startup
 */
export function startBusinessBotScheduler(): void {
    console.log('[BusinessBot] 🤖 Autonomous scheduler initializing...');
    console.log(`[BusinessBot] Interval: ${INTERVAL_MS / 60000} minutes`);

    // Run immediately on startup
    setTimeout(() => {
        console.log('[BusinessBot] Running initial health check...');
        executeBotRun().catch(console.error);
    }, 5000); // 5 second delay to let server fully start

    // Schedule recurring runs
    setInterval(() => {
        executeBotRun().catch(console.error);
    }, INTERVAL_MS);

    console.log('[BusinessBot] ✅ Scheduler started - will run every 15 minutes');
}

/**
 * Get scheduler status (for health endpoint)
 */
export function getSchedulerStatus(): {
    running: boolean;
    lastRun: Date | null;
    consecutiveFailures: number;
} {
    return {
        running: isRunning,
        lastRun: lastRunTime,
        consecutiveFailures,
    };
}
