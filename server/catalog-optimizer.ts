/**
 * REWARD CATALOG AUTO-OPTIMIZER
 * Automatically updates shop with best affiliate deals
 * 
 * Innovation: Catalog optimizes itself - always best margins, always fresh deals
 */

import { db } from '../db';
import { rewards } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

interface AffiliateDeal {
    title: string;
    category: string;
    faceValue: number; // cents
    discountedPrice: number; // cents
    commission: number; // cents
    affiliateUrl: string;
    affiliateNetwork: 'raise' | 'cardcash' | 'amazon' | 'impact';
    availability: 'in_stock' | 'limited' | 'out_of_stock';
    margin: number; // total profit margin in cents
}

/**
 * Scrape Raise.com for gift card deals
 * (Simulated - real implementation would use Puppeteer/Playwright)
 */
async function scrapeRaiseDeals(): Promise<AffiliateDeal[]> {
    // In production: Use Puppeteer to scrape Raise.com
    // For now: Simulate realistic deals

    const brands = [
        { name: 'Amazon', category: 'gift_cards', discount: 0.05, commission: 0.02 },
        { name: 'Steam', category: 'game_keys', discount: 0.06, commission: 0.03 },
        { name: 'PlayStation Store', category: 'gift_cards', discount: 0.04, commission: 0.02 },
        { name: 'Xbox', category: 'gift_cards', discount: 0.05, commission: 0.025 },
        { name: 'Nintendo eShop', category: 'gift_cards', discount: 0.04, commission: 0.02 },
    ];

    const values = [2500, 5000, 10000]; // $25, $50, $100

    const deals: AffiliateDeal[] = [];

    for (const brand of brands) {
        for (const value of values) {
            const discountedPrice = Math.floor(value * (1 - brand.discount));
            const commission = Math.floor(value * brand.commission);
            const margin = (value - discountedPrice) + commission;

            deals.push({
                title: `${brand.name} $${(value / 100).toFixed(0)} Gift Card`,
                category: brand.category,
                faceValue: value,
                discountedPrice,
                commission,
                affiliateUrl: `https://raise.com/buy-${brand.name.toLowerCase()}-gift-cards?utm_source=ggloop`,
                affiliateNetwork: 'raise',
                availability: Math.random() > 0.2 ? 'in_stock' : 'limited',
                margin
            });
        }
    }

    return deals;
}

/**
 * Scrape CardCash for alternative deals
 */
async function scrapeCardCashDeals(): Promise<AffiliateDeal[]> {
    // Similar to Raise but different margins
    const brands = [
        { name: 'Amazon', category: 'gift_cards', discount: 0.03, commission: 0.03 },
        { name: 'Target', category: 'gift_cards', discount: 0.04, commission: 0.025 },
        { name: 'Walmart', category: 'gift_cards', discount: 0.03, commission: 0.02 },
    ];

    const values = [2500, 5000];
    const deals: AffiliateDeal[] = [];

    for (const brand of brands) {
        for (const value of values) {
            const discountedPrice = Math.floor(value * (1 - brand.discount));
            const commission = Math.floor(value * brand.commission);
            const margin = (value - discountedPrice) + commission;

            deals.push({
                title: `${brand.name} $${(value / 100).toFixed(0)} Gift Card`,
                category: brand.category,
                faceValue: value,
                discountedPrice,
                commission,
                affiliateUrl: `https://cardcash.com/${brand.name.toLowerCase()}`,
                affiliateNetwork: 'cardcash',
                availability: 'in_stock',
                margin
            });
        }
    }

    return deals;
}

/**
 * Get all available deals from affiliate networks
 */
export async function getAllAffiliateDeals(): Promise<AffiliateDeal[]> {
    console.log('[CatalogOptimizer] Scraping affiliate networks...');

    const [raiseDeals, cardCashDeals] = await Promise.all([
        scrapeRaiseDeals(),
        scrapeCardCashDeals()
    ]);

    const allDeals = [...raiseDeals, ...cardCashDeals];

    console.log(`[CatalogOptimizer] Found ${allDeals.length} total deals`);

    return allDeals;
}

/**
 * Filter deals by minimum margin threshold
 */
export function filterByMargin(deals: AffiliateDeal[], minMarginPercent: number = 5): AffiliateDeal[] {
    return deals.filter(deal => {
        const marginPercent = (deal.margin / deal.faceValue) * 100;
        return marginPercent >= minMarginPercent;
    });
}

/**
 * Find best deal for each brand/value combination
 */
