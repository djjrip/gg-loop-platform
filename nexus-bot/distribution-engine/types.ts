/**
 * NEXUS Autonomous Distribution Engine - Core Types
 */

/**
 * Distribution channels
 */
export type DistributionChannel = 'twitter' | 'reddit';

/**
 * Signal types that trigger distribution
 */
export type SignalType =
    | 'new_deploy'
    | 'feature_shipped'
    | 'failure_resolved'
    | 'innovation_executed'
    | 'milestone_reached'
    | 'system_insight';

/**
 * Detected signal from internal systems
 */
export interface DistributionSignal {
    type: SignalType;
    title: string;
    description: string;
    timestamp: Date;
    proof?: string; // URL or artifact path
    priority: 'low' | 'medium' | 'high';
}

/**
 * Content draft for posting
 */
export interface ContentDraft {
    channel: DistributionChannel;
    content: string;
    title?: string; // For Reddit
    subreddit?: string; // For Reddit
    proof?: string;
    signal: DistributionSignal;
    createdAt: Date;
}

/**
 * Posting record for deduplication and tracking
 */
export interface PostRecord {
    id: string;
    channel: DistributionChannel;
    content: string;
    signalType: SignalType;
    postedAt: Date;
    success: boolean;
    error?: string;
}

/**
 * Distribution memory
 */
export interface DistributionMemory {
    lastTwitterPost: Date | null;
    lastRedditPost: Date | null;
    postHistory: PostRecord[];
    postingStreak: number;
    totalPosts: number;
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
    canPost: boolean;
    reason?: string;
}
