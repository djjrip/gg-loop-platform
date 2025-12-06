/**
 * Marketing Automation Master Controller
 * 
 * Orchestrates all marketing activities:
 * - Social media posting
 * - Content generation
 * - Analytics tracking
 * - Growth monitoring
 */

import { marketingAgent } from './ai-marketing-agent';
import { redditBot } from './reddit-bot';
import { twitterBot } from './twitter-bot';
import { scheduleJob } from 'node-schedule';
import { db } from '../server/db';
import { users, rewards, userRewards } from '../shared/schema';
import { sql } from 'drizzle-orm';

class MarketingAutomation {
    private isRunning: boolean = false;

    constructor() {
        console.log('🚀 Marketing Automation System Initializing...');
    }

    /**
     * Start all marketing automation
     */
    public async start() {
        if (this.isRunning) {
            console.log('⚠️  Marketing automation already running');
            return;
        }

        this.isRunning = true;
        console.log('✅ Marketing Automation Started');

        // Schedule daily tasks
        this.scheduleDailyTasks();

        // Schedule weekly tasks
        this.scheduleWeeklyTasks();

        // Monitor for milestone events
        this.monitorMilestones();

        // Run initial tasks
        await this.runInitialTasks();
    }

    /**
     * Schedule daily marketing tasks
     */
    private scheduleDailyTasks() {
        // Daily Twitter post at 9 AM
        scheduleJob('0 9 * * *', async () => {
            console.log('📱 Running daily Twitter post...');
            await twitterBot.runDailySchedule();
        });

        // Daily metrics update at 8 AM
        scheduleJob('0 8 * * *', async () => {
            console.log('📊 Updating marketing metrics...');
            await marketingAgent.runNow();
        });

        console.log('✅ Daily tasks scheduled');
    }

    /**
     * Schedule weekly marketing tasks
     */
    private scheduleWeeklyTasks() {
        // Reddit post on Monday at 10 AM
        scheduleJob('0 10 * * 1', async () => {
            console.log('📝 Running weekly Reddit posts...');
            await redditBot.runSchedule();
        });

        // Weekly report on Monday at 8 AM
        scheduleJob('0 8 * * 1', async () => {
            console.log('📊 Generating weekly report...');
            await this.generateWeeklyReport();
        });

        console.log('✅ Weekly tasks scheduled');
    }

    /**
     * Monitor for milestone events
     */
    private monitorMilestones() {
        // Check every hour for milestones
        scheduleJob('0 * * * *', async () => {
            await this.checkMilestones();
        });

        console.log('✅ Milestone monitoring active');
    }

    /**
     * Check for user/revenue milestones
     */
    private async checkMilestones() {
        try {
            // Get total users
            const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
            const totalUsers = Number(totalUsersResult[0]?.count || 0);

            // Get total redemptions
            const totalRedemptionsResult = await db.select({ count: sql<number>`count(*)` }).from(userRewards);
            const totalRedemptions = Number(totalRedemptionsResult[0]?.count || 0);

            // Check user milestones
            const userMilestones = [10, 25, 50, 100, 250, 500, 1000];
            if (userMilestones.includes(totalUsers)) {
                console.log(`🎉 Milestone reached: ${totalUsers} users!`);
                await twitterBot.postMilestone(totalUsers);
            }

            // Check redemption milestones
            if (totalRedemptions > 0 && totalRedemptions % 10 === 0) {
                console.log(`🎁 Milestone: ${totalRedemptions} rewards redeemed!`);
            }
        } catch (error) {
            console.error('❌ Error checking milestones:', error);
        }
    }

    /**
     * Generate weekly marketing report
     */
    private async generateWeeklyReport() {
        try {
            const report = await this.getMarketingMetrics();
            console.log('\n📊 WEEKLY MARKETING REPORT\n');
            console.log(report);

            // Save to file
            const fs = await import('fs/promises');
            const date = new Date().toISOString().split('T')[0];
            await fs.mkdir('marketing/reports', { recursive: true });
            await fs.writeFile(`marketing/reports/weekly-${date}.md`, report);

            console.log(`✅ Report saved to marketing/reports/weekly-${date}.md`);
        } catch (error) {
            console.error('❌ Error generating report:', error);
        }
    }

