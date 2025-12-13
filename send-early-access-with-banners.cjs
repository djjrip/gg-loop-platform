// GG LOOP LLC - Early Access Email with Banners
// Complete version with header/footer banners

const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Verify API key
if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.trim() === "") {
    console.error("FATAL: SENDGRID_API_KEY missing in environment.");
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Load banner image
const bannerPath = path.join('C:', 'Users', 'Jayson Quindao', '.gemini', 'antigravity', 'brain', '0ab85420-08db-4478-854f-260710ebfc09', 'uploaded_image_0_1765254960601.png');

let bannerBase64 = '';
try {
    const buffer = fs.readFileSync(bannerPath);
    bannerBase64 = buffer.toString('base64');
    console.log('✅ Banner loaded successfully');
} catch (error) {
    console.error('⚠️  Banner file not found:', bannerPath);
    console.error('Email will send without banners.');
}

// Construct email with inline banners
const msg = {
    to: "jaysonquindao1@gmail.com", // PREVIEW TO CEO
    from: "info@ggloop.io",
    subject: "GG LOOP Early Access — We're Live 🎮🔥",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${bannerBase64 ? '<img src="cid:email-banner" alt="GG LOOP" style="width: 100%; height: auto; display: block; margin-bottom: 20px;">' : ''}
      
      <div style="padding: 20px;">
        <p>Hi there,</p>

        <p>I'm excited to share that <strong>GG LOOP</strong>, a culture-driven rewards platform for gamers, is officially live in <strong>Early Access</strong>.</p>

        <p>GG LOOP is built for players who grind, creators who inspire, and communities that deserve more than empty point systems. Our mission is simple:<br>
        <strong>give gamers real value, real rewards, and a place that actually feels like home.</strong></p>

        <p><strong>What's live right now:</strong><br>
        ✅ Account creation + profiles<br>
        ✅ Pro & Elite subscriptions<br>
        ✅ Founders Badges for the first 1,000 members<br>
        ✅ A working rewards flow<br>
        ✅ A secure foundation for upcoming upgrades</p>

        <p><strong>Why Early Access?</strong><br>
        We're building this with our community — openly and transparently.<br>
        Early members get OG status, input on the roadmap, perks, and bonus points.</p>

        <p style="margin: 30px 0;">
          <a href="https://ggloop.io" style="background: linear-gradient(to right, #FF6B35, #F7931E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">👉 Join GG LOOP Now</a>
        </p>

        <p>Thank you for being here at the beginning.</p>

        <p>
          — Jayson<br>
          CEO, GG LOOP LLC<br>
          <a href="https://ggloop.io" style="color: #FF6B35;">ggloop.io</a>
        </p>
      </div>

      ${bannerBase64 ? '<img src="cid:email-banner-footer" alt="GG LOOP" style="width: 100%; height: auto; display: block; margin-top: 20px;">' : ''}
    </div>
  `,
};

// Add banner attachments if loaded
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

// Send email
console.log('\n📧 Sending Early Access email with banners...\n');
sgMail
    .send(msg)
    .then(() => {
        console.log('✅ PREVIEW EMAIL SENT SUCCESSFULLY!');
        console.log('✓ Check jaysonquindao1@gmail.com');
        console.log('✓ Email includes header and footer banners');
        console.log('✓ Ready for customer list after CEO approval\n');
    })
    .catch((error) => {
        console.error('❌ SendGrid Error:', error.response ? error.response.body : error);
    });
