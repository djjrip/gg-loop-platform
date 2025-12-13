const axios = require('axios');

const API_KEY = 'RGAPI-e9659c60-c7a9-435f-b6c6-5c6fbcd12a91';

console.log('Testing Riot API Key...\n');

async function testRiotAPI() {
    try {
        // Test with the official Riot test account
        const url = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Riot/NA1';

        console.log(`Making request to: ${url}`);
        console.log(`Using API Key: ${API_KEY.substring(0, 15)}...`);

        const response = await axios.get(url, {
            headers: {
                'X-Riot-Token': API_KEY
            },
            timeout: 10000
        });

        console.log('\n✅ API KEY IS VALID!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.log('\n❌ API REQUEST FAILED');
            console.log(`Status: ${error.response.status}`);
            console.log(`Message: ${JSON.stringify(error.response.data, null, 2)}`);

            if (error.response.status === 403) {
                console.log('\n🚨 API KEY EXPIRED OR INVALID');
                console.log('Action: Get new key from https://developer.riotgames.com/');
            } else if (error.response.status === 401) {
                console.log('\n🚨 API KEY UNAUTHORIZED');
                console.log('Check if key is correctly formatted');
            }
        } else {
            console.log('\n❌ ERROR:', error.message);
        }
    }
}

testRiotAPI();
