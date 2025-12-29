#!/usr/bin/env node

/**
 * ALERT SYSTEM
 * Triggers on important events
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = './data/command-center';

// Check for events worth alerting on
function checkAlerts() {
    console.log('\n🚨 ALERT CHECK\n');

    const usersLog = path.join(DATA_DIR, 'user-activity.json');
    const leadsLog = path.join(DATA_DIR, 'leads.json');

    if (fs.existsSync(usersLog)) {
        const users = JSON.parse(fs.readFileSync(usersLog, 'utf-8'));

        // Check for first signup
        if (users.signups.length === 1) {
            console.log('🎉 FIRST SIGNUP!');
            console.log(`   Email: ${users.signups[0].email}`);
            console.log(`   Source: ${users.signups[0].source}`);
            console.log('\n   ACTION: Send welcome email NOW\n');
        }

        // Check for first download
        if (users.downloads.length === 1) {
            console.log('📥 FIRST DOWNLOAD!');
            console.log(`   User: ${users.downloads[0].userId}`);
            console.log('\n   ACTION: Follow up in 24h to see if they played\n');
        }

        // Check for first redemption
        if (users.redemptions.length === 1) {
            console.log('🎁 FIRST REDEMPTION!!!');
            console.log(`   User: ${users.redemptions[0].userId}`);
            console.log(`   Reward: ${users.redemptions[0].reward}`);
            console.log('\n   ACTION:');
            console.log('   1. Screenshot immediately');
            console.log('   2. Tweet about it');
            console.log('   3. DM user for testimonial\n');
        }
    }

    if (fs.existsSync(leadsLog)) {
        const leads = JSON.parse(fs.readFileSync(leadsLog, 'utf-8'));

        // Check for high-priority leads
        const highPriority = leads.warm.filter(l =>
            l.priority === 'high' && !l.followedUp
        );

        if (highPriority.length > 0) {
            console.log(`⚠️  ${highPriority.length} HIGH PRIORITY LEADS NEED FOLLOW-UP:`);
            highPriority.forEach(lead => {
                console.log(`   - ${lead.name} (${lead.source})`);
            });
            console.log('\n   ACTION: Follow up within 24 hours\n');
        }
    }
}

checkAlerts();
