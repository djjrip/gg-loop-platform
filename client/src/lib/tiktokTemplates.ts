export interface TikTokTemplate {
  id: string;
  title: string;
  category: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  viralScore: number;
  duration: string;
}

export const tiktokTemplates: TikTokTemplate[] = [
  {
    id: "1",
    title: "Platform Launch Announcement",
    category: "Launch",
    hook: "I built a platform that pays gamers real rewards 💰",
    body: "Subscribe for $5/month → Play your favorite games → Earn points → Redeem for gift cards, gaming gear, and real prizes.\n\nIt's like Netflix but you actually GET PAID while you play.",
    cta: "Link in bio to join GG Loop 🎮",
    hashtags: ["#GamingRewards", "#GGLoop", "#EarnWhileYouPlay", "#GamerLife", "#Gaming"],
    viralScore: 9,
    duration: "15-30 sec"
  },
  {
    id: "2",
    title: "Rewards Catalog Showcase",
    category: "Features",
    hook: "Just redeemed 500 points for a $50 gift card playing games?!",
    body: "Here's what you can get on GG Loop:\n• $10 Steam cards (100 pts)\n• $25 Amazon (250 pts)\n• $50 gaming headset (500 pts)\n• $100+ elite rewards (1000+ pts)\n\nAll from just playing games you already love.",
    cta: "Start earning at ggloop.io",
    hashtags: ["#GamingRewards", "#FreeMoney", "#GamerPerks", "#GGLoop"],
    viralScore: 10,
    duration: "30 sec"
  },
  {
    id: "3",
    title: "How It Works Explainer",
    category: "Tutorial",
    hook: "Gaming subscription that actually pays YOU back",
    body: "Step 1: Subscribe ($5/month)\nStep 2: Connect your gaming accounts\nStep 3: Play games and compete\nStep 4: Earn points automatically\nStep 5: Redeem for real rewards\n\nNo grinding. No scams. Just real value.",
    cta: "Try GG Loop free → Link in bio",
    hashtags: ["#GamingHacks", "#PassiveIncome", "#GGLoop", "#Gaming101"],
    viralScore: 8,
    duration: "20-30 sec"
  },
  {
    id: "4",
    title: "Value Comparison",
    category: "Comparison",
    hook: "Gaming subscriptions ranked:",
    body: "F Tier: Paying $10 for games\nC Tier: Game Pass ($10/month)\nB Tier: PS Plus ($10/month)\nS Tier: GG Loop ($5/month)\n\nWhy? Because GG Loop is the ONLY one that pays YOU.\n\nEarn $10-50+ per month in rewards while you play.",
    cta: "Join the S-tier → ggloop.io",
    hashtags: ["#GamingTierList", "#GGLoop", "#BestGamingService", "#Gaming"],
    viralScore: 9,
    duration: "15 sec"
  },
  {
    id: "5",
    title: "Behind The Scenes",
    category: "BTS",
    hook: "Day in the life building a gaming startup",
    body: "*Show your setup, coding, design work*\n\n\"Building a platform where gamers earn real rewards\"\n\"Just deployed the leaderboard system\"\n\"Designed the rewards catalog\"\n\"This is GG Loop - launches this week\"\n\nAuthenticity sells. Show the grind.",
    cta: "Follow for updates → launching Monday",
    hashtags: ["#StartupLife", "#BuildInPublic", "#Gaming", "#TechStartup", "#GGLoop"],
    viralScore: 7,
    duration: "30-60 sec"
  },
  {
    id: "6",
    title: "Problem / Solution",
    category: "Educational",
    hook: "Gamers: Stop wasting money on subscriptions that don't pay you back",
    body: "The problem:\n→ You pay $10-20/month for game subscriptions\n→ You spend hours playing\n→ You get nothing in return\n\nThe solution:\n→ GG Loop costs $5/month\n→ Earn 300-450 points monthly\n→ Redeem for $30-45 in rewards\n\nYou literally PROFIT from playing.",
    cta: "Start earning → ggloop.io",
    hashtags: ["#GamingTips", "#MoneyHacks", "#GGLoop", "#SmartGaming"],
    viralScore: 10,
    duration: "30 sec"
  },
  {
    id: "7",
    title: "User Success Story",
    category: "Testimonial",
    hook: "POV: You just earned $25 playing Fortnite",
    body: "*Screen record GG Loop dashboard*\n\nPoints: 2,450 → Redeeming for $25 Amazon card\n\n\"Literally paid for my subscription 5x over\"\n\"All from games I was already playing\"\n\nThis is the future of gaming.",
    cta: "Your turn → ggloop.io",
    hashtags: ["#GamingWin", "#Fortnite", "#GGLoop", "#EarnMoney", "#Gaming"],
    viralScore: 10,
    duration: "20 sec"
  },
  {
    id: "8",
    title: "Quick Feature Demo",
    category: "Demo",
    hook: "This gaming platform is INSANE",
    body: "*Screen record ggloop.io*\n\n→ NBA broadcast graphics\n→ Real-time leaderboards\n→ Achievement tracking\n→ Points for every win\n→ Rewards catalog (100+ items)\n\n\"Built this in weeks. Launches Monday.\"",
    cta: "Join the waitlist → link in bio",
    hashtags: ["#Gaming", "#GameDev", "#WebDesign", "#GGLoop", "#TechDemo"],
    viralScore: 8,
    duration: "15 sec"
  },
  {
    id: "9",
    title: "Trending Sound Remix",
    category: "Viral",
    hook: "*Use trending audio* \"Wait... you can make money gaming?\"",
    body: "*Dance/transition into GG Loop dashboard*\n\nYes. $5/month subscription.\nEarn 10 points = $1 in rewards.\nPlay. Win. Get paid.\n\nIt's that simple.",
    cta: "Get started → ggloop.io",
    hashtags: ["#Gaming", "#MoneyMoves", "#GGLoop", "#ViralDance"],
    viralScore: 10,
    duration: "10-15 sec"
  },
  {
    id: "10",
    title: "Stat Flex",
    category: "Social Proof",
    hook: "GG Loop stats after 1 week:",
    body: "→ 847 signups\n→ $2,450 in rewards claimed\n→ 5,230 matches tracked\n→ 94% satisfaction rate\n\nGamers are tired of getting nothing back.\n\nGG Loop changes that.",
    cta: "Be next → ggloop.io",
    hashtags: ["#Gaming", "#Startup", "#GGLoop", "#GamingCommunity"],
    viralScore: 7,
    duration: "15 sec"
  },
  {
    id: "11",
    title: "POV Meme Format",
    category: "Meme",
    hook: "POV: You're a gamer in 2024 still paying subscriptions that don't pay you",
    body: "*Sad music plays*\n\nMeanwhile GG Loop users:\n*Happy music*\n*Shows rewards catalog*\n*Someone redeeming $50 headset*\n\n\"We're not the same.\"",
    cta: "Switch sides → ggloop.io",
    hashtags: ["#GamingMemes", "#POV", "#GGLoop", "#Gaming", "#Relatable"],
    viralScore: 9,
    duration: "15 sec"
  },
  {
    id: "12",
    title: "Controversy Hook",
    category: "Hot Take",
    hook: "Unpopular opinion: Game Pass is a waste of money",
    body: "Hear me out:\n\nGame Pass: $10/month\n→ Play unlimited games\n→ Get nothing in return\n\nGG Loop: $5/month\n→ Play unlimited games\n→ EARN $30-45/month in rewards\n\nDo the math. 🧮",
    cta: "Join the smarter option → ggloop.io",
    hashtags: ["#UnpopularOpinion", "#Gaming", "#GGLoop", "#GamePass", "#HotTake"],
    viralScore: 10,
    duration: "20 sec"
  }
];

export const contentTips = [
  {
    title: "Best Posting Times",
    tips: ["6-9 AM (morning scroll)", "12-2 PM (lunch break)", "7-11 PM (prime time)", "Post daily for algorithm favor"]
  },
  {
    title: "Hook Guidelines",
    tips: ["First 3 seconds = everything", "Start with numbers or shock value", "Ask questions to create curiosity", "Use trending sounds for instant recognition"]
  },
  {
    title: "Hashtag Strategy",
    tips: ["Mix 3-5 hashtags total", "1-2 niche (#GGLoop, #GamingRewards)", "2-3 broad (#Gaming, #GamerLife)", "Check trending gaming hashtags weekly"]
  },
  {
    title: "Content Mix (Weekly)",
    tips: ["2-3 educational/how-it-works", "1-2 testimonials/success stories", "1-2 memes/entertainment", "1 behind-the-scenes/founder story", "1 trending audio remix"]
  }
];

export const trendingSounds = [
  "Search TikTok Creative Center for today's viral sounds",
  "Gaming-related trending audio updates weekly",
  "Use sounds with 100K-1M uses (sweet spot for discovery)",
  "Original audio can work if content is exceptional"
];
