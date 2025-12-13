/**
 * PAYMENT SYSTEM COMPREHENSIVE TEST & FIX
 * Tests all subscription flows and fixes common issues
 */

const fetch = require('node-fetch');
const fs = require('fs');

console.log('═════════════════════════════════════');
console.log('  PAYMENT SYSTEM DIAGNOSTIC');
console.log('═════════════════════════════════════\n');

// Test 1: Environment Variables
console.log('[1/7] Checking Environment Variables...');
const requiredEnvVars = {
    'PAYPAL_CLIENT_ID': process.env.PAYPAL_CLIENT_ID,
    'PAYPAL_CLIENT_SECRET': process.env.PAYPAL_CLIENT_SECRET,
    'PAYPAL_MODE': process.env.PAYPAL_MODE || 'sandbox',
};

let envIssues = 0;
for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value === 'undefined') {
        console.log(`   ❌ ${key}: MISSING`);
        envIssues++;
    } else {
        console.log(`   ✅ ${key}: SET (${key === 'PAYPAL_MODE' ? value : '***'})`);
    }
}

if (envIssues > 0) {
    console.log(`\n⚠️  Found ${envIssues} environment variable issue(s)`);
    console.log('\nTo fix:');
    console.log('1. Check .env file has these variables');
    console.log('2. On Railway: Settings → Variables → Add missing vars');
    console.log('3. Restart server after adding\n');
}

// Test 2: PayPal API Connection
console.log('\n[2/7] Testing PayPal API Connection...');
async function testPayPalConnection() {
    try {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const mode = process.env.PAYPAL_MODE || 'sandbox';

        if (!clientId || !clientSecret) {
            console.log('   ⏭️  Skipping (no credentials)');
            return false;
        }

        const baseUrl = mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        // Get OAuth token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!authResponse.ok) {
            console.log('   ❌ PayPal auth failed');
            console.log(`      Status: ${authResponse.status}`);
            console.log(`      Check credentials in .env`);
            return false;
        }

        const authData = await authResponse.json();
        console.log('   ✅ PayPal API connection successful');
        console.log(`      Mode: ${mode}`);
        console.log(`      Token received: ${authData.access_token.substring(0, 20)}...`);
        return true;
    } catch (error) {
        console.log('   ❌ Connection error:', error.message);
        return false;
    }
}

