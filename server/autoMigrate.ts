// Auto-create database tables on startup (Railway production + local dev)
import Database from 'better-sqlite3';

export function ensureDatabaseTables() {
    try {
        const db = new Database('local.db');

        console.log('🗄️  Ensuring database tables exist...');

        // Create riot_verifications table if it doesn't exist
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

        console.log('✅ riot_verifications table ready');

        db.close();
    } catch (error) {
        console.error('⚠️  Database table creation failed (may already exist):', error);
        // Don't crash - tables might use PostgreSQL in production
    }
}
