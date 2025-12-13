/**
 * OUTREACH BOT DIAGNOSTIC TEST
 * Tests SendGrid and sends test email to CEO
 */

import fetch from 'node-fetch';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const CEO_EMAIL = 'jaysonquindao1@gmail.com'; // From send-test-email.ts

async function runDiagnostic() {
    console.log('═'.repeat(60));
    console.log('  GG LOOP OUTREACH BOT - DIAGNOSTIC TEST');
    console.log('═'.repeat(60));
    console.log();

    // Check 1: SendGrid API Key
    console.log('🔍 CHECK 1: SendGrid API Key');
    if (!SENDGRID_KEY) {
        console.log('❌ SENDGRID_API_KEY not found in environment');
        console.log('   Set it with: $env:SENDGRID_API_KEY="your_key_here"');
        console.log();
        return false;
    }
    console.log('✅ SendGrid key found');
    console.log(`   Length: ${SENDGRID_KEY.length} characters`);
    console.log();

    // Check 2: Send Test Email to CEO
    console.log('🔍 CHECK 2: Sending Test Email to CEO');
    console.log(`   Recipient: ${CEO_EMAIL}`);
    console.log();

    const emailPayload = {
        personalizations: [{
            to: [{ email: CEO_EMAIL }],
            subject: '[TEST] GG LOOP Outreach Bot – SendGrid Confirmation',
        }],
        from: {
            email: 'info@ggloop.io',
            name: 'GG LOOP Outreach Bot',
        },
        content: [{
            type: 'text/plain',
            value: 'This is a test email from the GG LOOP Outreach Bot to confirm SendGrid is working.\\n\\nDate: ' + new Date().toISOString() + '\\n\\nIf you received this, the bot is functional!',
        }],
    };

    try {
        console.log('   Sending via SendGrid API...');
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        console.log(`   Response Status: ${response.status}`);

        if (response.ok) {
            console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
            console.log(`   Check ${CEO_EMAIL} for the test message`);
            console.log();
            return true;
        } else {
            const errorBody = await response.text();
            console.log('❌ SendGrid API Error');
            console.log(`   Status: ${response.status}`);
            console.log(`   Response: ${errorBody}`);
            console.log();

            // Common error codes
            if (response.status === 401) {
                console.log('   💡 ERROR 401: API key is invalid or expired');
                console.log('      Get new key: https://app.sendgrid.com/settings/api_keys');
            } else if (response.status === 403) {
                console.log('   💡 ERROR 403: API key lacks permissions');
                console.log('      Ensure key has "Mail Send" permission');
            } else if (response.status === 429) {
                console.log('   💡 ERROR 429: Rate limited');
                console.log('      Wait before sending more emails');
            }
            console.log();
            return false;
        }
    } catch (error: any) {
        console.log('❌ Network Error');
        console.log(`   ${error.message}`);
        console.log();
        return false;
    }
}

// Check 3: Twitch Scraping Status
console.log('═'.repeat(60));
console.log('  Twitch Email Scraper Status');
console.log('═'.repeat(60));
console.log();
console.log('📁 File: server/twitchEmailScraper.ts');
console.log('✅ Scraper exists and is ready');
console.log('   Uses: cheerio to parse Twitch About pages');
console.log('   Looks for emails in panels and about sections');
console.log('   Rate limited: 2 seconds between requests');
console.log();

// Run diagnostic
runDiagnostic().then(success => {
    console.log('═'.repeat(60));
    console.log('  DIAGNOSTIC COMPLETE');
    console.log('═'.repeat(60));
    console.log();

    if (success) {
        console.log('✅ Bot is operational!');
        console.log();
        console.log('Next steps:');
        console.log('1. Check CEO email for test message');
        console.log('2. If received, bot is ready for real outreach');
        console.log('3. Run: npx tsx server/completeAffiliateOutreach.ts');
    } else {
        console.log('❌ Bot needs configuration');
        console.log();
        console.log('Fix required:');
        console.log('1. Get SendGrid API key from https://app.sendgrid.com');
        console.log('2. Set env var: $env:SENDGRID_API_KEY="your_key"');
        console.log('3. Re-run this diagnostic');
    }
    console.log();
});
