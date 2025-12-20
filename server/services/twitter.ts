import { TwitterApi } from 'twitter-api-v2';
import cron from 'node-cron';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from 'uuid';

// Environment variables must be set
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
});

const bedrockClient = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

async function generateTweetContent(): Promise<string> {
    // Use Bedrock to generate content
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
        const response = await bedrockClient.send(command);
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
        console.error("Bedrock Access Failed:", error);
        return "System Systems Active. Loop Initiated."; // Fallback
    }
}

export function startTwitterAutomation() {
    if (!process.env.ENABLE_AUTO_TWEET) {
        console.log("[Twitter] Automation Disabled (ENABLE_AUTO_TWEET missing).");
        return;
    }

    console.log("[Twitter] Automation Engine Started. Schedule: 0 10 * * *");

    // Schedule task to run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log("[Twitter] Triggering Daily Update...");
        try {
            const content = await generateTweetContent();
            if (!content || content.length < 5) return;

            const { data } = await twitterClient.v2.tweet(content);
            console.log(`[Twitter] Posted: ${content} (ID: ${data.id})`);
        } catch (error) {
            console.error("[Twitter] Failed to post:", error);
        }
    });
}
