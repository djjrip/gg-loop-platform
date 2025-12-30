// Quick script to add affiliate columns to production
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
async function addColumns() {
    console.log('Adding affiliate columns to rewards table...');
    await sql `ALTER TABLE rewards ADD COLUMN IF NOT EXISTS affiliate_url TEXT`;
    console.log('✅ affiliate_url added');
    await sql `ALTER TABLE rewards ADD COLUMN IF NOT EXISTS affiliate_commission INTEGER`;
    console.log('✅ affiliate_commission added');
    await sql `ALTER TABLE rewards ADD COLUMN IF NOT EXISTS affiliate_program VARCHAR`;
    console.log('✅ affiliate_program added');
    await sql.end();
}
addColumns().catch(console.error);
