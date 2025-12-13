#!/usr/bin/env node

/**
 * Seed Rewards to Railway Production Database
 * 
 * This script connects to Railway's production database and seeds rewards.
 * Make sure you have the DATABASE_URL environment variable set.
 */

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Seeding Rewards to Production Database...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.error('\nTo seed production, you need to:');
    console.error('1. Get your Railway DATABASE_URL from: https://railway.app/project/[your-project]');
    console.error('2. Set it temporarily: $env:DATABASE_URL="postgresql://..."');
    console.error('3. Run this script again\n');
    process.exit(1);
}

// Verify it's a PostgreSQL URL
if (!process.env.DATABASE_URL.includes('postgresql://')) {
    console.error('❌ ERROR: DATABASE_URL must be a PostgreSQL connection string!');
    console.error(`Current value: ${process.env.DATABASE_URL.substring(0, 30)}...`);
    process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log(`📍 Connecting to: ${process.env.DATABASE_URL.substring(0, 40)}...\n`);

try {
    console.log('🌱 Running seed script...\n');

    // Run the seed script
    execSync('npx tsx server/seed-rewards.ts', {
        stdio: 'inherit',
        env: process.env
    });

    console.log('\n✅ SUCCESS! Rewards seeded to production database!');
    console.log('\n🎮 Next steps:');
    console.log('1. Visit https://ggloop.io/shop');
    console.log('2. Verify rewards are displaying');
    console.log('3. Test redemption flow\n');

} catch (error) {
    console.error('\n❌ ERROR: Failed to seed rewards');
    console.error(error.message);
    process.exit(1);
}
