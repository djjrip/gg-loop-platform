const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Discord Bot Configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

// Channel IDs (from .env)
const CHANNELS = {
    changelog: process.env.CHANGELOG_CHANNEL_ID,
    buildLog: process.env.BUILD_LOG_CHANNEL_ID,
    welcome: process.env.WELCOME_CHANNEL_ID,
    logs: process.env.LOGS_CHANNEL_ID,
    productHunt: process.env.PRODUCT_HUNT_CHANNEL_ID,
};

// Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('ggstatus')
        .setDescription('Get current GG LOOP platform status'),

    new SlashCommandBuilder()
        .setName('roadmap')
        .setDescription('View GG LOOP roadmap (requires CEO approval)'),

    new SlashCommandBuilder()
        .setName('tiers')
        .setDescription('View subscription tier information'),

    new SlashCommandBuilder()
        .setName('howitworks')
        .setDescription('Learn how GG LOOP works'),
].map(command => command.toJSON());

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ GG LOOP Transparency Bot is online as ${client.user.tag}`);
    logActivity('Bot started', 'Bot came online successfully');
});

// Slash Command Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ggstatus') {
            const statusEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('🎮 GG LOOP Platform Status')
                .setDescription('Current platform status and metrics')
                .addFields(
                    { name: '🟢 Platform', value: 'Online', inline: true },
                    { name: '📊 Current Phase', value: 'Level 4: Verification Backbone', inline: true },
                    { name: '👥 Total Users', value: 'Pre-Launch', inline: true },
                    { name: '💰 Tiers Active', value: 'Free, Basic ($5), Pro ($12), Elite ($25)', inline: false },
                    { name: '🔐 Sponsor Access', value: 'Gated (10K+ verified points required)', inline: false },
                    { name: '🚀 Next Milestone', value: 'Desktop App Verifier (Level 5)', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'GG LOOP LLC' });

            await interaction.reply({ embeds: [statusEmbed] });
            logActivity('Command: /ggstatus', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'roadmap') {
            const roadmapEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('🗺️ GG LOOP Roadmap')
                .setDescription('**⚠️ CEO Approval Required for Public Roadmap Posts**')
                .addFields(
                    { name: '✅ Level 1-3', value: 'Core Platform, Riot Integration, Subscription System', inline: false },
                    { name: '🔄 Level 4 (Current)', value: 'Verification Backbone - In Progress', inline: false },
                    { name: '📅 Level 5', value: 'Desktop Verifier App', inline: false },
                    { name: '📅 Level 6', value: 'Mobile App', inline: false },
                    { name: '📅 Level 7', value: 'Reward Economy Engine', inline: false },
                    { name: '📅 Level 8', value: 'Creator Tools', inline: false },
                    { name: '📅 Level 9', value: 'GG LOOP Passport', inline: false },
                    { name: '📅 Level 10', value: 'Marketplace & GG LOOP OS', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Roadmap updates require manual CEO approval' });

            await interaction.reply({ embeds: [roadmapEmbed] });
            logActivity('Command: /roadmap', `Viewed by ${interaction.user.tag} (CEO approval noted)`);
        }

        else if (commandName === 'tiers') {
            const tiersEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('💎 GG LOOP Subscription Tiers')
                .setDescription('Monthly point allocations for rewards')
                .addFields(
                    { name: '🆓 Free', value: '$0/month\n100 points/month cap\n10 coins per win, 50 per 7-day streak', inline: true },
                    { name: '🥉 Basic', value: '$5/month\n3,000 points/month\n7-day free trial\nManual fulfillment', inline: true },
                    { name: '🥈 Pro', value: '$12/month\n10,000 points/month\n7-day free trial\nBonus challenges', inline: true },
                    { name: '🥇 Elite', value: '$25/month\n25,000 points/month\n3-day free trial\nPriority challenges', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Visit ggloop.io to subscribe' });

            await interaction.reply({ embeds: [tiersEmbed] });
            logActivity('Command: /tiers', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'howitworks') {
            const howItWorksEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('❓ How GG LOOP Works')
                .setDescription('Verified gameplay. Real rewards. No fluff.')
                .addFields(
                    { name: '1️⃣ Subscribe', value: 'Choose a tier (Free, Basic, Pro, Elite)', inline: false },
                    { name: '2️⃣ Play Games', value: 'Play League of Legends, VALORANT, TFT', inline: false },
                    { name: '3️⃣ Earn Points', value: 'Get monthly point allocations + gameplay bonuses', inline: false },
                    { name: '4️⃣ Verify', value: 'Desktop app validates your gameplay (Level 5)', inline: false },
                    { name: '5️⃣ Redeem', value: 'Exchange points for gaming gear, gift cards, cash', inline: false },
                    { name: '🔐 Sponsor Access', value: 'Unlock at 10K+ verified points', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Join at ggloop.io' });

            await interaction.reply({ embeds: [howItWorksEmbed] });
            logActivity('Command: /howitworks', `Used by ${interaction.user.tag}`);
        }
    } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
});

// Welcome New Members
client.on('guildMemberAdd', member => {
    const welcomeChannel = client.channels.cache.get(CHANNELS.welcome);
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#FF7A28')
        .setTitle(`Welcome to GG LOOP, ${member.user.username}! 🎮`)
        .setDescription('**PLAY. EARN. LOOP.**')
        .addFields(
            { name: '🎯 Current Status', value: 'Level 4: Verification Backbone (In Progress)', inline: false },
            { name: '💰 Tiers', value: 'Free, Basic ($5), Pro ($12), Elite ($25)', inline: false },
            { name: '🚀 Next Up', value: 'Desktop App Verifier (Level 5)', inline: false },
            { name: '📋 Get Started', value: 'Use `/ggstatus` to see platform status\nUse `/tiers` to view subscription options', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Verified gameplay. Real rewards. No fluff.' });

    welcomeChannel.send({ embeds: [welcomeEmbed] });
    logActivity('New Member', `${member.user.tag} joined the server`);
});

// Helper: Log Activity
function logActivity(action, details) {
    const logsChannel = client.channels.cache.get(CHANNELS.logs);
    if (!logsChannel) {
        console.log(`[LOG] ${action}: ${details}`);
        return;
    }

    const logEmbed = new EmbedBuilder()
        .setColor('#888888')
        .setTitle(`📝 ${action}`)
        .setDescription(details)
        .setTimestamp();

    logsChannel.send({ embeds: [logEmbed] });
}

// Helper: Post to Changelog
async function postToChangelog(message) {
    const changelogChannel = client.channels.cache.get(CHANNELS.changelog);
    if (!changelogChannel) {
        console.log(`[CHANGELOG] ${message}`);
        return;
    }

    const changelogEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📢 Platform Update')
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'GG LOOP Development Team' });

    await changelogChannel.send({ embeds: [changelogEmbed] });
    logActivity('Changelog Posted', message);
}

// Helper: Post to Build Log
async function postToBuildLog(message) {
    const buildLogChannel = client.channels.cache.get(CHANNELS.buildLog);
    if (!buildLogChannel) {
        console.log(`[BUILD LOG] ${message}`);
        return;
    }

    const buildEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔨 Build Update')
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'GG LOOP Build System' });

    await buildLogChannel.send({ embeds: [buildEmbed] });
    logActivity('Build Log Posted', message);
}

// Monitor GG_LOOP_Public directory for changes (placeholder)
// TODO: Implement file watcher for GG_LOOP_Public/CHANGELOG.md
// When file changes, auto-post to #changelog

// Product Hunt Tracker (placeholder)
// TODO: Implement Product Hunt API integration
// Track listing status and post updates to #product-hunt-feed

// Export functions for external use
module.exports = {
    postToChangelog,
    postToBuildLog,
    logActivity
};

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
