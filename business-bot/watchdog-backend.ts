/**
 * GG LOOP Business Bot - Backend Watchdog
 * Monitors API health and database connectivity
 */

import { HealthCheck, WatchdogResult } from './types';
import { config } from './config';

interface HealthResponse {
    status: string;
    database: string;
    uptime: number;
    timestamp: string;
    deploymentTest?: string;
}

export async function checkBackend(): Promise<WatchdogResult> {
    const checks: HealthCheck[] = [];
    let criticalFailure = false;

    const healthUrl = `${config.production.baseUrl}${config.production.healthEndpoint}`;

    try {
        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'GGLoop-BusinessBot/1.0',
                'Accept': 'application/json',
            },
        });

        if (response.status !== 200) {
            checks.push({
                name: 'Backend API',
                status: 'FAIL',
                message: `Health endpoint returned HTTP ${response.status}`,
                timestamp: new Date(),
                details: { httpStatus: response.status },
            });
            criticalFailure = true;
        } else {
            const contentType = response.headers.get('content-type') || '';

            if (!contentType.includes('application/json')) {
                // Likely serving maintenance page instead of JSON
                checks.push({
                    name: 'Backend API',
                    status: 'FAIL',
                    message: 'Health endpoint not returning JSON (server may be down)',
                    timestamp: new Date(),
                    details: { contentType },
                });
                criticalFailure = true;
            } else {
                const data: HealthResponse = await response.json();

                // Check API status
                checks.push({
                    name: 'Backend API',
                    status: data.status === 'healthy' ? 'PASS' : 'FAIL',
                    message: data.status === 'healthy' ? 'API responding healthy' : `API status: ${data.status}`,
                    timestamp: new Date(),
                    details: { uptime: data.uptime, deploymentTest: data.deploymentTest },
                });

                if (data.status !== 'healthy') criticalFailure = true;

                // Check database
                checks.push({
                    name: 'Database Connection',
                    status: data.database === 'connected' ? 'PASS' : 'FAIL',
                    message: data.database === 'connected' ? 'Database connected' : `Database: ${data.database}`,
                    timestamp: new Date(),
                });

                if (data.database !== 'connected') criticalFailure = true;

                // Check uptime for excessive value (indicates stale deploy)
                const uptimeHours = data.uptime / 3600;
                if (uptimeHours > 48) {
                    checks.push({
                        name: 'Server Freshness',
                        status: 'WARN',
                        message: `Server running for ${uptimeHours.toFixed(1)} hours without restart`,
                        timestamp: new Date(),
                        details: { uptimeHours },
                    });
                }
            }
        }
    } catch (error: any) {
        checks.push({
            name: 'Backend API',
            status: 'FAIL',
            message: `Failed to reach API: ${error.message}`,
            timestamp: new Date(),
            details: { error: error.message },
        });
        criticalFailure = true;
    }

    return {
        passed: !criticalFailure,
        checks,
        criticalFailure,
    };
}

/**
 * Get running commit SHA from health endpoint
 */
export async function getRunningDeployInfo(): Promise<{ uptime: number; deploymentTest?: string } | null> {
    const healthUrl = `${config.production.baseUrl}${config.production.healthEndpoint}`;

    try {
        const response = await fetch(healthUrl, {
            headers: { 'Accept': 'application/json' },
        });

        if (response.status === 200) {
            const data = await response.json();
            return {
                uptime: data.uptime || 0,
                deploymentTest: data.deploymentTest,
            };
        }
    } catch {
        // Silently fail
    }

    return null;
}
