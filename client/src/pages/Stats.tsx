import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Gift, Zap, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Reward } from "@shared/schema";
import OnlineUsersCounter from "@/components/OnlineUsersCounter";
import MatchSyncStatus from "@/components/MatchSyncStatus";
import GlobalActivityFeed from "@/components/GlobalActivityFeed";
import AnimatedCounter from "@/components/AnimatedCounter";

interface RiotMatch {
  id: string;
  matchId: string;
  game: 'league' | 'valorant';
  gameName: string;
  tagLine: string;
  region: string;
  isWin: boolean;
  pointsAwarded: number;
  gameEndedAt: string;
  processedAt: string;
}

interface RiotAccountStatus {
  linked: boolean;
  gameName?: string;
  tagLine?: string;
  region?: string;
}

export default function Stats() {
  const { user, isAuthenticated } = useAuth();

  const { data: matches, isLoading: matchesLoading } = useQuery<RiotMatch[]>({
    queryKey: ["/api/riot/matches"],
    enabled: isAuthenticated,
  });

  const { data: leagueAccount } = useQuery<RiotAccountStatus>({
    queryKey: ["/api/riot/account/league"],
    enabled: isAuthenticated,
  });

  const { data: valorantAccount } = useQuery<RiotAccountStatus>({
    queryKey: ["/api/riot/account/valorant"],
    enabled: isAuthenticated,
  });

  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" data-testid="text-login-required">Login Required</h1>
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
          <Link href="/login">
            <Button className="mt-6" data-testid="button-login">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasLinkedAccounts = leagueAccount?.linked || valorantAccount?.linked;
  const recentMatches = matches?.slice(0, 5) || [];
  const topRewards = rewards?.slice(0, 3) || [];
  
  const wins = matches?.filter(m => m.isWin).length || 0;
  const losses = matches?.filter(m => !m.isWin).length || 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const totalPointsFromMatches = matches?.reduce((sum, m) => sum + (m.pointsAwarded || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold font-heading mb-2" data-testid="text-welcome">
                Welcome back, {user?.username || user?.email?.split('@')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground">
                Track your performance and redeem rewards
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <OnlineUsersCounter />
              <MatchSyncStatus />
            </div>
          </div>
        </div>

        {/* Points Balance - Large Display */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-points-balance">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Available Points</span>
              </div>
              <div className="text-7xl font-bold font-mono text-primary" data-testid="text-points-balance">
                {user?.totalPoints?.toLocaleString() || 0}
              </div>
              <p className="text-muted-foreground">
                Points earned from matches: {totalPointsFromMatches.toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Link href="/shop">
                  <Button size="lg" data-testid="button-redeem-points">
                    <Gift className="mr-2 h-5 w-5" />
                    Redeem Points
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" size="lg" data-testid="button-upgrade">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Upgrade Tier
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Match Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card data-testid="card-total-games">
                <CardHeader className="pb-3">
                  <CardDescription>Total Games</CardDescription>
                  <CardTitle className="text-3xl font-mono">
                    <AnimatedCounter value={totalGames} />
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card data-testid="card-win-rate">
                <CardHeader className="pb-3">
                  <CardDescription>Win Rate</CardDescription>
                  <CardTitle className="text-3xl font-mono">
                    <AnimatedCounter value={winRate} />%
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card data-testid="card-points-earned">
                <CardHeader className="pb-3">
                  <CardDescription>Points Earned</CardDescription>
                  <CardTitle className="text-3xl font-mono">
                    <AnimatedCounter value={totalPointsFromMatches} />
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Matches */}
            <Card data-testid="card-recent-matches">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Recent Matches</CardTitle>
                    <CardDescription>Your latest ranked games</CardDescription>
                  </div>
                  {!hasLinkedAccounts && (
                    <Link href="/settings">
                      <Button variant="outline" size="sm" data-testid="button-connect-riot">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect Riot ID
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                    <p>Loading matches...</p>
                  </div>
                ) : !hasLinkedAccounts ? (
                  <div className="text-center py-12 space-y-4">
                    <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="font-semibold mb-2" data-testid="text-no-riot-account">Optional: Track Your Match Stats</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                        Link your League of Legends or Valorant account to automatically track match history and stats. This is completely optional - you can still redeem rewards with your monthly points allocation!
                      </p>
                      <Link href="/settings">
                        <Button data-testid="button-go-to-settings">
                          Link Game Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-4">
                        More games coming soon!
                      </p>
                    </div>
                  </div>
                ) : recentMatches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p data-testid="text-no-matches">No matches found. Play some ranked games to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`match-${match.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={match.isWin ? "default" : "secondary"}
                            className="w-16 justify-center"
                            data-testid={`badge-result-${match.id}`}
                          >
                            {match.isWin ? "Win" : "Loss"}
                          </Badge>
                          <div>
                            <p className="font-medium" data-testid={`text-game-${match.id}`}>
                              {match.game === 'league' ? 'League of Legends' : 'Valorant'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(match.gameEndedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary font-mono" data-testid={`text-points-${match.id}`}>
                            +{match.pointsAwarded} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rewards Preview */}
          <div className="space-y-6">
            <Card data-testid="card-rewards-preview">
              <CardHeader>
                <CardTitle className="text-2xl">Top Rewards</CardTitle>
                <CardDescription>Redeem your points</CardDescription>
              </CardHeader>
              <CardContent>
                {topRewards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No rewards available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topRewards.map((reward) => (
                      <div 
                        key={reward.id} 
                        className="border rounded-lg overflow-hidden hover-elevate"
                        data-testid={`reward-${reward.id}`}
                      >
                        {reward.imageUrl && (
                          <div className="aspect-video bg-muted">
                            <img 
                              src={reward.imageUrl} 
                              alt={reward.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <h4 className="font-semibold line-clamp-2" data-testid={`text-reward-title-${reward.id}`}>
                            {reward.title}
                          </h4>
                          <p className="text-primary font-bold font-mono" data-testid={`text-reward-points-${reward.id}`}>
                            {reward.pointsCost.toLocaleString()} pts
                          </p>
                          {user?.totalPoints && user.totalPoints >= reward.pointsCost ? (
                            <Badge variant="default" className="w-full justify-center">
                              Can Redeem
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-full justify-center">
                              Need {(reward.pointsCost - (user?.totalPoints || 0)).toLocaleString()} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/shop">
                  <Button className="w-full mt-4" variant="outline" data-testid="button-view-all">
                    View All Rewards
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-account-settings">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </Link>
                <Link href="/my-rewards">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-my-rewards">
                    <Gift className="mr-2 h-4 w-4" />
                    My Rewards
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-manage-subscription">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Global Activity Feed */}
            <GlobalActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
