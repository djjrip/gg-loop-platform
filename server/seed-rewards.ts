import { db } from './database';
import { rewards } from '../shared/schema';
import { sql } from 'drizzle-orm';

// Seed rewards for GG Loop Shop
async function seedRewards() {
    console.log('Seeding rewards...');

    const rewardsData = [
        // Gift Cards (Tier 1 - Common)
        { title: '$10 Amazon Gift Card', description: 'Redeem for games, gear, or anything on Amazon', pointsCost: 1000, imageUrl: '/assets/rewards/amazon-10.png', category: 'gift-cards', tier: 1, inStock: true, fulfillmentType: 'digital' },
        { title: '$25 Steam Gift Card', description: 'Expand your game library on Steam', pointsCost: 2500, imageUrl: '/assets/rewards/steam-25.png', category: 'gift-cards', tier: 2, inStock: true, fulfillmentType: 'digital' },
        { title: '$50 PlayStation Store Card', description: 'Games, DLC, and PS Plus on PlayStation', pointsCost: 5000, imageUrl: '/assets/rewards/psn-50.png', category: 'gift-cards', tier: 3, inStock: true, fulfillmentType: 'digital' },

        // Subscriptions (Tier 2 - Rare)
        { title: '1 Month Discord Nitro', description: 'Enhanced chat, custom emojis, and HD streaming', pointsCost: 1500, imageUrl: '/assets/rewards/discord-nitro.png', category: 'subscriptions', tier: 2, inStock: true, fulfillmentType: 'digital' },
        { title: '3 Months Spotify Premium', description: 'Ad-free music streaming', pointsCost: 3000, imageUrl: '/assets/rewards/spotify-3mo.png', category: 'subscriptions', tier: 2, inStock: true, fulfillmentType: 'digital' },
        { title: '1 Month Xbox Game Pass Ultimate', description: 'Access to 100+ games', pointsCost: 4000, imageUrl: '/assets/rewards/gamepass-1mo.png', category: 'subscriptions', tier: 3, inStock: true, fulfillmentType: 'digital' },

        // Gaming Gear (Tier 3-4 - Epic/Legendary)
        { title: 'HyperX Cloud II Gaming Headset', description: 'Pro-grade 7.1 surround sound headset', pointsCost: 8000, imageUrl: '/assets/rewards/hyperx-cloud2.png', category: 'gaming-gear', tier: 3, inStock: true, fulfillmentType: 'physical' },
        { title: 'Logitech GPro X Superlight', description: 'Ultra-lightweight wireless gaming mouse', pointsCost: 12000, imageUrl: '/assets/rewards/gpro-superlight.png', category: 'gaming-gear', tier: 4, inStock: true, fulfillmentType: 'physical' },
        { title: 'Razer BlackWidow V3 Keyboard', description: 'Mechanical RGB gaming keyboard', pointsCost: 15000, imageUrl: '/assets/rewards/blackwidow-v3.png', category: 'gaming-gear', tier: 4, inStock: true, fulfillmentType: 'physical' },

        // High-Value Rewards (Tier 4 - Legendary)
        { title: '$100 Best Buy Gift Card', description: 'Electronics, games, and more', pointsCost: 10000, imageUrl: '/assets/rewards/bestbuy-100.png', category: 'gift-cards', tier: 4, inStock: true, fulfillmentType: 'digital' },
        { title: 'NVIDIA RTX 4060 Graphics Card', description: 'Next-gen gaming performance', pointsCost: 50000, imageUrl: '/assets/rewards/rtx-4060.png', category: 'gaming-gear', tier: 4, inStock: true, fulfillmentType: 'physical' },
        { title: 'PlayStation 5 Console', description: 'The ultimate gaming console', pointsCost: 75000, imageUrl: '/assets/rewards/ps5.png', category: 'gaming-gear', tier: 4, inStock: false, fulfillmentType: 'physical' },
    ];

    for (const reward of rewardsData) {
        await db.insert(rewards).values({
            id: sql`gen_random_uuid()`,
            ...reward,
            createdAt: sql`NOW()`
        });
    }

    console.log(`✅ Seeded ${rewardsData.length} rewards`);

    // Verify
    const count = await db.select().from(rewards);
    console.log(`Total rewards in DB: ${count.length}`);
}

seedRewards().catch(console.error);
