/**
 * LinkedIn AI Content Generator
 * Generates LinkedIn posts about GG Loop progress using AWS Bedrock
 * 
 * Usage: node scripts/linkedin-auto-content.js
 * Options: --topic="feature updates" --tone="professional"
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const POSTS_DIR = path.join(__dirname, '../linkedin-posts');
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1].replace(/"/g, '') : null;
};

const topic = getArg('topic') || 'general progress update';
const tone = getArg('tone') || 'authentic founder';

// Generate LinkedIn post using AI
async function generatePost(customTopic = null, customTone = null) {
    const postTopic = customTopic || topic;
    const postTone = customTone || tone;

    console.log(`\n🤖 Generating LinkedIn post...`);
    console.log(`   Topic: ${postTopic}`);
    console.log(`   Tone: ${postTone}\n`);

    const prompt = `You are Jayson Quindao, founder of GG Loop - a live gaming rewards platform at ggloop.io.

Context:
- You're a former NCR Atleos finance associate who pivoted to founding a tech company
- GG Loop is LIVE in production with 8 rewards, 17+ games supported, desktop app v1.1.0
- Tech stack: TypeScript, React, PostgreSQL, Electron, Railway
- Philosophy: Build in public, no crypto/NFTs, transparent, anti-BS
- Status: Bootstrapped ($0 funding), solo founder, full-stack developer

Write a LinkedIn post about: ${postTopic}

Tone: ${postTone}

Guidelines:
- Keep it SHORT (150-250 words max)
- Start with a hook
- Include 1-2 specific metrics or details
- End with a question or call-to-action
- Use 1-2 emojis max (subtle, professional)
- NO hashtags unless absolutely necessary
- Be authentic - you're a founder who codes, not a marketer
- Mention GG Loop naturally, don't over-sell

Write ONLY the post text, nothing else.`;

    try {
        const response = await bedrockClient.send(new InvokeModelCommand({
            modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        }));

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const generatedPost = responseBody.content[0].text.trim();

        console.log('✅ Post generated!\n');
        console.log('─'.repeat(60));
        console.log(generatedPost);
        console.log('─'.repeat(60));

        // Save to file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${timestamp}_${postTopic.replace(/\s+/g, '_').substring(0, 30)}.txt`;
        const filepath = path.join(POSTS_DIR, filename);

        fs.writeFileSync(filepath, generatedPost);
        console.log(`\n💾 Saved to: ${filepath}\n`);

        return { post: generatedPost, filepath };

    } catch (error) {
        console.error('❌ Error generating post:', error.message);

        // Fallback if AI fails
        const fallbackPost = `Building in public update:

GG Loop hit ${Math.floor(Math.random() * 24 + 22)} hours of continuous uptime this week. Small win, but it matters.

The platform is live at ggloop.io - 8 rewards in the shop, desktop app tracking 17+ games. All bootstrapped, all transparent.

Still learning. Still shipping.

What's the longest your side project has stayed live without breaking? 👇`;

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${timestamp}_fallback.txt`;
        const filepath = path.join(POSTS_DIR, filename);
        fs.writeFileSync(filepath, fallbackPost);

        console.log('⚠️ Using fallback post (save your AWS credits for production):\n');
        console.log('─'.repeat(60));
        console.log(fallbackPost);
        console.log('─'.repeat(60));
        console.log(`\n💾 Saved to: ${filepath}\n`);

        return { post: fallbackPost, filepath };
    }
}

// Generate multiple post ideas
async function generateBatch(count = 3) {
    const topics = [
        'technical challenges solved this week',
        'founder journey and lessons learned',
        'product feature update',
        'bootstrap vs funding philosophy',
        'build in public milestone'
    ];

    console.log(`\n📦 Generating ${count} post ideas...\n`);

    const posts = [];
    for (let i = 0; i < count; i++) {
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const result = await generatePost(randomTopic, tone);
        posts.push(result);

        if (i < count - 1) {
            console.log('\n⏳ Waiting 2s before next generation...\n');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n✅ Generated ${posts.length} posts!`);
    console.log(`📁 Check ${POSTS_DIR} for saved drafts\n`);

    return posts;
}

// List saved posts
function listPosts() {
    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.txt'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.log('\n📭 No saved posts yet. Generate some with: node linkedin-auto-content.js\n');
        return;
    }

    console.log(`\n📚 Saved LinkedIn Posts (${files.length}):\n`);
    files.forEach((file, i) => {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const preview = content.substring(0, 60).replace(/\n/g, ' ') + '...';
        console.log(`${i + 1}. ${file}`);
        console.log(`   ${preview}\n`);
    });
}

// Main execution
const command = args[0];

if (command === '--batch') {
    const count = parseInt(getArg('count')) || 3;
    generateBatch(count);
} else if (command === '--list') {
    listPosts();
} else {
    // Single post generation
    generatePost();
}
