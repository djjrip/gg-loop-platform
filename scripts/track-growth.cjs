#!/usr/bin/env node
/**
 * GROWTH TRACKING SYSTEM
 * Monitors key growth metrics and logs progress
 * Run: node scripts/track-growth.cjs
 */

require('dotenv/config');
const https = require('https');
const fs = require('fs');
const path = require('path');

const METRICS_FILE = path.join(__dirname, '..', '.metrics', 'growth.json');

// Ensure .metrics directory exists
const metricsDir = path.dirname(METRICS_FILE);
if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
}

async function trackMetrics() {
    console.log('📊 GROWTH TRACKING SYSTEM\n');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    const today = new Date().toISOString().split('T')[0];

    // Load existing metrics
    let metrics = {};
    if (fs.existsSync(METRICS_FILE)) {
        metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    }

    // Initialize today's entry
    if (!metrics[today]) {
        metrics[today] = {
            date: today,
            productionStatus: 'unknown',
            redditComments: 0,
            emailsSent: 0,
            builderTierSignups: 0,
            twitterTweets: 0,
            innovations: []
        };
    }

    // Check production
    const prodStatus = await new Promise((resolve) => {
        https.get('https://ggloop.io/vibe-coding', { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200 ? 'live' : 'down');
        }).on('error', () => resolve('error'));
    });

    metrics[today].productionStatus = prodStatus;

    console.log('🎯 TODAY\'S METRICS:\n');
    console.log(`Production: ${prodStatus === 'live' ? '✅ LIVE' : '❌ DOWN'}`);
    console.log(`Reddit Comments: ${metrics[today].redditComments}`);
    console.log(`Builder Tier Signups: ${metrics[today].builderTierSignups}`);
    console.log(`Innovations Built: ${metrics[today].innovations.length}\n`);

    // Calculate growth rate
    const dates = Object.keys(metrics).sort();
    if (dates.length > 1) {
        const yesterday = dates[dates.length - 2];
        const todayData = metrics[today];
        const yesterdayData = metrics[yesterday];

        console.log('📈 GROWTH:\n');

        const commentGrowth = todayData.redditComments - (yesterdayData.redditComments || 0);
        const signupGrowth = todayData.builderTierSignups - (yesterdayData.builderTierSignups || 0);

        console.log(`Reddit: ${commentGrowth >= 0 ? '+' : ''}${commentGrowth}`);
        console.log(`Signups: ${signupGrowth >= 0 ? '+' : ''}${signupGrowth}\n`);
    }

    // Save metrics
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));

    console.log(`✅ Metrics saved to ${METRICS_FILE}\n`);

    // List active campaigns
    console.log('🚀 ACTIVE CAMPAIGNS:\n');
    console.log('1. Vibe Coding - Reddit (r/BuildYourVibe)');
    console.log('2. Email Infrastructure (AWS SES - Ready)');
    console.log('3. Twitter Automation (Live - AI-generated)');
    console.log('4. TikTok Content (5 scripts ready)\n');

    console.log('💡 NEXT MILESTONES:\n');
    console.log('- First organic Reddit engagement');
    console.log('- First Builder Tier customer ($12 MRR)');
    console.log('- 10 active users');
    console.log('- $100 MRR\n');

    return metrics[today];
}

// Run tracking
trackMetrics().catch(err => {
    console.error('❌ Tracking failed:', err);
    process.exit(1);
});

module.exports = { trackMetrics };
