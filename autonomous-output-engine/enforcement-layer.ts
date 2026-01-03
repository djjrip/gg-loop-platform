/**
 * GG LOOP Autonomous Output Engine - Enforcement Layer
 * Generates status outputs and tracks stagnation
 */

import * as fs from 'fs';
import * as path from 'path';
import { OutputStatus, OutputState, NextAction } from './types';
import { aoeConfig } from './config';

// Memory file for tracking stagnation across runs
const MEMORY_FILE = './autonomous-output-engine/memory.json';

interface AOEMemory {
    consecutiveIdleDays: number;
    lastProducingDate: string | null;
    lastCheckDate: string;
}

/**
 * Load memory from disk
 */
function loadMemory(): AOEMemory {
    try {
        const memPath = path.resolve(process.cwd(), MEMORY_FILE);
        if (fs.existsSync(memPath)) {
            return JSON.parse(fs.readFileSync(memPath, 'utf-8'));
        }
    } catch { }

    return {
        consecutiveIdleDays: 0,
        lastProducingDate: null,
        lastCheckDate: new Date().toISOString(),
    };
}

/**
 * Save memory to disk
 */
function saveMemory(memory: AOEMemory): void {
    const memPath = path.resolve(process.cwd(), MEMORY_FILE);
    const dir = path.dirname(memPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(memPath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Update stagnation tracking based on current state
 */
export function updateStagnationMemory(state: OutputState): number {
    const memory = loadMemory();
    const now = new Date();
    const lastCheck = new Date(memory.lastCheckDate);
    const daysSinceLastCheck = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));

    if (state === 'PRODUCING') {
        memory.consecutiveIdleDays = 0;
        memory.lastProducingDate = now.toISOString();
    } else {
        memory.consecutiveIdleDays += Math.max(1, daysSinceLastCheck);
    }

    memory.lastCheckDate = now.toISOString();
    saveMemory(memory);

    return memory.consecutiveIdleDays;
}

/**
 * Write status to JSON file
 */
export function writeStatusJson(status: OutputStatus): void {
    const outputPath = path.resolve(process.cwd(), aoeConfig.output.statusFile);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(status, null, 2), 'utf-8');
    console.log(`📄 Output status JSON written to: ${outputPath}`);
}

/**
 * Write human-readable status markdown
 * FOUNDER ZERO-THINK: What was produced? Is it enough? What's next?
 */
export function writeStatusMarkdown(status: OutputStatus): void {
    const outputPath = path.resolve(process.cwd(), aoeConfig.output.statusMarkdown);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const stateEmoji: Record<OutputState, string> = {
        PRODUCING: '🟢',
        READY_BUT_IDLE: '🟡',
        STALLED: '🔴',
        MISALIGNED: '🟠',
    };

    const priorityEmoji: Record<string, string> = {
        critical: '🚨',
        high: '⚡',
        medium: '📌',
        low: '💡',
    };

    let md = `# GG LOOP — Autonomous Output Status

**Last Check:** ${status.timestamp.toISOString()}

---

## ${stateEmoji[status.state]} OUTPUT STATE: ${status.state}

${status.diagnosis}

`;

    // Recent outputs
    md += `---\n\n## 📦 What Has Been Produced?\n\n`;

    if (status.recentOutputs.length === 0) {
        md += `**Nothing meaningful in the tracked period.**\n\n`;
    } else {
        const last5 = status.recentOutputs.slice(0, 5);
        md += `| When | Category | What | Impact |\n`;
        md += `|------|----------|------|--------|\n`;
        for (const event of last5) {
            const when = event.timestamp.toISOString().split('T')[0];
            md += `| ${when} | ${event.category} | ${event.description.substring(0, 40)} | ${event.impact} |\n`;
        }
        md += `\n`;
    }

    // Stats
    md += `**Output velocity:**\n`;
    md += `- Last 7 days: ${status.outputCountLast7Days} outputs\n`;
    md += `- Last 30 days: ${status.outputCountLast30Days} outputs\n`;
    md += `- Days stagnant: ${status.stagnationDays}\n\n`;

    // Is it enough?
    md += `---\n\n## 🎯 Is That Enough?\n\n`;

    if (status.state === 'PRODUCING') {
        md += `**Yes.** You are actively shipping. Keep the momentum.\n\n`;
    } else if (status.state === 'READY_BUT_IDLE') {
        md += `**No.** The platform is ready but you're not producing visible output. Time to ship.\n\n`;
    } else if (status.state === 'STALLED') {
        md += `**NO.** ${status.stagnationDays} days without meaningful output. This is a momentum emergency.\n\n`;
    } else if (status.state === 'MISALIGNED') {
        md += `**Wrong direction.** You're building but not distributing. Features without users = waste.\n\n`;
    }

    // What should be produced next
    md += `---\n\n## 📋 What Should Be Produced Next?\n\n`;

    if (status.nextActions.length === 0) {
        md += `No specific actions recommended. Continue current trajectory.\n\n`;
    } else {
        for (const action of status.nextActions) {
            md += `### ${priorityEmoji[action.priority]} [${action.priority.toUpperCase()}] ${action.action}\n`;
            md += `**Category:** ${action.category}\n`;
            md += `**Why:** ${action.reason}\n`;
            if (action.blockedBy) {
                md += `**⚠️ Blocked by:** ${action.blockedBy}\n`;
            }
            md += `\n`;
        }
    }

    md += `---\n\n*Auto-generated by GG LOOP Autonomous Output Engine*\n`;

    fs.writeFileSync(outputPath, md, 'utf-8');
    console.log(`📄 Output status MD written to: ${outputPath}`);
}
