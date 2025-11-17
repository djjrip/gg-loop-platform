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
import { CheckCircle2, AlertCircle, Link2, Unlink, Gamepad2, Trophy } from "lucide-react";
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
  
  // Riot account linking state
  const [leagueRiotId, setLeagueRiotId] = useState("");
  const [leagueRegion, setLeagueRegion] = useState("na1");
  const [valorantRiotId, setValorantRiotId] = useState("");
  const [valorantRegion, setValorantRegion] = useState("na");

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
        description: "Your matches will sync automatically every 10 minutes.",
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

  const unlinkLeagueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/riot/unlink/league", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riot/account/league"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riot/matches"] });
      toast({
        title: "League account unlinked",
        description: "Your account has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlink account",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const linkValorantMutation = useMutation({
    mutationFn: async (data: { riotId: string; region: string }) => {
      const res = await apiRequest("POST", "/api/riot/link/valorant", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riot/account/valorant"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riot/matches"] });
      toast({
        title: "Valorant account linked!",
        description: "Your matches will sync automatically every 10 minutes.",
      });
      setValorantRiotId("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link account",
        description: error.message || "Please check your Riot ID and region",
        variant: "destructive",
      });
    },
  });

  const unlinkValorantMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/riot/unlink/valorant", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riot/account/valorant"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riot/matches"] });
      toast({
        title: "Valorant account unlinked",
        description: "Your account has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlink account",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

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

  const handleLinkValorant = () => {
    if (!valorantRiotId || !valorantRiotId.includes('#')) {
      toast({
        title: "Invalid Riot ID",
        description: "Please enter your Riot ID in the format: GameName#TAG",
        variant: "destructive",
      });
      return;
    }

    linkValorantMutation.mutate({ riotId: valorantRiotId, region: valorantRegion });
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
                  <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unlinkLeagueMutation.mutate()}
                      disabled={unlinkLeagueMutation.isPending}
                      data-testid="button-unlink-league"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
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

          {/* Valorant */}
          <Card data-testid="card-valorant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Valorant</CardTitle>
                  <CardDescription>
                    Link your Valorant account to track competitive matches
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {valorantLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                  <p>Loading...</p>
                </div>
              ) : valorantAccount?.linked ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-semibold" data-testid="text-valorant-connected">Connected</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Riot ID: <span className="font-mono" data-testid="text-valorant-riot-id">{valorantAccount.gameName}#{valorantAccount.tagLine}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Region: {VALORANT_REGIONS.find(r => r.value === valorantAccount.region)?.label || valorantAccount.region}
                      </p>
                      {valorantAccount.lastSyncedAt && (
                        <p className="text-sm text-muted-foreground">
                          Last synced: {formatDistanceToNow(new Date(valorantAccount.lastSyncedAt))} ago
                        </p>
                      )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unlinkValorantMutation.mutate()}
                      disabled={unlinkValorantMutation.isPending}
                      data-testid="button-unlink-valorant"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">How to find your Riot ID:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Launch Valorant</li>
                        <li>Look at the top right corner of the main menu</li>
                        <li>Your Riot ID format: <span className="font-mono">GameName#TAG</span></li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorant-riot-id">Riot ID</Label>
                      <Input
                        id="valorant-riot-id"
                        data-testid="input-valorant-riot-id"
                        placeholder="GameName#TAG"
                        value={valorantRiotId}
                        onChange={(e) => setValorantRiotId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: TenZ#GOD
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorant-region">Region</Label>
                      <Select value={valorantRegion} onValueChange={setValorantRegion}>
                        <SelectTrigger id="valorant-region" data-testid="select-valorant-region">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VALORANT_REGIONS.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleLinkValorant}
                      disabled={linkValorantMutation.isPending}
                      className="w-full"
                      data-testid="button-link-valorant"
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      {linkValorantMutation.isPending ? "Connecting..." : "Connect Valorant Account"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
