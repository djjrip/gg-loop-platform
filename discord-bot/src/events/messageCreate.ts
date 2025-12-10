import { Message } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';
import { detectSpam } from '../moderation/spam-detector';
import { checkContent } from '../moderation/content-filter';
import { handleCommand } from '../commands';

export async function handleMessageCreate(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore DMs
    if (!message.guild) return;

    try {
        // Handle commands
        if (message.content.startsWith(config.prefix)) {
            await handleCommand(message);
            return;
        }

        // Auto-moderation (if enabled)
        if (config.autoMod.enabled && config.autoMod.spamDetection) {
            // Check for spam
            const spamResult = await detectSpam(message);
            if (spamResult.isSpam) {
                await message.delete();
                logger.warn(`🚫 Deleted spam message from ${message.author.tag}: ${spamResult.reason}`);
                return;
            }

            // Check content
            const contentResult = await checkContent(message);
            if (contentResult.violates) {
                await message.delete();
                logger.warn(`🚫 Deleted message from ${message.author.tag}: ${contentResult.reason}`);

                // Punish based on severity
                if (contentResult.severity === 'high') {
                    await handleHighSeverityViolation(message);
                } else if (contentResult.severity === 'medium') {
                    await handleMediumSeverityViolation(message);
                }
                return;
            }
        }

        // Auto-reactions for special channels
        await handleAutoReactions(message);

    } catch (error) {
        logger.error(`Error processing message from ${message.author.tag}:`, error);
    }
}

async function handleHighSeverityViolation(message: Message) {
    try {
        if (!message.member) return;

        // Timeout for 1 hour
        await message.member.timeout(60 * 60 * 1000, 'High severity content violation');
        logger.warn(`⏱️  Timed out ${message.author.tag} for 1 hour (high severity violation)`);

        // Alert CEO
        const ceo = await message.client.users.fetch(config.ceoId);
        await ceo.send(`🚨 High severity violation by ${message.author.tag} in ${message.guild?.name}`);
    } catch (error) {
        logger.error(`Failed to handle high severity violation:`, error);
    }
}

async function handleMediumSeverityViolation(message: Message) {
    try {
        if (!message.member) return;

        // Timeout for 5 minutes
        await message.member.timeout(5 * 60 * 1000, 'Medium severity content violation');
        logger.warn(`⏱️  Timed out ${message.author.tag} for 5 minutes (medium severity violation)`);
    } catch (error) {
        logger.error(`Failed to handle medium severity violation:`, error);
    }
}

async function handleAutoReactions(message: Message) {
    try {
        const channelName = message.channel && 'name' in message.channel ? message.channel.name : '';

        // Auto-react in #log-your-wins
        if (channelName === 'log-your-wins') {
            await message.react('🎮');
        }

        // Special keywords
        const content = message.content.toLowerCase();
        if (content.includes('clutch') || content.includes('ace')) {
            await message.react('🔥');
        }
        if (content.includes('ranked up')) {
            await message.react('💯');
        }
    } catch (error) {
        logger.debug(`Could not add auto-reaction:`, error);
    }
}
