#!/usr/bin/env node
/**
 * DAILY AUTOMATION RUNNER
 * Executes all daily tasks: revenue monitoring, Twitter posting, community engagement
 * 
 * Run once daily via cron: 0 9 * * * node scripts/daily-automation.cjs
 */

require('dotenv/config');

async function runDailyAutomation() {
    console.log('🤖 DAILY AUTOMATION STARTING\n');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    const tasks = [
        {
            name: 'Revenue Monitoring',
            script: './monitor-revenue.cjs',
            critical: false
        },
        {
            name: 'Reddit Engagement Check',
            script: './reddit-engagement.cjs',
            critical: false
        },
        {
            name: 'Twitter Status',
            script: '../server/services/twitter.ts',
            critical: false,
            skip: true // Handled by separate cron
        }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const task of tasks) {
        if (task.skip) {
            console.log(`⏭️  SKIPPED: ${task.name}\n`);
            continue;
        }

        console.log(`▶️  RUNNING: ${task.name}`);

        try {
            // Execute the script
            const { execSync } = require('child_process');
            const output = execSync(`node ${task.script}`, {
                encoding: 'utf-8',
                stdio: 'pipe'
            });

            console.log(output);
            console.log(`✅ COMPLETED: ${task.name}\n`);
            successCount++;
        } catch (error) {
            console.error(`❌ FAILED: ${task.name}`);
            console.error(error.message);

            if (task.critical) {
                console.error('\n🚨 CRITICAL TASK FAILED - ABORTING\n');
                process.exit(1);
            }

            failCount++;
            console.log(`   Continuing despite failure...\n`);
        }
    }

    console.log('📊 DAILY AUTOMATION SUMMARY');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📋 Total: ${successCount + failCount}\n`);

    // Alert if too many failures
    if (failCount > 2) {
        console.warn('⚠️  WARNING: Multiple task failures detected');
        console.warn('   Review logs and fix issues\n');
    }

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Check Reddit for new comments (respond within 2h)');
    console.log('   2. Monitor Builder Tier signups in database');
    console.log('   3. Review Twitter automation tweets');
    console.log('   4. Update campaign tracking spreadsheet\n');

    console.log('✅ Daily automation complete. See you tomorrow.\n');
}

runDailyAutomation().catch(err => {
    console.error('💥 AUTOMATION FAILED:', err);
    process.exit(1);
});
