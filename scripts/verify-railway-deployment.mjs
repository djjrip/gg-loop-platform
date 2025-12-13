#!/usr/bin/env node
/**
 * RAILWAY DEPLOYMENT VERIFIER
 * Checks if Railway actually deployed the latest code
 */

import https from 'https';
import { execSync } from 'child_process';

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

async function getDeployedCommit() {
    return new Promise((resolve) => {
        https.get('https://ggloop.io/api/health', { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const health = JSON.parse(data);
                    resolve(health.commit || null);
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function checkBundleForRoute(route) {
    return new Promise((resolve) => {
        https.get('https://ggloop.io', { timeout: 5000 }, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
                if (!match) {
                    resolve({ found: false, error: 'No bundle found in HTML' });
                    return;
                }

                const bundlePath = match[1];
                https.get(`https://ggloop.io${bundlePath}`, { timeout: 10000 }, (bundleRes) => {
                    let code = '';
                    bundleRes.on('data', chunk => code += chunk);
                    bundleRes.on('end', () => {
                        const hasRoute = code.includes(route);
                        resolve({
                            found: hasRoute,
                            bundle: bundlePath,
                            size: code.length
                        });
                    });
                }).on('error', (err) => resolve({ found: false, error: err.message }));
            });
        }).on('error', (err) => resolve({ found: false, error: err.message }));
    });
}

async function verifyDeployment() {
    log('\n🔍 RAILWAY DEPLOYMENT VERIFICATION', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Time: ${new Date().toLocaleString()}`, 'cyan');
    log('');

    // Get local commit
    const localCommit = execSync('git rev-parse --short HEAD').toString().trim();
    log(`📍 Local commit: ${localCommit}`, 'cyan');

    // Check if site is up
    log('\n1️⃣  Checking if site is accessible...', 'yellow');
    const siteUp = await new Promise((resolve) => {
        https.get('https://ggloop.io', { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => resolve(false));
    });

    if (!siteUp) {
        log('❌ Site is DOWN', 'red');
        return false;
    }
    log('✅ Site is UP', 'green');

    // Check for AWS Roadmap route in bundle
    log('\n2️⃣  Checking if AWS Roadmap route is in deployed bundle...', 'yellow');
    const routeCheck = await checkBundleForRoute('aws-roadmap');

    if (routeCheck.error) {
        log(`❌ Error checking bundle: ${routeCheck.error}`, 'red');
        return false;
    }

    if (!routeCheck.found) {
        log('❌ AWS Roadmap route NOT found in deployed bundle', 'red');
        log(`   Bundle: ${routeCheck.bundle}`, 'yellow');
        log(`   Size: ${routeCheck.size} bytes`, 'yellow');
        log('\n⚠️  Railway has NOT deployed the latest code yet', 'yellow');
        log('   Wait 2-3 more minutes and run this again', 'yellow');
        return false;
    }

    log('✅ AWS Roadmap route IS in deployed bundle', 'green');
    log(`   Bundle: ${routeCheck.bundle}`, 'cyan');

    // Test the actual route
    log('\n3️⃣  Testing /aws-roadmap endpoint...', 'yellow');
    const routeWorks = await new Promise((resolve) => {
        https.get('https://ggloop.io/aws-roadmap', { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => resolve(false));
    });

    if (!routeWorks) {
        log('❌ Route returns non-200 status', 'red');
        return false;
    }
    log('✅ Route returns 200 OK', 'green');

    log('\n' + '='.repeat(60), 'green');
    log('🎉 DEPLOYMENT VERIFIED - AWS ROADMAP IS LIVE!', 'green');
    log('='.repeat(60), 'green');
    log('\n✅ You can now visit: https://ggloop.io/aws-roadmap\n', 'cyan');

    return true;
}

// Run verification
verifyDeployment()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        log(`\n❌ Verification failed: ${error.message}`, 'red');
        process.exit(1);
    });
