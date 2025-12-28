/**
 * GG LOOP Tamper Detection Module
 * 
 * Detects if the app or game process is being manipulated
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Detection state
let suspiciousActivities = [];
const MAX_SUSPICIOUS_THRESHOLD = 5;

/**
 * Detect if debuggers are attached
 */
async function detectDebuggers() {
    try {
        // Check for common debugging tools on Windows
        const { stdout } = await execAsync(
            'tasklist /FI "IMAGENAME eq windbg.exe" /FI "IMAGENAME eq ida.exe" /FI "IMAGENAME eq x64dbg.exe" /FI "IMAGENAME eq ollydbg.exe"',
            { timeout: 2000 }
        );

        if (stdout.includes('.exe')) {
            return { detected: true, tool: 'debugger' };
        }
        return { detected: false };
    } catch (error) {
        return { detected: false };
    }
}

/**
 * Detect automation frameworks (AutoHotkey, AutoIt, etc.)
 */
async function detectAutomation() {
    try {
        const { stdout } = await execAsync(
            'tasklist /FI "IMAGENAME eq autohotkey.exe" /FI "IMAGENAME eq autoit3.exe"',
            { timeout: 2000 }
        );

        if (stdout.includes('.exe')) {
            return { detected: true, tool: 'automation' };
        }
        return { detected: false };
    } catch (error) {
        return { detected: false };
    }
}

/**
 * Detect impossible play patterns
 */
function detectImpossiblePatterns(sessionData) {
    const issues = [];

    // Check for sessions longer than 6 hours (likely bot)
    if (sessionData.duration > 6 * 60 * 60 * 1000) {
        issues.push('Session too long (>6hrs)');
    }

    // Check for too many sessions in one day (>10)
    const sessionsToday = sessionData.sessionsToday || 0;
    if (sessionsToday > 10) {
        issues.push('Too many sessions today (>10)');
    }

    // Check for perfect activity (no idle warnings = suspicious)
    if (sessionData.duration > 2 * 60 * 60 * 1000 && sessionData.idleWarnings === 0) {
        issues.push('No idle warnings in 2+ hour session');
    }

    return issues.length > 0 ? { detected: true, issues } : { detected: false };
}

/**
 * Run full tamper detection check
 */
async function runTamperCheck(sessionData = {}) {
    const results = {
        clean: true,
        detections: []
    };

    // Check for debuggers
    const debuggerCheck = await detectDebuggers();
    if (debuggerCheck.detected) {
        results.clean = false;
        results.detections.push({ type: 'debugger', info: debuggerCheck });
        suspiciousActivities.push('debugger_detected');
    }

    // Check for automation
    const automationCheck = await detectAutomation();
    if (automationCheck.detected) {
        results.clean = false;
        results.detections.push({ type: 'automation', info: automationCheck });
        suspiciousActivities.push('automation_detected');
    }

    // Check for impossible patterns
    const patternCheck = detectImpossiblePatterns(sessionData);
    if (patternCheck.detected) {
        results.clean = false;
        results.detections.push({ type: 'patterns', info: patternCheck });
        suspiciousActivities.push('suspicious_pattern');
    }

    // Flag if too many suspicious activities
    if (suspiciousActivities.length >= MAX_SUSPICIOUS_THRESHOLD) {
        results.flagged = true;
        results.message = 'Too many suspicious activities detected. Account may be reviewed.';
    }

    return results;
}

/**
 * Reset suspicious activity counter (call after human review approves)
 */
function resetSuspiciousActivities() {
    suspiciousActivities = [];
}

/**
 * Get current suspicious activity count
 */
function getSuspiciousActivityCount() {
    return suspiciousActivities.length;
}

module.exports = {
    runTamperCheck,
    detectDebuggers,
    detectAutomation,
    detectImpossiblePatterns,
    resetSuspiciousActivities,
    getSuspiciousActivityCount,
    MAX_SUSPICIOUS_THRESHOLD
};
