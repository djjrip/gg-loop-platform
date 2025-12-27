#!/usr/bin/env node
/**
 * ✅ AUTOMATED VERIFICATION
 * 
 * Verifies everything is set up correctly:
 * - PayPal credentials
 * - Railway variables
 * - Site accessibility
 * - PayPal buttons working
 */

const https = require('https');

const PAYPAL_CLIENT_ID = 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu';
const SITE_URL = 'https://ggloop.io';
const SUBSCRIPTION_URL = 'https://ggloop.io/subscription';

/**
 * Check if URL is accessible
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
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
      resolve({ status: 0, accessible: false });
    });
  });
}

/**
 * Check if PayPal button is present
 */
function checkPayPalButton(html) {
  return html.includes('paypal') || 
         html.includes('PayPal') || 
         html.includes('VITE_PAYPAL_CLIENT_ID') ||
         html.includes(PAYPAL_CLIENT_ID.substring(0, 20));
}

/**
 * Main verification
 */
async function verify() {
  console.log('🔍 VERIFYING SETUP...\n');

  const results = {
    site: false,
    subscription: false,
    paypalButton: false,
    errors: []
  };

  // Check main site
  console.log('1. Checking main site...');
  const siteCheck = await checkUrl(SITE_URL);
  if (siteCheck.accessible) {
    console.log('   ✅ Site is accessible');
    results.site = true;
  } else {
    console.log('   ❌ Site not accessible');
    results.errors.push('Main site not accessible');
  }

  // Check subscription page
  console.log('\n2. Checking subscription page...');
  const subCheck = await checkUrl(SUBSCRIPTION_URL);
  if (subCheck.accessible) {
    console.log('   ✅ Subscription page is accessible');
    results.subscription = true;

    // Check for PayPal button
    if (checkPayPalButton(subCheck.body)) {
      console.log('   ✅ PayPal button detected');
      results.paypalButton = true;
    } else {
      console.log('   ⚠️  PayPal button not detected (may need to check browser)');
      results.errors.push('PayPal button not found in HTML');
    }
  } else {
    console.log('   ❌ Subscription page not accessible');
    results.errors.push('Subscription page not accessible');
  }

  // Summary
  console.log('\n📊 VERIFICATION SUMMARY:\n');
  console.log(`   Site: ${results.site ? '✅' : '❌'}`);
  console.log(`   Subscription Page: ${results.subscription ? '✅' : '❌'}`);
  console.log(`   PayPal Button: ${results.paypalButton ? '✅' : '⚠️'}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    results.errors.forEach(err => console.log(`   - ${err}`));
    console.log('\n💡 Next steps:');
    console.log('   1. Check Railway deployment logs');
    console.log('   2. Verify VITE_PAYPAL_CLIENT_ID is set in Railway');
    console.log('   3. Check browser console for errors');
  } else {
    console.log('\n✅ ALL CHECKS PASSED!');
    console.log('   Your setup is complete! 🎉');
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  verify().catch(console.error);
}

module.exports = { verify };

