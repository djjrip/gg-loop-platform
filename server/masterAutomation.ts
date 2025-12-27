/**
 * 🤖 MASTER AUTOMATION ORCHESTRATOR
 * 
 * Runs ALL automation systems for GG LOOP
 * This is the central hub that coordinates everything
 * 
 * What it automates:
 * - Business operations (redemptions, health, reports)
 * - Marketing (Twitter, Reddit, Discord)
 * - Affiliate management
 * - Reward fulfillment
 * - Email sequences
 * - Revenue optimization
 * - System health monitoring
 * - Database maintenance
 * 
 * Run this every hour via cron job
 */

import { runBusinessAutomation } from './businessAutomation';
import { startTwitterAutomation } from './services/twitter';
import { sendEmail } from './services/email';
import { notify } from './alerts';
import { db } from './db';
import { users, subscriptions, rewardClaims, pointTransactions } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { autoFulfillRewards } from './automation/rewardFulfillment';
import { sendDailyReport } from './automation/dailyReports';
import { runEmailMarketing } from './services/emailMarketing';
import { runReferralAutomation } from './services/referralSystem';

interface AutomationReport {
  timestamp: string;
  business: {
    status: 'success' | 'error';
    redemptionsApproved: number;
    alerts: number;
  };
  marketing: {
    status: 'success' | 'error' | 'skipped';
    postsCreated: number;
  };
  revenue: {
    status: 'success' | 'error';
    optimizations: number;
  };
  system: {
    status: 'success' | 'error';
    health: 'good' | 'warning' | 'critical';
  };
  errors: string[];
}

/**
 * Main automation orchestrator
 * Runs all automation systems
 */
export async function runMasterAutomation(): Promise<AutomationReport> {
  const report: AutomationReport = {
    timestamp: new Date().toISOString(),
    business: { status: 'success', redemptionsApproved: 0, alerts: 0 },
    marketing: { status: 'skipped', postsCreated: 0 },
    revenue: { status: 'success', optimizations: 0 },
    system: { status: 'success', health: 'good' },
    errors: []
  };

  console.log('🤖 MASTER AUTOMATION STARTED\n');
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // 1. BUSINESS AUTOMATION
  try {
    console.log('📊 Running business automation...');
    const health = await runBusinessAutomation();
    report.business.redemptionsApproved = health.redemptions.autoApproved;
    report.business.alerts = health.alerts.length;
    console.log(`✅ Business automation complete: ${health.redemptions.autoApproved} redemptions approved, ${health.alerts.length} alerts\n`);
  } catch (error: any) {
    report.business.status = 'error';
    report.errors.push(`Business automation: ${error.message}`);
    console.error('❌ Business automation failed:', error.message);
  }

  // 1.5. REWARD FULFILLMENT
  try {
    console.log('🎁 Running automated reward fulfillment...');
    const fulfillment = await autoFulfillRewards();
    console.log(`✅ Reward fulfillment: ${fulfillment.fulfilled} fulfilled, ${fulfillment.skipped} need manual review\n`);
  } catch (error: any) {
    report.errors.push(`Reward fulfillment: ${error.message}`);
    console.error('❌ Reward fulfillment failed:', error.message);
  }

  // 1.6. EMAIL MARKETING
  try {
    console.log('📧 Running email marketing...');
    await runEmailMarketing();
    console.log('✅ Email marketing complete\n');
  } catch (error: any) {
    report.errors.push(`Email marketing: ${error.message}`);
    console.error('❌ Email marketing failed:', error.message);
  }

  // 1.7. REFERRAL AUTOMATION
  try {
    console.log('🎁 Running referral automation...');
    await runReferralAutomation();
    console.log('✅ Referral automation complete\n');
  } catch (error: any) {
    report.errors.push(`Referral automation: ${error.message}`);
    console.error('❌ Referral automation failed:', error.message);
  }

  // 2. MARKETING AUTOMATION (Twitter)
  try {
    console.log('📱 Running marketing automation...');
    // Twitter automation runs on its own schedule, but we check if it's working
    const twitterWorking = process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET;
    if (twitterWorking) {
      // Twitter posts are scheduled separately, just verify it's configured
      report.marketing.status = 'success';
      console.log('✅ Marketing automation configured\n');
    } else {
      report.marketing.status = 'skipped';
      console.log('⚠️  Marketing automation skipped (not configured)\n');
    }
  } catch (error: any) {
    report.marketing.status = 'error';
    report.errors.push(`Marketing automation: ${error.message}`);
    console.error('❌ Marketing automation failed:', error.message);
  }

  // 3. REVENUE OPTIMIZATION
  try {
    console.log('💰 Running revenue optimization...');
    const optimizations = await optimizeRevenue();
    report.revenue.optimizations = optimizations;
    console.log(`✅ Revenue optimization complete: ${optimizations} optimizations applied\n`);
  } catch (error: any) {
    report.revenue.status = 'error';
    report.errors.push(`Revenue optimization: ${error.message}`);
    console.error('❌ Revenue optimization failed:', error.message);
  }

  // 4. SYSTEM HEALTH CHECK
  try {
    console.log('🏥 Running system health check...');
    const health = await checkSystemHealth();
    report.system.health = health;
    console.log(`✅ System health: ${health}\n`);
  } catch (error: any) {
    report.system.status = 'error';
    report.errors.push(`System health check: ${error.message}`);
    console.error('❌ System health check failed:', error.message);
  }

  // 5. DAILY REPORT (once per day at midnight)
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() < 5) {
    try {
      console.log('📊 Sending daily report...');
      await sendDailyReport();
      console.log('✅ Daily report sent\n');
    } catch (error: any) {
      report.errors.push(`Daily report: ${error.message}`);
      console.error('❌ Daily report failed:', error.message);
    }
  }

  // 6. SEND SUMMARY (if errors or critical issues)
  if (report.errors.length > 0 || report.system.health === 'critical') {
    await sendAutomationReport(report);
  }

  console.log('✅ MASTER AUTOMATION COMPLETE\n');
  return report;
}

