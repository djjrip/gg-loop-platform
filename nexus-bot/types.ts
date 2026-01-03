/**
 * NEXUS - The Sovereign Operating Intelligence for GG LOOP LLC
 * Core Type Definitions
 */

/**
 * NEXUS Supreme States - Deterministic, no vibes
 */
export type NexusState =
    | 'STABLE_AND_PRODUCING'              // 🟢 All systems go, active output
    | 'STABLE_BUT_IDLE'                   // 🟡 Platform healthy, no output
    | 'MISALIGNED_BUILDING_NO_DISTRIBUTION' // 🟠 Building but not distributing
    | 'BROKEN_PLATFORM'                   // 🔴 Infrastructure/deploy failure
    | 'BROKEN_OUTPUT_PIPELINE'            // 🔴 Output engine failure
    | 'RISKY_DRIFT';                      // 🟣 Slow degradation detected

/**
 * Auto-action that NEXUS performs without founder input
 */
export interface AutoAction {
    description: string;
    status: 'running' | 'completed' | 'skipped';
    reason?: string;
}

/**
 * Prevention upgrade - removes a class of failure
 */
export interface PreventionUpgrade {
    id: string;
    type: 'leverage' | 'efficiency';
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
}

/**
 * Innovation proposal - generated on EVERY run
 */
export interface InnovationProposal {
    leverageUpgrade: PreventionUpgrade;
    efficiencyUpgrade: PreventionUpgrade;
}

/**
 * Failure memory entry
 */
export interface FailureRecord {
    id: string;
    timestamp: Date;
    type: string;
    description: string;
    resolved: boolean;
    recurrenceCount: number;
}

/**
 * Complete NEXUS status snapshot
 */
export interface NexusStatus {
    state: NexusState;
    timestamp: Date;

    // Core reasoning
    reason: string;

    // What NEXUS is doing automatically
    autoActions: AutoAction[];

    // What founder needs to do (only if required)
    nextAction: string | null;

    // Innovation output (MANDATORY)
    innovation: InnovationProposal;

    // Prevention upgrades
    preventionUpgrades: PreventionUpgrade[];

    // Safe mode
    inSafeMode: boolean;

    // Memory
    failureMemory: FailureRecord[];
    runCount: number;
}

/**
 * Subsystem health aggregation
 */
export interface SubsystemHealth {
    frontend: { status: 'ok' | 'degraded' | 'down'; bootTime?: number };
    backend: { status: 'ok' | 'degraded' | 'down' };
    database: { status: 'ok' | 'degraded' | 'down' };
    deploy: { status: 'fresh' | 'stale' | 'failed' };
    output: { status: 'producing' | 'idle' | 'stalled' | 'misaligned' };
}

/**
 * Hardware bridge concept (design only)
 */
export interface HardwareBridgeConcept {
    name: string;
    description: string;
    leverageRatio: string;
    implementationNotes: string;
}
