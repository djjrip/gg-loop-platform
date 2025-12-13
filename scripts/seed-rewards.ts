
import { db } from "../server/db";
import { rewards } from "../shared/schema";
import { eq } from "drizzle-orm";

const SEED_REWARDS = [
    // Gift Cards
    {
        title: 'Steam Gift Card $25',
        category: 'gift-cards',
        pointsCost: 12000,
        realValue: 25,
        tier: 2, // Rare
        imageUrl: 'https://images.unsplash.com/photo-1633969707708-3f9644786f8d?w=800&h=600&fit=crop',
        description: 'Instantly delivered digital gift card for Steam platform',
        fulfillmentType: 'manual'
    },
    {
        title: 'Amazon Gift Card $50',
        category: 'gift-cards',
        pointsCost: 25000,
        realValue: 50,
        tier: 3, // Epic
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        description: 'Versatile gift card for millions of products',
        fulfillmentType: 'manual'
    },
    {
        title: 'Discord Nitro 1 Year',
        category: 'subscriptions',
        pointsCost: 15000,
        realValue: 100,
        tier: 2, // Rare
        imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop',
        description: 'Premium Discord features for one year',
        fulfillmentType: 'manual'
    },
    {
        title: 'PlayStation Store $100',
        category: 'gift-cards',
        pointsCost: 50000,
        realValue: 100,
        tier: 4, // Legendary
        imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
        description: 'PlayStation Network wallet credit',
        fulfillmentType: 'manual'
    },

    // Gaming Gear
    {
        title: 'Razer DeathAdder V3',
        category: 'gaming-gear',
        pointsCost: 35000,
        realValue: 70,
        tier: 3, // Epic
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop',
        description: 'Professional gaming mouse with 30K DPI sensor',
        fulfillmentType: 'physical'
    },
    {
        title: 'HyperX Cloud II Headset',
        category: 'gaming-gear',
        pointsCost: 28000,
        realValue: 80,
        tier: 3, // Epic
        imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=600&fit=crop',
        description: '7.1 surround sound gaming headset',
        fulfillmentType: 'physical'
    },
    {
        title: 'Logitech G Pro X Keyboard',
        category: 'gaming-gear',
        pointsCost: 42000,
        realValue: 130,
        tier: 4, // Legendary
        imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=600&fit=crop',
        description: 'Mechanical gaming keyboard with RGB',
        fulfillmentType: 'physical'
    },
    {
        title: 'SteelSeries Mousepad XXL',
        category: 'gaming-gear',
        pointsCost: 8000,
        realValue: 30,
        tier: 1, // Common
        imageUrl: 'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=800&h=600&fit=crop',
        description: 'Extended gaming surface with anti-slip base',
        fulfillmentType: 'physical'
    },

    // More Gift Cards
    {
        title: 'Xbox Gift Card $25',
        category: 'gift-cards',
        pointsCost: 12000,
        realValue: 25,
        tier: 2, // Rare
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&h=600&fit=crop',
        description: 'Microsoft Store and Xbox credit',
        fulfillmentType: 'manual'
    },
    {
        title: 'Riot Points 5000 RP',
        category: 'gift-cards',
        pointsCost: 20000,
        realValue: 35,
        tier: 3, // Epic
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
        description: 'League of Legends in-game currency',
        fulfillmentType: 'manual'
    },
    {
        title: 'Visa Prepaid Card $100',
        category: 'gift-cards',
        pointsCost: 52000,
        realValue: 100,
        tier: 4, // Legendary
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        description: 'Use anywhere Visa is accepted',
        fulfillmentType: 'manual'
    },
    {
        title: 'Google Play $15',
        category: 'gift-cards',
        pointsCost: 7000,
        realValue: 15,
        tier: 1, // Common
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        description: 'Android apps, games, and media',
        fulfillmentType: 'manual'
    },
];

async function seedRewards() {
    console.log("Checking rewards table...");

    try {
        const existingRewards = await db.select().from(rewards);
        console.log(`Found ${existingRewards.length} existing rewards.`);

        if (existingRewards.length > 0) {
            console.log("Rewards table already populated. Skipping seed.");
            process.exit(0);
        }

        console.log("Seeding rewards...");

        for (const reward of SEED_REWARDS) {
            await db.insert(rewards).values({
                ...reward,
                inStock: true,
                stock: 100 // Default stock
            });
            console.log(`Added: ${reward.title}`);
        }

        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding rewards:", error);
        process.exit(1);
    }
}

seedRewards();
