#!/usr/bin/env node

/**
 * FIRST USER CELEBRATION AUTOMATION
 * Auto-generates social proof content when milestones hit
 */

import fs from 'fs';
import path from 'path';

const MILESTONES_FILE = './data/milestones.json';

function initMilestones() {
    if (!fs.existsSync(MILESTONES_FILE)) {
        fs.writeFileSync(MILESTONES_FILE, JSON.stringify({
            firstSignup: null,
            firstDownload: null,
            firstGamePlayed: null,
            firstRedemption: null,
            first10Users: null,
            first100Users: null
        }, null, 2));
    }
}

function recordMilestone(type, data) {
    initMilestones();
    const milestones = JSON.parse(fs.readFileSync(MILESTONES_FILE, 'utf-8'));

    if (!milestones[type]) {
        milestones[type] = {
            timestamp: new Date().toISOString(),
            ...data
        };

        fs.writeFileSync(MILESTONES_FILE, JSON.stringify(milestones, null, 2));

        // Generate celebration content
        generateCelebrationTweet(type, data);

        console.log(`\n🎉 MILESTONE ACHIEVED: ${type}`);
        console.log(`   Check: celebration-tweets/${type}.txt`);
    }
}

function generateCelebrationTweet(type, data) {
    const tweets = {
        firstSignup: `First user just signed up for GG Loop! 🎮

This is it. Day 1. User #1.

Built for 6 months. Shipped solo. Now it's real.

Who's next? ggloop.io`,

        firstDownload: `First desktop app download! 🚀

Someone just installed GG Loop v1.1.0.

Now we wait to see if it actually works...

(It will. I tested it 100 times. But still nervous.)

ggloop.io`,

        firstGamePlayed: `FIRST GAME TRACKED! ⚡

A real user. Playing a real game. Earning real points.

The loop is working.

This is what I built for.

ggloop.io`,

        firstRedemption: `🎁 FIRST REDEMPTION!!!

Someone just redeemed their points for a real reward.

Proof of concept: VALIDATED.

Play → Earn → Redeem → WORKS.

This is the moment. Everything changes now.

ggloop.io`,

        first10Users: `10 users! 🎯

Not 0. Not 1. TEN people using GG Loop.

Each one matters. Each one made it real.

Thank you for being early.

Next stop: 100.

ggloop.io`,

        first100Users: `100 USERS! 🚀

Started at 0.
Now at 100.

To everyone who signed up early - you're the foundation.

This is just the beginning.

ggloop.io`
    };

    const dir = './celebration-tweets';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const tweet = tweets[type] || `Milestone achieved: ${type}`;
    fs.writeFileSync(path.join(dir, `${type}.txt`), tweet);
}

// Export for use in other scripts
export { recordMilestone, initMilestones };

// CLI usage
if (process.argv[2]) {
    const type = process.argv[2];
    const data = process.argv[3] ? JSON.parse(process.argv[3]) : {};
    recordMilestone(type, data);
}
