/**
 * GG LOOP Business Bot - Frontend Watchdog
 * Detects frontend build failures, 503 issues, and JS boot failures
 */

import { HealthCheck, WatchdogResult } from './types';
import { config } from './config';

export async function checkFrontend(): Promise<WatchdogResult> {
    const checks: HealthCheck[] = [];
    let criticalFailure = false;

    // Check 1: Homepage returns 200 (not 503)
    try {
        const response = await fetch(config.production.baseUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'GGLoop-BusinessBot/1.0' },
        });

        const isHealthy = response.status === 200;
        const contentType = response.headers.get('content-type') || '';
        const isHtml = contentType.includes('text/html');

        if (!isHealthy) {
            checks.push({
                name: 'Frontend Serving',
                status: 'FAIL',
                message: `Homepage returned HTTP ${response.status}`,
                timestamp: new Date(),
                details: { httpStatus: response.status, failureType: 'HTTP_ERROR' },
            });
            criticalFailure = true;
            return { passed: false, checks, criticalFailure: true };
        }

        // Get body for content analysis
        const body = await response.text();

        // Check for maintenance page (explicit 503 fallback)
        const isMaintenance = body.includes('temporarily unavailable') ||
            body.includes('GG LOOP - Maintenance');

        if (isMaintenance) {
            checks.push({
                name: 'Frontend Serving',
                status: 'FAIL',
                message: 'Homepage returns maintenance page (dist/public missing)',
                timestamp: new Date(),
                details: {
                    httpStatus: response.status,
                    failureType: 'MAINTENANCE_PAGE',
                    action: 'Check Railway build logs. Trigger manual deploy if needed.'
                },
            });
            criticalFailure = true;
            return { passed: false, checks, criticalFailure: true };
        }

        // Check for JS boot failure indicators
        const hasReactRoot = body.includes('id="root"') || body.includes('id="app"');
        const hasScriptTags = body.includes('<script');
        const hasPlayEarnLoop = body.includes('Play') && body.includes('Earn') && body.includes('Loop');

        // Detect empty shell (HTML loads but no content rendered)
        if (hasReactRoot && hasScriptTags && !hasPlayEarnLoop) {
            // This might indicate JS hydration failure or API hang
            checks.push({
                name: 'Frontend Boot',
                status: 'WARN',
                message: 'HTML shell loads but core content missing - possible JS hydration issue',
                timestamp: new Date(),
                details: {
                    failureType: 'POSSIBLE_HYDRATION_FAILURE',
                    hasReactRoot,
                    hasScriptTags,
                    hasContent: hasPlayEarnLoop
                },
            });
            // Not critical - could be timing issue
        } else if (hasPlayEarnLoop) {
            checks.push({
                name: 'Frontend Serving',
                status: 'PASS',
                message: 'Homepage loads successfully with expected content',
                timestamp: new Date(),
                details: { httpStatus: 200 },
            });
        } else {
            checks.push({
                name: 'Frontend Serving',
                status: 'PASS',
                message: 'Homepage loads (200 OK)',
                timestamp: new Date(),
                details: { httpStatus: 200 },
            });
        }

    } catch (error: any) {
        checks.push({
            name: 'Frontend Serving',
            status: 'FAIL',
            message: `Failed to reach homepage: ${error.message}`,
            timestamp: new Date(),
            details: { error: error.message, failureType: 'NETWORK_ERROR' },
        });
        criticalFailure = true;
    }

    return {
        passed: !criticalFailure,
        checks,
        criticalFailure,
    };
}
