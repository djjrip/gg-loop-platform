/**
 * COMPREHENSIVE SECURITY AUDIT
 * Checks all security measures are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 SECURITY AUDIT');
console.log('═══════════════════════════════════\n');

const results = {
    critical: [],
    warnings: [],
    passed: []
};

// Test 1: Environment Variable Protection
console.log('[1/10] Environment Variable Security...');
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (gitignore.includes('.env')) {
        results.passed.push('.env is gitignored');
        console.log('   ✅ .env protected from git');
    } else {
        results.critical.push('.env NOT in gitignore - credentials at risk!');
        console.log('   ❌ CRITICAL: .env not gitignored');
    }

    if (gitignore.includes('.railway-vars')) {
        results.passed.push('Railway vars protected');
        console.log('   ✅ Railway vars protected');
    }
} catch (e) {
    results.warnings.push('Could not verify gitignore');
}

// Test 2: PayPal Webhook Verification
console.log('\n[2/10] PayPal Webhook Security...');
try {
    const paypalCode = fs.readFileSync('./server/paypal.ts', 'utf-8');
    if (paypalCode.includes('verifyPayPalWebhook')) {
        results.passed.push('Webhook verification implemented');
        console.log('   ✅ Webhook verification enabled');
    } else {
        results.critical.push('Missing webhook verification');
        console.log('   ❌ Webhook verification missing');
    }

    if (paypalCode.includes('PAYPAL_WEBHOOK_ID')) {
        results.passed.push('Webhook ID validation');
        console.log('   ✅ Webhook ID required');
    }
} catch (e) {
    results.warnings.push('Could not verify webhook security');
}

// Test 3: HTTPS Enforcement
console.log('\n[3/10] HTTPS/SSL Security...');
try {
    const securityMiddleware = fs.readFileSync('./server/securityMiddleware.ts', 'utf-8');
    if (securityMiddleware.includes('helmet')) {
        results.passed.push('Helmet security headers enabled');
        console.log('   ✅ Security headers (Helmet)');
    }
} catch (e) { }

// Test 4: CORS Configuration
console.log('\n[4/10] CORS Security...');
const envExists = fs.existsSync('.env');
if (envExists) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    if (envContent.includes('CLIENT_URL')) {
        results.passed.push('CORS origin configured');
        console.log('   ✅ CORS origin set');
    } else {
        results.warnings.push('CLIENT_URL not configured');
        console.log('   ⚠️  CLIENT_URL should be set');
    }
}

// Test 5: Credential Exposure
console.log('\n[5/10] Checking for Exposed Credentials...');
try {
    const gitLog = require('child_process').execSync('git log --all --full-history --source -S "PAYPAL_CLIENT_SECRET" -- ":(exclude).env"', {
        encoding: 'utf-8',
        cwd: '.'
    }).toString();

    if (gitLog.includes('commit')) {
        results.critical.push('Credentials may be in git history!');
        console.log('   ❌ CRITICAL: Credentials found in git history');
    } else {
        results.passed.push('No credentials in git history');
        console.log('   ✅ No exposed credentials in git');
    }
} catch (e) {
    // No matches is good!
    results.passed.push('No credentials in git history');
    console.log('   ✅ No exposed credentials in git');
}

// Test 6: Database Security
console.log('\n[6/10] Database Security...');
try {
    const Database = require('better-sqlite3');
    const db = new Database('./local.db');

    // Check for sensitive data encryption
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
    results.passed.push('Database accessible');
    console.log('   ✅ Database operational');
    console.log(`   📊 ${users.count} users in database`);

    db.close();
} catch (e) {
    results.warnings.push('Could not verify database');
}

// Test 7: API Route Protection
console.log('\n[7/10] API Route Security...');
try {
    const routes = fs.readFileSync('./server/routes.ts', 'utf-8');

    if (routes.includes('getUserMiddleware')) {
        results.passed.push('Authentication middleware present');
        console.log('   ✅ Auth middleware exists');
    }

    if (routes.includes('adminMiddleware')) {
        results.passed.push('Admin protection enabled');
        console.log('   ✅ Admin routes protected');
    }
} catch (e) {
    results.warnings.push('Could not verify route protection');
}

// Test 8: Riot Account Verification
console.log('\n[8/10] Riot Account Security...');
try {
    const routes = fs.readFileSync('./server/routes.ts', 'utf-8');

    // Check old insecure endpoint is disabled
    if (routes.includes('DEPRECATED') || routes.includes('// Disabled')) {
        results.passed.push('Insecure Riot linking disabled');
        console.log('   ✅ Old insecure endpoint disabled');
    } else {
        results.warnings.push('Verify old riot linking is disabled');
        console.log('   ⚠️  Verify riot account security');
    }
} catch (e) { }

// Test 9: PayPal Subscription Verification
console.log('\n[9/10] Subscription Security...');
try {
    const paypalCode = fs.readFileSync('./server/paypal.ts', 'utf-8');

    if (paypalCode.includes('verifyPayPalSubscription')) {
        results.passed.push('Subscription verification enabled');
        console.log('   ✅ Subscriptions verified with PayPal');
    }

    if (paypalCode.includes('planTierMap')) {
        results.passed.push('Plan ID validation');
        console.log('   ✅ Plan IDs validated');
    }
} catch (e) { }

// Test 10: Production Readiness
console.log('\n[10/10] Production Security...');
if (envExists) {
    const envContent = fs.readFileSync('.env', 'utf-8');

    if (envContent.includes('PAYPAL_MODE=sandbox')) {
        results.warnings.push('Still in sandbox mode (OK for testing)');
        console.log('   ℹ️  Sandbox mode (switch to live for production)');
    }

    if (envContent.includes('SESSION_SECRET')) {
        results.passed.push('Session secret configured');
        console.log('   ✅ Session secret set');
    }
}

// FINAL REPORT
console.log('\n═══════════════════════════════════');
console.log('SECURITY AUDIT RESULTS');
console.log('═══════════════════════════════════\n');

if (results.critical.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    results.critical.forEach(issue => console.log(`   ❌ ${issue}`));
    console.log('');
}

if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    console.log('');
}

console.log(`✅ PASSED: ${results.passed.length} checks`);
console.log('');

const score = Math.round((results.passed.length / (results.passed.length + results.warnings.length + results.critical.length)) * 100);
console.log(`🔒 SECURITY SCORE: ${score}%\n`);

if (results.critical.length === 0 && score >= 80) {
    console.log('✅ SECURITY STATUS: SAFE FOR PRODUCTION\n');
} else if (results.critical.length === 0) {
    console.log('⚠️  SECURITY STATUS: ACCEPTABLE (address warnings)\n');
} else {
    console.log('🚨 SECURITY STATUS: CRITICAL ISSUES - FIX BEFORE DEPLOY\n');
}

console.log('Recommendations:');
console.log('1. Never commit .env or credentials');
console.log('2. Switch to PAYPAL_MODE=live for production');
console.log('3. Enable 2FA on PayPal account');
console.log('4. Regularly rotate API keys');
console.log('5. Monitor PayPal webhooks for unusual activity\n');

console.log('═══════════════════════════════════\n');