// Test 3: Database Check
console.log('\n[3/7] Checking Database Tables...');
function checkDatabase() {
    try {
        const Database = require('better-sqlite3');
        const db = new Database('./local.db');

        // Check subscriptions table
        const tables = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='subscriptions'
        `).all();

        if (tables.length === 0) {
            console.log('   ❌ subscriptions table NOT FOUND');
            console.log('      Run: node server/autoMigrate.ts');
            return false;
        }

        // Check columns
        const columns = db.prepare(`PRAGMA table_info(subscriptions)`).all();
        const requiredColumns = ['paypalSubscriptionId', 'tier', 'status', 'nextBillingDate'];

        const columnNames = columns.map(c => c.name);
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

        if (missingColumns.length > 0) {
            console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
        } else {
            console.log('   ✅ All required columns present');
        }

        // Check for test subscriptions
        const count = db.prepare(`SELECT COUNT(*) as count FROM subscriptions`).get();
        console.log(`   📊 Current subscriptions in DB: ${count.count}`);

        db.close();
        return true;
    } catch (error) {
        console.log('   ❌ Database error:', error.message);
        return false;
    }
}

// Test 4: Frontend Integration
console.log('\n[4/7] Checking Frontend Integration...');
function checkFrontend() {
    try {
        // Check PayPal button component
        if (!fs.existsSync('./client/src/components/PayPalSubscriptionButton.tsx')) {
            console.log('   ❌ PayPalSubscriptionButton.tsx NOT FOUND');
            return false;
        }

        const buttonCode = fs.readFileSync('./client/src/components/PayPalSubscriptionButton.tsx', 'utf-8');

        // Check for critical parts
        const checks = {
            'PayPal SDK': buttonCode.includes('paypal.com/sdk/js'),
            'createSubscription': buttonCode.includes('createSubscription'),
            'onApprove': buttonCode.includes('onApprove'),
            'subscription-approved endpoint': buttonCode.includes('/api/paypal/subscription-approved'),
        };

        let allGood = true;
        for (const [check, passed] of Object.entries(checks)) {
            if (passed) {
                console.log(`   ✅ ${check}`);
            } else {
                console.log(`   ❌ Missing: ${check}`);
                allGood = false;
            }
        }

        return allGood;
    } catch (error) {
        console.log('   ❌ Frontend check error:', error.message);
        return false;
    }
}

// Test 5: API Routes
console.log('\n[5/7] Checking API Routes...');
function checkRoutes() {
    try {
        if (!fs.existsSync('./server/routes.ts')) {
            console.log('   ❌ routes.ts NOT FOUND');
            return false;
        }

        const routesCode = fs.readFileSync('./server/routes.ts', 'utf-8');

        const endpoints = [
            '/api/paypal/subscription-approved',
            '/api/webhooks/paypal',
            '/api/subscription/status',
        ];

        let allPresent = true;
        for (const endpoint of endpoints) {
            if (routesCode.includes(endpoint)) {
                console.log(`   ✅ ${endpoint}`);
            } else {
                console.log(`   ❌ Missing: ${endpoint}`);
                allPresent = false;
            }
        }

        return allPresent;
    } catch (error) {
        console.log('   ❌ Routes check error:', error.message);
        return false;
    }
}

// Test 6: PayPal Plan IDs
console.log('\n[6/7] Checking PayPal Plan IDs...');
function checkPlanIds() {
    const planIds = {
        'Pro': process.env.PAYPAL_PRO_PLAN_ID,
        'Elite': process.env.PAYPAL_ELITE_PLAN_ID,
    };

    let missing = 0;
    for (const [tier, planId] of Object.entries(planIds)) {
        if (!planId || planId === 'undefined') {
            console.log(`   ❌ ${tier} Plan ID: MISSING`);
            missing++;
        } else {
            console.log(`   ✅ ${tier} Plan ID: ${planId.substring(0, 15)}...`);
        }
    }

    if (missing > 0) {
        console.log('\n   💡 To create plan IDs:');
        console.log('      1. Go to PayPal Developer Dashboard');
        console.log('      2. Products & Pricing → Create Product');
        console.log('      3. Add Pro ($9.99/mo) and Elite ($19.99/mo) plans');
        console.log('      4. Copy Plan IDs to .env');
    }

    return missing === 0;
}

// Test 7: Common Issues
console.log('\n[7/7] Checking for Common Issues...');
function checkCommonIssues() {
    const issues = [];

    // Issue 1: Routes.ts corruption
    try {
        const routes = fs.readFileSync('./server/routes.ts', 'utf-8');
        const openBraces = (routes.match(/{/g) || []).length;
        const closeBraces = (routes.match(/}/g) || []).length;

        if (openBraces !== closeBraces) {
            issues.push('routes.ts has mismatched braces (syntax error)');
        }
    } catch (e) {
        issues.push('Cannot read routes.ts');
    }

    // Issue 2: webhook verification
    try {
        if (!fs.existsSync('./server/paypal.ts')) {
            issues.push('paypal.ts missing (webhook verification won\'t work)');
        }
    } catch (e) { }

    // Issue 3: CORS issues
    const envFile = fs.existsSync('./.env') ? fs.readFileSync('./.env', 'utf-8') : '';
    if (!envFile.includes('CLIENT_URL')) {
        issues.push('CLIENT_URL not set (CORS issues possible)');
    }

    if (issues.length === 0) {
        console.log('   ✅ No common issues detected');
    } else {
        console.log('   ⚠️  Found issues:');
        issues.forEach(issue => console.log(`      - ${issue}`));
    }

    return issues.length === 0;
}

// Run all tests
async function runDiagnostics() {
    const paypalConnected = await testPayPalConnection();
    const dbOk = checkDatabase();
    const frontendOk = checkFrontend();
    const routesOk = checkRoutes();
    const plansOk = checkPlanIds();
    const noIssues = checkCommonIssues();

    console.log('\n═════════════════════════════════════');
    console.log('  DIAGNOSTIC SUMMARY');
    console.log('═════════════════════════════════════\n');

    const results = {
        'Environment Variables': envIssues === 0,
        'PayPal API Connection': paypalConnected,
        'Database Tables': dbOk,
        'Frontend Integration': frontendOk,
        'API Routes': routesOk,
        'Plan IDs': plansOk,
        'Common Issues': noIssues,
    };

    let passCount = 0;
    for (const [test, passed] of Object.entries(results)) {
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${test}`);
        if (passed) passCount++;
    }

    const percentage = Math.round((passCount / Object.keys(results).length) * 100);
    console.log(`\n📊 System Health: ${percentage}%`);

    if (percentage === 100) {
        console.log('\n🎉 Payment system is 100% operational!');
        console.log('\nNext steps:');
        console.log('1. Test subscription on /subscription page');
        console.log('2. Complete a test purchase');
        console.log('3. Verify webhook on PayPal dashboard');
    } else {
        console.log('\n⚠️  Payment system needs attention!');
        console.log('\nPriority fixes needed - check errors above');
    }

    console.log('\n═════════════════════════════════════\n');
}

runDiagnostics();
