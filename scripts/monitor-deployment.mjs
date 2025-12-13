#!/usr/bin/env node
/**
 * RAILWAY DEPLOYMENT MONITOR
 * Watches Railway deployments and alerts when complete
 */

import https from 'https';

const SITE_URL = 'https://ggloop.io';
const CHECK_INTERVAL = 10000; // 10 seconds
const MAX_WAIT = 300000; // 5 minutes

function checkDeployment(url) {
    return new Promise((resolve) => {
        https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data,
                    headers: res.headers
                });
            });
        }).on('error', () => resolve({ status: 0 }));
    });
}

async function monitorDeployment() {
    console.log('🔍 Monitoring Railway deployment...');
    console.log(`📍 Site: ${SITE_URL}`);
    console.log(`⏱️  Checking every ${CHECK_INTERVAL / 1000}s for ${MAX_WAIT / 1000}s max\n`);

    const startTime = Date.now();
    let lastETag = null;

    while (Date.now() - startTime < MAX_WAIT) {
        const result = await checkDeployment(SITE_URL);
        const elapsed = Math.round((Date.now() - startTime) / 1000);

        if (result.status === 200) {
            const currentETag = result.headers?.etag;

            if (currentETag && currentETag !== lastETag && lastETag !== null) {
                console.log(`\n✅ NEW DEPLOYMENT DETECTED! (${elapsed}s)`);
                console.log(`🔄 ETag changed: ${lastETag} → ${currentETag}`);
                console.log(`🌐 Site is live: ${SITE_URL}`);
                return true;
            }

            lastETag = currentETag;
            process.stdout.write(`\r⏳ Waiting... ${elapsed}s (Status: ${result.status})`);
        } else {
            process.stdout.write(`\r⚠️  Site down... ${elapsed}s (Status: ${result.status})`);
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }

    console.log(`\n⏰ Timeout after ${MAX_WAIT / 1000}s`);
    return false;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    monitorDeployment()
        .then(success => {
            if (success) {
                console.log('\n🎉 Deployment complete!');
                process.exit(0);
            } else {
                console.log('\n⚠️  Deployment not detected within timeout');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error(`\n❌ Monitor error: ${error.message}`);
            process.exit(1);
        });
}

export { monitorDeployment };
