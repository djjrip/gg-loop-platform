import https from 'https';

const CHECK_URL = 'https://ggloop.io';
const MAX_ATTEMPTS = 30; // 5 minutes (10 seconds * 30)
const DELAY_MS = 10000; // 10 seconds

let attempt = 0;

console.log('🔍 Monitoring Railway deployment...\n');
console.log(`Checking ${CHECK_URL} every 10 seconds...`);
console.log(`Max wait time: 5 minutes\n`);

function checkDeployment() {
    attempt++;

    https.get(CHECK_URL, (res) => {
        const timestamp = new Date().toLocaleTimeString();

        if (res.statusCode === 200) {
            console.log(`✅ [${timestamp}] Deployment LIVE! (Status: ${res.statusCode})`);
            console.log('\n🎉 Site is ready! Test login at: https://ggloop.io/login\n');
            process.exit(0);
        } else {
            console.log(`⏳ [${timestamp}] Attempt ${attempt}/${MAX_ATTEMPTS} - Status: ${res.statusCode}`);

            if (attempt >= MAX_ATTEMPTS) {
                console.log('\n⚠️  Max attempts reached. Check Railway dashboard manually.');
                process.exit(1);
            }

            setTimeout(checkDeployment, DELAY_MS);
        }
    }).on('error', (err) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`⏳ [${timestamp}] Attempt ${attempt}/${MAX_ATTEMPTS} - Deploying...`);

        if (attempt >= MAX_ATTEMPTS) {
            console.log('\n⚠️  Max attempts reached. Check Railway dashboard manually.');
            process.exit(1);
        }

        setTimeout(checkDeployment, DELAY_MS);
    });
}

checkDeployment();
