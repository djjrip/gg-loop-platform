#!/usr/bin/env node

/**
 * INNOVATION: Email automation for user engagement
 * Sends personalized emails based on user journey stage
 * 100% authentic messaging, no spam
 */

import nodemailer from 'nodemailer';
import { db } from "../server/db.js";
import { users } from "@shared/schema";
import fs from 'fs/promises';

// Email configuration (using Gmail - update with your credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jaysonquindao1@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
    }
});

// Email templates
const templates = {
    feedbackRequest: {
        subject: 'GG LOOP is LIVE - Your Feedback Needed 🎮',
        html: (user) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${user.username || 'there'},</h2>
        
        <p>Quick update: GG LOOP's payment system is finally working. You can now subscribe and unlock premium features.</p>
        
        <h3>What's New:</h3>
        <ul>
          <li>PayPal subscriptions active ($5-25/month)</li>
          <li>Premium tiers with point multipliers</li>
          <li>Exclusive rewards for subscribers</li>
          <li>Desktop app improvements</li>
        </ul>
        
        <h3>Honest request:</h3>
        <p>You're one of our first 5 users. Your feedback is critical.</p>
        
        <p>Before you subscribe (or don't), I need to know:</p>
        <ol>
          <li>What's working for you?</li>
          <li>What's broken or frustrating?</li>
          <li>What would make you pay for this?</li>
        </ol>
        
        <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <strong>Special Founder Offer:</strong><br>
          First month free if you subscribe this week. Just reply to this email and I'll send you a code.
        </div>
        
        <p>Not a sales pitch - genuinely want to build something you'd actually use.</p>
        
        <p>Thanks for being part of the early days.</p>
        
        <p>
          <strong>Jayson</strong><br>
          Founder, GG LOOP<br>
          <a href="https://ggloop.io">ggloop.io</a>
        </p>
        
        <p style="font-size: 12px; color: #666;">
          P.S. - If this isn't valuable to you, totally fine. Just let me know what WOULD be valuable.
        </p>
      </div>
    `
    },

    realityCheck: {
        subject: 'Real talk about GG LOOP',
        html: (user) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${user.username || 'Hey'},</h2>
        
        <p>You signed up for GG LOOP. I need your honest feedback.</p>
        
        <h3>The situation:</h3>
        <ul>
          <li>5 total users (including you)</li>
          <li>$0 revenue</li>
          <li>90 days of development</li>
          <li>Payments finally working</li>
        </ul>
        
        <h3>The question:</h3>
        <p><strong>Is this actually useful to you, or should I change direction?</strong></p>
        
        <h3>What I need:</h3>
        <ul>
          <li>5 minutes of your time</li>
          <li>Brutal honesty</li>
          <li>Specific feedback on what sucks</li>
        </ul>
        
        <h3>What you get:</h3>
        <ul>
          <li>Free month if you subscribe</li>
          <li>Direct line to the founder (me)</li>
          <li>Shape the product you want</li>
        </ul>
        
        <p>Jump on a quick call? Or just reply with what's on your mind.</p>
        
        <p>Building this solo from bankruptcy. Every piece of feedback matters.</p>
        
        <p>
          <strong>Jayson</strong><br>
          jaysonquindao1@gmail.com<br>
          <a href="https://ggloop.io">ggloop.io</a>
        </p>
      </div>
    `
    },

    paidFeedback: {
        subject: 'Help me fix GG LOOP - $25 Amazon card for 15 min',
        html: (user) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${user.username || 'there'},</h2>
        
        <p><strong>Straight up:</strong> I'll send you a $25 Amazon gift card if you hop on a 15-minute call with me this week.</p>
        
        <h3>Why:</h3>
        <ul>
          <li>You're one of 5 early users</li>
          <li>Your feedback determines what I build next</li>
          <li>I need to know what's working and what's not</li>
        </ul>
        
        <h3>Call agenda:</h3>
        <ol>
          <li>What brought you to sign up? (2 min)</li>
          <li>What have you tried using? (5 min)</li>
          <li>What would make you pay for this? (5 min)</li>
          <li>What should I kill/keep/add? (3 min)</li>
        </ol>
        
        <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <strong>When:</strong><br>
          Reply with your availability this week. I'll send you a Calendly link.
        </div>
        
        <p><strong>$25 is yours regardless of feedback.</strong> Positive, negative, doesn't matter.</p>
        
        <p>Thanks for being an early believer.</p>
        
        <p>
          <strong>Jayson</strong><br>
          Founder, GG LOOP
        </p>
      </div>
    `
    }
};

async function sendEmailCampaign(templateName = 'feedbackRequest', dryRun = true) {
    console.log(`📧 ${dryRun ? '[DRY RUN] ' : ''}Email Campaign: ${templateName}\n`);

    // Get all users
    const allUsers = await db.select().from(users);

    console.log(`Found ${allUsers.length} users\n`);

    const results = [];

    for (const user of allUsers) {
        if (!user.email) {
            console.log(`⚠️  Skipping ${user.username || user.id}: No email`);
            continue;
        }

        const template = templates[templateName];
        if (!template) {
            console.error(`❌ Template '${templateName}' not found`);
            return;
        }

        const mailOptions = {
            from: '"Jayson - GG LOOP" <jaysonquindao1@gmail.com>',
            to: user.email,
            subject: template.subject,
            html: template.html(user)
        };

        if (dryRun) {
            console.log(`✉️  Would send to: ${user.email} (${user.username || 'no username'})`);
            console.log(`   Subject: ${template.subject}\n`);
        } else {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Sent to: ${user.email}`);
                results.push({ user: user.email, status: 'sent' });

                // Wait 2 seconds between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`❌ Failed to send to ${user.email}:`, error.message);
                results.push({ user: user.email, status: 'failed', error: error.message });
            }
        }
    }

    // Save results
    if (!dryRun) {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const logPath = `logs/email-campaign-${templateName}-${timestamp}.json`;
        await fs.mkdir('logs', { recursive: true });
        await fs.writeFile(logPath, JSON.stringify({
            template: templateName,
            timestamp: new Date().toISOString(),
            totalUsers: allUsers.length,
            sent: results.filter(r => r.status === 'sent').length,
            failed: results.filter(r => r.status === 'failed').length,
            results
        }, null, 2));

        console.log(`\n📊 Results saved to: ${logPath}`);
    } else {
        console.log('\n💡 This was a DRY RUN. To send real emails, run: node scripts/send-email-campaign.js [template] false');
    }
}

// CLI usage
const templateName = process.argv[2] || 'feedbackRequest';
const dryRun = process.argv[3] !== 'false'; // Default to dry run unless explicitly set to false

sendEmailCampaign(templateName, dryRun).catch(console.error);

/* 
USAGE:

# Dry run (preview only)
node scripts/send-email-campaign.js feedbackRequest

# Send real emails
node scripts/send-email-campaign.js feedbackRequest false

# Different templates
node scripts/send-email-campaign.js realityCheck false
node scripts/send-email-campaign.js paidFeedback false

SETUP:
1. Enable 2FA on Gmail
2. Create App Password: https://myaccount.google.com/apppasswords
3. Set environment variable: GMAIL_APP_PASSWORD=your_app_password
4. Install nodemailer: npm install nodemailer
*/
