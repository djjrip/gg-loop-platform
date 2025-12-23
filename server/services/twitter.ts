import { TwitterApi } from 'twitter-api-v2';
import { db } from "../db";
import { xPostLogs } from "@shared/schema";
import { count, eq, sql, desc } from "drizzle-orm";
import crypto from 'crypto';
// @ts-ignore
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// --- CONFIGURATION ---
const MONTHLY_CAP = 100;

// Initialize Bedrock Client
const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

let twitterClient: TwitterApi | null = null;

function getTwitterClient() {
    if (twitterClient) return twitterClient;

    // MAP: Railway Vars -> Library Keys
    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
        throw new Error("Missing Twitter Configuration (TWITTER_CONSUMER_KEY / SECRET)");
    }

    twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    return twitterClient;
}

// Check current monthly usage from DB
async function getMonthlyUsage(): Promise<number> {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    try {
        const result = await db
            .select({ count: count() })
            .from(xPostLogs)
            .where(eq(xPostLogs.month, currentMonth));

        return result[0]?.count || 0;
    } catch (error) {
        console.error("Failed to fetch Twitter usage:", error);
        return MONTHLY_CAP; // Fail safe: Assume cap reached if DB fails
    }
}

// Log execution to DB
async function logPost(content: string, status: 'success' | 'failed' | 'skipped', tweetId?: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
        await db.insert(xPostLogs).values({
            id: crypto.randomUUID(),
            content,
            status,
            tweetId,
            month: currentMonth,
            createdAt: new Date()
        });
        console.log(`[Twitter] Logged: ${status} (${content.slice(0, 20)}...)`);
    } catch (error) {
        console.error("Failed to log Twitter execution:", error);
    }
}

/**
 * Generates tweet content using Bedrock (Claude 3 Haiku)
 */
async function generateTweetContent(): Promise<string> {
    const prompt = `
    You are the social media voice of GG LOOP, a serious competitive gaming platform focused on "Play -> Earn -> Loop".
    
    TONE:
    - Confident, professional, founder-led.
    - No emojis. No hashtags. No hype.
    - Focus on infrastructure, verifying matches, and the "Empire" theme.
    
    TOPICS (Pick one):
    1. The importance of verified stats in gaming.
    2. Building a sustainable economy for gamers (not crypto, real value).
    3. The concept of "Proof of Skill".
    4. Why manual verification builds trust.
    
    OUTPUT:
    - A single tweet text (max 280 chars).
    - Plain text only.
    `;

    try {
        const response = await bedrock.send(new InvokeModelCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 300,
                messages: [{ role: "user", content: prompt }]
            })
        }));

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const tweet = responseBody.content?.[0]?.text?.trim();

        if (!tweet) throw new Error("Empty response from Bedrock");
        if (tweet.length > 280) return tweet.substring(0, 277) + "...";

        return tweet;

    } catch (error) {
        console.error("Bedrock generation failed:", error);
        return "Building the loop. Verifying the skill. Integrating the empire. #GGLOOP"; // Fallback
    }
}

export async function executeTwitterJob(dryRun = false) {
    console.log(`[Twitter] Job Starting... (DryRun: ${dryRun})`);

    // 1. Check Configuration
    if (process.env.ENABLE_AUTO_TWEET !== 'true' && !dryRun) {
        console.log("[Twitter] Automation DISABLED via Env Var.");
        return;
    }

    // 2. Check Cap
    const usage = await getMonthlyUsage();
    console.log(`[Twitter] Monthly Usage: ${usage}/${MONTHLY_CAP}`);

    if (usage >= MONTHLY_CAP) {
        console.warn(`[Twitter] MONTHLY CAP REACHED (${usage}). Aborting.`);
        await logPost("CAP_REACHED", "skipped");
        return;
    }

    // 3. Generate Content
    const content = await generateTweetContent();
    console.log(`[Twitter] Generated: "${content}"`);

    // 4. Post (or Simulate)
    if (dryRun) {
        console.log("[Twitter] DRY RUN - Logging success without API call.");
        await logPost(content, "success", "DRY-RUN-ID");
        return;
    }

    try {
        const client = getTwitterClient();
        const response = await client.v2.tweet(content);

        console.log(`[Twitter] Posted! ID: ${response.data.id}`);
        await logPost(content, "success", response.data.id);

    } catch (error: any) {
        console.error("[Twitter] API Error:", error);
        await logPost(content, "failed");
    }
}


// Removed self-execution block to support ESM

export function getTwitterStatus() {
    return {
        enabled: process.env.ENABLE_AUTO_TWEET === 'true',
        monthlyCap: MONTHLY_CAP,
    };
}

export function startTwitterAutomation() {
    // Placeholder - automation triggered via cron or manual call
    console.log('[Twitter] Automation initialized');
}

