/**
 * TEST TWILIO SMS - Send test message immediately
 */

import twilio from 'twilio';

const accountSid = 'AC542b2c8baaac2ca6a0e2b02883e948b0';
const authToken = '97de4e763900b903b789a12d0177c7e3';
const twilioPhone = '+16282825323';
const yourPhone = '+14693718556';

const client = twilio(accountSid, authToken);

async function sendTestSMS() {
    console.log('📱 Sending test SMS to your phone...\n');

    try {
        const message = await client.messages.create({
            body: '🚀 GG LOOP Alert System Active!\n\nYour Twilio SMS is working. You\'ll now get daily Riot API key reminders 22 hours after each update.\n\n- Jayson BQ',
            from: twilioPhone,
            to: yourPhone
        });

        console.log('✅ TEST SMS SENT!\n');
        console.log(`Message SID: ${message.sid}`);
        console.log(`Status: ${message.status}`);
        console.log('\n📱 Check your phone for the test message!');
        console.log('\nNext: Add Twilio vars to .env and Railway, then deploy.');
    } catch (error: any) {
        console.log('❌ SMS Failed:', error.message);

        if (error.code === 21608) {
            console.log('\n⚠️  Your number needs to be verified first.');
            console.log('Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.log('Add: +14693718556');
            console.log('Then run this test again.');
        }
    }
}

sendTestSMS();
