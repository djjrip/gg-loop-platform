import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar, CheckCircle, XCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground">Please log in to view your performance stats.</p>
        </div>
        
      </div>
    );
  }

  const hasLinkedAccounts = leagueAccount?.linked || valorantAccount?.linked;
  const wins = matches?.filter(m => m.isWin).length || 0;
  const losses = matches?.filter(m => !m.isWin).length || 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const totalPoints = matches?.reduce((sum, m) => sum + (m.pointsAwarded || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2" data-testid="heading-stats">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your wins, stats, and earnings from League of Legends and Valorant
          </p>
        </div>

        {!hasLinkedAccounts && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Link Your Riot Account
              </CardTitle>
              <CardDescription>
                Connect your League of Legends or Valorant account to automatically track your matches and earn points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full sm:w-auto" data-testid="button-link-account">
                  Go to Settings to Link Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-matches">{totalGames}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Synced from Riot API
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-win-rate">{winRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {wins}W - {losses}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-points-earned">{totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {wins} wins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Linked Accounts</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {leagueAccount?.linked && (
                  <Badge variant="default" className="text-xs justify-start">
                    League: {leagueAccount.gameName}#{leagueAccount.tagLine}
                  </Badge>
                )}
                {valorantAccount?.linked && (
                  <Badge variant="default" className="text-xs justify-start">
                    Valorant: {valorantAccount.gameName}#{valorantAccount.tagLine}
                  </Badge>
                )}
                {!hasLinkedAccounts && (
                  <span className="text-sm text-muted-foreground">No accounts linked</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>
              Automatically synced from Riot API every 10 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading matches...</p>
              </div>
            ) : !matches || matches.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {hasLinkedAccounts
                    ? "No matches found. Play some games and check back in 10 minutes!"
                    : "Link your Riot account to start tracking matches automatically"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                    data-testid={`match-${match.id}`}
                  >
                    <div className="flex items-center gap-4">
                      {match.isWin ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {match.game === 'league' ? 'League of Legends' : 'Valorant'}
                          </span>
                          <Badge variant={match.isWin ? "default" : "secondary"}>
                            {match.isWin ? "Victory" : "Defeat"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.gameName}#{match.tagLine} · {match.region.toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(match.gameEndedAt).toLocaleDateString()} at{" "}
                          {new Date(match.gameEndedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {match.pointsAwarded > 0 ? (
                        <>
                          <p className="text-2xl font-bold font-mono text-primary">
                            +{match.pointsAwarded}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No points</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
    </div>
  );
}
