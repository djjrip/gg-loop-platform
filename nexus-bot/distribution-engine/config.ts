/**
 * NEXUS Distribution Engine - Configuration
 */

export const distributionConfig = {
    // Rate limits
    twitter: {
        maxPerDay: 1,
        minHoursBetweenPosts: 12,
    },
    reddit: {
        maxPerWeek: 2,
        minHoursBetweenPosts: 72,
        subreddit: 'BuildYourVibe',
    },

    // Content rules
    content: {
        twitterMaxLength: 280,
        redditMaxLength: 10000,
        toneKeywords: ['built', 'shipped', 'fixed', 'learned', 'eliminated'],
        avoidKeywords: ['soon', 'roadmap', 'promise', 'maybe', 'hopefully'],
    },

    // Safety thresholds
    safety: {
        minDistributionScore: 50,
        requiredNexusStates: ['STABLE_AND_PRODUCING', 'STABLE_BUT_IDLE', 'MISALIGNED_BUILDING_NO_DISTRIBUTION'],
        blockedNexusStates: ['BROKEN_PLATFORM', 'BROKEN_OUTPUT_PIPELINE'],
    },

    // Output paths
    output: {
        memoryFile: './nexus-bot/distribution-engine/memory.json',
        draftsFile: './nexus-bot/distribution-engine/drafts.json',
        logFile: './nexus-bot/distribution-engine/log.json',
    },

    // Innovation features
    innovation: {
        streakBonusThreshold: 7, // Days of consistent posting
        burnoutPreventionMaxPerWeek: 5, // Max total posts per week
        builderLogArchiveEnabled: true,
    },
};
