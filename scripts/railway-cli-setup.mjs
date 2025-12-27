#!/usr/bin/env node
/**
 * 🤖 RAILWAY CLI AUTOMATION
 * 
 * Uses Railway CLI to set up everything automatically
 * Much more reliable than API calls
 */

import { execSync } from 'child_process';

const RAILWAY_TOKEN = '7ea4fcf8-372c-47ad-bd23-5e57e8ab00fc';

// PayPal credentials
const PAYPAL_CLIENT_ID = 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu';
const PAYPAL_CLIENT_SECRET = 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL';

// Environment variables to set
const ENV_VARS = {
  'VITE_PAYPAL_CLIENT_ID': PAYPAL_CLIENT_ID,
  'PAYPAL_CLIENT_ID': PAYPAL_CLIENT_ID,
  'PAYPAL_CLIENT_SECRET': PAYPAL_CLIENT_SECRET,
  'PAYPAL_MODE': 'sandbox',
  'ADMIN_EMAILS': 'jaysonquindao@ggloop.io',
  'BUSINESS_EMAIL': 'jaysonquindao@ggloop.io',
  'BUSINESS_NAME': 'GG LOOP LLC',
  'BASE_URL': 'https://ggloop.io',
  'NODE_ENV': 'production'
};

/**
 * Check if Railway CLI is installed
 */
function checkRailwayCLI() {
  try {
    execSync('railway --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Install Railway CLI
 */
function installRailwayCLI() {
  console.log('📦 Installing Railway CLI...\n');
  try {
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log('✅ Railway CLI installed\n');
    return true;
  } catch (e) {
    console.error('❌ Failed to install Railway CLI');
    console.log('\n💡 Install manually:');
    console.log('   npm install -g @railway/cli\n');
    return false;
  }
}

/**
 * Login to Railway
 */
function loginRailway() {
  console.log('🔐 Logging in to Railway...\n');
  try {
    // Use token for authentication
    process.env.RAILWAY_TOKEN = RAILWAY_TOKEN;
    execSync('railway login', { 
      stdio: 'inherit',
      env: { ...process.env, RAILWAY_TOKEN: RAILWAY_TOKEN }
    });
    console.log('✅ Logged in\n');
    return true;
  } catch (e) {
    console.log('⚠️  Login may require browser - opening...');
    return true; // Continue anyway
  }
}

/**
 * Set environment variable using Railway CLI
 */
function setEnvVar(key, value) {
  try {
    console.log(`   Setting ${key}...`);
    
    // First, unset to remove duplicates
    try {
      execSync(`railway variables unset ${key}`, { 
        stdio: 'ignore',
        env: { ...process.env, RAILWAY_TOKEN: RAILWAY_TOKEN }
      });
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    // Set the variable
    execSync(`railway variables set ${key}="${value}"`, {
      stdio: 'inherit',
      env: { ...process.env, RAILWAY_TOKEN: RAILWAY_TOKEN }
    });
    
    console.log(`   ✅ ${key} set\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to set ${key}:`, error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🤖 AUTOMATED RAILWAY SETUP (CLI Method)\n');
  console.log('This will:');
  console.log('1. Install Railway CLI (if needed)');
  console.log('2. Login to Railway');
  console.log('3. Set all environment variables');
  console.log('4. Fix VITE_PAYPAL_CLIENT_ID\n');

  // Check if Railway CLI is installed
  if (!checkRailwayCLI()) {
    console.log('⚠️  Railway CLI not found\n');
    const install = await new Promise((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('Install Railway CLI? (y/n): ', (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (install) {
      if (!installRailwayCLI()) {
        console.log('❌ Cannot continue without Railway CLI');
        console.log('\n💡 Alternative: Use browser bot');
        console.log('   npm run bot:browser\n');
        process.exit(1);
      }
    } else {
      console.log('\n💡 Using browser bot instead...');
      console.log('   npm run bot:browser\n');
      process.exit(0);
    }
  }

  // Login
  loginRailway();

  console.log('\n📝 Setting environment variables...\n');

  // Delete duplicate first
  console.log('🗑️  Removing duplicate VITE_PAYPAL_CLIENT_ID...');
  try {
    execSync('railway variables unset VITE_PAYPAL_CLIENT_ID', {
      stdio: 'ignore',
      env: { ...process.env, RAILWAY_TOKEN: RAILWAY_TOKEN }
    });
    console.log('   ✅ Removed old variable\n');
  } catch (e) {
    console.log('   ℹ️  No existing variable to remove\n');
  }

  // Set all variables
  let successCount = 0;
  for (const [key, value] of Object.entries(ENV_VARS)) {
    if (setEnvVar(key, value)) {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SETUP SUMMARY\n');
  console.log(`   Variables set: ${successCount}/${Object.keys(ENV_VARS).length}`);
  
  if (successCount === Object.keys(ENV_VARS).length) {
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('📋 Next steps:');
    console.log('1. Railway will auto-redeploy (wait 2-3 minutes)');
    console.log('2. Test: https://ggloop.io/subscription');
    console.log('3. Add cron jobs (see EVERYTHING_COPY_PASTE.md)\n');
  } else {
    console.log('\n⚠️  Some variables failed to set');
    console.log('💡 Use browser bot for manual setup:');
    console.log('   npm run bot:browser\n');
  }
}

// Run if called directly
setup().catch(console.error);

