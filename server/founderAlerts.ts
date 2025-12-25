/**
 * FOUNDER ALERTS - Multi-channel notification system
 * 
 * Sends alerts through ALL available channels to ensure you NEVER miss important events.
 * Channels: SendGrid Email, Discord Webhook, Console Log
 * 
 * ENV VARS:
 * - SENDGRID_API_KEY: SendGrid API key (works immediately)
 * - DISCORD_WEBHOOK_URL: Discord webhook for instant mobile alerts
 * - ADMIN_EMAIL: Your email (default: jaysonquindao1@gmail.com)
 */

import fetch from 'node-fetch';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jaysonquindao1@gmail.com';

interface RedemptionData {
    userId: string;
    userEmail: string;
    rewardTitle: string;
    pointsSpent: number;
    realValue: number;
    category: string;
    redemptionId: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZip?: string;
    shippingCountry?: string;
}

/**
 * Send email via SendGrid (works immediately, no SES needed)
 */
async function sendViaEmail(data: RedemptionData): Promise<boolean> {
    if (!SENDGRID_KEY) {
        console.log('[Alert] SendGrid not configured, skipping email');
        return false;
    }

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
      <h1 style="color: #d4895c;">🎁 NEW REWARD REDEMPTION!</h1>
      
      <div style="background: #1a1a1a; border-left: 4px solid #d4895c; padding: 15px; margin: 20px 0;">
        <strong style="font-size: 18px;">${data.rewardTitle}</strong>
        <br><br>
        <strong>Points:</strong> ${data.pointsSpent.toLocaleString()}<br>
        <strong>Value:</strong> $${(data.realValue / 100).toFixed(2)}<br>
        <strong>Category:</strong> ${data.category}
      </div>
      
      <h3 style="color: #d4895c;">👤 User Info</h3>
      <p>
        <strong>Email:</strong> ${data.userEmail}<br>
        <strong>User ID:</strong> ${data.userId}<br>
        <strong>Redemption ID:</strong> ${data.redemptionId}
      </p>
      
      ${data.shippingAddress ? `
      <h3 style="color: #d4895c;">📦 Shipping Address</h3>
      <p>
        ${data.shippingAddress}<br>
        ${data.shippingCity || ''}, ${data.shippingState || ''} ${data.shippingZip || ''}<br>
        ${data.shippingCountry || 'US'}
      </p>
      ` : '<p><em>No shipping address (digital reward)</em></p>'}
      
      <div style="background: #1a1a1a; padding: 15px; margin-top: 20px; border-radius: 8px;">
        <strong style="color: #d4895c;">⚡ Action Required:</strong><br>
        Please fulfill this redemption and update the status.
      </div>
    </div>
  `;

    const emailPayload = {
        personalizations: [{
            to: [{ email: ADMIN_EMAIL }],
            subject: `🎁 REDEMPTION: ${data.rewardTitle} ($${(data.realValue / 100).toFixed(2)}) - ${data.userEmail}`,
        }],
        from: { email: 'info@ggloop.io', name: 'GG LOOP Alerts' },
        content: [{ type: 'text/html', value: htmlContent }]
    };

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        if (response.ok) {
            console.log(`✅ [Alert] Email sent to ${ADMIN_EMAIL}`);
            return true;
        } else {
            console.log(`❌ [Alert] Email failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ [Alert] Email error:', error);
        return false;
    }
}

/**
 * Send via Discord webhook (instant mobile notification!)
 */
