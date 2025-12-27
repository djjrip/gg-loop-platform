#!/usr/bin/env node
/**
 * 🤖 MANUAL WORKFLOW AUTOMATOR
 * 
 * Automates everything possible in your manual workflows:
 * - Railway setup
 * - Verification
 * - Testing
 * - Status checks
 * - Error detection
 * 
 * Handles what CAN be automated, guides you through what CAN'T
 */

const https = require('https');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const CONFIG = {
  PAYPAL_CLIENT_ID: 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
  PAYPAL_CLIENT_SECRET: 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL',
  SITE_URL: 'https://ggloop.io',
  SUBSCRIPTION_URL: 'https://ggloop.io/subscription',
  ADMIN_EMAIL: 'jaysonquindao@ggloop.io',
  BUSINESS_EMAIL: 'jaysonquindao@ggloop.io',
  BUSINESS_NAME: 'GG LOOP LLC'
};

/**
 * Ask user a question
 */
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Check URL accessibility
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          accessible: res.statusCode === 200,
          body: body
        });
      });
    }).on('error', () => {
      resolve({ status: 0, accessible: false, body: '' });
    }).on('timeout', () => {
      resolve({ status: 0, accessible: false, body: '' });
    });
  });
}

/**
 * Open URL in browser
 */
function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Automated Railway Setup (if token provided)
 */
async function setupRailway() {
  if (!process.env.RAILWAY_TOKEN) {
    console.log('\n⚠️  Railway token not found');
    console.log('   To automate Railway setup:');
    console.log('   1. Get token: https://railway.app/account/tokens');
    console.log('   2. Set: $env:RAILWAY_TOKEN="your-token"');
    console.log('   3. Run this script again\n');
    return false;
  }

  console.log('\n🤖 Automating Railway setup...\n');
  
  try {
    const { setup } = require('./auto-setup-railway.js');
    await setup();
    return true;
  } catch (error) {
    console.error('❌ Railway automation failed:', error.message);
    return false;
  }
}

/**
 * Verify PayPal credentials
 */
async function verifyPayPal() {
  console.log('\n🔍 Verifying PayPal credentials...\n');
  
  console.log('📋 Your PayPal credentials:');
  console.log(`   Client ID: ${CONFIG.PAYPAL_CLIENT_ID.substring(0, 20)}...`);
  console.log(`   Client Secret: ${CONFIG.PAYPAL_CLIENT_SECRET.substring(0, 20)}...`);
  
  const verify = await ask('\n✅ Do these match your PayPal dashboard? (y/n): ');
  
  if (verify.toLowerCase() === 'y') {
    console.log('   ✅ Credentials verified!');
    return true;
  } else {
    console.log('\n⚠️  Please update credentials:');
    console.log('   1. Go to: https://developer.paypal.com/');
    console.log('   2. Copy correct Client ID and Secret');
    console.log('   3. Update CONFIG in this script\n');
    return false;
  }
}

/**
 * Verify site and PayPal buttons
 */
async function verifySite() {
  console.log('\n🌐 Verifying site...\n');
  
  // Check main site
  console.log('1. Checking main site...');
  const siteCheck = await checkUrl(CONFIG.SITE_URL);
  if (siteCheck.accessible) {
    console.log('   ✅ Site is accessible');
  } else {
    console.log('   ❌ Site not accessible');
    return false;
  }
  
  // Check subscription page
  console.log('\n2. Checking subscription page...');
  const subCheck = await checkUrl(CONFIG.SUBSCRIPTION_URL);
  if (subCheck.accessible) {
    console.log('   ✅ Subscription page is accessible');
    
    // Check for PayPal
    const hasPayPal = subCheck.body.includes('paypal') || 
                      subCheck.body.includes('PayPal') ||
                      subCheck.body.includes(CONFIG.PAYPAL_CLIENT_ID.substring(0, 20));
    
    if (hasPayPal) {
      console.log('   ✅ PayPal integration detected');
    } else {
      console.log('   ⚠️  PayPal button not found in HTML');
      console.log('      (May need to check in browser)');
    }
    
    // Open in browser for manual check
    const open = await ask('\n   Open in browser to verify? (y/n): ');
    if (open.toLowerCase() === 'y') {
      openBrowser(CONFIG.SUBSCRIPTION_URL);
      const verified = await ask('\n   ✅ Do PayPal buttons appear? (y/n): ');
      return verified.toLowerCase() === 'y';
    }
  } else {
    console.log('   ❌ Subscription page not accessible');
    return false;
  }
  
  return true;
}

/**
 * Guide through Railway variable setup
 */
