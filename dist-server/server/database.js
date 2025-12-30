import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
// Auto-detect database type based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const databaseUrl = process.env.DATABASE_URL;
const usePostgres = databaseUrl?.includes('postgres');
let db;
let client;
if (usePostgres && databaseUrl) {
    // Production: PostgreSQL (Railway)
    console.log('🐘 Using PostgreSQL database');
    const queryClient = postgres(databaseUrl, {
        max: 20,
        idle_timeout: 20,
        connect_timeout: 10,
    });
    db = drizzlePostgres(queryClient, { schema });
    client = queryClient;
}
else {
    // Development: SQLite (local)
    console.log('📁 Using SQLite database (local.db)');
    // Dynamic import to avoid production build issues with better-sqlite3
    const Database = require("better-sqlite3");
    const { drizzle: drizzleSqlite } = require("drizzle-orm/better-sqlite3");
    const sqlite = new Database("local.db");
    db = drizzleSqlite(sqlite, { schema });
    client = sqlite;
}
export { db, client as sqlite };
