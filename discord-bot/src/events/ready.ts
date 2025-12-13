import { Client } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function handleReady(client: Client) {
    if (!client.user) return;

    logger.success(`🤖 Bot logged in as ${client.user.tag}`);
    logger.info(`📊 Serving ${client.guilds.cache.size} server(s)`);
    logger.info(`👥 Monitoring ${client.users.cache.size} user(s)`);

    // Set bot presence
    client.user.setPresence({
        activities: [{ name: 'GG LOOP • ggloop.io', type: 3 }], // Type 3 = Watching
        status: 'online',
    });

    // Verify guild access
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
        logger.error(`❌ Bot is not in the configured guild (ID: ${config.guildId})`);
        logger.error('Please invite the bot to your server first!');
        return;
    }

    logger.success(`✅ Connected to guild: ${guild.name}`);
    logger.info(`📝 Member count: ${guild.memberCount}`);

    // Log channel availability
    if (config.channels.log) {
        const logChannel = guild.channels.cache.get(config.channels.log);
        if (logChannel) {
            logger.success(`✅ Log channel found: #${logChannel.name}`);
        } else {
            logger.warn(`⚠️  Log channel not found (ID: ${config.channels.log})`);
        }
    }

    logger.success('🚀 GG LOOP Discord Bot is READY!');
}
