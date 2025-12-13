const Database = require('better-sqlite3');
const db = new Database('local.db');

console.log('=== CHECKING DATABASE TABLES ===\n');

// List all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n=== CHECKING USERS TABLE ===');
try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`Users table exists with ${userCount.count} rows`);
} catch (err) {
    console.log(`❌ Users table error: ${err.message}`);
}

console.log('\n=== CHECKING RIOT_ACCOUNTS TABLE ===');
try {
    const riotCount = db.prepare('SELECT COUNT(*) as count FROM riot_accounts').get();
    console.log(`riot_accounts table exists with ${riotCount.count} rows`);
} catch (err) {
    console.log(`❌ riot_accounts table error: ${err.message}`);
}

db.close();
