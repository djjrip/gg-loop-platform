import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, ArrowRight, Gamepad2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickStart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [primaryGame, setPrimaryGame] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [riotId, setRiotId] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("");

  const guestLoginMutation = useMutation({
    mutationFn: async (data: { email: string; primaryGame: string; selectedGames: string[]; riotId?: string; tagLine?: string; region?: string }) => {
      const res = await apiRequest("POST", "/api/auth/guest", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to GG Loop!",
        description: "Your account has been created. Start earning points and unlock rewards!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !primaryGame) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and primary game",
        variant: "destructive",
      });
      return;
    }

    guestLoginMutation.mutate({ 
      email, 
      primaryGame, 
      selectedGames,
      riotId: riotId || undefined, 
      tagLine: tagLine || undefined, 
      region: region || undefined 
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-12 w-12 text-primary" />
            <h1 className="font-bold text-4xl tracking-tight">GG LOOP</h1>
          </div>
          <CardTitle className="text-2xl">Welcome Gamer!</CardTitle>
          <CardDescription>
            Join the community and start earning rewards. Tell us about your gaming interests!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground">
                Required for account recovery and subscription receipts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryGame" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                What's your primary game? *
              </Label>
              <Input
                id="primaryGame"
                placeholder="e.g., Fortnite, Call of Duty, Minecraft, etc."
                value={primaryGame}
                onChange={(e) => setPrimaryGame(e.target.value)}
                data-testid="input-primary-game"
              />
              <p className="text-xs text-muted-foreground">
                Tell us what game you love most! We're building support for more games every month.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Games You Can Earn Points In</Label>
              <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lol" 
                    checked={selectedGames.includes("4cf0e30a-7969-4572-a8f5-29ad5935dc00")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGames([...selectedGames, "4cf0e30a-7969-4572-a8f5-29ad5935dc00"]);
                      } else {
                        setSelectedGames(selectedGames.filter(g => g !== "4cf0e30a-7969-4572-a8f5-29ad5935dc00"));
                      }
                    }}
                    data-testid="checkbox-lol"
                  />
                  <label htmlFor="lol" className="text-sm font-medium cursor-pointer">
                    League of Legends
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="valorant" 
                    checked={selectedGames.includes("36f728c6-8143-4be3-9e94-54c549a48d7f")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGames([...selectedGames, "36f728c6-8143-4be3-9e94-54c549a48d7f"]);
                      } else {
                        setSelectedGames(selectedGames.filter(g => g !== "36f728c6-8143-4be3-9e94-54c549a48d7f"));
                      }
                    }}
                    data-testid="checkbox-valorant"
                  />
                  <label htmlFor="valorant" className="text-sm font-medium cursor-pointer">
                    VALORANT
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  More games coming soon! Your monthly points work for any rewards.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/20 border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Link Riot Account (Optional)</Label>
                <span className="text-xs text-muted-foreground">Get bonus points</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect your League/Valorant account to earn bonus points from match wins. You can also link this later in Settings.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="riotId" className="text-sm">Game Name</Label>
                <Input
                  id="riotId"
                  placeholder="JRIP"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  data-testid="input-riot-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagLine" className="text-sm">Tag Line</Label>
                <Input
                  id="tagLine"
                  placeholder="KUYA"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  data-testid="input-tag-line"
                />
                <p className="text-xs text-muted-foreground">
                  Example: If your Riot ID is JRIP#KUYA, enter "JRIP" above and "KUYA" here
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger id="region" data-testid="select-region">
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="americas">Americas (NA, BR, LAN, LAS)</SelectItem>
                    <SelectItem value="europe">Europe (EUW, EUNE, TR, RU)</SelectItem>
                    <SelectItem value="asia">Asia (KR, JP, OCE, SEA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={guestLoginMutation.isPending}
              data-testid="button-start"
            >
              {guestLoginMutation.isPending ? "Setting up..." : "Start Earning Points"}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                Back to login options
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
