/**
 * AUTOMATED SMS REMINDER SYSTEM
 * Texts you when Riot API key is about to expire
 * Uses Twilio (free trial gives you $15 credit)
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const yourPhone = process.env.YOUR_PHONE_NUMBER; // Your actual number

const client = twilio(accountSid, authToken);

// Send reminder SMS
export async function sendApiKeyReminder() {
    try {
        const message = await client.messages.create({
            body: `🔑 GG LOOP REMINDER: Your Riot API key expires in 2 hours!

Go to: ggloop.io/admin/update-riot-key

1. Get new key: developer.riotgames.com/apis
2. Paste into admin page
3. Done!

- Your AI Assistant`,
            from: twilioPhone,
            to: yourPhone,
        });

        console.log('✅ SMS Reminder sent:', message.sid);
        return true;
    } catch (error) {
        console.error('❌ SMS send failed:', error);
        return false;
    }
}

// Schedule reminder (runs every 22 hours - 2 hours before expiration)
export function scheduleApiKeyReminders() {
    // Send reminder every 22 hours (24hr expiry - 2hr buffer)
    setInterval(async () => {
        await sendApiKeyReminder();
    }, 22 * 60 * 60 * 1000); // 22 hours in milliseconds

    console.log('📱 SMS Reminder system active');
    console.log(`Will text ${yourPhone} every 22 hours`);
}

// Also send a test reminder when you first deploy
export async function sendTestReminder() {
    try {
        const message = await client.messages.create({
            body: `✅ GG LOOP SMS Reminders activated!

You'll get a text every 22 hours reminding you to update the Riot API key.

Admin page: ggloop.io/admin/update-riot-key

- Your AI Assistant`,
            from: twilioPhone,
            to: yourPhone,
        });

        console.log('✅ Test SMS sent:', message.sid);
    } catch (error) {
        console.error('❌ Test SMS failed:', error);
    }
}

/*
 * SETUP (5 MINUTES):
 * 
 * 1. Sign up for Twilio (free trial):
 *    https://www.twilio.com/try-twilio
 *    - Get $15 credit (can send ~1000 texts)
 * 
 * 2. Get your credentials:
 *    - Account SID (on dashboard)
 *    - Auth Token (on dashboard)
 *    - Phone Number (get free trial number)
 * 
 * 3. Add to .env:
 *    TWILIO_ACCOUNT_SID=your_account_sid
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_PHONE_NUMBER=+1234567890  (Twilio number)
 *    YOUR_PHONE_NUMBER=+1234567890     (Your actual number)
 * 
 * 4. In server/index.ts, add:
 *    import { scheduleApiKeyReminders, sendTestReminder } from './smsReminders';
 *    scheduleApiKeyReminders();
 *    sendTestReminder(); // Confirms it works
 * 
 * RESULT:
 * - You get a text every 22 hours
 * - 2-hour buffer before key expires
 * - Direct link to admin page
 * - Never miss an API key update
 */
