#!/usr/bin/env node
/**
 * 👻 GHOST BOT - Your Virtual Ghost Assistant
 * 
 * Connects to your EXISTING browser (no new windows!)
 * Monitors your screen and helps automate tasks
 * Automatically skips private information
 * 
 * Usage:
 *   npm run ghost:start
 *   npm run ghost:monitor
 */

import puppeteer from 'puppeteer-core';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Private information patterns to skip
const PRIVATE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /ssn|social security/i,
  /credit card|card number|cvv/i,
  /bank account|routing number/i,
  /2fa|two factor|otp|verification code/i,
  /pin|personal identification/i,
  /passkey/i,
];

/**
 * Check if text contains private information
 */
function containsPrivateInfo(text) {
  return PRIVATE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Connect to existing Chrome browser
 */
async function connectToExistingBrowser() {
  console.log('👻 GHOST BOT - Connecting to your browser...\n');
  
  // Try to connect to existing Chrome instance
  // Chrome must be started with: chrome.exe --remote-debugging-port=9222
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: null
  }).catch(async () => {
    // If connection fails, try to find Chrome
    console.log('   ⚠️  Could not connect to existing browser');
    console.log('   💡 Starting Chrome with remote debugging...\n');
    
    // Launch Chrome with remote debugging
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Try to find Chrome executable
      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
      ];
      
      let chromePath = null;
      for (const path of chromePaths) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(path)) {
            chromePath = path;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (chromePath) {
        console.log(`   ✅ Found Chrome at: ${chromePath}`);
        console.log('   🚀 Starting Chrome with remote debugging...\n');
        
        // Start Chrome with remote debugging
        execAsync(`"${chromePath}" --remote-debugging-port=9222 --user-data-dir="${process.env.TEMP}\\chrome-ghost-bot"`);
        
        // Wait a bit for Chrome to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Now connect
        return await puppeteer.connect({
          browserURL: 'http://localhost:9222',
          defaultViewport: null
        });
      } else {
        throw new Error('Chrome not found');
      }
    } catch (e) {
      console.error('   ❌ Could not start Chrome automatically');
      console.log('\n   💡 MANUAL SETUP:');
      console.log('   1. Close all Chrome windows');
      console.log('   2. Open PowerShell and run:');
      console.log('      Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--remote-debugging-port=9222"');
      console.log('   3. Run this script again\n');
      throw e;
    }
  });
  
  console.log('   ✅ Connected to browser!\n');
  return browser;
}

/**
 * Get all open tabs
 */
async function getOpenTabs(browser) {
  const pages = await browser.pages();
  return pages;
}

/**
 * Monitor a page for private information
 */
async function monitorPage(page, skipPrivate = true) {
  const url = page.url();
  console.log(`   📄 Monitoring: ${url.substring(0, 60)}...`);
  
  // Check page content for private info
  const pageInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const privateFields = inputs.filter(input => {
      const type = input.type?.toLowerCase() || '';
      const name = input.name?.toLowerCase() || '';
      const placeholder = input.placeholder?.toLowerCase() || '';
      const id = input.id?.toLowerCase() || '';
      
      return type === 'password' ||
             name.includes('password') ||
             name.includes('secret') ||
             name.includes('ssn') ||
             name.includes('credit') ||
             placeholder.includes('password') ||
             id.includes('password');
    });
    
    return {
      hasPrivateFields: privateFields.length > 0,
      privateFieldCount: privateFields.length,
      pageText: document.body.innerText.substring(0, 1000), // First 1000 chars
    };
  });
  
  if (skipPrivate && pageInfo.hasPrivateFields) {
    console.log(`   🔒 Private information detected (${pageInfo.privateFieldCount} field(s)) - SKIPPING`);
    return { url, hasPrivate: true, skipped: true };
  }
  
  // Check if page text contains private info
  if (skipPrivate && containsPrivateInfo(pageInfo.pageText)) {
    console.log(`   🔒 Private information in page content - SKIPPING`);
    return { url, hasPrivate: true, skipped: true };
  }
  
  return { url, hasPrivate: false, skipped: false, info: pageInfo };
}

/**
 * Monitor all tabs
 */
async function monitorAllTabs(browser) {
  console.log('👻 Scanning your open tabs...\n');
  
  const pages = await getOpenTabs(browser);
  console.log(`   Found ${pages.length} open tab(s)\n`);
  
  const results = [];
  
  for (const page of pages) {
    try {
      const result = await monitorPage(page);
      results.push(result);
    } catch (e) {
      console.log(`   ⚠️  Error monitoring tab: ${e.message}`);
    }
  }
  
  return results;
}

/**
 * Find specific page by URL pattern
 */
async function findPage(browser, urlPattern) {
  const pages = await getOpenTabs(browser);
  return pages.find(page => page.url().includes(urlPattern));
}

/**
 * Help with Amazon Associates signup
 */
