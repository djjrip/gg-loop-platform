import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Save, ExternalLink, Twitch, Unlink, CheckCircle2, Gamepad2, Shield, Copy, AlertCircle, Link2, Clock, Trophy, TrendingUp, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

type UserData = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  twitchUsername: string | null;
  twitchConnectedAt: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
};

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

const LEAGUE_GAME_ID = '4cf0e30a-7969-4572-a8f5-29ad5935dc00';
const VALORANT_GAME_ID = '36f728c6-8143-4be3-9e94-54c549a48d7f';

const REGIONS = [
  { value: 'na', label: 'North America' },
  { value: 'euw', label: 'Europe West' },
  { value: 'eune', label: 'Europe Nordic & East' },
  { value: 'kr', label: 'Korea' },
  { value: 'br', label: 'Brazil' },
  { value: 'lan', label: 'Latin America North' },
  { value: 'las', label: 'Latin America South' },
  { value: 'oce', label: 'Oceania' },
  { value: 'ru', label: 'Russia' },
  { value: 'tr', label: 'Turkey' },
  { value: 'jp', label: 'Japan' },
];

export default function Settings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [location] = useLocation();
  
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("US");
  
  // Riot account linking state
  const [leagueRiotId, setLeagueRiotId] = useState(""); // Format: GameName#TAG
  const [leagueRegion, setLeagueRegion] = useState("na1");
  const [valorantRiotId, setValorantRiotId] = useState(""); // Format: GameName#TAG
  const [valorantRegion, setValorantRegion] = useState("na");
  const [valorantVerificationCode, setValorantVerificationCode] = useState("");

  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('twitch') === 'connected') {
      toast({
        title: "Twitch connected!",
        description: "Your Twitch account has been linked successfully.",
      });
      window.history.replaceState({}, '', '/settings');
    }
  }, [toast]);

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      return await apiRequest("/api/user/username", "POST", { username: newUsername });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Username updated!",
        description: "Your profile URL has been updated.",
      });
      setUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update username",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const connectTwitchMutation = useMutation({
    mutationFn: async () => {
      // Redirect to Twitch OAuth flow
      window.location.href = '/api/auth/twitch/link';
    },
  });

  const disconnectTwitchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/twitch/unlink", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Twitch disconnected",
        description: "Your Twitch account has been unlinked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to disconnect Twitch",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateShippingAddressMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/user/shipping-address", {
        address: shippingAddress,
        city: shippingCity,
        state: shippingState,
        zip: shippingZip,
        country: shippingCountry
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Shipping address saved!",
        description: "Your address has been updated successfully.",
      });
      setShippingAddress("");
      setShippingCity("");
      setShippingState("");
      setShippingZip("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save address",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user) {
      setShippingAddress(user.shippingAddress || "");
      setShippingCity(user.shippingCity || "");
      setShippingState(user.shippingState || "");
      setShippingZip(user.shippingZip || "");
      setShippingCountry(user.shippingCountry || "US");
    }
  }, [user]);

  // Riot Account Status Queries
  const { data: leagueStatus } = useQuery<RiotAccountStatus>({
    queryKey: ['/api/riot/account/league'],
  });

  const { data: valorantStatus } = useQuery<RiotAccountStatus>({
    queryKey: ['/api/riot/account/valorant'],
  });

  // Riot Account Link Mutations (simplified - direct linking)
  const linkLeagueMutation = useMutation({
    mutationFn: async () => {
      const [gameName, tagLine] = leagueRiotId.split('#');
      if (!gameName || !tagLine) {
        throw new Error("Please enter your Riot ID in the format: GameName#TAG");
      }
      return await apiRequest("POST", "/api/riot/link-account", {
        game: "league",
        gameName,
        tagLine,
        region: leagueRegion,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/riot/account/league'] });
      setLeagueRiotId("");
      toast({
        title: "League account linked!",
        description: `Successfully linked ${data.account.gameName}#${data.account.tagLine}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link account",
        description: error.message || "Please check your Riot ID format (GameName#TAG)",
        variant: "destructive",
      });
    },
  });

  const linkValorantMutation = useMutation({
    mutationFn: async () => {
      const [gameName, tagLine] = valorantRiotId.split('#');
      if (!gameName || !tagLine) {
        throw new Error("Please enter your Riot ID in the format: GameName#TAG");
      }
      return await apiRequest("POST", "/api/riot/link-account", {
        game: "valorant",
        gameName,
        tagLine,
        region: valorantRegion,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/riot/account/valorant'] });
      setValorantRiotId("");
      toast({
        title: "Valorant account linked!",
        description: `Successfully linked ${data.account.gameName}#${data.account.tagLine}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link account",
        description: error.message || "Please check your Riot ID format (GameName#TAG)",
        variant: "destructive",
      });
    },
  });

  const disconnectLeagueMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/riot/${LEAGUE_GAME_ID}/disconnect`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/riot/account/league'] });
      toast({
        title: "League account disconnected",
        description: "Your League of Legends account has been unlinked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to disconnect",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const disconnectValorantMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/riot/${VALORANT_GAME_ID}/disconnect`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/riot/account/valorant'] });
      setValorantVerificationCode("");
      toast({
        title: "Valorant account disconnected",
        description: "Your Valorant account has been unlinked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to disconnect",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const linkValorantProvisionalMutation = useMutation({
    mutationFn: async () => {
      const [gameName, tagLine] = valorantRiotId.split('#');
      if (!gameName || !tagLine) {
        throw new Error("Please enter your Riot ID in the format: GameName#TAG");
      }
      return await apiRequest("POST", `/api/riot/${VALORANT_GAME_ID}/link-provisional`, {
        riotId: `${gameName}#${tagLine}`,
        region: valorantRegion,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/riot/account/valorant'] });
      setValorantRiotId("");
      toast({
        title: "Account linked!",
        description: data.message || "Valorant account linked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link account",
        description: error.message || "Please check your Riot ID and try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    updateUsernameMutation.mutate(username);
  };

  const currentUsername = user?.username || "Not set";
  const profileUrl = user?.username 
    ? `/profile/${user.username}` 
    : user?.id ? `/profile/${user.id}` : "#";

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your GG Loop profile</p>
          </div>

        <Card data-testid="card-username-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username
            </CardTitle>
            <CardDescription>
              Customize your profile URL to make it easy to share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Username</Label>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 bg-muted rounded font-mono text-sm flex-1" data-testid="text-current-username">
                  {currentUsername}
                </code>
                {user?.username && (
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-profile">
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="coolstreamer123"
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={20}
                  data-testid="input-username"
                />
                <p className="text-xs text-muted-foreground">
                  3-20 characters. Letters, numbers, and underscores only.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={updateUsernameMutation.isPending || !username.trim()}
                className="gap-2"
                data-testid="button-save-username"
              >
                <Save className="h-4 w-4" />
                {updateUsernameMutation.isPending ? "Saving..." : "Save Username"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card data-testid="card-shipping-address">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
            <CardDescription>
              Required for redeeming physical rewards like peripherals and gear
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.shippingAddress ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1" data-testid="text-saved-address">Saved Address:</p>
                  <p className="text-sm">{user.shippingAddress}</p>
                  <p className="text-sm">{user.shippingCity}, {user.shippingState} {user.shippingZip}</p>
                  <p className="text-sm">{user.shippingCountry}</p>
                </div>
                <p className="text-xs text-muted-foreground">Update your address below if it has changed.</p>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border border-border mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    No shipping address on file. Add your address to redeem physical rewards.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); updateShippingAddressMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shipping-address">Street Address</Label>
                <Input
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="123 Main St, Apt 4B"
                  data-testid="input-shipping-address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-city">City</Label>
                  <Input
                    id="shipping-city"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="San Francisco"
                    data-testid="input-shipping-city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping-state">State</Label>
                  <Input
                    id="shipping-state"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    data-testid="input-shipping-state"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-zip">ZIP Code</Label>
                  <Input
                    id="shipping-zip"
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    placeholder="94102"
                    data-testid="input-shipping-zip"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country</Label>
                  <Select value={shippingCountry} onValueChange={setShippingCountry}>
                    <SelectTrigger id="shipping-country" data-testid="select-shipping-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={updateShippingAddressMutation.isPending || !shippingAddress || !shippingCity || !shippingState || !shippingZip}
                className="gap-2"
                data-testid="button-save-shipping-address"
              >
                <Save className="h-4 w-4" />
                {updateShippingAddressMutation.isPending ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card data-testid="card-twitch-integration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitch className="h-5 w-5" />
              Twitch Integration
            </CardTitle>
            <CardDescription>
              Connect your Twitch account to earn points automatically while streaming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.twitchUsername ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-connected-twitch">
                      Connected as @{user.twitchUsername}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(user.twitchConnectedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectTwitchMutation.mutate()}
                    disabled={disconnectTwitchMutation.isPending}
                    className="gap-2"
                    data-testid="button-disconnect-twitch"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Earn points while streaming:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>5 points per hour of live streaming</li>
                    <li>Bonus points for viewer milestones</li>
                    <li>Automatic verification every 10 minutes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Benefits of connecting Twitch:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Earn 5 points per hour of live streaming</li>
                    <li>Get bonus points for viewer milestones</li>
                    <li>Automatic verification - no manual reporting needed</li>
                    <li>Build credibility with verified streaming hours</li>
                  </ul>
                </div>
                <Button
                  onClick={() => connectTwitchMutation.mutate()}
                  disabled={connectTwitchMutation.isPending}
                  className="gap-2"
                  data-testid="button-connect-twitch"
                >
                  <Twitch className="h-4 w-4" />
                  {connectTwitchMutation.isPending ? "Connecting..." : "Connect Twitch Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-league-integration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              League of Legends
            </CardTitle>
            <CardDescription>
              Link your League account to enable automatic match win verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leagueStatus?.linked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-connected-league">
                      {leagueStatus.gameName}#{leagueStatus.tagLine}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Region: {REGIONS.find(r => r.value === leagueStatus.region)?.label || leagueStatus.region}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectLeagueMutation.mutate()}
                    disabled={disconnectLeagueMutation.isPending}
                    className="gap-2"
                    data-testid="button-disconnect-league"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>

                {/* Sync Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Matches</span>
                    </div>
                    <p className="text-2xl font-black font-mono" data-testid="text-league-matches">
                      {leagueStatus.totalMatches || 0}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">W/L</span>
                    </div>
                    <p className="text-lg font-bold" data-testid="text-league-record">
                      <span className="text-green-500">{leagueStatus.wins || 0}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-red-500">{leagueStatus.losses || 0}</span>
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Sync</span>
                    </div>
                    <p className="text-xs font-medium" data-testid="text-league-last-sync">
                      {leagueStatus.lastSyncedAt 
                        ? formatDistanceToNow(new Date(leagueStatus.lastSyncedAt), { addSuffix: true })
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    Matches sync automatically every 10 minutes. Stats are updated after each sync cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="league-riot-id">Riot ID</Label>
                  <Input
                    id="league-riot-id"
                    value={leagueRiotId}
                    onChange={(e) => setLeagueRiotId(e.target.value)}
                    placeholder="Faker#NA1"
                    data-testid="input-league-riot-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Riot ID (GameName#TAG). Find it in your League client.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="league-region">Region</Label>
                  <Select value={leagueRegion} onValueChange={setLeagueRegion}>
                    <SelectTrigger id="league-region" data-testid="select-league-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => linkLeagueMutation.mutate()}
                  disabled={linkLeagueMutation.isPending || !leagueRiotId.includes('#')}
                  className="gap-2 w-full"
                  data-testid="button-link-league"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {linkLeagueMutation.isPending ? "Linking..." : "Link Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-valorant-integration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Valorant
            </CardTitle>
            <CardDescription>
              Link your Valorant account to enable automatic match win verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {valorantStatus?.linked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-connected-valorant">
                      {valorantStatus.gameName}#{valorantStatus.tagLine}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Region: {REGIONS.find(r => r.value === valorantStatus.region)?.label || valorantStatus.region}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectValorantMutation.mutate()}
                    disabled={disconnectValorantMutation.isPending}
                    className="gap-2"
                    data-testid="button-disconnect-valorant"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>

                {/* Sync Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Matches</span>
                    </div>
                    <p className="text-2xl font-black font-mono" data-testid="text-valorant-matches">
                      {valorantStatus.totalMatches || 0}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">W/L</span>
                    </div>
                    <p className="text-lg font-bold" data-testid="text-valorant-record">
                      <span className="text-green-500">{valorantStatus.wins || 0}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-red-500">{valorantStatus.losses || 0}</span>
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Sync</span>
                    </div>
                    <p className="text-xs font-medium" data-testid="text-valorant-last-sync">
                      {valorantStatus.lastSyncedAt 
                        ? formatDistanceToNow(new Date(valorantStatus.lastSyncedAt), { addSuffix: true })
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    Matches sync automatically every 10 minutes. Stats are updated after each sync cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Provisional Linking</p>
                      <p className="text-muted-foreground text-xs">
                        Your Valorant stats will be self-reported and unverified. Full verification via Riot OAuth coming soon.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorant-riot-id">Riot ID</Label>
                  <Input
                    id="valorant-riot-id"
                    value={valorantRiotId}
                    onChange={(e) => setValorantRiotId(e.target.value)}
                    placeholder="TenZ#NA1"
                    data-testid="input-valorant-riot-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Riot ID (GameName#TAG). Find it in your Valorant profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorant-region">Region</Label>
                  <Select value={valorantRegion} onValueChange={setValorantRegion}>
                    <SelectTrigger id="valorant-region" data-testid="select-valorant-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => linkValorantProvisionalMutation.mutate()}
                  disabled={linkValorantProvisionalMutation.isPending || !valorantRiotId.includes('#')}
                  className="gap-2 w-full"
                  data-testid="button-link-valorant"
                >
                  <Link2 className="h-4 w-4" />
                  {linkValorantProvisionalMutation.isPending ? "Linking..." : "Link Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details from Replit Auth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
