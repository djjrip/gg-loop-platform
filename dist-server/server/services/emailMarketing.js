/**
 * 📧 EMAIL MARKETING AUTOMATION
 *
 * Automated email sequences for revenue generation
 * - Welcome emails
 * - Redemption confirmations
 * - Subscription upsells
 * - Abandoned cart recovery
 */
import { db } from '../database';
import { users, subscriptions, rewards } from '@shared/schema';
import { eq, gte, sql } from 'drizzle-orm';
import { sendEmail } from './email';
/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userId) {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user || !user.email)
            return;
        await sendEmail({
            to: user.email,
            subject: 'Welcome to GG LOOP! 🎮',
            htmlBody: `
        <h2>Welcome to GG LOOP, ${user.username || 'Gamer'}! 👋</h2>
        <p>You're now part of the community where gaming meets real rewards.</p>
        <h3>🎯 Get Started:</h3>
        <ul>
          <li>Link your Riot account to start earning points</li>
          <li>Download the desktop app for verified gameplay</li>
          <li>Check out the rewards shop</li>
        </ul>
        <p><a href="https://ggloop.io/shop" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Rewards</a></p>
        <p>Happy gaming! 🚀</p>
      `
        });
    }
    catch (error) {
        console.error('Welcome email error:', error);
    }
}
/**
 * Send subscription upsell to free users
 */
export async function sendUpsellEmail(userId) {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user || !user.email)
            return;
        // Check if user has subscription
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        if (sub && sub.status === 'active')
            return; // Already subscribed
        // Check if user has points but no subscription
        if ((user.totalPoints || 0) > 0) {
            await sendEmail({
                to: user.email,
                subject: 'Unlock More Points with GG LOOP Pro! 🚀',
                htmlBody: `
          <h2>You're earning points! Time to level up? 🎮</h2>
          <p>Hi ${user.username || 'there'},</p>
          <p>You've earned <strong>${user.totalPoints} points</strong>! Upgrade to Pro to:</p>
          <ul>
            <li>Get <strong>10,000 points/month</strong> (3.3x more than Basic)</li>
            <li>Unlock better rewards faster</li>
            <li>Priority support</li>
            <li>Exclusive Pro badge</li>
          </ul>
          <p><a href="https://ggloop.io/subscription" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upgrade to Pro - $12/month</a></p>
          <p>7-day free trial, cancel anytime!</p>
        `
            });
        }
    }
    catch (error) {
        console.error('Upsell email error:', error);
    }
}
/**
 * Send abandoned cart recovery
 */
export async function sendAbandonedCartEmail(userId, rewardId) {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
        if (!user || !user.email || !reward)
            return;
        await sendEmail({
            to: user.email,
            subject: `Don't forget: ${reward.title} is waiting! 🎁`,
            htmlBody: `
        <h2>Your reward is still available! 🎁</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>You were looking at <strong>${reward.title}</strong> (${reward.pointsCost} points).</p>
        <p>You have <strong>${user.totalPoints || 0} points</strong> - ${user.totalPoints >= reward.pointsCost ? 'enough to redeem!' : `just ${reward.pointsCost - (user.totalPoints || 0)} more points needed!`}</p>
        <p><a href="https://ggloop.io/shop" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Your Redemption</a></p>
      `
        });
    }
    catch (error) {
        console.error('Abandoned cart email error:', error);
    }
}
/**
 * Send redemption confirmation
 */
export async function sendRedemptionConfirmation(userId, rewardId) {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
        if (!user || !user.email || !reward)
            return;
        await sendEmail({
            to: user.email,
            subject: 'Redemption Confirmed! 🎉',
            htmlBody: `
        <h2>Your Redemption is Being Processed! 🎁</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>We received your redemption for <strong>${reward.title}</strong>.</p>
        <p><strong>Points spent:</strong> ${reward.pointsCost}</p>
        <p><strong>Your balance:</strong> ${(user.totalPoints || 0) - reward.pointsCost} points</p>
        <p>We'll fulfill your reward within 24-48 hours. You'll get an email when it's ready!</p>
        <p>Thanks for gaming with GG LOOP! 🚀</p>
      `
        });
    }
    catch (error) {
        console.error('Redemption confirmation email error:', error);
    }
}
/**
 * Run email marketing automation
 */
export async function runEmailMarketing() {
    console.log('📧 Running email marketing automation...');
    try {
        // 1. Welcome emails for new users (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const newUsers = await db
            .select()
            .from(users)
            .where(gte(users.createdAt, oneDayAgo))
            .limit(50);
        for (const user of newUsers) {
            await sendWelcomeEmail(user.id);
        }
        // 2. Upsell emails for free users with points
        const freeUsersWithPoints = await db
            .select()
            .from(users)
            .where(sql `${users.totalPoints} > 0`)
            .limit(50);
        for (const user of freeUsersWithPoints) {
            const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);
            if (!sub || sub.status !== 'active') {
                await sendUpsellEmail(user.id);
            }
        }
        console.log(`✅ Email marketing complete: ${newUsers.length} welcome emails, ${freeUsersWithPoints.length} upsell opportunities`);
    }
    catch (error) {
        console.error('Email marketing error:', error);
    }
}
