// Send Brand Outreach Emails to CEO for Proofreading
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Verify API key
if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.trim() === "") {
    console.error("FATAL: SENDGRID_API_KEY missing in environment.");
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email to CEO with all Priority Tier 1 emails for proofreading
const msg = {
    to: "jaysonquindao1@gmail.com",
    from: "info@ggloop.io",
    subject: "Brand Outreach Emails - Ready for Your Review (Priority Tier 1)",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
        
        <div style="padding: 40px 30px; background-color: #0a0a0a; color: #ffffff;">
          
          <h1 style="color: #FF6B35; font-size: 24px; margin: 0 0 20px 0;">Brand Outreach Emails - Ready for Your Review</h1>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey Jayson,</p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            AG here. I've prepared all the brand outreach emails for the 12 target brands. Below are the <strong style="color: #FF6B35;">Priority Tier 1</strong> emails (Logitech G, Target, Cash App) that you should send first.
          </p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Please proofread these and let me know if you want any changes before sending.
          </p>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <h2 style="color: #FF6B35; font-size: 20px; margin: 30px 0 15px 0;">EMAIL #1: LOGITECH G (PRIORITY)</h2>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-left: 4px solid #FF6B35; margin: 0 0 30px 0;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>To:</strong> creators@logitech.com</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>Subject:</strong> Partnership Opportunity - GG LOOP × Logitech G</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 20px 0;"><strong>Attach:</strong> Logitech_Pitch_Deck.pdf</p>
            
            <div style="color: #ffffff; font-size: 15px; line-height: 1.6;">
              <p>Hi Logitech G creators team,</p>
              
              <p>I'm Jayson, founder of GG LOOP (ggloop.io) - a gaming rewards platform where competitive players earn real gear for the grind.</p>
              
              <p><strong>Quick context:</strong></p>
              <ul>
                <li>2,000+ gamers actively upgrading their setups</li>
                <li>Strong peripheral interest (mice, keyboards, headsets - your products)</li>
                <li>Filipino-American founder, former hoops player, gaming grinder</li>
                <li>Honest brand: manual fulfillment, real rewards, no crypto/NFT nonsense</li>
              </ul>
              
              <p><strong>Why Logitech G:</strong><br>
              Your gear is what our community wants. They're grinding ranked, upgrading setups piece by piece, and Logitech G is the go-to brand. We can reward that grind with the exact products they're already researching.</p>
              
              <p><strong>Here's what makes this interesting:</strong><br>
              We're building a "Choose Your Sponsor" onboarding system - when players sign up, they pick a brand sponsor (like signing an NIL deal). They become "Logitech Rookies," earn brand-specific points, unlock exclusive Logitech rewards, and rep your colors on their profile.</p>
              
              <p>It's player identity meets brand loyalty. NBA free agency for gamers.</p>
              
              <p><strong>What I'm proposing:</strong><br>
              30-day "Setup Grind" pilot:</p>
              <ul>
                <li>Gaming missions (any game, any rank)</li>
                <li>Top 50 players earn Logitech G peripherals (mice, keyboards)</li>
                <li>Creator amplification (unboxing videos, setup tours)</li>
                <li>Full conversion tracking (who redeems, what they choose, social reach)</li>
              </ul>
              
              <p><strong>What you get:</strong></p>
              <ul>
                <li>Direct access to setup-upgrading gamers (purchase-intent demographic)</li>
                <li>Real-time metrics (engagement, redemptions, conversions)</li>
                <li>Creator amplification (unboxing content from our community)</li>
                <li>Zero upfront cost - pilot basis only</li>
              </ul>
              
              <p>Not asking for a massive commitment. Just a 15-minute call to explore what this could look like.</p>
              
              <p>Available this week?</p>
              
              <p>Best,<br>
              Jayson BQ<br>
              Founder, GG LOOP LLC<br>
              Filipino-American | Former Hoops Player | Gaming Grinder<br>
              info@ggloop.io<br>
              ggloop.io</p>
            </div>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <h2 style="color: #FF6B35; font-size: 20px; margin: 30px 0 15px 0;">EMAIL #2: TARGET (PRIORITY)</h2>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-left: 4px solid #FF6B35; margin: 0 0 30px 0;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>To:</strong> partnerships@target.com</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>Subject:</strong> Partnership Opportunity - GG LOOP × Target</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 20px 0;"><strong>Attach:</strong> Target_Pitch_Deck.pdf</p>
            
            <div style="color: #ffffff; font-size: 15px; line-height: 1.6;">
              <p>Hi Target partnerships team,</p>
              
              <p>I'm Jayson, founder of GG LOOP (ggloop.io) - a gaming rewards platform for budget-smart gamers.</p>
              
              <p><strong>Quick context:</strong></p>
              <ul>
                <li>2,000+ gamers (18-34 demographic, budget-conscious but quality-focused)</li>
                <li>Strong gift card redemption interest</li>
                <li>Filipino-American founder, gaming grinder</li>
                <li>Honest brand: real rewards, manual fulfillment, no overpromises</li>
              </ul>
              
              <p><strong>Why Target:</strong><br>
              Your gaming section is growing. Our gamers are already shopping there (games, snacks, gear). Target gift cards are universal rewards - everyone wants them. Easy pilot, broad appeal, real conversions.</p>
              
              <p><strong>Here's what makes this interesting:</strong><br>
              We're building a "Choose Your Sponsor" system - players pick a brand when they sign up (like NIL deals for gamers). They become "Target Rookies," earn Target-specific points, unlock exclusive Target rewards, and build their player identity around your brand.</p>
              
              <p><strong>What I'm proposing:</strong><br>
              30-day "Target Run" pilot:</p>
              <ul>
                <li>Gaming missions (all games, all platforms - broad appeal)</li>
                <li>Top 150 players earn Target gift cards ($10-$50 range)</li>
                <li>Social amplification (TikTok, Discord, "I earned this grinding ranked")</li>
                <li>Full redemption tracking (who redeems, what they buy with it, conversion data)</li>
              </ul>
              
              <p><strong>What you get:</strong></p>
              <ul>
                <li>Gaming demographic insights (who they are, what they play, how they engage)</li>
                <li>Gift card to gaming purchase conversion data (do they buy more games? snacks? gear?)</li>
                <li>Social amplification metrics (TikTok views, Discord mentions, organic reach)</li>
                <li>Zero upfront cost - pilot basis only</li>
              </ul>
              
              <p>Not asking for a massive commitment. Just a 15-minute call to explore what this could look like.</p>
              
              <p>Available this week?</p>
              
              <p>Best,<br>
              Jayson BQ<br>
              Founder, GG LOOP LLC<br>
              info@ggloop.io<br>
              ggloop.io</p>
            </div>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <h2 style="color: #FF6B35; font-size: 20px; margin: 30px 0 15px 0;">EMAIL #3: CASH APP (PRIORITY)</h2>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-left: 4px solid #FF6B35; margin: 0 0 30px 0;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>To:</strong> creators@cash.app</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;"><strong>Subject:</strong> Partnership Opportunity - GG LOOP × Cash App</p>
            <p style="color: #999; font-size: 14px; margin: 0 0 20px 0;"><strong>Attach:</strong> CashApp_Pitch_Deck.pdf</p>
            
            <div style="color: #ffffff; font-size: 15px; line-height: 1.6;">
              <p>Hi Cash App creators team,</p>
              
              <p>I'm Jayson, founder of GG LOOP (ggloop.io) - a gaming rewards platform for competitive players.</p>
              
              <p><strong>Quick context:</strong></p>
              <ul>
                <li>2,000+ gamers (18-34 demographic, creator economy overlap)</li>
                <li>Direct cash rewards = highest perceived value</li>
                <li>Filipino-American founder, gaming grinder</li>
                <li>Honest brand: real rewards, no crypto/NFT nonsense</li>
              </ul>
              
              <p><strong>Why Cash App:</strong><br>
              Your brand = instant cash. Our gamers want real money, not just points. Cash App rewards = highest perceived value. Plus, your creator payment infrastructure already exists - natural fit.</p>
              
              <p><strong>Here's what makes this interesting:</strong><br>
              We're building a "Choose Your Sponsor" system - players pick a brand when they sign up (like NIL deals). They become "Cash App Rookies," earn Cash App-specific points, unlock cash payouts, and rep your brand on their profile.</p>
              
              <p>It's player identity meets real money. NBA contracts for gamers.</p>
              
              <p><strong>What I'm proposing:</strong><br>
              30-day "Cash Grind" pilot:</p>
              <ul>
                <li>High-skill competitive missions (ranked wins, tournament placements)</li>
                <li>Top 50 players earn Cash App payouts ($10-$100 range)</li>
                <li>Creator amplification (tournament prize pools, "I got paid to grind")</li>
                <li>Full conversion tracking (Cash App adoption, payout redemptions, viral potential)</li>
              </ul>
              
              <p><strong>What you get:</strong></p>
              <ul>
                <li>Gaming demographic Cash App adoption data (who signs up, who uses it)</li>
                <li>Creator economy insights (how gamers monetize their grind)</li>
                <li>Viral potential (cash rewards = social shares, organic reach)</li>
                <li>Zero upfront cost - pilot basis only</li>
              </ul>
              
              <p>Not asking for a massive commitment. Just a 15-minute call to explore what this could look like.</p>
              
              <p>Available this week?</p>
              
              <p>Best,<br>
              Jayson BQ<br>
              Founder, GG LOOP LLC<br>
              info@ggloop.io<br>
              ggloop.io</p>
            </div>
          </div>

          <div style="border-top: 2px solid #FF6B35; margin: 30px 0;"></div>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
            <strong style="color: #FF6B35;">Next Steps:</strong>
          </p>

          <ol style="color: #ffffff; font-size: 15px; line-height: 1.8;">
            <li>Proofread these 3 emails</li>
            <li>Let me know if you want any changes</li>
            <li>Once approved, I'll help you send them</li>
            <li>Track responses in OUTREACH_APPROVAL_QUEUE.md</li>
          </ol>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
            All 12 brand emails are ready in <strong>OUTREACH_EMAILS_READY_FOR_APPROVAL.md</strong>. These are just the Priority Tier 1 emails to start with.
          </p>

          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 30px 0 40px 0;">
            Let me know what you think!
          </p>

          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 40px;">
            <p style="color: #ffffff; font-size: 15px; line-height: 1.4; margin: 0 0 5px 0;">
              — <strong>AG (Antigravity AI)</strong>
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.4; margin: 0 0 3px 0;">
              Brand Partnership System
            </p>
            <p style="color: #FF6B35; font-size: 14px; line-height: 1.4; margin: 0;">
              GG LOOP LLC
            </p>
          </div>

        </div>

      </div>
    </body>
    </html>
  `,
};

// Send email
console.log('\n📧 Sending Brand Outreach Emails to CEO for Proofreading...\n');
sgMail
    .send(msg)
    .then(() => {
        console.log('✅ EMAILS SENT TO CEO!');
        console.log('✓ Check jaysonquindao1@gmail.com');
        console.log('✓ Priority Tier 1: Logitech G, Target, Cash App');
        console.log('✓ All 3 emails included for proofreading');
        console.log('✓ Dark theme with orange accents\n');
    })
    .catch((error) => {
        console.error('❌ SendGrid Error:', error.response ? error.response.body : error);
    });
