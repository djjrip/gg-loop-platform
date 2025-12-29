import { TwitterApi } from 'twitter-api-v2';
import { db } from "../db";
import { desc } from "drizzle-orm";

interface TwitterMention {
    id: string;
    authorId: string;
    authorUsername: string;
    text: string;
    createdAt: Date;
    category: 'support' | 'sales' | 'feedback' | 'spam' | 'investor' | 'general';
    priority: 'urgent' | 'high' | 'normal' | 'low';
    status: 'new' | 'responded' | 'ignored';
}

interface EngagementMetrics {
    totalMentions: number;
    unresponded: number;
    avgResponseTime: number;
    topEngagers: Array<{ username: string; count: number }>;
    sentimentBreakdown: {
        positive: number;
        neutral: number;
        negative: number;
    };
}

/**
 * Twitter Engagement Monitor
 * Tracks mentions, replies, and engagement for @ggloopllc
 */
export class TwitterMonitor {
    private client: TwitterApi | null = null;
    private lastCheckTime: Date;

    constructor() {
        this.lastCheckTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Start from 24h ago
    }

    private getClient(): TwitterApi {
        if (this.client) return this.client;

        if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
            throw new Error("Twitter API credentials not configured");
        }

        this.client = new TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_KEY,
            appSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        return this.client;
    }

    /**
     * Categorize mention based on content
     */
    private categorizeMention(text: string): TwitterMention['category'] {
        const lower = text.toLowerCase();

        // Support keywords
        if (lower.match(/(help|bug|error|broken|not work|issue|problem)/)) {
            return 'support';
        }

        // Sales/Business keywords
        if (lower.match(/(demo|pricing|white.?label|partner|business|license)/)) {
            return 'sales';
        }

        // Investment keywords
        if (lower.match(/(invest|funding|vc|raise|seed|angel)/)) {
            return 'investor';
        }

        // Feedback keywords
        if (lower.match(/(feature|suggest|idea|improve|would be cool)/)) {
            return 'feedback';
        }

        // Spam detection
        if (lower.match(/(crypto|nft|airdrop|giveaway|win \$|click here|dm me)/)) {
            return 'spam';
        }

        return 'general';
    }

    /**
     * Determine priority level
     */
    private determinePriority(category: TwitterMention['category'], text: string): TwitterMention['priority'] {
        // Urgent: payment issues, broken features
        if (text.toLowerCase().match(/(payment fail|can't subscribe|charged twice|not working)/)) {
            return 'urgent';
        }

        // High: sales, investors, support
        if (category === 'sales' || category === 'investor' || category === 'support') {
            return 'high';
        }

        // Low: spam
        if (category === 'spam') {
            return 'low';
        }

        return 'normal';
    }

    /**
     * Fetch recent mentions of @ggloopllc
     */
    async fetchMentions(): Promise<TwitterMention[]> {
        try {
            const client = this.getClient();
            const mentions = await client.v2.search(`@ggloopllc`, {
                'max_results': 100,
                'tweet.fields': ['created_at', 'author_id'],
                'user.fields': ['username'],
                'start_time': this.lastCheckTime.toISOString(),
            });

            const results: TwitterMention[] = [];

            for await (const tweet of mentions) {
                const mention: TwitterMention = {
                    id: tweet.id,
                    authorId: tweet.author_id || 'unknown',
                    authorUsername: (tweet.includes?.users?.find(u => u.id === tweet.author_id))?.username || 'unknown',
                    text: tweet.text,
                    createdAt: new Date(tweet.created_at || Date.now()),
                    category: this.categorizeMention(tweet.text),
                    priority: this.determinePriority(this.categorizeMention(tweet.text), tweet.text),
                    status: 'new',
                };

                results.push(mention);
            }

            this.lastCheckTime = new Date();
            return results;

        } catch (error: any) {
            console.error('[Twitter Monitor] Failed to fetch mentions:', error);
            return [];
        }
    }

    /**
     * Get engagement metrics for dashboard
     */
    async getEngagementMetrics(): Promise<EngagementMetrics> {
        // This would query from a database table tracking all mentions
        // For now, returning mock structure
        return {
            totalMentions: 0,
            unresponded: 0,
            avgResponseTime: 0,
            topEngagers: [],
            sentimentBreakdown: {
                positive: 0,
                neutral: 0,
                negative: 0,
            },
        };
    }

    /**
     * Check for new mentions and log them
     */
    async monitorLoop() {
        console.log('[Twitter Monitor] Checking for new mentions...');

        const mentions = await this.fetchMentions();

        if (mentions.length > 0) {
            console.log(`[Twitter Monitor] Found ${mentions.length} new mentions`);

            // Log urgent/high priority mentions
            const urgent = mentions.filter(m => m.priority === 'urgent' || m.priority === 'high');
            if (urgent.length > 0) {
                console.log(`⚠️ [Twitter Monitor] ${urgent.length} HIGH PRIORITY mentions:`);
                urgent.forEach(m => {
                    console.log(`  - @${m.authorUsername}: "${m.text.slice(0, 50)}..." [${m.category}]`);
                });
            }
        }

        return mentions;
    }
}

// Export singleton instance
export const twitterMonitor = new TwitterMonitor();

// Auto-start monitoring if credentials are available
export function startTwitterMonitoring() {
    if (!process.env.TWITTER_CONSUMER_KEY) {
        console.log('[Twitter Monitor] Skipped - No credentials configured');
        return;
    }

    console.log('[Twitter Monitor] Starting engagement monitoring...');

    // Check every 5 minutes
    setInterval(async () => {
        await twitterMonitor.monitorLoop();
    }, 5 * 60 * 1000);

    // Run immediately
    twitterMonitor.monitorLoop();
}
