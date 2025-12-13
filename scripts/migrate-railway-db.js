#!/usr/bin/env node
/**
 * Railway Database Migration Runner
 * Run this ONCE after deployment to set up the database schema
 * 
 * Usage: node scripts/migrate-railway-db.js
 */

import { execSync } from 'child_process';
import 'dotenv/config';

console.log('🗄️  Running database migrations on Railway...');

try {
    // Verify DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable not set!');
        console.error('Set it in Railway dashboard → Variables');
        process.exit(1);
    }

    console.log('📊 Detected database:', process.env.DATABASE_URL.includes('postgres') ? 'PostgreSQL' : 'Unknown');

    // Run migrations
    console.log('Running: npm run db:push');
    execSync('npm run db:push', { stdio: 'inherit' });

    console.log('✅ Database migrations completed successfully!');
    console.log('🚀 You can now start the server with: npm start');

} catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\nTroubleshooting:');
    console.error('1. Verify DATABASE_URL is correct in Railway');
    console.error('2. Ensure PostgreSQL service is running');
    console.error('3. Check Railway logs for detailed error messages');
    process.exit(1);
}
