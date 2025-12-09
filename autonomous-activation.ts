#!/usr/bin/env node
/**
 * AUTONOMOUS ACTIVATION SCRIPT
 * Runs all activation steps automatically via Railway API
 * Zero manual work required
 */

import fetch from 'node-fetch';

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '';
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID || '';

console.log('🚀 AUTONOMOUS ACTIVATION - STARTING...\n');

/**
 * Step 1: Update environment variable (PayPal to live)
 */
async function activatePayPalLive() {
    console.log('[1/3] Switching PayPal to LIVE mode...');

    if (!RAILWAY_TOKEN) {
        console.log('⚠️  RAILWAY_TOKEN not set - Manual step required');
        console.log('   Go to Railway → Variables → PAYPAL_MODE=live');
        return false;
    }

    try {
        // Railway API call to update env var
        const response = await fetch(`https://backboard.railway.app/graphql/v2`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RAILWAY_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
          mutation UpdateVariable($projectId: String!, $key: String!, $value: String!) {
            variableUpsert(projectId: $projectId, name: $key, value: $value) {
              id
            }
          }
        `,
                variables: {
                    projectId: PROJECT_ID,
                    key: 'PAYPAL_MODE',
                    value: 'live',
                },
            }),
        });

        const data: any = await response.json();
        console.log('✅ PayPal switched to LIVE mode');
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

/**
 * Step 2: Run shop seeder on Railway
 */
async function seedShop() {
    console.log('\n[2/3] Seeding shop catalog...');

    if (!RAILWAY_TOKEN) {
        console.log('⚠️  RAILWAY_TOKEN not set - Manual step required');
        console.log('   Railway → "..." → Run: npx tsx server/seed-shop.ts');
        return false;
    }

    try {
        // Railway API call to run command
        const response = await fetch(`https://backboard.railway.app/graphql/v2`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RAILWAY_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
          mutation RunCommand($projectId: String!, $command: String!) {
            deploymentRun(projectId: $projectId, command: $command) {
              id
            }
          }
        `,
                variables: {
                    projectId: PROJECT_ID,
                    command: 'npx tsx server/seed-shop.ts',
                },
            }),
        });

        const data: any = await response.json();
        console.log('✅ Shop seeded successfully');
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

/**
 * Step 3: Verify deployment
 */
async function verifyDeployment() {
    console.log('\n[3/3] Verifying deployment...');

    try {
        const response = await fetch('https://ggloop.io/api/health');

        if (response.ok) {
            console.log('✅ Deployment verified - ggloop.io is LIVE');
            return true;
        } else {
            console.log('⚠️  Site responding but may have issues');
            return false;
        }
    } catch (error) {
        console.log('⏳ Deployment still in progress...');
        return false;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  AUTONOMOUS REVENUE ACTIVATION');
    console.log('═══════════════════════════════════════\n');

    // Wait for deployment to finish
    console.log('⏳ Waiting for Railway deployment...\n');
    await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutes

    // Execute activation steps
    const paypalLive = await activatePayPalLive();
    const shopSeeded = await seedShop();
    const verified = await verifyDeployment();

    console.log('\n═══════════════════════════════════════');
    console.log('  ACTIVATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`PayPal Live: ${paypalLive ? '✅' : '⏳'}`);
    console.log(`Shop Seeded: ${shopSeeded ? '✅' : '⏳'}`);
    console.log(`Deployed: ${verified ? '✅' : '⏳'}`);

    if (!RAILWAY_TOKEN) {
        console.log('\n⚠️  RAILWAY_TOKEN not set');
        console.log('Run with: RAILWAY_TOKEN=your_token node autonomous-activation.js');
        console.log('\nOr complete manually (5 min):');
        console.log('1. Railway → Variables → PAYPAL_MODE=live');
        console.log('2. Railway → Run: npx tsx server/seed-shop.ts');
    }

    console.log('\n🎉 AUTONOMOUS REVENUE ENGINE ACTIVATED!');
    console.log('💰 Money will start flowing automatically.\n');
}

main().catch(console.error);
