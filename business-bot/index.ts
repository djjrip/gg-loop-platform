/**
 * GG LOOP Business Bot - Main Orchestrator
 * Central controller that runs all checks and produces status reports
 * 
 * Usage: npx tsx business-bot/index.ts
 */

import { BotStatus, HealthCheck } from './types';
import { checkFrontend } from './watchdog-frontend';
import { checkBackend } from './watchdog-backend';
import { checkDeployment, generateDeployRunbook } from './deployment-agent';
import { checkBusinessFreshness } from './freshness-agent';
import {
    determineState,
    determineNextAction,
    writeStatusJson,
    writeStatusMarkdown
} from './status-reporter';

async function runBusinessBot(): Promise<BotStatus> {
    console.log('🤖 GG LOOP Business Bot Starting...\n');
    console.log('━'.repeat(50));

    const allChecks: HealthCheck[] = [];

    // Phase 1: Frontend Health
    console.log('\n📱 Checking Frontend...');
    const frontendResult = await checkFrontend();
    allChecks.push(...frontendResult.checks);
    frontendResult.checks.forEach(c => {
        console.log(`   ${c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌'} ${c.name}: ${c.message}`);
    });

    // Phase 2: Backend Health
    console.log('\n🖥️  Checking Backend...');
    const backendResult = await checkBackend();
    allChecks.push(...backendResult.checks);
    backendResult.checks.forEach(c => {
        console.log(`   ${c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌'} ${c.name}: ${c.message}`);
    });

    // Phase 3: Deployment Status
    console.log('\n🚀 Checking Deployment...');
    const deployResult = await checkDeployment();
    allChecks.push(...deployResult.checks);
    deployResult.checks.forEach(c => {
        console.log(`   ${c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌'} ${c.name}: ${c.message}`);
    });

    // Phase 4: Business Freshness
    console.log('\n📈 Checking Business Freshness...');
    const freshnessResult = checkBusinessFreshness();
    allChecks.push(...freshnessResult.checks);
    freshnessResult.checks.forEach(c => {
        console.log(`   ${c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌'} ${c.name}: ${c.message}`);
    });

    // Build status object
    const status: BotStatus = {
        state: determineState(allChecks),
        timestamp: new Date(),
        checks: allChecks,
        deployment: deployResult.status,
        freshness: freshnessResult.freshness,
        nextAction: '', // Will be filled in below
        runbookStep: undefined,
    };

    status.nextAction = determineNextAction(status);

    // Generate runbook if deployment is stale
    if (deployResult.status?.isStale) {
        status.runbookStep = generateDeployRunbook(deployResult.status);
    }

    // Output summary
    console.log('\n' + '━'.repeat(50));
    const stateEmoji = { HEALTHY: '🟢', DEGRADED: '🟡', BROKEN: '🔴' };
    console.log(`\n${stateEmoji[status.state]} SYSTEM STATE: ${status.state}`);
    console.log(`\n📋 Next Action: ${status.nextAction}`);

    // Write artifacts
    console.log('\n📄 Writing status artifacts...');
    writeStatusJson(status);
    writeStatusMarkdown(status);

    console.log('\n✅ Business Bot check complete.\n');

    return status;
}

// Run if executed directly
runBusinessBot().catch(console.error);

export { runBusinessBot };
