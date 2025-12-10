import { GuildMember, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function handleGuildMemberAdd(member: GuildMember) {
    logger.info(`👋 New member joined: ${member.user.tag}`);

    try {
        // Auto-assign Member role
        const memberRole = member.guild.roles.cache.find(r => r.name === config.roles.member);
        if (memberRole) {
            await member.roles.add(memberRole);
            logger.success(`✅ Assigned @${config.roles.member} role to ${member.user.tag}`);
        } else {
            logger.warn(`⚠️  @${config.roles.member} role not found in guild`);
        }

        // Send welcome DM if enabled
        if (config.autoMod.welcomeDM) {
            await sendWelcomeDM(member);
        }

        // Post in welcome channel  
        if (config.channels.welcome) {
            const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
            if (welcomeChannel && welcomeChannel.isTextBased()) {
                await welcomeChannel.send(`Welcome <@${member.id}>! 🎮`);
            }
        }

    } catch (error) {
        logger.error(`Failed to process new member ${member.user.tag}:`, error);
    }
}

async function sendWelcomeDM(member: GuildMember) {
    try {
        const embed = new EmbedBuilder()
            .setColor(0xFF6B35) // GG LOOP orange
            .setTitle('👋 Welcome to GG LOOP')
            .setDescription('Where every match matters.')
            .addFields(
                { name: '1️⃣ Read the Rules', value: 'Check out #how-it-works to understand the platform' },
                { name: '2️⃣ Get Verified', value: 'Post your payment proof in #verify-access to unlock features' },
                { name: '3️⃣ Log Your Wins', value: 'Share your victories in #log-your-wins' },
                { name: '4️⃣ Climb the Leaderboard', value: 'Compete with the community in #leaderboard 🔥' }
            )
            .setFooter({ text: 'Built from the culture, for the culture • ggloop.io' })
            .setTimestamp();

        await member.send({ embeds: [embed] });
        logger.success(`📧 Sent welcome DM to ${member.user.tag}`);
    } catch (error) {
        logger.warn(`⚠️  Could not send welcome DM to ${member.user.tag} (DMs might be closed)`);
    }
}
