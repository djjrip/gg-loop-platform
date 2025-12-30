/**
 * Add Affiliate Links to Existing Rewards
 * 
 * Real affiliate programs:
 * - Amazon Associates: 1-4% on gift cards
 * - Raise.com: 2-5% cashback on gift cards
 * - CardCash: 2-5% on discounted cards
 * - G2A: 5-10% on game keys
 * 
 * Usage: $env:DATABASE_URL="postgresql://..." && npx tsx server/add-affiliates.ts
 */

import { db } from './database';
import { rewards } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Real affiliate program links (you'll replace with your actual affiliate IDs)
const AFFILIATE_DATA: Record<string, { url: string; commission: number; program: string }> = {
    'STEAM-10': {
        url: 'https://www.g2a.com/steam-gift-card-10-usd-steam-key-global-i10000000360011?aid=ggloop', // Replace with your G2A affiliate link
        commission: 50, // ~5% = $0.50 on $10
        program: 'g2a'
    },
    'AMAZON-25': {
        url: 'https://www.amazon.com/dp/B004LLIKVU?tag=ggloop-20', // Replace with your Amazon Associates tag
        commission: 100, // ~4% = $1.00 on $25
        program: 'amazon-associates'
    },
    'PSN-50': {
        url: 'https://www.raise.com/buy-playstation-store-gift-cards?ref=ggloop', // Replace with your Raise referral
        commission: 150, // ~3% = $1.50 on $50
        program: 'raise'
    },
    'BUNDLE-100': {
        url: 'https://www.cardcash.com/buy-gift-cards?ref=ggloop', // Replace with your CardCash referral
        commission: 400, // ~4% = $4.00 on $100
        program: 'cardcash'
    },
    'NITRO-1M': {
        url: 'https://www.g2a.com/discord-nitro-1-month?aid=ggloop',
        commission: 50, // ~5% = $0.50
        program: 'g2a'
    },
    'GAMEPASS-1M': {
        url: 'https://www.cdkeys.com/xbox-game-pass?mref=ggloop',
        commission: 75, // ~5% = $0.75
        program: 'cdkeys'
    }
};

async function addAffiliateData() {
    console.log('💰 Adding affiliate data to rewards...\n');

    for (const [sku, data] of Object.entries(AFFILIATE_DATA)) {
        try {
            const result = await db
                .update(rewards)
                .set({
                    affiliateUrl: data.url,
                    affiliateCommission: data.commission,
                    affiliateProgram: data.program
                })
                .where(eq(rewards.sku, sku))
                .returning();

            if (result.length > 0) {
                console.log(`✅ ${sku}: Added ${data.program} link (~$${(data.commission / 100).toFixed(2)} commission)`);
            } else {
                console.log(`⚠️  ${sku}: Not found in database`);
            }
        } catch (error) {
            console.error(`❌ ${sku}: Error -`, error);
        }
    }

    console.log('\n🎉 Affiliate data added!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Sign up for affiliate programs:');
    console.log('   - Amazon Associates: https://affiliate-program.amazon.com/');
    console.log('   - G2A Goldmine: https://www.g2a.com/goldmine');
    console.log('   - Raise: https://www.raise.com/affiliates');
    console.log('2. Replace placeholder URLs with your actual affiliate links');
    console.log('3. When fulfilling rewards, use the affiliateUrl to purchase');
}

addAffiliateData()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
