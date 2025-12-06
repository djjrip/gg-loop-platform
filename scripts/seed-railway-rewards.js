// Seed rewards directly into Railway production database
import { Client } from 'pg';

const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

if (!RAILWAY_DATABASE_URL) {
    console.error('❌ RAILWAY_DATABASE_URL not set');
    console.log('\nGet your Railway DATABASE_URL from:');
    console.log('1. Go to https://railway.app');
    console.log('2. Select your gg-loop-platform project');
    console.log('3. Click on postgres service');
    console.log('4. Go to Variables tab');
    console.log('5. Copy DATABASE_URL value');
    console.log('\nThen run:');
    console.log('$env:RAILWAY_DATABASE_URL="your-database-url-here"; node scripts/seed-railway-rewards.js');
    process.exit(1);
}

const rewards = [
    {
        title: '$10 Amazon Gift Card',
        description: 'Redeem for games, gear, or anything on Amazon',
        points_cost: 1000,
        image_url: '/assets/rewards/amazon-10.png',
        category: 'gift-cards',
        tier: 1,
        in_stock: true,
        fulfillment_type: 'digital'
    },
    {
        title: '$25 Steam Gift Card',
        description: 'Expand your game library on Steam',
        points_cost: 2500,
        image_url: '/assets/rewards/steam-25.png',
        category: 'gift-cards',
        tier: 2,
        in_stock: true,
        fulfillment_type: 'digital'
    },
    {
        title: 'HyperX Cloud II Gaming Headset',
        description: 'Pro-grade 7.1 surround sound headset',
        points_cost: 8000,
        image_url: '/assets/rewards/hyperx-cloud2.png',
        category: 'gaming-gear',
        tier: 3,
        in_stock: true,
        fulfillment_type: 'physical'
    }
];

async function seedRailwayRewards() {
    const client = new Client({ connectionString: RAILWAY_DATABASE_URL });

    try {
        await client.connect();
        console.log('✅ Connected to Railway database');

        // Check if rewards table exists
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'rewards'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating rewards table...');
            await client.query(`
        CREATE TABLE rewards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          points_cost INTEGER NOT NULL,
          image_url TEXT,
          category TEXT,
          tier INTEGER,
          in_stock BOOLEAN DEFAULT true,
          fulfillment_type TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
            console.log('✅ Rewards table created');
        }

        // Check existing rewards
        const existingCount = await client.query('SELECT COUNT(*) FROM rewards');
        console.log(`Current rewards in database: ${existingCount.rows[0].count}`);

        if (existingCount.rows[0].count > 0) {
            console.log('⚠️  Rewards already exist. Skipping insert.');
            console.log('To force re-seed, run: DELETE FROM rewards; in Railway console');
        } else {
            // Insert rewards
            for (const reward of rewards) {
                await client.query(`
          INSERT INTO rewards (title, description, points_cost, image_url, category, tier, in_stock, fulfillment_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [reward.title, reward.description, reward.points_cost, reward.image_url, reward.category, reward.tier, reward.in_stock, reward.fulfillment_type]);
                console.log(`✅ Inserted: ${reward.title}`);
            }

            const finalCount = await client.query('SELECT COUNT(*) FROM rewards');
            console.log(`\n🎯 SUCCESS: ${finalCount.rows[0].count} rewards now in Railway database`);
            console.log('\nVerify at: https://ggloop.io/api/rewards');
        }

    } catch (error) {
        console.error('❌ Error seeding rewards:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedRailwayRewards();
