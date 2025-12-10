export const config = {
    // Bot settings
    prefix: process.env.BOT_PREFIX || '!',
    ceoId: process.env.DISCORD_CEO_ID || '',
    guildId: process.env.DISCORD_GUILD_ID || '',

    // Channel IDs
    channels: {
        log: process.env.LOG_CHANNEL_ID || '',
        welcome: process.env.WELCOME_CHANNEL_ID || '',
        leaderboard: process.env.LEADERBOARD_CHANNEL_ID || '',
    },

    // Auto-moderation settings
    autoMod: {
        enabled: process.env.AUTO_MOD_ENABLED === 'true',
        spamDetection: process.env.SPAM_DETECTION_ENABLED === 'true',
        welcomeDM: process.env.WELCOME_DM_ENABLED === 'true',
    },

    // Rate limits
    rateLimits: {
        maxMessagesPerTenSeconds: parseInt(process.env.MAX_MESSAGES_PER_10_SECONDS || '5'),
        maxMatchesPerDay: parseInt(process.env.MAX_MATCHES_PER_DAY || '20'),
    },

    // Spam detection
    spam: {
        maxRepeatedChars: 5,
        maxLinksPerMessage: 3,
        warningThreshold: 3,
    },

    // Punishment tiers
    punishment: {
        tier1: { action: 'warn', duration: 0 },
        tier2: { action: 'timeout', duration: 5 * 60 * 1000 }, // 5 minutes
        tier3: { action: 'timeout', duration: 60 * 60 * 1000 }, // 1 hour
        tier4: { action: 'ban', duration: 24 * 60 * 60 * 1000 }, // 24 hours
        tier5: { action: 'ban', duration: 0 }, // Permanent
    },

    // Whitelisted domains
    whitelist: [
        'ggloop.io',
        'twitter.com',
        'tiktok.com',
        'linkedin.com',
        'discord.gg/Ny7ATHrh',
    ],

    // Role names
    roles: {
        member: 'Member',
        verified: 'Verified',
        pro: 'Pro',
        elite: 'Elite',
        founderBadge: 'Founder Badge',
    },

    // GG LOOP API
    api: {
        baseUrl: process.env.GG_LOOP_API_URL || 'https://ggloop.io/api',
        wsUrl: process.env.GG_LOOP_WS_URL || 'wss://ggloop.io/ws',
    },
};
