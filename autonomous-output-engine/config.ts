/**
 * GG LOOP Autonomous Output Engine - Configuration
 */

export const aoeConfig = {
    // Thresholds for state classification
    thresholds: {
        idleDaysWarning: 3,      // Warn if no output for 3 days
        stalledDays: 7,          // STALLED if no output for 7 days
        misalignedRatio: 0.8,    // MISALIGNED if 80%+ output is non-growth
    },

    // Output paths
    output: {
        statusFile: './autonomous-output-engine/output-status.json',
        statusMarkdown: './autonomous-output-engine/AUTONOMOUS_OUTPUT_STATUS.md',
    },

    // What counts as meaningful output by category
    productIndicators: [
        'client/src/pages/',
        'client/src/components/',
        'server/routes',
        'shared/schema.ts',
    ],

    contentIndicators: [
        '.md',
        'Home.tsx',
        'Landing',
        'copy',
    ],

    growthIndicators: [
        'twitter',
        'social',
        'marketing',
        'outreach',
        'email',
    ],

    businessIndicators: [
        'paypal',
        'subscription',
        'partner',
        'sponsor',
        'revenue',
    ],
};
