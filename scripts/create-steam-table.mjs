import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:kniPJAbzvQCUdTgNxWFOLAGOPQgdvEtY@nozomi.proxy.rlwy.net:56545/railway',
    ssl: false
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to Railway PostgreSQL');

        // Create steam_accounts table
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS steam_accounts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        steam_id VARCHAR NOT NULL UNIQUE,
        profile_url TEXT,
        avatar TEXT,
        persona_name TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

        await client.query(createTableSQL);
        console.log('steam_accounts table created');

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_steam_accounts_user ON steam_accounts(user_id);`);
        console.log('idx_steam_accounts_user index created');

        await client.query(`CREATE INDEX IF NOT EXISTS idx_steam_accounts_steam_id ON steam_accounts(steam_id);`);
        console.log('idx_steam_accounts_steam_id index created');

        // Verify table exists
        const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'steam_accounts';
    `);

        if (result.rows.length > 0) {
            console.log('VERIFIED: steam_accounts table exists in production database');
        } else {
            console.log('ERROR: Table was not created');
        }

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

migrate();
