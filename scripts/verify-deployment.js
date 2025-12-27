#!/usr/bin/env node
/**
 * 🔍 VERIFY DEPLOYMENT SCRIPT
 * 
 * Checks if PayPal buttons are working after deployment
 * Run: node scripts/verify-deployment.js
 */

const https = require('https');

const SITE_URL = 'https://ggloop.io';
const SUBSCRIPTION_PAGE = `${SITE_URL}/subscription`;

console.log('🔍 Verifying GG LOOP Deployment...\n');

// Check if site is up
function checkSite(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

async function verify() {
  try {
    console.log('1. Checking if site is accessible...');
    const response = await checkSite(SUBSCRIPTION_PAGE);
    
    if (response.status === 200) {
      console.log('   ✅ Site is accessible\n');
      
      // Check if PayPal SDK is referenced
      if (response.body.includes('paypal.com/sdk') || response.body.includes('VITE_PAYPAL')) {
        console.log('2. Checking PayPal integration...');
        console.log('   ✅ PayPal SDK detected in page\n');
      } else {
        console.log('2. Checking PayPal integration...');
        console.log('   ⚠️  PayPal SDK not found - VITE_PAYPAL_CLIENT_ID may not be set\n');
      }
      
      console.log('📋 Next Steps:');
      console.log('1. Visit: https://ggloop.io/subscription');
      console.log('2. Check if PayPal buttons appear on Basic/Pro/Elite tiers');
      console.log('3. If not, verify VITE_PAYPAL_CLIENT_ID is set in Railway\n');
      
    } else {
      console.log(`   ❌ Site returned status ${response.status}\n`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    console.log('   Make sure the site is deployed and accessible\n');
  }
}

verify();

