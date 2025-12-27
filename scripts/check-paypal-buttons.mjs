#!/usr/bin/env node
/**
 * 🔍 CHECK PAYPAL BUTTONS - Quick Diagnostic
 * 
 * Checks if PayPal buttons are rendering and why they might not be
 */

import puppeteer from 'puppeteer';

async function checkPayPalButtons() {
  console.log('🔍 CHECKING PAYPAL BUTTONS\n');
  console.log('='.repeat(50));
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Navigating to subscription page...');
    await page.goto('https://ggloop.io/subscription', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('   ✅ Page loaded\n');
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('2. Checking for PayPal Client ID in page source...');
    
    // Check page source for the client ID
    const pageContent = await page.content();
    const hasClientId = pageContent.includes('AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu');
    
    if (hasClientId) {
      console.log('   ✅ PayPal Client ID found in page source');
    } else {
      console.log('   ❌ PayPal Client ID NOT found in page source');
      console.log('   💡 This means VITE_PAYPAL_CLIENT_ID is not in the build');
    }
    
    console.log('\n3. Checking for PayPal SDK script...');
    const paypalScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(s => 
        s.src?.includes('paypal.com/sdk') || 
        s.textContent?.includes('paypal')
      );
    });
    
    if (paypalScript) {
      console.log('   ✅ PayPal SDK script found');
    } else {
      console.log('   ❌ PayPal SDK script NOT found');
    }
    
    console.log('\n4. Checking for PayPal buttons...');
    
    // Look for PayPal button containers
    const paypalButtons = await page.evaluate(() => {
      // Look for PayPal button containers
      const containers = Array.from(document.querySelectorAll('[id*="paypal"], [class*="paypal"], [data-paypal]'));
      
      // Look for iframes (PayPal buttons render in iframes)
      const iframes = Array.from(document.querySelectorAll('iframe[src*="paypal"]'));
      
      // Look for error messages
      const errorMessages = Array.from(document.querySelectorAll('button, div')).filter(el => 
        el.textContent?.includes('PayPal not configured') ||
        el.textContent?.includes('not configured')
      );
      
      return {
        containers: containers.length,
        iframes: iframes.length,
        errorMessages: errorMessages.length,
        errorText: errorMessages.map(el => el.textContent).filter(Boolean)
      };
    });
    
    console.log(`   PayPal containers: ${paypalButtons.containers}`);
    console.log(`   PayPal iframes: ${paypalButtons.iframes}`);
    console.log(`   Error messages: ${paypalButtons.errorMessages}`);
    
    if (paypalButtons.errorMessages > 0) {
      console.log(`   ⚠️  Found error: ${paypalButtons.errorText[0]}`);
    }
    
    console.log('\n5. Checking console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (consoleErrors.length > 0) {
      console.log(`   ⚠️  Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach(err => {
        if (err.includes('VITE_PAYPAL_CLIENT_ID')) {
          console.log(`      ❌ ${err}`);
        } else {
          console.log(`      - ${err}`);
        }
      });
    } else {
      console.log('   ✅ No console errors');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/paypal-buttons-check.png',
      fullPage: true 
    });
    console.log('\n   📸 Screenshot saved: screenshots/paypal-buttons-check.png');
    
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 DIAGNOSIS:\n');
    
    if (!hasClientId) {
      console.log('❌ PROBLEM: VITE_PAYPAL_CLIENT_ID is not in the build');
      console.log('\n💡 SOLUTION:');
      console.log('   1. Railway needs to REBUILD after adding the variable');
      console.log('   2. Go to Railway → Your Service → Deployments');
      console.log('   3. Click "Redeploy" or wait for auto-redeploy');
      console.log('   4. Wait 2-3 minutes for build to complete');
      console.log('   5. Run this check again\n');
    } else if (paypalButtons.errorMessages > 0) {
      console.log('❌ PROBLEM: PayPal component showing error');
      console.log(`   Error: ${paypalButtons.errorText[0]}\n`);
    } else if (paypalButtons.iframes === 0 && paypalButtons.containers === 0) {
      console.log('⚠️  PayPal buttons not rendering');
      console.log('   Check browser console for errors\n');
    } else {
      console.log('✅ PayPal buttons should be working!');
      console.log('   If you still don\'t see them, check the screenshot\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n⏸️  Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

checkPayPalButtons().catch(console.error);

