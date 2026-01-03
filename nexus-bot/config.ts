/**
 * NEXUS - Configuration
 * All governance rules in one place
 */

export const nexusConfig = {
    // State classification thresholds
    thresholds: {
        stagnationDays: 3,        // Days without meaningful output before concern
        criticalStagnation: 7,    // Days before BROKEN_OUTPUT_PIPELINE
        bootTimeoutMs: 2000,      // Frontend MUST render in 2 seconds
        staleDeployMinutes: 60,   // Deploy freshness threshold
    },

    // Output paths
    output: {
        statusFile: './nexus-bot/nexus-status.json',
        statusMarkdown: './nexus-bot/NEXUS_STATUS.md',
        memoryFile: './nexus-bot/memory.json',
        innovationLog: './nexus-bot/innovation-log.json',
    },

    // Safe mode triggers
    safeModeConditions: [
        'BROKEN_PLATFORM',
        'BROKEN_OUTPUT_PIPELINE',
    ],

    // Innovation catalog - prevents duplicate proposals
    innovationCategories: {
        leverage: [
            'auto-recovery',
            'monitoring',
            'deployment',
            'testing',
            'documentation',
            'caching',
            'error-handling',
        ],
        efficiency: [
            'build-speed',
            'startup-time',
            'code-quality',
            'developer-experience',
            'observability',
            'automation',
        ],
    },

    // Hardware bridge concept (design only)
    hardwareBridge: {
        name: 'NEXUS Beacon',
        description: 'Physical LED indicator on founder desk showing NEXUS state',
        colors: {
            STABLE_AND_PRODUCING: 'green',
            STABLE_BUT_IDLE: 'yellow',
            MISALIGNED_BUILDING_NO_DISTRIBUTION: 'orange',
            BROKEN_PLATFORM: 'red-flash',
            BROKEN_OUTPUT_PIPELINE: 'red',
            RISKY_DRIFT: 'purple-pulse',
        },
        leverageRatio: '1:∞ (infinite glanceability)',
        implementationNotes: 'ESP32 + WS2812 LED strip + simple HTTP endpoint polling',
    },
};
