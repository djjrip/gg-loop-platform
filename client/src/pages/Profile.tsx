import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { RiotIdentityCard } from "@/components/RiotIdentityCard";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Gamepad2,
  TrendingUp,
  Share2
} from "lucide-react";
import Header from "@/components/Header";
import { ShareButtons } from "@/components/ShareButtons";
import TrophyCard from "@/components/TrophyCard";
import ShareableCard from "@/components/ShareableCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface PublicProfile {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    totalPoints: number;
    gamesConnected: number;
    isFounder: boolean;
    founderNumber: number | null;
    twitchUsername: string | null;
    subscriptionTier: string | null;
    createdAt: string;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string | null;
    pointsAwarded: number;
    achievedAt: string;
    gameName: string;
  }>;
  leaderboardRankings: Array<{
    gameId: string;
    gameName: string;
    rank: number;
    score: number;
    period: string;
  }>;
  stats: {
    totalAchievements: number;
    totalMatchesPlayed: number;
    avgRank: number;
    joinedDaysAgo: number;
  };
  claimedBadges: Array<{
    id: string;
    title: string;
    redeemedAt: string;
  }>;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const { data: profile, isLoading } = useQuery<PublicProfile>({
    queryKey: [`/api/profile/${userId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">This gamer profile doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  const displayName = profile.user.firstName
    ? `${profile.user.firstName} ${profile.user.lastName || ''}`.trim()
    : profile.user.email?.split('@')[0] || 'Gamer';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Riot Identity Card (Owner Only) */}
        {currentUser?.id === profile.user.id && (
          <>
            <RiotIdentityCard />

            {/* Steam Account Linking */}
            <Card className="p-6 mb-6 border-blue-500/20 bg-gradient-to-br from-blue-950/20 to-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Steam Account</h3>
                    <p className="text-sm text-muted-foreground">Link your Steam profile to verify game ownership</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/api/steam/auth/init'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Link Steam
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {displayName[0]?.toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold" data-testid="text-profile-name">{displayName}</h1>
                {profile.user.isFounder && profile.user.founderNumber && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg"
                    data-testid="badge-founder"
                  >
                    OG MEMBER #{profile.user.founderNumber}
                  </Badge>
                )}
                {profile.user.isFounder && !profile.user.founderNumber && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg"
                    data-testid="badge-og-member"
                  >
                    OG MEMBER
                  </Badge>
                )}
                {profile.user.subscriptionTier && (
                  <Badge
                    variant="default"
                    className={`${profile.user.subscriptionTier.toLowerCase() === 'elite'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                      } text-white border-0 px-3 py-1 text-sm font-bold shadow-lg uppercase`}
                    data-testid={`badge-subscription-${profile.user.subscriptionTier.toLowerCase()}`}
                  >
                    {profile.user.subscriptionTier}
                  </Badge>
                )}
                {profile.claimedBadges && profile.claimedBadges.length > 0 && profile.claimedBadges.map((claimedBadge) => (
                  <Badge
                    key={claimedBadge.id}
                    variant="default"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg"
                    data-testid={`badge-claimed-${claimedBadge.title.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {claimedBadge.title}
                  </Badge>
                ))}
                {profile.user.twitchUsername && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg"
                    data-testid="badge-twitch"
                  >
                    {profile.user.twitchUsername}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-primary" data-testid="text-profile-points">
                    {profile.user.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground" data-testid="text-profile-games">
                    {profile.user.gamesConnected} games connected
                  </span>
                </div>
              </div>
              <ShareButtons
                title={`${displayName}'s GG Loop Profile`}
                description={`Check out my GG Loop gaming profile! ${profile.user.totalPoints.toLocaleString()} points earned`}
                hashtags={["GGLoop", "Gaming", "Gamer"]}
              />
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Achievements</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-achievements">
              {profile.stats.totalAchievements}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Avg Rank</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-avgrank">
              {profile.stats.avgRank > 0 ? `#${profile.stats.avgRank}` : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all games</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Member Since</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-days">
              {profile.stats.joinedDaysAgo}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Days ago</p>
          </Card>
        </div>

        {/* Trophy Case - NBA Top Shot Style */}
        {profile.achievements.length > 0 && (
          <div className="mb-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold font-heading tracking-tight mb-2">Trophy Case</h2>
              <p className="text-muted-foreground">Your collection of earned achievements</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.achievements.map((achievement, idx) => (
                <div key={achievement.id} className="space-y-3">
                  <TrophyCard
                    title={achievement.title}
                    description={achievement.description || undefined}
                    gameName={achievement.gameName}
                    pointsAwarded={achievement.pointsAwarded}
                    achievedAt={achievement.achievedAt}
                    rarity={
                      achievement.pointsAwarded >= 100 ? "legendary" :
                        achievement.pointsAwarded >= 50 ? "epic" :
                          achievement.pointsAwarded >= 25 ? "rare" : "common"
                    }
                    serialNumber={`#${idx + 1}/${profile.achievements.length}`}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedAchievement(achievement);
                      setShareDialogOpen(true);
                    }}
                    data-testid={`button-share-achievement-${idx}`}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Achievement
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Rankings */}
        {profile.leaderboardRankings.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Leaderboard Rankings
            </h2>
            <div className="space-y-3">
              {profile.leaderboardRankings.map((ranking, idx) => (
                <div
                  key={`${ranking.gameId}-${ranking.period}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  data-testid={`ranking-${idx}`}
                >
                  <div>
                    <p className="font-semibold">{ranking.gameName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ranking.period} period</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-mono font-bold">{ranking.score.toLocaleString()}</p>
                    </div>
                    <Badge variant={ranking.rank <= 3 ? "default" : "secondary"} className="text-base px-3 py-1">
                      #{ranking.rank}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty States */}
        {profile.achievements.length === 0 && profile.leaderboardRankings.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
            <p className="text-sm text-muted-foreground">
              This gamer is just getting started. Check back soon!
            </p>
          </Card>
        )}
      </main>

      {/* Share Achievement Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <ShareableCard
              type="achievement"
              title={selectedAchievement.title}
              subtitle={selectedAchievement.description || selectedAchievement.gameName}
              points={selectedAchievement.pointsAwarded}
              stat1Label="GAME"
              stat1Value={selectedAchievement.gameName}
              rarity={
                selectedAchievement.pointsAwarded >= 100 ? "legendary" :
                  selectedAchievement.pointsAwarded >= 50 ? "epic" :
                    selectedAchievement.pointsAwarded >= 25 ? "rare" : "common"
              }
              username={displayName}
              onShare={() => setShareDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
