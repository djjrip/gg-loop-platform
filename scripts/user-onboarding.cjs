#!/usr/bin/env node
/**
 * AUTOMATED USER ONBOARDING SYSTEM
 * Triggers welcome sequences when new users sign up
 * Run: Integrated into user signup flow
 */

require('dotenv/config');
const AWS = require('@aws-sdk/client-ses');

const ses = new AWS.SES({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class UserOnboarding {
    constructor() {
        this.sequences = {
            free_tier: [
                { delay: 0, template: 'welcome_free' },
                { delay: 24, template: 'first_session_tips' },
                { delay: 72, template: 'builder_tier_intro' }
            ],
            builder_tier: [
                { delay: 0, template: 'welcome_builder' },
                { delay: 24, template: 'maximizing_xp' },
                { delay: 168, template: 'community_invite' }
            ]
        };
    }

    async onboardUser(user) {
        console.log(`🎯 Onboarding user: ${user.email} (${user.tier})`);

        const sequence = this.sequences[user.tier] || this.sequences.free_tier;

        for (const step of sequence) {
            await this.scheduleEmail(user, step);
        }

        console.log(`✅ ${sequence.length} emails scheduled for ${user.email}`);
    }

    async scheduleEmail(user, step) {
        // In production, use a job queue or scheduler
        // For now, logging the schedule
        const sendTime = new Date(Date.now() + step.delay * 60 * 60 * 1000);

        console.log(`📧 Scheduled: ${step.template} for ${user.email} at ${sendTime.toLocaleString()}`);

        return {
            user: user.email,
            template: step.template,
            scheduledFor: sendTime
        };
    }

    getEmailContent(template, user) {
        const templates = {
            welcome_free: {
                subject: 'Welcome to GG LOOP - Start Earning XP',
                html: `
                    <h1>Welcome to GG LOOP, ${user.username}!</h1>
                    <p>You're now part of a platform that rewards you for what you already do: play games and code.</p>
                    
                    <h2>Here's How to Start Earning:</h2>
                    <ol>
                        <li>Download the desktop app</li>
                        <li>Launch a supported game or IDE</li>
                        <li>Watch your XP grow automatically</li>
                    </ol>
                    
                    <p><strong>Free Tier:</strong> 10 XP/minute for gaming + coding</p>
                    <p><strong>Builder Tier ($12/mo):</strong> 20 XP/minute (2x multiplier)</p>
                    
                    <a href="https://ggloop.io/download">Download Desktop App</a>
                    <a href="https://ggloop.io/shop">Browse Rewards</a>
                    
                    <p>Questions? Reply to this email or join r/BuildYourVibe</p>
                `
            },
            welcome_builder: {
                subject: 'Welcome to Builder Tier - 2x XP Activated',
                html: `
                    <h1>🚀 You're a Builder now, ${user.username}!</h1>
                    <p><strong>Your 2x XP multiplier is active.</strong></p>
                    
                    <h2>What You Get:</h2>
                    <ul>
                        <li>20 XP/minute (double the free tier)</li>
                        <li>Priority support</li>
                        <li>Early access to new features</li>
                        <li>Exclusive Builder badge</li>
                    </ul>
                    
                    <h3>Maximize Your Membership:</h3>
                    <p>Code for 4 hours/day = 4,800 XP/day = 144,000 XP/month</p>
                    <p>That's enough for multiple $10-25 gift cards every month.</p>
                    
                    <a href="https://ggloop.io/download">Download Desktop App</a>
                    
                    <p>Building something cool? Share it in r/BuildYourVibe</p>
                `
            },
            first_session_tips: {
                subject: 'Maximize Your XP: Tips from Top Earners',
                html: `
                    <h1>Hey ${user.username},</h1>
                    <p>Noticed you haven't started your first session yet. Here's how top earners are racking up XP:</p>
                    
                    <h2>Pro Tips:</h2>
                    <ol>
                        <li><strong>Keep the app running:</strong> It only tracks when you're actively playing/coding</li>
                        <li><strong>Try Vibe Coding:</strong> Code in VS Code or Cursor for XP</li>
                        <li><strong>Check daily challenges:</strong> Bonus XP opportunities</li>
                        <li><strong>Set XP goals:</strong> Track progress toward your next reward</li>
                    </ol>
                    
                    <p><strong>Average Builder Tier member earns:</strong> 50,000+ XP/month</p>
                    
                    <a href="https://ggloop.io/download">Start Earning Now</a>
                `
            },
            builder_tier_intro: {
                subject: 'Ready for 2x XP? Builder Tier Unlocked',
                html: `
                    <h1>Upgrade to Builder Tier</h1>
                    <p>You've been earning ${user.totalXp || 0} XP. Want to double that?</p>
                    
                    <h2>Builder Tier Benefits:</h2>
                    <ul>
                        <li><strong>2x XP Multiplier:</strong> 20 XP/minute instead of 10</li>
                        <li><strong>Early Access:</strong> New games and features first</li>
                        <li><strong>Priority Rewards:</strong> First dibs on limited items</li>
                        <li><strong>Support Indie Development:</strong> Help us build better tools</li>
                    </ul>
                    
                    <p><strong>Just $12/month.</strong> Cancel anytime.</p>
                    
                    <a href="https://ggloop.io/subscribe">Upgrade to Builder Tier</a>
                    
                    <p>Questions? Reply to this email.</p>
                `
            }
        };

        return templates[template] || templates.welcome_free;
    }
}

// Export for use in signup handlers
module.exports = { UserOnboarding };

// Test mode
if (require.main === module) {
    const onboarding = new UserOnboarding();

    // Test free tier onboarding
    onboarding.onboardUser({
        email: 'test@example.com',
        username: 'TestUser',
        tier: 'free_tier',
        totalXp: 0
    });

    console.log('\n✅ Onboarding system ready');
}
