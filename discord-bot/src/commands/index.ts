import { Message } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function handleCommand(message: Message) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    // Check if user has permission
    if (!message.member?.permissions.has('ModerateMembers') && command !== 'help') {
        await message.reply('❌ You need Moderate Members permission to use this command.');
        return;
    }

    try {
        switch (command) {
            case 'help':
                await handleHelp(message);
                break;
            case 'ban':
                await handleBan(message, args);
                break;
            case 'timeout':
                await handleTimeout(message, args);
                break;
            case 'warn':
                await handleWarn(message, args);
                break;
            case 'clear':
                await handleClear(message, args);
                break;
            case 'stats':
                await handleStats(message);
                break;
            default:
                await message.reply(`❌ Unknown command. Use \`${config.prefix}help\` for a list of commands.`);
        }
    } catch (error) {
        logger.error(`Error executing command ${command}:`, error);
        await message.reply('❌ An error occurred while executing that command.');
    }
}

async function handleHelp(message: Message) {
    const helpText = `
**GG LOOP Bot Commands**

\`${config.prefix}help\` - Show this help message
\`${config.prefix}ban @user [reason]\` - Permanently ban a user
\`${config.prefix}timeout @user <minutes> [reason]\` - Timeout a user
\`${config.prefix}warn @user [reason]\` - Issue a warning
\`${config.prefix}clear <number>\` - Delete last N messages
\`${config.prefix}stats\` - Show server stats
  `;

    await message.reply(helpText);
}

async function handleBan(message: Message, args: string[]) {
    const userMention = message.mentions.users.first();
    if (!userMention) {
        await message.reply('❌ Please mention a user to ban.');
        return;
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const member = message.guild?.members.cache.get(userMention.id);

    if (!member) {
        await message.reply('❌ User not found in this server.');
        return;
    }

    if (!member.bannable) {
        await message.reply('❌ I cannot ban this user (insufficient permissions).');
        return;
    }

    await member.ban({ reason });
    await message.reply(`✅ Banned ${userMention.tag} - Reason: ${reason}`);
    logger.warn(`🔨 ${message.author.tag} banned ${userMention.tag}: ${reason}`);
}

async function handleTimeout(message: Message, args: string[]) {
    const userMention = message.mentions.users.first();
    if (!userMention) {
        await message.reply('❌ Please mention a user to timeout.');
        return;
    }

    const minutes = parseInt(args[1]);
    if (isNaN(minutes) || minutes < 1) {
        await message.reply('❌ Please provide a valid number of minutes.');
        return;
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const member = message.guild?.members.cache.get(userMention.id);

    if (!member) {
        await message.reply('❌ User not found in this server.');
        return;
    }

    await member.timeout(minutes * 60 * 1000, reason);
    await message.reply(`✅ Timed out ${userMention.tag} for ${minutes} minutes - Reason: ${reason}`);
    logger.warn(`⏱️  ${message.author.tag} timed out ${userMention.tag} for ${minutes}min: ${reason}`);
}

async function handleWarn(message: Message, args: string[]) {
    const userMention = message.mentions.users.first();
    if (!userMention) {
        await message.reply('❌ Please mention a user to warn.');
        return;
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    await userMention.send(`⚠️ You received a warning in ${message.guild?.name}: ${reason}`);
    await message.reply(`✅ Warned ${userMention.tag}`);
    logger.warn(`⚠️  ${message.author.tag} warned ${userMention.tag}: ${reason}`);
}

async function handleClear(message: Message, args: string[]) {
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1 || count > 100) {
        await message.reply('❌ Please provide a number between 1 and 100.');
        return;
    }

    if (!message.channel.isTextBased() || message.channel.isDMBased()) {
        return;
    }

    const messages = await message.channel.messages.fetch({ limit: count + 1 });
    await message.channel.bulkDelete(messages);

    const reply = await message.channel.send(`✅ Deleted ${count} messages.`);
    setTimeout(() => reply.delete(), 3000);
    logger.info(`🗑️  ${message.author.tag} cleared ${count} messages`);
}

async function handleStats(message: Message) {
    if (!message.guild) return;

    const stats = `
**${message.guild.name} Stats**

👥 Total Members: ${message.guild.memberCount}
📝 Channels: ${message.guild.channels.cache.size}
🎭 Roles: ${message.guild.roles.cache.size}
📅 Created: ${message.guild.createdAt.toLocaleDateString()}
  `;

    await message.reply(stats);
}
