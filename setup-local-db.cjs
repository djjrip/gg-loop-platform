const Database = require('better-sqlite3');
const db = new Database('local.db');

console.log('Creating SQLite tables for local development...\n');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    oidc_sub TEXT UNIQUE,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    total_points INTEGER NOT NULL DEFAULT 0,
    gg_coins INTEGER NOT NULL DEFAULT 0,
    primary_game TEXT,
    games_connected INTEGER NOT NULL DEFAULT 0,
    twitch_id TEXT UNIQUE,
    twitch_username TEXT,
    twitch_access_token TEXT,
    twitch_refresh_token TEXT,
    twitch_connected_at INTEGER,
    tiktok_open_id TEXT UNIQUE,
    tiktok_union_id TEXT,
    tiktok_username TEXT,
    tiktok_access_token TEXT,
    tiktok_refresh_token TEXT,
    tiktok_connected_at INTEGER,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT DEFAULT 'US',
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES users(id),
    is_founder INTEGER NOT NULL DEFAULT 0,
    founder_number INTEGER UNIQUE,
    free_trial_started_at INTEGER,
    free_trial_ends_at INTEGER,
    last_login_at INTEGER,
    login_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    xp_level INTEGER NOT NULL DEFAULT 1,
    xp_points INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);
console.log('✅ Created users table');

// Create riot_accounts table
db.exec(`
  CREATE TABLE IF NOT EXISTS riot_accounts (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    puuid TEXT NOT NULL,
    gameName TEXT,
    tagLine TEXT,
    region TEXT,
    summonerId TEXT,
    accountId TEXT,
    profileIconId INTEGER,
    summonerLevel INTEGER,
    verified INTEGER NOT NULL DEFAULT 0,
    last_verified_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(user_id, game)
  )
`);
console.log('✅ Created riot_accounts table');

// Create sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )
`);
console.log('✅ Created sessions table');

// Create games table
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);
console.log('✅ Created games table');

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n=== Tables in database ===');
tables.forEach(t => console.log(`  - ${t.name}`));

// Check counts
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const riotCount = db.prepare('SELECT COUNT(*) as count FROM riot_accounts').get();
console.log(`\nusers: ${userCount.count} rows`);
console.log(`riot_accounts: ${riotCount.count} rows`);

db.close();
console.log('\n✅ Database setup complete!');
