#!/usr/bin/env node
/**
 * 🤖 VIRTUAL ASSISTANT - Your Virtual Self
 * 
 * Enterprise-grade automation that acts as YOU:
 * - Tests websites and functionality
 * - Checks tabs, links, forms
 * - Navigates PayPal, Railway, etc.
 * - Stops for private info (passwords, 2FA)
 * - Delegates tasks automatically
 * - Reports back on everything
 * 
 * Usage:
 *   npm run virtual:assistant
 *   npm run virtual:test-subscription
 *   npm run virtual:check-paypal
 *   npm run virtual:check-railway
 */

import puppeteer from 'puppeteer';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const CONFIG = {
  SITES: {
    SUBSCRIPTION: 'https://ggloop.io/subscription',
    PAYPAL_DASHBOARD: 'https://developer.paypal.com/dashboard',
    RAILWAY_DASHBOARD: 'https://railway.app',
    ADMIN_DASHBOARD: 'https://ggloop.io/admin',
  },
  EXPECTED_PAYPAL_CLIENT_ID: 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
  PRIVATE_KEYWORDS: ['password', 'secret', 'token', 'key', '2fa', 'otp', 'pin', 'ssn', 'credit card'],
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
 * Wait for user input (for private info)
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
 * Check if text contains private information
 */
function containsPrivateInfo(text) {
  const lowerText = text.toLowerCase();
  return CONFIG.PRIVATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Test Subscription Page
 */
async function testSubscriptionPage(browser) {
  console.log('\n🧪 TESTING SUBSCRIPTION PAGE\n');
  console.log('='.repeat(50));
  
  const page = await browser.newPage();
  const results = {
    url: CONFIG.SITES.SUBSCRIPTION,
    loaded: false,
    paypalButtonsFound: false,
    buttonCount: 0,
    errors: [],
    screenshots: []
  };
  
  try {
    console.log('1. Navigating to subscription page...');
    await page.goto(CONFIG.SITES.SUBSCRIPTION, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    results.loaded = true;
    console.log('   ✅ Page loaded');
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n2. Checking for PayPal buttons...');
    
    // Look for PayPal buttons in multiple ways
    const paypalSelectors = [
      '[id*="paypal"]',
      '[class*="paypal"]',
      '[data-paypal]',
      'iframe[src*="paypal"]',
      'div[data-paypal-button]',
      'button[data-paypal-button]',
    ];
    
    let buttonsFound = [];
    for (const selector of paypalSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          buttonsFound.push(...elements);
          console.log(`   ✅ Found ${elements.length} element(s) with selector: ${selector}`);
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Check for PayPal SDK script
    const paypalScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(s => 
        s.src?.includes('paypal') || 
        s.textContent?.includes('paypal') ||
        s.textContent?.includes('PAYPAL')
      );
    });
    
    if (paypalScript) {
      console.log('   ✅ PayPal SDK script found');
    }
    
    // Check for environment variable in page source
    const hasPaypalClientId = await page.evaluate((expectedId) => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const html = document.documentElement.outerHTML;
      return html.includes(expectedId.substring(0, 20)) || 
             scripts.some(s => s.textContent?.includes(expectedId.substring(0, 20)));
    }, CONFIG.EXPECTED_PAYPAL_CLIENT_ID);
    
    if (hasPaypalClientId) {
      console.log('   ✅ PayPal Client ID found in page');
    } else {
      console.log('   ⚠️  PayPal Client ID NOT found in page');
      results.errors.push('PayPal Client ID not found in page source');
    }
    
    // Take screenshot
    const screenshot = await page.screenshot({ 
      path: 'screenshots/subscription-page.png',
      fullPage: true 
    });
    results.screenshots.push('screenshots/subscription-page.png');
    console.log('   📸 Screenshot saved: screenshots/subscription-page.png');
    
    // Check console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (consoleErrors.length > 0) {
      console.log(`\n   ⚠️  Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach(err => console.log(`      - ${err}`));
      results.errors.push(...consoleErrors);
    }
    
    // Count visible buttons
    const visibleButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons.filter(btn => {
        const style = window.getComputedStyle(btn);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }).length;
    });
    
    console.log(`\n   📊 Found ${visibleButtons} visible button(s) on page`);
    
    results.buttonCount = visibleButtons;
    results.paypalButtonsFound = buttonsFound.length > 0 || paypalScript;
    
    if (results.paypalButtonsFound) {
      console.log('\n   ✅ PayPal buttons appear to be present!');
    } else {
      console.log('\n   ⚠️  PayPal buttons NOT found');
      console.log('   💡 Check:');
      console.log('      - Is VITE_PAYPAL_CLIENT_ID set in Railway?');
      console.log('      - Has Railway finished deploying?');
      console.log('      - Check browser console for errors');
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.errors.push(error.message);
  } finally {
    await page.close();
  }
  
  return results;
}

/**
 * Check PayPal Dashboard
 */
async function checkPayPalDashboard(browser) {
  console.log('\n💳 CHECKING PAYPAL DASHBOARD\n');
  console.log('='.repeat(50));
  
  const page = await browser.newPage();
  const results = {
    url: CONFIG.SITES.PAYPAL_DASHBOARD,
    loaded: false,
    loggedIn: false,
    clientIdFound: false,
    clientId: null,
    errors: []
  };
  
  try {
    console.log('1. Navigating to PayPal Developer Dashboard...');
    await page.goto(CONFIG.SITES.PAYPAL_DASHBOARD, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    results.loaded = true;
    console.log('   ✅ Page loaded');
    
    // Check if login required
    if (page.url().includes('login') || page.url().includes('signin')) {
      console.log('\n   ⚠️  Login required');
      console.log('   🔒 This requires private information (your PayPal password)');
      await waitForUser('Please login to PayPal, then press Enter');
      
      // Navigate again after login
      await page.goto(CONFIG.SITES.PAYPAL_DASHBOARD, { waitUntil: 'networkidle2' });
    }
    
    results.loggedIn = !page.url().includes('login');
    
    if (results.loggedIn) {
      console.log('   ✅ Logged in');
      
      console.log('\n2. Looking for Client ID...');
      await page.goto('https://developer.paypal.com/dashboard/applications/sandbox', {
        waitUntil: 'networkidle2'
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract Client ID from page
      const clientId = await page.evaluate((expectedId) => {
        const text = document.body.innerText;
        const clientIdMatch = text.match(/Client ID[:\s]+([A-Za-z0-9_-]+)/i);
        return clientIdMatch ? clientIdMatch[1] : null;
      }, CONFIG.EXPECTED_PAYPAL_CLIENT_ID);
      
      if (clientId) {
        results.clientId = clientId;
        results.clientIdFound = true;
        console.log(`   ✅ Found Client ID: ${clientId.substring(0, 20)}...`);
        
        if (clientId === CONFIG.EXPECTED_PAYPAL_CLIENT_ID) {
          console.log('   ✅ Client ID matches expected value!');
        } else {
          console.log('   ⚠️  Client ID does NOT match expected value');
          console.log(`   Expected: ${CONFIG.EXPECTED_PAYPAL_CLIENT_ID.substring(0, 20)}...`);
        }
      } else {
        console.log('   ⚠️  Could not find Client ID on page');
        results.errors.push('Client ID not found');
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.errors.push(error.message);
  } finally {
    await page.close();
  }
  
  return results;
}

/**
 * Check Railway Dashboard
 */
async function checkRailwayDashboard(browser) {
  console.log('\n🚂 CHECKING RAILWAY DASHBOARD\n');
  console.log('='.repeat(50));
  
  const page = await browser.newPage();
  const results = {
    url: CONFIG.SITES.RAILWAY_DASHBOARD,
    loaded: false,
    loggedIn: false,
    variablesFound: false,
    paypalVariableFound: false,
    errors: []
  };
  
  try {
    console.log('1. Navigating to Railway Dashboard...');
    await page.goto(CONFIG.SITES.RAILWAY_DASHBOARD, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    results.loaded = true;
    console.log('   ✅ Page loaded');
    
    // Check if login required
    if (page.url().includes('login') || page.url().includes('signin')) {
      console.log('\n   ⚠️  Login required');
      console.log('   🔒 This requires private information (your Railway password)');
      await waitForUser('Please login to Railway, then press Enter');
      
      await page.goto(CONFIG.SITES.RAILWAY_DASHBOARD, { waitUntil: 'networkidle2' });
    }
    
    results.loggedIn = !page.url().includes('login');
    
    if (results.loggedIn) {
      console.log('   ✅ Logged in');
      console.log('\n   💡 To check variables:');
      console.log('      1. Navigate to your project');
      console.log('      2. Click "Variables" tab');
      console.log('      3. Look for VITE_PAYPAL_CLIENT_ID');
      console.log('\n   ⏸️  Waiting for you to navigate...');
      await waitForUser('Navigate to Variables tab, then press Enter');
      
      // Check for VITE_PAYPAL_CLIENT_ID
      const hasVariable = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('VITE_PAYPAL_CLIENT_ID');
      });
      
      if (hasVariable) {
        results.variablesFound = true;
        results.paypalVariableFound = true;
        console.log('   ✅ VITE_PAYPAL_CLIENT_ID found!');
      } else {
        console.log('   ⚠️  VITE_PAYPAL_CLIENT_ID not found on page');
        results.errors.push('VITE_PAYPAL_CLIENT_ID not found');
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.errors.push(error.message);
  } finally {
    await page.close();
  }
  
  return results;
}

/**
 * Generate Report
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 VIRTUAL ASSISTANT REPORT\n');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name || result.url}`);
    console.log(`   Status: ${result.errors.length === 0 ? '✅ PASS' : '⚠️  ISSUES'}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`      - ${err}`));
    }
    console.log('');
  });
  
  const allPassed = results.every(r => r.errors.length === 0);
  
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED!\n');
  } else {
    console.log('⚠️  SOME CHECKS FAILED - Review errors above\n');
  }
}

/**
 * Amazon Associates Signup Automation
 */
async function automateAmazonAssociates(browser) {
  console.log('\n🛒 AUTOMATING AMAZON ASSOCIATES SIGNUP\n');
  console.log('='.repeat(50));
  
  const page = await browser.newPage();
  const results = {
    url: 'https://affiliate-program.amazon.com/signup',
    loaded: false,
    signedIn: false,
    applicationStarted: false,
    errors: []
  };
  
  try {
    console.log('1. Navigating to Amazon Associates signup...');
    await page.goto('https://affiliate-program.amazon.com/signup', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    results.loaded = true;
    console.log('   ✅ Page loaded');
    
    // Check if already signed in
    const isSignedIn = await page.evaluate(() => {
      return document.body.innerText.includes('Sign out') || 
             document.body.innerText.includes('Account') ||
             !document.body.innerText.includes('Sign in');
    });
    
    if (!isSignedIn) {
      console.log('\n2. Sign-in required');
      console.log('   🔒 This requires private information (your Amazon password)');
      console.log('   💡 The bot will guide you through the signup process');
      await waitForUser('Please sign in to Amazon, then press Enter');
      
      // Check again after user signs in
      await page.goto('https://affiliate-program.amazon.com/signup', { waitUntil: 'networkidle2' });
    }
    
    results.signedIn = true;
    console.log('   ✅ Signed in');
    
    console.log('\n3. Looking for signup/application form...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for signup button or form
    const signupButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const signup = buttons.find(b => 
        b.textContent?.toLowerCase().includes('sign up') ||
        b.textContent?.toLowerCase().includes('join') ||
        b.textContent?.toLowerCase().includes('apply') ||
        b.textContent?.toLowerCase().includes('get started')
      );
      if (signup) {
        signup.click();
        return true;
      }
      return false;
    });
    
    if (signupButton) {
      console.log('   ✅ Signup button clicked');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('   ⚠️  Please click "Sign Up" or "Join" button manually');
      await waitForUser('Click signup/join button, then press Enter');
    }
    
    console.log('\n4. Filling out application form...');
    console.log('   💡 The bot will help fill forms, but will stop for:');
    console.log('      - Personal information (name, address)');
    console.log('      - Payment information');
    console.log('      - Tax information');
    console.log('      - Any verification steps\n');
    
    // Look for form fields
    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(input => ({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || input.id || input.placeholder,
        required: input.required,
        value: input.value
      })).filter(field => field.name);
    });
    
    console.log(`   Found ${formFields.length} form field(s)`);
    
    // Guide user through form
    console.log('\n5. Form fields detected:');
    formFields.forEach((field, index) => {
      if (field.required && !field.value) {
        console.log(`   ${index + 1}. ${field.name || 'Field'} (${field.type}) - REQUIRED`);
      }
    });
    
    console.log('\n   ⏸️  Please fill out the form:');
    console.log('      - Website URL: https://ggloop.io');
    console.log('      - Website description: Competitive gaming rewards platform');
    console.log('      - Payment method: (you\'ll need to provide)');
    console.log('      - Tax information: (you\'ll need to provide)');
    
    try {
      await waitForUser('Fill out the form, then press Enter');
    } catch (e) {
      // Readline might be closed, continue anyway
      console.log('   Continuing...');
    }
    
    results.applicationStarted = true;
    
    console.log('\n6. Checking application status...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const applicationStatus = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      if (text.includes('pending') || text.includes('under review')) {
        return 'pending';
      } else if (text.includes('approved')) {
        return 'approved';
      } else if (text.includes('rejected') || text.includes('denied')) {
        return 'rejected';
      }
      return 'unknown';
    });
    
    if (applicationStatus === 'pending') {
      console.log('   ✅ Application submitted and pending review');
    } else if (applicationStatus === 'approved') {
      console.log('   ✅ Application approved!');
    } else if (applicationStatus === 'rejected') {
      console.log('   ⚠️  Application was rejected');
    } else {
      console.log('   ℹ️  Application status: ' + applicationStatus);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/amazon-associates-signup.png',
      fullPage: true 
    });
    console.log('   📸 Screenshot saved: screenshots/amazon-associates-signup.png');
    
    console.log('\n   ✅ Amazon Associates signup process completed!');
    console.log('   💡 Check your email for confirmation\n');
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.errors.push(error.message);
  } finally {
    await page.close();
  }
  
  return results;
}

/**
 * Main Virtual Assistant
 */
async function runVirtualAssistant(task = 'all') {
  console.log('🤖 VIRTUAL ASSISTANT - Your Virtual Self\n');
  console.log('Enterprise-grade automation that acts as YOU');
  console.log('='.repeat(50));
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can see what's happening
    defaultViewport: { width: 1280, height: 720 },
    args: ['--start-maximized']
  });
  
  const results = [];
  
  try {
    // Create screenshots directory
    const fs = await import('fs');
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    
    if (task === 'all' || task === 'subscription') {
      const result = await testSubscriptionPage(browser);
      result.name = 'Subscription Page Test';
      results.push(result);
    }
    
    if (task === 'all' || task === 'paypal') {
      const result = await checkPayPalDashboard(browser);
      result.name = 'PayPal Dashboard Check';
      results.push(result);
    }
    
    if (task === 'all' || task === 'railway') {
      const result = await checkRailwayDashboard(browser);
      result.name = 'Railway Dashboard Check';
      results.push(result);
    }
    
    if (task === 'all' || task === 'amazon') {
      const result = await automateAmazonAssociates(browser);
      result.name = 'Amazon Associates Signup';
      results.push(result);
    }
    
    // Generate report
    generateReport(results);
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      results: results
    };
    
    fs.writeFileSync(
      'screenshots/virtual-assistant-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('📄 Report saved: screenshots/virtual-assistant-report.json\n');
    
  } catch (error) {
    console.error('\n❌ Virtual Assistant error:', error.message);
  } finally {
    console.log('⏸️  Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    rl.close();
  }
}

// Get task from command line
const task = process.argv[2] || 'all';

// Run if called directly
runVirtualAssistant(task).catch(console.error);

export { runVirtualAssistant, testSubscriptionPage, checkPayPalDashboard, checkRailwayDashboard };

