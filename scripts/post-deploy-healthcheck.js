#!/usr/bin/env node
/**
 * Post-Deploy Health Check for Railway
 * This script verifies the deployment is healthy after Railway completes the build
 */

const BASE_URL = process.env.BASE_URL || 'https://ggloop.io';

console.log('🏥 Running post-deploy health checks...');
console.log(`Target: ${BASE_URL}`);

async function checkHealth() {
    try {
        // Check if server responds
        const response = await fetch(`${BASE_URL}/health`, {
            timeout: 10000,
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check passed:', data);
            return true;
        } else {
            console.error(`❌ Health check failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Health check failed:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

async function checkDatabase() {
    try {
        console.log('📊 Checking database connection...');
        const response = await fetch(`${BASE_URL}/api/games`);

        if (response.ok) {
            console.log('✅ Database connection OK');
            return true;
        } else {
            console.error(`❌ Database check failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Database check failed:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

async function main() {
    console.log('Waiting 5 seconds for server to fully start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const healthOk = await checkHealth();
    const dbOk = await checkDatabase();

    if (healthOk && dbOk) {
        console.log('🎉 All checks passed! Deployment successful.');
        process.exit(0);
    } else {
        console.error('⚠️ Some checks failed. Review logs above.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error during health check:', error);
    process.exit(1);
});
