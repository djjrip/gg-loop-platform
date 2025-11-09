import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GameCard from "@/components/GameCard";
import StatsCard from "@/components/StatsCard";
import LeaderboardRow from "@/components/LeaderboardRow";
import CommunityFeedItem from "@/components/CommunityFeedItem";
import RewardsCard from "@/components/RewardsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Gamepad2, Award, TrendingUp, Users, Zap } from "lucide-react";

import fpsImage from "@assets/generated_images/FPS_game_thumbnail_ffb034b2.png";
import mobaImage from "@assets/generated_images/MOBA_game_thumbnail_79147e70.png";
import brImage from "@assets/generated_images/Battle_royale_game_thumbnail_05e0c32d.png";
import racingImage from "@assets/generated_images/Racing_game_thumbnail_ae2f5f31.png";
import sportsImage from "@assets/generated_images/Sports_game_thumbnail_e284923e.png";

export default function Home() {
  // TODO: Remove mock data - replace with real API calls
  const games = [
    { title: "Tactical Warfare", image: fpsImage, category: "FPS", players: "250K", avgScore: "2,450", challenges: 12 },
    { title: "Arena Legends", image: mobaImage, category: "MOBA", players: "180K", avgScore: "3,200", challenges: 8 },
    { title: "Battle Grounds", image: brImage, category: "Battle Royale", players: "320K", avgScore: "1,850", challenges: 15 },
    { title: "Speed Racer", image: racingImage, category: "Racing", players: "95K", avgScore: "4,100", challenges: 6 },
    { title: "Ultimate Soccer", image: sportsImage, category: "Sports", players: "140K", avgScore: "2,900", challenges: 10 },
  ];

  const leaderboardData = [
    { rank: 1, username: "ProGamer99", score: "45,230", games: 342 },
    { rank: 2, username: "SkillMaster", score: "42,150", games: 318 },
    { rank: 3, username: "GameChamp", score: "39,890", games: 295 },
    { rank: 4, username: "ElitePlayer", score: "38,540", games: 281 },
    { rank: 5, username: "You", score: "35,120", games: 256, isCurrentUser: true },
  ];

  const communityFeed = [
    { username: "ProGamer99", action: "unlocked achievement", game: "Tactical Warfare", details: "Perfect Victory - Won match without losing a round", time: "2m ago", type: "achievement" as const },
    { username: "SkillMaster", action: "set new high score", game: "Speed Racer", details: "Track Record: Neon City - 1:42.350", time: "15m ago", type: "highscore" as const },
    { username: "GameChamp", action: "reached milestone", game: "Arena Legends", details: "100 Wins Achievement Unlocked", time: "1h ago", type: "milestone" as const },
    { username: "ElitePlayer", action: "unlocked achievement", game: "Battle Grounds", details: "Victory Royale - First Place Finish", time: "2h ago", type: "achievement" as const },
  ];

  const rewards = [
    { title: "Gaming Headset", description: "Premium wireless gaming headset with 7.1 surround sound", points: 15000, isUnlocked: true, category: "Gear" },
    { title: "$50 Steam Gift Card", description: "Expand your game library with this digital gift card", points: 10000, isUnlocked: true, isClaimed: true, category: "Digital" },
    { title: "Elite Controller", description: "Pro-grade controller with customizable buttons", points: 25000, isUnlocked: false, category: "Gear" },
    { title: "Gaming Chair", description: "Ergonomic gaming chair with lumbar support", points: 50000, isUnlocked: false, category: "Furniture" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Hero />

      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-24">
        {/* Stats Overview */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Points" value="12,450" icon={Trophy} subtitle="All-time earnings" trend="+15% this week" />
            <StatsCard title="Games Played" value="156" icon={Gamepad2} subtitle="Across all platforms" />
            <StatsCard title="Rank" value="#247" icon={TrendingUp} subtitle="Global ranking" trend="↑ 23 positions" />
            <StatsCard title="Win Rate" value="68%" icon={Award} subtitle="Last 30 days" />
          </div>
        </section>

        {/* Featured Games */}
        <section id="games">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold font-heading tracking-tight">Featured Games</h2>
              <p className="text-muted-foreground mt-2">Connect your gameplay and start earning rewards</p>
            </div>
            <Button variant="outline" data-testid="button-view-all-games">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.title} {...game} />
            ))}
          </div>
        </section>

        {/* Leaderboards */}
        <section id="leaderboards">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold font-heading tracking-tight">Leaderboards</h2>
              <p className="text-muted-foreground mt-2">See how you stack up against the competition</p>
            </div>
          </div>

          <Card className="p-6 border-primary/10">
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
                <TabsTrigger value="all-time" data-testid="tab-all-time">All-Time</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-2">
                {leaderboardData.map((player) => (
                  <LeaderboardRow key={player.rank} {...player} />
                ))}
              </TabsContent>
              
              <TabsContent value="weekly" className="space-y-2">
                {leaderboardData.map((player) => (
                  <LeaderboardRow key={player.rank} {...player} />
                ))}
              </TabsContent>
              
              <TabsContent value="all-time" className="space-y-2">
                {leaderboardData.map((player) => (
                  <LeaderboardRow key={player.rank} {...player} />
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </section>

        {/* Community & Rewards Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Community Feed */}
          <div id="community">
            <div className="mb-8">
              <h2 className="text-4xl font-bold font-heading tracking-tight">Community Feed</h2>
              <p className="text-muted-foreground mt-2">Recent achievements and highlights</p>
            </div>
            
            <div className="space-y-4">
              {communityFeed.map((item, idx) => (
                <CommunityFeedItem key={idx} {...item} />
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6" data-testid="button-load-more-feed">
              Load More
            </Button>
          </div>

          {/* Rewards */}
          <div id="rewards">
            <div className="mb-8">
              <h2 className="text-4xl font-bold font-heading tracking-tight">Rewards Catalog</h2>
              <p className="text-muted-foreground mt-2">Redeem your points for amazing prizes</p>
            </div>
            
            <div className="space-y-4">
              {rewards.map((reward) => (
                <RewardsCard key={reward.title} {...reward} />
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6" data-testid="button-view-all-rewards">
              View All Rewards
            </Button>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading tracking-tight">How It Works</h2>
            <p className="text-muted-foreground mt-2 text-lg">Start earning rewards in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-primary/10 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Your Games</h3>
                <p className="text-muted-foreground">Link your gaming accounts from Steam, Epic Games, Xbox, and more</p>
              </div>
            </Card>

            <Card className="p-8 text-center border-primary/10 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Play & Compete</h3>
                <p className="text-muted-foreground">Complete challenges, climb leaderboards, and earn points automatically</p>
              </div>
            </Card>

            <Card className="p-8 text-center border-primary/10 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Claim Rewards</h3>
                <p className="text-muted-foreground">Redeem your points for gaming gear, gift cards, and exclusive prizes</p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <Card className="p-12 text-center relative overflow-hidden border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold font-heading tracking-tight mb-4">Ready to Start Earning?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of gamers who are already turning their gameplay into real rewards
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="text-base font-semibold" data-testid="button-create-account">
                  <Users className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
                <Button size="lg" variant="outline" className="text-base font-semibold" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-heading tracking-tight">GG LOOP</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The premier platform for gamers to earn real-world rewards.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#games" className="hover:text-foreground">Games</a></li>
                <li><a href="#leaderboards" className="hover:text-foreground">Leaderboards</a></li>
                <li><a href="#rewards" className="hover:text-foreground">Rewards</a></li>
                <li><a href="#community" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 GG Loop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
