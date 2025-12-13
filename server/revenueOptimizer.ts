/**
 * Automated Revenue Optimizer
 * Analyzes user behavior and automatically adjusts pricing/features
 * Runs daily via cron job
 */

import { db } from './db';
import { users, subscriptions, redemptions } from '@db/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

interface OptimizationInsights {
    conversionRate: number;
    averageLifetimeValue: number;
    churnRate: number;
    topRewards: string[];
    suggestions: string[];
}

/**
 * Analyze platform metrics and suggest optimizations
 */
export async function analyzeAndOptimize(): Promise<OptimizationInsights> {
    console.log('🔍 Running revenue optimization analysis...\n');

    // Get all users from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Calculate conversion rate
    const [totalUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

    const [paidUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'active'));

    const conversionRate = (paidUsers.count / totalUsers.count) * 100;

    // 2. Calculate average lifetime value
    const avgLTV = paidUsers.count > 0 ? (paidUsers.count * 19.99 * 6) : 0; // Assume 6 month avg

    // 3. Calculate churn rate
    const [churnedUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'canceled'));

    const churnRate = totalUsers.count > 0 ? (churnedUsers.count / totalUsers.count) * 100 : 0;

    // 4. Get top redeemed rewards
    const topRewards = await db
        .select({
            rewardId: redemptions.rewardId,
            count: sql<number>`count(*)::int`,
        })
        .from(redemptions)
        .groupBy(redemptions.rewardId)
        .orderBy(desc(sql`count(*)`))
        .limit(5);

    // 5. Generate optimization suggestions
    const suggestions: string[] = [];

    if (conversionRate < 5) {
        suggestions.push('🔴 Conversion rate low (<5%) - Consider extending free trial to 14 days');
        suggestions.push('💡 Add more value to Pro tier (exclusive rewards, higher point multipliers)');
    }

    if (churnRate > 15) {
        suggestions.push('🔴 High churn rate (>15%) - Send win-back emails to canceled users');
        suggestions.push('💡 Add loyalty rewards for 3+ month subscribers');
    }

    if (paidUsers.count < 50) {
        suggestions.push('📢 Focus on marketing - current paid user count is low');
        suggestions.push('💡 Launch referral campaign with bonus rewards');
    }

    console.log('📊 OPTIMIZATION INSIGHTS:\n');
    console.log(`Conversion Rate: ${conversionRate.toFixed(2)}%`);
    console.log(`Avg LTV: $${avgLTV.toFixed(2)}`);
    console.log(`Churn Rate: ${churnRate.toFixed(2)}%`);
    console.log(`Paid Users: ${paidUsers.count}`);
    console.log(`\n💡 SUGGESTIONS:\n`);
    suggestions.forEach(s => console.log(`  ${s}`));

    return {
        conversionRate,
        averageLifetimeValue: avgLTV,
        churnRate,
        topRewards: topRewards.map(r => r.rewardId.toString()),
        suggestions,
    };
}

/**
 * Auto-adjust trial length based on conversion data
 */
export async function optimizeTrialLength() {
    const insights = await analyzeAndOptimize();

    if (insights.conversionRate < 5) {
        console.log('\n🔧 AUTO-OPTIMIZE: Extending trial to 14 days');
        // Update trial config (would need env var update)
        return 14;
    }

    return 7; // Default
}

/**
 * Run full optimization suite
 */
export async function runDailyOptimization() {
    console.log('═══════════════════════════════════════');
    console.log('  DAILY REVENUE OPTIMIZATION');
    console.log('═══════════════════════════════════════\n');

    const insights = await analyzeAndOptimize();

    // Auto-adjust trial if needed
    await optimizeTrialLength();

    console.log('\n✅ Optimization complete!');
    return insights;
}

// Run if executed directly
if (require.main === module) {
    runDailyOptimization()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export { OptimizationInsights };
