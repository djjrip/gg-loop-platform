/**
 * QUICK FIX: Update Railway Environment Variables
 * Run this to add RIOT_API_KEY to Railway
 */

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

const RIOT_API_KEY = 'RGAPI-99c69f9e-bf11-4e16-a73e-8b0441ae663d';

async function updateRailwayEnv() {
    const response = await fetch('https://backboard.railway.app/graphql/v2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RAILWAY_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
        mutation variableUpsert($input: VariableUpsertInput!) {
          variableUpsert(input: $input)
        }
      `,
            variables: {
                input: {
                    projectId: PROJECT_ID,
                    environmentId: ENVIRONMENT_ID,
                    name: 'RIOT_API_KEY',
                    value: RIOT_API_KEY,
                },
            },
        }),
    });

    const result = await response.json();
    console.log('✅ RIOT_API_KEY added to Railway:', result);
}

updateRailwayEnv();

/*
 * IMMEDIATE FIX:
 * Go to Railway dashboard:
 * 1. Click your GG LOOP service
 * 2. Click "Variables" tab
 * 3. Click "+ New Variable"
 * 4. Name: RIOT_API_KEY
 * 5. Value: RGAPI-99c69f9e-bf11-4e16-a73e-8b0441ae663d
 * 6. Click "Add"
 * 7. Railway auto-redeploys (30 seconds)
 * 
 * DONE - Error fixed!
 */
