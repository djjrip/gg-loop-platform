const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Discord Bot Configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

// API Configuration
const API_URL = process.env.GG_LOOP_API_URL || 'https://ggloop.io/api';

// Channel IDs (from .env)
const CHANNELS = {
    changelog: process.env.CHANGELOG_CHANNEL_ID,
    buildLog: process.env.BUILD_LOG_CHANNEL_ID,
    welcome: process.env.WELCOME_CHANNEL_ID,
    logs: process.env.LOGS_CHANNEL_ID,
};

// Role IDs for XP-based assignment
const ROLES = {
    rookie: process.env.ROLE_ROOKIE_ID,
    veteran: process.env.ROLE_VETERAN_ID,
    champion: process.env.ROLE_CHAMPION_ID,
    elite: process.env.ROLE_ELITE_ID,
};

// Slash Commands - Level 10
const commands = [
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Get current GG LOOP platform status'),

    new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Check your XP and level progress')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check (defaults to you)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('rewards')
        .setDescription('View available rewards and your points'),

    new SlashCommandBuilder()
        .setName('passport')
        .setDescription('View your GG LOOP Passport stats'),

    new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('View recent platform updates'),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with GG LOOP commands'),

    new SlashCommandBuilder()
        .setName('tiers')
        .setDescription('View subscription tier information'),
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
    logActivity('Bot started', 'Level 10 bot came online successfully');

    // Start changelog monitoring
    startChangelogMonitor();
});

