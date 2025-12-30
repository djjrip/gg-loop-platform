import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";
import "dotenv/config";
import { sql } from "drizzle-orm";
import path from "path";
import crypto from "crypto";

async function main() {
    console.log("🌱 Seeding Vibe Coding Game Entry...");

    const databaseUrl = process.env.DATABASE_URL;
    let usePostgres = false;

    if (databaseUrl && databaseUrl.includes('postgres') && !databaseUrl.includes('""')) {
        usePostgres = true;
    }

    if (usePostgres) {
        console.log('🐘 Using PostgreSQL database (Production)');
        const client = postgres(databaseUrl);
        const db = drizzle(client, { schema });

        try {
            const existing = await db.select().from(schema.games).where(sql`title = 'Vibe Coding'`);
            if (existing.length > 0) {
                console.log("✅ 'Vibe Coding' game entry already exists (Prod):", existing[0].id);
            } else {
                console.log("➕ Creating 'Vibe Coding' game entry (Prod)...");
                const inserted = await db.insert(schema.games).values({
                    title: "Vibe Coding",
                    category: "productivity",
                    imageUrl: "https://r2.ggloop.io/vibe-coding-icon.png",
                    description: "Earn XP by coding in VS Code, Cursor, or Windsurf.",
                    isActive: true
                }).returning();
                console.log("✅ Created (Prod):", inserted[0].id);
            }
        } catch (e) {
            console.error("❌ Prod Error:", e);
        } finally {
            await client.end();
        }

    } else {
        console.log('📁 Using SQLite database (Local - Direct Mode)');
        const { default: Database } = await import("better-sqlite3");
        const dbPath = path.resolve(process.cwd(), "local.db");
        const sqlite = new Database(dbPath);

        // 1. Ensure Table Exists
        sqlite.exec(`
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (unixepoch())
        );
      `);

        // 2. Check & Insert
        const row = sqlite.prepare("SELECT id FROM games WHERE title = 'Vibe Coding'").get();

        if (row) {
            console.log("✅ 'Vibe Coding' game entry already exists (Local):", row.id);
        } else {
            console.log("➕ Creating 'Vibe Coding' game entry (Local)...");
            const newId = crypto.randomUUID();
            sqlite.prepare("INSERT INTO games (id, title, category, image_url, description, is_active) VALUES (?, ?, ?, ?, ?, ?)").run(
                newId, "Vibe Coding", "productivity", "https://r2.ggloop.io/vibe-coding-icon.png", "Earn XP by coding in VS Code, Cursor, or Windsurf.", 1
            );
            console.log("✅ Created (Local):", newId);
        }
    }
}

main();
