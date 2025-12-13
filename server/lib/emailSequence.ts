/**
 * Email Welcome Sequence
 * 3-day drip campaign to onboard new users and drive first subscription
 * 
 * Day 1: Welcome + Quick Win
 * Day 2: Feature showcase + Points primer
 * Day 3: Subscription pitch + Limited offer
 */

interface EmailTemplate {
    subject: string;
    body: string;
    delayHours: number;
}

export const WELCOME_SEQUENCE: EmailTemplate[] = [
    // Day 1: Welcome
    {
        subject: "Welcome to GG LOOP - Let's get you started 🎮",
        delayHours: 0,
        body: `
Hey {firstName},

Welcome to GG LOOP! You just joined the platform where gaming actually pays.

🎯 YOUR FIRST MISSION:
1. Connect your gaming account
2. Complete your first daily login (50 points!)
3. Check out the shop → ggloop.io/shop

💡 PRO TIP: Daily logins give you bonus points for streaks. Log in every day this week to stack rewards.

See you in the arena,
The GG LOOP Team

P.S. - Your unique referral code: {referralCode}
Share it, stack rewards together.
    `,
    },

    // Day 2: Feature showcase
    {
        subject: "You earned {points} points - here's what to do with them",
        delayHours: 24,
        body: `
{firstName},

Nice! You've earned {points} points already.

🛍️ WHAT YOU CAN GET:
• Custom profile badges (750 pts)
• $10 Steam gift card (1,000 pts)
• GG LOOP merch (500-2,500 pts)
• Exclusive Discord roles (150 pts)

👥 DOUBLE YOUR POINTS:
Invite your squad with your code: {referralCode}

When 3 friends join in 7 days = 200 BONUS points
When 5 friends join in 14 days = 500 BONUS points

Check your progress: ggloop.io/referrals

Keep grinding,
GG LOOP
    `,
    },

    // Day 3: Subscription pitch
    {
        subject: "Unlock 2x rewards - Pro members only 👑",
        delayHours: 48,
        body: `
{firstName},

You're crushing it as a free member.

But here's what you're missing:

❌ Free: 1x points on everything
✅ Pro: 2x points on everything

That means:
• Daily login = 100 pts instead of 50
• Referrals = 100 pts instead of 50
• Squad bonuses = DOUBLED

💸 COST: $9.99/month
🎁 FIRST MONTH: 50% off (just $4.99)

Plus you get:
• Pro badge on your profile
• Priority support
• Early access to new features
• Exclusive Pro-only quests

Upgrade now → ggloop.io/subscription

This offer expires in 48 hours.

Let's go,
GG LOOP Team

P.S. - Elite tier ($24.99/month) gets 3x points + Options Hunter access
    `,
    },
];

/**
 * Check if user should receive next email in sequence
 */
export function getNextEmail(
    userCreatedAt: Date,
    emailsSent: number
): EmailTemplate | null {
    const hoursSinceSignup = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60);

    if (emailsSent >= WELCOME_SEQUENCE.length) {
        return null; // Sequence complete
    }

    const nextEmail = WELCOME_SEQUENCE[emailsSent];

    if (hoursSinceSignup >= nextEmail.delayHours) {
        return nextEmail;
    }

    return null; // Not time yet
}

/**
 * Replace template variables
 */
export function renderEmail(
    template: EmailTemplate,
    user: {
        firstName: string;
        totalPoints: number;
        referralCode: string;
    }
): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;

    // Replace variables
    subject = subject.replace('{firstName}', user.firstName || 'Gamer');
    subject = subject.replace('{points}', user.totalPoints.toString());

    body = body.replace(/{firstName}/g, user.firstName || 'Gamer');
    body = body.replace(/{points}/g, user.totalPoints.toString());
    body = body.replace(/{referralCode}/g, user.referralCode);

    return { subject, body };
}
