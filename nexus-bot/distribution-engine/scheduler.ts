/**
 * NEXUS Autonomous Distribution Scheduler
 * 
 * CADENCE:
 * - Twitter: 3-4 posts/day, 6h minimum spacing, 100/month cap
 * - Reddit: 1 post every 48-72h
 * 
 * BEHAVIOR:
 * - Ticks every 30 minutes
 * - Generates fresh content each run
 * - Rotates angles (no repeat within 72h)
 * - Auto-retries on failure
 */

import * as fs from 'fs';
import * as path from 'path';

interface SchedulerState {
    lastTick: string;
    lastTwitterPost: string | null;
    lastRedditPost: string | null;
    twitterPostsToday: number;
    twitterPostsThisMonth: number;
    monthStart: string;
    lastAngle: string | null;
    anglesUsed: { angle: string; usedAt: string }[];
    queue: QueuedPost[];
}

interface QueuedPost {
    channel: 'twitter' | 'reddit';
    content: string;
    title?: string;
    angle: string;
    scheduledFor: string;
    retryCount: number;
}

const STATE_FILE = path.resolve(__dirname, 'scheduler_state.json');
const TICK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// Content angles for rotation
const CONTENT_ANGLES = [
    'build_log',
    'shipping_proof',
    'failure_fix',
    'product_value',
    'monetization_clarity',
    'investor_signal',
    'founder_reality',
    'system_design',
    'automation_lesson',
];

// Angle cooldown (72h)
const ANGLE_COOLDOWN_MS = 72 * 60 * 60 * 1000;

/**
 * Load scheduler state
 */
export function loadSchedulerState(): SchedulerState {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch { }

    const now = new Date();
    return {
        lastTick: now.toISOString(),
        lastTwitterPost: null,
        lastRedditPost: null,
        twitterPostsToday: 0,
        twitterPostsThisMonth: 0,
        monthStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        lastAngle: null,
        anglesUsed: [],
        queue: [],
    };
}

/**
 * Save scheduler state
 */
export function saveSchedulerState(state: SchedulerState): void {
    state.lastTick = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Check if we can post to Twitter now
 */
export function canPostTwitter(state: SchedulerState): { canPost: boolean; reason?: string } {
    // Monthly cap (100)
    if (state.twitterPostsThisMonth >= 100) {
        return { canPost: false, reason: 'Monthly cap reached (100)' };
    }

    // Daily cap (4)
    if (state.twitterPostsToday >= 4) {
        return { canPost: false, reason: 'Daily cap reached (4)' };
    }

    // 6h spacing
    if (state.lastTwitterPost) {
        const hoursSince = (Date.now() - new Date(state.lastTwitterPost).getTime()) / (1000 * 60 * 60);
        if (hoursSince < 6) {
            return { canPost: false, reason: `6h spacing (${(6 - hoursSince).toFixed(1)}h remaining)` };
        }
    }

    return { canPost: true };
}

/**
 * Check if we can post to Reddit now
 */
export function canPostReddit(state: SchedulerState): { canPost: boolean; reason?: string } {
    if (state.lastRedditPost) {
        const hoursSince = (Date.now() - new Date(state.lastRedditPost).getTime()) / (1000 * 60 * 60);
        if (hoursSince < 48) {
            return { canPost: false, reason: `48h spacing (${(48 - hoursSince).toFixed(1)}h remaining)` };
        }
    }

    return { canPost: true };
}

/**
 * Get next available angle (not used in last 72h)
 */
export function getNextAngle(state: SchedulerState): string {
    const now = Date.now();

    // Filter out recently used angles
    const recentlyUsed = state.anglesUsed
        .filter(a => now - new Date(a.usedAt).getTime() < ANGLE_COOLDOWN_MS)
        .map(a => a.angle);

    // Find available angles
    const available = CONTENT_ANGLES.filter(a => !recentlyUsed.includes(a));

    // If all used, pick least recently used
    if (available.length === 0) {
        const sorted = [...state.anglesUsed].sort((a, b) =>
            new Date(a.usedAt).getTime() - new Date(b.usedAt).getTime()
        );
        return sorted[0]?.angle || CONTENT_ANGLES[0];
    }

    // Random from available
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Mark angle as used
 */
export function markAngleUsed(state: SchedulerState, angle: string): void {
    state.anglesUsed.push({ angle, usedAt: new Date().toISOString() });
    state.lastAngle = angle;

    // Keep only last 20 entries
    if (state.anglesUsed.length > 20) {
        state.anglesUsed = state.anglesUsed.slice(-20);
    }
}

/**
 * Record Twitter post
 */
export function recordTwitterPost(state: SchedulerState): void {
    state.lastTwitterPost = new Date().toISOString();
    state.twitterPostsToday++;
    state.twitterPostsThisMonth++;
}

/**
 * Record Reddit post
 */
export function recordRedditPost(state: SchedulerState): void {
    state.lastRedditPost = new Date().toISOString();
}

/**
 * Reset daily counter (call at midnight)
 */
export function resetDailyCounters(state: SchedulerState): void {
    const now = new Date();
    const lastTick = new Date(state.lastTick);

    // Reset if day changed
    if (now.getDate() !== lastTick.getDate() ||
        now.getMonth() !== lastTick.getMonth() ||
        now.getFullYear() !== lastTick.getFullYear()) {
        state.twitterPostsToday = 0;
    }

    // Reset monthly counter
    const monthStart = new Date(state.monthStart);
    if (now.getMonth() !== monthStart.getMonth() || now.getFullYear() !== monthStart.getFullYear()) {
        state.twitterPostsThisMonth = 0;
        state.monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
}

/**
 * Get scheduler status for display
 */
export function getSchedulerStatus(state: SchedulerState): string {
    const twitterCheck = canPostTwitter(state);
    const redditCheck = canPostReddit(state);

    return [
        `Twitter: ${state.twitterPostsToday}/4 today, ${state.twitterPostsThisMonth}/100 month${twitterCheck.canPost ? ' ✅' : ` ⏳ ${twitterCheck.reason}`}`,
        `Reddit: ${redditCheck.canPost ? '✅ Ready' : `⏳ ${redditCheck.reason}`}`,
    ].join(' | ');
}

export { SchedulerState, QueuedPost };
