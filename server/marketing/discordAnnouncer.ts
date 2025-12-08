/**
 * Discord Auto-Announcer
 * Posts to Discord servers via webhooks
 * 
 * Setup:
 * 1. Create webhook in Discord server: Server Settings → Integrations → Webhooks
 * 2. Add URLs to .env:
 *    DISCORD_WEBHOOK_1=https://discord.com/api/webhooks/...
 *    DISCORD_WEBHOOK_2=https://discord.com/api/webhooks/...
 * 
 * Usage: node server/marketing/discordAnnouncer.js
 */

import fetch from 'node-fetch';

interface DiscordMessage {
    title: string;
    description: string;
    color: number; // Decimal color code
    fields?: { name: string; value: string }[];
}

const ANNOUNCEMENTS: DiscordMessage[] = [
    {
        title: '🎮 GG LOOP - Gaming Rewards Platform',
        description: 'Earn real rewards just for gaming. Free to join!',
        color: 0xFF7A28, // Orange
        fields: [
            { name: '💰 How It Works', value: 'Connect accounts → Win matches → Get points → Redeem rewards' },
            { name: '🎁 Rewards', value: 'Gift cards, gaming merch, exclusive perks' },
            { name: '🔗 Join Now', value: 'https://ggloop.io' },
        ],
    },
    {
        title: '👥 Referral Bonuses Live!',
        description: 'Bring your squad, earn massive bonus points',
        color: 0xE91E63, // Pink
        fields: [
            { name: '3 Friends in 7 days', value: '200 bonus points' },
            { name: '5 Friends in 14 days', value: '500 bonus points' },
            { name: '10 Friends in 30 days', value: '1,500 bonus points' },
            { name: '🔗 Your Code', value: 'Get yours at: https://ggloop.io/referrals' },
        ],
    },
];

/**
 * Send Discord webhook
 */
async function sendWebhook(webhookUrl: string, message: DiscordMessage): Promise<boolean> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [
                    {
                        title: message.title,
                        description: message.description,
                        color: message.color,
                        fields: message.fields,
                        footer: {
                            text: 'GG LOOP - Play. Earn. Loop.',
                        },
                    },
                ],
            }),
        });

        if (response.ok) {
            console.log('✅ Discord webhook sent');
            return true;
        } else {
            console.error('❌ Discord webhook failed:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending Discord webhook:', error);
        return false;
    }
}

/**
 * Announce to all Discord servers
 */
async function announceToDiscord() {
    console.log('📢 Sending Discord announcements...');

    const webhooks = [
        process.env.DISCORD_WEBHOOK_1,
        process.env.DISCORD_WEBHOOK_2,
        process.env.DISCORD_WEBHOOK_3,
    ].filter(Boolean);

    if (webhooks.length === 0) {
        console.error('❌ No Discord webhooks configured');
        return;
    }

    // Rotate announcements (alternate each run)
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const message = ANNOUNCEMENTS[weekNumber % ANNOUNCEMENTS.length];

    let sent = 0;

    for (const webhook of webhooks) {
        if (webhook) {
            const success = await sendWebhook(webhook, message);
            if (success) sent++;

            // Wait 2 seconds between webhooks (rate limiting)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`✅ Sent to ${sent}/${webhooks.length} Discord servers`);
}

// Run if called directly
if (require.main === module) {
    announceToDiscord()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { announceToDiscord };
