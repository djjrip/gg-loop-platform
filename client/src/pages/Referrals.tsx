import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trophy, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SiX, SiTiktok, SiDiscord, SiYoutube, SiTwitch } from "react-icons/si";

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
    if (!stats?.referralCode) {
      toast({
        title: "Error",
        description: "Referral code not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    if (!stats?.referralCode) {
      toast({
        title: "Error",
        description: "Referral code not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(stats.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const validateReferralCode = (): boolean => {
    if (!stats?.referralCode) {
      toast({
        title: "Error",
        description: "Referral code not available. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
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
        <Card data-testid="card-referral-code" className="hover-elevate border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" />
              Share with Your Community
            </CardTitle>
            <CardDescription>Build your fanbase and earn rewards together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                {/* Mutual Benefit Callout */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Everyone Wins</p>
                      <p className="text-muted-foreground">
                        Your fans get <span className="font-bold text-primary">50 bonus points</span> when they join with your code. 
                        You earn <span className="font-bold text-primary">points for each referral</span> that can level up to {REFERRAL_TIERS[REFERRAL_TIERS.length - 1].pointsPerReferral} pts per friend!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referral Code Display */}
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-2">Your Unique Referral Code</div>
                  <div className="flex items-center gap-2">
                    <code className="text-3xl font-mono font-bold flex-1 text-primary" data-testid="text-referral-code">
                      {stats?.referralCode}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyReferralCode}
                      data-testid="button-copy-code"
                      className="hover-elevate"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Share this code in your stream overlays, video descriptions, and Discord server
                  </div>
                </div>

                {/* Quick Copy Link */}
                <div>
                  <div className="text-sm font-medium mb-2">Referral Link</div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={copyReferralLink}
                    disabled={statsLoading || !stats?.referralCode}
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link to Clipboard
                  </Button>
                </div>

                {/* Social Platform Sharing */}
                <div>
                  <div className="text-sm font-medium mb-3">Share on Social Media</div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Twitter/X */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (!validateReferralCode()) return;
                        const text = `Join me on GG Loop and turn your gaming into rewards! Use my code ${stats.referralCode} to get 50 bonus points when you sign up.`;
                        const url = `${window.location.origin}?ref=${stats.referralCode}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      disabled={statsLoading || !stats?.referralCode}
                      data-testid="button-share-twitter"
                    >
                      <SiX className="w-4 h-4" />
                      X / Twitter
                    </Button>

                    {/* TikTok - Copy caption */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (!validateReferralCode()) return;
                        const caption = `Gaming just got BETTER! Join me on GG Loop - earn real rewards just by playing.\n\nUse code: ${stats.referralCode}\nLink: ${window.location.origin}?ref=${stats.referralCode}\n\nBoth of us get bonus points! #GGLoop #GamingRewards #Gamer`;
                        navigator.clipboard.writeText(caption);
                        toast({
                          title: "TikTok Caption Copied!",
                          description: "Paste this into your TikTok video caption",
                        });
                      }}
                      disabled={statsLoading || !stats?.referralCode}
                      data-testid="button-share-tiktok"
                    >
                      <SiTiktok className="w-4 h-4" />
                      TikTok
                    </Button>

                    {/* Discord */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (!validateReferralCode()) return;
                        const message = `Hey everyone! I'm earning rewards for my gaming on GG Loop. Join me and we both get bonus points!\n\nUse my code: **${stats.referralCode}**\nSign up: ${window.location.origin}?ref=${stats.referralCode}\n\nLet's build this together!`;
                        navigator.clipboard.writeText(message);
                        toast({
                          title: "Discord Message Copied!",
                          description: "Paste this in your Discord server",
                        });
                      }}
                      disabled={statsLoading || !stats?.referralCode}
                      data-testid="button-share-discord"
                    >
                      <SiDiscord className="w-4 h-4" />
                      Discord
                    </Button>

                    {/* YouTube */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (!validateReferralCode()) return;
                        const description = `SUPPORT THE CHANNEL & EARN REWARDS!\n\nJoin me on GG Loop - turn your gaming into real rewards (gift cards, gaming gear, etc.)\n\nUse my code: ${stats.referralCode}\nSign up here: ${window.location.origin}?ref=${stats.referralCode}\n\nYou get 50 bonus points when you use my code!\n#GGLoop #GamingRewards`;
                        navigator.clipboard.writeText(description);
                        toast({
                          title: "YouTube Description Copied!",
                          description: "Paste this in your video description",
                        });
                      }}
                      disabled={statsLoading || !stats?.referralCode}
                      data-testid="button-share-youtube"
                    >
                      <SiYoutube className="w-4 h-4" />
                      YouTube
                    </Button>

                    {/* Twitch */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 justify-start col-span-2"
                      onClick={() => {
                        if (!validateReferralCode()) return;
                        const panelText = `Join me on GG Loop and earn rewards for gaming!\n\nUse code: ${stats.referralCode}\nLink: ${window.location.origin}?ref=${stats.referralCode}\n\nBoth of us get bonus points when you sign up!`;
                        navigator.clipboard.writeText(panelText);
                        toast({
                          title: "Twitch Panel Text Copied!",
                          description: "Add this to your Twitch panels or !commands",
                        });
                      }}
                      disabled={statsLoading || !stats?.referralCode}
                      data-testid="button-share-twitch"
                    >
                      <SiTwitch className="w-5 h-5" />
                      Twitch Panel / Commands
                    </Button>
                  </div>
                </div>

                {/* Creator Tips */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Pro Tips for Creators:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Add your code to stream overlays and going live posts</li>
                    <li>• Pin your referral link in Discord announcements</li>
                    <li>• Include it in video descriptions and TikTok bios</li>
                    <li>• Create a !ggloop chat command with your code</li>
                  </ul>
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
