/**
 * WELCOME EMAIL TEMPLATE
 * Auto-send to new signups
 */

export const welcomeEmail = {
    subject: "Welcome to GG Loop - Start Earning Now 🎮",

    body: (userName, userEmail) => `
Hey ${userName || 'there'},

Welcome to GG Loop! You're in.

Here's how to start earning:

1. Download the desktop app:
   https://github.com/djjrip/gg-loop-platform/releases/latest
   
2. Extract the zip and run "GG Loop Desktop.exe"

3. Log in with your account (${userEmail})

4. Play games normally:
   - League of Legends
   - Valorant
   - CS2, Dota 2, Apex, Fortnite, etc.

5. Watch points accumulate automatically

6. Redeem at ggloop.io/shop

QUICK START:
- App runs in background (no impact on performance)
- Points awarded per game played
- First game = 50 bonus points
- First 100 users get 2x points for Week 1

NEED HELP?
Reply to this email or DM me on Discord/Twitter: @jaysonquindao

Common questions:
Q: Is this safe?
A: Yes. Open source, read-only process detection. Zero access to your game accounts.

Q: How do I know it's working?
A: Check ggloop.io - you'll see your points update after each game.

Q: What if I have issues?
A: I respond in < 1 hour. Just reply to this email.

LET'S GO 🚀

Jayson Quindao
Founder, GG Loop LLC
ggloop.io

P.S. You're early. Thanks for testing. Your feedback shapes the product.
`,

    html: (userName, userEmail) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to GG Loop! 🎮</h2>
  
  <p>Hey ${userName || 'there'},</p>
  
  <p>You're in. Here's how to start earning:</p>
  
  <ol>
    <li><a href="https://github.com/djjrip/gg-loop-platform/releases/latest">Download the desktop app</a></li>
    <li>Extract the zip and run "GG Loop Desktop.exe"</li>
    <li>Log in with your account (${userEmail})</li>
    <li>Play games normally</li>
    <li>Watch points accumulate</li>
  </ol>
  
  <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>SUPPORTED GAMES:</strong><br>
    League of Legends • Valorant • CS2 • Dota 2 • Apex Legends • Fortnite • and more
  </div>
  
  <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>🎁 EARLY USER BONUS:</strong><br>
    First game = 50 bonus points<br>
    First 100 users = 2x points for Week 1
  </div>
  
  <p><strong>Need help?</strong> Reply to this email. I respond in < 1 hour.</p>
  
  <p>Let's go! 🚀</p>
  
  <p>
    Jayson Quindao<br>
    Founder, GG Loop LLC<br>
    <a href="https://ggloop.io">ggloop.io</a>
  </p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <p style="font-size: 12px; color: #666;">
    You're receiving this because you signed up at ggloop.io. 
    You're early. Thanks for testing.
  </p>
</div>
`
};

export const day2FollowUp = {
    subject: "Did you get a chance to try GG Loop?",

    body: (userName) => `
Hey ${userName},

Just checking in - did you get a chance to download and try GG Loop?

I saw you signed up but haven't seen any games tracked yet. Want to make sure everything's working!

**Common setup issues I can help with:**
- App won't install → Try "Run as Administrator"
- Not tracking games → Make sure you're logged in
- Points not showing → Refresh ggloop.io after game ends

Reply to this and I'll help troubleshoot. Usually takes < 5 min to fix.

Or if you haven't tried yet, no worries - here's the link again:
https://github.com/djjrip/gg-loop-platform/releases/latest

Jayson
`
};

export const firstGameCelebration = {
    subject: "🎉 First game tracked! Here's your bonus points",

    body: (userName, gamePlayed, pointsEarned) => `
${userName} - you did it! 🎮

First game tracked:
- Game: ${gamePlayed}
- Points earned: ${pointsEarned}
- Bonus: +50 points (first game)

Total: ${pointsEarned + 50} points

Keep playing to rack up more. You're ${500 - (pointsEarned + 50)} points away from your first $10 Amazon card.

Quick tip: Leave the app running in the background. It auto-tracks all supported games.

Thanks for being an early user!

Jayson
`
};
