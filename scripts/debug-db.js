import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

async function main() {
    const dbPath = path.resolve(process.cwd(), "local.db");
    console.log("Checking DB at:", dbPath);

    try {
        const sqlite = new Database(dbPath);

        // Check tables
        const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log("Tables found:", tables.map(t => t.name));

        const gamesTable = tables.find(t => t.name === 'games');
        if (gamesTable) {
            console.log("✅ 'games' table exists.");
            const count = sqlite.prepare("SELECT count(*) as count FROM games").get();
            console.log("Row count:", count.count);
        } else {
            console.error("❌ 'games' table MISSING.");
        }

    } catch (e) {
        console.error("Error opening DB:", e);
    }
}

main();
