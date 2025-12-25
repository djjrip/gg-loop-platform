// AWS SES Email Service for GG LOOP
// Uses Bedrock for AI-generated content

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

/**
 * Send an email via AWS SES
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SES_VERIFIED_EMAIL) {
    console.error("[Email] SES_VERIFIED_EMAIL not configured");
    return false;
  }

  try {
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_VERIFIED_EMAIL,
      Destination: {
        ToAddresses: [options.to]
      },
      Message: {
        Subject: { Data: options.subject },
        Body: {
          Html: { Data: options.htmlBody },
          Text: { Data: options.textBody || options.subject }
        }
      }
    }));
    console.log(`[Email] Sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

/**
 * Generate AI-powered welcome email content
 */
export async function generateWelcomeEmail(username: string): Promise<{ subject: string; body: string }> {
  const prompt = `
    Generate a welcome email for a new GG LOOP user named "${username}".
    
    GG LOOP is a gaming platform where players earn rewards for playing games.
    - Link Steam/Riot accounts
    - Play games, earn points
    - Redeem for gift cards, gaming gear, cash
    
    TONE:
    - Friendly, excited but not salesy
    - Brief and scannable
    - Gaming community vibe
    
    OUTPUT FORMAT (JSON):
    {
        "subject": "Welcome subject line here",
        "body": "HTML email body with <h1>, <p>, etc."
    }
    
    Make it SHORT. Max 100 words in the body.
    `;

  try {
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content?.[0]?.text?.trim();

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("[Email] AI generation failed:", error);
    // Fallback
    return {
      subject: `Welcome to GG LOOP, ${username}!`,
      body: `
                <h1>Welcome to GG LOOP!</h1>
                <p>Hey ${username},</p>
                <p>Thanks for joining! Here's how to get started:</p>
                <ol>
                    <li>Link your Steam or Riot account</li>
                    <li>Play games normally</li>
                    <li>Earn points and redeem for rewards</li>
                </ol>
                <p>Let's go!</p>
                <p>— The GG LOOP Team</p>
            `
    };
  }
}

/**
 * Send AI-powered welcome email to new user
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const content = await generateWelcomeEmail(username);

  return sendEmail({
    to: email,
    subject: content.subject,
    htmlBody: content.body
  });
}

export function getEmailStatus() {
  return {
    configured: !!process.env.SES_VERIFIED_EMAIL,
    sender: process.env.SES_VERIFIED_EMAIL || "Not configured"
  };
}
