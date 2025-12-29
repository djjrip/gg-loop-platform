/**
 * AFFILIATE REVENUE SYSTEM
 * Automated commission tracking and procurement
 * 
 * Revenue Sources:
 * 1. Amazon Associates - Physical gaming products (3-4% commission)
 * 2. Impact.com - Gift cards, game keys, digital products (1-10% commission)
 * 
 * Innovation: Every redemption = affiliate commission = pure profit margin expansion
 */

import { db } from '../server/db';
import { rewards, userRewards, sql } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Affiliate Network Configuration
const AFFILIATE_NETWORKS = {
    amazon: {
        name: 'Amazon Associates',
        tagId: process.env.AMAZON_ASSOCIATE_TAG || 'ggloop-20', // Default tag
        baseUrl: 'https://www.amazon.com',
        commission: 0.03, // 3% average
        categories: ['electronics', 'gaming_gear', 'peripherals']
    },
    impact: {
        name: 'Impact.com',
        accountId: process.env.IMPACT_ACCOUNT_ID,
        clickId: '{{CLICK_ID}}', // Dynamic per transaction
        commission: 0.05, // 5% average (varies by merchant)
        categories: ['gift_cards', 'game_keys', 'digital']
    }
};

interface AffiliateTransaction {
    redemptionId: string;
    network: 'amazon' | 'impact';
    merchantName: string;
    productCost: number;
    estimatedCommission: number;
    affiliateUrl: string;
    purchaseDate: Date;
    commissionStatus: 'pending' | 'approved' | 'paid';
}

/**
 * Generate affiliate link for a reward
 */
export function generateAffiliateLink(reward: any): { url: string; network: string; estimatedCommission: number } {
    // Physical products → Amazon Associates
    if (reward.category === 'gaming_gear' || reward.category === 'electronics') {
        const amazonTag = AFFILIATE_NETWORKS.amazon.tagId;
        const url = reward.affiliateUrl
            ? `${reward.affiliateUrl}?tag=${amazonTag}`
            : `https://www.amazon.com/s?k=${encodeURIComponent(reward.title)}&tag=${amazonTag}`;

        return {
            url,
            network: 'amazon',
            estimatedCommission: reward.realValue * 0.03 // 3% commission
        };
    }

    // Gift cards, game keys → Impact.com
    if (reward.affiliateUrl && reward.affiliateUrl.includes('impact.com')) {
        return {
            url: reward.affiliateUrl,
            network: 'impact',
            estimatedCommission: reward.realValue * 0.05 // 5% average
        };
    }

    // Default: Use existing affiliate URL or mark for manual procurement
    return {
        url: reward.affiliateUrl || '',
        network: 'impact',
        estimatedCommission: reward.realValue * 0.02 // Conservative 2%
    };
}

/**
 * Track affiliate transaction
 */
export async function trackAffiliateTransaction(
    redemptionId: string,
    rewardId: string,
    affiliateData: {
        network: string;
        url: string;
        cost: number;
        estimatedCommission: number;
    }
) {
    // Log to database (extend user_rewards table or create affiliate_transactions table)
    console.log(`[AFFILIATE] Tracked transaction:`, {
        redemptionId,
        network: affiliateData.network,
        cost: affiliateData.cost,
        commission: affiliateData.estimatedCommission,
        url: affiliateData.url
    });

    // TODO: Store in affiliate_transactions table when schema is extended
    // For now, store in fulfillment_data jsonb column
    await db.update(userRewards)
        .set({
            fulfillmentData: sql`
        COALESCE(fulfillment_data, '{}'::jsonb) || 
        ${JSON.stringify({
                affiliateNetwork: affiliateData.network,
                affiliateUrl: affiliateData.url,
                procurementCost: affiliateData.cost,
                estimatedCommission: affiliateData.estimatedCommission,
                trackedAt: new Date().toISOString()
            })}::jsonb
      `
        })
        .where(eq(userRewards.id, redemptionId));
}

/**
 * Calculate revenue metrics
 */
export async function getAffiliateRevenue(startDate: Date, endDate: Date) {
    const redemptions = await db
        .select()
        .from(userRewards)
        .where(sql`
      ${userRewards.redeemedAt} >= ${startDate} 
      AND ${userRewards.redeemedAt} <= ${endDate}
      AND ${userRewards.status} = 'fulfilled'
    `);

    let totalCommission = 0;
    let totalCost = 0;
    let amazonCommission = 0;
    let impactCommission = 0;

    for (const redemption of redemptions) {
        const data = redemption.fulfillmentData as any;
        if (data?.estimatedCommission) {
            totalCommission += data.estimatedCommission;
            totalCost += data.procurementCost || 0;

            if (data.affiliateNetwork === 'amazon') {
                amazonCommission += data.estimatedCommission;
            } else {
                impactCommission += data.estimatedCommission;
            }
        }
    }

    return {
        totalRedemptions: redemptions.length,
        totalCost,
        totalCommission,
        amazonCommission,
        impactCommission,
        averageCommissionPerRedemption: redemptions.length > 0 ? totalCommission / redemptions.length : 0,
        profitMargin: totalCost > 0 ? (totalCommission / totalCost) * 100 : 0
    };
}

/**
 * PROCUREMENT WORKFLOW
 * Called when admin fulfills a reward
 */
export async function handleRewardProcurement(redemptionId: string, rewardId: string) {
    // Get reward details
    const reward = await db.query.rewards.findFirst({
        where: eq(rewards.id, rewardId)
    });

    if (!reward) throw new Error('Reward not found');

    // Generate affiliate link
    const affiliateLink = generateAffiliateLink(reward);

    // Track the transaction
    await trackAffiliateTransaction(redemptionId, rewardId, {
        network: affiliateLink.network,
        url: affiliateLink.url,
        cost: reward.realValue,
        estimatedCommission: affiliateLink.estimatedCommission
    });

    return {
        procurementUrl: affiliateLink.url,
        estimatedCommission: affiliateLink.estimatedCommission,
        network: affiliateLink.network,
        instructions: `
      1. Click this link: ${affiliateLink.url}
      2. Purchase the reward (Cost: $${(reward.realValue / 100).toFixed(2)})
      3. Copy the redemption code/tracking number
      4. Return here and enter it in fulfillment
      
      Estimated commission: $${(affiliateLink.estimatedCommission / 100).toFixed(2)}
    `
    };
}

export { AFFILIATE_NETWORKS };
