// scripts/check-rewards.js
// Quick script to verify the Tango Card rewards catalog endpoint.
// Usage: npm run check-rewards

import fetch from 'node-fetch';

const apiUrl = process.env.TANGO_CARD_API_URL || 'https://api.tangocard.com/raas/v2/catalog';
const platformName = process.env.TANGO_CARD_PLATFORM_NAME;
const platformKey = process.env.TANGO_CARD_PLATFORM_KEY;

if (!platformName || !platformKey) {
    console.error('❌ Missing TANGO_CARD_PLATFORM_NAME or TANGO_CARD_PLATFORM_KEY environment variables.');
    process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${platformName}:${platformKey}`).toString('base64');

(async () => {
    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: authHeader,
                Accept: 'application/json',
            },
        });
        if (!res.ok) {
            console.error(`❌ Tango Card API returned status ${res.status}`);
            const txt = await res.text();
            console.error('Response body:', txt);
            process.exit(1);
        }
        const data = await res.json();
        console.log('✅ Tango Card catalog fetched successfully.');
        console.log('Number of items:', data?.items?.length ?? 'unknown');
    } catch (err) {
        console.error('❌ Error contacting Tango Card API:', err);
        process.exit(1);
    }
})();
