/**
 * COMPLETE AFFILIATE OUTREACH AUTOMATION
 * End-to-end: Find streamers → Get emails → Send partnership offers
 * Zero manual work required
 */

import { findTwitchEmail } from './twitchEmailScraper';
import fetch from 'node-fetch';

interface StreamerTarget {
    username: string;
    game: string;
    avgViewers: number;
}

interface OutreachResult {
    username: string;
    email: string | null;
    sent: boolean;
    reason?: string;
}

// ============================================
// 1. AFFILIATE EMAIL TEMPLATE (NEW PROGRAM)
// ============================================

function generateAffiliateEmail(streamerName: string, game: string): {
    subject: string;
    html: string;
    text: string;
} {
    const subject = `New Affiliate Program - Reward Your ${game} Viewers`;

    const text = `Hi ${streamerName},

I'm Jayson, founder of GG LOOP LLC - we just launched a new affiliate program for ${game} streamers.

WHAT WE DO:
Your viewers link their Riot accounts, play ranked, earn points, and redeem real rewards (gift cards, gaming gear, subscriptions).

NEW AFFILIATE PROGRAM (Just Launched):
✅ 20% recurring commission on every paid subscription
✅ Custom code for your community
✅ Branded dashboard: ggloop.io/streamers/${streamerName.toLowerCase()}
✅ Exclusive bonus points for your viewers (500 points head start)
✅ Monthly payouts via Stripe

WHY PARTNER WITH US:
- Passive income for you (recurring 20% commission)
- Increases viewer engagement (they're rewarded for playing)
- No cost to you or your viewers
- Built ethically - transparent, no crypto/NFTs
- New program means you're an early partner (better terms)

THE GG LOOP MOVEMENT:
GG LOOP isn't just another rewards platform - it's a movement to heal the inner gamer.

Built by a Filipino-American founder who felt invisible in the gaming industry, GG LOOP stands for:
• Anti-Exploitation: No predatory mechanics, no gambling, no pay-to-win
• Transparency: Clear pricing, honest rewards, no hidden fees
• Community First: Gamers > profits in every decision
• Fair Value: Your time playing should mean something

We believe gaming should be respected, not exploited. Every ranked game, every improvement, every hour you grind - it deserves recognition.

This affiliate program is brand new because we're building this movement together. You'd be one of our founding partners, helping shape what ethical gaming rewards look like.

INTERESTED?
Reply with "Yes" and I'll set you up with your custom code and dashboard this week.

Check us out: https://ggloop.io

Best,
Jayson Quindao
Founder, GG LOOP LLC
contact@ggloop.io

---
P.S. - As a new program, we're offering founding affiliates 25% commission for the first 3 months (instead of 20%). Early advantage for early partners.

[Unsubscribe: Click here if you're not interested]`;

    const html = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #FF6B35;">New Affiliate Program - ${game} Streamers</h2>
  
  <p>Hi ${streamerName},</p>
  
  <p>I'm Jayson, founder of <strong>GG LOOP LLC</strong> - we just launched a new affiliate program for ${game} streamers.</p>
  
  <h3 style="color: #004E89;">What We Do:</h3>
  <p>Your viewers link their Riot accounts, play ranked, earn points, and redeem real rewards (gift cards, gaming gear, subscriptions).</p>
  
  <h3 style="color: #004E89;">New Affiliate Program (Just Launched):</h3>
  <ul>
    <li>✅ <strong>20% recurring commission</strong> on every paid subscription</li>
    <li>✅ Custom code for your community</li>
    <li>✅ Branded dashboard: ggloop.io/streamers/${streamerName.toLowerCase()}</li>
    <li>✅ Exclusive bonus points for your viewers</li>
    <li>✅ Monthly payouts via Stripe</li>
  </ul>
  
  <h3 style="color: #004E89;">Why Partner With Us:</h3>
  <ul>
    <li>Passive income (recurring 20% commission)</li>
    <li>Increases viewer engagement</li>
    <li>No cost to you or viewers</li>
    <li>Built ethically - transparent, no crypto/NFTs</li>
    <li><strong>New program = founding affiliate status</strong></li>
  </ul>
  
  <h3 style="color: #004E89;">The GG LOOP Movement:</h3>
  <p>GG LOOP isn't just another rewards platform - <strong>it's a movement to heal the inner gamer.</strong></p>
  
  <p>Built by a Filipino-American founder who felt invisible in the gaming industry, GG LOOP stands for:</p>
  <ul>
    <li><strong>Anti-Exploitation:</strong> No predatory mechanics, no gambling, no pay-to-win</li>
    <li><strong>Transparency:</strong> Clear pricing, honest rewards, no hidden fees</li>
    <li><strong>Community First:</strong> Gamers > profits in every decision</li>
    <li><strong>Fair Value:</strong> Your time playing should mean something</li>
  </ul>
  
  <p>We believe gaming should be <em>respected</em>, not exploited. Every ranked game, every improvement, every hour you grind - it deserves recognition.</p>
  
  <p><strong>This affiliate program is brand new</strong> because we're building this movement together. You'd be one of our founding partners, helping shape what ethical gaming rewards look like.</p>
  
  <div style="background: #F7F7F7; padding: 15px; border-left: 4px solid #FF6B35; margin: 20px 0;">
    <strong>🎁 Founding Affiliate Bonus:</strong><br>
    First affiliates get <strong>25% commission for 3 months</strong> (instead of 20%). Early advantage for early partners.
  </div>
  
  <p><strong>Interested?</strong><br>
  Reply with "Yes" and I'll set you up this week.</p>
  
  <p>Check us out: <a href="https://ggloop.io" style="color: #FF6B35;">ggloop.io</a></p>
  
  <p>Best,<br>
  Jayson Quindao<br>
  Founder, GG LOOP LLC<br>
  <a href="mailto:contact@ggloop.io">contact@ggloop.io</a></p>
  
  <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
  <p style="font-size: 12px; color: #888;">
    GG LOOP LLC • Ethical Gaming Rewards Platform<br>
    <a href="#" style="color: #888;">Unsubscribe</a> if you're not interested
  </p>
</body>
</html>
  `.trim();

    return { subject, html, text };
}

// ============================================
// 2. EMAIL SENDING (SendGrid)
// ============================================

async function sendEmailViaSendGrid(
    to: string,
    subject: string,
    html: string,
    text: string
): Promise<boolean> {
    const SENDGRID_KEY = process.env.SENDGRID_API_KEY;

    if (!SENDGRID_KEY) {
        console.log(`  ⚠️  No SendGrid key - email not sent`);
        return false;
    }

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: to }],
                    subject: subject,
                }],
                from: {
                    email: 'jayson@ggloop.io',
                    name: 'Jayson from GG LOOP',
                },
                content: [
                    { type: 'text/plain', value: text },
                    { type: 'text/html', value: html },
                ],
            }),
        });

        if (response.ok) {
            console.log(`  ✅ Email sent successfully`);
            return true;
        } else {
            console.log(`  ❌ SendGrid error: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`  ❌ Error sending: ${error}`);
        return false;
    }
}

