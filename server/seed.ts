import { db } from "./db";
import { games, rewards } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingGames = await db.select().from(games);
  if (existingGames.length > 0) {
    console.log("Database already seeded");
    return;
  }

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

  await db.insert(rewards).values([
    {
      title: "Steam Gift Card",
      description: "$50 Steam wallet credit",
      pointsCost: 5000,
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      category: "Gift Cards",
    },
    {
      title: "Gaming Headset",
      description: "Premium wireless gaming headset",
      pointsCost: 12000,
      imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&q=80",
      category: "Gaming Gear",
    },
    {
      title: "Discord Nitro",
      description: "3 months Discord Nitro subscription",
      pointsCost: 3000,
      imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80",
      category: "Subscriptions",
    },
    {
      title: "Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard",
      pointsCost: 15000,
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
      category: "Gaming Gear",
    },
    {
      title: "Xbox Game Pass",
      description: "1 month Xbox Game Pass Ultimate",
      pointsCost: 2500,
      imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&q=80",
      category: "Subscriptions",
    },
  ]);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
