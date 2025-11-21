import { sql } from "drizzle-orm";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Auto-detect database type based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const databaseUrl = process.env.DATABASE_URL;
const usePostgres = databaseUrl?.includes('postgres');

let db: any;
let client: any;

if (usePostgres && databaseUrl) {
    // Production: PostgreSQL (Railway)
    console.log('🐘 Using PostgreSQL database');
    const queryClient = postgres(databaseUrl);
    db = drizzlePostgres(queryClient, { schema });
    client = queryClient;
} else {
    // Development: SQLite (local)
    console.log('📁 Using SQLite database (local.db)');
    const sqlite = new Database("local.db");
    db = drizzleSqlite(sqlite, { schema });
    client = sqlite;
}

export { db, client as sqlite };
