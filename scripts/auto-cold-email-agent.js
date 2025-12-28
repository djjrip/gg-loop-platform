/**
 * AUTONOMOUS COLD EMAIL AGENT
 * Automatically generates prospects, writes personalized emails, and sends them
 * 
 * Usage: node scripts/auto-cold-email-agent.js --mode=agency
 * Modes: agency (AI automation) or fintech (consulting)
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { createTransport } = nodemailer.default || nodemailer;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MODE = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'agency';
const DAILY_LIMIT = 10; // Send 10 emails per day max
const LOG_FILE = path.join(__dirname, '../logs/cold-email-log.json');
const PROSPECTS_FILE = path.join(__dirname, '../data/prospects.json');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Email configuration (uses Gmail SMTP)
const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'jaysonquindao@ggloop.io',
        pass: process.env.EMAIL_APP_PASSWORD // Gmail app-specific password
    }
});

// Ensure directories exist
[path.dirname(LOG_FILE), path.dirname(PROSPECTS_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load or create prospects database
function loadProspects() {
    if (!fs.existsSync(PROSPECTS_FILE)) {
        const defaultProspects = MODE === 'agency'
            ? {
                agency: [
                    { name: 'Sarah Johnson', company: 'Johnson Realty', email: 'sarah@johnsonrealty.com', industry: 'real estate', city: 'Dallas' },
                    { name: 'Mike Chen', company: 'Chen Coaching', email: 'mike@chencoaching.com', industry: 'coaching', city: 'Plano' },
                    { name: 'Lisa Rodriguez', company: 'Rodriguez Insurance', email: 'lisa@rodriguezins.com', industry: 'insurance', city: 'Fort Worth' }
                ]
            }
            : {
                fintech: [
                    { name: 'Alex Kumar', company: 'PayFlow Inc', email: 'alex@payflow.io', industry: 'fintech', stage: 'Series A' },
                    { name: 'Jessica Park', company: 'FinanceOS', email: 'jessica@financeos.com', industry: 'SaaS', stage: 'Seed' }
                ]
            };
        fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(defaultProspects, null, 2));
        return defaultProspects;
    }
    return JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf-8'));
}

// Load email log
function loadLog() {
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, JSON.stringify({ sent: [], failed: [] }, null, 2));
        return { sent: [], failed: [] };
    }
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
}

// Save email log
function saveLog(log) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// Check if already contacted
function alreadyContacted(email, log) {
    return log.sent.some(entry => entry.email === email);
}

// Check daily limit
function checkDailyLimit(log) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = log.sent.filter(entry => entry.date.startsWith(today)).length;
    return todayCount < DAILY_LIMIT;
}

// Generate personalized email using AI
async function generateEmail(prospect, mode) {
    const prompt = mode === 'agency'
        ? `You are Jayson Quindao, founder of GG Loop. Write a cold email to ${prospect.name} at ${prospect.company} (${prospect.industry} business in ${prospect.city}).

Offer: AI automation to save them 10+ hours/week on manual tasks like lead follow-up, scheduling, CRM updates.
Your background: Built GG Loop (live platform at ggloop.io), former NCR financial ops.
Pricing: $2,500-5,000 setup.

Guidelines:
- Keep it under 100 words
- Personalize based on their industry
- End with simple question
- No corporate jargon
- Authentic, founder-to-founder tone

Write ONLY the email body, no subject line.`
        : `You are Jayson Quindao, founder of GG Loop with 2 years NCR financial ops experience. Write a cold email to ${prospect.name} at ${prospect.company} (${prospect.stage} ${prospect.industry} startup).

Offer: Payment architecture review or reconciliation setup consulting.
Your expertise: Managed multi-million dollar transaction flows at NCR, built payment systems for GG Loop.
Pricing: $2,500-10,000 depending on scope.

Guidelines:
- Keep it under 100 words
- Focus on specific pain point (reconciliation or compliance)
- Credibility from NCR experience
- End with low-friction offer
- Professional but approachable

Write ONLY the email body, no subject line.`;

    try {
        const response = await bedrockClient.send(new InvokeModelCommand({
            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 300,
                messages: [{ role: 'user', content: prompt }]
            })
        }));

        const body = JSON.parse(new TextDecoder().decode(response.body));
        return body.content[0].text.trim();
    } catch (error) {
        console.error('AI generation failed, using template:', error.message);

        // Fallback template
        return mode === 'agency'
            ? `Hi ${prospect.name.split(' ')[0]},\n\nI help ${prospect.industry} businesses automate manual work (lead follow-up, scheduling, CRM).\n\nJust saved a ${prospect.city} business 12 hours/week. Setup is $3k.\n\n10-min intro call work for you?\n\nJayson\nGG Loop LLC | jaysonquindao@ggloop.io`
            : `${prospect.name.split(' ')[0]},\n\nManaged $XXM in transaction flows at NCR for 2 years. Now helping ${prospect.industry} startups with payment reconciliation.\n\n1-hour payment architecture review: $250.\n\nInterested?\n\nJayson | Ex-NCR Financial Ops`;
    }
}

// Send email
async function sendEmail(prospect, emailBody, mode) {
    const subject = mode === 'agency'
        ? `Automate your ${prospect.industry} workflows?`
        : `Payment architecture review (ex-NCR)`;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'jaysonquindao@ggloop.io',
        to: prospect.email,
        subject,
        text: emailBody + '\n\n---\nJayson Quindao\nFounder, GG Loop LLC\nGGLoop.io'
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Main automation loop
async function runAgent() {
    console.log(`\n🤖 Cold Email Agent Starting (Mode: ${MODE})\n`);

    const prospects = loadProspects();
    const log = loadLog();
    const targetList = MODE === 'agency' ? prospects.agency : prospects.fintech;

    if (!targetList || targetList.length === 0) {
        console.log('❌ No prospects found. Add prospects to:', PROSPECTS_FILE);
        return;
    }

    // Check daily limit
    if (!checkDailyLimit(log)) {
        console.log(`⏸️  Daily limit reached (${DAILY_LIMIT} emails). Try again tomorrow.`);
        return;
    }

    let sentToday = 0;
    const today = new Date().toISOString();

    for (const prospect of targetList) {
        // Skip if already contacted
        if (alreadyContacted(prospect.email, log)) {
            console.log(`⏭️  Skipped: ${prospect.name} (already contacted)`);
            continue;
        }

        // Check limit
        if (sentToday >= DAILY_LIMIT) {
            console.log(`\n⏸️  Daily limit reached. Sent ${sentToday} emails today.`);
            break;
        }

        console.log(`\n📧 Processing: ${prospect.name} (${prospect.company})`);

        // Generate email
        console.log('   ✍️  Generating personalized email...');
        const emailBody = await generateEmail(prospect, MODE);

        // Send email
        console.log('   📤 Sending...');
        const result = await sendEmail(prospect, emailBody, MODE);

        if (result.success) {
            console.log('   ✅ Sent successfully!');
            log.sent.push({
                ...prospect,
                date: today,
                emailBody,
                mode: MODE
            });
            sentToday++;
        } else {
            console.log(`   ❌ Failed: ${result.error}`);
            log.failed.push({
                ...prospect,
                date: today,
                error: result.error
            });
        }

        // Save log after each send
        saveLog(log);

        // Wait 30 seconds between emails (avoid spam filters)
        if (sentToday < DAILY_LIMIT && targetList.indexOf(prospect) < targetList.length - 1) {
            console.log('   ⏳ Waiting 30s before next email...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }

    console.log(`\n✅ Agent Complete!`);
    console.log(`   Sent: ${sentToday} emails`);
    console.log(`   Total sent (all time): ${log.sent.length}`);
    console.log(`   Failed: ${log.failed.length}`);
    console.log(`\nCheck logs: ${LOG_FILE}\n`);
}

// Run the agent
runAgent().catch(console.error);
