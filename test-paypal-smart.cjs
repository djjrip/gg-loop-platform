/**
 * SMART PAYPAL TESTER
 * Tests credentials against BOTH sandbox and live environments
 * Automatically determines which environment to use
 */

const fetch = require('node-fetch');

const CLIENT_ID = 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu';
const CLIENT_SECRET = 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL';

console.log('🔍 SMART PAYPAL ENVIRONMENT DETECTOR');
console.log('═══════════════════════════════════\n');

async function testEnvironment(env) {
    const baseUrl = env === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    console.log(`Testing ${env.toUpperCase()} environment...`);
    console.log(`URL: ${baseUrl}\n`);

    try {
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        const status = authResponse.status;

        if (status === 200) {
            const data = await authResponse.json();
            console.log(`✅ ${env.toUpperCase()} - SUCCESS!`);
            console.log(`   Token: ${data.access_token.substring(0, 30)}...`);
            console.log(`   Expires in: ${data.expires_in} seconds`);
            console.log(`   Scope: ${data.scope}\n`);
            return { success: true, env, data };
        } else {
            const errorText = await authResponse.text();
            console.log(`❌ ${env.toUpperCase()} - FAILED (${status})`);
            console.log(`   Error: ${errorText.substring(0, 100)}\n`);
            return { success: false, env, status, error: errorText };
        }
    } catch (error) {
        console.log(`❌ ${env.toUpperCase()} - ERROR`);
        console.log(`   ${error.message}\n`);
        return { success: false, env, error: error.message };
    }
}

async function run() {
    console.log('Testing credentials against both environments...\n');
    console.log('═══════════════════════════════════\n');

    const sandboxResult = await testEnvironment('sandbox');
    const liveResult = await testEnvironment('live');

    console.log('═══════════════════════════════════');
    console.log('RESULTS');
    console.log('═══════════════════════════════════\n');

    if (sandboxResult.success) {
        console.log('🎯 CREDENTIALS ARE FOR: SANDBOX');
        console.log('✅ Ready to use for testing\n');
        console.log('To configure:');
        console.log('  PAYPAL_MODE=sandbox');
        return 'sandbox';
    } else if (liveResult.success) {
        console.log('🎯 CREDENTIALS ARE FOR: LIVE (PRODUCTION)');
        console.log('✅ Ready for real transactions\n');
        console.log('To configure:');
        console.log('  PAYPAL_MODE=live');
        return 'live';
    } else {
        console.log('❌ CREDENTIALS FAILED IN BOTH ENVIRONMENTS\n');
        console.log('Possible issues:');
        console.log('1. App not activated in PayPal dashboard');
        console.log('2. Credentials copied incorrectly');
        console.log('3. App permissions not set');
        console.log('4. Account verification pending\n');
        console.log('Sandbox error:', sandboxResult.status || sandboxResult.error);
        console.log('Live error:', liveResult.status || liveResult.error);
        return null;
    }
}

run().then(correctEnv => {
    if (correctEnv) {
        console.log('\n✅ I can now configure the system automatically!');
        console.log(`Setting PAYPAL_MODE=${correctEnv}\n`);

        // Update .env with correct mode
        const fs = require('fs');
        let envContent = '';
        if (fs.existsSync('.env')) {
            envContent = fs.readFileSync('.env', 'utf-8');
        }

        // Update or add PAYPAL_MODE
        if (envContent.includes('PAYPAL_MODE=')) {
            envContent = envContent.replace(/PAYPAL_MODE=\w+/, `PAYPAL_MODE=${correctEnv}`);
        } else {
            envContent += `\nPAYPAL_MODE=${correctEnv}\n`;
        }

        // Ensure credentials are in .env
        if (!envContent.includes('PAYPAL_CLIENT_ID=')) {
            envContent += `PAYPAL_CLIENT_ID=${CLIENT_ID}\n`;
        }
        if (!envContent.includes('PAYPAL_CLIENT_SECRET=')) {
            envContent += `PAYPAL_CLIENT_SECRET=${CLIENT_SECRET}\n`;
        }

        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file updated with correct configuration!\n');
        console.log('Next: Run payment system test to verify everything works');
    }
});
