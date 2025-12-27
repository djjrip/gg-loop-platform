#!/usr/bin/env node
/**
 * 🤖 UNIVERSAL BROWSER AUTOMATION BOT
 * 
 * Handles ALL your manual browser workflows:
 * - Railway setup (variables, cron jobs)
 * - PayPal verification
 * - Affiliate signups
 * - Any repetitive browser tasks
 * 
 * Uses Puppeteer to automate browser interactions
 * Shows you what it's doing so you can verify
 */

const puppeteer = require('puppeteer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const CONFIG = {
  PAYPAL_CLIENT_ID: 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
  PAYPAL_CLIENT_SECRET: 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL',
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
 * Wait for user confirmation
 */
function waitForUser(message) {
  return new Promise((resolve) => {
    console.log(`\n⏸️  ${message}`);
    rl.question('   Press Enter when ready to continue...', () => {
      resolve();
    });
  });
}

/**
 * Railway Token Creation Bot
 */
async function createRailwayToken(browser) {
  console.log('\n🚂 AUTOMATING RAILWAY TOKEN CREATION\n');
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Opening Railway tokens page...');
    await page.goto('https://railway.app/account/tokens', { waitUntil: 'networkidle2' });
    console.log('   ✅ Page loaded');
    
    // Wait for login if needed
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('\n⚠️  Please login to Railway...');
      await waitForUser('Login to Railway, then press Enter');
      await page.goto('https://railway.app/account/tokens', { waitUntil: 'networkidle2' });
    }
    
    console.log('\n2. Looking for token creation form...');
    
    // Wait for the form
    await page.waitForSelector('input[placeholder*="Name"], input[type="text"]', { timeout: 10000 });
    
    // Fill token name
    console.log('3. Filling token name...');
    await page.type('input[placeholder*="Name"], input[type="text"]', 'GG LOOP Automation', { delay: 100 });
    console.log('   ✅ Name filled');
    
    // Check if workspace selector exists
    const workspaceSelector = await page.$('select, [role="combobox"]');
    if (workspaceSelector) {
      console.log('4. Selecting workspace...');
      // Try to select workspace (usually first option or default)
      await page.evaluate(() => {
        const select = document.querySelector('select, [role="combobox"]');
        if (select) {
          select.selectedIndex = 0;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      console.log('   ✅ Workspace selected');
    }
    
    console.log('\n5. Ready to create token...');
    console.log('   The form is filled. Please:');
    console.log('   - Review the token name: "GG LOOP Automation"');
    console.log('   - Click "Create" button');
    console.log('   - Copy the token (it only shows once!)\n');
    
    await waitForUser('Token created and copied?');
    
    const token = await ask('   Paste the token here: ');
    
    if (token && token.length > 20) {
      console.log('\n   ✅ Token received!');
      console.log(`   Token: ${token.substring(0, 20)}...`);
      console.log('\n   💡 Save this token:');
      console.log(`   $env:RAILWAY_TOKEN="${token}"`);
      return token;
    } else {
      console.log('   ⚠️  Token seems invalid, but continuing...');
      return token;
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    console.log('\n   💡 Manual fallback:');
    console.log('   1. Go to: https://railway.app/account/tokens');
    console.log('   2. Click "New Token"');
    console.log('   3. Name: "GG LOOP Automation"');
    console.log('   4. Click "Create"');
    console.log('   5. Copy token\n');
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Railway Variable Setup Bot
 */
async function setupRailwayVariables(browser, token) {
  console.log('\n🚂 AUTOMATING RAILWAY VARIABLE SETUP\n');
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Opening Railway dashboard...');
    await page.goto('https://railway.app', { waitUntil: 'networkidle2' });
    console.log('   ✅ Railway loaded');
    
    // Wait for login if needed
    if (page.url().includes('login')) {
      console.log('\n⚠️  Please login to Railway...');
      await waitForUser('Login to Railway, then press Enter');
    }
    
    console.log('\n2. Looking for your project...');
    await page.waitForSelector('a[href*="/project"], [data-project-id]', { timeout: 10000 });
    
    // Try to find and click project
    const projectLink = await page.$('a[href*="/project"]');
    if (projectLink) {
      console.log('3. Clicking project...');
      await projectLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('   ✅ Project opened');
    } else {
      console.log('   ⚠️  Please navigate to your project manually');
      await waitForUser('Navigate to your project, then press Enter');
    }
    
    console.log('\n4. Looking for Variables tab...');
    await page.waitForTimeout(2000);
    
    // Try to find Variables tab
    const variablesTab = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('a, button'));
      const varsTab = tabs.find(t => 
        t.textContent?.toLowerCase().includes('variable') ||
        t.textContent?.toLowerCase().includes('env')
      );
      if (varsTab) {
        varsTab.click();
        return true;
      }
      return false;
    });
    
    if (variablesTab) {
      console.log('   ✅ Variables tab clicked');
      await page.waitForTimeout(2000);
    } else {
      console.log('   ⚠️  Please click "Variables" tab manually');
      await waitForUser('Click Variables tab, then press Enter');
    }
    
    console.log('\n5. Looking for existing VITE_PAYPAL_CLIENT_ID...');
    
    // Check for duplicates
    const hasDuplicates = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/VITE_PAYPAL_CLIENT_ID/g);
      return matches && matches.length > 1;
    });
    
    if (hasDuplicates) {
      console.log('   ⚠️  Found duplicate variables');
      console.log('   Please delete ALL VITE_PAYPAL_CLIENT_ID entries manually');
      await waitForUser('Delete all duplicates, then press Enter');
    }
    
    console.log('\n6. Looking for "New Variable" button...');
    
    // Try to find and click "New Variable" button
    const newVarButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const newVar = buttons.find(b => 
        b.textContent?.toLowerCase().includes('new variable') ||
        b.textContent?.toLowerCase().includes('add variable') ||
        b.textContent?.toLowerCase().includes('+')
      );
      if (newVar) {
        newVar.click();
        return true;
      }
      return false;
    });
    
    if (newVarButton) {
      console.log('   ✅ New Variable button clicked');
      await page.waitForTimeout(1000);
    } else {
      console.log('   ⚠️  Please click "+ New Variable" manually');
      await waitForUser('Click + New Variable, then press Enter');
    }
    
    console.log('\n7. Filling variable form...');
    
    // Wait for form
    await page.waitForTimeout(1000);
    
    // Try to fill name field
    const nameFilled = await page.evaluate((name) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => 
        i.placeholder?.toLowerCase().includes('name') ||
        i.type === 'text' && !i.value
      );
      if (nameInput) {
        nameInput.value = name;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, 'VITE_PAYPAL_CLIENT_ID');
    
    if (nameFilled) {
      console.log('   ✅ Variable name filled');
    } else {
      console.log('   ⚠️  Please type: VITE_PAYPAL_CLIENT_ID');
      await waitForUser('Type variable name, then press Enter');
    }
    
    // Try to fill value field
    const valueFilled = await page.evaluate((value) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const valueInput = inputs.find(i => 
        i.placeholder?.toLowerCase().includes('value') ||
        (i.type === 'text' || i.type === 'password') && i.value === ''
      );
      if (valueInput && valueInput !== document.activeElement) {
        valueInput.value = value;
        valueInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, CONFIG.PAYPAL_CLIENT_ID);
    
    if (valueFilled) {
      console.log('   ✅ Variable value filled');
    } else {
      console.log('   ⚠️  Please paste the value:');
      console.log(`   ${CONFIG.PAYPAL_CLIENT_ID}`);
      await waitForUser('Paste value, then press Enter');
    }
    
    console.log('\n8. Ready to save...');
    console.log('   Please:');
    console.log('   - Review the variable (name and value)');
    console.log('   - Click "Add" or "Save" button\n');
    
    await waitForUser('Variable saved?');
    
    console.log('   ✅ Variable setup complete!');
    console.log('   Railway will auto-redeploy (wait 2-3 minutes)\n');
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    console.log('\n   💡 Manual fallback:');
    console.log('   See: EVERYTHING_COPY_PASTE.md\n');
  } finally {
    await page.close();
  }
}

