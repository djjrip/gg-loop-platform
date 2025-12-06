#!/usr/bin/env node
/**
 * GG LOOP PLATFORM HEALTH CHECK
 * Automated system to verify all services are operational
 */

import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ENDPOINTS = {
    production: 'https://ggloop.io',
    api: 'https://ggloop.io/api/health',
    shop: 'https://ggloop.io/shop',
    awsRoadmap: 'https://ggloop.io/aws-roadmap',
    admin: 'https://ggloop.io/admin'
};

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function checkEndpoint(name, url) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        https.get(url, { timeout: 10000 }, (res) => {
            const responseTime = Date.now() - startTime;
            const status = res.statusCode;

            let result = {
                name,
                url,
                status,
                responseTime,
                healthy: status >= 200 && status < 400
            };

            resolve(result);
        }).on('error', (err) => {
            resolve({
                name,
                url,
                status: 0,
                responseTime: 0,
                healthy: false,
                error: err.message
            });
        }).on('timeout', () => {
            resolve({
                name,
                url,
                status: 0,
                responseTime: 10000,
                healthy: false,
                error: 'Timeout'
            });
        });
    });
}

async function checkDatabase() {
    try {
        // Check if we can connect to database
        const { stdout } = await execAsync('npm run db:push -- --dry-run', {
            cwd: process.cwd(),
            timeout: 30000
        });

        return {
            name: 'Database',
            healthy: !stdout.includes('error'),
            message: 'Connection verified'
        };
    } catch (error) {
        return {
            name: 'Database',
            healthy: false,
            message: error.message
        };
    }
}

async function checkBuild() {
    try {
        const { stdout, stderr } = await execAsync('npm run build', {
            cwd: process.cwd(),
            timeout: 120000
        });

        return {
            name: 'Build',
            healthy: !stderr.includes('ERROR') && !stderr.includes('failed'),
            message: 'Build successful'
        };
    } catch (error) {
        return {
            name: 'Build',
            healthy: false,
            message: error.message
        };
    }
}

async function runHealthCheck() {
    log('\n🏥 GG LOOP PLATFORM HEALTH CHECK', 'blue');
    log('='.repeat(60), 'blue');
    log(`Time: ${new Date().toLocaleString()}\n`, 'blue');

    // Check all endpoints
    log('📡 Checking Endpoints...', 'yellow');
    const endpointChecks = await Promise.all(
        Object.entries(ENDPOINTS).map(([name, url]) => checkEndpoint(name, url))
    );

    endpointChecks.forEach(check => {
        const icon = check.healthy ? '✅' : '❌';
        const color = check.healthy ? 'green' : 'red';
        const time = check.responseTime ? `${check.responseTime}ms` : 'N/A';

        log(`${icon} ${check.name.padEnd(15)} ${check.status} ${time}`, color);
        if (check.error) {
            log(`   Error: ${check.error}`, 'red');
        }
    });

    // Check database
    log('\n💾 Checking Database...', 'yellow');
    const dbCheck = await checkDatabase();
    const dbIcon = dbCheck.healthy ? '✅' : '❌';
    const dbColor = dbCheck.healthy ? 'green' : 'red';
    log(`${dbIcon} ${dbCheck.name.padEnd(15)} ${dbCheck.message}`, dbColor);

    // Summary
    log('\n📊 Summary', 'blue');
    log('='.repeat(60), 'blue');

    const totalChecks = endpointChecks.length + 1;
    const healthyChecks = endpointChecks.filter(c => c.healthy).length + (dbCheck.healthy ? 1 : 0);
    const healthPercentage = Math.round((healthyChecks / totalChecks) * 100);

    log(`Total Checks: ${totalChecks}`, 'blue');
    log(`Healthy: ${healthyChecks}`, healthyChecks === totalChecks ? 'green' : 'yellow');
    log(`Failed: ${totalChecks - healthyChecks}`, totalChecks - healthyChecks === 0 ? 'green' : 'red');
    log(`Health: ${healthPercentage}%`, healthPercentage === 100 ? 'green' : 'yellow');

    if (healthPercentage === 100) {
        log('\n🎉 ALL SYSTEMS OPERATIONAL', 'green');
    } else if (healthPercentage >= 80) {
        log('\n⚠️  SOME ISSUES DETECTED', 'yellow');
    } else {
        log('\n🚨 CRITICAL ISSUES DETECTED', 'red');
    }

    log('\n' + '='.repeat(60), 'blue');

    return {
        healthy: healthPercentage === 100,
        percentage: healthPercentage,
        checks: [...endpointChecks, dbCheck]
    };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runHealthCheck()
        .then(result => {
            process.exit(result.healthy ? 0 : 1);
        })
        .catch(error => {
            log(`\n❌ Health check failed: ${error.message}`, 'red');
            process.exit(1);
        });
}

export { runHealthCheck };
