const axios = require('axios');

const API_KEY = 'RGAPI-c24e9c1e-21fd-4d05-9f15-84a97901699d';

console.log('Testing NEW Riot API Key...\n');

async function testRiotAPI() {
    try {
        const url = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/JRIP/kuya';

        console.log(`Testing with your Riot ID: JRIP#kuya`);
        console.log(`Request: ${url}\n`);

        const response = await axios.get(url, {
            headers: {
                'X-Riot-Token': API_KEY
            },
            timeout: 10000
        });

        console.log('✅ API KEY WORKS!');
        console.log('Account found:');
        console.log(`  PUUID: ${response.data.puuid}`);
        console.log(`  Name: ${response.data.gameName}#${response.data.tagLine}`);
        console.log('\n✅ Riot account linking will now work!');

    } catch (error) {
        if (error.response) {
            console.log(`❌ FAILED: ${error.response.status}`);
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ ERROR:', error.message);
        }
    }
}

testRiotAPI();
