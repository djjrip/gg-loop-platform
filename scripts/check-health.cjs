const https = require('https');

const url = 'https://reward-fulfillment-production.up.railway.app/health';

console.log(`Checking ${url}...`);

https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
}).on('error', (e) => {
    console.error('Error:', e);
});