    /**
     * Get current marketing metrics
     */
    private async getMarketingMetrics(): Promise<string> {
        try {
            // Get metrics from database
            const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
            const totalUsers = Number(totalUsersResult[0]?.count || 0);

            const activeUsersResult = await db.select({ count: sql<number>`count(*)` })
                .from(users)
                .where(sql`last_login > NOW() - INTERVAL '7 days'`);
            const activeUsers = Number(activeUsersResult[0]?.count || 0);

            const totalRedemptionsResult = await db.select({ count: sql<number>`count(*)` }).from(userRewards);
            const totalRedemptions = Number(totalRedemptionsResult[0]?.count || 0);

            const report = `
# Weekly Marketing Report - ${new Date().toLocaleDateString()}

## Key Metrics
- **Total Users:** ${totalUsers}
- **Active Users (7 days):** ${activeUsers}
- **Engagement Rate:** ${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
- **Total Redemptions:** ${totalRedemptions}

## Growth Analysis
${this.getGrowthAnalysis(totalUsers)}

## This Week's Activities
- ✅ Daily Twitter posts
- ✅ Reddit community engagement
- ✅ Metrics tracking
- ✅ User milestone celebrations

## Next Week's Focus
${this.getNextWeekFocus(totalUsers)}

## Action Items
${this.getActionItems(totalUsers, activeUsers)}

---
Generated by AI Marketing Agent
`;

            return report;
        } catch (error) {
            console.error('❌ Error getting metrics:', error);
            return 'Error generating report';
        }
    }

    /**
     * Get growth analysis
     */
    private getGrowthAnalysis(totalUsers: number): string {
        if (totalUsers === 0) {
            return '- Just starting - focus on first 10 users through personal network';
        } else if (totalUsers < 50) {
            return `- Early stage (${totalUsers} users)\n- Focus on organic growth through Reddit/Discord\n- Target: 50 users by end of month`;
        } else if (totalUsers < 100) {
            return `- Growing momentum (${totalUsers} users)\n- Ready for influencer outreach\n- Target: 100 users by end of month`;
        } else {
            return `- Scaling phase (${totalUsers} users)\n- Consider paid advertising\n- Target: 2x growth next month`;
        }
    }

    /**
     * Get next week's focus
     */
    private getNextWeekFocus(totalUsers: number): string {
        if (totalUsers < 10) {
            return '1. Invite 10 friends personally\n2. Post on 3 Reddit communities\n3. Create Twitter account';
        } else if (totalUsers < 50) {
            return '1. Daily Twitter engagement\n2. Post on 5 new subreddits\n3. Join 10 Discord communities';
        } else if (totalUsers < 100) {
            return '1. Reach out to 10 micro-influencers\n2. Create demo video\n3. Start email newsletter';
        } else {
            return '1. Launch paid ad campaigns\n2. Partner with streamers\n3. Create content series';
        }
    }

    /**
     * Get action items
     */
    private getActionItems(totalUsers: number, activeUsers: number): string {
        const items = [];

        if (totalUsers === 0) {
            items.push('- [ ] Get first 10 users (friends/family)');
            items.push('- [ ] Create social media accounts');
            items.push('- [ ] Post on Reddit');
        }

        if (activeUsers / Math.max(totalUsers, 1) < 0.5) {
            items.push('- [ ] Improve user engagement (currently low)');
            items.push('- [ ] Add more rewards to shop');
            items.push('- [ ] Send re-engagement emails');
        }

        if (totalUsers > 0 && totalUsers % 10 === 0) {
            items.push(`- [ ] Celebrate ${totalUsers} user milestone on social media`);
        }

        return items.length > 0 ? items.join('\n') : '- [ ] Continue current strategy';
    }

    /**
     * Run initial marketing tasks
     */
    private async runInitialTasks() {
        console.log('\n🚀 Running initial marketing tasks...\n');

        // Generate first report
        await this.generateWeeklyReport();

        // Run marketing agent
        await marketingAgent.runNow();

        console.log('\n✅ Initial tasks complete\n');
    }

    /**
     * Stop all automation
     */
    public stop() {
        this.isRunning = false;
        console.log('🛑 Marketing automation stopped');
    }

    /**
     * Get status
     */
    public getStatus() {
        return {
            running: this.isRunning,
            services: {
                aiAgent: 'Active',
                redditBot: 'Scheduled',
                twitterBot: 'Scheduled',
                analytics: 'Active'
            }
        };
    }
}

// Export singleton
export const marketingAutomation = new MarketingAutomation();

// If running directly
if (require.main === module) {
    console.log('🤖 Starting GG Loop Marketing Automation...\n');

    marketingAutomation.start().then(() => {
        console.log('\n✅ Marketing automation is now running');
        console.log('📊 Check marketing/reports/ for weekly reports');
        console.log('📱 Social media posts will be automated');
        console.log('\nPress Ctrl+C to stop\n');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down marketing automation...');
        marketingAutomation.stop();
        process.exit(0);
    });
}