async function guideRailwaySetup() {
  console.log('\n🚂 RAILWAY VARIABLE SETUP GUIDE\n');
  
  console.log('📋 Step-by-step instructions:\n');
  
  console.log('1. Open Railway:');
  console.log('   https://railway.app\n');
  
  console.log('2. Navigate to:');
  console.log('   Your Project → Web Service → Variables tab\n');
  
  console.log('3. Delete ALL VITE_PAYPAL_CLIENT_ID entries:');
  console.log('   - Find all instances');
  console.log('   - Click ⋮ menu → Delete on each\n');
  
  console.log('4. Add ONE correctly:\n');
  console.log('   Click "+ New Variable"\n');
  console.log('   Variable Name (paste this):');
  console.log(`   ${CONFIG.PAYPAL_CLIENT_ID}\n`);
  console.log('   Variable Value (paste this):');
  console.log(`   ${CONFIG.PAYPAL_CLIENT_ID}\n`);
  
  const done = await ask('\n✅ Have you completed these steps? (y/n): ');
  
  if (done.toLowerCase() === 'y') {
    console.log('\n   ✅ Great! Railway will auto-redeploy...');
    console.log('   ⏳ Wait 2-3 minutes, then we\'ll verify\n');
    
    const wait = await ask('   Press Enter when deployment is complete...');
    return true;
  }
  
  return false;
}

/**
 * Guide through cron job setup
 */
async function guideCronSetup() {
  console.log('\n🤖 CRON JOB SETUP GUIDE\n');
  
  console.log('📋 Add these 2 cron jobs in Railway:\n');
  
  console.log('JOB 1: Master Automation\n');
  console.log('   Name:');
  console.log('   Master Automation\n');
  console.log('   Start Command:');
  console.log('   npx tsx server/masterAutomation.ts\n');
  console.log('   Schedule:');
  console.log('   0 * * * *\n');
  
  console.log('JOB 2: Reward Fulfillment\n');
  console.log('   Name:');
  console.log('   Reward Fulfillment\n');
  console.log('   Start Command:');
  console.log('   npx tsx server/automation/rewardFulfillment.ts\n');
  console.log('   Schedule:');
  console.log('   */15 * * * *\n');
  
  console.log('📝 How to add:');
  console.log('   1. Railway → + New → Empty Service');
  console.log('   2. Connect to GitHub repo');
  console.log('   3. Set Start Command (above)');
  console.log('   4. Set Cron Schedule (above)');
  console.log('   5. Copy all environment variables from main service\n');
  
  const done = await ask('✅ Have you added the cron jobs? (y/n): ');
  return done.toLowerCase() === 'y';
}

/**
 * Main workflow automation
 */
async function runWorkflowAutomation() {
  console.log('🤖 MANUAL WORKFLOW AUTOMATOR\n');
  console.log('This will automate what can be automated');
  console.log('And guide you through what can\'t be automated\n');
  
  const results = {
    paypal: false,
    railway: false,
    site: false,
    cron: false
  };
  
  try {
    // Step 1: Verify PayPal
    results.paypal = await verifyPayPal();
    
    // Step 2: Try Railway automation
    if (process.env.RAILWAY_TOKEN) {
      results.railway = await setupRailway();
    } else {
      // Guide through manual setup
      results.railway = await guideRailwaySetup();
    }
    
    // Step 3: Verify site
    if (results.railway) {
      results.site = await verifySite();
    }
    
    // Step 4: Guide cron setup
    results.cron = await guideCronSetup();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 WORKFLOW AUTOMATION SUMMARY');
    console.log('='.repeat(50) + '\n');
    
    console.log(`   PayPal Verified: ${results.paypal ? '✅' : '❌'}`);
    console.log(`   Railway Setup: ${results.railway ? '✅' : '❌'}`);
    console.log(`   Site Verified: ${results.site ? '✅' : '❌'}`);
    console.log(`   Cron Jobs: ${results.cron ? '✅' : '❌'}\n`);
    
    if (results.paypal && results.railway && results.site && results.cron) {
      console.log('🎉 ALL SETUP COMPLETE!\n');
      console.log('✅ Your business is now automated!');
      console.log('📧 Check email in 1 hour for automation report\n');
    } else {
      console.log('⚠️  Some steps need attention\n');
      console.log('📋 Next steps:');
      if (!results.paypal) console.log('   - Verify PayPal credentials');
      if (!results.railway) console.log('   - Complete Railway variable setup');
      if (!results.site) console.log('   - Fix site/PayPal button issues');
      if (!results.cron) console.log('   - Add cron jobs in Railway\n');
    }
    
  } catch (error) {
    console.error('\n❌ Automation failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  runWorkflowAutomation().catch(console.error);
}

module.exports = { runWorkflowAutomation };

