#!/usr/bin/env node
/**
 * COMPLETE PLATFORM VERIFICATION
 * Tests every critical system before declaring 100%
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

const checks = {
    build: {
        name: 'Build System',
        test: () => {
            try {
                execSync('npm run build', { stdio: 'pipe' });
                return true;
            } catch {
                return false;
            }
        }
    },
    homepage: {
        name: 'Homepage (ggloop.io)',
        test: () => checkUrl('https://ggloop.io')
    },
    awsRoadmap: {
        name: 'AWS Roadmap Page',
        test: () => checkUrl('https://ggloop.io/aws-roadmap')
    },
    shop: {
        name: 'Shop Page',
        test: () => checkUrl('https://ggloop.io/shop')
    },
    healthApi: {
        name: 'Health API',
        test: () => checkUrl('https://ggloop.io/api/health')
    },
    revenueApi: {
        name: 'Revenue Metrics API',
        test: () => checkUrl('https://ggloop.io/api/admin/revenue-metrics')
    },
    database: {
        name: 'Database Connection',
        test: async () => {
            const result = await checkUrl('https://ggloop.io/api/health');
            return result && result.includes('database');
        }
    }
};

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(res.statusCode === 200 ? data : false);
            });
        }).on('error', () => resolve(false));
    });
}

async function runVerification() {
    log('\n🔍 COMPLETE PLATFORM VERIFICATION', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Time: ${new Date().toLocaleString()}`, 'cyan');
    log('');

    const results = {
        passed: 0,
        failed: 0,
        total: Object.keys(checks).length
    };

    for (const [key, check] of Object.entries(checks)) {
        process.stdout.write(`Testing: ${check.name.padEnd(30)}`);

        try {
            const passed = await check.test();
            if (passed) {
                log('✅ PASS', 'green');
                results.passed++;
            } else {
                log('❌ FAIL', 'red');
                results.failed++;
            }
        } catch (error) {
            log(`❌ ERROR: ${error.message}`, 'red');
            results.failed++;
        }
    }

    log('\n' + '='.repeat(60), 'cyan');
    log('📊 VERIFICATION RESULTS', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total Checks: ${results.total}`, 'cyan');
    log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
    log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');

    const percentage = Math.round((results.passed / results.total) * 100);
    log(`\nPlatform Status: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');

    if (percentage === 100) {
        log('\n🎉 PLATFORM IS 100% OPERATIONAL!', 'green');
        log('All systems verified and working ✅', 'green');
    } else {
        log(`\n⚠️  Platform is ${percentage}% operational`, 'yellow');
        log(`${results.failed} system(s) need attention`, 'yellow');
    }

    log('\n' + '='.repeat(60), 'cyan');

    return percentage === 100;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runVerification()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            log(`\n❌ Verification failed: ${error.message}`, 'red');
            process.exit(1);
        });
}

export { runVerification };
