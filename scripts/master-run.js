#!/usr/bin/env node

/**
 * MASTER AUTOMATION ORCHESTRATOR
 * Runs all 10 autonomous systems in optimal sequence
 * Single command for daily operations intelligence
 * 
 * Usage: node scripts/master-run.js
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';

const SYSTEMS = [
    {
        name: 'Retention Risk Predictor',
        script: 'predict-retention-risk.js',
        priority: 'critical',
        description: 'Identify users at risk of churning'
    },
    {
        name: 'User Journey Analyzer',
        script: 'analyze-user-journeys.js',
        priority: 'high',
        description: 'Calculate conversion probabilities'
    },
    {
        name: 'Growth Velocity Tracker',
        script: 'track-growth-velocity.js',
        priority: 'high',
        description: 'Week-over-week growth metrics'
    },
    {
        name: 'Success Metrics Tracker',
        script: 'track-success-metrics.js',
        priority: 'medium',
        description: 'Progress vs goals'
    },
    {
        name: 'Social Proof Generator',
        script: 'generate-social-proof.js',
        priority: 'medium',
        description: 'Authentic marketing copy'
    }
];

async function runSystem(system) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Running: ${system.name}`);
    console.log(`   Priority: ${system.priority.toUpperCase()}`);
    console.log(`   ${system.description}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();

    try {
        const output = execSync(`node scripts/${system.script}`, {
            encoding: 'utf-8',
            stdio: 'pipe'
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(output);
        console.log(`\n✅ Completed in ${duration}s\n`);

        return { success: true, duration, output };
    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`\n❌ Failed after ${duration}s`);
        console.error(error.message);

        return { success: false, duration, error: error.message };
    }
}

async function generateBriefing(results) {
    const timestamp = new Date().toISOString();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => r.success === false).length;

    const briefing = {
        timestamp,
        summary: {
            total: results.length,
            successful,
            failed,
            totalDuration: results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(2)
        },
        systems: results
    };

    // Save briefing
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile(
        `data/daily-briefing-${timestamp.split('T')[0]}.json`,
        JSON.stringify(briefing, null, 2)
    );

    return briefing;
}

async function main() {
    console.log('\n');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(10) + 'GG LOOP MASTER AUTOMATION' + ' '.repeat(23) + '║');
    console.log('║' + ' '.repeat(15) + 'Daily Operations Briefing' + ' '.repeat(18) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log('\n');
    console.log(`⏰ Started: ${new Date().toLocaleString()}`);
    console.log(`📊 Running ${SYSTEMS.length} autonomous systems...\n`);

    const results = [];

    for (const system of SYSTEMS) {
        const result = await runSystem(system);
        results.push({
            name: system.name,
            script: system.script,
            ...result
        });
    }

    // Generate briefing
    const briefing = await generateBriefing(results);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📋 BRIEFING SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n✅ Successful: ${briefing.summary.successful}/${briefing.summary.total}`);
    console.log(`❌ Failed: ${briefing.summary.failed}/${briefing.summary.total}`);
    console.log(`⏱️  Total Duration: ${briefing.summary.totalDuration}s`);
    console.log(`\n💾 Report saved: data/daily-briefing-${briefing.timestamp.split('T')[0]}.json`);

    // Action items
    console.log('\n' + '═'.repeat(60));
    console.log('📝 NEXT ACTIONS');
    console.log('═'.repeat(60));
    console.log('\n1. Review retention risks in data/retention-risk.json');
    console.log('2. Email high-conversion users from data/user-journeys.json');
    console.log('3. Post growth update using data/social-proof.json');
    console.log('4. Check data/success-metrics.json for goal progress');

    if (briefing.summary.failed > 0) {
        console.log('\n⚠️  WARNING: Some systems failed. Check logs above for details.');
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
    console.log('═'.repeat(60) + '\n');
}

main().catch(error => {
    console.error('\n🚨 MASTER AUTOMATION FAILED:');
    console.error(error);
    process.exit(1);
});

/*
USAGE:

# Daily run (every morning at 8 AM)
node scripts/master-run.js

# Automate with cron (Linux/Mac):
0 8 * * * cd /path/to/project && node scripts/master-run.js

# Automate with Task Scheduler (Windows):
Create task to run: node C:\path\to\scripts\master-run.js

OUTPUT:
- Console: Full execution log
- File: data/daily-briefing-YYYY-MM-DD.json
- Individual system outputs in their respective data files

INTEGRATION:
Add to your morning routine:
1. Run master automation
2. Review briefing summary
3. Execute top 3 actions
4. Track progress in success metrics
*/
