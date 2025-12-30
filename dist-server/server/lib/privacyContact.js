/**
 * Privacy-First Contact System
 * Anonymizes all communication - users never see your real identity
 *
 * Features:
 * - Auto-forwarding from business email to your personal
 * - Canned responses (appear as "GG LOOP Support Team")
 * - Ticket tracking without revealing your identity
 */
/**
 * Canned responses for common questions
 * AI auto-responds, you stay invisible
 */
export const CANNED_RESPONSES = [
    {
        trigger: ['subscription', 'cancel', 'billing'],
        category: 'billing',
        response: `
Thanks for reaching out!

For subscription management, please visit:
ggloop.io/account/subscription

You can upgrade, downgrade, or cancel anytime.

If you need additional help, reply to this email and we'll assist within 24 hours.

Best,
The GG LOOP Team
    `,
    },
    {
        trigger: ['points', 'rewards', 'redeem'],
        category: 'general',
        response: `
Hi there!

You can check your points balance and browse rewards at:
ggloop.io/shop

Points are earned through:
• Daily logins (50pts + streak bonuses)
• Referrals (50-200pts per friend)
• Completing quests
• Pro/Elite membership (2x-3x multiplier)

Questions? Reply to this email.

Cheers,
GG LOOP Support
    `,
    },
    {
        trigger: ['bug', 'error', 'not working', 'broken'],
        category: 'technical',
        response: `
Sorry you're experiencing issues!

Please provide:
1. What were you trying to do?
2. What happened instead?
3. Browser you're using
4. Screenshot (if possible)

Reply to this email with those details and we'll investigate immediately.

Thanks,
GG LOOP Tech Team
    `,
    },
];
/**
 * Auto-categorize and respond to contact form submissions
 */
export function processContactSubmission(submission) {
    const messageLower = `${submission.subject} ${submission.message}`.toLowerCase();
    // Check for trigger words
    for (const template of CANNED_RESPONSES) {
        const hasMatch = template.trigger.some(trigger => messageLower.includes(trigger));
        if (hasMatch) {
            return {
                autoRespond: true,
                response: template.response,
                category: template.category,
            };
        }
    }
    // No match - requires manual review
    return {
        autoRespond: false,
        response: null,
        category: 'manual_review',
    };
}
/**
 * Forward to your email with anonymized "from" address
 */
export function createForwardEmail(submission) {
    return {
        to: process.env.FOUNDER_EMAIL || '', // Your personal email (private)
        from: 'support@ggloop.io', // Public facing
        subject: `[Contact Form] ${submission.subject}`,
        body: `
New contact form submission:

FROM: ${submission.name} <${submission.email}>
SUBJECT: ${submission.subject}

MESSAGE:
${submission.message}

---
Submitted: ${submission.timestamp.toISOString()}

TO REPLY:
Send email to ${submission.email} from support@ggloop.io
DO NOT reply from your personal email.
    `,
    };
}
/**
 * Log all contact submissions (for analytics)
 */
export function logContactSubmission(submission) {
    console.log(`
📨 New Contact Submission
From: ${submission.email}
Category: Auto-detected
Time: ${submission.timestamp.toISOString()}
  `);
}
