import { Router } from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const router = Router();

// Initialize Bedrock client with credentials from environment
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Cost tracking (stored in memory, could move to DB later)
let totalTokensUsed = 0;
let totalCost = 0;

// Claude 3 Haiku pricing (cheapest model)
const COST_PER_1K_INPUT_TOKENS = 0.00025; // $0.25 per 1M input tokens
const COST_PER_1K_OUTPUT_TOKENS = 0.00125; // $1.25 per 1M output tokens

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface BedrockRequest {
    messages: ChatMessage[];
    model?: string;
}

// POST /api/bedrock/chat - Main chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { messages, model = 'anthropic.claude-3-haiku-20240307-v1:0' }: BedrockRequest = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array required' });
        }

        // Prepare request for Bedrock
        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        };

        const command = new InvokeModelCommand({
            modelId: model,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload),
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Track usage and costs
        const inputTokens = responseBody.usage?.input_tokens || 0;
        const outputTokens = responseBody.usage?.output_tokens || 0;
        const messageCost =
            (inputTokens / 1000) * COST_PER_1K_INPUT_TOKENS +
            (outputTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS;

        totalTokensUsed += inputTokens + outputTokens;
        totalCost += messageCost;

        res.json({
            response: responseBody.content[0].text,
            usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                cost: messageCost,
                totalCostToday: totalCost,
            },
        });
    } catch (error: any) {
        console.error('Bedrock API error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
});

// POST /api/bedrock/code - Code generation endpoint
router.post('/code', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        const systemMessage = `You are a code generation assistant. Generate clean, production-ready code based on the user's requirements. Include proper TypeScript types, error handling, and comments. Format code in markdown code blocks.`;

        const messages = [
            { role: 'user' as const, content: `${systemMessage}\n\nUser request: ${prompt}` },
        ];

        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages,
        };

        const command = new InvokeModelCommand({
            modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload),
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Track costs
        const inputTokens = responseBody.usage?.input_tokens || 0;
        const outputTokens = responseBody.usage?.output_tokens || 0;
        const messageCost =
            (inputTokens / 1000) * COST_PER_1K_INPUT_TOKENS +
            (outputTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS;

        totalCost += messageCost;

        res.json({
            code: responseBody.content[0].text,
            usage: {
                cost: messageCost,
                totalCostToday: totalCost,
            },
        });
    } catch (error: any) {
        console.error('Code generation error:', error);
        res.status(500).json({
            error: 'Failed to generate code',
            details: error.message
        });
    }
});

// POST /api/bedrock/debug - Debug helper endpoint
router.post('/debug', async (req, res) => {
    try {
        const { error, context } = req.body;

        if (!error) {
            return res.status(400).json({ error: 'Error message required' });
        }

        const debugPrompt = `You are a debugging assistant. Analyze this error and provide a clear solution.

Error:
${error}

${context ? `Context:\n${context}` : ''}

Provide:
1. Root cause analysis
2. Step-by-step solution
3. Code fix (if applicable)
4. Prevention tips`;

        const messages = [
            { role: 'user' as const, content: debugPrompt },
        ];

        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages,
        };

        const command = new InvokeModelCommand({
            modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload),
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Track costs
        const inputTokens = responseBody.usage?.input_tokens || 0;
        const outputTokens = responseBody.usage?.output_tokens || 0;
        const messageCost =
            (inputTokens / 1000) * COST_PER_1K_INPUT_TOKENS +
            (outputTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS;

        totalCost += messageCost;

        res.json({
            solution: responseBody.content[0].text,
            usage: {
                cost: messageCost,
                totalCostToday: totalCost,
            },
        });
    } catch (error: any) {
        console.error('Debug error:', error);
        res.status(500).json({
            error: 'Failed to debug',
            details: error.message
        });
    }
});

// GET /api/bedrock/costs - Get cost statistics
router.get('/costs', (req, res) => {
    const avgCostPerMessage = totalCost / Math.max(1, totalTokensUsed / 1000);
    const estimatedMonthly = totalCost * 30; // Rough estimate based on today's usage

    res.json({
        today: {
            totalTokens: totalTokensUsed,
            totalCost: totalCost.toFixed(4),
            costPerMessage: avgCostPerMessage.toFixed(4),
        },
        estimates: {
            monthlyIfSameUsage: estimatedMonthly.toFixed(2),
            savingsVsClaudePro: (20 - estimatedMonthly).toFixed(2),
        },
        pricing: {
            inputTokensPer1k: COST_PER_1K_INPUT_TOKENS,
            outputTokensPer1k: COST_PER_1K_OUTPUT_TOKENS,
            model: 'Claude 3 Haiku (cheapest)',
        },
    });
});

export default router;
