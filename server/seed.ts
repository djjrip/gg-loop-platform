import { db } from "./db";
import { games, rewards } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingGames = await db.select().from(games);
  const existingRewards = await db.select().from(rewards);
  
  if (existingGames.length > 0 && existingRewards.length > 0) {
    console.log("Database already seeded");
    return;
  }

  if (existingGames.length === 0) {
    await db.insert(games).values([
    {
      title: "Counter-Strike 2",
      category: "FPS",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      description: "Compete in ranked matches and earn points for your performance",
      players: 45230,
      avgScore: 1850,
      challenges: 24,
    },
    {
      title: "League of Legends",
      category: "MOBA",
      imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
      description: "Climb the ranked ladder and complete weekly challenges",
      players: 67890,
      avgScore: 2100,
      challenges: 32,
    },
    {
      title: "Valorant",
      category: "FPS",
      imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80",
      description: "Tactical shooter with competitive gameplay and rewards",
      players: 52100,
      avgScore: 1920,
      challenges: 28,
    },
    {
      title: "Apex Legends",
      category: "Battle Royale",
      imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
      description: "Battle royale action with team-based challenges",
      players: 38450,
      avgScore: 1680,
      challenges: 20,
    },
    {
      title: "Rocket League",
      category: "Sports",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
      description: "Competitive car soccer with ranked progression",
      players: 28900,
      avgScore: 1450,
      challenges: 18,
    },
    {
      title: "Fortnite",
      category: "Battle Royale",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
      description: "Battle royale with building mechanics and daily challenges",
      players: 89200,
      avgScore: 1780,
      challenges: 35,
    },
    ]);
  }

  if (existingRewards.length === 0) {
    await db.insert(rewards).values([
    {
      title: "Exclusive GG Badge",
      description: "Unlock a premium profile badge",
      pointsCost: 50,
      realValue: 5,
      tier: 1,
      imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80",
      category: "Digital",
      fulfillmentType: "automatic",
    },
    {
      title: "Discord Nitro",
      description: "1 month Discord Nitro subscription",
      pointsCost: 100,
      realValue: 10,
      tier: 1,
      imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80",
      category: "Subscriptions",
      fulfillmentType: "digital_key",
    },
    {
      title: "20% Off Gaming Store",
      description: "Get 20% off your next purchase at partner stores",
      pointsCost: 150,
      realValue: 15,
      tier: 1,
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      category: "Discounts",
      fulfillmentType: "code",
    },
    {
      title: "Xbox Game Pass",
      description: "1 month Xbox Game Pass Ultimate",
      pointsCost: 300,
      realValue: 17,
      tier: 2,
      imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&q=80",
      category: "Subscriptions",
      fulfillmentType: "digital_key",
    },
    {
      title: "HyperX Cloud II Gaming Headset",
      description: "Professional gaming headset with 7.1 surround sound",
      pointsCost: 350,
      realValue: 100,
      tier: 2,
      stock: 75,
      sku: "HYPERX-HEADSET-001",
      imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    {
      title: "Premium Game Skin Pack",
      description: "Exclusive in-game skins for popular titles",
      pointsCost: 400,
      realValue: 25,
      tier: 2,
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80",
      category: "Digital",
      fulfillmentType: "digital_key",
    },
    {
      title: "Logitech G Pro Wireless Mouse",
      description: "Ultra-lightweight wireless gaming mouse with HERO sensor",
      pointsCost: 800,
      realValue: 130,
      tier: 3,
      stock: 60,
      sku: "LOGITECH-MOUSE-001",
      imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    {
      title: "Razer Gaming Mouse",
      description: "High-precision wireless gaming mouse",
      pointsCost: 1200,
      realValue: 50,
      tier: 3,
      stock: 50,
      sku: "RAZER-MOUSE-001",
      imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    {
      title: "Custom Gaming Chair",
      description: "Ergonomic gaming chair with lumbar support",
      pointsCost: 3000,
      realValue: 150,
      tier: 3,
      stock: 20,
      sku: "CHAIR-GAMING-001",
      imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    {
      title: "Premium Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard with custom switches",
      pointsCost: 5000,
      realValue: 150,
      tier: 4,
      stock: 15,
      sku: "KB-MECH-001",
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    {
      title: "VIP Event Ticket",
      description: "Exclusive access to major gaming event",
      pointsCost: 2500,
      realValue: 100,
      tier: 4,
      stock: 100,
      sku: "EVENT-VIP-001",
      imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&q=80",
      category: "Experiences",
      fulfillmentType: "manual",
    },
    {
      title: "ASUS ROG Gaming Monitor",
      description: "27-inch 144Hz 1ms gaming monitor with FreeSync",
      pointsCost: 15000,
      realValue: 400,
      tier: 4,
      stock: 10,
      sku: "ASUS-MONITOR-001",
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80",
      category: "Gaming Gear",
      fulfillmentType: "physical",
    },
    ]);
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
