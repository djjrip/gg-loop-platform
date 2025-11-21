import { defineConfig } from "drizzle-kit";

// Use PostgreSQL for production (Railway), SQLite for local development
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DATABASE_URL?.includes('postgres') || isProduction;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: usePostgres ? "postgresql" : "sqlite",
  dbCredentials: usePostgres
    ? {
      url: process.env.DATABASE_URL!,
    }
    : {
      url: "local.db",
    },
});
