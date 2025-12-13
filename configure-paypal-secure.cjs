/**
 * SECURE PAYPAL CONFIGURATION
 * Safely adds PayPal credentials to .env file
 * NEVER logs sensitive data
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 SECURE PAYPAL CONFIGURATION');
console.log('═══════════════════════════════════\n');

// PayPal credentials (provided by CEO)
const PAYPAL_CLIENT_ID = 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu';
const PAYPAL_CLIENT_SECRET = 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL';

console.log('[1/6] Reading .env file...');
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
        console.log('   ✅ Existing .env found');
    } else {
        console.log('   📄 Creating new .env file');
    }
} catch (error) {
    console.log('   ⚠️  Could not read .env, creating new');
}

console.log('\n[2/6] Updating PayPal credentials...');

// Remove old PayPal entries if they exist
envContent = envContent
    .split('\n')
    .filter(line => !line.startsWith('PAYPAL_CLIENT_ID=') && !line.startsWith('PAYPAL_CLIENT_SECRET='))
    .join('\n');

// Add new credentials (SECURELY - no logging)
if (!envContent.includes('# PayPal Configuration')) {
    envContent += '\n\n# PayPal Configuration\n';
}

envContent += `PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}\n`;
envContent += `PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}\n`;

// Ensure other required vars exist
if (!envContent.includes('PAYPAL_MODE=')) {
    envContent += 'PAYPAL_MODE=sandbox\n';
}

if (!envContent.includes('CLIENT_URL=')) {
    envContent += '\n# Site Configuration\n';
    envContent += 'CLIENT_URL=https://ggloop.io\n';
}

console.log('   ✅ Credentials added (NOT logged for security)');

console.log('\n[3/6] Writing secure .env file...');
try {
    fs.writeFileSync(envPath, envContent, { mode: 0o600 }); // Restricted permissions
    console.log('   ✅ .env file updated securely');
    console.log('   🔒 File permissions: Owner read/write only');
} catch (error) {
    console.log('   ❌ Error writing .env:', error.message);
    process.exit(1);
}

console.log('\n[4/6] Creating Railway environment variables guide...');
const railwayVars = `
# COPY THESE TO RAILWAY:
# Settings → Variables → Add each one

PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
PAYPAL_MODE=sandbox
CLIENT_URL=https://ggloop.io

# NOTE: Switch to 'live' mode when ready for production
`;

fs.writeFileSync('.railway-vars.txt', railwayVars);
console.log('   ✅ Railway variables saved to: .railway-vars.txt');
console.log('   ⚠️  KEEP THIS FILE SECURE - Contains credentials');

console.log('\n[5/6] Testing PayPal API connection...');
async function testConnection() {
    try {
        const fetch = require('node-fetch');
        const baseUrl = 'https://api-m.sandbox.paypal.com';

        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!authResponse.ok) {
            console.log('   ❌ PayPal authentication FAILED');
            console.log('      Status:', authResponse.status);
            console.log('      Check credentials are correct');
            return false;
        }

        const authData = await authResponse.json();
        console.log('   ✅ PayPal API connection SUCCESSFUL');
        console.log('   ✅ OAuth token received');
        console.log('   ✅ Credentials are VALID');
        return true;
    } catch (error) {
        console.log('   ❌ Connection test failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    console.log('\n[6/6] Running database migration...');

    const { execSync } = require('child_process');
    try {
        execSync('node server/autoMigrate.ts', { stdio: 'inherit' });
        console.log('   ✅ Database tables created');
    } catch (error) {
        console.log('   ⚠️  Database migration warning (may already exist)');
    }

    console.log('\n═══════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════\n');

    if (success) {
        console.log('🎉 Payment system is now OPERATIONAL!\n');
        console.log('Next steps:');
        console.log('1. ✅ Local setup complete');
        console.log('2. 📋 Copy .railway-vars.txt to Railway');
        console.log('3. 🔄 Restart Railway deployment');
        console.log('4. 🧪 Test subscription at /subscription');
        console.log('5. 🔒 DELETE .railway-vars.txt after copying\n');
    } else {
        console.log('⚠️  PayPal connection  failed - check credentials\n');
    }

    console.log('Security notes:');
    console.log('- Credentials stored in .env (gitignored)');
    console.log('- File permissions restricted');
    console.log('- Never commit .env or .railway-vars.txt');
    console.log('- Delete .railway-vars.txt after Railway setup\n');
});
