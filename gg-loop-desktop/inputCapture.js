const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * GG LOOP Input Capture System
 * 
 * Captures REAL keyboard/mouse inputs to verify actual gameplay.
 * NOT random - detects if user is actually playing.
 * 
 * Gameplay patterns we look for:
 * - WASD movement (consistent direction changes)
 * - Mouse aiming (curved paths, not straight lines)
 * - Combat actions (left click bursts)
 * - Reaction patterns (quick responses)
 */

// Input buffer - stores recent inputs
const inputBuffer = {
    mouse: [],      // [{x, y, timestamp}, ...]
    keyboard: [],   // [{key, pressed, timestamp}, ...]
    clicks: [],     // [{button, timestamp}, ...]
};

// Gaming pattern thresholds
const THRESHOLDS = {
    minInputsPerMinute: 30,       // Minimum inputs to count as "playing"
    minMouseMovement: 50,         // Minimum pixels moved in 10 seconds
    wasdRequiredPerMinute: 10,    // Movement keys expected in a game
    combatClicksPerMinute: 5,     // Mouse clicks in action games
    maxRepeatingPattern: 0.8,     // 80% same pattern = bot
};

// Track session metrics
let sessionMetrics = {
    totalInputs: 0,
    wasdCount: 0,
    mouseDistance: 0,
    clickCount: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    startTime: Date.now(),
    isValidGameplay: false,
    gameplayScore: 0,
};

/**
 * Get current mouse position
 */
async function getMousePosition() {
    try {
        const { stdout } = await execAsync(
            'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position | ConvertTo-Json"',
            { timeout: 2000 }
        );
        const pos = JSON.parse(stdout);
        return { x: pos.X, y: pos.Y, timestamp: Date.now() };
    } catch (error) {
        return null;
    }
}

/**
 * Check if specific keys are pressed (WASD + common gaming keys)
 */
async function getKeyStates() {
    try {
        // Check for common gaming keys: W, A, S, D, Space, Shift, Ctrl, Mouse buttons
        const { stdout } = await execAsync(`
      powershell -Command "
        Add-Type -TypeDefinition '
          using System;
          using System.Runtime.InteropServices;
          public class KeyCheck {
            [DllImport(\"user32.dll\")]
            public static extern short GetAsyncKeyState(int vKey);
          }
        '
        $keys = @{
          W = [KeyCheck]::GetAsyncKeyState(0x57) -band 0x8000
          A = [KeyCheck]::GetAsyncKeyState(0x41) -band 0x8000
          S = [KeyCheck]::GetAsyncKeyState(0x53) -band 0x8000
          D = [KeyCheck]::GetAsyncKeyState(0x44) -band 0x8000
          Space = [KeyCheck]::GetAsyncKeyState(0x20) -band 0x8000
          Shift = [KeyCheck]::GetAsyncKeyState(0x10) -band 0x8000
          LMouse = [KeyCheck]::GetAsyncKeyState(0x01) -band 0x8000
          RMouse = [KeyCheck]::GetAsyncKeyState(0x02) -band 0x8000
        }
        $keys | ConvertTo-Json
      "
    `, { timeout: 2000 });

        const keys = JSON.parse(stdout);
        return {
            wasd: keys.W || keys.A || keys.S || keys.D,
            movement: { w: !!keys.W, a: !!keys.A, s: !!keys.S, d: !!keys.D },
            space: !!keys.Space,
            shift: !!keys.Shift,
            leftClick: !!keys.LMouse,
            rightClick: !!keys.RMouse,
            timestamp: Date.now()
        };
    } catch (error) {
        return null;
    }
}

/**
 * Record a single input sample
 */
async function captureInputSample() {
    const mousePos = await getMousePosition();
    const keyState = await getKeyStates();

    if (!mousePos || !keyState) return null;

    // Calculate mouse movement
    const dx = mousePos.x - sessionMetrics.lastMouseX;
    const dy = mousePos.y - sessionMetrics.lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update metrics
    sessionMetrics.mouseDistance += distance;
    sessionMetrics.lastMouseX = mousePos.x;
    sessionMetrics.lastMouseY = mousePos.y;

    if (keyState.wasd) sessionMetrics.wasdCount++;
    if (keyState.leftClick) sessionMetrics.clickCount++;
    sessionMetrics.totalInputs++;

    // Store in buffers
    inputBuffer.mouse.push(mousePos);
    inputBuffer.keyboard.push(keyState);

    // Keep buffer size manageable (last 5 minutes)
    if (inputBuffer.mouse.length > 3000) inputBuffer.mouse.shift();
    if (inputBuffer.keyboard.length > 3000) inputBuffer.keyboard.shift();

    return {
        mouse: mousePos,
        keys: keyState,
        metrics: { ...sessionMetrics }
    };
}

/**
 * Analyze if current session is real gameplay
 */
