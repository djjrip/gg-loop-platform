
import Database from 'better-sqlite3';

console.log("Running Manual Migration for steam_accounts...");

const db = new Database('local.db');

const query = `
CREATE TABLE IF NOT EXISTS steam_accounts (
  id varchar PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id varchar NOT NULL,
  steam_id varchar NOT NULL UNIQUE,
  profile_url text,
  avatar text,
  persona_name text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_steam_accounts_user ON steam_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_steam_accounts_steam_id ON steam_accounts (steam_id);
`;

try {
    db.exec(query);
    console.log("Migration Successful.");
} catch (err) {
    console.error("Migration Failed:", err);
}
