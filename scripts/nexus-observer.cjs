/**
 * NEXUS Observer Guarantee
 * 
 * PURPOSE: Monitors NEXUS heartbeat and logs failure if stale (>90 minutes).
 * Per MEMORY_CORE.md Law #9: "No Invisible Systems"
 * 
 * If NEXUS stops updating heartbeat, this observer guarantees visibility.
 */

const fs = require('fs');
const path = require('path');

const HEARTBEAT_PATH = path.resolve(__dirname, '../REPORTS/CANONICAL/NEXUS_HEARTBEAT.md');
const ACTIVITY_FEED_PATH = path.resolve(__dirname, '../REPORTS/CANONICAL/NEXUS_ACTIVITY_FEED.md');
const STALE_THRESHOLD_MINUTES = 90;

/**
 * Check if NEXUS heartbeat is stale
 */
function checkHeartbeat() {
    console.log('[Observer] Checking NEXUS heartbeat...');

    if (!fs.existsSync(HEARTBEAT_PATH)) {
        console.error('[Observer] ❌ HEARTBEAT FILE MISSING');
        return { alive: false, reason: 'Heartbeat file does not exist' };
    }

    const content = fs.readFileSync(HEARTBEAT_PATH, 'utf-8');

    // Extract last pulse timestamp
    const pulseMatch = content.match(/\*\*LAST PULSE:\*\* (\d{4}-\d{2}-\d{2}T[\d:]+Z)/);

    if (!pulseMatch) {
        console.error('[Observer] ❌ Could not parse last pulse timestamp');
        return { alive: false, reason: 'Cannot parse heartbeat timestamp' };
    }

    const lastPulse = new Date(pulseMatch[1]);
    const now = new Date();
    const minutesSince = (now - lastPulse) / (1000 * 60);

    console.log(`[Observer] Last pulse: ${lastPulse.toISOString()}`);
    console.log(`[Observer] Minutes since: ${minutesSince.toFixed(1)}`);

    if (minutesSince > STALE_THRESHOLD_MINUTES) {
        console.error(`[Observer] ❌ NEXUS HEARTBEAT STALE (${minutesSince.toFixed(0)} minutes)`);
        logStaleEvent(minutesSince);
        return {
            alive: false,
            reason: `Heartbeat stale: ${minutesSince.toFixed(0)} minutes (threshold: ${STALE_THRESHOLD_MINUTES})`,
            lastPulse: lastPulse.toISOString(),
            minutesSince
        };
    }

    console.log('[Observer] ✅ NEXUS is alive');
    return {
        alive: true,
        lastPulse: lastPulse.toISOString(),
        minutesSince: minutesSince.toFixed(1)
    };
}

/**
 * Log stale event to activity feed
 */
function logStaleEvent(minutesSince) {
    if (!fs.existsSync(ACTIVITY_FEED_PATH)) {
        console.error('[Observer] Cannot log stale event - activity feed missing');
        return;
    }

    const content = fs.readFileSync(ACTIVITY_FEED_PATH, 'utf-8');

    // Find the activity log section and insert a failure entry
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const failureEntry = `| ${time} | NEXUS heartbeat stale | Observer | ❌ Failed | System unresponsive for ${minutesSince.toFixed(0)} min |`;

    // Insert after the header row
    const insertPoint = content.indexOf('|------|--------|--------|--------|--------|') +
        '|------|--------|--------|--------|--------|'.length;

    if (insertPoint > 0) {
        const newContent =
            content.slice(0, insertPoint) +
            '\n' + failureEntry +
            content.slice(insertPoint);

        fs.writeFileSync(ACTIVITY_FEED_PATH, newContent, 'utf-8');
        console.log('[Observer] Logged stale event to activity feed');
    }
}

/**
 * Get heartbeat status as JSON
 */
function getStatus() {
    return checkHeartbeat();
}

// Export for use in other modules
module.exports = {
    checkHeartbeat,
    getStatus,
    STALE_THRESHOLD_MINUTES
};

// Run if called directly
if (require.main === module) {
    const result = checkHeartbeat();
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.alive ? 0 : 1);
}
