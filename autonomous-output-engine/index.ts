/**
 * GG LOOP Autonomous Output Engine - Main Orchestrator
 * Coordinates observation, decision, and enforcement layers
 * 
 * Usage: npx tsx autonomous-output-engine/index.ts
 */

import { OutputStatus } from './types';
import { readPlatformContext, analyzeGitActivity, extractOutputEvents, daysSinceLastMeaningfulOutput } from './observation-layer';
import { classifyOutputState, generateDiagnosis, recommendActions, detectBlocker } from './decision-layer';
import { updateStagnationMemory, writeStatusJson, writeStatusMarkdown } from './enforcement-layer';

async function runOutputEngine(): Promise<OutputStatus> {
    console.log('🚀 GG LOOP Autonomous Output Engine Starting...\n');
    console.log('═'.repeat(60));

    // OBSERVATION PHASE
    console.log('\n👁️  Observing platform state...');
    const platformContext = readPlatformContext();
    console.log(`   Platform health: ${platformContext.isHealthy ? '✅ Healthy' : '❌ Issues detected'}`);

    console.log('\n📊 Analyzing git activity...');
    const gitActivity = analyzeGitActivity();
    console.log(`   Commits (7 days): ${gitActivity.commitsLast7Days}`);
    console.log(`   Commits (30 days): ${gitActivity.commitsLast30Days}`);
    console.log(`   Product changes: ${gitActivity.hasProductChanges ? 'Yes' : 'No'}`);
    console.log(`   Content changes: ${gitActivity.hasContentChanges ? 'Yes' : 'No'}`);

    console.log('\n📦 Extracting output events...');
    const outputEvents = extractOutputEvents();
    console.log(`   Found ${outputEvents.length} events in last 30 days`);

    const stagnationDays = daysSinceLastMeaningfulOutput(outputEvents);
    console.log(`   Days since meaningful output: ${stagnationDays}`);

    // DECISION PHASE
    console.log('\n🧠 Classifying output state...');
    const state = classifyOutputState(platformContext, gitActivity, outputEvents, stagnationDays);

    const stateEmoji = {
        PRODUCING: '🟢',
        READY_BUT_IDLE: '🟡',
        STALLED: '🔴',
        MISALIGNED: '🟠',
    };
    console.log(`   State: ${stateEmoji[state]} ${state}`);

    console.log('\n📝 Generating diagnosis...');
    const diagnosis = generateDiagnosis(state, platformContext, gitActivity, stagnationDays);
    console.log(`   ${diagnosis}`);

    console.log('\n🎯 Recommending actions...');
    const nextActions = recommendActions(state, platformContext, gitActivity, outputEvents);
    console.log(`   ${nextActions.length} actions recommended`);

    // Check for blockers
    const blocker = detectBlocker(platformContext, state);
    if (blocker) {
        nextActions.forEach(a => {
            if (!a.blockedBy) a.blockedBy = blocker;
        });
    }

    // ENFORCEMENT PHASE
    console.log('\n💾 Updating stagnation memory...');
    const consecutiveIdleDays = updateStagnationMemory(state);
    console.log(`   Consecutive idle days: ${consecutiveIdleDays}`);

    // Build status object
    const meaningfulEvents = outputEvents.filter(e => e.impact !== 'low');
    const status: OutputStatus = {
        state,
        timestamp: new Date(),
        recentOutputs: meaningfulEvents.slice(0, 10),
        outputCountLast7Days: outputEvents.filter(e =>
            Date.now() - e.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
        ).length,
        outputCountLast30Days: outputEvents.length,
        nextActions,
        diagnosis,
        stagnationDays,
        consecutiveIdleDays,
        lastMeaningfulOutput: meaningfulEvents[0]?.timestamp,
    };

    // Write outputs
    console.log('\n📄 Writing status artifacts...');
    writeStatusJson(status);
    writeStatusMarkdown(status);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`\n${stateEmoji[state]} OUTPUT STATE: ${state}`);
    console.log(`\n📋 Top Action: ${nextActions[0]?.action || 'No action required'}`);
    console.log('\n✅ Autonomous Output Engine check complete.\n');

    return status;
}

// Run if executed directly
runOutputEngine().catch(console.error);

export { runOutputEngine };
