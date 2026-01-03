/**
 * GG LOOP Autonomous Output Engine - Core Types
 * Defines states and structures for output tracking
 */

/**
 * Output Engine State - determines what the business is doing
 */
export type OutputState =
    | 'PRODUCING'       // Active output happening
    | 'READY_BUT_IDLE'  // Stable but no output
    | 'STALLED'         // Nothing meaningful for extended period
    | 'MISALIGNED';     // Output happening but in wrong direction

/**
 * Output Category - what type of work
 */
export type OutputCategory = 'product' | 'growth' | 'business';

/**
 * A single output event (feature shipped, content created, etc)
 */
export interface OutputEvent {
    id: string;
    category: OutputCategory;
    description: string;
    timestamp: Date;
    impact: 'low' | 'medium' | 'high';
    evidence?: string; // commit SHA, file path, URL
}

/**
 * Recommended next action
 */
export interface NextAction {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: OutputCategory;
    action: string;
    reason: string;
    blockedBy?: string;
}

/**
 * Output status snapshot
 */
export interface OutputStatus {
    state: OutputState;
    timestamp: Date;

    // What has been produced
    recentOutputs: OutputEvent[];
    outputCountLast7Days: number;
    outputCountLast30Days: number;

    // Next steps
    nextActions: NextAction[];

    // Diagnosis
    diagnosis: string;
    stagnationDays: number;

    // Memory
    consecutiveIdleDays: number;
    lastMeaningfulOutput?: Date;
}

/**
 * Platform health context (from Business Bot)
 */
export interface PlatformContext {
    isHealthy: boolean;
    daysSinceLastIssue: number;
    frontendLive: boolean;
    backendLive: boolean;
    deployFresh: boolean;
}

/**
 * Git activity summary
 */
export interface GitActivity {
    commitsLast7Days: number;
    commitsLast30Days: number;
    lastCommitDate: Date | null;
    filesChangedLast7Days: string[];
    hasProductChanges: boolean;
    hasContentChanges: boolean;
}
