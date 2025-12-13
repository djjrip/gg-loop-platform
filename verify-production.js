
import https from 'https';

const BASE_URL = 'https://ggloop.io';

const endpoints = [
    { path: '/', name: 'Home Page' },
    { path: '/api/auth/discord', name: 'Discord Auth Check' },
    { path: '/api/auth/google', name: 'Google Auth Check' },
    { path: '/api/auth/twitch', name: 'Twitch Auth Check' },
    { path: '/api/games', name: 'Games API' },
];

console.log(`\n🚀 Starting Production Health Check for ${BASE_URL}...\n`);

async function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const req = https.get(`${BASE_URL}${endpoint.path}`, (res) => {
            const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
            const isAuthCheck = endpoint.path.includes('/auth/');

            // Auth checks might return 501 (Not Implemented) if keys are missing, which is "correct" behavior now
            const isExpectedError = isAuthCheck && res.statusCode === 501;

            if (isSuccess || isExpectedError) {
                console.log(`✅ ${endpoint.name}: OK (${res.statusCode})`);
                if (isExpectedError) console.log(`   (Note: 501 means strategy is correctly disabled due to missing keys)`);
            } else {
                console.log(`❌ ${endpoint.name}: FAILED (${res.statusCode})`);
            }
            resolve();
        });

        req.on('error', (e) => {
            console.log(`❌ ${endpoint.name}: ERROR (${e.message})`);
            resolve();
        });
    });
}

async function runChecks() {
    for (const endpoint of endpoints) {
        await checkEndpoint(endpoint);
    }
    console.log(`\n✨ Health Check Complete. If you see green checks, your site is reachable.`);
}

runChecks();
