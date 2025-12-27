// Auto-seed production rewards
// Tries multiple methods to get DATABASE_URL and seed rewards

import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 AUTO-SEEDING PRODUCTION REWARDS');
console.log('='.repeat(50));
console.log('');

// Method 1: Try Railway CLI
async function tryRailwayCLI() {
  try {
    console.log('📡 Method 1: Trying Railway CLI...');
    const { stdout, stderr } = await execAsync('railway run npm run seed:rewards', {
      cwd: path.join(__dirname, '..'),
      timeout: 60000
    });
    console.log('✅ SUCCESS via Railway CLI!');
    console.log(stdout);
    return true;
  } catch (error) {
    console.log('❌ Railway CLI failed:', error.message);
    return false;
  }
}

// Method 2: Try environment variable
async function tryEnvVar() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('❌ DATABASE_URL not found in environment');
      return false;
    }

    console.log('📡 Method 2: Using DATABASE_URL from environment...');
    const { stdout, stderr } = await execAsync('npm run seed:rewards', {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: dbUrl },
      timeout: 60000
    });
    console.log('✅ SUCCESS via environment variable!');
    console.log(stdout);
    return true;
  } catch (error) {
    console.log('❌ Environment variable method failed:', error.message);
    return false;
  }
}

// Method 3: Try .env file
async function tryEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (!dbUrlMatch) {
      console.log('❌ DATABASE_URL not found in .env file');
      return false;
    }

    const dbUrl = dbUrlMatch[1].trim();
    console.log('📡 Method 3: Using DATABASE_URL from .env file...');
    const { stdout, stderr } = await execAsync('npm run seed:rewards', {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: dbUrl },
      timeout: 60000
    });
    console.log('✅ SUCCESS via .env file!');
    console.log(stdout);
    return true;
  } catch (error) {
    console.log('❌ .env file method failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting automated seed process...\n');

  // Try methods in order
  const methods = [
    { name: 'Railway CLI', fn: tryRailwayCLI },
    { name: 'Environment Variable', fn: tryEnvVar },
    { name: '.env File', fn: tryEnvFile }
  ];

  for (const method of methods) {
    console.log(`\n📋 Trying: ${method.name}`);
    const success = await method.fn();
    if (success) {
      console.log(`\n✅ REWARDS SEEDED SUCCESSFULLY!`);
      console.log('🎉 Shop is now live with 12 rewards!');
      console.log('🌐 Visit: https://ggloop.io/shop');
      return;
    }
  }

  // If all methods fail, provide manual instructions
  console.log('\n❌ All automated methods failed.');
  console.log('\n📋 MANUAL INSTRUCTIONS:');
  console.log('1. Get DATABASE_URL from Railway dashboard');
  console.log('2. Run: $env:DATABASE_URL="..."; npm run seed:rewards');
  console.log('\nOr use Railway CLI:');
  console.log('   railway run npm run seed:rewards');
}

main().catch(console.error);
