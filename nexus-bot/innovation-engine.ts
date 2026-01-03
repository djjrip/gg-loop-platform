/**
 * NEXUS - Innovation Engine
 * Generates mandatory leverage and efficiency upgrades on EVERY run
 * Never repeats the same proposal twice
 */

import * as fs from 'fs';
import * as path from 'path';
import { InnovationProposal, PreventionUpgrade, NexusState } from './types';
import { nexusConfig } from './config';

interface InnovationLog {
    proposedIds: string[];
    lastProposalDate: string;
}

const INNOVATION_LOG_PATH = './nexus-bot/innovation-log.json';

/**
 * Load innovation log
 */
function loadInnovationLog(): InnovationLog {
    try {
        const logPath = path.resolve(process.cwd(), INNOVATION_LOG_PATH);
        if (fs.existsSync(logPath)) {
            return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        }
    } catch { }
    return { proposedIds: [], lastProposalDate: '' };
}

/**
 * Save innovation log
 */
function saveInnovationLog(log: InnovationLog): void {
    const logPath = path.resolve(process.cwd(), INNOVATION_LOG_PATH);
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');
}

/**
 * All possible leverage upgrades
 */
const LEVERAGE_UPGRADES: PreventionUpgrade[] = [
    {
        id: 'auto-deploy-health-gate',
        type: 'leverage',
        title: 'Deploy Health Gate',
        description: 'Block deploys that fail frontend boot test automatically',
        effort: 'medium',
        impact: 'high',
    },
    {
        id: 'crash-auto-restart',
        type: 'leverage',
        title: 'Automatic Crash Recovery',
        description: 'Add Railway restart policy with exponential backoff',
        effort: 'low',
        impact: 'high',
    },
    {
        id: 'stale-deploy-auto-trigger',
        type: 'leverage',
        title: 'Stale Deploy Auto-Trigger',
        description: 'If deploy stale >2 hours, auto-trigger via Railway API',
        effort: 'medium',
        impact: 'high',
    },
    {
        id: 'output-streak-tracker',
        type: 'leverage',
        title: 'Output Streak Tracker',
        description: 'Gamify output: track consecutive days of shipping',
        effort: 'low',
        impact: 'medium',
    },
    {
        id: 'pre-commit-lint',
        type: 'leverage',
        title: 'Pre-Commit Type Check',
        description: 'Block commits that break TypeScript compilation',
        effort: 'low',
        impact: 'medium',
    },
    {
        id: 'content-auto-generator',
        type: 'leverage',
        title: 'Commit-to-Post Generator',
        description: 'Auto-generate social post draft from every meaningful commit',
        effort: 'medium',
        impact: 'high',
    },
    {
        id: 'error-pattern-detector',
        type: 'leverage',
        title: 'Error Pattern Detector',
        description: 'Track recurring errors and auto-generate fix proposals',
        effort: 'high',
        impact: 'high',
    },
    {
        id: 'founder-energy-saver',
        type: 'leverage',
        title: 'Decision Automation',
        description: 'Replace one recurring manual decision with a rule-based auto-action',
        effort: 'medium',
        impact: 'high',
    },
];

/**
 * All possible efficiency upgrades
 */
const EFFICIENCY_UPGRADES: PreventionUpgrade[] = [
    {
        id: 'parallel-build',
        type: 'efficiency',
        title: 'Parallel Build Steps',
        description: 'Run frontend and backend builds in parallel to cut time',
        effort: 'low',
        impact: 'medium',
    },
    {
        id: 'status-at-glance',
        type: 'efficiency',
        title: 'One-Line Status',
        description: 'Add /api/nexus endpoint returning single JSON with all states',
        effort: 'low',
        impact: 'high',
    },
    {
        id: 'startup-cache',
        type: 'efficiency',
        title: 'Startup Caching',
        description: 'Cache config/schema checks to speed up cold starts',
        effort: 'medium',
        impact: 'medium',
    },
    {
        id: 'unified-logs',
        type: 'efficiency',
        title: 'Unified Log Stream',
        description: 'Single log aggregator page showing all bot outputs',
        effort: 'medium',
        impact: 'medium',
    },
    {
        id: 'one-command-check',
        type: 'efficiency',
        title: 'Single Health Command',
        description: 'npm run check-all that runs bot + aoe + nexus in sequence',
        effort: 'low',
        impact: 'high',
    },
    {
        id: 'inline-fix-suggestions',
        type: 'efficiency',
        title: 'Inline Fix Commands',
        description: 'Include copy-paste terminal commands in every error report',
        effort: 'low',
        impact: 'high',
    },
    {
        id: 'weekly-auto-summary',
        type: 'efficiency',
        title: 'Weekly Output Summary',
        description: 'Auto-generate and save founder-ready weekly progress report',
        effort: 'medium',
        impact: 'medium',
    },
    {
        id: 'mobile-status-page',
        type: 'efficiency',
        title: 'Mobile Status Page',
        description: 'PWA-friendly /status page founder can check from phone',
        effort: 'medium',
        impact: 'medium',
    },
];

/**
 * Generate mandatory innovation proposals
 * NEVER repeats a proposal that was already made
 */
export function generateInnovation(state: NexusState): InnovationProposal {
    const log = loadInnovationLog();

    // Filter out already-proposed ideas
    const availableLeverage = LEVERAGE_UPGRADES.filter(u => !log.proposedIds.includes(u.id));
    const availableEfficiency = EFFICIENCY_UPGRADES.filter(u => !log.proposedIds.includes(u.id));

    // Priority: high impact first
    const sortByImpact = (a: PreventionUpgrade, b: PreventionUpgrade) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.impact] - order[b.impact];
    };

    availableLeverage.sort(sortByImpact);
    availableEfficiency.sort(sortByImpact);

    // Fallback if all exhausted (restart catalog with new IDs)
    const leverageUpgrade = availableLeverage[0] || {
        ...LEVERAGE_UPGRADES[0],
        id: `${LEVERAGE_UPGRADES[0].id}-v${Date.now()}`,
    };

    const efficiencyUpgrade = availableEfficiency[0] || {
        ...EFFICIENCY_UPGRADES[0],
        id: `${EFFICIENCY_UPGRADES[0].id}-v${Date.now()}`,
    };

    // Record proposals
    log.proposedIds.push(leverageUpgrade.id, efficiencyUpgrade.id);
    log.lastProposalDate = new Date().toISOString();
    saveInnovationLog(log);

    return {
        leverageUpgrade,
        efficiencyUpgrade,
    };
}