async function sendViaDiscord(data: RedemptionData): Promise<boolean> {
    if (!DISCORD_WEBHOOK) {
        console.log('[Alert] Discord webhook not configured, skipping');
        return false;
    }

    const message = {
        content: `@everyone 🎁 **NEW REDEMPTION!**`,
        embeds: [{
            title: data.rewardTitle,
            color: 0xd4895c,
            fields: [
                { name: '💰 Value', value: `$${(data.realValue / 100).toFixed(2)}`, inline: true },
                { name: '⭐ Points', value: data.pointsSpent.toLocaleString(), inline: true },
                { name: '📂 Category', value: data.category, inline: true },
                { name: '📧 User Email', value: data.userEmail, inline: false },
                { name: '🆔 Redemption ID', value: data.redemptionId, inline: false },
            ],
            footer: { text: 'GG LOOP Reward System' },
            timestamp: new Date().toISOString()
        }]
    };

    if (data.shippingAddress) {
        message.embeds[0].fields.push({
            name: '📦 Shipping',
            value: `${data.shippingAddress}\n${data.shippingCity}, ${data.shippingState} ${data.shippingZip}`,
            inline: false
        });
    }

    try {
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });

        if (response.ok) {
            console.log('✅ [Alert] Discord notification sent');
            return true;
        } else {
            console.log(`❌ [Alert] Discord failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ [Alert] Discord error:', error);
        return false;
    }
}

/**
 * Log to console (always works, Railway logs capture this)
 */
function logToConsole(data: RedemptionData): void {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🎁 NEW REWARD REDEMPTION - ACTION REQUIRED!                   ║
╠════════════════════════════════════════════════════════════════╣
║  Reward: ${data.rewardTitle.padEnd(50)}║
║  Value: $${(data.realValue / 100).toFixed(2).padEnd(51)}║
║  Points: ${data.pointsSpent.toString().padEnd(51)}║
║  User: ${data.userEmail.padEnd(53)}║
║  ID: ${data.redemptionId.padEnd(55)}║
╚════════════════════════════════════════════════════════════════╝
  `);
}

/**
 * MAIN: Send alert through ALL channels
 * 
 * This ensures you NEVER miss a redemption!
 */
export async function alertFounderRedemption(data: RedemptionData): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🚨 REDEMPTION ALERT TRIGGERED`);

    // Always log to console (Railway captures this)
    logToConsole(data);

    // Try all channels in parallel
    const results = await Promise.allSettled([
        sendViaEmail(data),
        sendViaDiscord(data),
    ]);

    // Count successes
    const emailSent = results[0].status === 'fulfilled' && results[0].value;
    const discordSent = results[1].status === 'fulfilled' && results[1].value;

    console.log(`[Alert] Channels notified: Email=${emailSent}, Discord=${discordSent}, Console=true`);

    if (!emailSent && !discordSent) {
        console.error('⚠️ [CRITICAL] All external alerts failed! Check SendGrid/Discord config.');
        console.error('⚠️ Redemption logged to console only. Check Railway logs.');
    }
}

/**
 * Alert for new user signup
 */
export async function alertFounderNewUser(userEmail: string, userId: string): Promise<void> {
    console.log(`\n🎉 [Alert] NEW USER: ${userEmail} (${userId})`);

    if (DISCORD_WEBHOOK) {
        try {
            await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🎉 **New User Signup!**\n📧 ${userEmail}`,
                }),
            });
        } catch (err) {
            // Silent fail
        }
    }
}

/**
 * Alert for new subscription
 */
export async function alertFounderNewSubscription(
    userEmail: string,
    tier: string,
    amount: number
): Promise<void> {
    console.log(`\n💰 [Alert] NEW SUBSCRIPTION: ${userEmail} - ${tier} ($${amount})`);

    if (DISCORD_WEBHOOK) {
        try {
            await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `💰 **New Subscription!**\n📧 ${userEmail}\n⭐ ${tier} - $${amount}/mo`,
                }),
            });
        } catch (err) {
            // Silent fail
        }
    }

    if (SENDGRID_KEY) {
        try {
            await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SENDGRID_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: ADMIN_EMAIL }], subject: `💰 NEW SUBSCRIPTION: ${tier} - $${amount}/mo` }],
                    from: { email: 'info@ggloop.io', name: 'GG LOOP Alerts' },
                    content: [{ type: 'text/plain', value: `New subscription!\n\nUser: ${userEmail}\nTier: ${tier}\nAmount: $${amount}/mo` }]
                }),
            });
        } catch (err) {
            // Silent fail
        }
    }
}
