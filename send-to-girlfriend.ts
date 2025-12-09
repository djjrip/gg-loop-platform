/**
 * SEND EMAIL TO JAYSON'S GIRLFRIEND
 * Honoring his backbone throughout this journey
 */

import { generateStreamerEmail } from './server/affiliateEmail';
import fetch from 'node-fetch';
import fs from 'fs';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;

async function sendToGirlfriend() {
    console.log('💌 Sending email to jwleapoffaith@yahoo.com...\n');
    console.log('Honoring the backbone of this journey 🙏\n');

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
            to: [{ email: 'jwleapoffaith@yahoo.com' }],
            subject: email.subject,
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
            console.log('✅ EMAIL SENT TO YOUR GIRLFRIEND!\n');
            console.log('💪 She\'s been your backbone - now she gets to see the vision.\n');
            console.log('🚀 This is just the beginning!\n');
        } else {
            console.log(`❌ Failed: ${response.status}`);
            console.log(await response.text());
        }
    } catch (error) {
        console.log(`❌ Error: ${error}`);
    }
}

sendToGirlfriend();
