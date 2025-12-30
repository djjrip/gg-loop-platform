import { Resend } from 'resend';
import twilio from 'twilio';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ALERT_EMAIL_TO = (process.env.ALERT_EMAIL_TO || '').split(',').map(e => e.trim()).filter(Boolean);
const ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM || 'alerts@ggloop.io';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';
const ALERT_SMS_TO = (process.env.ALERT_SMS_TO || '').split(',').map(e => e.trim()).filter(Boolean);
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const smsClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
export async function sendEmailAlert(payload) {
    if (!resend || ALERT_EMAIL_TO.length === 0)
        return;
    const subject = `[${payload.severity.toUpperCase()}] ${payload.source}`;
    const html = `<pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    try {
        await Promise.all(ALERT_EMAIL_TO.map(to => resend.emails.send({ from: ALERT_EMAIL_FROM, to, subject, html })));
    }
    catch (err) {
        console.error('Email alert failed:', err);
    }
}
export async function sendSmsAlert(payload) {
    // ⚠️ COST SAVINGS: Only send SMS for CRITICAL alerts to avoid Twilio charges
    // Emails are free/cheap - use those for info/warning
    if (payload.severity !== 'critical') {
        console.log(`[SMS] Skipped ${payload.severity} alert (not critical) - check email instead`);
        return;
    }
    if (!smsClient || !TWILIO_FROM_NUMBER || ALERT_SMS_TO.length === 0)
        return;
    const body = `🚨 CRITICAL: ${payload.source}: ${payload.message}`.slice(0, 160);
    try {
        await Promise.all(ALERT_SMS_TO.map(to => smsClient.messages.create({ from: TWILIO_FROM_NUMBER, to, body })));
        console.log(`[SMS] Critical alert sent to ${ALERT_SMS_TO.length} number(s)`);
    }
    catch (err) {
        console.error('SMS alert failed:', err);
    }
}
export async function notify(payload) {
    // Always send email (cheap/free)
    await sendEmailAlert(payload);
    // Only send SMS for critical alerts (expensive)
    if (payload.severity === 'critical') {
        await sendSmsAlert(payload);
    }
}
function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
