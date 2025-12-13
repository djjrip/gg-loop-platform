import { MessageReaction, User } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function handleMessageReactionAdd(reaction: MessageReaction, user: User) {
    // Ignore bot reactions
    if (user.bot) return;

    try {
        // Partial reactions need to be fetched
        if (reaction.partial) {
            await reaction.fetch();
        }

        const channelName = reaction.message.channel && 'name' in reaction.message.channel
            ? reaction.message.channel.name
            : '';

        // Auto-verify in #verify-access
        if (channelName === 'verify-access' && reaction.emoji.name === '✅') {
            await handleVerificationReaction(reaction, user);
        }

    } catch (error) {
        logger.error(`Error handling reaction:`, error);
    }
}

async function handleVerificationReaction(reaction: MessageReaction, user: User) {
    try {
        // Only moderators can verify
        const member = reaction.message.guild?.members.cache.get(user.id);
        if (!member || !member.permissions.has('ModerateMembers')) {
            return;
        }

        // Get the message author
        const messageAuthor = reaction.message.author;
        if (!messageAuthor) return;

        const authorMember = reaction.message.guild?.members.cache.get(messageAuthor.id);
        if (!authorMember) return;

        // Assign Verified role
        const verifiedRole = reaction.message.guild?.roles.cache.find(r => r.name === config.roles.verified);
        if (verifiedRole) {
            await authorMember.roles.add(verifiedRole);
            logger.success(`✅ ${user.tag} verified ${messageAuthor.tag}`);

            // Notify the verified user
            await messageAuthor.send(`✅ You've been verified in GG LOOP! You now have access to all channels.`);
        }

    } catch (error) {
        logger.error(`Failed to process verification:`, error);
    }
}
