#!/usr/bin/env node
/**
 * 🚀 COMPLETE AUTOMATION SCRIPT
 * 
 * Runs all automation setup in one go:
 * 1. Sets up Railway variables
 * 2. Verifies setup
 * 3. Tests everything
 * 
 * Usage:
 *   node scripts/complete-automation.js
 * 
 * Or with Railway token:
 *   RAILWAY_TOKEN=xxx node scripts/complete-automation.js
 */

const { setup } = require('./auto-setup-railway.js');
const { verify } = require('./verify-setup.js');

async function runCompleteAutomation() {
  console.log('🚀 COMPLETE AUTOMATION SETUP\n');
  console.log('This will automate:');
  console.log('✅ Railway variable setup');
  console.log('✅ PayPal credentials configuration');
  console.log('✅ Site verification');
  console.log('✅ PayPal button check\n');

  try {
    // Step 1: Setup Railway (if token provided)
    if (process.env.RAILWAY_TOKEN) {
      console.log('📝 STEP 1: Setting up Railway variables...\n');
      await setup();
      console.log('\n⏳ Waiting 30 seconds for Railway to process...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    } else {
      console.log('⚠️  STEP 1: Skipping Railway setup (no RAILWAY_TOKEN)');
      console.log('   To automate Railway setup:');
      console.log('   1. Get token: https://railway.app/account/tokens');
      console.log('   2. Run: export RAILWAY_TOKEN=your-token');
      console.log('   3. Run this script again\n');
    }

    // Step 2: Verify setup
    console.log('🔍 STEP 2: Verifying setup...\n');
    const results = await verify();

    // Step 3: Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(50) + '\n');

    if (results.errors.length === 0 && results.site && results.subscription) {
      console.log('✅ SETUP COMPLETE!\n');
      console.log('🎯 Next steps:');
      console.log('   1. Add cron jobs in Railway dashboard');
      console.log('   2. Wait 1 hour for first automation run');
      console.log('   3. Check email for automation report\n');
    } else {
      console.log('⚠️  SETUP NEEDS ATTENTION\n');
      console.log('📋 Manual steps required:');
      console.log('   1. Fix Railway variables (see errors above)');
      console.log('   2. Verify deployment succeeded');
      console.log('   3. Test subscription page in browser\n');
    }

  } catch (error) {
    console.error('\n❌ Automation failed:', error.message);
    console.log('\n💡 Fallback: Use manual setup guide');
    console.log('   See: EVERYTHING_COPY_PASTE.md\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteAutomation().catch(console.error);
}

module.exports = { runCompleteAutomation };

