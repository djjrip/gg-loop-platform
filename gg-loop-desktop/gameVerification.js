/**
 * GG LOOP Game Verification Module
 * 
 * CRITICAL INTEGRITY SYSTEM
 * Points ONLY accrue when:
 * 1. Supported game process is running
 * 2. Game window is in FOREGROUND (active)
 * 3. User account is verified and bound
 * 
 * This replaces the old mouse-only activity detection.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const { GAME_PROCESSES } = require('./gameDetection');

const execAsync = promisify(exec);

// Verification states - ONLY ACTIVE_PLAY_CONFIRMED accrues points
const VerificationState = {
    NOT_PLAYING: 'NOT_PLAYING',           // No supported game detected
    GAME_DETECTED: 'GAME_DETECTED',       // Game running but not in foreground
    ACTIVE_PLAY_CONFIRMED: 'ACTIVE_PLAY_CONFIRMED', // Game running + foreground = POINTS
    PAUSED: 'PAUSED',                     // Game minimized or alt-tabbed
    ERROR: 'ERROR'                        // Verification failed
};

// Current verification state
let currentState = {
    state: VerificationState.NOT_PLAYING,
    gameProcess: null,
    gameName: null,
    isForeground: false,
    lastVerifiedAt: null,
    userId: null,
    username: null,
    errorReason: null
};

/**
 * Get the currently active (foreground) window process name
 */
async function getForegroundProcess() {
    try {
        // PowerShell command to get foreground window process
        const { stdout } = await execAsync(
            `powershell -Command "$fw = [System.Runtime.InteropServices.Marshal]::GetForegroundWindow(); ` +
            `$procId = @(); [void][System.Runtime.InteropServices.Marshal]::GetWindowThreadProcessId($fw, [ref]$procId); ` +
            `(Get-Process -Id $procId[0]).ProcessName"`,
            { timeout: 3000 }
        );
        return stdout.trim().toLowerCase();
    } catch (error) {
        console.error('[Verification] Foreground detection error:', error.message);
        return null;
    }
}

/**
 * Check if a game is running AND in foreground
 * This is the ONLY way to confirm active play
 */
async function verifyActivePlay() {
    try {
        // Step 1: Get all running processes
        const { stdout: processListOutput } = await execAsync(
            'powershell -Command "Get-Process | Select-Object -ExpandProperty ProcessName"',
            { timeout: 5000 }
        );

        const runningProcesses = processListOutput
            .split('\n')
            .map(p => p.trim().toLowerCase())
            .filter(Boolean);

        // Step 2: Find if any supported game is running
        let detectedGame = null;
        for (const [gameId, game] of Object.entries(GAME_PROCESSES)) {
            for (const process of game.processes) {
                const processName = process.replace('.exe', '').toLowerCase();
                if (runningProcesses.includes(processName)) {
                    detectedGame = {
                        id: gameId,
                        name: game.name,
                        process: processName,
                        icon: game.icon
                    };
                    break;
                }
            }
            if (detectedGame) break;
        }

        // No game running
        if (!detectedGame) {
            currentState = {
                ...currentState,
                state: VerificationState.NOT_PLAYING,
                gameProcess: null,
                gameName: null,
                isForeground: false,
                lastVerifiedAt: new Date().toISOString(),
                errorReason: null
            };
            return currentState;
        }

        // Step 3: Check if game is in foreground
        const foregroundProcess = await getForegroundProcess();
        const isForeground = foregroundProcess === detectedGame.process;

        if (isForeground) {
            // ACTIVE PLAY CONFIRMED - This is the ONLY state that accrues points
            currentState = {
                ...currentState,
                state: VerificationState.ACTIVE_PLAY_CONFIRMED,
                gameProcess: detectedGame.process,
                gameName: detectedGame.name,
                gameIcon: detectedGame.icon,
                isForeground: true,
                lastVerifiedAt: new Date().toISOString(),
                errorReason: null
            };
        } else {
            // Game is running but NOT in foreground (alt-tabbed, minimized)
            currentState = {
                ...currentState,
                state: VerificationState.GAME_DETECTED,
                gameProcess: detectedGame.process,
                gameName: detectedGame.name,
                gameIcon: detectedGame.icon,
                isForeground: false,
                lastVerifiedAt: new Date().toISOString(),
                errorReason: 'Game not in foreground - switch to game window to earn points'
            };
        }

        return currentState;
    } catch (error) {
        console.error('[Verification] Error:', error.message);
        currentState = {
            ...currentState,
            state: VerificationState.ERROR,
            errorReason: error.message,
            lastVerifiedAt: new Date().toISOString()
        };
        return currentState;
    }
}

/**
 * Set the verified user info (after /api/me call)
 */
function setVerifiedUser(userId, username) {
    currentState.userId = userId;
    currentState.username = username;
    console.log(`[Verification] User verified: ${username} (${userId})`);
}

/**
 * Clear user on logout
 */
function clearUser() {
    currentState.userId = null;
    currentState.username = null;
}

/**
 * Check if points can accrue
 * Points ONLY accrue when:
 * 1. User is verified (bound to account)
 * 2. Game is running AND in foreground
 */
function canAccruePoints() {
    if (!currentState.userId) {
        return { canAccrue: false, reason: 'Account not verified' };
    }
    if (currentState.state !== VerificationState.ACTIVE_PLAY_CONFIRMED) {
        return { canAccrue: false, reason: getStatusExplanation() };
    }
    return { canAccrue: true, reason: null };
}

/**
 * Get human-readable status explanation
 */
function getStatusExplanation() {
    switch (currentState.state) {
        case VerificationState.NOT_PLAYING:
            return 'No supported game detected. Launch a game to start earning.';
        case VerificationState.GAME_DETECTED:
            return `${currentState.gameName} detected but not in focus. Click on the game window to earn points.`;
        case VerificationState.ACTIVE_PLAY_CONFIRMED:
            return `Playing ${currentState.gameName}. Points are accruing.`;
        case VerificationState.PAUSED:
            return 'Session paused. Return to the game to continue earning.';
        case VerificationState.ERROR:
            return `Verification error: ${currentState.errorReason || 'Unknown error'}`;
        default:
            return 'Unknown state';
    }
}

/**
 * Get current verification state
 */
function getVerificationState() {
    return { ...currentState };
}

/**
 * Start continuous verification (call from electron main)
 */
function startVerificationLoop(callback, intervalMs = 3000) {
    console.log('[Verification] Starting verification loop');
    
    const interval = setInterval(async () => {
        const state = await verifyActivePlay();
        if (callback) callback(state);
    }, intervalMs);

    return () => {
        clearInterval(interval);
        console.log('[Verification] Verification loop stopped');
    };
}

module.exports = {
    VerificationState,
    verifyActivePlay,
    setVerifiedUser,
    clearUser,
    canAccruePoints,
    getStatusExplanation,
    getVerificationState,
    startVerificationLoop
};

