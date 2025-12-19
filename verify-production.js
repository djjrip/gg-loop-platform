#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT VERIFICATION
 * 
 * This script verifies that the production deployment is healthy and all critical
 * systems are working after the emergency fix.
 * 
 * Run: node verify-production.js
 */

const PRODUCTION_URL = 'https://ggloop.io';

async function verifyProduction() {
    console.log('🔍 PRODUCTION DEPLOYMENT VERIFICATION\n');
    console.log(`Target: ${PRODUCTION_URL}`);
    console.log(`Time: ${new Date().toISOString()}\n`);

    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    // Test 1: Homepage loads
    console.log('1️⃣ Testing homepage...');
    try {
        const response = await fetch(PRODUCTION_URL);
        if (response.ok) {
            const html = await response.text();
            if (html.includes('<!DOCTYPE html>') && html.length > 1000) {
                results.passed.push('✅ Homepage renders');
            } else {
                results.failed.push('❌ Homepage HTML incomplete');
            }
        } else {
            results.failed.push(`❌ Homepage returned ${response.status}`);
        }
    } catch (error) {
        results.failed.push(`❌ Homepage unreachable: ${error.message}`);
    }

    // Test 2: Health check
    console.log('2️⃣ Testing health endpoint...');
    try {
        const response = await fetch(`${PRODUCTION_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
                results.passed.push('✅ Health check passed');
            } else {
                results.failed.push('❌ Health check returned unhealthy status');
            }
        } else {
            results.failed.push(`❌ Health endpoint returned ${response.status}`);
        }
    } catch (error) {
        results.failed.push(`❌ Health endpoint unreachable: ${error.message}`);
    }

    // Test 3: Detailed health check
    console.log('3️⃣ Testing detailed health endpoint...');
    try {
        const response = await fetch(`${PRODUCTION_URL}/health/detailed`);
        const data = await response.json();

        if (response.ok) {
            results.passed.push('✅ Detailed health check passed');

            if (data.checks?.database?.status === 'ok') {
                results.passed.push('✅ Database connected');
            } else {
                results.warnings.push('⚠️ Database check failed');
            }
        } else {
            results.warnings.push(`⚠️ Detailed health returned ${response.status} (non-critical)`);
        }
    } catch (error) {
        results.warnings.push(`⚠️ Detailed health unreachable: ${error.message}`);
    }

    // Test 4: Auth user endpoint (should return null for unauthenticated)
    console.log('4️⃣ Testing auth endpoint...');
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/auth/user`);
        if (response.ok) {
            const data = await response.json();
            // Should return null for unauthenticated users
            results.passed.push('✅ Auth endpoint accessible');
        } else if (response.status === 401) {
            results.passed.push('✅ Auth endpoint working (401 expected)');
        } else {
            results.failed.push(`❌ Auth endpoint returned ${response.status}`);
        }
    } catch (error) {
        results.failed.push(`❌ Auth endpoint unreachable: ${error.message}`);
    }

    // Test 5: Subscription status endpoint (critical fix)
    console.log('5️⃣ Testing subscription status endpoint (CRITICAL FIX)...');
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/subscription/status`);

        // This endpoint requires auth, so 401 is expected
        // The critical thing is it should NOT return 500
        if (response.status === 401) {
            results.passed.push('✅ Subscription endpoint returns 401 (auth required - CORRECT)');
        } else if (response.status === 500) {
            results.failed.push('❌ CRITICAL: Subscription endpoint still returning 500');
        } else if (response.ok) {
            results.passed.push('✅ Subscription endpoint accessible');
        } else {
            results.warnings.push(`⚠️ Subscription endpoint returned ${response.status}`);
        }
    } catch (error) {
        results.failed.push(`❌ Subscription endpoint unreachable: ${error.message}`);
    }

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION RESULTS\n');

    if (results.passed.length > 0) {
        console.log('✅ PASSED TESTS:');
        results.passed.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    if (results.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        results.warnings.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    if (results.failed.length > 0) {
        console.log('❌ FAILED TESTS:');
        results.failed.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    console.log('='.repeat(60));

    // Final verdict
    if (results.failed.length === 0) {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL - All critical tests passed!');
        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Manually verify login works (Google/Discord/Twitch)');
        console.log('   2. Check browser console for errors');
        console.log('   3. Verify dashboard loads for authenticated users');
        console.log('   4. Monitor Railway logs for any errors\n');
        return 0;
    } else {
        console.log('\n🚨 DEPLOYMENT VERIFICATION FAILED');
        console.log('\n📋 IMMEDIATE ACTIONS:');
        console.log('   1. Check Railway deployment logs');
        console.log('   2. Verify build completed successfully');
        console.log('   3. Check database connection');
        console.log('   4. Consider rollback if issues persist\n');
        return 1;
    }
}

// Run verification
verifyProduction()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
        console.error('\n💥 VERIFICATION SCRIPT CRASHED:', error);
        process.exit(1);
    });
