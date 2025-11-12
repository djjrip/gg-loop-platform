import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GameCard from "@/components/GameCard";
import StatsCard from "@/components/StatsCard";
import LeaderboardRow from "@/components/LeaderboardRow";
import CommunityFeedItem from "@/components/CommunityFeedItem";
import RewardsCard from "@/components/RewardsCard";
import ChallengeCard from "@/components/ChallengeCard";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "all-time">("weekly");
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [claimingChallengeId, setClaimingChallengeId] = useState<string | null>(null);
  const { toast} = useToast();

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

  // Fetch recent match submissions (earnings)
  interface MatchSubmission {
    id: string;
    gameId: string;
    matchType: string;
    notes: string | null;
    screenshotUrl: string | null;
    status: string;
    pointsAwarded: number | null;
    submittedAt: string;
    reviewedAt: string | null;
    gameName: string;
    game?: Game;
  }

  const { data: recentEarnings, isLoading: earningsLoading, error: earningsError } = useQuery<MatchSubmission[]>({
    queryKey: ["/api/match-submissions"],
    enabled: isAuthenticated,
  });

  // Fetch active challenges
  interface Challenge {
    id: string;
    title: string;
    description: string;
    sponsorName: string;
    sponsorLogo?: string;
    requirementCount: number;
    bonusPoints: number;
    endDate: string;
    userProgress: number | null;
    canClaim: boolean;
    claimed: boolean;
  }

  const { data: challenges, isLoading: challengesLoading, error: challengesError, refetch: refetchChallenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const claimChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      try {
        const res = await apiRequest("POST", `/api/challenges/${challengeId}/claim`, {});
        return await res.json();
      } catch (error: any) {
        const errorMessage = error.response
          ? await error.response.json().then((data: any) => data.message).catch(() => "Failed to claim challenge")
          : error.message || "Failed to claim challenge";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      setClaimingChallengeId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: `Claimed ${data.pointsAwarded} bonus points! Your balance has been updated.`,
      });
    },
    onError: (error: Error) => {
      setClaimingChallengeId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to claim challenge",
        variant: "destructive",
      });
    },
  });

  const handleClaimChallenge = (challengeId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to claim challenge rewards",
        variant: "destructive",
      });
      return;
    }
    
    setClaimingChallengeId(challengeId);
    claimChallengeMutation.mutate(challengeId);
  };

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

      {/* MISSION STATEMENT */}
      <section className="relative py-24 bg-gradient-to-b from-card to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsIDE0MCwgNjYsIDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-primary/30 text-primary">
              Our Mission
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">
              Your Passion. <span className="text-primary">Your Paycheck.</span>
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-xl text-foreground font-semibold">
                For years, gamers have been told their passion is a "waste of time." <span className="text-primary">We're here to prove them wrong.</span>
              </p>
              
              <p>
                Remember when you were told to "log off" and "do something productive"? GG Loop is here to <span className="text-primary font-semibold">heal that inner kid</span> who loved gaming but was made to feel guilty about it. Your passion was never a waste—it was just waiting for the right platform.
              </p>
              
              <p>
                GG Loop was built to legitimize gaming as a real income source. Whether you're streaming to 5 viewers or 5,000, you deserve to earn from your skill. We believe every clutch play, every comeback, every grind session should translate to real-world value.
              </p>
              
              <p>
                <span className="font-semibold text-foreground">Starting with zero followers?</span> Perfect. Our leaderboards and point system reward skill, not just popularity. Climb the ranks. Earn your way. Unlock partnerships and sponsorships <span className="text-primary font-semibold">through GG Loop</span> as you prove your dedication.
              </p>
              
              <p className="text-2xl font-bold text-foreground pt-4">
                Play. Earn. LOOP. <span className="text-primary">Rinse and repeat.</span>
              </p>
              
              <p className="text-base italic">
                This is your access to glory. This is your path to proving that gaming isn't a waste—it's an opportunity. Welcome to the LOOP.
              </p>
            </div>
            
            <div className="pt-8">
              <Link href="/subscription">
                <Button size="lg" className="text-lg font-bold px-10 py-7 h-auto shadow-lg" data-testid="button-mission-cta">
                  <Trophy className="h-5 w-5 mr-2" />
                  Start Your Journey Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </section>

      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-24">
        {/* SPONSORED CHALLENGES - Enable users to actually EARN money! */}
        <section id="challenges" className="scroll-mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-5xl font-bold font-heading tracking-tight flex items-center justify-center gap-3">
              <Zap className="w-10 h-10 text-primary" />
              Sponsored Challenges
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              Complete challenges to earn bonus points that bypass your monthly earning cap. Real sponsors, real rewards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengesLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-64 w-full" />
                  </Card>
                ))}
              </>
            ) : challengesError ? (
              <div className="col-span-full">
                <ErrorDisplay 
                  message="Failed to load challenges. Please try again." 
                  onRetry={() => refetchChallenges()} 
                />
              </div>
            ) : challenges && challenges.length > 0 ? (
              challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  sponsorName={challenge.sponsorName}
                  sponsorLogo={challenge.sponsorLogo}
                  requirementCount={challenge.requirementCount}
                  bonusPoints={challenge.bonusPoints}
                  userProgress={challenge.userProgress || 0}
                  canClaim={challenge.canClaim}
                  claimed={challenge.claimed}
                  endDate={challenge.endDate}
                  onClaim={handleClaimChallenge}
                  isClaimLoading={claimingChallengeId === challenge.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No active challenges at the moment. Check back soon for new sponsored challenges!
              </div>
            )}
          </div>
        </section>

        {/* REWARDS CATALOG - PRIORITY #1 */}
        <section id="rewards" className="scroll-mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-5xl font-bold font-heading tracking-tight flex items-center justify-center gap-3">
              <span className="w-1 h-10 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
              Earn Real Rewards
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              Turn your gaming skills into rewards - gaming gear, subscriptions, and exclusive perks. Start earning today.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardsLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-48 w-full" />
                  </Card>
                ))}
              </>
            ) : rewardsError ? (
              <div className="col-span-full">
                <ErrorDisplay 
                  message="Failed to load rewards. Please try again." 
                  onRetry={() => refetchRewards()} 
                />
              </div>
            ) : rewards && rewards.length > 0 ? (
              rewards.slice(0, 9).map((reward) => {
                const isClaimed = userRewards?.some(ur => ur.rewardId === reward.id) || false;
                const canAfford = user ? user.totalPoints >= reward.pointsCost : false;
                return (
                  <RewardsCard
                    key={reward.id}
                    id={reward.id}
                    title={reward.title}
                    description={reward.description || ""}
                    points={reward.pointsCost}
                    isUnlocked={true}
                    isClaimed={isClaimed}
                    category={reward.category}
                    onClaim={handleClaimReward}
                    isClaimLoading={claimingRewardId === reward.id}
                    canAfford={canAfford}
                    currentPoints={user?.totalPoints || 0}
                    imageUrl={reward.imageUrl}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No rewards available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Recent Earnings - Show earning activity */}
        {isAuthenticated && (
          <section className="scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
                <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
                Your Recent Earnings
              </h2>
              <p className="text-muted-foreground mt-2 ml-4">Track your verified match wins and points earned</p>
            </div>
            
            <Card className="p-6 border-primary/20">{earningsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : earningsError ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Failed to load earnings. Please try again later.</p>
              </div>
            ) : !recentEarnings || recentEarnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No earnings yet!</p>
                <p className="text-sm">Report your first win to start earning points.</p>
                <Button variant="default" asChild className="mt-4" data-testid="button-report-first-win">
                  <a href="/report-match">Report Win</a>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {recentEarnings.slice(0, 5).map((earning) => {
                    const earnedDate = new Date(earning.submittedAt);
                    const now = new Date();
                    const diffMs = now.getTime() - earnedDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    
                    let timeAgo = "";
                    if (diffMins < 1) timeAgo = "Just now";
                    else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                    else timeAgo = `${diffDays}d ago`;

                    return (
                      <div 
                        key={earning.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10 hover-elevate"
                        data-testid={`earning-${earning.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Trophy className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{earning.gameName || earning.game?.title || "Unknown Game"}</span>
                              <Badge variant="secondary" className="text-xs">
                                {earning.matchType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{timeAgo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary font-mono" data-testid={`text-earning-points-${earning.id}`}>
                            +{earning.pointsAwarded || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {recentEarnings.length > 5 && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" asChild data-testid="button-view-all-earnings">
                      <a href="/report-match">View All Matches</a>
                    </Button>
                  </div>
                )}
              </>
            )}
            </Card>
          </section>
        )}

        {/* Featured Games */}
        <section id="games">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
                <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
                Featured Games
              </h2>
              <p className="text-muted-foreground mt-2 ml-4">Connect your gameplay and start earning rewards</p>
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
              <h2 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
                <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
                Leaderboards
              </h2>
              <p className="text-muted-foreground mt-2 ml-4">See how you stack up against the competition</p>
            </div>
          </div>

          <Card className="p-6 border-primary/20 hover:border-primary/30 transition-colors">
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

        {/* Community Feed */}
        <section id="community">
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
              <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
              Community Feed
            </h2>
            <p className="text-muted-foreground mt-2 ml-4">Recent achievements and highlights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityFeed.map((item, idx) => (
              <CommunityFeedItem key={idx} {...item} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" data-testid="button-load-more-feed">
              Load More
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
                <p className="text-muted-foreground">Redeem your points for gaming peripherals, subscriptions, and exclusive prizes</p>
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
      
    </div>
  );
}