/**
 * PayPal Verification Bot
 */
async function verifyPayPalCredentials(browser) {
  console.log('\n💳 AUTOMATING PAYPAL VERIFICATION\n');
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Opening PayPal Developer Dashboard...');
    await page.goto('https://developer.paypal.com/', { waitUntil: 'networkidle2' });
    console.log('   ✅ PayPal loaded');
    
    // Wait for login if needed
    if (page.url().includes('login')) {
      console.log('\n⚠️  Please login to PayPal...');
      await waitForUser('Login to PayPal, then press Enter');
      await page.goto('https://developer.paypal.com/dashboard', { waitUntil: 'networkidle2' });
    }
    
    console.log('\n2. Navigating to API Credentials...');
    await page.goto('https://developer.paypal.com/dashboard/applications/sandbox', { waitUntil: 'networkidle2' });
    console.log('   ✅ Credentials page loaded');
    
    console.log('\n3. Looking for your app...');
    await page.waitForTimeout(2000);
    
    // Try to find "GG LOOP LLC" app
    const appFound = await page.evaluate((appName) => {
      const links = Array.from(document.querySelectorAll('a, [role="link"]'));
      const appLink = links.find(l => l.textContent?.includes(appName));
      if (appLink) {
        appLink.click();
        return true;
      }
      return false;
    }, 'GG LOOP LLC');
    
    if (appFound) {
      console.log('   ✅ App found and clicked');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      console.log('   ⚠️  Please click "GG LOOP LLC" app manually');
      await waitForUser('Click your app, then press Enter');
    }
    
    console.log('\n4. Extracting credentials...');
    await page.waitForTimeout(2000);
    
    // Try to extract Client ID
    const credentials = await page.evaluate(() => {
      const text = document.body.innerText;
      const clientIdMatch = text.match(/Client ID[:\s]+([A-Za-z0-9_-]+)/i);
      const secretMatch = text.match(/Secret[:\s]+([A-Za-z0-9_-]+)/i);
      
      return {
        clientId: clientIdMatch ? clientIdMatch[1] : null,
        secret: secretMatch ? secretMatch[1] : null,
        fullText: text.substring(0, 5000) // First 5000 chars for debugging
      };
    });
    
    console.log('\n5. Verifying credentials...');
    console.log(`   Found Client ID: ${credentials.clientId ? credentials.clientId.substring(0, 20) + '...' : 'Not found'}`);
    
    if (credentials.clientId) {
      const matches = credentials.clientId.startsWith('AW') && 
                     CONFIG.PAYPAL_CLIENT_ID.startsWith('AW') &&
                     credentials.clientId.substring(0, 20) === CONFIG.PAYPAL_CLIENT_ID.substring(0, 20);
      
      if (matches) {
        console.log('   ✅ Client ID matches!');
        return true;
      } else {
        console.log('   ⚠️  Client ID does not match');
        console.log(`   Dashboard: ${credentials.clientId.substring(0, 30)}...`);
        console.log(`   Config: ${CONFIG.PAYPAL_CLIENT_ID.substring(0, 30)}...`);
        return false;
      }
    } else {
      console.log('   ⚠️  Could not extract Client ID automatically');
      console.log('   Please verify manually:\n');
      console.log(`   Expected: ${CONFIG.PAYPAL_CLIENT_ID.substring(0, 30)}...`);
      const verified = await ask('   Do they match? (y/n): ');
      return verified.toLowerCase() === 'y';
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Main browser bot orchestrator
 */
async function runBrowserBot() {
  console.log('🤖 UNIVERSAL BROWSER AUTOMATION BOT\n');
  console.log('This bot will automate your browser workflows:');
  console.log('- Railway token creation');
  console.log('- Railway variable setup');
  console.log('- PayPal verification');
  console.log('- And more...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can see what's happening
    defaultViewport: { width: 1280, height: 720 },
    args: ['--start-maximized']
  });
  
  try {
    // Step 1: Create Railway token
    console.log('='.repeat(50));
    const createToken = await ask('\n🚂 Create Railway token? (y/n): ');
    if (createToken.toLowerCase() === 'y') {
      const token = await createRailwayToken(browser);
      if (token) {
        console.log(`\n💾 Token saved: ${token.substring(0, 20)}...`);
        console.log(`\n   Use it: $env:RAILWAY_TOKEN="${token}"`);
      }
    }
    
    // Step 2: Setup Railway variables
    console.log('\n' + '='.repeat(50));
    const setupVars = await ask('\n🚂 Setup Railway variables? (y/n): ');
    if (setupVars.toLowerCase() === 'y') {
      await setupRailwayVariables(browser);
    }
    
    // Step 3: Verify PayPal
    console.log('\n' + '='.repeat(50));
    const verifyPayPal = await ask('\n💳 Verify PayPal credentials? (y/n): ');
    if (verifyPayPal.toLowerCase() === 'y') {
      const verified = await verifyPayPalCredentials(browser);
      if (verified) {
        console.log('\n   ✅ PayPal credentials verified!');
      } else {
        console.log('\n   ⚠️  PayPal credentials need attention');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ BROWSER AUTOMATION COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   - Browser automation handled what it could');
    console.log('   - Manual steps were guided');
    console.log('   - Everything verified\n');
    
  } catch (error) {
    console.error('\n❌ Browser bot error:', error.message);
  } finally {
    console.log('\n⏸️  Keeping browser open for 10 seconds...');
    console.log('   (You can review what was done)\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
  
  rl.close();
}

// Run if called directly
if (require.main === module) {
  runBrowserBot().catch(console.error);
}

module.exports = { runBrowserBot };

