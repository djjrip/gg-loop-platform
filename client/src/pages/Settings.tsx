import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, AlertCircle, Link2, Gamepad2, Trophy, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type RiotAccountStatus = {
  linked: boolean;
  gameName?: string;
  tagLine?: string;
  region?: string;
  verifiedAt?: string;
  lastSyncedAt?: string;
  totalMatches?: number;
  wins?: number;
  losses?: number;
};

const LEAGUE_REGIONS = [
  { value: 'na1', label: 'North America' },
  { value: 'euw1', label: 'Europe West' },
  { value: 'eun1', label: 'Europe Nordic & East' },
  { value: 'kr', label: 'Korea' },
  { value: 'br1', label: 'Brazil' },
  { value: 'la1', label: 'Latin America North' },
  { value: 'la2', label: 'Latin America South' },
  { value: 'oc1', label: 'Oceania' },
  { value: 'ru', label: 'Russia' },
  { value: 'tr1', label: 'Turkey' },
  { value: 'jp1', label: 'Japan' },
];

const VALORANT_REGIONS = [
  { value: 'na', label: 'North America' },
  { value: 'eu', label: 'Europe' },
  { value: 'ap', label: 'Asia Pacific' },
  { value: 'kr', label: 'Korea' },
  { value: 'latam', label: 'Latin America' },
  { value: 'br', label: 'Brazil' },
];

