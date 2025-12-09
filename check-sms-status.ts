/**
 * CHECK TWILIO MESSAGE STATUS - Find out why SMS isn't delivering
 */

import twilio from 'twilio';

const accountSid = 'AC542b2c8baaac2ca6a0e2b02883e948b0';
const authToken = '97de4e763900b903b789a12d0177c7e3';

const client = twilio(accountSid, authToken);

async function checkMessageStatus() {
    console.log('🔍 Checking last 5 SMS message statuses...\n');

    try {
        const messages = await client.messages.list({ limit: 5 });

        messages.forEach((message) => {
            console.log('─────────────────────────────────────');
            console.log(`Message SID: ${message.sid}`);
            console.log(`To: ${message.to}`);
            console.log(`From: ${message.from}`);
            console.log(`Status: ${message.status}`);
            console.log(`Direction: ${message.direction}`);
            console.log(`Date: ${message.dateCreated}`);

            if (message.errorCode) {
                console.log(`❌ ERROR CODE: ${message.errorCode}`);
                console.log(`❌ ERROR MESSAGE: ${message.errorMessage}`);
            }

            console.log(`Body: ${message.body.substring(0, 100)}...`);
            console.log('');
        });

        console.log('─────────────────────────────────────\n');
        console.log('🔍 DIAGNOSIS:');

        const failedMessages = messages.filter(m =>
            m.status === 'failed' || m.status === 'undelivered'
        );

        const queuedMessages = messages.filter(m => m.status === 'queued');

        if (failedMessages.length > 0) {
            console.log('❌ Messages are FAILING');
            console.log('Most likely cause: A2P Campaign not approved yet (takes 2-3 weeks)');
            console.log('Solution: Wait for campaign approval OR use different approach');
        } else if (queuedMessages.length > 0) {
            console.log('⏳ Messages are QUEUED (stuck)');
            console.log('Most likely cause: A2P Campaign pending approval');
            console.log('Messages won\'t send until campaign is approved');
        } else {
            console.log('Checking individual message details...');
        }

    } catch (error: any) {
        console.log('❌ Error checking messages:', error.message);
    }
}

checkMessageStatus();
