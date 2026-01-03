/**
 * NEXUS - Sanitized Public Output Generator
 * 
 * SECURITY: This generates PUBLIC output only.
 * All sensitive cognition is stripped.
 * 
 * For founder-only output, use the auth-gated /api/nexus/founder endpoint
 */

import * as fs from 'fs';
import * as path from 'path';
import { NexusStatus, NexusState } from './types';
import { nexusConfig } from './config';

/**
 * Write full status to JSON file (INTERNAL USE ONLY)
 * This file contains sensitive cognition - never serve publicly
 */
export function writeNexusJson(status: NexusStatus): void {
    const outputPath = path.resolve(process.cwd(), nexusConfig.output.statusFile);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(status, null, 2), 'utf-8');
    console.log(`📄 NEXUS JSON: ${outputPath}`);
}

/**
 * State emoji map
 */
const STATE_EMOJI: Record<NexusState, string> = {
    STABLE_AND_PRODUCING: '🟢',
    STABLE_BUT_IDLE: '🟡',
    MISALIGNED_BUILDING_NO_DISTRIBUTION: '🟠',
    BROKEN_PLATFORM: '🔴',
    BROKEN_OUTPUT_PIPELINE: '🔴',
    RISKY_DRIFT: '🟣',
};

/**
 * Write NEXUS_STATUS.md - Founder document (INTERNAL)
 * Contains full cognition - for local use only
 */
export function writeNexusMarkdown(status: NexusStatus): void {
    const outputPath = path.resolve(process.cwd(), nexusConfig.output.statusMarkdown);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let md = `# NEXUS — GG LOOP Operating Brain

**Last Check:** ${status.timestamp.toISOString()}
${status.inSafeMode ? '\n⚠️ **SAFE MODE ACTIVE** — Innovation paused, focus on restore\n' : ''}
---

## ${STATE_EMOJI[status.state]} STATE: ${status.state.replace(/_/g, ' ')}

${status.reason}

`;

    // Auto actions
    md += `---\n\n## 🤖 AUTO_ACTIONS\n\n`;
    if (status.autoActions.length === 0) {
        md += `No auto-actions running.\n\n`;
    } else {
        for (const action of status.autoActions) {
            const icon = action.status === 'running' ? '▶️' : action.status === 'completed' ? '✅' : '⏸️';
            md += `- ${icon} ${action.description}\n`;
        }
        md += `\n`;
    }

    // Next action
    md += `---\n\n## 🎯 NEXT_ACTION\n\n`;
    if (status.nextAction) {
        md += `**${status.nextAction}**\n\n`;
    } else {
        md += `*No founder action required.*\n\n`;
    }

    // Prevention upgrades
    md += `---\n\n## 🛡️ PREVENTION_UPGRADES\n\n`;
    for (const upgrade of status.preventionUpgrades) {
        md += `### ${upgrade.type === 'leverage' ? '⚡' : '🔧'} ${upgrade.title}\n`;
        md += `${upgrade.description}\n\n`;
    }

    // Innovation
    md += `---\n\n## 💡 INNOVATION\n\n`;
    md += `### ⚡ ${status.innovation.leverageUpgrade.title}\n`;
    md += `${status.innovation.leverageUpgrade.description}\n\n`;
    md += `### 🔧 ${status.innovation.efficiencyUpgrade.title}\n`;
    md += `${status.innovation.efficiencyUpgrade.description}\n\n`;

    md += `---\n\n*Run #${status.runCount}*\n`;

    fs.writeFileSync(outputPath, md, 'utf-8');
    console.log(`📄 NEXUS MD: ${outputPath}`);
}