// ============================================
// 3. COMPLETE AUTOMATION PIPELINE
// ============================================

export async function runCompleteOutreach(streamers: StreamerTarget[]): Promise<OutreachResult[]> {
    console.log('═'.repeat(60));
    console.log('  COMPLETE AFFILIATE OUTREACH AUTOMATION');
    console.log('═'.repeat(60));
    console.log(`\n📊 Processing ${streamers.length} streamers...\n`);

    const results: OutreachResult[] = [];

    for (const streamer of streamers) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🎮 ${streamer.username} (${streamer.game}, ${streamer.avgViewers} viewers)`);

        // Step 1: Find email
        const emailResult = await findTwitchEmail(streamer.username);

        if (emailResult.emails.length === 0) {
            console.log(`  ❌ No email found - skipping`);
            results.push({
                username: streamer.username,
                email: null,
                sent: false,
                reason: 'No email found',
            });
            continue;
        }

        const email = emailResult.emails[0]; // Use first found email
        console.log(`  📧 Found: ${email}`);

        // Step 2: Generate personalized email
        const emailContent = generateAffiliateEmail(streamer.username, streamer.game);
        console.log(`  📝 Generated affiliate proposal`);

        // Step 3: Send email
        const sent = await sendEmailViaSendGrid(
            email,
            emailContent.subject,
            emailContent.html,
            emailContent.text
        );

        results.push({
            username: streamer.username,
            email,
            sent,
            reason: sent ? 'Sent successfully' : 'SendGrid error',
        });

        // Rate limit: 2 seconds between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Print summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log('  OUTREACH SUMMARY');
    console.log('═'.repeat(60));

    const emailsFound = results.filter(r => r.email !== null).length;
    const emailsSent = results.filter(r => r.sent).length;

    console.log(`\nTotal streamers: ${streamers.length}`);
    console.log(`Emails found: ${emailsFound} (${Math.round(emailsFound / streamers.length * 100)}%)`);
    console.log(`Emails sent: ${emailsSent} (${Math.round(emailsSent / streamers.length * 100)}%)`);

    console.log(`\n✅ Successfully contacted:`);
    results.filter(r => r.sent).forEach(r => {
        console.log(`  - ${r.username} (${r.email})`);
    });

    if (results.filter(r => !r.sent).length > 0) {
        console.log(`\n❌ Failed/Skipped:`);
        results.filter(r => !r.sent).forEach(r => {
            console.log(`  - ${r.username}: ${r.reason}`);
        });
    }

    console.log(`\n💰 Expected results (if 5% convert):`);
    console.log(`  - ${Math.round(emailsSent * 0.05)} partnerships`);
    console.log(`  - $${Math.round(emailsSent * 0.05 * 100)}-${Math.round(emailsSent * 0.05 * 200)}/month revenue`);

    return results;
}

// ============================================
// 4. EXAMPLE USAGE
// ============================================

const EXAMPLE_TARGETS: StreamerTarget[] = [
    { username: 'example_streamer1', game: 'League of Legends', avgViewers: 500 },
    { username: 'example_streamer2', game: 'VALORANT', avgViewers: 300 },
    // Add real streamers here
];

async function main() {
    console.log('\n🚀 COMPLETE AFFILIATE OUTREACH AUTOMATION\n');
    console.log('This script will:');
    console.log('1. Go to each streamer\'s Twitch profile');
    console.log('2. Find their business email automatically');
    console.log('3. Send them the GG LOOP affiliate offer');
    console.log('4. Mention it\'s a NEW program (founding affiliates)\n');

    console.log('📋 SETUP REQUIRED:\n');
    console.log('1. Add SendGrid API key to .env:');
    console.log('   SENDGRID_API_KEY=your_key_here\n');
    console.log('2. Find streamers on TwitchTracker');
    console.log('3. Add them to EXAMPLE_TARGETS array above\n');
    console.log('4. Run: npx tsx server/completeAffiliateOutreach.ts\n');

    // Uncomment to run
    // const results = await runCompleteOutreach(EXAMPLE_TARGETS);
    // console.log('\n✅ Complete automation finished!\n');
}

main();

export { runCompleteOutreach, generateAffiliateEmail };
