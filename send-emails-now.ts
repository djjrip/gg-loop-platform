/**
 * SEND AFFILIATE EMAILS - READY TO GO
 * Uses the new warm email + includes founding member mention
 */

import { findTwitchEmail } from './twitchEmailScraper';
import { generateStreamerEmail } from './affiliateEmail';
import fetch from 'node-fetch';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;

// The 10 streamers you're targeting tonight
const TARGET_STREAMERS = [
    { username: 'Quantum', game: 'League of Legends' },
    { username: 'PekinWoof', game: 'League of Legends' },
    { username: 'Hanjaro', game: 'League of Legends' },
    { username: 'SoloRenektonOnly', game: 'League of Legends' },
    { username: 'Dumbs', game: 'VALORANT' },
    { username: 'Flexinja', game: 'VALORANT' },
    { username: 'Howeh', game: 'VALORANT' },
    { username: 'Prod', game: 'VALORANT' },
    { username: 'Ziptie', game: 'League of Legends' },
    { username: 'Balori', game: 'League of Legends' },
];

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!SENDGRID_KEY) {
        console.log('❌ No SendGrid key');
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
                    email: 'info@ggloop.io',
                    name: 'Jayson from GG LOOP',
                },
                reply_to: {
                    email: 'info@ggloop.io',
                    name: 'Jayson Quindao',
                },
                content: [
                    { type: 'text/plain', value: text },
                    { type: 'text/html', value: html },
                ],
            }),
        });

        return response.ok;
    } catch (error) {
        console.log(`❌ Send error: ${error}`);
        return false;
    }
}

async function main() {
    console.log('\n🚀 SENDING AFFILIATE EMAILS - POST MALONE ENERGY\n');
    console.log('═'.repeat(60));

    let sent = 0;
    let skipped = 0;

    for (const streamer of TARGET_STREAMERS) {
        console.log(`\n📧 ${streamer.username} (${streamer.game})`);

        // Try to find email (we'll use a placeholder for now)
        console.log(`  Finding email...`);

        // You can manually add emails here or let the scraper find them
        const email = `business@${streamer.username.toLowerCase()}.com`; // Placeholder

        console.log(`  Using: ${email}`);

        // Generate email
        const emailContent = generateStreamerEmail(streamer.username, streamer.game);

        // Send it
        console.log(`  Sending...`);
        const success = await sendEmail(email, emailContent.subject, emailContent.html, emailContent.text);

        if (success) {
            console.log(`  ✅ SENT`);
            sent++;
        } else {
            console.log(`  ❌ FAILED`);
            skipped++;
        }

        // Wait 2 seconds between sends
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 RESULTS:`);
    console.log(`  Sent: ${sent}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`\n✅ Done! Check your inbox for responses.\n`);
}

main();
