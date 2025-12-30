/**
 * PRODUCTION MONITORING SYSTEM
 * 24/7 alerts for critical failures
 */
/**
 * Send alert email to founder
 */
async function sendAlert(alert) {
    const emailPayload = {
        personalizations: [{
                to: [{ email: 'jaysonquindao1@gmail.com' }],
                subject: `🚨 ${alert.severity.toUpperCase()}: ${alert.category.toUpperCase()} Alert - GG LOOP`,
            }],
        from: { email: 'alerts@ggloop.io', name: 'GG LOOP Monitoring' },
        content: [{
                type: 'text/html',
                value: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
          <h1 style="color: ${alert.severity === 'critical' ? '#ff0000' : '#d4895c'};">
            ${alert.severity === 'critical' ? '🚨' : '⚠️'} ${alert.severity.toUpperCase()} ALERT
          </h1>
          
          <div style="background: #1a1a1a; border-left: 4px solid ${alert.severity === 'critical' ? '#ff0000' : '#d4895c'}; padding: 15px; margin: 20px 0;">
            <strong>Category:</strong> ${alert.category.toUpperCase()}<br>
            <strong>Message:</strong> ${alert.message}
          </div>
          
          ${alert.details ? `
            <div style="background: #0d0d0d; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <strong>Details:</strong><br>
              <pre style="color: #d4895c; overflow-x: auto;">${JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
            <strong>Action Required:</strong><br>
            ${getSuggestedAction(alert)}
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Timestamp: ${new Date().toISOString()}<br>
            Environment: ${process.env.NODE_ENV || 'unknown'}
          </p>
        </div>
      `
            }]
    };
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });
        if (!response.ok) {
            console.error('Failed to send alert email:', response.status);
        }
    }
    catch (error) {
        console.error('Error sending alert:', error);
    }
}
function getSuggestedAction(alert) {
    switch (alert.category) {
        case 'revenue':
            return '1. Check PayPal dashboard<br>2. Test subscription flow<br>3. Verify webhook endpoints';
        case 'security':
            return '1. Review security logs<br>2. Check for unauthorized access<br>3. Rotate compromised credentials';
        case 'performance':
            return '1. Check server resources<br>2. Review slow query logs<br>3. Consider scaling if needed';
        case 'error':
            return '1. Check Railway logs<br>2. Review error stack traces<br>3. Deploy fix if identified';
        default:
            return '1. Investigate immediately<br>2. Check all logs<br>3. Take corrective action';
    }
}
/**
 * Monitor critical endpoints
 */
export async function monitorEndpoints() {
    const endpoints = [
        { url: '/api/user', timeout: 5000 },
        { url: '/api/subscription/status', timeout: 5000 },
        { url: '/health', timeout: 3000 },
    ];
    for (const endpoint of endpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            const response = await fetch(`${process.env.BASE_URL}${endpoint.url}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                await sendAlert({
                    severity: 'high',
                    category: 'error',
                    message: `Endpoint ${endpoint.url} returned ${response.status}`,
                    details: { endpoint: endpoint.url, status: response.status }
                });
            }
        }
        catch (error) {
            if (error.name === 'AbortError') {
                await sendAlert({
                    severity: 'high',
                    category: 'performance',
                    message: `Endpoint ${endpoint.url} timed out`,
                    details: { endpoint: endpoint.url, timeout: endpoint.timeout }
                });
            }
            else {
                await sendAlert({
                    severity: 'critical',
                    category: 'error',
                    message: `Endpoint ${endpoint.url} failed`,
                    details: { endpoint: endpoint.url, error: error.message }
                });
            }
        }
    }
}
/**
 * Monitor revenue events
 */
export async function trackRevenueEvent(event) {
    console.log(`💰 Revenue Event: ${event.type}`, event);
    // Alert on payment failures
    if (event.type === 'payment_failed') {
        await sendAlert({
            severity: 'critical',
            category: 'revenue',
            message: `Payment failed for user ${event.userId}`,
            details: event.details
        });
    }
    // Alert on new subscriptions (good news!)
    if (event.type === 'subscription_created') {
        await sendAlert({
            severity: 'low',
            category: 'revenue',
            message: `🎉 New ${event.details?.tier} subscription! +$${event.amount}/month`,
            details: { userId: event.userId, tier: event.details?.tier }
        });
    }
}
/**
 * Monitor error rate
 */
let errorCount = 0;
let errorWindow = Date.now();
export function trackError(error, context) {
    console.error('Error tracked:', error.message, context);
    errorCount++;
    // Reset window every 5 minutes
    if (Date.now() - errorWindow > 5 * 60 * 1000) {
        errorCount = 0;
        errorWindow = Date.now();
    }
    // Alert if error rate exceeds threshold
    if (errorCount > 10) {
        sendAlert({
            severity: 'high',
            category: 'error',
            message: `High error rate detected: ${errorCount} errors in 5 minutes`,
            details: { errorCount, latestError: error.message, context }
        });
        errorCount = 0; // Reset to avoid spam
    }
    // Always alert on critical errors
    if (error.message.includes('database') || error.message.includes('PayPal') || error.message.includes('subscription')) {
        sendAlert({
            severity: 'critical',
            category: error.message.includes('PayPal') || error.message.includes('subscription') ? 'revenue' : 'error',
            message: error.message,
            details: { stack: error.stack, context }
        });
    }
}
/**
 * Start monitoring service
 */
export function startMonitoring() {
    console.log('🔍 Starting production monitoring...');
    // Health check every 5 minutes
    setInterval(monitorEndpoints, 5 * 60 * 1000);
    // Initial health check
    monitorEndpoints();
    console.log('✅ Monitoring active - alerts will be sent to jaysonquindao1@gmail.com');
}
// Export for use in routes
export { sendAlert };
