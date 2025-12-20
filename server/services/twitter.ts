import { TwitterApi } from 'twitter-api-v2';
import cron from 'node-cron';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from 'uuid';

// Initialization is now Lazy/On-Demand to prevent Boot Crashes.
let twitterClient: TwitterApi | null = null;
let bedrockClient: BedrockAgentRuntimeClient | null = null;

function getTwitterClient() {
    if (twitterClient) return twitterClient;

    // STRICT GUARD: Do not attempt to initialize if keys are missing
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
        throw new Error("Missing Twitter Keys");
    }

    // Create client (Might throw "Invalid consumer tokens" here, so caller must catch)
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

async function generateTweetContent(): Promise<string> {
    const client = getBedrockClient();
    const agentId = process.env.BEDROCK_AGENT_ID || "GVSQFEAX5Z";
    const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || "ZWB372VUBQ";
    const sessionId = uuidv4();

    const command = new InvokeAgentCommand({
        agentId,
        agentAliasId,
        sessionId,
        inputText: "Generate a cryptic, high-energy status update for GG LOOP (cyber-gaming platform). Max 100 characters. No hashtags. Pure signal.",
    });

    try {
        const response = await client.send(command);
        let completion = "";
        if (response.completion) {
            for await (const chunk of response.completion) {
                if (chunk.chunk && chunk.chunk.bytes) {
                    completion += new TextDecoder().decode(chunk.chunk.bytes);
                }
            }
        }
        return completion.trim();
    } catch (error) {
        console.error("[Bedrock] Generation Failed:", error);
        return ""; // Return empty to skip posting
    }
}

export function startTwitterAutomation() {
    console.log("[Twitter] Initializing Service...");

    // CRITICAL SAFETY CHECK:
    // If ENABLE_AUTO_TWEET is not true, we do absolutely nothing.
    if (process.env.ENABLE_AUTO_TWEET !== 'true') {
        console.log("[Twitter] Automation DISABLED (ENABLE_AUTO_TWEET != true). System Safe.");
        return;
    }

    // Attempt to validate credentials logic without crashing
    try {
        // We do NOT instantiate here. We just log schedule.
        console.log("[Twitter] Automation ENABLED. Schedule: 0 10 * * *");
    } catch (err) {
        console.error("[Twitter] Setup Error (Non-Fatal):", err);
    }

    // Schedule task
    cron.schedule('0 10 * * *', async () => {
        console.log("[Twitter] Cron Triggered. Attempting Post...");
        try {
            // Lazy Init inside the cron execution
            const api = getTwitterClient();
            const content = await generateTweetContent();

            if (!content || content.length < 5) {
                console.warn("[Twitter] Content generation failed or too short. Skipping.");
                return;
            }

            const { data } = await api.v2.tweet(content);
            console.log(`[Twitter] Posted Success: ${content} (ID: ${data.id})`);
        } catch (error) {
            // Catch "Invalid consumer tokens" or API errors here to prevent crash
            console.error("[Twitter] Failed to post (Safe Fail):", error);
        }
    });
}
