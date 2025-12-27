// Complete Railway Cron Setup Guide
// Generates exact copy-paste instructions for Railway dashboard

console.log('🚀 RAILWAY CRON JOBS - COMPLETE SETUP GUIDE');
console.log('='.repeat(60));
console.log('');

console.log('📋 STEP-BY-STEP (5 minutes total):\n');

console.log('1️⃣  CREATE FIRST CRON SERVICE:');
console.log('   - Go to: https://railway.app/dashboard');
console.log('   - Select your GG LOOP project');
console.log('   - Click "+ New" → "Empty Service"');
console.log('   - Name: "master-automation"');
console.log('   - Source: Connect GitHub repo → djjrip/gg-loop-platform');
console.log('   - Branch: main');
console.log('   - Root Directory: /');
console.log('   - Build Command: npm install');
console.log('   - Start Command: npx tsx server/masterAutomation.ts');
console.log('   - Cron Schedule: 0 * * * * (every hour)');
console.log('   - Environment Variables: Copy ALL from main service');
console.log('   - Click "Deploy"\n');

console.log('2️⃣  CREATE SECOND CRON SERVICE:');
console.log('   - Click "+ New" → "Empty Service" again');
console.log('   - Name: "reward-fulfillment"');
console.log('   - Source: Connect GitHub repo → djjrip/gg-loop-platform');
console.log('   - Branch: main');
console.log('   - Root Directory: /');
console.log('   - Build Command: npm install');
console.log('   - Start Command: npx tsx server/automation/rewardFulfillment.ts');
console.log('   - Cron Schedule: */15 * * * * (every 15 minutes)');
console.log('   - Environment Variables: Copy ALL from main service');
console.log('   - Click "Deploy"\n');

console.log('✅ DONE! Automation will run automatically.\n');

console.log('📊 WHAT EACH DOES:');
console.log('   - Master Automation: Runs every hour, auto-approves redemptions, sends reports');
console.log('   - Reward Fulfillment: Runs every 15 min, fulfills rewards via affiliate links\n');

console.log('💡 TIP: Both services need ALL environment variables from your main service!');
console.log('   Especially: DATABASE_URL, ADMIN_EMAILS, BUSINESS_EMAIL, etc.\n');

