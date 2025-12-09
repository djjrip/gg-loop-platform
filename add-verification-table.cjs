const Database = require('better-sqlite3');
const db = new Database('local.db');

console.log('Adding riot_verifications table for ownership verification...\n');

// Create riot_verifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS riot_verifications (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    game_name TEXT NOT NULL,
    tag_line TEXT NOT NULL,
    region TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    expires_at INTEGER NOT NULL
  )
`);

console.log('✅ Created riot_verifications table');

// Verify
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='riot_verifications'").all();
if (tables.length > 0) {
    console.log('✅ Table verified in database');
} else {
    console.log('❌ Table creation failed');
}

db.close();
console.log('\n✅ Database update complete!');
