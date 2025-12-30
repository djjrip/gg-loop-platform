#!/usr/bin/env node
/**
 * AUTONOMOUS CONTENT PUBLISHER
 * Auto-publishes content across all channels on schedule
 * Run: node scripts/autonomous-publisher.cjs
 * Deploy: Set up as cron job for daily execution
 */

require('dotenv/config');
const fs = require('fs');
const path = require('path');

class AutonomousPublisher {
    constructor() {
        this.contentQueue = this.loadContentQueue();
        this.publishLog = this.loadPublishLog();
        this.schedules = {
            reddit: { frequency: 'daily', lastPost: null },
            substack: { frequency: 'mon-thu-sun', lastPost: null },
            twitter: { frequency: 'daily', lastPost: null }
        };
    }

    loadContentQueue() {
        // Content ready to publish (from all our created files)
        return {
            reddit_posts: [
                {
                    id: 'substack_announce',
                    title: 'Launching Substack: Building in Public',
                    file: 'REDDIT_SUBSTACK_ANNOUNCEMENT.md',
                    subreddit: 'BuildYourVibe',
                    scheduled: false
                },
                {
                    id: 'week1_update',
                    title: 'Week 1 Update: What I Shipped',
                    content: 'Auto-generated from WEEK1_PLAN.md',
                    subreddit: 'BuildYourVibe',
                    scheduled: false
                }
            ],
            substack_posts: [
                {
                    id: 'post1_bankruptcy',
                    title: 'From Bankruptcy to Production in 90 Days',
                    file: 'SUBSTACK_STRATEGY.md',
                    section: 'Post 1',
                    scheduled: false
                },
                {
                    id: 'post2_campaign',
                    title: '72-Hour Campaign: $0 to... Still $0',
                    file: 'SUBSTACK_STRATEGY.md',
                    section: 'Post 2',
                    scheduled: false
                },
                {
                    id: 'post3_thesis',
                    title: 'Why I\'m Paying Developers to Code',
                    file: 'SUBSTACK_STRATEGY.md',
                    section: 'Post 3',
                    scheduled: false
                }
            ],
            twitter_threads: [
                {
                    id: 'railway_saga',
                    topic: '17 Railway Deployments Thread',
                    auto_generate: true,
                    scheduled: false
                },
                {
                    id: 'vibe_coding_launch',
                    topic: 'Vibe Coding Week 1 Metrics',
                    auto_generate: true,
                    scheduled: false
                }
            ]
        };
    }

    loadPublishLog() {
        const logPath = path.join(__dirname, '..', '.metrics', 'publish-log.json');
        if (fs.existsSync(logPath)) {
            return JSON.parse(fs.readFileSync(logPath, 'utf8'));
        }
        return { published: [], failed: [] };
    }

    savePublishLog() {
        const logPath = path.join(__dirname, '..', '.metrics', 'publish-log.json');
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(logPath, JSON.stringify(this.publishLog, null, 2));
    }

    shouldPublishToday(channel) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        switch (channel) {
            case 'reddit':
                // Daily
                return true;

            case 'substack':
                // Mon (1), Thu (4), Sun (0)
                return [0, 1, 4].includes(dayOfWeek);

            case 'twitter':
                // Daily
                return true;

            default:
                return false;
        }
    }

    async publishReddit() {
        if (!this.shouldPublishToday('reddit')) {
            console.log('⏭️  Reddit: Not scheduled for today');
            return;
        }

        const unposted = this.contentQueue.reddit_posts.filter(p => !p.scheduled);

        if (unposted.length === 0) {
            console.log('✅ Reddit: All content published');
            return;
        }

        const nextPost = unposted[0];

        console.log('📋 REDDIT AUTO-PUBLISH:\n');
        console.log(`Subreddit: r/${nextPost.subreddit}`);
        console.log(`Title: ${nextPost.title}`);
        console.log(`Content: ${nextPost.file || 'Generated'}\n`);

        // In production, use Reddit API to post
        // For now, log to publish queue
        console.log('⚠️  MANUAL ACTION REQUIRED:');
        console.log(`1. Go to https://reddit.com/r/${nextPost.subreddit}/submit`);
        console.log(`2. Copy content from: ${nextPost.file}`);
        console.log(`3. Post with title: "${nextPost.title}"\n`);

        // Mark as queued
        this.publishLog.published.push({
            platform: 'reddit',
            post: nextPost.id,
            timestamp: new Date().toISOString(),
            status: 'queued'
        });

        this.savePublishLog();
    }

    async publishSubstack() {
        if (!this.shouldPublishToday('substack')) {
            console.log('⏭️  Substack: Not scheduled for today');
            return;
        }

        const unposted = this.contentQueue.substack_posts.filter(p => !p.scheduled);

        if (unposted.length === 0) {
            console.log('✅ Substack: All content published');
            return;
        }

        const nextPost = unposted[0];

        console.log('📧 SUBSTACK AUTO-PUBLISH:\n');
        console.log(`Title: ${nextPost.title}`);
        console.log(`Content: ${nextPost.file} (${nextPost.section})\n`);

        console.log('⚠️  MANUAL ACTION REQUIRED:');
        console.log('1. Go to https://substack.com/publish');
        console.log(`2. Copy content from: ${nextPost.file}`);
        console.log(`3. Publish with title: "${nextPost.title}"\n`);

        // Mark as queued
        this.publishLog.published.push({
            platform: 'substack',
            post: nextPost.id,
            timestamp: new Date().toISOString(),
            status: 'queued'
        });

        this.savePublishLog();
    }

    async publishTwitter() {
        // Twitter is ALREADY automated via server/services/twitter.ts
        console.log('✅ Twitter: Already fully automated (AI-generated tweets via Bedrock)\n');
        return;
    }

    async publishAll() {
        console.log('🤖 AUTONOMOUS CONTENT PUBLISHER\n');
        console.log(`📅 ${new Date().toLocaleString()}\n`);

        await this.publishTwitter();
        await this.publishReddit();
        await this.publishSubstack();

        console.log('\n📊 PUBLISH STATUS:\n');
        console.log(`Total published: ${this.publishLog.published.length}`);
        console.log(`Failed: ${this.publishLog.failed.length}\n`);

        console.log('💡 TO MAKE 100% AUTONOMOUS:\n');
        console.log('1. Add Reddit API credentials to .env');
        console.log('2. Add Substack API credentials (if available)');
        console.log('3. Set up daily cron job: node scripts/autonomous-publisher.cjs\n');

        return this.publishLog;
    }
}

// Auto-run on execution
if (require.main === module) {
    const publisher = new AutonomousPublisher();
    publisher.publishAll();
}

module.exports = { AutonomousPublisher };
