// GG LOOP LLC - Preview Email Sender
// Uses existing environment variables, no hardcoding.

// import sendgrid
const sgMail = require('@sendgrid/mail');

// ---------------------------------------------------------------------
// 1. VERIFY API KEY IS PRESENT BEFORE ANYTHING ELSE
// ---------------------------------------------------------------------
if (
    !process.env.SENDGRID_API_KEY ||
    process.env.SENDGRID_API_KEY.trim() === ""
) {
    console.error("FATAL: SENDGRID_API_KEY missing in environment.");
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ---------------------------------------------------------------------
// 2. CONSTRUCT THE REAL CUSTOMER EMAIL (PREVIEW TO CEO ONLY)
// ---------------------------------------------------------------------
const msg = {
    to: "jaysonquindao1@gmail.com", // YOU ONLY (PREVIEW)
    from: "info@ggloop.io", // MUST be a SendGrid verified sender
    subject: "GG LOOP Early Access — We're Live 🎮🔥",
    html: `
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

    <p><a href="https://ggloop.io">👉 Join Us at GG LOOP</a></p>

    <p>Thank you for being here at the beginning.<br><br>
    — Jayson<br>
    CEO, GG LOOP LLC<br>
    ggloop.io</p>
  `,
};

// ---------------------------------------------------------------------
// 3. SEND EMAIL
// ---------------------------------------------------------------------
sgMail
    .send(msg)
    .then(() => {
        console.log("Preview email sent to CEO successfully.");
    })
    .catch((error) => {
        console.error("SendGrid Error:", error.response ? error.response.body : error);
    });
