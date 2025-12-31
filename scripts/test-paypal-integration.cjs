require('dotenv').config();
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 1. Get Credentials from Environment (or hardcode for strict testing if needed, but prefer env)
// Note: In prod these must be set in Railway/Amplify. Local needs .env
const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || "AUyJq00bZgJD-wJ4Jg88n_yXjKj9FfJ3K6Xz8z8J8z8J8z8J8z8J8z8J"; // Placeholder if missing
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "YOUR_SECRET_HERE";

// 2. Setup Environment
// Use SandboxEnvironment for testing. switch to LiveEnvironment for prod.
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

async function checkCredentials() {
    try {
        console.log("------------------------------------------------");
        console.log("🔐 Verifying PayPal Credentials...");
        console.log(`Environment: ${process.env.PAYPAL_MODE || 'sandbox'}`);
        console.log(`Client ID: ${clientId.substring(0, 5)}...`);
        console.log("------------------------------------------------");

        // Fetch Access Token manually to test creds without creating an order
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const endpoint = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com/v1/oauth2/token'
            : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

        const fetch = await import('node-fetch').then(m => m.default);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Auth Failed: ${response.status} ${response.statusText} - ${err}`);
        }

        const data = await response.json();
        console.log("✅ Credentials Valid!");
        console.log(`Access Token Generated: ${data.access_token.substring(0, 10)}...`);
        console.log(`Scope: ${data.scope}`);
        console.log(`Expires In: ${data.expires_in}s`);

    } catch (err) {
        console.error("❌ verification Failed:");
        console.error(err.message);
    }
}

checkCredentials();
