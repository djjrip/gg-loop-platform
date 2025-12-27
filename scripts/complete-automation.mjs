// Complete Automation Script
// Runs all automation setup in one go

import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 GG LOOP COMPLETE AUTOMATION');
console.log('='.repeat(50));
console.log('');

const steps = [
  {
    name: 'Seed Production Rewards',
    command: 'npm run seed:production',
    description: 'Adding 12 rewards to shop'
  },
  {
    name: 'Verify Database Connection',
    command: 'npm run db:push',
    description: 'Ensuring database is up to date'
  }
];

async function runStep(step, index) {
  console.log(`\n📋 Step ${index + 1}/${steps.length}: ${step.name}`);
  console.log(`   ${step.description}`);
  console.log('   Running...\n');

  try {
    const { stdout, stderr } = await execAsync(step.command, {
      cwd: rootDir,
      timeout: 120000
    });

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) console.error(stderr);

    console.log(`✅ ${step.name} completed!`);
    return true;
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error.message);
    console.log('   Continuing with next step...\n');
    return false;
  }
}

async function main() {
  console.log('🎯 Starting complete automation...\n');

  const results = [];
  for (let i = 0; i < steps.length; i++) {
    const success = await runStep(steps[i], i);
    results.push({ step: steps[i].name, success });
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 AUTOMATION SUMMARY');
  console.log('='.repeat(50));

  results.forEach((result, i) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.step}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ ${successCount}/${results.length} steps completed successfully`);

  if (successCount === results.length) {
    console.log('\n🎉 ALL AUTOMATION COMPLETE!');
    console.log('🌐 Your shop is live: https://ggloop.io/shop');
  } else {
    console.log('\n⚠️  Some steps failed. Check errors above.');
  }
}

main().catch(console.error);

