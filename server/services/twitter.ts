import { TwitterApi } from 'twitter-api-v2';
import cron from 'node-cron';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const LOG_DIR = path.resolve(process.cwd(), 'logs');
const LAST_RUN_FILE = path.join(LOG_DIR, 'twitter_last_run.json');
const HISTORY_FILE = path.join(LOG_DIR, 'twitter_history.log');
const MONTHLY_CAP = 100;

// Ensure log dir exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Lazy State
let twitterClient: TwitterApi | null = null;
let bedrockClient: BedrockAgentRuntimeClient | null = null;

// Mock "Builder Energy" Fallbacks (If Bedrock fails)
const FALLBACK_TWEETS = [
    "GG LOOP build status: Revenue Engine LIVE. Trust layer in progress. Verify at ggloop.io",
    "Systems operational. Fair Play protocols active. The loop continues. ggloop.io",
    "Deployment successful. Optimization ongoing. Building for the real ones. ggloop.io",
    "Trust is earned, not claimed. Verification engine spinning up. ggloop.io",
    "Infrastructure hardening complete. Next phase: Desktop Trust Surface. ggloop.io"
];

function getTwitterClient() {
    if (twitterClient) return twitterClient;
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
        throw new Error("Missing Twitter API Keys");
    }
    twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    return twitterClient;
}

function getBedrockClient() {
    if (bedrockClient) return bedrockClient;
    bedrockClient = new BedrockAgentRuntimeClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
        }
    });
    return bedrockClient;
}

// --- LOGGING HELPERS ---
function getStatus(): any {
    try {
        if (fs.existsSync(LAST_RUN_FILE)) {
            return JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf-8'));
        }
        return {
            status: 'unknown',
            message: 'No run recorded yet',
            usage: { month: new Date().toISOString().slice(0, 7), count: 0 }
        };
    } catch (e) {
        return { status: 'error', message: 'Failed to read status file' };
    }
}

function logRun(status: 'success' | 'failure' | 'disabled' | 'skipped' | 'cap_reached', message: string, data?: any) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const previousStatus = getStatus();

    // Calculate Usage
    let usage = previousStatus.usage || { month: currentMonth, count: 0 };

    // Reset if new month
    if (usage.month !== currentMonth) {
        usage = { month: currentMonth, count: 0 };
    }

    // Increment if success
    if (status === 'success') {
        usage.count += 1;
    }

    const entry = {
        timestamp: new Date().toISOString(),
        status,
        message,
        usage,
        cap: MONTHLY_CAP,
        ...data
    };

    // Write Last Run
    fs.writeFileSync(LAST_RUN_FILE, JSON.stringify(entry, null, 2));

    // Append to History
    const logLine = `[${entry.timestamp}] [${status.toUpperCase()}] ${message} (Usage: ${usage.count}/${MONTHLY_CAP}) ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(HISTORY_FILE, logLine);
}

export function getTwitterStatus() {
    return getStatus();
}

// --- CONTENT GENERATION ---
async function generateTweetContent(): Promise<string> {
    try {
        const client = getBedrockClient();
        const agentId = process.env.BEDROCK_AGENT_ID || "GVSQFEAX5Z";
        const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || "ZWB372VUBQ";
        const sessionId = uuidv4();

        const topics = [
            "System Integrity Verified",
            "Fair Play Protocols Active",
            "Reward Distribution Logic",
            "Platform Stability Metrics",
            "Verification Engine Status"
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const prompt = `Generate a calm, confident system update for GG LOOP. Focus on: ${randomTopic}. Tone: Professional, direct, 'builder energy'. Max 140 characters. No hashtags. No emojis. Pure signal.`;

        const command = new InvokeAgentCommand({
            agentId,
            agentAliasId,
            sessionId,
            inputText: prompt,
        });

        const response = await client.send(command);
        let completion = "";
        if (response.completion) {
            for await (const chunk of response.completion) {
                if (chunk.chunk && chunk.chunk.bytes) {
                    completion += new TextDecoder().decode(chunk.chunk.bytes);
                }
            }
        }

        let finalText = completion.trim();
        if (!finalText || finalText.length < 10) throw new Error("Generated content too short");

        return finalText;

    } catch (error) {
        console.error("[Twitter] Bedrock Generation Failed, using Fallback:", error);
        // Fallback Logic
        const fallback = FALLBACK_TWEETS[Math.floor(Math.random() * FALLBACK_TWEETS.length)];
        return fallback;
    }
}

// --- SHARED JOB EXECUTOR ---
export async function executeTwitterJob() {
    console.log("[Twitter] Job Triggered. Attempting Post...");

    // CHECK MONTHLY CAP FIRST
    const currentMonth = new Date().toISOString().slice(0, 7);
    const status = getStatus();
    let usage = status.usage || { month: currentMonth, count: 0 };

    if (usage.month === currentMonth && usage.count >= MONTHLY_CAP) {
        const msg = `Monthly Cap Reached (${usage.count}/${MONTHLY_CAP}). No Post.`;
        console.log(`[Twitter] ${msg}`);
        logRun('cap_reached', msg);
        return;
    }

    try {
        const api = getTwitterClient(); // Will throw if keys missing
        const content = await generateTweetContent();

        if (!content) {
            logRun('skipped', 'No content generated');
            return;
        }

        // Post to X
        const { data } = await api.v2.tweet(content);

        console.log(`[Twitter] Posted Success: "${content}" (ID: ${data.id})`);
        logRun('success', 'Tweet posted successfully', { tweetId: data.id, content });

    } catch (error: any) {
        const errorMsg = error.message || "Unknown error";
        console.error("[Twitter] Execution Failed:", error);

        // Check for key error specifically to give better feedback
        if (errorMsg.includes("Missing Twitter API Keys")) {
            logRun('failure', 'Missing Configuration', {
                missing: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET']
            });
        } else {
            logRun('failure', errorMsg);
        }
    }
}

// --- MAIN AUTOMATION LOOP ---
export function startTwitterAutomation() {
    console.log("[Twitter] Initializing Service...");

    // 1. Check Kill Switch
    if (process.env.ENABLE_AUTO_TWEET !== 'true') {
        const msg = "Automation DISABLED (ENABLE_AUTO_TWEET != true). System Safe.";
        console.log(`[Twitter] ${msg}`);
        logRun('disabled', msg);
        return;
    }

    console.log("[Twitter] Automation ENABLED. Schedule: 0 9,15,20 * * * (3x Daily)");

    // 2. Schedule It (Morning, Afternoon, Evening)
    // 9 AM, 3 PM (15:00), 8 PM (20:00) server time
    cron.schedule('0 9,15,20 * * *', executeTwitterJob);

    // Run immediately on startup IF explicitly requested via env for debugging
    if (process.env.RUN_TWITTER_ON_BOOT === 'true') {
        console.log("[Twitter] RUN_TWITTER_ON_BOOT=true. Executing immediate job...");
        executeTwitterJob();
    }
}
