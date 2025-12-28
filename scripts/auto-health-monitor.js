/**
 * GG LOOP Health Monitor
 * Pings ggloop.io every hour and sends Discord alerts on failures
 * 
 * Usage: node scripts/auto-health-monitor.js
 * Background: node scripts/auto-health-monitor.js &
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HEALTH_URL = 'https://ggloop.io/api/health';
const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const DISCORD_WEBHOOK_URL = process.env.DISCORD_FOUNDER_WEBHOOK_URL || '';
const LOG_FILE = path.join(__dirname, '../logs/health-monitor.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log to file and console
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
}

// Send Discord notification
async function sendDiscordAlert(message, isError = false) {
    if (!DISCORD_WEBHOOK_URL) {
        log('Discord webhook not configured, skipping alert', 'WARN');
        return;
    }

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: isError ? `🚨 **GG LOOP ALERT** 🚨\n${message}` : `✅ ${message}`,
                username: 'GG LOOP Health Monitor'
            })
        });
    } catch (err) {
        log(`Failed to send Discord alert: ${err.message}`, 'ERROR');
    }
}

// Check platform health
async function checkHealth() {
    const checkTime = new Date().toISOString();
    log(`Running health check...`);

    try {
        const startTime = Date.now();
        const response = await fetch(HEALTH_URL, {
            timeout: 10000 // 10 second timeout
        });
        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            const message = `Platform returned ${response.status} ${response.statusText} (${responseTime}ms)`;
            log(message, 'ERROR');
            await sendDiscordAlert(message, true);
            return { success: false, status: response.status, responseTime };
        }

        const data = await response.json();
        const message = `Health check passed ✅ (${responseTime}ms) - Uptime: ${Math.floor(data.uptime / 60)} minutes`;
        log(message);

        // Send success alert every 24 hours (24 checks)
        const hoursSinceStart = Math.floor((Date.now() - startTimeMillis) / (60 * 60 * 1000));
        if (hoursSinceStart > 0 && hoursSinceStart % 24 === 0) {
            await sendDiscordAlert(`GG LOOP has been running smoothly for ${hoursSinceStart} hours 🎮`);
        }

        return { success: true, status: 200, responseTime, data };
    } catch (err) {
        const message = `Health check failed: ${err.message}`;
        log(message, 'ERROR');
        await sendDiscordAlert(message, true);
        return { success: false, error: err.message };
    }
}

// Generate uptime report
function generateReport() {
    const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = logContent.split('\n').filter(line => line.includes('Health check'));

    const totalChecks = lines.length;
    const failedChecks = lines.filter(line => line.includes('[ERROR]')).length;
    const successRate = totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks * 100).toFixed(2) : 0;

    const report = `
╔═══════════════════════════════════════╗
║   GG LOOP Health Monitor Report      ║
╚═══════════════════════════════════════╝

Total Checks:    ${totalChecks}
Failed Checks:   ${failedChecks}
Success Rate:    ${successRate}%
Log File:        ${LOG_FILE}

Last 10 checks:
${lines.slice(-10).join('\n')}
`;

    console.log(report);
    return report;
}

// Main monitoring loop
let checkCount = 0;
const startTimeMillis = Date.now();

async function startMonitoring() {
    log('🚀 GG LOOP Health Monitor started');
    log(`Checking ${HEALTH_URL} every ${CHECK_INTERVAL / 1000 / 60} minutes`);

    // Initial check
    await checkHealth();
    checkCount++;

    // Schedule recurring checks
    setInterval(async () => {
        await checkHealth();
        checkCount++;

        // Generate report every 12 checks (12 hours)
        if (checkCount % 12 === 0) {
            generateReport();
        }
    }, CHECK_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('📊 Generating final report before shutdown...');
    generateReport();
    log('👋 Health monitor stopped');
    process.exit(0);
});

// Start monitoring
startMonitoring();
