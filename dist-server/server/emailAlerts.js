/**
 * EMAIL ALERTS - Simple SendGrid version
 */
import fetch from 'node-fetch';
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
export async function sendApiKeyEmailAlert() {
    const emailPayload = {
        personalizations: [{
                to: [{ email: 'jaysonquindao1@gmail.com' }],
                subject: '🔑 GG LOOP: Riot API Key Expires in 2 Hours',
            }],
        from: { email: 'info@ggloop.io', name: 'GG LOOP Alert System' },
        content: [{
                type: 'text/html',
                value: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
          <h1 style="color: #d4895c;">🔑 API Key Reminder</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your Riot API key expires in <strong>2 hours</strong>.
          </p>
          
          <div style="background: #1a1a1a; border-left: 4px solid #d4895c; padding: 15px; margin: 20px 0;">
            <strong>⚡ Quick Update (30 seconds):</strong><br><br>
            1. <strong>Get new key:</strong> <a href="https://developer.riotgames.com/app/777487/info" style="color: #d4895c; font-weight: bold;">Your GG LOOP App →</a><br>
            2. <strong>Update key:</strong> <a href="https://ggloop.io/admin/update-riot-key" style="color: #d4895c; font-weight: bold;">Admin Panel →</a><br>
            3. Done! ✅
          </div>
          
          <p style="font-size: 14px; color: #999;">
            This email is sent 22 hours after your last API key update.<br>
            (SMS alerts will activate when Twilio A2P approves in 2-3 weeks)
          </p>
        </div>
      `
            }]
    };
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });
        if (response.ok) {
            console.log('✅ Email alert sent to jaysonquindao1@gmail.com');
            return true;
        }
        else {
            console.log('❌ Email failed:', response.status);
            return false;
        }
    }
    catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}
// Test it now
async function test() {
    console.log('📧 Sending test API key reminder email...\n');
    await sendApiKeyEmailAlert();
    console.log('\n✅ Check jaysonquindao1@gmail.com!');
}
test();
