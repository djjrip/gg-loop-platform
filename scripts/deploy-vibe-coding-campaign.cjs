/**
 * VIBE CODING EMAIL CAMPAIGN - FULL DEPLOYMENT
 * 
 * Sends "Get Paid to Code" campaign to all active users
 * Now that production /vibe-coding link is verified working (200 OK)
 */

require('dotenv/config');
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const VERIFIED_EMAIL = process.env.SES_VERIFIED_EMAIL || 'jaysonquindao@ggloop.io';

// Email content (matching test email)
const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e4e4e7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        .badge { display: inline-block; background: #27272a; color: #22c55e; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; border: 1px solid #22c55e; }
        .content { background: #18181b; padding: 30px; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 20px; }
        .feature { margin-bottom: 20px; }
        .feature h3 { color: #22c55e; margin: 0 0 8px 0; font-size: 18px; }
        .feature p { color: #a1a1aa; margin: 0; line-height: 1.6; }
        .cta { display: inline-block; background: #22c55e; color: #000; padding: 16px 32px; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 40px; color: #71717a; font-size: 14px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">🚀 LIVE NOW</div>
            <h1>THE EMPIRE JUST WENT LIVE</h1>
            <p style="color: #a1a1aa; font-size: 18px; margin-top: 10px;">Get Paid to Code. Literally.</p>
        </div>
        
        <div class="content">
            <div class="feature">
                <h3>🎮 Gamified IDE Tracking</h3>
                <p>We auto-track your coding sessions in VS Code, Cursor, WebStorm, and more. No manual logging. Just code like you always do.</p>
            </div>
            
            <div class="feature">
                <h3>⚡ 2x XP Multiplier</h3>
                <p>Turn your flow state into points. Every minute you code earns XP toward real rewards.</p>
            </div>
            
            <div class="feature">
                <h3>🏆 Vibe Coder Badge</h3>
                <p>Early Adopter Exclusive. Show you were here from day one when we build the Studio.</p>
            </div>
            
            <div class="feature">
                <h3>💎 Builder Tier Access</h3>  
                <p>Top contributors unlock premium rewards: dev gear, gift cards, subscriptions, and more.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="https://ggloop.io/vibe-coding" class="cta">START EARNING XP NOW</a>
            </div>
        </div>
        
        <div class="footer">
            <p>"The best code is written in the zone." - Master Chief Protocol</p>
            <p style="margin-top: 20px; font-size: 12px;">You're receiving this because you're part of the GG LOOP Empire. <a href="https://ggloop.io" style="color: #22c55e;">Manage preferences</a></p>
        </div>
    </div>
</body>
</html>
`;

const emailText = `
THE EMPIRE JUST WENT LIVE
Get Paid to Code. Literally.

🎮 Gamified IDE Tracking
Auto-track your coding sessions in VS Code, Cursor, WebStorm, and more. No manual logging.

⚡ 2x XP Multiplier
Turn your flow state into points. Every minute you code earns XP toward real rewards.

🏆 Vibe Coder Badge
Early Adopter Exclusive. Show you were here from day one when we build the Studio.

💎 Builder Tier Access
Top contributors unlock premium rewards: dev gear, gift cards, subscriptions.

START EARNING XP NOW: https://ggloop.io/vibe-coding

"The best code is written in the zone." - Master Chief Protocol
`;

async function sendCampaignEmail(recipientEmail) {
    const params = {
        Source: VERIFIED_EMAIL,
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Subject: {
                Data: "🚀 The Empire Just Went Live: Get Paid to Code",
                Charset: "UTF-8"
            },
            Body: {
                Html: {
                    Data: emailHTML,
                    Charset: "UTF-8"
                },
                Text: {
                    Data: emailText,
                    Charset: "UTF-8"
                }
            }
        }
    };

    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
}

async function main() {
    console.log('🚀 Starting Vibe Coding Email Campaign...\n');

    // TODO: Fetch active users from database
    // For now, sending to verified email as test
    const recipients = [VERIFIED_EMAIL];

    let successCount = 0;
    let failCount = 0;

    for (const email of recipients) {
        try {
            const result = await sendCampaignEmail(email);
            console.log(`✅ Sent to ${email} (ID: ${result.MessageId})`);
            successCount++;

            // Rate limiting: 1 email per second (AWS SES guideline)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Failed to send to ${email}:`, error.message);
            failCount++;
        }
    }

    console.log(`\n📊 Campaign Complete:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📬 Total: ${recipients.length}`);
}

main().catch(err => {
    console.error('💥 Campaign Error:', err);
    process.exit(1);
});
