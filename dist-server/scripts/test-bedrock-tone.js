import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from 'uuid';
// Mock Env if needed, or rely on system env
// process.env.AWS_REGION = "us-east-1"; 
async function testTone() {
    console.log("--- TESTING BEDROCK TONE ---");
    const client = new BedrockAgentRuntimeClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
        }
    });
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
    console.log(`Prompt: ${prompt}`);
    const command = new InvokeAgentCommand({
        agentId,
        agentAliasId,
        sessionId,
        inputText: prompt,
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
        console.log("\n>>> GENERATED OUTPUT:");
        console.log(completion.trim());
        console.log("---------------------\n");
    }
    catch (error) {
        console.error("Trace:", error);
    }
}
testTone();
