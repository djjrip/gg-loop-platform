#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * EMPIRE HEARTBEAT MONITOR
 * Pings all Empire services and logs their status
 * ═══════════════════════════════════════════════════════════════
 */

import fetch from 'node-fetch';

const SERVICES = [
    {
        name: 'Empire API',
        url: 'http://localhost:3000/health',
        critical: true,
    },
    {
        name: 'Empire Frontend',
        url: 'http://localhost:8080/health',
        critical: true,
    },
    {
        name: 'Empire Hub',
        url: 'http://localhost:8081/health',
        critical: false,
    },
    {
        name: 'Uptime Kuma',
        url: 'http://localhost:3001',
        critical: false,
    },
    {
        name: 'Grafana',
        url: 'http://localhost:3030/api/health',
        critical: false,
    },
    {
        name: 'Prometheus',
        url: 'http://localhost:9090/-/healthy',
        critical: false,
    },
];

const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
};

async function checkService(service) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(service.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Empire-Heartbeat-Monitor/1.0' },
        });

        clearTimeout(timeout);

        const isHealthy = response.ok;
        const status = isHealthy ? 'OK' : `ERROR (${response.status})`;
        const color = isHealthy ? COLORS.green : COLORS.red;

        return {
            name: service.name,
            status,
            healthy: isHealthy,
            critical: service.critical,
            color,
        };
    } catch (error) {
        const status = error.name === 'AbortError' ? 'TIMEOUT' : 'DOWN';
        return {
            name: service.name,
            status,
            healthy: false,
            critical: service.critical,
            color: COLORS.red,
        };
    }
}

async function runHeartbeat() {
    const timestamp = new Date().toISOString();
    console.log(`\n${COLORS.blue}[HEARTBEAT]${COLORS.reset} ${timestamp}`);
    console.log('─'.repeat(60));

    const results = await Promise.all(SERVICES.map(checkService));

    let allCriticalHealthy = true;

    results.forEach((result) => {
        const criticalLabel = result.critical ? ' [CRITICAL]' : '';
        console.log(
            `${result.color}${result.status.padEnd(15)}${COLORS.reset} ${result.name}${criticalLabel}`
        );

        if (result.critical && !result.healthy) {
            allCriticalHealthy = false;
        }
    });

    console.log('─'.repeat(60));

    if (allCriticalHealthy) {
        console.log(`${COLORS.green}✓ All critical services healthy${COLORS.reset}`);
    } else {
        console.log(`${COLORS.red}✗ Critical service(s) down!${COLORS.reset}`);
    }

    return allCriticalHealthy;
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║       EMPIRE HEARTBEAT MONITOR - Starting...             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Run immediately
    await runHeartbeat();

    // Then run every 30 seconds
    setInterval(async () => {
        await runHeartbeat();
    }, 30000);
}

main().catch((error) => {
    console.error(`${COLORS.red}[ERROR]${COLORS.reset}`, error);
    process.exit(1);
});
