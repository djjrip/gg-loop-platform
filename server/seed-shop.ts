/**
 * Shop Catalog Seed Script
 * Seeds GG LOOP shop with starter rewards catalog
 * 
 * Usage: npx tsx server/seed-shop.ts
 * 
 * PRODUCTION: $env:DATABASE_URL="postgresql://..." && npx tsx server/seed-shop.ts
 */

import { db } from './database';
import { rewards } from "../shared/schema";

async function seedShop() {
    console.log('🛍️ Seeding GG LOOP Shop...');

    const catalog = [
        // === GIFT CARDS (Most Popular) ===
        {
            title: '$10 Steam Gift Card',
            description: 'Instant delivery. Redeem on Steam for games, DLC, and more.',
            pointsCost: 1000,
            realValue: 1000, // $10 in cents
            category: 'gift-cards',
            tier: 2,
            stock: 99,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'STEAM-10',
        },
        {
            title: '$25 Amazon Gift Card',
            description: 'Digital code delivered instantly. Use on anything on Amazon.',
            pointsCost: 2500,
            realValue: 2500, // $25 in cents
            category: 'gift-cards',
            tier: 3,
            stock: 99,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'AMAZON-25',
        },
        {
            title: '$50 PlayStation Store',
            description: 'PS Store credit for games, DLC, and subscriptions.',
            pointsCost: 5000,
            realValue: 5000, // $50 in cents
            category: 'gift-cards',
            tier: 3,
            stock: 99,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'PSN-50',
        },
        {
            title: '$100 Gaming Gift Card Bundle',
            description: 'Choice of Steam, PlayStation, Xbox, or Nintendo eShop.',
            pointsCost: 10000,
            realValue: 10000, // $100 in cents
            category: 'gift-cards',
            tier: 4,
            stock: 25,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'BUNDLE-100',
        },

        // === GAMING GEAR ===
        {
            title: 'GG LOOP Mouse Pad XL',
            description: 'Extended gaming mouse pad with GG LOOP branding. 900x400mm.',
            pointsCost: 1500,
            realValue: 2500, // $25 value
            category: 'gaming-gear',
            tier: 2,
            stock: 50,
            inStock: true,
            fulfillmentType: 'physical',
            imageUrl: null,
            sku: 'MOUSEPAD-XL',
        },
        {
            title: 'RGB Gaming Headset Stand',
            description: 'Premium headset holder with USB hub and RGB lighting.',
            pointsCost: 3500,
            realValue: 4500, // $45 value
            category: 'gaming-gear',
            tier: 3,
            stock: 30,
            inStock: true,
            fulfillmentType: 'physical',
            imageUrl: null,
            sku: 'HEADSET-STAND',
        },

        // === SUBSCRIPTIONS ===
        {
            title: 'Discord Nitro (1 Month)',
            description: 'HD video, animated emojis, profile customization, and more.',
            pointsCost: 1000,
            realValue: 999, // $9.99
            category: 'subscriptions',
            tier: 2,
            stock: 99,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'NITRO-1M',
        },
        {
            title: 'Xbox Game Pass Ultimate (1 Month)',
            description: 'Access to 100+ games on Xbox and PC, plus EA Play.',
            pointsCost: 1500,
            realValue: 1499, // $14.99
            category: 'subscriptions',
            tier: 2,
            stock: 50,
            inStock: true,
            fulfillmentType: 'digital',
            imageUrl: null,
            sku: 'GAMEPASS-1M',
        },
    ];

    try {
        let seeded = 0;
        for (const item of catalog) {
            try {
                await db.insert(rewards).values(item).onConflictDoNothing();
                console.log(`   ✅ Added: ${item.title} (${item.pointsCost} pts)`);
                seeded++;
            } catch (err: any) {
                // Skip duplicates
                if (err.code === '23505') {
                    console.log(`   ⏭️  Skipped (exists): ${item.title}`);
                } else {
                    throw err;
                }
            }
        }

        console.log(`\n🎉 Shop seeded with ${seeded} items!`);
        console.log('\n✨ Visit: ggloop.io/shop');

    } catch (error) {
        console.error('❌ Error seeding shop:', error);
        process.exit(1);
    }
}

seedShop()
    .then(() => {
        console.log('✅ Seeding complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
