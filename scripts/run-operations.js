#!/usr/bin/env node

/**
 * RUN-OPERATIONS.js
 * Daily command center check
 * 
 * Usage: node scripts/run-operations.js
 */

import commandCenter from './command-center.js';

console.log('\n🎯 GG LOOP COMMAND CENTER\n');

// Generate daily report
commandCenter.generateDailyReport();

console.log('📋 ACTIONS NEEDED:\n');

// Check for unresponded items
const fs = await import('fs');
const path = await import('path');

const DATA_DIR = './data/command-center';
const TWITTER_LOG = path.join(DATA_DIR, 'twitter-engagement.json');

if (fs.existsSync(TWITTER_LOG)) {
    const twitter = JSON.parse(fs.readFileSync(TWITTER_LOG, 'utf-8'));
    const unresponded = twitter.replies.filter(r => !r.responded);

    if (unresponded.length > 0) {
        console.log(`⚠️  ${unresponded.length} unresponded Twitter replies`);
        console.log('   Action: Check Twitter and respond\n');
    }

    const unseenDMs = twitter.dms.filter(dm => !dm.responded);
    if (unseenDMs.length > 0) {
        console.log(`⚠️  ${unseenDMs.length} unresponded DMs`);
        console.log('   Action: Check Twitter DMs\n');
    }
}

console.log('\n✅ Operations check complete\n');
console.log('Next check: Run this script again in 4 hours\n');
