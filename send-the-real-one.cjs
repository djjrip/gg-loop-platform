// GG LOOP LLC - Early Access Email (AUTHENTIC VERSION)
// Real, upfront, no corporate BS

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
} catch (error) {
  console.error('⚠️  Banner not found');
}

const msg = {
  to: "jaysonquindao1@gmail.com",
  from: "info@ggloop.io",
  subject: "GG LOOP Early Access — We're Live 🎮",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
        
        ${bannerBase64 ? '<img src="cid:email-banner" alt="GG LOOP" style="width: 100%; height: auto; display: block; margin-bottom: 30px;">' : ''}
        
        <div style="padding: 30px 35px; background-color: #0a0a0a; color: #ffffff;">
          
          <p style="color: #ffffff; font-size: 17px; line-height: 1.7; margin: 0 0 30px 0;">
            Hi there, <strong style="color: #FF6B35;">Jayson here.</strong>
          </p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            I'm the founder of <strong style="color: #FF6B35;">GG LOOP LLC</strong>, and I'm reaching out because <strong>GG LOOP is officially live in Early Access</strong> — and I wanted you to be among the first to know.
          </p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
            GG LOOP came from my life as a Filipino-American gamer raised on hoops, sneakers, and late-night ranked queues. I built this for people like us: <strong>the grinders, the ones who show up every day, and rarely get anything back for it.</strong>
          </p>

          <div style="border-left: 4px solid #FF6B35; padding-left: 20px; margin: 30px 0; background: #1a1a1a; padding: 20px;">
            <p style="color: #FF6B35; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">WHAT GG LOOP IS (SIMPLE + HONEST)</p>
            <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0;">
              A culture-driven rewards platform where gamers earn real value for playing the games they already love.<br><br>
              <strong>No crypto.<br>
              No gimmicks.<br>
              No dark patterns.<br>
              No credit card required.</strong><br><br>
              Just <strong style="color: #FF6B35;">Play → Earn → Loop.</strong>
            </p>
          </div>

          <p style="color: #4CAF50; font-size: 17px; text-align: center; font-weight: bold; margin: 30px 0; padding: 15px; background: #1a1a1a; border: 2px solid #4CAF50; border-radius: 8px;">
            ✅ It's completely FREE to join and try.
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 40px 0 30px 0;"></div>

          <p style="color: #FF6B35; font-size: 19px; font-weight: bold; margin: 0 0 20px 0;">WHERE WE'RE AT (FULL TRANSPARENCY)</p>
          
          <div style="background: #1a1a1a; border: 1px solid #4CAF50; border-left: 4px solid #4CAF50; border-radius: 6px; padding: 20px; margin: 0 0 20px 0;">
            <p style="color: #4CAF50; font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">✅ WE ARE:</p>
            <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0;">
              ✓ Live and functional<br>
              ✓ Pro & Elite subscriptions active<br>
              ✓ Missions and daily challenges working<br>
              ✓ Reward store operational<br>
              ✓ Small but growing<br>
              ✓ Completely self-funded<br>
              ✓ Community-first<br>
              ✓ Culture-rooted (sneakers, hoops, identity, gaming)
            </p>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #888; border-left: 4px solid #888; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
            <p style="color: #888; font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">× WE ARE NOT (YET):</p>
            <p style="color: #ccc; font-size: 15px; line-height: 1.8; margin: 0;">
              × Automated reward delivery (I fulfill manually)<br>
              × Offering Riot account linking (Coming later via desktop app)<br>
              × Offering real-life financial aid - This is a long-term goal dependent on funding<br>
            </p>
          </div>

          <p style="color: #999; font-size: 15px; line-height: 1.6; margin: 0 0 40px 0; font-style: italic;">
            Honesty matters more to me than pretending we're bigger than we are.
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 40px 0 30px 0;"></div>

          <p style="color: #FF6B35; font-size: 19px; font-weight: bold; margin: 0 0 20px 0;">⭐ FOUNDING 1,000 PERKS</p>
          
          <div style="background: linear-gradient(135deg, #1a1a1a, #2a1a0a); border: 2px solid #FF6B35; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
            <p style="color: #ffffff; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0;">
              <strong style="color: #FF6B35;">The first 1,000 members receive:</strong>
            </p>
            <p style="color: #ffffff; font-size: 15px; line-height: 2; margin: 0;">
              ✓ Permanent <strong>Founder Badge</strong><br>
              ✓ Locked-in pricing <strong>forever</strong><br>
              ✓ Early access to every future feature<br>
              ✓ Priority on new rewards and expansions<br>
              ✓ Input on the roadmap
            </p>
            <p style="color: #FF6B35; font-size: 14px; margin: 15px 0 0 0; font-weight: bold;">
              You get to be early — truly early.
            </p>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin: 40px 0 30px 0;"></div>

          <p style="color: #FF6B35; font-size: 19px; font-weight: bold; margin: 0 0 20px 0;">WHERE WE'RE GOING 🚀</p>
          
          <div style="background: #1a1a1a; border: 1px solid #FF6B35; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
            <p style="color: #FF6B35; font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">🔧 IN DEVELOPMENT (CONTINGENT ON FUNDING)</p>
            <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin: 0;">
              • <strong>Desktop app</strong> for verified gameplay rewards<br>
              • Automated gift card delivery<br>
              • Expanded reward catalog
            </p>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
            <p style="color: #666; font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">🌍 THE LONG-TERM VISION</p>
            <p style="color: #aaa; font-size: 15px; line-height: 1.8; margin: 0;">
              The dream is simple: <strong>Gaming shouldn't drain you — it should support you.</strong><br><br>
              We want to build a future where playing games can help with real-world stability. But today, we start with the basics: Play games, earn points, get cool stuff (manually sent by me).
            </p>
          </div>

          <p style="color: #999; font-size: 14px; text-align: center; margin: 20px 0 40px 0;">
            <a href="https://ggloop.io/roadmap" style="color: #FF6B35; text-decoration: none; font-weight: bold;">→ View Live Roadmap</a>
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 40px 0;"></div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://ggloop.io" style="display: inline-block; background: linear-gradient(to right, #FF6B35, #F7931E); color: #ffffff; padding: 18px 45px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 17px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">
              Join GG LOOP — Early Access
            </a>
            <p style="color: #888; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
              No credit card. No commitment. Just try it.
            </p>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin: 50px 0 30px 0;"></div>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
            Thank you for being here at the beginning.<br>
            Built from the culture, for the culture.
          </p>

          <div style="margin: 30px 0;">
            <p style="color: #ffffff; font-size: 16px; line-height: 1.4; margin: 0 0 5px 0;">
              — <strong>Jayson BQ</strong>
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.4; margin: 0 0 3px 0;">
              Founder & CEO, GG LOOP LLC
            </p>
            <p style="color: #FF6B35; font-size: 14px; line-height: 1.4; margin: 0;">
              <a href="https://ggloop.io" style="color: #FF6B35; text-decoration: none;">ggloop.io</a>
            </p>
          </div>

          <!-- SOCIAL FOOTER -->
          <div style="border-top: 2px solid #333; margin: 50px 0 0 0; padding-top: 30px;">
            <p style="color: #FF6B35; font-size: 16px; font-weight: bold; text-align: center; margin: 0 0 20px 0;">
              Join the Community
            </p>
            <div style="text-align: center;">
              <a href="https://discord.gg/X6GXg2At2D" style="display: inline-block; margin: 0 6px 10px 6px; background: #1a1a1a; border: 1px solid #5865F2; border-radius: 6px; padding: 10px 18px; text-decoration: none; min-width: 100px;">
                <span style="color: #5865F2; font-size: 13px; font-weight: bold;">💬 Discord</span>
              </a>
              <a href="https://twitter.com/ggloopllc" style="display: inline-block; margin: 0 6px 10px 6px; background: #1a1a1a; border: 1px solid #1DA1F2; border-radius: 6px; padding: 10px 18px; text-decoration: none; min-width: 100px;">
                <span style="color: #1DA1F2; font-size: 13px; font-weight: bold;">𝕏 X</span>
              </a>
              <a href="https://www.linkedin.com/company/ggloop/" style="display: inline-block; margin: 0 6px 10px 6px; background: #1a1a1a; border: 1px solid #0A66C2; border-radius: 6px; padding: 10px 18px; text-decoration: none; min-width: 100px;">
                <span style="color: #0A66C2; font-size: 13px; font-weight: bold;">💼 LinkedIn</span>
              </a>
              <a href="https://www.tiktok.com/@gg.loop" style="display: inline-block; margin: 0 6px 10px 6px; background: #1a1a1a; border: 1px solid #FF0050; border-radius: 6px; padding: 10px 18px; text-decoration: none; min-width: 100px;">
                <span style="color: #FF0050; font-size: 13px; font-weight: bold;">📱 TikTok</span>
              </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222;">
              <p style="color: #555; font-size: 11px; line-height: 1.8; margin: 0;">
                © 2025 GG LOOP LLC • All rights reserved<br>
                <a href="https://ggloop.io/privacy" style="color: #777; text-decoration: none;">Privacy</a> • 
                <a href="https://ggloop.io/terms" style="color: #777; text-decoration: none;">Terms</a> • 
                <a href="{{unsubscribe}}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
              </p>
            </div>
          </div>

        </div>

        ${bannerBase64 ? '<img src="cid:email-banner-footer" alt="GG LOOP" style="width: 100%; height: auto; display: block; margin-top: 20px;">' : ''}

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

console.log('\n📧 Sending THE REAL ONE...\n');
sgMail
  .send(msg)
  .then(() => {
    console.log('✅ FINAL AUTHENTIC EMAIL SENT!');
    console.log('');
    console.log('THIS ONE IS:');
    console.log('✓ Starts with "Hi there, Jayson here."');
    console.log('✓ Everything UPFRONT - no hidden sections');
    console.log('✓ Real, authentic, genuine tone');
    console.log('✓ Full transparency (WE ARE vs WE ARE NOT YET)');
    console.log('✓ Clear roadmap and vision');
    console.log('✓ Founding 1000 perks highlighted');
    console.log('✓ Social links at bottom');
    console.log('✓ Dark theme maintained\n');
  })
  .catch((error) => {
    console.error('❌ Error:', error.response ? error.response.body : error);
  });
