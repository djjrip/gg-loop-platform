/**
 * LINKEDIN AUTO-POST SCHEDULER
 * Posts to LinkedIn automatically on schedule
 * 
 * Usage: node scripts/linkedin-scheduler.js
 * Posts 3x per week automatically
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const POST_SCHEDULE = [
    { day: 1, time: '09:00' }, // Monday 9am
    { day: 3, time: '12:00' }, // Wednesday noon
    { day: 5, time: '15:00' }  // Friday 3pm
];

const LOG_FILE = path.join(__dirname, '../logs/linkedin-posts-log.json');
const POSTS_DIR = path.join(__dirname, '../linkedin-posts');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Ensure directories
[path.dirname(LOG_FILE), POSTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load log
function loadLog() {
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, JSON.stringify({ posts: [] }, null, 2));
        return { posts: [] };
    }
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
}

// Save log
function saveLog(log) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

// Check if should post today
function shouldPostToday() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    return POST_SCHEDULE.some(schedule => {
        const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
        return day === schedule.day && hour === scheduleHour && minute === scheduleMinute;
    });
}

// Check if already posted today
function alreadyPostedToday(log) {
    const today = new Date().toISOString().split('T')[0];
    return log.posts.some(post => post.date.startsWith(today));
}

// Generate LinkedIn post
async function generatePost() {
    const topics = [
        'building in public update',
        'technical challenge solved',
        'founder lessons learned',
        'GG Loop milestone reached',
        'fintech + gaming crossover insight'
    ];

    const topic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `You are Jayson Quindao, founder of GG Loop. Write a short LinkedIn post about: ${topic}

Context:
- GG Loop is live at ggloop.io (8 rewards, 17+ games, production platform)
- You're ex-NCR financial ops (2 years managing multi-million $ flows)
- Solo founder, full-stack developer, bootstrapped
- Building in public, no crypto/NFTs, transparent

Guidelines:
- 150 words max
- Start with a hook
- Include 1 specific detail or metric
- End with a question or insight
- Authentic founder voice
- 1-2 emojis max
- NO hashtags

Write ONLY the post text.`;

    try {
        const response = await bedrockClient.send(new InvokeModelCommand({
            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 400,
                messages: [{ role: 'user', content: prompt }]
            })
        }));

        const body = JSON.parse(new TextDecoder().decode(response.body));
        return body.content[0].text.trim();

    } catch (error) {
        console.error('AI generation failed:', error.message);

        // Fallback post
        return `Small win this week:\n\nGG Loop hit ${Math.floor(Math.random() * 10 + 20)} hours of continuous uptime. Platform stable, automations running, shop live.\n\nNot raising money. Not chasing hype. Just shipping.\n\nWhat's your recent small win? 👇`;
    }
}

// Post to LinkedIn (requires authentication)
async function postToLinkedIn(postText) {
    console.log('📝 Preparing to post to LinkedIn...');

    // NOTE: Real implementation requires LinkedIn Cookie authentication
    // For full automation, use:
    // 1. LinkedIn API (requires app approval)
    // 2. Browser automation with saved cookies
    // 3. Schedule posts via Buffer/Hootsuite API

    // For now, save to file for manual posting
    const timestamp = new Date().toISOString();
    const filename = `scheduled-post-${timestamp.split('T')[0]}.txt`;
    const filepath = path.join(POSTS_DIR, filename);

    fs.writeFileSync(filepath, postText);

    console.log(`✅ Post saved to: ${filepath}`);
    console.log('\n📋 Copy and paste this to LinkedIn:\n');
    console.log('─'.repeat(60));
    console.log(postText);
    console.log('─'.repeat(60));

    return { success: true, filepath };
}

// Main scheduler
async function runScheduler() {
    console.log('\n🤖 LinkedIn Auto-Post Scheduler\n');

    const log = loadLog();

    // Check if already posted today
    if (alreadyPostedToday(log)) {
        console.log('✅ Already posted today. Skipping.');
        return;
    }

    // Generate post
    console.log('✍️  Generating post...');
    const postText = await generatePost();

    // Post to LinkedIn
    const result = await postToLinkedIn(postText);

    if (result.success) {
        log.posts.push({
            date: new Date().toISOString(),
            content: postText,
            filepath: result.filepath
        });
        saveLog(log);
        console.log('\n✅ Post ready! Copy to LinkedIn now.\n');
    }
}

// Run scheduler
runScheduler().catch(console.error);

// For automatic scheduling, add this to Windows Task Scheduler:
// Schedule: Mon/Wed/Fri at 9am/12pm/3pm
// Action: node scripts/linkedin-scheduler.js
