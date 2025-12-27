// Quick script to add missing columns to production DB
import postgres from 'postgres';

const sql = postgres('postgresql://postgres:kniPJAbzvQCUdTgNxWFOLAGOPQgdvEtY@nozomi.proxy.rlwy.net:56545/railway');

async function addMissingColumns() {
    console.log('Adding missing columns to users table...');

    try {
        // Add subscription_status if not exists
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'inactive'`;
        console.log('✓ subscription_status added');

        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR`;
        console.log('✓ subscription_tier added');

        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP`;
        console.log('✓ trial_ends_at added');

        console.log('All columns added successfully!');

        // Verify
        const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
        console.log('Current users columns:', result.map(r => r.column_name).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sql.end();
    }
}

addMissingColumns();
