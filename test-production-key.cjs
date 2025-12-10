const axios = require('axios');

const PRODUCTION_KEY = 'RGAPI-99c69f9e-bf11-4e16-a73e-8b0441ae663d';

console.log('Testing PRODUCTION Riot API Key...\n');

async function testProductionKey() {
    try {
        const url = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/JRIP/kuya';

        console.log('Testing with your account: JRIP#kuya');
        console.log('Using PRODUCTION key (never expires)\n');

        const response = await axios.get(url, {
            headers: {
                'X-Riot-Token': PRODUCTION_KEY
            },
            timeout: 10000
        });

        console.log('✅ PRODUCTION KEY WORKS!');
        console.log('Account found:');
        console.log(`  PUUID: ${response.data.puuid}`);
        console.log(`  Name: ${response.data.gameName}#${response.data.tagLine}`);
        console.log('\n🎉 This key NEVER expires - set it once and forget!');

    } catch (error) {
        if (error.response) {
            console.log(`❌ FAILED: ${error.response.status}`);
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ ERROR:', error.message);
        }
    }
}

testProductionKey();
