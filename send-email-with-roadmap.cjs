// GG LOOP LLC - Early Access Email with Roadmap
// Dark theme + roadmap section

const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.trim() === "") {
    console.error("FATAL: SENDGRID_API_KEY missing in environment.");
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const bannerPath = path.join('C:', 'Users', 'Jayson Quindao', '.gemini', 'antigravity', 'brain', '0ab85420-08db-4478-854f-260710ebfc09', 'uploaded_image_0_1765254960601.png');

let bannerBase64 = '';
try {
    const buffer = fs.readFileSync(bannerPath);
    bannerBase64 = buffer.toString('base64');
    console.log('✅ Banner loaded');
} catch (error) {
    console.error('⚠️  Banner not found');
}

const msg = {
    to: "jaysonquindao1@gmail.com",
    from: "info@ggloop.io",
    subject: "GG LOOP Early Access — We're Live 🎮🔥",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
        
        ${bannerBase64 ? '<img src="cid:email-banner" alt="GG LOOP" style="width: 100%; height: auto; display: block;">' : ''}
        
        <div style="padding: 40px 30px; background-color: #0a0a0a; color: #ffffff;">
          
          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            I'm excited to share that <strong style="color: #FF6B35;">GG LOOP</strong>, a culture-driven rewards platform for gamers, is officially live in <strong>Early Access</strong>.
          </p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            GG LOOP is built for players who grind, creators who inspire, and communities that deserve more than empty point systems. Our mission is simple:<br>
            <strong style="color: #FF6B35;">give gamers real value, real rewards, and a place that actually feels like home.</strong>
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <p style="color: #FF6B35; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">What's live right now:</p>
          
          <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0 0 5px 0;">✅ Account creation + profiles</p>
          <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0 0 5px 0;">✅ Pro & Elite subscriptions</p>
          <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0 0 5px 0;">✅ Founders Badges for the first 1,000 members</p>
          <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0 0 5px 0;">✅ A working rewards flow</p>
          <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;">✅ A secure foundation for upcoming upgrades</p>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <p style="color: #FF6B35; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">Why Early Access?</p>
          
          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
            We're building this <strong>with our community</strong> — openly and transparently.
          </p>
          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Early members get OG status, input on the roadmap, perks, and bonus points.
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <!-- ROADMAP SECTION -->
          <p style="color: #FF6B35; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">Where We're Going 🚀</p>
          
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 0 0 15px 0;">
            <p style="color: #4CAF50; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">✅ NOW LIVE</p>
            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0;">Subscriptions • Missions • Reward Store</p>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #FF6B35; border-radius: 8px; padding: 20px; margin: 0 0 15px 0;">
            <p style="color: #FF6B35; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">🔧 IN DEVELOPMENT</p>
            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0;">
              • Affiliate Program<br>
              • Partner Rewards<br>
              • Community Features
            </p>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
            <p style="color: #888; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">🔮 COMING SOON</p>
            <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0;">
              • Desktop App (verified gameplay)<br>
              • Multi-game support<br>
              • Creator partnerships
            </p>
          </div>

          <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            <a href="https://ggloop.io/roadmap" style="color: #FF6B35; text-decoration: none;">View Live Roadmap →</a>
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://ggloop.io" style="display: inline-block; background: linear-gradient(to right, #FF6B35, #F7931E); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">
              👉 Join GG LOOP Now
            </a>
          </div>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 30px 0 40px 0;">
            Thank you for being here at the beginning.
          </p>

          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 40px;">
            <p style="color: #ffffff; font-size: 15px; line-height: 1.4; margin: 0 0 5px 0;">
              — <strong>Jayson BQ</strong>
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.4; margin: 0 0 3px 0;">
              Founder & CEO of GG LOOP LLC
            </p>
            <p style="color: #FF6B35; font-size: 14px; line-height: 1.4; margin: 0;">
              <a href="https://ggloop.io" style="color: #FF6B35; text-decoration: none;">ggloop.io</a>
            </p>
          </div>

        </div>

        ${bannerBase64 ? '<img src="cid:email-banner-footer" alt="GG LOOP" style="width: 100%; height: auto; display: block;">' : ''}

      </div>
    </body>
    </html>
  `,
};

if (bannerBase64) {
    msg.attachments = [
        {
            content: bannerBase64,
            filename: 'banner.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'email-banner',
        },
        {
            content: bannerBase64,
            filename: 'banner-footer.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'email-banner-footer',
        },
    ];
}

console.log('\n📧 Sending Email with Roadmap...\n');
sgMail
    .send(msg)
    .then(() => {
        console.log('✅ EMAIL WITH ROADMAP SENT!');
        console.log('✓ Now includes roadmap section');
        console.log('✓ Links to ggloop.io/roadmap\n');
    })
    .catch((error) => {
        console.error('❌ Error:', error.response ? error.response.body : error);
    });
