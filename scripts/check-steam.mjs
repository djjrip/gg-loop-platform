import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:kniPJAbzvQCUdTgNxWFOLAGOPQgdvEtY@nozomi.proxy.rlwy.net:56545/railway',
    ssl: false
});

async function check() {
    try {
        await client.connect();
        console.log('Connected to Railway PostgreSQL');

        const result = await client.query('SELECT id, user_id, steam_id, persona_name, created_at FROM steam_accounts');
        console.log('STEAM ACCOUNTS IN DATABASE:');
        console.log(JSON.stringify(result.rows, null, 2));
        console.log(`Total records: ${result.rows.length}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
