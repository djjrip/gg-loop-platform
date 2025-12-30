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
/**
 * Send an email via AWS SES
 */
export async function sendEmail(options) {
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
    }
    catch (error) {
        console.error("[Email] Failed to send:", error);
        return false;
    }
}
/**
 * Generate AI-powered welcome email content
 */
export async function generateWelcomeEmail(username) {
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
    }
    catch (error) {
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
export async function sendWelcomeEmail(email, username) {
    const content = await generateWelcomeEmail(username);
    return sendEmail({
        to: email,
        subject: content.subject,
        htmlBody: content.body
    });
}
/**
 * Send instant alert to founder when someone redeems a reward
 */
export async function sendRedemptionAlert(redemptionData) {
    const FOUNDER_EMAIL = process.env.ADMIN_EMAIL || "jaysonquindao1@gmail.com";
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
      <h1 style="color: #d4895c;">🎁 NEW REWARD REDEMPTION!</h1>
      
      <div style="background: #1a1a1a; border-left: 4px solid #d4895c; padding: 15px; margin: 20px 0;">
        <strong style="font-size: 18px;">${redemptionData.rewardTitle}</strong>
        <br><br>
        <strong>Points:</strong> ${redemptionData.pointsSpent.toLocaleString()}<br>
        <strong>Value:</strong> $${(redemptionData.realValue / 100).toFixed(2)}<br>
        <strong>Category:</strong> ${redemptionData.category}
      </div>
      
      <h3 style="color: #d4895c;">👤 User Info</h3>
      <p>
        <strong>Email:</strong> ${redemptionData.userEmail}<br>
        <strong>User ID:</strong> ${redemptionData.userId}<br>
        <strong>Redemption ID:</strong> ${redemptionData.redemptionId}
      </p>
      
      ${redemptionData.shippingAddress ? `
      <h3 style="color: #d4895c;">📦 Shipping Address</h3>
      <p>
        ${redemptionData.shippingAddress}<br>
        ${redemptionData.shippingCity || ''}, ${redemptionData.shippingState || ''} ${redemptionData.shippingZip || ''}<br>
        ${redemptionData.shippingCountry || 'US'}
      </p>
      ` : '<p><em>No shipping address provided (digital reward)</em></p>'}
      
      <div style="background: #1a1a1a; padding: 15px; margin-top: 20px; border-radius: 8px;">
        <strong style="color: #d4895c;">⚡ Action Required:</strong><br>
        Please fulfill this redemption manually and update the status in the admin panel.
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Sent from GG LOOP Reward System • ${new Date().toISOString()}
      </p>
    </div>
  `;
    console.log(`[Email] Sending redemption alert to ${FOUNDER_EMAIL}...`);
    return sendEmail({
        to: FOUNDER_EMAIL,
        subject: `🎁 NEW REDEMPTION: ${redemptionData.rewardTitle} ($${(redemptionData.realValue / 100).toFixed(2)})`,
        htmlBody
    });
}
export function getEmailStatus() {
    return {
        configured: !!process.env.SES_VERIFIED_EMAIL,
        sender: process.env.SES_VERIFIED_EMAIL || "Not configured"
    };
}
