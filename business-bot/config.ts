/**
 * GG LOOP Business Bot - Configuration
 * All configurable values in one place
 */

export const config = {
    // Health check endpoints
    production: {
        baseUrl: process.env.PRODUCTION_URL || 'https://ggloop.io',
        healthEndpoint: '/api/health',
    },

    // GitHub integration
    github: {
        owner: 'ggloopllc',
        repo: 'gg-loop-platform',
        branch: 'main',
    },

    // Thresholds
    thresholds: {
        staleDeployMinutes: 30, // Flag if commit pushed > 30 min ago but not deployed
        stalenessWarningDays: 3, // Warn if no activity for 3 days
        stalenessCriticalDays: 7, // Critical if no activity for 7 days
    },

    // Output paths
    output: {
        statusFile: './business-bot/status.json',
        statusMarkdown: './business-bot/STATUS.md',
    },

    // Founder notification hooks (design only, not wired)
    notifications: {
        discordWebhook: process.env.DISCORD_FOUNDER_WEBHOOK_URL || null,
        emailAlert: process.env.FOUNDER_ALERT_EMAIL || null,
    },
};
