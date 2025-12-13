import https from 'https';

const TESTS = [
    { name: 'Homepage', url: 'https://ggloop.io', expectedStatus: 200 },
    { name: 'Login Page', url: 'https://ggloop.io/login', expectedStatus: 200 },
    { name: 'API Health', url: 'https://ggloop.io/api/games', expectedStatus: 200 },
    { name: 'Discord Auth Init', url: 'https://ggloop.io/api/auth/discord', expectedStatus: 302 },
];

console.log('🔍 ACTUAL SITE VERIFICATION\n');
console.log('Testing live site at https://ggloop.io...\n');

let passed = 0;
let failed = 0;

async function testEndpoint(test) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        https.get(test.url, (res) => {
            const responseTime = Date.now() - startTime;
            const success = res.statusCode === test.expectedStatus;

            if (success) {
                console.log(`✅ ${test.name}: ${res.statusCode} (${responseTime}ms)`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${res.statusCode} (${responseTime}ms)`);
                failed++;
            }

            resolve(success);
        }).on('error', (err) => {
            console.log(`❌ ${test.name}: ${err.message}`);
            failed++;
            resolve(false);
        });
    });
}

async function runTests() {
    for (const test of TESTS) {
        await testEndpoint(test);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log(`\n✅ VERIFIED: Site is actually working`);
    } else {
        console.log(`\n⚠️  ISSUES DETECTED: ${failed} endpoint(s) failing`);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
