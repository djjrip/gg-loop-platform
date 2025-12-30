require('dotenv/config');
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Initialize SES Client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const SENDER_EMAIL = process.env.SES_VERIFIED_EMAIL || 'jaysonquindao@ggloop.io';

const vibeCodingEmail = {
    subject: 'Get Paid to Code: Vibe Coding is Live 💻',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #e4e4e7; padding: 20px; border-radius: 8px; border: 1px solid #27272a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; font-size: 28px; margin: 0;">VIBE CODING</h1>
          <p style="color: #a1a1aa; margin-top: 5px;">PLAY. CODE. EARN.</p>
        </div>

        <h2 style="color: #fff;">System Update: <span style="color: #22c55e;">ONLINE</span></h2>
        
        <p>Hey Vibe Coder,</p>
        
        <p>The pivot is complete. We are no longer just a gaming platform. We are building the <strong>Empire of Vibe Coders</strong>.</p>
        
        <div style="background: #18181b; padding: 20px; border-radius: 6px; border-left: 4px solid #22c55e; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #22c55e;">🚀 Get Paid to Code</h3>
          <p>We've gamified the IDE. Connect your activity and start earning.</p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 10px;">✅ <strong>2x XP Multiplier</strong> for all coding sessions</li>
            <li style="margin-bottom: 10px;">✅ <strong>"Vibe Coder" Badge</strong> (Early Adopter Exclusive)</li>
            <li style="margin-bottom: 10px;">✅ <strong>Builder Tier</strong> unlocked for top contributors</li>
          </ul>
        </div>

        <p>This is your path to the Studio. We aren't just playing games anymore; we're building them.</p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="https://ggloop.io/vibe-coding" style="background-color: #22c55e; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">START EARNING XP</a>
        </div>
        
        <p style="color: #71717a; font-size: 14px;">
          "The best code is written in the zone."<br>
          - Master Chief Protocol
        </p>
        
        <hr style="border-color: #27272a; margin-top: 40px;">
        
        <p style="font-size: 12px; color: #52525b; text-align: center;">
          GG LOOP | Building the Future<br>
          <a href="https://ggloop.io" style="color: #52525b;">ggloop.io</a>
        </p>
      </div>
    `
};

async function sendTestEmail() {
    console.log('🚀 VIBE CODING EMAIL CAMPAIGN - TEST TRANSMISSION\n');
    console.log(`📡 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`📧 Sender: ${SENDER_EMAIL}`);
    console.log(`🎯 Test Recipient: ${SENDER_EMAIL}\n`);

    const input = {
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [SENDER_EMAIL] },
        Message: {
            Subject: { Data: vibeCodingEmail.subject },
            Body: { Html: { Data: vibeCodingEmail.html } }
        }
    };

    try {
        const command = new SendEmailCommand(input);
        const response = await sesClient.send(command);

        console.log('✅ AWS SES TRANSMISSION SUCCESSFUL');
        console.log(`📬 Message ID: ${response.MessageId}`);
        console.log('\n🎉 TEST COMPLETE. Email sent to verified address.');
        console.log('💡 Check your inbox to confirm delivery.\n');

        return response;
    } catch (error) {
        console.error('❌ AWS SES TRANSMISSION FAILED');
        console.error(`Error: ${error.message}`);
        console.error('\nDebug Info:');
        console.error(`- AWS_REGION: ${process.env.AWS_REGION || 'us-east-1 (default)'}`);
        console.error(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING'}`);
        console.error(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING'}`);
        console.error(`- SES_VERIFIED_EMAIL: ${process.env.SES_VERIFIED_EMAIL || 'MISSING'}`);
        throw error;
    }
}

sendTestEmail().catch(err => {
    console.error('\n💥 MISSION FAILED:', err.message);
    process.exit(1);
});
