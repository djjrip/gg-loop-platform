#!/usr/bin/env node

/**
 * LAUNCH LOGGER
 * Records exact launch timing and initial metrics
 */

import fs from 'fs';
import path from 'path';

const LAUNCH_LOG = './data/launch-log.json';

function recordLaunchEvent(event, data = {}) {
    const log = fs.existsSync(LAUNCH_LOG)
        ? JSON.parse(fs.readFileSync(LAUNCH_LOG, 'utf-8'))
        : { events: [] };

    log.events.push({
        timestamp: new Date().toISOString(),
        event,
        ...data
    });

    fs.writeFileSync(LAUNCH_LOG, JSON.stringify(log, null, 2));
    console.log(`✅ Logged: ${event}`);
}

// Export for use
export default recordLaunchEvent;

// If run directly
if (process.argv[2]) {
    const event = process.argv[2];
    const data = process.argv[3] ? JSON.parse(process.argv[3]) : {};
    recordLaunchEvent(event, data);
}
