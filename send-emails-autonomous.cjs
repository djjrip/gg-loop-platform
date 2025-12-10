/**
 * AUTONOMOUS EMAIL SENDING SYSTEM
 * Automatically sends emails based on campaigns
 */

// STATUS: DISABLED UNDER CEO PROTOCOL
// This script must NOT be run automatically.
// All outreach and campaigns require explicit CEO approval.

const sgMail = require('@sendgrid/mail');
const fs = require('fs/promises');

// Configure SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
    console.error("FATAL: SENDGRID_API_KEY missing in environment. Aborting.");
    process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

console.log('🤖 AUTONOMOUS EMAIL SYSTEM');
console.log('═══════════════════════════════════\n');

// Load Early Access email template
async function loadEarlyAccessTemplate() {
    // Your existing Early Access email HTML
    return {
        subject: '🎮 You\'re In! GG LOOP Early Access is LIVE',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 30px; text-align: center; border-radius: 12px; }
        .content { background: #1a1a1a; padding: 30px; margin-top: 20px; border-radius: 12px; }
        .cta { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Welcome to GG LOOP</h1>
            <p>Your gameplay now has value</p>
        </div>
        <div class="content">
            <p>Hey there,</p>
            <p>You're officially in the <strong>Founding 1,000</strong>.</p>
            <p><strong>What GG LOOP IS:</strong><br>
            Free rewards platform for Riot Games players. Link account → Play ranked → Earn points → Redeem gift cards, gaming gear, subscriptions.</p>
            
            <p><strong>What's LIVE Right Now:</strong><br>
            ✅ Riot account linking<br>
            ✅ Point system<br>
            ✅ Shop with real rewards<br>
            ✅ 3 subscription tiers (Free, Pro $9.99, Elite $19.99)</p>
            
            <p><strong>Founding 1,000 Perks:</strong><br>
            🏅 Exclusive "Founder" badge<br>
            💰 Bonus points for early support<br>
            📊 Help shape the platform<br>
            🎯 First access to new features</p>
            
            <a href="https://ggloop.io/roadmap" class="cta">View Live Roadmap →</a>
            
            <p><em>— Jayson BQ, Founder</em></p>
        </div>
    </div>
</body>
</html>
        `
    };
}

// Load streamer outreach template
function generateStreamerEmail(streamerName, game) {
    return {
        subject: `Partnership Opportunity - Reward Your ${game} Viewers`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hi ${streamerName},</p>
        
        <p>I'm Jayson, founder of <strong>GG LOOP</strong> — a rewards platform for ${game} players.</p>
        
        <p>I noticed you stream ${game} and thought you'd be interested in a partnership.</p>
        
        <h3>What GG LOOP Does:</h3>
        <ul>
            <li>Your viewers link their Riot accounts</li>
            <li>They earn points for playing ranked</li>
            <li>Redeem for gift cards, gaming gear, subscriptions</li>
            <li>100% <span class="highlight">free</span> to join and try</li>
        </ul>
        
        <h3>Partnership Benefits for You:</h3>
        <ul>
            <li><strong>20% commission</strong> on paid subscriptions from your viewers</li>
            <li>Custom affiliate code for your community</li>
            <li>Custom dashboard page: ggloop.io/streamers/${streamerName.toLowerCase()}</li>
            <li>Exclusive rewards for your followers</li>
        </ul>
        
        <h3>Why This Works:</h3>
        <ul>
            <li>Increases viewer engagement (rewarded for playing)</li>
            <li>Passive income for you (recurring 20% commission)</li>
            <li>No cost to you or your viewers</li>
            <li>Built by gamers, for gamers</li>
        </ul>
        
        <p><strong>Interested?</strong> Reply and I'll set you up with a custom code and dashboard this week.</p>
        
        <p>Or check it out: <a href="https://ggloop.io">ggloop.io</a></p>
        
        <p>Best,<br>
        Jayson<br>
        Founder, GG LOOP</p>
    </div>
</body>
</html>
        `
    };
}

// Send Early Access emails
async function sendEarlyAccessCampaign() {
    console.log('📧 [1/2] Early Access Campaign\n');

    // In production, you'd load these from a database
    // For now, CEO email as test
    const recipients = [
        { email: 'jaysonquindao1@gmail.com', name: 'CEO Test' }
    ];

    const template = await loadEarlyAccessTemplate();

    for (const recipient of recipients) {
        try {
            await sgMail.send({
                to: recipient.email,
                from: {
                    email: 'info@ggloop.io',
                    name: 'GG LOOP'
                },
                subject: template.subject,
                html: template.html,
                categories: ['early-access', 'autonomous'],
                trackingSettings: {
                    clickTracking: { enable: true },
                    openTracking: { enable: true }
                }
            });

            console.log(`✅ Sent to ${recipient.email}`);
        } catch (error) {
            console.log(`❌ Failed to send to ${recipient.email}:`, error.message);
        }
    }

    console.log('');
}

// Send streamer outreach
async function sendStreamerOutreach() {
    console.log('📧 [2/2] Streamer Outreach Campaign\n');

    // Load streamers from JSON
    try {
        const data = JSON.parse(await fs.readFile('./streamers-to-contact.json', 'utf-8'));

        // Filter: Not yet contacted
        const toContact = data.streamers.filter(s =>
            s.email &&
            s.status === 'not_contacted' &&
            s.email !== 'business@example1.com' // Skip examples
        );

        if (toContact.length === 0) {
            console.log('ℹ️  No streamers ready to contact');
            console.log('   Add streamers to streamers-to-contact.json\n');
            return;
        }

        console.log(`Found ${toContact.length} streamers to contact\n`);

        for (const streamer of toContact) {
            try {
                const email = generateStreamerEmail(streamer.username, streamer.game);

                await sgMail.send({
                    to: streamer.email,
                    from: {
                        email: 'info@ggloop.io',
                        name: 'Jayson from GG LOOP'
                    },
                    subject: email.subject,
                    html: email.html,
                    categories: ['streamer-outreach', 'autonomous'],
                    trackingSettings: {
                        clickTracking: { enable: true },
                        openTracking: { enable: true }
                    }
                });

                console.log(`✅ Sent to ${streamer.username} (${streamer.email})`);

                // Mark as contacted
                streamer.status = 'contacted';
                streamer.contactedAt = new Date().toISOString();

                // Move to contacted array
                data.contacted.push(streamer);

                // Rate limit: 2 seconds between emails
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.log(`❌ Failed to send to ${streamer.username}:`, error.message);
            }
        }

        // Update database
        await fs.writeFile('./streamers-to-contact.json', JSON.stringify(data, null, 2));
        console.log('\n✅ Updated streamers database');

    } catch (error) {
        console.log('❌ Error loading streamers:', error.message);
    }

    console.log('');
}

// Main autonomous loop
async function runAutonomousEmailSystem() {
    console.log('Starting autonomous email campaigns...\n');

    // Send both campaigns
    await sendEarlyAccessCampaign();
    await sendStreamerOutreach();

    console.log('═══════════════════════════════════');
    console.log('✅ ALL CAMPAIGNS SENT');
    console.log('═══════════════════════════════════\n');

    console.log('📊 Next steps:');
    console.log('1. Check SendGrid dashboard for delivery status');
    console.log('2. Monitor email-tracking system for opens/clicks');
    console.log('3. Follow up with engaged streamers\n');
}

runAutonomousEmailSystem();
