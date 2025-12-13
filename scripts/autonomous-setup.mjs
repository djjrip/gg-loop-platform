#!/usr/bin/env node
/**
 * AUTONOMOUS SETUP SCRIPT
 * Checks Railway environment and guides user through missing variables
 */

import https from 'https';

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

const REQUIRED_VARS = {
    critical: [
        { name: 'ADMIN_EMAILS', example: 'admin@ggloop.io', link: null },
        { name: 'BASE_URL', example: 'https://ggloop.io', link: null },
        { name: 'SESSION_SECRET', example: 'generate-32-char-random-string', link: null }
    ],
    oauth: [
        { name: 'GOOGLE_CLIENT_ID', example: 'xxx.apps.googleusercontent.com', link: 'https://console.cloud.google.com/apis/credentials' },
        { name: 'GOOGLE_CLIENT_SECRET', example: 'GOCSPX-xxx', link: 'https://console.cloud.google.com/apis/credentials' },
        { name: 'DISCORD_CLIENT_ID', example: '1234567890', link: 'https://discord.com/developers/applications' },
        { name: 'DISCORD_CLIENT_SECRET', example: 'xxx', link: 'https://discord.com/developers/applications' },
        { name: 'TWITCH_CLIENT_ID', example: 'xxx', link: 'https://dev.twitch.tv/console/apps' },
        { name: 'TWITCH_CLIENT_SECRET', example: 'xxx', link: 'https://dev.twitch.tv/console/apps' }
    ],
    apis: [
        { name: 'RIOT_API_KEY', example: 'RGAPI-xxx', link: 'https://developer.riotgames.com/' },
        { name: 'PAYPAL_CLIENT_ID', example: 'xxx', link: 'https://developer.paypal.com/dashboard/' },
        { name: 'PAYPAL_CLIENT_SECRET', example: 'xxx', link: 'https://developer.paypal.com/dashboard/' }
    ]
};

async function checkRailwayDeployment() {
    log('\n🔍 CHECKING RAILWAY DEPLOYMENT STATUS', 'cyan');
    log('='.repeat(60), 'cyan');

    try {
        const response = await new Promise((resolve) => {
            https.get('https://ggloop.io/api/health', { timeout: 5000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            }).on('error', () => resolve({ status: 0 }));
        });

        if (response.status === 200) {
            log('✅ Site is LIVE at https://ggloop.io', 'green');
            return true;
        } else {
            log(`⚠️  Site returned status ${response.status}`, 'yellow');
            return false;
        }
    } catch (error) {
        log('❌ Cannot reach ggloop.io', 'red');
        return false;
    }
}

async function checkAWSRoadmap() {
    log('\n🔍 CHECKING AWS ROADMAP PAGE', 'cyan');

    try {
        const response = await new Promise((resolve) => {
            https.get('https://ggloop.io/aws-roadmap', { timeout: 5000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            }).on('error', () => resolve({ status: 0 }));
        });

        if (response.status === 200 && response.data.includes('AWS')) {
            log('✅ AWS Roadmap page is LIVE', 'green');
            return true;
        } else {
            log(`⚠️  AWS Roadmap not accessible (status: ${response.status})`, 'yellow');
            return false;
        }
    } catch (error) {
        log('❌ Cannot check AWS Roadmap', 'red');
        return false;
    }
}

function generateSetupCommands() {
    log('\n📋 RAILWAY SETUP COMMANDS', 'blue');
    log('='.repeat(60), 'blue');
    log('\nCopy and paste these into Railway Variables:\n', 'cyan');

    console.log('# CRITICAL VARIABLES');
    REQUIRED_VARS.critical.forEach(v => {
        console.log(`${v.name}=${v.example}`);
    });

    console.log('\n# OAUTH PROVIDERS');
    REQUIRED_VARS.oauth.forEach(v => {
        console.log(`${v.name}=${v.example}`);
        if (v.link) console.log(`# Get from: ${v.link}`);
    });

    console.log('\n# GAME APIs & PAYMENTS');
    REQUIRED_VARS.apis.forEach(v => {
        console.log(`${v.name}=${v.example}`);
        if (v.link) console.log(`# Get from: ${v.link}`);
    });
}

function showNextSteps() {
    log('\n🎯 NEXT STEPS TO 100%', 'blue');
    log('='.repeat(60), 'blue');

    log('\n1️⃣  SET RAILWAY VARIABLES (15 min)', 'yellow');
    log('   Go to: https://railway.app/dashboard', 'cyan');
    log('   → Click your project', 'cyan');
    log('   → Click "Variables" tab', 'cyan');
    log('   → Add the variables shown above', 'cyan');

    log('\n2️⃣  SEED REWARDS DATABASE (5 min)', 'yellow');
    log('   Install Railway CLI:', 'cyan');
    log('   npm install -g @railway/cli', 'green');
    log('   railway login', 'green');
    log('   railway link', 'green');
    log('   railway run npm run seed:rewards', 'green');

    log('\n3️⃣  VERIFY DEPLOYMENT', 'yellow');
    log('   node scripts/verify-platform.mjs', 'green');

    log('\n✅ TOTAL TIME: ~20 minutes to 100%\n', 'green');
}

async function main() {
    log('\n🚀 GG LOOP AUTONOMOUS SETUP', 'blue');
    log('='.repeat(60), 'blue');

    const siteUp = await checkRailwayDeployment();
    const awsUp = await checkAWSRoadmap();

    if (siteUp && awsUp) {
        log('\n🎉 PLATFORM IS LIVE!', 'green');
        log('✅ Main site working', 'green');
        log('✅ AWS Roadmap accessible', 'green');
    }

    generateSetupCommands();
    showNextSteps();

    log('\n📚 DOCUMENTATION:', 'blue');
    log('   ENV_AUDIT_COMPLETE.md - Full environment variable guide', 'cyan');
    log('   ACTUAL_STATUS.md - Current platform status', 'cyan');
    log('   STEPS_TO_100_PERCENT.md - Exact steps remaining', 'cyan');
}

main().catch(console.error);
