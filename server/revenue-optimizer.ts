/**
 * DYNAMIC REVENUE OPTIMIZER
 * Maximizes profit margin on every redemption
 * 
 * Innovation: Real-time price checking across affiliates, auto-routing to best margin
 */

import { db } from '../database';
import { rewards } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface AffiliateSource {
    name: string;
    cost: number;
    commission: number;
    availability: 'in_stock' | 'limited' | 'out_of_stock';
    estimatedProfit: number;
}

interface OptimizationResult {
    recommendedSource: string;
    expectedProfit: number;
    alternative: string | null;
    reasoning: string;
}

/**
 * Check prices across multiple affiliate sources
 * Real implementation would call APIs, this simulates logic
 */
async function checkAffiliatePrices(rewardId: string, requestedValue: number): Promise<AffiliateSource[]> {
    // In production: Make actual API calls to Raise.com, CardCash, etc.
    // For now: Simulate with realistic margins

    const sources: AffiliateSource[] = [];

    // Raise.com - Primary source
    const raiseCost = requestedValue * 0.95; // 5% discount
    const raiseCommission = requestedValue * 0.02; // 2% commission
    sources.push({
        name: 'raise',
        cost: raiseCost,
        commission: raiseCommission,
        availability: 'in_stock',
        estimatedProfit: (requestedValue - raiseCost) + raiseCommission
    });

    // CardCash - Secondary source
    const cardCashCost = requestedValue * 0.97; // 3% discount
    const cardCashCommission = requestedValue * 0.03; // 3% commission
    sources.push({
        name: 'cardcash',
        cost: cardCashCost,
        commission: cardCashCommission,
        availability: Math.random() > 0.3 ? 'in_stock' : 'limited',
        estimatedProfit: (requestedValue - cardCashCost) + cardCashCommission
    });

    // Amazon (for physical products, lower margin but reliable)
    const amazonCost = requestedValue; // No discount
    const amazonCommission = requestedValue * 0.03; // 3% commission
    sources.push({
        name: 'amazon',
        cost: amazonCost,
        commission: amazonCommission,
        availability: 'in_stock',
        estimatedProfit: amazonCommission
    });

    return sources;
}

/**
 * Optimize affiliate source selection
 */
export async function optimizeAffiliateSource(
    rewardId: string,
    requestedValue: number
): Promise<OptimizationResult> {
    const sources = await checkAffiliatePrices(rewardId, requestedValue);

    // Filter out out-of-stock
    const availableSources = sources.filter(s => s.availability !== 'out_of_stock');

    if (availableSources.length === 0) {
        throw new Error('No affiliate sources available for this reward');
    }

    // Sort by highest profit
    availableSources.sort((a, b) => b.estimatedProfit - a.estimatedProfit);

    const best = availableSources[0];
    const alternative = availableSources[1] || null;

    return {
        recommendedSource: best.name,
        expectedProfit: best.estimatedProfit,
        alternative: alternative?.name || null,
        reasoning: `${best.name} offers ${((best.estimatedProfit / requestedValue) * 100).toFixed(1)}% margin (${best.availability})`
    };
}

/**
 * Dynamic pricing: Adjust points cost based on procurement cost
 */
export async function calculateDynamicPoints(rewardId: string, basePointsCost: number): Promise<number> {
    const reward = await db.query.rewards.findFirst({
        where: eq(rewards.id, rewardId)
    });

    if (!reward) return basePointsCost;

    const realValue = reward.realValue || (basePointsCost * 100); // cents
    const optimization = await optimizeAffiliateSource(rewardId, realValue);

    // If profit margin is below 5%, increase points cost slightly
    const profitMargin = optimization.expectedProfit / realValue;

    if (profitMargin < 0.05) {
        // Increase by 10% to maintain margin
        return Math.floor(basePointsCost * 1.1);
    }

    // If profit margin is above 15%, we can afford to discount
    if (profitMargin > 0.15) {
        // Decrease by 5% to incentivize redemption
        return Math.floor(basePointsCost * 0.95);
    }

    return basePointsCost;
}

/**
 * A/B test recommendation strategies
 */
export interface RecommendationStrategy {
    name: string;
    algorithm: (userPoints: number, rewards: any[]) => any[];
}

export const RECOMMENDATION_STRATEGIES: RecommendationStrategy[] = [
    {
        name: 'maximize_margin',
        algorithm: (userPoints, rewards) => {
            // Recommend rewards with highest profit margin
            return rewards
                .filter(r => r.pointsCost <= userPoints)
                .sort((a, b) => {
                    const marginA = (a.realValue - (a.realValue * 0.95)) / a.realValue;
                    const marginB = (b.realValue - (b.realValue * 0.95)) / b.realValue;
                    return marginB - marginA;
                })
                .slice(0, 5);
        }
    },
    {
        name: 'maximize_value',
        algorithm: (userPoints, rewards) => {
            // Recommend best value for user
            return rewards
                .filter(r => r.pointsCost <= userPoints)
                .sort((a, b) => {
                    const valueA = a.realValue / a.pointsCost;
                    const valueB = b.realValue / b.pointsCost;
                    return valueB - valueA;
                })
                .slice(0, 5);
        }
    },
    {
        name: 'balanced',
        algorithm: (userPoints, rewards) => {
            // Balance between margin and value
            return rewards
                .filter(r => r.pointsCost <= userPoints)
                .map(r => {
                    const margin = (r.realValue * 0.05) / r.realValue;
                    const value = r.realValue / r.pointsCost;
                    const score = margin * 0.4 + (value / 10) * 0.6; // Weighted score
                    return { ...r, score };
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
        }
    }
];

/**
 * Get recommendation based on assigned strategy (for A/B testing)
 */
export function getRecommendationForUser(
    userId: string,
    userPoints: number,
    rewards: any[]
): { strategy: string; recommendations: any[] } {
    // Simple hash-based A/B assignment
    const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const strategyIndex = userHash % RECOMMENDATION_STRATEGIES.length;

    const strategy = RECOMMENDATION_STRATEGIES[strategyIndex];
    const recommendations = strategy.algorithm(userPoints, rewards);

    return {
        strategy: strategy.name,
        recommendations
    };
}

export { AffiliateSource, OptimizationResult };
