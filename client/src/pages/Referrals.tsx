import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trophy, Users, TrendingUp, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  currentTier: {
    minReferrals: number;
    pointsPerReferral: number;
    bonusPoints: number;
    name: string;
  } | null;
  totalPointsEarned: number;
  referrals: Array<{
    id: string;
    status: string;
    username: string;
    createdAt: string;
    completedAt: string | null;
    pointsAwarded: number;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  referralCount: number;
  totalPoints: number;
}

const REFERRAL_TIERS = [
  { minReferrals: 1, pointsPerReferral: 50, bonusPoints: 0, name: 'Bronze', color: 'bg-orange-400' },
  { minReferrals: 3, pointsPerReferral: 75, bonusPoints: 150, name: 'Silver', color: 'bg-gray-300' },
  { minReferrals: 10, pointsPerReferral: 100, bonusPoints: 500, name: 'Gold', color: 'bg-yellow-400' },
  { minReferrals: 25, pointsPerReferral: 150, bonusPoints: 1500, name: 'Platinum', color: 'bg-blue-400' },
  { minReferrals: 50, pointsPerReferral: 200, bonusPoints: 5000, name: 'Diamond', color: 'bg-purple-400' },
];

export default function Referrals() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/my-stats'],
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ['/api/referrals/leaderboard'],
  });

  const copyReferralLink = () => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const getNextTier = () => {
    if (!stats) return null;
    const currentCount = stats.completedReferrals;
    return REFERRAL_TIERS.find(tier => currentCount < tier.minReferrals);
  };

  const nextTier = getNextTier();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn rewards for every subscriber you bring</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card data-testid="card-referral-stats" className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Referrals
            </CardTitle>
            <CardDescription>Total friends invited</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-4xl font-bold font-mono">{stats?.totalReferrals || 0}</div>
            )}
            {!statsLoading && stats && (
              <div className="mt-2 flex gap-2">
                <Badge variant="outline" data-testid="badge-completed-referrals">
                  {stats.completedReferrals} completed
                </Badge>
                <Badge variant="secondary" data-testid="badge-pending-referrals">
                  {stats.pendingReferrals} pending
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-tier-status" className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Current Tier
            </CardTitle>
            <CardDescription>Your referral reward level</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : stats?.currentTier ? (
              <>
                <div className="text-4xl font-bold mb-2">{stats.currentTier.name}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.currentTier.pointsPerReferral} pts per referral
                </div>
                {nextTier && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Next: {nextTier.name}</div>
                    <div className="text-sm font-medium">
                      {nextTier.minReferrals - stats.completedReferrals} more referrals to unlock
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-2xl text-muted-foreground">No tier yet</div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-points-earned" className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Points Earned
            </CardTitle>
            <CardDescription>Total from referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-4xl font-bold font-mono text-[#B8724D]">
                {stats?.totalPointsEarned.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card data-testid="card-referral-code" className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Code
            </CardTitle>
            <CardDescription>Invite friends to join GG Loop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="p-4 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Your Referral Code</div>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold flex-1" data-testid="text-referral-code">
                      {stats?.referralCode}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyReferralCode}
                      data-testid="button-copy-code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={copyReferralLink}
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Referral Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `Join me on GG Loop! Use my code ${stats?.referralCode} to get started 🎮`;
                      const url = `${window.location.origin}?ref=${stats?.referralCode}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    data-testid="button-share-twitter"
                  >
                    Share on X
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-tier-rewards" className="hover-elevate">
          <CardHeader>
            <CardTitle>Reward Tiers</CardTitle>
            <CardDescription>Unlock better rewards as you grow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {REFERRAL_TIERS.map((tier) => {
              const isUnlocked = (stats?.completedReferrals || 0) >= tier.minReferrals;
              return (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                    isUnlocked ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                  }`}
                  data-testid={`tier-${tier.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                    <div>
                      <div className="font-medium">{tier.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tier.minReferrals}+ referrals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold">{tier.pointsPerReferral} pts</div>
                    {tier.bonusPoints > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{tier.bonusPoints} bonus
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-leaderboard" className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>Top referrers on GG Loop</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboardData.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-4 p-4 bg-muted rounded-md hover-elevate"
                  data-testid={`leaderboard-entry-${entry.rank}`}
                >
                  <div className="w-12 text-center">
                    {entry.rank <= 3 ? (
                      <Trophy className={`w-6 h-6 inline ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        'text-orange-400'
                      }`} />
                    ) : (
                      <div className="text-2xl font-bold text-muted-foreground">
                        {entry.rank}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" data-testid={`text-username-${entry.rank}`}>
                      {entry.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.referralCount} referrals
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#B8724D]" data-testid={`text-points-${entry.rank}`}>
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrers yet. Be the first!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