async function helpWithAmazonAssociates(browser) {
  console.log('🛒 HELPING WITH AMAZON ASSOCIATES SIGNUP\n');
  console.log('='.repeat(50));
  
  // Find Amazon Associates tab
  const amazonPage = await findPage(browser, 'affiliate-program.amazon.com');
  
  if (!amazonPage) {
    console.log('   ⚠️  Amazon Associates tab not found');
    console.log('   💡 Please open: https://affiliate-program.amazon.com/signup');
    console.log('   Then run: npm run ghost:amazon\n');
    return;
  }
  
  console.log('   ✅ Found Amazon Associates tab!\n');
  
  // Check if it's the signup page
  const isSignupPage = amazonPage.url().includes('signup');
  
  if (!isSignupPage) {
    console.log('   💡 Navigate to signup page...');
    await amazonPage.goto('https://affiliate-program.amazon.com/signup', {
      waitUntil: 'networkidle2'
    });
  }
  
  // Check for private info
  const pageInfo = await monitorPage(amazonPage);
  
  if (pageInfo.hasPrivate) {
    console.log('\n   🔒 Private information detected - waiting for you...');
    console.log('   💡 Fill in private fields (password, payment, tax info)');
    console.log('   Press Enter when ready to continue...\n');
    await new Promise(resolve => {
      rl.question('', resolve);
    });
  }
  
  // Look for form fields we can help with
  const formFields = await amazonPage.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    return inputs.map(input => ({
      type: input.type || input.tagName.toLowerCase(),
      name: input.name || input.id || input.placeholder,
      value: input.value,
      required: input.required,
      isPrivate: input.type === 'password' || 
                 (input.name?.toLowerCase().includes('password')) ||
                 (input.name?.toLowerCase().includes('ssn')) ||
                 (input.name?.toLowerCase().includes('credit'))
    })).filter(field => field.name);
  });
  
  console.log('\n   📋 Form fields found:');
  formFields.forEach((field, index) => {
    if (!field.isPrivate) {
      console.log(`      ${index + 1}. ${field.name} (${field.type}) - Can help fill`);
    } else {
      console.log(`      ${index + 1}. ${field.name} (${field.type}) - 🔒 YOU fill this`);
    }
  });
  
  // Try to fill non-private fields
  console.log('\n   🤖 Filling non-private fields...');
  
  for (const field of formFields) {
    if (field.isPrivate || field.value) continue;
    
    try {
      if (field.name?.toLowerCase().includes('website') || 
          field.name?.toLowerCase().includes('url')) {
        await amazonPage.type(`input[name="${field.name}"], input[id="${field.name}"]`, 'https://ggloop.io', { delay: 100 });
        console.log(`      ✅ Filled website URL`);
      } else if (field.name?.toLowerCase().includes('business') || 
                 field.name?.toLowerCase().includes('company')) {
        await amazonPage.type(`input[name="${field.name}"], input[id="${field.name}"]`, 'GG LOOP LLC', { delay: 100 });
        console.log(`      ✅ Filled business name`);
      } else if (field.name?.toLowerCase().includes('email')) {
        await amazonPage.type(`input[name="${field.name}"], input[id="${field.name}"]`, 'jaysonquindao@ggloop.io', { delay: 100 });
        console.log(`      ✅ Filled email`);
      }
    } catch (e) {
      // Field might not exist or be fillable
    }
  }
  
  console.log('\n   ✅ Non-private fields filled!');
  console.log('   🔒 Please fill private fields (password, payment, tax) manually');
  console.log('   📸 Taking screenshot...\n');
  
  await amazonPage.screenshot({
    path: 'screenshots/amazon-associates-ghost-bot.png',
    fullPage: true
  });
  
  console.log('   ✅ Screenshot saved: screenshots/amazon-associates-ghost-bot.png\n');
}

/**
 * Main Ghost Bot
 */
async function runGhostBot(task = 'monitor') {
  console.log('👻 GHOST BOT - Your Virtual Ghost Assistant\n');
  console.log('Connects to your EXISTING browser (no new windows!)');
  console.log('Monitors your screen and helps automate tasks');
  console.log('Automatically skips private information\n');
  console.log('='.repeat(50));
  
  let browser;
  
  try {
    browser = await connectToExistingBrowser();
    
    if (task === 'monitor') {
      const results = await monitorAllTabs(browser);
      
      console.log('\n📊 MONITORING RESULTS:\n');
      results.forEach((result, index) => {
        if (result.skipped) {
          console.log(`${index + 1}. ${result.url.substring(0, 60)}... - 🔒 SKIPPED (private info)`);
        } else {
          console.log(`${index + 1}. ${result.url.substring(0, 60)}... - ✅ Safe to monitor`);
        }
      });
    } else if (task === 'amazon') {
      await helpWithAmazonAssociates(browser);
    }
    
    console.log('\n✅ Ghost Bot finished!\n');
    
  } catch (error) {
    console.error('\n❌ Ghost Bot error:', error.message);
    console.log('\n💡 Make sure Chrome is running with remote debugging enabled\n');
  } finally {
    // Don't close browser - it's the user's browser!
    console.log('👻 Ghost Bot disconnected (your browser stays open)\n');
  }
}

// Get task from command line
const task = process.argv[2] || 'monitor';

// Run if called directly
runGhostBot(task).catch(console.error);

export { runGhostBot, connectToExistingBrowser, monitorAllTabs };

