/**
 * GG LOOP Business Bot - Core Types
 * Autonomous monitoring system for platform health
 */

export type SystemState = 'HEALTHY' | 'DEGRADED' | 'BROKEN';

export interface HealthCheck {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    timestamp: Date;
    details?: Record<string, unknown>;
}

export interface DeploymentStatus {
    lastGitCommit: string;
    runningCommit: string;
    isStale: boolean;
    staleDurationMinutes?: number;
    lastDeployTime?: Date;
}

export interface BusinessFreshness {
    lastCodeChange?: Date;
    lastContentUpdate?: Date;
    lastSocialActivity?: Date;
    daysStale: number;
}

export interface BotStatus {
    state: SystemState;
    timestamp: Date;
    checks: HealthCheck[];
    deployment: DeploymentStatus | null;
    freshness: BusinessFreshness | null;
    nextAction: string;
    runbookStep?: string;
}

export interface WatchdogResult {
    passed: boolean;
    checks: HealthCheck[];
    criticalFailure: boolean;
}
