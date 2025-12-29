/**
 * GG LOOP COMMAND CENTER
 * Tracks all engagement, leads, and user activity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/command-center');
const TWITTER_LOG = path.join(DATA_DIR, 'twitter-engagement.json');
const LEADS_LOG = path.join(DATA_DIR, 'leads.json');
const USERS_LOG = path.join(DATA_DIR, 'user-activity.json');

// Ensure directories exist
[DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Initialize logs
function loadLog(file) {
    if (!fs.existsSync(file)) {
        const defaultData = file === TWITTER_LOG
            ? { tweets: [], replies: [], dms: [] }
            : file === LEADS_LOG
                ? { warm: [], cold: [], closed: [] }
                : { signups: [], downloads: [], active: [], redemptions: [] };
        fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveLog(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Track Twitter engagement
export function logTweet(tweetData) {
    const log = loadLog(TWITTER_LOG);
    log.tweets.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        content: tweetData.content,
        impressions: 0,
        replies: 0,
        retweets: 0,
        likes: 0,
        link_clicks: 0,
        status: 'posted'
    });
    saveLog(TWITTER_LOG, log);
    console.log('✅ Tweet logged');
}

export function logTwitterReply(replyData) {
    const log = loadLog(TWITTER_LOG);
    log.replies.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        username: replyData.username,
        content: replyData.content,
        sentiment: analyzeSentiment(replyData.content),
        responded: false,
        response: null
    });
    saveLog(TWITTER_LOG, log);

    // Trigger response if needed
    if (shouldRespond(replyData.content)) {
        const response = generateResponse(replyData.content);
        console.log(`\n🔔 NEW REPLY from @${replyData.username}:`);
        console.log(`   "${replyData.content}"`);
        console.log(`\n📝 SUGGESTED RESPONSE:`);
        console.log(`   "${response}"`);
    }
}

export function logDM(dmData) {
    const log = loadLog(TWITTER_LOG);
    log.dms.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        username: dmData.username,
        content: dmData.content,
        isLead: dmData.content.toLowerCase().includes('test') ||
            dmData.content.toLowerCase().includes('try'),
        responded: false
    });
    saveLog(TWITTER_LOG, log);

    // Move to leads if interested
    if (log.dms[log.dms.length - 1].isLead) {
        addLead({
            name: dmData.username,
            source: 'twitter_dm',
            message: dmData.content,
            priority: 'high'
        });
    }
}

// Track leads
export function addLead(leadData) {
    const leads = loadLog(LEADS_LOG);
    leads.warm.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...leadData,
        status: 'new',
        followedUp: false
    });
    saveLog(LEADS_LOG, leads);

    console.log(`\n🎯 NEW LEAD: ${leadData.name}`);
    console.log(`   Source: ${leadData.source}`);
    console.log(`   Priority: ${leadData.priority}`);
    console.log(`\n✉️  NEXT ACTION: Send onboarding email`);
}

export function updateLead(leadId, updates) {
    const leads = loadLog(LEADS_LOG);
    const categories = ['warm', 'cold', 'closed'];

    categories.forEach(cat => {
        const index = leads[cat].findIndex(l => l.id === leadId);
        if (index !== -1) {
            leads[cat][index] = { ...leads[cat][index], ...updates };
            saveLog(LEADS_LOG, leads);
        }
    });
}

// Track user activity
export function logSignup(userData) {
    const users = loadLog(USERS_LOG);
    users.signups.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        email: userData.email,
        source: userData.source || 'unknown',
        onboarded: false
    });
    saveLog(USERS_LOG, users);

    console.log(`\n🎉 NEW SIGNUP: ${userData.email}`);
    console.log(`   Source: ${userData.source}`);
    console.log(`\n📧 NEXT: Send welcome email`);
}

export function logDownload(downloadData) {
    const users = loadLog(USERS_LOG);
    users.downloads.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId: downloadData.userId,
        platform: 'desktop',
        installed: false
    });
    saveLog(USERS_LOG, users);
}

export function logRedemption(redemptionData) {
    const users = loadLog(USERS_LOG);
    users.redemptions.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId: redemptionData.userId,
        reward: redemptionData.reward,
        points: redemptionData.points,
        value: redemptionData.value
    });
    saveLog(USERS_LOG, users);

    console.log(`\n🎁 FIRST REDEMPTION!`);
    console.log(`   User: ${redemptionData.userId}`);
    console.log(`   Reward: ${redemptionData.reward}`);
    console.log(`\n📸 SCREENSHOT THIS FOR SOCIAL PROOF`);
}

// Sentiment analysis
function analyzeSentiment(text) {
    const positive = /great|awesome|love|thanks|interested|yes|definitely/i;
    const negative = /bad|issue|problem|broken|doesn't work/i;
    const question = /how|what|when|where|can i|do you/i;

    if (positive.test(text)) return 'positive';
    if (negative.test(text)) return 'negative';
    if (question.test(text)) return 'question';
    return 'neutral';
}

function shouldRespond(text) {
    // Always respond to questions, issues, or positive engagement
    return analyzeSentiment(text) !== 'neutral';
}

function generateResponse(text) {
    const sentiment = analyzeSentiment(text);

    if (sentiment === 'positive') {
        return "Thanks! DM me for early access link + bonus points 🎮";
    }

    if (sentiment === 'question') {
        if (/how.*work/i.test(text)) {
            return "Desktop app tracks games automatically. Play → earn points → redeem rewards. DM for details!";
        }
        if (/crypto|nft/i.test(text)) {
            return "Zero crypto. Zero NFTs. Just real rewards for playing games.";
        }
        return "Good question! DM me and I'll explain in detail.";
    }

    if (sentiment === 'negative') {
        return "Sorry to hear that. Can you DM me details? I'll fix it ASAP.";
    }

    return "Appreciate the feedback! 🙏";
}

// Daily report
export function generateDailyReport() {
    const twitter = loadLog(TWITTER_LOG);
    const leads = loadLog(LEADS_LOG);
    const users = loadLog(USERS_LOG);

    const today = new Date().toISOString().split('T')[0];

    const todayTweets = twitter.tweets.filter(t => t.timestamp.startsWith(today));
    const todayReplies = twitter.replies.filter(r => r.timestamp.startsWith(today));
    const todayLeads = leads.warm.filter(l => l.timestamp.startsWith(today));
    const todaySignups = users.signups.filter(s => s.timestamp.startsWith(today));
    const todayRedemptions = users.redemptions.filter(r => r.timestamp.startsWith(today));

    console.log(`\n📊 DAILY REPORT - ${today}\n`);
    console.log(`Twitter:`);
    console.log(`  Tweets: ${todayTweets.length}`);
    console.log(`  Replies: ${todayReplies.length}`);
    console.log(`  Unresponded: ${todayReplies.filter(r => !r.responded).length}`);
    console.log(`\nLeads:`);
    console.log(`  New: ${todayLeads.length}`);
    console.log(`  Total warm: ${leads.warm.length}`);
    console.log(`\nUsers:`);
    console.log(`  Signups: ${todaySignups.length}`);
    console.log(`  Downloads: ${users.downloads.filter(d => d.timestamp.startsWith(today)).length}`);
    console.log(`  Redemptions: ${todayRedemptions.length}`);
    console.log(`\n---\n`);
}

// Export command center
export default {
    logTweet,
    logTwitterReply,
    logDM,
    addLead,
    updateLead,
    logSignup,
    logDownload,
    logRedemption,
    generateDailyReport
};