export default function Settings() {
  const { toast } = useToast();

  // Riot account linking state (keeping for League until we finish that too)
  const [leagueRiotId, setLeagueRiotId] = useState("");
  const [leagueRegion, setLeagueRegion] = useState("na1");

  const { data: leagueAccount, isLoading: leagueLoading } = useQuery<RiotAccountStatus>({
    queryKey: ["/api/riot/account/league"],
  });

  const { data: valorantAccount, isLoading: valorantLoading } = useQuery<RiotAccountStatus>({
    queryKey: ["/api/riot/account/valorant"],
  });

  const linkLeagueMutation = useMutation({
    mutationFn: async (data: { riotId: string; region: string }) => {
      const res = await apiRequest("POST", "/api/riot/link/league", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riot/account/league"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riot/matches"] });
      toast({
        title: "League account linked!",
        description: "Your matches will sync automatically every 5 minutes.",
      });
      setLeagueRiotId("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link account",
        description: error.message || "Please check your Riot ID and region",
        variant: "destructive",
      });
    },
  });

  // Sync matches mutation - triggers gameplay verification and point awards
  const syncMatchesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/riot/sync-matches");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/riot/account/league"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (data.newWinsFound > 0) {
        toast({
          title: `🎉 Found ${data.newWinsFound} new wins!`,
          description: `Earned ${data.totalPointsEarned} points. Keep playing!`,
        });
      } else {
        toast({
          title: "No new wins found",
          description: "Play some matches and sync again later!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message || "Try again later",
        variant: "destructive",
      });
    },
  });

  // Valorant now uses secure 2-step verification component
  // Old mutation removed - handled by RiotAccountVerification component

  const handleLinkLeague = () => {
    if (!leagueRiotId || !leagueRiotId.includes('#')) {
      toast({
        title: "Invalid Riot ID",
        description: "Please enter your Riot ID in the format: GameName#TAG",
        variant: "destructive",
      });
      return;
    }

    linkLeagueMutation.mutate({ riotId: leagueRiotId, region: leagueRegion });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2" data-testid="text-settings-title">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Connect your Riot accounts to automatically track matches and earn points
          </p>
        </div>

        <div className="space-y-6">
          {/* League of Legends */}
          <Card data-testid="card-league">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">League of Legends</CardTitle>
                  <CardDescription>
                    Link your League account to track ranked matches
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leagueLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                  <p>Loading...</p>
                </div>
              ) : leagueAccount?.linked ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-semibold" data-testid="text-league-connected">Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Riot ID: <span className="font-mono" data-testid="text-league-riot-id">{leagueAccount.gameName}#{leagueAccount.tagLine}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Region: {LEAGUE_REGIONS.find(r => r.value === leagueAccount.region)?.label || leagueAccount.region}
                    </p>
                    {leagueAccount.lastSyncedAt && (
                      <p className="text-sm text-muted-foreground">
                        Last synced: {formatDistanceToNow(new Date(leagueAccount.lastSyncedAt))} ago
                      </p>
                    )}
                    {leagueAccount.totalMatches !== undefined && (
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary" data-testid="badge-league-matches">
                          <Trophy className="h-3 w-3 mr-1" />
                          {leagueAccount.totalMatches} matches
                        </Badge>
                        {leagueAccount.wins !== undefined && (
                          <Badge variant="default" data-testid="badge-league-wins">
                            {leagueAccount.wins}W {leagueAccount.losses}L
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SYNC MATCHES BUTTON - THE CRITICAL FEATURE */}
                  <div className="p-4 border-2 rounded-lg bg-green-500/10 border-green-500/30">
                    <p className="text-sm font-medium mb-2 text-green-400">🎮 Earn Points from Matches</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Sync your recent matches to earn points for wins. Available once per hour.
                    </p>
                    <Button
                      onClick={() => syncMatchesMutation.mutate()}
                      disabled={syncMatchesMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="button-sync-matches"
                    >
                      {syncMatchesMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing matches...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Matches & Earn Points
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-500/10 border-blue-500/20">
                    <p className="text-sm font-medium mb-2">Switch to a different account</p>
                    <div className="mb-3 p-3 rounded-md bg-background/50 border border-blue-500/30">
                      <p className="text-xs text-muted-foreground mb-1">When you switch accounts:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                        <li>✅ Points are preserved (tied to subscription)</li>
                        <li>✅ Achievements already earned stay unlocked</li>
                        <li>⚠️ Match history resets (from different player)</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="league-riot-id-switch">New Riot ID</Label>
                        <Input
                          id="league-riot-id-switch"
                          data-testid="input-league-riot-id"
                          placeholder="GameName#TAG"
                          value={leagueRiotId}
                          onChange={(e) => setLeagueRiotId(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="league-region-switch">Region</Label>
                        <Select value={leagueRegion} onValueChange={setLeagueRegion}>
                          <SelectTrigger id="league-region-switch" data-testid="select-league-region">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAGUE_REGIONS.map((region) => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleLinkLeague}
                        disabled={linkLeagueMutation.isPending}
                        className="w-full"
                        data-testid="button-update-league"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        {linkLeagueMutation.isPending ? "Updating..." : "Update League Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">How to find your Riot ID:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Launch League of Legends client</li>
                        <li>Look at the top right corner</li>
                        <li>Your Riot ID format: <span className="font-mono">GameName#TAG</span></li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="league-riot-id">Riot ID</Label>
                      <Input
                        id="league-riot-id"
                        data-testid="input-league-riot-id"
                        placeholder="GameName#TAG"
                        value={leagueRiotId}
                        onChange={(e) => setLeagueRiotId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: HideonBush#KR1
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="league-region">Region</Label>
                      <Select value={leagueRegion} onValueChange={setLeagueRegion}>
                        <SelectTrigger id="league-region" data-testid="select-league-region">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAGUE_REGIONS.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleLinkLeague}
                      disabled={linkLeagueMutation.isPending}
                      className="w-full"
                      data-testid="button-link-league"
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      {linkLeagueMutation.isPending ? "Connecting..." : "Connect League Account"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valorant - COSMETIC ONLY */}
          <Card data-testid="card-valorant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Valorant</CardTitle>
                  <CardDescription>
                    Cosmetic profile display only
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SECURITY NOTICE */}
              <div className="p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Game Account Linking: Display Only</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>- Riot account linking is <strong>cosmetic only</strong></p>
                      <p>- Does NOT affect points, rewards, or earning</p>
                      <p>- Match stats display for your profile only</p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-orange-500/20">
                      <p className="text-xs font-medium text-orange-400">
                        ⚡ Verified gameplay rewards return with Desktop App - Coming 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {valorantAccount?.linked ? (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold" data-testid="text-valorant-connected">Linked (Display Only)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Riot ID: <span className="font-mono" data-testid="text-valorant-riot-id">{valorantAccount.gameName}#{valorantAccount.tagLine}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Region: {VALORANT_REGIONS.find(r => r.value === valorantAccount.region)?.label || valorantAccount.region}
                  </p>
                  {valorantAccount.totalMatches !== undefined && (
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="secondary" data-testid="badge-valorant-matches">
                        <Trophy className="h-3 w-3 mr-1" />
                        {valorantAccount.totalMatches} matches
                      </Badge>
                      {valorantAccount.wins !== undefined && (
                        <Badge variant="default" data-testid="badge-valorant-wins">
                          {valorantAccount.wins}W {valorantAccount.losses}L
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Valorant linking temporarily unavailable
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Returns with secure Desktop App verification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coming Soon Games */}
          <Card data-testid="card-coming-soon-games">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                More Games Coming Soon
              </CardTitle>
              <CardDescription>
                We're expanding GG Loop to support more games. Stay tuned!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Fortnite", icon: "🎮" },
                  { name: "Apex Legends", icon: "🎯" },
                  { name: "Call of Duty", icon: "🎖️" },
                  { name: "Counter-Strike 2", icon: "💥" },
                  { name: "Overwatch 2", icon: "🦸" },
                  { name: "Rocket League", icon: "🚗" },
                ].map((game) => (
                  <div
                    key={game.name}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    data-testid={`game-${game.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="text-2xl">{game.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{game.name}</p>
                      <p className="text-xs text-muted-foreground">Coming Soon</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <p className="text-sm text-center font-medium">
                  ⚡ Game linking is currently for profile display only
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Earn rewards now through subscriptions + platform missions - Verified gameplay rewards coming with Desktop App 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
