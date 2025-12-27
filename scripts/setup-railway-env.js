#!/usr/bin/env node
/**
 * 🚀 AUTOMATED RAILWAY SETUP SCRIPT
 * 
 * This script helps you set up Railway environment variables
 * Run: node scripts/setup-railway-env.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 GG LOOP - Railway Environment Setup\n');
console.log('This script will help you set up Railway environment variables.\n');

const requiredVars = {
  'VITE_PAYPAL_CLIENT_ID': {
    value: 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
    description: 'PayPal Client ID for frontend (REQUIRED for payment buttons)',
    required: true
  },
  'PAYPAL_CLIENT_ID': {
    value: 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu',
    description: 'PayPal Client ID for backend',
    required: true
  },
  'PAYPAL_CLIENT_SECRET': {
    value: 'EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL',
    description: 'PayPal Client Secret for backend',
    required: true
  },
  'PAYPAL_MODE': {
    value: 'sandbox',
    description: 'PayPal mode (sandbox or live)',
    required: true
  },
  'BUSINESS_EMAIL': {
    value: 'jaysonquindao@ggloop.io',
    description: 'Business email for affiliate signups',
    required: false
  },
  'BUSINESS_NAME': {
    value: 'GG LOOP LLC',
    description: 'Business name',
    required: false
  }
};

console.log('📋 Variables to add to Railway:\n');

Object.entries(requiredVars).forEach(([key, config]) => {
  console.log(`${config.required ? '✅' : '⚪'} ${key}`);
  console.log(`   Description: ${config.description}`);
  console.log(`   Value: ${config.value}`);
  console.log('');
});

console.log('\n📝 Instructions:');
console.log('1. Go to https://railway.app');
console.log('2. Click your GG LOOP project');
console.log('3. Click your web service');
console.log('4. Click "Variables" tab');
console.log('5. Add each variable above');
console.log('\n💡 Tip: Copy the variables from the output above!\n');

// Generate Railway CLI commands if available
console.log('\n🔧 Railway CLI Commands (if you have Railway CLI installed):\n');
console.log('railway login');
console.log('railway link');
Object.entries(requiredVars).forEach(([key, config]) => {
  console.log(`railway variables set ${key}="${config.value}"`);
});

console.log('\n✅ After adding variables, Railway will auto-redeploy!');
console.log('⏱️  Wait 2-3 minutes, then test: https://ggloop.io/subscription\n');

rl.close();