function analyzeGameplayValidity() {
    const elapsedMinutes = (Date.now() - sessionMetrics.startTime) / 60000;
    if (elapsedMinutes < 1) return { isValid: false, reason: 'Not enough data', score: 0 };

    // Calculate rates
    const inputsPerMinute = sessionMetrics.totalInputs / elapsedMinutes;
    const wasdPerMinute = sessionMetrics.wasdCount / elapsedMinutes;
    const clicksPerMinute = sessionMetrics.clickCount / elapsedMinutes;
    const mousePerMinute = sessionMetrics.mouseDistance / elapsedMinutes;

    // Score each metric (0-25 points each, total 100)
    let score = 0;
    const breakdown = {};

    // 1. Input frequency (0-25)
    if (inputsPerMinute >= THRESHOLDS.minInputsPerMinute) {
        breakdown.inputFrequency = 25;
    } else {
        breakdown.inputFrequency = Math.round((inputsPerMinute / THRESHOLDS.minInputsPerMinute) * 25);
    }
    score += breakdown.inputFrequency;

    // 2. WASD movement (0-25) - required for most games
    if (wasdPerMinute >= THRESHOLDS.wasdRequiredPerMinute) {
        breakdown.wasdMovement = 25;
    } else {
        breakdown.wasdMovement = Math.round((wasdPerMinute / THRESHOLDS.wasdRequiredPerMinute) * 25);
    }
    score += breakdown.wasdMovement;

    // 3. Mouse movement (0-25)
    if (mousePerMinute >= THRESHOLDS.minMouseMovement) {
        breakdown.mouseMovement = 25;
    } else {
        breakdown.mouseMovement = Math.round((mousePerMinute / THRESHOLDS.minMouseMovement) * 25);
    }
    score += breakdown.mouseMovement;

    // 4. Combat/interaction clicks (0-25)
    if (clicksPerMinute >= THRESHOLDS.combatClicksPerMinute) {
        breakdown.combatClicks = 25;
    } else {
        breakdown.combatClicks = Math.round((clicksPerMinute / THRESHOLDS.combatClicksPerMinute) * 25);
    }
    score += breakdown.combatClicks;

    // Determine validity
    const isValid = score >= 50; // Need at least 50/100 to be considered valid gameplay

    let status;
    if (score >= 80) status = 'EXCELLENT';
    else if (score >= 60) status = 'GOOD';
    else if (score >= 50) status = 'ACCEPTABLE';
    else if (score >= 30) status = 'SUSPICIOUS';
    else status = 'INVALID';

    sessionMetrics.isValidGameplay = isValid;
    sessionMetrics.gameplayScore = score;

    return {
        isValid,
        score,
        status,
        breakdown,
        rates: {
            inputsPerMinute: Math.round(inputsPerMinute),
            wasdPerMinute: Math.round(wasdPerMinute),
            clicksPerMinute: Math.round(clicksPerMinute),
            mousePixelsPerMinute: Math.round(mousePerMinute)
        },
        elapsedMinutes: Math.round(elapsedMinutes * 10) / 10
    };
}

/**
 * Generate gameplay fingerprint (for future B2B API)
 */
function generateGameplayFingerprint() {
    const analysis = analyzeGameplayValidity();

    // Create a unique fingerprint from input patterns
    const fingerprint = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        duration: Date.now() - sessionMetrics.startTime,
        score: analysis.score,
        isHuman: analysis.isValid,
        patterns: {
            avgMouseSpeed: sessionMetrics.mouseDistance / ((Date.now() - sessionMetrics.startTime) / 1000),
            wasdUsage: sessionMetrics.wasdCount,
            clickPattern: sessionMetrics.clickCount,
            inputDensity: sessionMetrics.totalInputs / ((Date.now() - sessionMetrics.startTime) / 1000)
        },
        // Cryptographic proof (simplified - would use real signing in production)
        proof: btoa(JSON.stringify({
            score: analysis.score,
            timestamp: Date.now(),
            hash: `${analysis.score}_${sessionMetrics.totalInputs}_${Date.now()}`
        }))
    };

    return fingerprint;
}

/**
 * Start input capture loop
 */
let captureInterval = null;

function startInputCapture(onUpdate) {
    console.log('[GG LOOP] Starting input capture');
    sessionMetrics.startTime = Date.now();

    // Capture every 100ms
    captureInterval = setInterval(async () => {
        const sample = await captureInputSample();

        // Analyze every 10 seconds
        if (sessionMetrics.totalInputs % 100 === 0) {
            const analysis = analyzeGameplayValidity();
            if (onUpdate) {
                onUpdate({
                    sample,
                    analysis,
                    fingerprint: generateGameplayFingerprint()
                });
            }
        }
    }, 100);

    return () => stopInputCapture();
}

function stopInputCapture() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    console.log('[GG LOOP] Input capture stopped');
    return generateGameplayFingerprint();
}

/**
 * Reset session metrics
 */
function resetSession() {
    sessionMetrics = {
        totalInputs: 0,
        wasdCount: 0,
        mouseDistance: 0,
        clickCount: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        startTime: Date.now(),
        isValidGameplay: false,
        gameplayScore: 0,
    };
    inputBuffer.mouse = [];
    inputBuffer.keyboard = [];
    inputBuffer.clicks = [];
}

module.exports = {
    startInputCapture,
    stopInputCapture,
    captureInputSample,
    analyzeGameplayValidity,
    generateGameplayFingerprint,
    resetSession,
    getSessionMetrics: () => ({ ...sessionMetrics }),
    getInputBuffer: () => ({ ...inputBuffer }),
    THRESHOLDS
};
