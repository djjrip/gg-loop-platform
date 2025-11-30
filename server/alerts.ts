import Resend from 'resend';
import twilio from 'twilio';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ALERT_EMAIL_TO = (process.env.ALERT_EMAIL_TO || '').split(',').map(e => e.trim()).filter(Boolean);
const ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM || 'alerts@ggloop.io';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';
const ALERT_SMS_TO = (process.env.ALERT_SMS_TO || '').split(',').map(e => e.trim()).filter(Boolean);

const resend = RESEND_API_KEY ? new Resend.Resend(RESEND_API_KEY) : null;
const smsClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertPayload {
  severity: AlertSeverity;
  source: string; // e.g., 'riotApi.verifyAccount'
  message: string;
  details?: any;
}

export async function sendEmailAlert(payload: AlertPayload): Promise<void> {
  if (!resend || ALERT_EMAIL_TO.length === 0) return;
  const subject = `[${payload.severity.toUpperCase()}] ${payload.source}`;
  const html = `<pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
  try {
    await Promise.all(ALERT_EMAIL_TO.map(to => resend.emails.send({ from: ALERT_EMAIL_FROM, to, subject, html })));
  } catch (err) {
    console.error('Email alert failed:', err);
  }
}

export async function sendSmsAlert(payload: AlertPayload): Promise<void> {
  if (!smsClient || !TWILIO_FROM_NUMBER || ALERT_SMS_TO.length === 0) return;
  const body = `[${payload.severity}] ${payload.source}: ${payload.message}`.slice(0, 140);
  try {
    await Promise.all(ALERT_SMS_TO.map(to => smsClient.messages.create({ from: TWILIO_FROM_NUMBER, to, body })));
  } catch (err) {
    console.error('SMS alert failed:', err);
  }
}

export async function notify(payload: AlertPayload): Promise<void> {
  await Promise.all([sendEmailAlert(payload), sendSmsAlert(payload)]);
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
}
