import { Resend } from 'resend';

// Initialize Resend with API key from environment
// If no key is provided, it will log to console instead of sending (dev mode)
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const FROM_EMAIL = 'GG Loop <onboarding@ggloop.io>'; // You'll need to verify this domain in Resend

export async function sendWelcomeEmail(toEmail: string, username: string) {
    if (!resend) {
        console.log(`[DEV MODE] Would send welcome email to ${toEmail}`);
        return true;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [toEmail],
            subject: 'Welcome to GG Loop! 🎮',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background-color: #B8724D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background-color: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #B8724D; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
            .feature-list { list-style-type: none; padding: 0; }
            .feature-list li { margin-bottom: 10px; padding-left: 24px; position: relative; }
            .feature-list li:before { content: '✅'; position: absolute; left: 0; top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to the Loop! ♾️</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>Thanks for joining GG Loop! We're thrilled to have you in our community of gamers who earn while they play.</p>
              
              <h3>🚀 Getting Started Guide:</h3>
              <ul class="feature-list">
                <li><strong>Connect Your Accounts:</strong> Link your Riot, Steam, or Twitch accounts to start tracking your stats.</li>
                <li><strong>Play & Earn:</strong> Just play your favorite games. We track your performance and award points automatically.</li>
                <li><strong>Redeem Rewards:</strong> Visit the Shop to turn your points into gift cards, skins, and gear.</li>
                <li><strong>Refer Friends:</strong> Use your unique referral link to earn bonus points for every friend who joins.</li>
              </ul>

              <div style="text-align: center;">
                <a href="https://ggloop.io/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <p>If you have any questions, just reply to this email. We're here to help you level up!</p>
              
              <p>GLHF,<br>The GG Loop Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GG Loop. All rights reserved.</p>
              <p>You received this email because you signed up for GG Loop.</p>
            </div>
          </div>
        </body>
        </html>
      `
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }

        console.log(`Welcome email sent to ${toEmail}:`, data);
        return true;
    } catch (err) {
        console.error('Exception sending welcome email:', err);
        return false;
    }
}
