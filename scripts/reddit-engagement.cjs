/**
 * REDDIT COMMUNITY ENGAGEMENT AUTOMATION
 * Auto-respond to comments on Vibe Coding launch post
 * 
 * Run this periodically to maintain engagement
 */

require('dotenv/config');

const REDDIT_POST_URL = 'https://www.reddit.com/r/BuildYourVibe/comments/1pyw7te/the_empire_just_went_live_get_paid_to_code/';

// Response templates based on comment sentiment/question type
const responses = {
    howItWorks: `Good question! Here's the flow:

1. Download the VS Code extension
2. Code like you normally do—no extra work
3. Extension auto-tracks your active coding time
4. Earn 10 XP per minute (20 XP/min with Builder Tier 2x multiplier)
5. Redeem XP for real rewards in the shop

The 2x multiplier pays for itself if you code 60+ minutes per month. Most devs hit that in a single weekend session.

Join us: https://ggloop.io/vibe-coding`,

    isThisLegit: `100% legit. I built this to solve my own problem—wanted to get rewarded for the grind.

Already tracking 500+ coding sessions. Users have redeemed for Amazon gift cards, dev tools, and subscriptions.

Early adopters get the "Vibe Coder" badge. When we build the Studio, this badge proves you were here from day one.

Join the Empire: https://ggloop.io/vibe-coding`,

    pricing: `Builder Tier is $12/month for the 2x XP multiplier.

Here's the math:
- Free tier: 10 XP/min
- Builder tier: 20 XP/min (2x multiplier)
- If you code 60 min/month: 600 XP → 1200 XP (worth ~$6 in rewards)

You're basically getting paid to code. The multiplier compounds if you're grinding daily.

Try it: https://ggloop.io/vibe-coding`,

    whatGames: `We started with gaming (League, Valorant, CS2) but realized devs are just gamers who build games.

So we pivoted. Now we track:
- VS Code
- Cursor
- WebStorm  
- Any IDE with our extension

Same XP system, same rewards. Just tracking code instead of kills.

Get paid to code: https://ggloop.io/vibe-coding`
};

// TODO: Integrate Reddit API for automated responses
// For now, manually check comments and use templates above

console.log('📋 REDDIT ENGAGEMENT TEMPLATES READY\n');
console.log('Post URL:', REDDIT_POST_URL);
console.log('\n--- RESPONSE TEMPLATES ---\n');

for (const [key, template] of Object.entries(responses)) {
    console.log(`\n[${key.toUpperCase()}]`);
    console.log(template);
    console.log('\n---\n');
}

console.log('✅ Check Reddit post for new comments');
console.log('✅ Use appropriate template based on question type');
console.log('✅ Respond within 2 hours to maintain engagement\n');

module.exports = { responses };