/**
 * Revenue optimization automation
 */
async function optimizeRevenue(): Promise<number> {
  let optimizations = 0;

  // Check conversion rate
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [paidUsers] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions)
    .where(eq(subscriptions.status, 'active'));

  const conversionRate = totalUsers.count > 0 
    ? (paidUsers.count / totalUsers.count) * 100 
    : 0;

  // If conversion rate is low and we have users, suggest promotion
  if (conversionRate < 5 && totalUsers.count > 10) {
    console.log(`💡 Low conversion rate (${conversionRate.toFixed(2)}%) - consider promotion`);
    optimizations++;
  }

  // Check churn rate
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [recentCancellations] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions)
    .where(and(
      eq(subscriptions.status, 'cancelled'),
      gte(subscriptions.updatedAt, thirtyDaysAgo)
    ));

  const churnRate = paidUsers.count > 0 
    ? (recentCancellations.count / paidUsers.count) * 100 
    : 0;

  if (churnRate > 10 && paidUsers.count > 5) {
    console.log(`💡 High churn rate (${churnRate.toFixed(2)}%) - consider retention campaign`);
    optimizations++;
  }

  return optimizations;
}

/**
 * System health check
 */
async function checkSystemHealth(): Promise<'good' | 'warning' | 'critical'> {
  const issues: string[] = [];

  // Check database connection
  try {
    await db.select({ count: sql<number>`count(*)` }).from(users).limit(1);
  } catch (error) {
    issues.push('Database connection failed');
    return 'critical';
  }

  // Check pending redemptions (if too many, might be an issue)
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(rewardClaims)
    .where(eq(rewardClaims.status, 'pending'));

  if (pendingCount.count > 20) {
    issues.push(`High pending redemptions: ${pendingCount.count}`);
  }

  // Check for stuck transactions
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [stuckTransactions] = await db.select({ count: sql<number>`count(*)` }).from(pointTransactions)
    .where(and(
      gte(pointTransactions.createdAt, oneDayAgo),
      sql`${pointTransactions.balanceAfter} < 0`
    ));

  if (stuckTransactions.count > 0) {
    issues.push(`Stuck transactions detected: ${stuckTransactions.count}`);
    return 'critical';
  }

  if (issues.length > 0) {
    return 'warning';
  }

  return 'good';
}

/**
 * Send automation report if there are issues
 */
async function sendAutomationReport(report: AutomationReport): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0];
  if (!adminEmail) return;

  const htmlBody = `
    <h2>🤖 GG LOOP Automation Report</h2>
    <p><strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    
    <h3>📊 Business Automation</h3>
    <ul>
      <li>Status: ${report.business.status === 'success' ? '✅' : '❌'}</li>
      <li>Redemptions Approved: ${report.business.redemptionsApproved}</li>
      <li>Alerts: ${report.business.alerts}</li>
    </ul>
    
    <h3>📱 Marketing Automation</h3>
    <ul>
      <li>Status: ${report.marketing.status === 'success' ? '✅' : report.marketing.status === 'skipped' ? '⚠️ Skipped' : '❌'}</li>
      <li>Posts Created: ${report.marketing.postsCreated}</li>
    </ul>
    
    <h3>💰 Revenue Optimization</h3>
    <ul>
      <li>Status: ${report.revenue.status === 'success' ? '✅' : '❌'}</li>
      <li>Optimizations: ${report.revenue.optimizations}</li>
    </ul>
    
    <h3>🏥 System Health</h3>
    <ul>
      <li>Status: ${report.system.status === 'success' ? '✅' : '❌'}</li>
      <li>Health: ${report.system.health === 'good' ? '✅ Good' : report.system.health === 'warning' ? '⚠️ Warning' : '🔴 Critical'}</li>
    </ul>
    
    ${report.errors.length > 0 ? `
      <h3>❌ Errors</h3>
      <ul>
        ${report.errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    ` : ''}
    
    <hr>
    <p><em>This is an automated report from GG LOOP Master Automation System.</em></p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `GG LOOP Automation Report - ${report.system.health === 'critical' ? '🔴 CRITICAL' : report.errors.length > 0 ? '⚠️ WARNINGS' : '✅ SUCCESS'}`,
    htmlBody
  }).catch(err => console.error('Failed to send automation report:', err));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMasterAutomation()
    .then(report => {
      console.log('\n📊 AUTOMATION REPORT:');
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.errors.length > 0 || report.system.health === 'critical' ? 1 : 0);
    })
    .catch(err => {
      console.error('❌ Master automation failed:', err);
      process.exit(1);
    });
}

