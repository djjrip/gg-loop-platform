import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GameCard from "@/components/GameCard";
import StatsCard from "@/components/StatsCard";
import LeaderboardRow from "@/components/LeaderboardRow";
import CommunityFeedItem from "@/components/CommunityFeedItem";
import RewardsCard from "@/components/RewardsCard";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Gamepad2, Award, TrendingUp, Users, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Game, LeaderboardEntryWithUser, Achievement, Reward } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "all-time">("weekly");
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const { toast } = useToast();

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      try {
        const res = await apiRequest("POST", "/api/user/rewards/redeem", { rewardId });
        return await res.json();
      } catch (error: any) {
        const errorMessage = error.response
          ? await error.response.json().then((data: any) => data.message).catch(() => "Failed to claim reward")
          : error.message || "Failed to claim reward";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      setClaimingRewardId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/rewards"] });
      toast({
        title: "Success!",
        description: "Reward claimed successfully!",
      });
    },
    onError: (error: Error) => {
      setClaimingRewardId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  const handleClaimReward = (rewardId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to claim rewards",
        variant: "destructive",
      });
      return;
    }
    
    setClaimingRewardId(rewardId);
    claimRewardMutation.mutate(rewardId);
  };

  // Fetch games from API
  const { data: games, isLoading: gamesLoading, error: gamesError, refetch: refetchGames } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  // Fetch leaderboard data - use first game from the list
  const firstGameId = games?.[0]?.id;
  const { data: leaderboardEntries, isLoading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useQuery<LeaderboardEntryWithUser[]>({
    queryKey: ["/api/leaderboard", firstGameId, selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/leaderboard/${firstGameId}/${selectedPeriod}`);
      return res.json();
    },
    enabled: !!firstGameId,
  });

  // Fetch achievements if user is authenticated
  const { data: achievements, isLoading: achievementsLoading, error: achievementsError, refetch: refetchAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/user/achievements"],
    enabled: isAuthenticated,
  });

  // Fetch rewards from API
  const { data: rewards, isLoading: rewardsLoading, error: rewardsError, refetch: refetchRewards } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  // Fetch user's claimed rewards
  const { data: userRewards } = useQuery<any[]>({
    queryKey: ["/api/user/rewards"],
    enabled: isAuthenticated,
  });

  // Mock community feed (as requested to keep this mocked)
  const communityFeed = [
    { username: "ProGamer99", action: "unlocked achievement", game: "Tactical Warfare", details: "Perfect Victory - Won match without losing a round", time: "2m ago", type: "achievement" as const },
    { username: "SkillMaster", action: "set new high score", game: "Speed Racer", details: "Track Record: Neon City - 1:42.350", time: "15m ago", type: "highscore" as const },
    { username: "GameChamp", action: "reached milestone", game: "Arena Legends", details: "100 Wins Achievement Unlocked", time: "1h ago", type: "milestone" as const },
    { username: "ElitePlayer", action: "unlocked achievement", game: "Battle Grounds", details: "Victory Royale - First Place Finish", time: "2h ago", type: "achievement" as const },
  ];

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

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
            {gamesLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-primary/5">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </>
            ) : gamesError ? (
              <div className="col-span-full">
                <ErrorDisplay 
                  message="Failed to load games. Please try again." 
                  onRetry={() => refetchGames()} 
                />
              </div>
            ) : games && games.length > 0 ? (
              games.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  image={game.imageUrl}
                  category={game.category}
                  players={formatNumber(game.players)}
                  avgScore={game.avgScore.toLocaleString()}
                  challenges={game.challenges}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No games available at the moment.
              </div>
            )}
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

          <Card className="p-6 border-primary/5">
            <Tabs 
              defaultValue="weekly" 
              className="w-full"
              onValueChange={(value) => setSelectedPeriod(value as "daily" | "weekly" | "all-time")}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
                <TabsTrigger value="all-time" data-testid="tab-all-time">All-Time</TabsTrigger>
              </TabsList>
              
              {["daily", "weekly", "all-time"].map((period) => (
                <TabsContent key={period} value={period} className="space-y-2">
                  {leaderboardLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </>
                  ) : leaderboardError ? (
                    <ErrorDisplay 
                      message="Failed to load leaderboard. Please try again." 
                      onRetry={() => refetchLeaderboard()} 
                    />
                  ) : leaderboardEntries && leaderboardEntries.length > 0 ? (
                    leaderboardEntries.map((entry) => (
                      <LeaderboardRow
                        key={entry.id}
                        rank={entry.rank}
                        username={entry.user.email || entry.user.firstName || `Player ${entry.userId.substring(0, 8)}`}
                        score={entry.score.toLocaleString()}
                        games={0}
                        isCurrentUser={user?.id === entry.userId}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No leaderboard data available for this period.
                    </div>
                  )}
                </TabsContent>
              ))}
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
              {rewardsLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              ) : rewardsError ? (
                <ErrorDisplay 
                  message="Failed to load rewards. Please try again." 
                  onRetry={() => refetchRewards()} 
                />
              ) : rewards && rewards.length > 0 ? (
                rewards.slice(0, 4).map((reward) => {
                  const isClaimed = userRewards?.some(ur => ur.rewardId === reward.id) || false;
                  return (
                    <RewardsCard
                      key={reward.id}
                      id={reward.id}
                      title={reward.title}
                      description={reward.description || ""}
                      points={reward.pointsCost}
                      isUnlocked={user ? user.totalPoints >= reward.pointsCost : false}
                      isClaimed={isClaimed}
                      category={reward.category}
                      onClaim={handleClaimReward}
                      isClaimLoading={claimingRewardId === reward.id}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No rewards available at the moment.
                </div>
              )}
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
            <Card className="p-8 text-center border-primary/5 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Your Games</h3>
                <p className="text-muted-foreground">Link your gaming accounts from Steam, Epic Games, Xbox, and more</p>
              </div>
            </Card>

            <Card className="p-8 text-center border-primary/5 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Play & Compete</h3>
                <p className="text-muted-foreground">Complete challenges, climb leaderboards, and earn points automatically</p>
              </div>
            </Card>

            <Card className="p-8 text-center border-primary/5 relative overflow-hidden group hover-elevate">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <Card className="p-12 text-center relative overflow-hidden border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-transparent" />
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
