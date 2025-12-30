#!/usr/bin/env node
/**
 * RAILWAY DEPLOYMENT MONITOR
 * Automated checker for Railway deployment status
 * Alerts on failures, monitors production health
 * 
 * Run: node scripts/railway-monitor.cjs
 */

require('dotenv/config');
const https = require('https');

// Railway API endpoint (if available) or use curl
const PRODUCTION_URL = 'https://ggloop.io/vibe-coding';
const MAIN_URL = 'https://ggloop.io';

async function checkProductionHealth() {
    console.log('🏥 PRODUCTION HEALTH CHECK\n');

    const urls = [
        { name: 'Main Site', url: MAIN_URL },
        { name: 'Vibe Coding', url: PRODUCTION_URL }
    ];

    const results = [];

    for (const { name, url } of urls) {
        try {
            const status = await new Promise((resolve, reject) => {
                https.get(url, { timeout: 10000 }, (res) => {
                    resolve(res.statusCode);
                }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
            });

            const statusEmoji = status === 200 ? '✅' : '❌';
            console.log(`${statusEmoji} ${name}: ${status}`);
            results.push({ name, status, healthy: status === 200 });
        } catch (error) {
            console.log(`❌ ${name}: ERROR - ${error.message}`);
            results.push({ name, status: 'ERROR', healthy: false });
        }
    }

    console.log('');
    return results;
}

async function checkRailwayDeployment() {
    console.log('🚂 RAILWAY DEPLOYMENT STATUS\n');

    // Note: Railway doesn't have public API for deployment status
    // This would require Railway token + API calls
    // For now, we check production health as proxy

    console.log('⚠️  Railway API integration not yet implemented');
    console.log('   Using production health check as deployment indicator\n');

    const healthResults = await checkProductionHealth();

    const allHealthy = healthResults.every(r => r.healthy);

    if (allHealthy) {
        console.log('✅ DEPLOYMENT APPEARS SUCCESSFUL');
        console.log('   All production URLs responding with 200 OK\n');
    } else {
        console.log('❌ DEPLOYMENT ISSUE DETECTED');
        console.log('   One or more URLs failing healthcheck');
        console.log('   Check Railway dashboard for deployment logs\n');

        // Alert actions
        console.log('🔔 ALERT ACTIONS:');
        console.log('   1. Check Railway deployment logs');
        console.log('   2. Verify latest commit deployed successfully');
        console.log('   3. Check for module resolution errors');
        console.log('   4. Consider reverting to last known good commit\n');
    }

    return { healthy: allHealthy, results: healthResults };
}

async function monitorLoop() {
    console.log('🤖 RAILWAY MONITOR STARTED\n');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    const status = await checkRailwayDeployment();

    // Recommendations
    console.log('📋 NEXT STEPS:\n');

    if (!status.healthy) {
        console.log('1. ❌ DEPLOYMENT FAILED - Manual intervention needed');
        console.log('2. Check Railway logs in dashboard');
        console.log('3. Verify tsx module resolution settings');
        console.log('4. Consider static deployment bypass if server fails repeatedly\n');
    } else {
        console.log('1. ✅ Production healthy');
        console.log('2. Monitor user signups');
        console.log('3. Scale email campaign');
        console.log('4. Continue community building\n');
    }

    console.log('✅ Monitor complete\n');
    return status;
}

// Run immediately
monitorLoop().catch(err => {
    console.error('❌ Monitor failed:', err);
    process.exit(1);
});

module.exports = { checkProductionHealth, checkRailwayDeployment };
