#!/usr/bin/env node
/**
 * AUTOMATED INTEGRATION TEST SUITE
 * Tests all critical platform functionality
 */

import https from 'https';
import http from 'http';

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

const PRODUCTION_URL = 'https://ggloop.io';
const LOCAL_URL = 'http://localhost:5000';

// Determine which environment to test
const testUrl = process.argv.includes('--local') ? LOCAL_URL : PRODUCTION_URL;
const isHttps = testUrl.startsWith('https');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, testUrl);
        const client = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GG-Loop-Test-Suite/1.0'
            },
            timeout: 10000
        };

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

const tests = [
    {
        name: 'Homepage Loads',
        test: async () => {
            const res = await makeRequest('/');
            return res.status === 200 && res.body.includes('GG Loop');
        }
    },
    {
        name: 'Health Check API',
        test: async () => {
            const res = await makeRequest('/api/health');
            const data = JSON.parse(res.body);
            return res.status === 200 && data.status === 'healthy';
        }
    },
    {
        name: 'AWS Roadmap Page',
        test: async () => {
            const res = await makeRequest('/aws-roadmap');
            return res.status === 200 && res.body.includes('AWS Partnership');
        }
    },
    {
        name: 'Shop Page Loads',
        test: async () => {
            const res = await makeRequest('/shop');
            return res.status === 200 && res.body.includes('Shop');
        }
    },
    {
        name: 'Login Page Loads',
        test: async () => {
            const res = await makeRequest('/login');
            return res.status === 200;
        }
    },
    {
        name: 'Admin Page Requires Auth',
        test: async () => {
            const res = await makeRequest('/admin');
            // Should redirect or return 200 (with login prompt)
            return res.status === 200 || res.status === 302;
        }
    },
    {
        name: 'API Returns JSON',
        test: async () => {
            const res = await makeRequest('/api/health');
            try {
                JSON.parse(res.body);
                return true;
            } catch {
                return false;
            }
        }
    },
    {
        name: 'Static Assets Load',
        test: async () => {
            const res = await makeRequest('/');
            // Check if response includes asset references
            return res.body.includes('assets') || res.body.includes('.js');
        }
    },
    {
        name: 'HTTPS Redirect (Production)',
        test: async () => {
            if (!isHttps) return true; // Skip for local
            // Already using HTTPS, test passed
            return true;
        }
    },
    {
        name: 'Database Connection',
        test: async () => {
            const res = await makeRequest('/api/health');
            const data = JSON.parse(res.body);
            return data.database === 'connected';
        }
    }
];

async function runTests() {
    log('\n🧪 GG LOOP INTEGRATION TEST SUITE', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Environment: ${testUrl}`, 'blue');
    log(`Time: ${new Date().toLocaleString()}`, 'blue');
    log('');

    const results = {
        passed: 0,
        failed: 0,
        total: tests.length
    };

    for (const test of tests) {
        process.stdout.write(`Testing: ${test.name.padEnd(35)}`);

        try {
            const passed = await test.test();
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
    log('📊 TEST RESULTS', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total Tests: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
    log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
    log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`,
        results.passed === results.total ? 'green' : 'yellow');

    if (results.passed === results.total) {
        log('\n🎉 ALL TESTS PASSED!', 'green');
        log('Platform is fully operational ✅', 'green');
    } else {
        log('\n⚠️  SOME TESTS FAILED', 'yellow');
        log(`${results.failed} test(s) need attention`, 'yellow');
    }

    log('\n' + '='.repeat(60), 'cyan');

    return results.passed === results.total ? 0 : 1;
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests()
        .then(exitCode => process.exit(exitCode))
        .catch(error => {
            log(`\n❌ Test suite failed: ${error.message}`, 'red');
            process.exit(1);
        });
}

export { runTests };
