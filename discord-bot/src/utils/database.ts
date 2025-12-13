import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './logger';

const dbPath = path.join(__dirname, '../../data/mod-logs.db');
const db = new Database(dbPath);

export function initDatabase() {
    logger.info('Initializing database...');

    // Create tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      reason TEXT NOT NULL,
      moderatorId TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS timeouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      reason TEXT NOT NULL,
      duration INTEGER NOT NULL,
      moderatorId TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      reason TEXT NOT NULL,
      moderatorId TEXT NOT NULL,
      permanent INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS message_spam (
      userId TEXT NOT NULL,
      messageCount INTEGER NOT NULL DEFAULT 1,
      windowStart INTEGER NOT NULL,
      PRIMARY KEY (userId)
    );
    
    CREATE TABLE IF NOT EXISTS user_violations (
      userId TEXT NOT NULL,
      violationType TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      lastViolation INTEGER NOT NULL,
      PRIMARY KEY (userId, violationType)
    );
  `);

    logger.info('Database initialized successfully');
}

export { db };
