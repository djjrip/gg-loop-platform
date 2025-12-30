/**
 * 📊 DAILY AUTOMATED REPORTS
 *
 * Sends daily revenue and business health reports to admin
 * Runs automatically via cron
 */
import { db } from '../database';
import { subscriptions, users, userRewards, rewards } from '@shared/schema';
import { eq, and, gte, sql, count } from 'drizzle-orm';
import { sendEmail } from '../services/email';
/**
 * Generate daily business report
 */
export async function generateDailyReport() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Active subscriptions and MRR
    const activeSubs = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active'));
    const tierPricing = {
        'basic': 5,
        'pro': 12,
        'elite': 25
    };
    const mrr = activeSubs.reduce((sum, sub) => sum + (tierPricing[sub.tier] || 0), 0);
    // New subscriptions today
    const newSubs = await db
        .select({ count: count() })
        .from(subscriptions)
        .where(and(gte(subscriptions.createdAt, today), eq(subscriptions.status, 'active')));
    // New users today
    const newUsersCount = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, today));
    // Redemptions today
    const todayRedemptions = await db
        .select({
        count: count(),
        value: sql `SUM(${rewards.realValue}) / 100.0`
    })
        .from(userRewards)
        .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
        .where(and(gte(userRewards.redeemedAt, today), eq(userRewards.status, 'fulfilled')));
    // Pending redemptions
    const pending = await db
        .select({
        count: count(),
        value: sql `SUM(${rewards.realValue}) / 100.0`
    })
        .from(userRewards)
        .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
        .where(eq(userRewards.status, 'pending'));
    // Total users
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const conversionRate = (totalUsers?.count || 0) > 0
        ? ((activeSubs.length / (totalUsers?.count || 1)) * 100)
        : 0;
    return {
        date: today.toISOString().split('T')[0],
        mrr,
        newSubscriptions: newSubs[0]?.count || 0,
        newUsers: newUsersCount[0]?.count || 0,
        redemptions: todayRedemptions[0]?.count || 0,
        redemptionValue: Number((todayRedemptions[0]?.value || 0).toFixed(2)),
        pendingRedemptions: pending[0]?.count || 0,
        pendingValue: Number((pending[0]?.value || 0).toFixed(2)),
        totalUsers: totalUsers?.count || 0,
        activeSubscriptions: activeSubs.length,
        conversionRate: Number(conversionRate.toFixed(2))
    };
}
/**
 * Send daily report email to admin
 */
export async function sendDailyReport() {
    try {
        const report = await generateDailyReport();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['jaysonquindao@ggloop.io'];
        const htmlBody = `
      <h2>📊 GG LOOP Daily Report - ${report.date}</h2>
      
      <h3>💰 Revenue</h3>
      <ul>
        <li><strong>MRR:</strong> $${report.mrr}/month</li>
        <li><strong>Today's Redemptions:</strong> $${report.redemptionValue} (${report.redemptions} redemptions)</li>
        <li><strong>Pending Value:</strong> $${report.pendingValue} (${report.pendingRedemptions} pending)</li>
      </ul>

      <h3>👥 Users</h3>
      <ul>
        <li><strong>Total Users:</strong> ${report.totalUsers}</li>
        <li><strong>New Users Today:</strong> ${report.newUsers}</li>
        <li><strong>Active Subscriptions:</strong> ${report.activeSubscriptions}</li>
        <li><strong>New Subscriptions Today:</strong> ${report.newSubscriptions}</li>
        <li><strong>Conversion Rate:</strong> ${report.conversionRate}%</li>
      </ul>

      <h3>🎁 Redemptions</h3>
      <ul>
        <li><strong>Fulfilled Today:</strong> ${report.redemptions}</li>
        <li><strong>Pending:</strong> ${report.pendingRedemptions} ($${report.pendingValue})</li>
      </ul>

      <p><a href="https://ggloop.io/admin" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
    `;
        for (const email of adminEmails) {
            await sendEmail({
                to: email,
                subject: `GG LOOP Daily Report - ${report.date}`,
                htmlBody
            }).catch(err => console.error(`Failed to send report to ${email}:`, err));
        }
        console.log(`✅ Daily report sent to ${adminEmails.length} admin(s)`);
    }
    catch (error) {
        console.error('Daily report error:', error);
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    sendDailyReport()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
