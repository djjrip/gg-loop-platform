/**
 * Shop Catalog Seed Script
 * Seeds GG LOOP shop with starter rewards catalog
 * 
 * Usage: npx tsx server/seed-shop.ts
 */

import { db } from './db';
import { rewards } from '@shared/schema';

async function seedShop() {
    console.log('🛍️ Seeding GG LOOP Shop...');

    const catalog = [
        {
            title: 'GG LOOP Starter Pack',
            description: 'Official GG LOOP sticker pack + lanyard. Rep the brand.',
            pointsCost: 500,
            category: 'merch',
            stockAvailable: 100,
            fulfillmentType: 'physical',
            imageUrl: null,
            isActive: true,
        },
        {
            title: 'GG LOOP Premium Tee',
            description: 'Limited edition black tee with rose-gold logo. Sizes S-XXL.',
            pointsCost: 2500,
            category: 'merch',
            stockAvailable: 50,
            fulfillmentType: 'physical',
            imageUrl: null,
            isActive: true,
        },
        {
            title: '$10 Steam Gift Card',
            description: 'Instant delivery. Redeem on Steam for games, DLC, and more.',
            pointsCost: 1000,
            category: 'gift_card',
            stockAvailable: 999,
            fulfillmentType: 'digital',
            imageUrl: null,
            isActive: true,
        },
        {
            title: '$25 Amazon Gift Card',
            description: 'Digital code delivered instantly. Use on anything on Amazon.',
            pointsCost: 2500,
            category: 'gift_card',
            stockAvailable: 999,
            fulfillmentType: 'digital',
            imageUrl: null,
            isActive: true,
        },
        {
            title: 'Exclusive Discord Role',
            description: 'VIP role in GG LOOP Discord. Access to exclusive channels.',
            pointsCost: 150,
            category: 'digital',
            stockAvailable: 999,
            fulfillmentType: 'automatic',
            imageUrl: null,
            isActive: true,
        },
        {
            title: 'Custom Profile Badge',
            description: 'Choose your own custom badge text. Shows on your profile.',
            pointsCost: 750,
            category: 'digital',
            stockAvailable: 999,
            fulfillmentType: 'automatic',
            imageUrl: null,
            isActive: true,
        },
    ];

    try {
        for (const item of catalog) {
            await db.insert(rewards).values(item);
            console.log(`   ✅ Added: ${item.title} (${item.pointsCost} pts)`);
        }

        console.log(`\n🎉 Shop seeded with ${catalog.length} items!`);
        console.log('\n💡 Revenue activation checklist:');
        console.log('   1. ✅ Shop catalog ready');
        console.log('   2. ⏳ Set PAYPAL_MODE=live in Railway');
        console.log('   3. ⏳ Test redemption flow');
        console.log('   4. 🚀 Announce shop opening to users');

    } catch (error) {
        console.error('❌ Error seeding shop:', error);
        process.exit(1);
    }
}

seedShop()
    .then(() => {
        console.log('\n✨ Shop is LIVE at ggloop.io/shop');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
