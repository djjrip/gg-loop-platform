/**
 * REVENUE ALERT INTEGRATION
 * Connects revenue health monitoring to founder notifications
 */

import { monitorRevenueHealth } from './revenue-health';

export interface RevenueNotification {
    type: 'revenue_spike' | 'revenue_drop' | 'low_margin' | 'high_margin' | 'milestone';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    action?: string;
    timestamp: Date;
}

/**
 * Check revenue health and generate notifications
 */
export async function checkRevenueAlerts(): Promise<RevenueNotification[]> {
    const health = await monitorRevenueHealth();
    const notifications: RevenueNotification[] = [];

    // Convert health alerts to founder notifications
    for (const alert of health.alerts) {
        let type: RevenueNotification['type'];

        switch (alert.type) {
            case 'spike':
                type = 'revenue_spike';
                break;
            case 'drop':
                type = 'revenue_drop';
                break;
            case 'anomaly':
                type = alert.metric === 'profit_margin'
                    ? (alert.value < 5 ? 'low_margin' : 'high_margin')
                    : 'milestone';
                break;
            default:
                type = 'milestone';
        }

        notifications.push({
            type,
            severity: alert.severity,
            title: `Revenue Alert: ${alert.message}`,
            message: alert.recommendation || 'Monitor situation closely',
            action: alert.recommendation,
            timestamp: alert.timestamp
        });
    }

    return notifications;
}

/**
 * Get summary for daily digest
 */
export async function getDailyRevenueSummary(): Promise<string> {
    const health = await monitorRevenueHealth();

    const status = health.revenueHealth.toUpperCase();
    const velocity = health.redemptionVelocity.toFixed(2);
    const margin = health.avgMargin.toFixed(1);

    let summary = `📊 REVENUE HEALTH: ${status}\n`;
    summary += `• Redemption velocity: ${velocity}/hour\n`;
    summary += `• Avg margin: ${margin}%\n`;

    if (health.alerts.length > 0) {
        summary += `\n⚠️ ${health.alerts.length} active alert(s):\n`;
        for (const alert of health.alerts.slice(0, 3)) {
            summary += `  ${alert.severity === 'critical' ? '🚨' : '⚠️'} ${alert.message}\n`;
        }
    } else {
        summary += `\n✅ No issues detected - all systems optimal`;
    }

    return summary;
}

/**
 * Check if founder should be notified immediately
 */
export async function shouldAlertFounder(): Promise<boolean> {
    const health = await monitorRevenueHealth();

    // Alert on critical issues or poor health
    return health.revenueHealth === 'poor' ||
        health.alerts.some(a => a.severity === 'critical');
}
