import Database from 'better-sqlite3';
const db = new Database('local.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
console.log(JSON.stringify(tables, null, 2));

db.close();