// Slash Command Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'status') {
            const statusEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('🎮 GG LOOP Platform Status')
                .setDescription('Current platform status and metrics')
                .addFields(
                    { name: '🟢 Platform', value: 'Online', inline: true },
                    { name: '📊 Current Phase', value: 'Level 10: Achievement System', inline: true },
                    { name: '🏆 Total Endpoints', value: '39 Active', inline: true },
                    { name: '💰 Tiers Active', value: 'Free, Basic ($5), Pro ($12), Elite ($25)', inline: false },
                    { name: '🔐 Sponsor Access', value: 'Gated (10K+ verified points required)', inline: false },
                    { name: '🚀 Latest Features', value: 'XP System, Achievements, Admin Integrity Dashboard', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'GG LOOP LLC' });

            await interaction.reply({ embeds: [statusEmbed] });
            logActivity('Command: /status', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'xp') {
            const targetUser = interaction.options.getUser('user') || interaction.user;

            const xpEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle(`⚡ XP Progress - ${targetUser.username}`)
                .setDescription('Connect your account at ggloop.io to track XP')
                .addFields(
                    { name: '📊 Current Level', value: 'Connect account to view', inline: true },
                    { name: '💎 Total XP', value: 'Connect account to view', inline: true },
                    { name: '🎮 Games Played', value: 'LoL, VALORANT, TFT', inline: false },
                    { name: '🔗 Link Account', value: 'Visit ggloop.io/passport', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [xpEmbed] });
            logActivity('Command: /xp', `Used by ${interaction.user.tag} for ${targetUser.tag}`);
        }

        else if (commandName === 'rewards') {
            const rewardsEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('🎁 Available Rewards')
                .setDescription('Exchange your verified points for real rewards')
                .addFields(
                    { name: '🖱️ Razer DeathAdder V3 Pro', value: '20,000 points', inline: true },
                    { name: '🎁 Amazon Gift Card ($50)', value: '5,000 points', inline: true },
                    { name: '💰 PayPal Cash ($25)', value: '2,500 points', inline: true },
                    { name: '🎮 Riot Points (1350 RP)', value: '1,500 points', inline: true },
                    { name: '🔐 Requirements', value: 'Desktop verified + Fraud score ≤30 + Admin approval', inline: false },
                    { name: '📋 View Full Catalog', value: 'Visit ggloop.io/rewards', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [rewardsEmbed] });
            logActivity('Command: /rewards', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'passport') {
            const passportEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('🎫 GG LOOP Passport')
                .setDescription('Your verified gaming identity')
                .addFields(
                    { name: '🏆 Badge Tiers', value: 'Rookie → Veteran → Champion → Elite', inline: false },
                    { name: '📊 Stats Tracked', value: 'Points, XP Level, Trust Score, Verification History', inline: false },
                    { name: '🔒 Verification', value: 'Desktop app required for all point-earning activities', inline: false },
                    { name: '🎯 Unlock Tiers', value: '10K pts = Veteran | 25K pts = Champion | 50K pts = Elite', inline: false },
                    { name: '🔗 View Your Passport', value: 'Visit ggloop.io/passport', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [passportEmbed] });
            logActivity('Command: /passport', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'changelog') {
            const changelogEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('📢 Recent Platform Updates')
                .setDescription('Latest GG LOOP development progress')
                .addFields(
                    { name: '✅ Level 10 Phase 1+2', value: 'Achievement System + Admin Integrity Dashboard', inline: false },
                    { name: '✅ Level 9', value: 'GG LOOP Passport - User Identity System', inline: false },
                    { name: '✅ Level 8', value: 'Brand Marketplace - Tiered Sponsorship', inline: false },
                    { name: '✅ Level 7', value: 'Reward Engine - Smart Approval Flow', inline: false },
                    { name: '📋 Full Changelog', value: 'Visit ggloop.io/changelog', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [changelogEmbed] });
            logActivity('Command: /changelog', `Used by ${interaction.user.tag}`);
        }

        else if (commandName === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor('#FF7A28')
                .setTitle('❓ GG LOOP Bot Commands')
                .setDescription('Available slash commands')
                .addFields(
                    { name: '/status', value: 'Platform status and metrics', inline: true },
                    { name: '/xp', value: 'Check XP and level progress', inline: true },
                    { name: '/rewards', value: 'View available rewards', inline: true },
                    { name: '/passport', value: 'View Passport info', inline: true },
                    { name: '/changelog', value: 'Recent platform updates', inline: true },
                    { name: '/tiers', value: 'Subscription tier info', inline: true },
                    { name: '🔗 Get Started', value: 'Visit ggloop.io to create your account', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [helpEmbed] });
            logActivity('Command: /help', `Used by ${interaction.user.tag}`);
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
            { name: '🎯 Current Status', value: 'Level 10: Achievement System (Live)', inline: false },
            { name: '💰 Tiers', value: 'Free, Basic ($5), Pro ($12), Elite ($25)', inline: false },
            { name: '🏆 Latest Features', value: 'XP System, Achievements, Passport, Admin Integrity', inline: false },
            { name: '📋 Get Started', value: 'Use `/help` to see all commands\nUse `/status` to view platform status', inline: false }
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

// Helper: Post Sponsor Unlock
async function postSponsorUnlock(username, tier, points) {
    const changelogChannel = client.channels.cache.get(CHANNELS.changelog);
    if (!changelogChannel) return;

    const unlockEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🎉 Sponsor Tier Unlocked!`)
        .setDescription(`**${username}** just unlocked **${tier}** tier!`)
        .addFields(
            { name: '💎 Points', value: points.toLocaleString(), inline: true },
            { name: '🏆 Tier', value: tier, inline: true }
        )
        .setTimestamp();

    await changelogChannel.send({ embeds: [unlockEmbed] });
}

// Changelog Monitor
let lastChangelogContent = '';

function startChangelogMonitor() {
    const changelogPath = path.join(__dirname, '../GG_LOOP_Public/CHANGELOG.md');

    // Check every 5 minutes
    setInterval(() => {
        if (fs.existsSync(changelogPath)) {
            const content = fs.readFileSync(changelogPath, 'utf-8');
            if (content !== lastChangelogContent && lastChangelogContent !== '') {
                // New changelog entry detected
                const lines = content.split('\n');
                const latestEntry = lines.slice(0, 10).join('\n');
                postToChangelog(`New changelog update detected:\n\`\`\`\n${latestEntry}\n\`\`\``);
            }
            lastChangelogContent = content;
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Export functions for external use
module.exports = {
    postToChangelog,
    postSponsorUnlock,
    logActivity
};

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
