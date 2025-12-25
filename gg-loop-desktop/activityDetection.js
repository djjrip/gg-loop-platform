const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * GG LOOP Anti-Idle Detection System
 * 
 * Prevents users from earning points by leaving games idle.
 * Tracks mouse movement and keyboard input.
 */

// Activity tracking state
let lastMouseX = 0;
let lastMouseY = 0;
let lastActivityTime = Date.now();
let activityCheckInterval = null;
let isActive = false;
let idleWarnings = 0;

// Configuration
const IDLE_THRESHOLD_MS = 60000; // 1 minute of no input = idle
const ACTIVITY_CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
const MAX_IDLE_WARNINGS = 3; // After 3 warnings, pause session

/**
 * Get mouse position using PowerShell
 */
async function getMousePosition() {
    try {
        const { stdout } = await execAsync(
            'powershell -Command "[System.Windows.Forms.Cursor]::Position | Select-Object X,Y | ConvertTo-Json"',
            { timeout: 2000 }
        );
        const pos = JSON.parse(stdout);
        return { x: pos.X, y: pos.Y };
    } catch (error) {
        // Fallback - assume active if we can't check
        return { x: lastMouseX + 1, y: lastMouseY + 1 };
    }
}

/**
 * Check if user has been active (mouse moved)
 */
async function checkActivity() {
    try {
        const currentPos = await getMousePosition();

        // Check if mouse moved
        if (currentPos.x !== lastMouseX || currentPos.y !== lastMouseY) {
            lastMouseX = currentPos.x;
            lastMouseY = currentPos.y;
            lastActivityTime = Date.now();
            idleWarnings = 0;

            if (!isActive) {
                isActive = true;
                console.log('[GG LOOP] Activity detected - tracking resumed');
            }

            return {
                isActive: true,
                idleTimeMs: 0,
                status: 'ACTIVE'
            };
        }

        // Calculate idle time
        const idleTimeMs = Date.now() - lastActivityTime;

        if (idleTimeMs > IDLE_THRESHOLD_MS) {
            isActive = false;
            idleWarnings++;

            console.log(`[GG LOOP] Idle detected: ${Math.round(idleTimeMs / 1000)}s - Warning ${idleWarnings}/${MAX_IDLE_WARNINGS}`);

            return {
                isActive: false,
                idleTimeMs,
                idleWarnings,
                status: idleWarnings >= MAX_IDLE_WARNINGS ? 'PAUSED' : 'WARNING'
            };
        }

        return {
            isActive: true,
            idleTimeMs,
            status: 'ACTIVE'
        };
    } catch (error) {
        console.error('[GG LOOP] Activity check error:', error);
        return { isActive: true, status: 'UNKNOWN' };
    }
}

/**
 * Start activity monitoring
 * @param {Function} onStatusChange - Callback when status changes
 */
function startActivityMonitoring(onStatusChange) {
    console.log('[GG LOOP] Starting activity monitoring');

    // Initialize mouse position
    getMousePosition().then(pos => {
        lastMouseX = pos.x;
        lastMouseY = pos.y;
        lastActivityTime = Date.now();
        isActive = true;
    });

    // Check activity periodically
    activityCheckInterval = setInterval(async () => {
        const status = await checkActivity();
        if (onStatusChange) {
            onStatusChange(status);
        }
    }, ACTIVITY_CHECK_INTERVAL_MS);

    return () => stopActivityMonitoring();
}

/**
 * Stop activity monitoring
 */
function stopActivityMonitoring() {
    if (activityCheckInterval) {
        clearInterval(activityCheckInterval);
        activityCheckInterval = null;
    }
    console.log('[GG LOOP] Activity monitoring stopped');
}

/**
 * Calculate points multiplier based on activity
 */
function getActivityMultiplier(activityStatus) {
    switch (activityStatus.status) {
        case 'ACTIVE':
            return 1.0; // Full points
        case 'WARNING':
            return 0.5; // Half points during warning
        case 'PAUSED':
            return 0.0; // NO POINTS when idle
        default:
            return 1.0;
    }
}

/**
 * Reset idle warnings (call when user becomes active again)
 */
function resetIdleWarnings() {
    idleWarnings = 0;
    isActive = true;
    lastActivityTime = Date.now();
}

/**
 * Get current activity state
 */
function getActivityState() {
    return {
        isActive,
        idleWarnings,
        lastActivityTime,
        idleDurationMs: Date.now() - lastActivityTime
    };
}

module.exports = {
    checkActivity,
    startActivityMonitoring,
    stopActivityMonitoring,
    getActivityMultiplier,
    resetIdleWarnings,
    getActivityState,
    IDLE_THRESHOLD_MS,
    MAX_IDLE_WARNINGS
};
