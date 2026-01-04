/**
 * EMPIRE CONTROL CENTER - MONITORING & METRICS
 * 
 * Business-critical metrics for GG Loop Platform
 * Prometheus-compatible metrics export
 */

import { Counter, Gauge, Histogram, Registry } from 'prom-client';

// Create metrics registry
export const register = new Registry();

// ═══════════════════════════════════════════════════════════════
// USER METRICS
// ═══════════════════════════════════════════════════════════════

export const activeUsersGauge = new Gauge({
    name: 'ggloop_active_users_total',
    help: 'Total number of currently active users',
    registers: [register],
});

export const userRegistrationsCounter = new Counter({
    name: 'ggloop_user_registrations_total',
    help: 'Total number of user registrations',
    labelNames: ['oauth_provider'],
    registers: [register],
});

export const userLoginCounter = new Counter({
    name: 'ggloop_user_logins_total',
    help: 'Total number of user logins',
    labelNames: ['oauth_provider', 'status'],
    registers: [register],
});

// ═══════════════════════════════════════════════════════════════
// REVENUE METRICS
// ═══════════════════════════════════════════════════════════════

export const revenueCounter = new Counter({
    name: 'ggloop_revenue_usd_total',
    help: 'Total revenue in USD',
    labelNames: ['source'], // 'stripe_subscription', 'referral', 'other'
    registers: [register],
});

export const subscriptionsGauge = new Gauge({
    name: 'ggloop_active_subscriptions',
    help: 'Number of active Stripe subscriptions',
    registers: [register],
});

export const referralConversionCounter = new Counter({
    name: 'ggloop_referral_conversions_total',
    help: 'Total number of successful referral conversions',
    registers: [register],
});

// ═══════════════════════════════════════════════════════════════
// API METRICS
// ═══════════════════════════════════════════════════════════════

export const riotApiRequestCounter = new Counter({
    name: 'ggloop_riot_api_requests_total',
    help: 'Total Riot API requests',
    labelNames: ['endpoint', 'status'],
    registers: [register],
});

export const riotApiLatencyHistogram = new Histogram({
    name: 'ggloop_riot_api_latency_seconds',
    help: 'Riot API request latency in seconds',
    labelNames: ['endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const apiErrorCounter = new Counter({
    name: 'ggloop_api_errors_total',
    help: 'Total API errors',
    labelNames: ['endpoint', 'error_type'],
    registers: [register],
});

// ═══════════════════════════════════════════════════════════════
// DATABASE METRICS
// ═══════════════════════════════════════════════════════════════

export const dbQueryCounter = new Counter({
    name: 'ggloop_db_queries_total',
    help: 'Total database queries',
    labelNames: ['operation', 'table'],
    registers: [register],
});

export const dbQueryDurationHistogram = new Histogram({
    name: 'ggloop_db_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1],
    registers: [register],
});

// ═══════════════════════════════════════════════════════════════
// SYSTEM HEALTH METRICS
// ═══════════════════════════════════════════════════════════════

export const healthStatusGauge = new Gauge({
    name: 'ggloop_health_status',
    help: 'Health status of the application (1 = healthy, 0 = unhealthy)',
    labelNames: ['component'], // 'database', 'redis', 'riot_api', 'overall'
    registers: [register],
});

export const uptimeGauge = new Gauge({
    name: 'ggloop_uptime_seconds',
    help: 'Application uptime in seconds',
    registers: [register],
});

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const startTime = Date.now();

/**
 * Update uptime metric
 */
export function updateUptime() {
    const uptime = (Date.now() - startTime) / 1000;
    uptimeGauge.set(uptime);
}

/**
 * Record user login
 */
export function recordLogin(provider: string, success: boolean) {
    userLoginCounter.inc({ oauth_provider: provider, status: success ? 'success' : 'failure' });
}

/**
 * Record user registration
 */
export function recordRegistration(provider: string) {
    userRegistrationsCounter.inc({ oauth_provider: provider });
}

/**
 * Record revenue
 */
export function recordRevenue(source: string, amountUSD: number) {
    revenueCounter.inc({ source }, amountUSD);
}

/**
 * Record Riot API call
 */
export function recordRiotApiCall(endpoint: string, status: number, durationMs: number) {
    riotApiRequestCounter.inc({ endpoint, status: status.toString() });
    riotApiLatencyHistogram.observe({ endpoint }, durationMs / 1000);
}

/**
 * Set health status for a component
 */
export function setHealthStatus(component: string, healthy: boolean) {
    healthStatusGauge.set({ component }, healthy ? 1 : 0);
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
    updateUptime();
    return register.metrics();
}

// Update uptime every 10 seconds
setInterval(updateUptime, 10000);
