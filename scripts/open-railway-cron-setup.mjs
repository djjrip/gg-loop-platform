// Open Railway and show exact setup instructions
// Makes it as easy as possible

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 OPENING RAILWAY FOR CRON SETUP');
console.log('='.repeat(50));
console.log('');

// Try to open Railway dashboard
try {
  if (process.platform === 'win32') {
    await execAsync('start https://railway.app/dashboard');
  } else if (process.platform === 'darwin') {
    await execAsync('open https://railway.app/dashboard');
  } else {
    await execAsync('xdg-open https://railway.app/dashboard');
  }
  console.log('✅ Opened Railway dashboard in your browser');
} catch (error) {
  console.log('⚠️  Could not open browser automatically');
  console.log('📋 Go to: https://railway.app/dashboard');
}

console.log('\n📋 EXACT STEPS (Copy-paste ready):\n');

console.log('1️⃣  CREATE FIRST CRON SERVICE:');
console.log('   - In Railway dashboard, click "+ New" → "Empty Service"');
console.log('   - Name: master-automation');
console.log('   - Source: Connect GitHub → djjrip/gg-loop-platform');
console.log('   - Branch: main');
console.log('   - Root Directory: /');
console.log('   - Build Command: npm install');
console.log('   - Start Command: npx tsx server/masterAutomation.ts');
console.log('   - Cron Schedule: 0 * * * *');
console.log('   - Environment Variables: Copy ALL from main service');
console.log('   - Click "Deploy"\n');

console.log('2️⃣  CREATE SECOND CRON SERVICE:');
console.log('   - Click "+ New" → "Empty Service" again');
console.log('   - Name: reward-fulfillment');
console.log('   - Source: Connect GitHub → djjrip/gg-loop-platform');
console.log('   - Branch: main');
console.log('   - Root Directory: /');
console.log('   - Build Command: npm install');
console.log('   - Start Command: npx tsx server/automation/rewardFulfillment.ts');
console.log('   - Cron Schedule: */15 * * * *');
console.log('   - Environment Variables: Copy ALL from main service');
console.log('   - Click "Deploy"\n');

console.log('✅ DONE! Automation runs automatically forever.\n');

