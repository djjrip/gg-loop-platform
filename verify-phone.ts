/**
 * VERIFY YOUR PHONE NUMBER IN TWILIO
 */

import twilio from 'twilio';

const accountSid = 'AC542b2c8baaac2ca6a0e2b02883e948b0';
const authToken = '97de4e763900b903b789a12d0177c7e3';
const yourPhone = '+14693718556';

const client = twilio(accountSid, authToken);

async function verifyPhone() {
    console.log('📱 Starting phone verification process...\n');

    try {
        // Send verification code
        const verification = await client.verify.v2
            .services('default_service')
            .verifications.create({
                to: yourPhone,
                channel: 'sms'
            });

        console.log('✅ Verification code sent!');
        console.log(`Status: ${verification.status}`);
        console.log('\nCheck your phone for the code, then tell me what it is.');

    } catch (error: any) {
        if (error.code === 20404) {
            console.log('⚠️  Need to create verification service first...\n');
            console.log('EASIER METHOD:');
            console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.log('2. Click "+ Add new verified number"');
            console.log('3. Enter: +14693718556');
            console.log('4. Receive code on your phone');
            console.log('5. Enter code');
            console.log('6. Done! Then I can send you SMS.');
        } else {
            console.log('Error:', error.message);
            console.log('\nMANUAL VERIFICATION LINK:');
            console.log('https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.log('\nAdd: +14693718556');
        }
    }
}

verifyPhone();