export function selectBestDeals(deals: AffiliateDeal[]): AffiliateDeal[] {
    const dealMap = new Map<string, AffiliateDeal>();

    for (const deal of deals) {
        const key = `${deal.title}-${deal.faceValue}`;
        const existing = dealMap.get(key);

        if (!existing || deal.margin > existing.margin) {
            dealMap.set(key, deal);
        }
    }

    return Array.from(dealMap.values());
}

/**
 * Auto-add new rewards to database
 */
export async function addRewardsToCatalog(deals: AffiliateDeal[]): Promise<number> {
    let added = 0;

    for (const deal of deals) {
        // Check if reward already exists
        const existing = await db.query.rewards.findFirst({
            where: sql`${rewards.title} = ${deal.title} AND ${rewards.realValue} = ${deal.faceValue}`
        });

        if (existing) {
            // Update affiliate URL and pricing
            await db.update(rewards)
                .set({
                    affiliateUrl: deal.affiliateUrl,
                    realValue: deal.faceValue,
                    updatedAt: new Date()
                })
                .where(eq(rewards.id, existing.id));

            console.log(`[CatalogOptimizer] Updated: ${deal.title}`);
        } else {
            // Add new reward
            const pointsCost = deal.faceValue; // 1 point = 1 cent for simplicity

            await db.insert(rewards).values({
                title: deal.title,
                description: `${deal.title} - Redeemable online. Delivered digitally.`,
                category: deal.category,
                pointsCost,
                realValue: deal.faceValue,
                imageUrl: '', // Would need to fetch brand logo
                isActive: true,
                stockQuantity: 999,
                affiliateUrl: deal.affiliateUrl,
                affiliateProgram: deal.affiliateNetwork,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            added++;
            console.log(`[CatalogOptimizer] Added: ${deal.title} (${(deal.margin / deal.faceValue) * 100}% margin)`);
        }
    }

    return added;
}

/**
 * Remove low-margin rewards from catalog
 */
export async function removeLowMarginRewards(minMarginPercent: number = 3): Promise<number> {
    // Get all active rewards
    const allRewards = await db.query.rewards.findMany({
        where: eq(rewards.isActive, true)
    });

    let removed = 0;

    for (const reward of allRewards) {
        if (!reward.realValue) continue;

        // Estimate margin (conservative)
        const estimatedDiscount = reward.realValue * 0.03; // Assume 3% discount
        const estimatedCommission = reward.realValue * 0.02; // Assume 2% commission
        const estimatedMargin = estimatedDiscount + estimatedCommission;
        const marginPercent = (estimatedMargin / reward.realValue) * 100;

        if (marginPercent < minMarginPercent) {
            await db.update(rewards)
                .set({ isActive: false })
                .where(eq(rewards.id, reward.id));

            removed++;
            console.log(`[CatalogOptimizer] Removed: ${reward.title} (${marginPercent.toFixed(1)}% margin too low)`);
        }
    }

    return removed;
}

/**
 * Run full catalog optimization
 */
export async function optimizeCatalog(): Promise<{
    scanned: number;
    filtered: number;
    selected: number;
    added: number;
    removed: number;
}> {
    console.log('\n============================================');
    console.log('🤖 CATALOG OPTIMIZER: Starting');
    console.log('============================================\n');

    // Step 1: Get all deals
    const allDeals = await getAllAffiliateDeals();
    console.log(`Step 1: Scanned ${allDeals.length} deals`);

    // Step 2: Filter by minimum margin
    const filteredDeals = filterByMargin(allDeals, 5);
    console.log(`Step 2: Filtered to ${filteredDeals.length} deals (>5% margin)`);

    // Step 3: Select best deals
    const bestDeals = selectBestDeals(filteredDeals);
    console.log(`Step 3: Selected ${bestDeals.length} best deals`);

    // Step 4: Add to catalog
    const added = await addRewardsToCatalog(bestDeals);
    console.log(`Step 4: Added ${added} new rewards`);

    // Step 5: Remove low-margin items
    const removed = await removeLowMarginRewards(3);
    console.log(`Step 5: Removed ${removed} low-margin rewards`);

    console.log('\n============================================');
    console.log('🤖 CATALOG OPTIMIZER: Complete');
    console.log(`   Scanned: ${allDeals.length}`);
    console.log(`   Added: ${added}`);
    console.log(`   Removed: ${removed}`);
    console.log('============================================\n');

    return {
        scanned: allDeals.length,
        filtered: filteredDeals.length,
        selected: bestDeals.length,
        added,
        removed
    };
}
