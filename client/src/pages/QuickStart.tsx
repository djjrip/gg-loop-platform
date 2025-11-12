import { useState } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickStart() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [riotId, setRiotId] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("");

  const guestLoginMutation = useMutation({
    mutationFn: async (data: { riotId: string; tagLine: string; region: string }) => {
      const res = await apiRequest("POST", "/api/auth/guest", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to GG Loop!",
        description: "Your account has been created. Start reporting matches to earn points!",
      });
      navigate("/");
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

    if (!riotId || !tagLine || !region) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    guestLoginMutation.mutate({ riotId, tagLine, region });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-12 w-12 text-primary" />
            <h1 className="font-bold text-4xl tracking-tight">GG LOOP</h1>
          </div>
          <CardTitle className="text-2xl">Quick Start</CardTitle>
          <CardDescription>
            Enter your Riot ID to get started. You can link Discord/Twitch/Google later for automatic match sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="riotId">Riot ID (Game Name)</Label>
              <Input
                id="riotId"
                placeholder="YourGameName"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                data-testid="input-riot-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagLine">Tag Line</Label>
              <Input
                id="tagLine"
                placeholder="NA1"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                data-testid="input-tag-line"
              />
              <p className="text-xs text-muted-foreground">
                Your full Riot ID looks like: YourGameName#NA1
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
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
                onClick={() => navigate("/login")}
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
