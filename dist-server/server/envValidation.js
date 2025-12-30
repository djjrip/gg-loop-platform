export function validateRequiredEnv() {
    const checks = [];
    const required = [
        { key: 'SESSION_SECRET', severity: 'warn', msg: 'SESSION_SECRET not set; using generated fallback.' },
        { key: 'RIOT_API_KEY', severity: 'error', msg: 'RIOT_API_KEY missing; Riot linking will fail.' },
        { key: 'RIOT_CLIENT_ID', severity: 'error', msg: 'RIOT_CLIENT_ID missing; OAuth wont work.' },
        { key: 'RIOT_CLIENT_SECRET', severity: 'error', msg: 'RIOT_CLIENT_SECRET missing; OAuth wont work.' },
        { key: 'RIOT_REDIRECT_URI', severity: 'error', msg: 'RIOT_REDIRECT_URI missing; OAuth wont work.' },
    ];
    for (const r of required) {
        const present = !!process.env[r.key];
        checks.push({
            key: r.key,
            present,
            status: present ? 'ok' : (r.severity === 'error' ? 'error' : 'warn'),
            message: present ? undefined : r.msg,
        });
    }
    // Alerts (optional but recommended)
    const alertsEmailTo = (process.env.ALERT_EMAIL_TO || '').trim();
    checks.push({
        key: 'RESEND_API_KEY',
        present: !!process.env.RESEND_API_KEY,
        status: (!!process.env.RESEND_API_KEY && !!alertsEmailTo) ? 'ok' : 'warn',
        message: 'Email alerts not fully configured (RESEND_API_KEY or ALERT_EMAIL_TO missing).',
    });
    const smsOk = !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_FROM_NUMBER && !!(process.env.ALERT_SMS_TO || '').trim();
    checks.push({
        key: 'TWILIO_*',
        present: smsOk,
        status: smsOk ? 'ok' : 'warn',
        message: 'SMS alerts not fully configured (Twilio or ALERT_SMS_TO missing).',
    });
    return checks;
}
export function logEnvChecks(checks) {
    for (const c of checks) {
        const state = c.present ? '✅' : (c.status === 'error' ? '❌' : '⚠️');
        console.log(`${state} ${c.key}: ${c.present ? 'present' : 'missing'}${c.message ? ' - ' + c.message : ''}`);
    }
}
