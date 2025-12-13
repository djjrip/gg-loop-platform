/**
 * TEST EMAIL WITH BANNER - FIXED
 */

import { generateStreamerEmail } from './server/affiliateEmail';
import fetch from 'node-fetch';
import fs from 'fs';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;

async function sendTestEmail() {
    console.log('📧 Sending COMPLETE test email to jaysonquindao1@gmail.com...\n');

    const email = generateStreamerEmail('Test', 'League');

    // Load banner
    const bannerPath = 'C:\\Users\\Jayson Quindao\\.gemini\\antigravity\\brain\\0ab85420-08db-4478-854f-260710ebfc09\\uploaded_image_0_1765254960601.png';
    let bannerBase64 = '';

    try {
        const buffer = fs.readFileSync(bannerPath);
        bannerBase64 = buffer.toString('base64');
        console.log('✅ Banner loaded\n');
    } catch (error) {
        console.log('⚠️  Banner failed to load\n');
    }

    const emailPayload: any = {
        personalizations: [{
            to: [{ email: 'jaysonquindao1@gmail.com' }],
            subject: `[TEST - FIXED] ${email.subject}`,
        }],
        from: { email: 'info@ggloop.io', name: 'Jayson BQ' },
        reply_to: { email: 'info@ggloop.io', name: 'Jayson BQ' },
        content: [
            { type: 'text/plain', value: email.text },
            { type: 'text/html', value: email.html },
        ],
    };

    if (bannerBase64) {
        emailPayload.attachments = [
            {
                content: bannerBase64,
                filename: 'banner.png',
                type: 'image/png',
                disposition: 'inline',
                content_id: 'email-banner',
            },
            {
                content: bannerBase64,
                filename: 'banner-footer.png',
                type: 'image/png',
                disposition: 'inline',
                content_id: 'email-banner-footer',
            },
        ];
    }

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
            console.log('✅ EMAIL SENT!\n');
            console.log('CHECK:');
            console.log('✓ Banner at top & bottom');
            console.log('✓ Says "Howdy Gamer,"');
            console.log('✓ Full content visible');
            console.log('\n🚀 Ready for real streamers!');
        } else {
            console.log(`❌ Failed: ${response.status}`);
            console.log(await response.text());
        }
    } catch (error) {
        console.log(`❌ Error: ${error}`);
    }
}

sendTestEmail();
