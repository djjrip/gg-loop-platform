/**
 * Database migration for email tracking
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../local.db');
const db = new Database(dbPath);

console.log('📊 Creating email tracking tables...\n');

// Create email_events table
db.exec(`
    CREATE TABLE IF NOT EXISTS email_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        url TEXT,
        campaign_type TEXT,
        sg_event_id TEXT UNIQUE,
        sg_message_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
    CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_type);
    CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
`);

console.log('✅ email_events table created');

// Create email_campaigns table
db.exec(`
    CREATE TABLE IF NOT EXISTS email_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_opened INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        total_bounced INTEGER DEFAULT 0,
        notes TEXT
    );
`);

console.log('✅ email_campaigns table created');

console.log('\n📊 Email tracking database ready!');
console.log('\nNext steps:');
console.log('1. Setup SendGrid webhook: https://app.sendgrid.com/settings/mail_settings');
console.log('2. Point webhook to: https://ggloop.io/api/webhooks/sendgrid');
console.log('3. Enable events: delivered, open, click, bounce, dropped\n');

db.close();
