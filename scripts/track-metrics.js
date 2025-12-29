#!/usr/bin/env node

/**
 * GROWTH METRICS TRACKER
 * Real-time dashboard of key metrics
 */

import fs from 'fs';

const METRICS_FILE = './data/growth-metrics.json';

function initMetrics() {
    if (!fs.existsSync(METRICS_FILE)) {
        fs.writeFileSync(METRICS_FILE, JSON.stringify({
            signups: { total: 0, today: 0, yesterday: 0 },
            downloads: { total: 0, today: 0, yesterday: 0 },
            activeUsers: { total: 0, today: 0, yesterday: 0 },
            redemptions: { total: 0, today: 0, yesterday: 0 },
            tweetImpressions: 0,
            tweetEngagement: 0,
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
        }, null, 2));
    }
}

function updateMetric(type, increment = 1) {
    initMetrics();
    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));

    if (metrics[type]) {
        metrics[type].total += increment;
        metrics[type].today += increment;
    }

    metrics.lastUpdated = new Date().toISOString();

    // Calculate conversion rate
    if (metrics.signups.total > 0) {
        metrics.conversionRate = (metrics.activeUsers.total / metrics.signups.total * 100).toFixed(2);
    }

    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));

    console.log(`✅ Updated ${type}: ${metrics[type].total} total`);
    return metrics;
}

function getDailyReport() {
    initMetrics();
    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));

    console.log('\n📊 DAILY METRICS REPORT\n');
    console.log(`Signups:       ${metrics.signups.today} today  (${metrics.signups.total} total)`);
    console.log(`Downloads:     ${metrics.downloads.today} today  (${metrics.downloads.total} total)`);
    console.log(`Active Users:  ${metrics.activeUsers.today} today  (${metrics.activeUsers.total} total)`);
    console.log(`Redemptions:   ${metrics.redemptions.today} today  (${metrics.redemptions.total} total)`);
    console.log(`Conversion:    ${metrics.conversionRate}%`);
    console.log(`\nLast updated: ${metrics.lastUpdated}\n`);

    return metrics;
}

function resetDaily() {
    initMetrics();
    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));

    metrics.signups.yesterday = metrics.signups.today;
    metrics.downloads.yesterday = metrics.downloads.today;
    metrics.activeUsers.yesterday = metrics.activeUsers.today;
    metrics.redemptions.yesterday = metrics.redemptions.today;

    metrics.signups.today = 0;
    metrics.downloads.today = 0;
    metrics.activeUsers.today = 0;
    metrics.redemptions.today = 0;

    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
    console.log('✅ Daily metrics reset');
}

export { updateMetric, getDailyReport, resetDaily };

// CLI
if (process.argv[2] === 'report') {
    getDailyReport();
} else if (process.argv[2] === 'reset') {
    resetDaily();
} else if (process.argv[2]) {
    const type = process.argv[2];
    const increment = parseInt(process.argv[3]) || 1;
    updateMetric(type, increment);
}
