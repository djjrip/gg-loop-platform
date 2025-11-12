import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Trophy, Flame, Gift, TrendingUp, Zap, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function FreeTierPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: freeTierData, isLoading } = useQuery<{
    ggCoins: number;
    coinsNeeded: number;
    canRedeemTrial: boolean;
    hasActiveTrial: boolean;
    currentStreak: number;
    longestStreak: number;
    xpLevel: number;
    xpPoints: number;
  }>({
    queryKey: ["/api/free-tier/status"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="text-center p-12">
            <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Join GG Loop Free</h2>
            <p className="text-muted-foreground mb-6">
              Start earning GG Coins from your League and Valorant wins!
            </p>
            <Link href="/login">
              <Button>Sign In to Get Started</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Free Tier Dashboard</h1>
          <p className="text-muted-foreground">
            Track your GG Coins, streaks, and progress toward unlocking premium features
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">GG Coins</CardTitle>
                    <Coins className="h-5 w-5 text-accent-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2" data-testid="text-gg-coins-balance">
                    {freeTierData?.ggCoins || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Earn 10 per win
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Login Streak</CardTitle>
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2" data-testid="text-login-streak">
                    {freeTierData?.currentStreak || 0} days
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next bonus at {Math.ceil(((freeTierData?.currentStreak || 0) + 1) / 7) * 7} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Best Streak</CardTitle>
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {freeTierData?.longestStreak || 0} days
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Personal record
                  </p>
                </CardContent>
              </Card>
            </div>

            {freeTierData && !freeTierData.hasActiveTrial && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Unlock 7-Day Trial</CardTitle>
                      <CardDescription>
                        Get Basic tier access with 500 GG Coins
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-bold">
                        {freeTierData.ggCoins} / 500 coins
                      </span>
                    </div>
                    <Progress value={(freeTierData.ggCoins / 500) * 100} className="h-3" />
                  </div>

                  {freeTierData.coinsNeeded > 0 ? (
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        You need <span className="font-bold text-foreground">{freeTierData.coinsNeeded} more coins</span> to unlock your trial
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>About {Math.ceil(freeTierData.coinsNeeded / 10)} more wins needed</span>
                      </div>
                    </div>
                  ) : (
                    <Link href="/subscription">
                      <Button className="w-full" size="lg">
                        <Zap className="mr-2 h-4 w-4" />
                        Unlock Trial Now
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {freeTierData?.hasActiveTrial && (
              <Card className="border-accent/50 bg-accent/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Trial Active! 🎉</CardTitle>
                      <CardDescription>
                        You're currently enjoying Basic tier benefits
                      </CardDescription>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe before your trial ends to keep earning points at 1x multiplier
                  </p>
                  <Link href="/subscription">
                    <Button variant="default">
                      View Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>How to Earn GG Coins</CardTitle>
                <CardDescription>
                  Free users can earn coins in these ways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Trophy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Win Matches</p>
                      <p className="text-sm text-muted-foreground">
                        Earn 10 GG Coins for every League or Valorant win
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Flame className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Login Streaks</p>
                      <p className="text-sm text-muted-foreground">
                        Get 50 GG Coins every 7 days of consecutive logins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Link Your Accounts</p>
                      <p className="text-sm text-muted-foreground">
                        Auto-sync your Riot matches in Settings to earn passively
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href="/stats" className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Stats
                    </Button>
                  </Link>
                  <Link href="/settings" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Link Riot Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
