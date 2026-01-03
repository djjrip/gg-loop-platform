/**
 * NEXUS - Main Orchestrator
 * THE SOVEREIGN OPERATING INTELLIGENCE FOR GG LOOP LLC
 * 
 * Usage: npx tsx nexus-bot/index.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { NexusStatus, FailureRecord } from './types';
import { nexusConfig } from './config';
import { observeSubsystems, isPlatformBroken, isOutputBroken } from './observer';
import { classifyNexusState, generateReason, determineAutoActions, determineNextAction, generatePreventionUpgrades } from './decision-engine';
import { generateInnovation } from './innovation-engine';
import { writeNexusJson, writeNexusMarkdown } from './output-generator';

const MEMORY_PATH = './nexus-bot/memory.json';

interface NexusMemory {
    runCount: number;
    failureHistory: FailureRecord[];
    lastRunDate: string;
}

/**
 * Load memory
 */
function loadMemory(): NexusMemory {
    try {
        const memPath = path.resolve(process.cwd(), MEMORY_PATH);
        if (fs.existsSync(memPath)) {
            return JSON.parse(fs.readFileSync(memPath, 'utf-8'));
        }
    } catch { }
    return { runCount: 0, failureHistory: [], lastRunDate: '' };
}

/**
 * Save memory
 */
function saveMemory(memory: NexusMemory): void {
    const memPath = path.resolve(process.cwd(), MEMORY_PATH);
    const dir = path.dirname(memPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(memPath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Record failure for learning
 */
function recordFailure(memory: NexusMemory, type: string, description: string): FailureRecord {
    const existing = memory.failureHistory.find(f => f.type === type && !f.resolved);

    if (existing) {
        existing.recurrenceCount++;
        existing.timestamp = new Date();
        return existing;
    }

    const record: FailureRecord = {
        id: `failure-${Date.now()}`,
        timestamp: new Date(),
        type,
        description,
        resolved: false,
        recurrenceCount: 1,
    };

    memory.failureHistory.push(record);
    return record;
}

/**
 * THE MAIN NEXUS RUN
 */
async function runNexus(): Promise<NexusStatus> {
    console.log('\n' + '█'.repeat(60));
    console.log('█ NEXUS — GG LOOP OPERATING BRAIN');
    console.log('█'.repeat(60) + '\n');

    const memory = loadMemory();
    memory.runCount++;
    memory.lastRunDate = new Date().toISOString();

    // PHASE 1: OBSERVE
    console.log('👁️  OBSERVING all subsystems...');
    const health = observeSubsystems();
    console.log(`   Frontend: ${health.frontend.status}`);
    console.log(`   Backend: ${health.backend.status}`);
    console.log(`   Database: ${health.database.status}`);
    console.log(`   Deploy: ${health.deploy.status}`);
    console.log(`   Output: ${health.output.status}`);

    // PHASE 2: DECIDE
    console.log('\n🧠 DECIDING state...');
    const state = classifyNexusState(health);
    const stateEmoji = {
        STABLE_AND_PRODUCING: '🟢',
        STABLE_BUT_IDLE: '🟡',
        MISALIGNED_BUILDING_NO_DISTRIBUTION: '🟠',
        BROKEN_PLATFORM: '🔴',
        BROKEN_OUTPUT_PIPELINE: '🔴',
        RISKY_DRIFT: '🟣',
    };
    console.log(`   State: ${stateEmoji[state]} ${state}`);

    const reason = generateReason(state, health);
    console.log(`   Reason: ${reason.substring(0, 60)}...`);

    // Track failures for learning
    if (isPlatformBroken(health)) {
        recordFailure(memory, 'PLATFORM_BROKEN', `Platform failure at ${new Date().toISOString()}`);
    }
    if (isOutputBroken(health)) {
        recordFailure(memory, 'OUTPUT_STALLED', `Output stalled at ${new Date().toISOString()}`);
    }

    // PHASE 3: ORCHESTRATE
    console.log('\n⚙️  ORCHESTRATING actions...');
    const autoActions = determineAutoActions(state, health);
    console.log(`   ${autoActions.length} auto-actions active`);

    const nextAction = determineNextAction(state, health);
    if (nextAction) {
        console.log(`   Next Action Required: ${nextAction.substring(0, 50)}...`);
    } else {
        console.log('   No founder action required');
    }

    // PHASE 4: PREVENT
    console.log('\n🛡️  GENERATING prevention upgrades...');
    const preventionUpgrades = generatePreventionUpgrades(state);
    console.log(`   ${preventionUpgrades.length} prevention upgrades proposed`);

    // PHASE 5: INNOVATE (MANDATORY)
    console.log('\n💡 INNOVATING (mandatory)...');
    const inSafeMode = nexusConfig.safeModeConditions.includes(state);
    const innovation = generateInnovation(state);

    if (inSafeMode) {
        console.log('   ⚠️ SAFE MODE: Innovation generated but paused for execution');
    } else {
        console.log(`   Leverage: ${innovation.leverageUpgrade.title}`);
        console.log(`   Efficiency: ${innovation.efficiencyUpgrade.title}`);
    }

    // Build status
    const status: NexusStatus = {
        state,
        timestamp: new Date(),
        reason,
        autoActions,
        nextAction,
        innovation,
        preventionUpgrades,
        inSafeMode,
        failureMemory: memory.failureHistory.slice(-5), // Keep last 5
        runCount: memory.runCount,
    };

    // PHASE 6: OUTPUT
    console.log('\n📄 WRITING status artifacts...');
    writeNexusJson(status);
    writeNexusMarkdown(status);

    // Save memory
    saveMemory(memory);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`${stateEmoji[state]} NEXUS STATE: ${state}`);
    if (nextAction) {
        console.log(`🎯 NEXT ACTION: ${nextAction}`);
    }
    console.log(`💡 INNOVATION: ${innovation.leverageUpgrade.title} + ${innovation.efficiencyUpgrade.title}`);
    console.log('═'.repeat(60));
    console.log(`\n✅ NEXUS run #${memory.runCount} complete.\n`);

    return status;
}

// Run if executed directly
runNexus().catch(console.error);

export { runNexus };
