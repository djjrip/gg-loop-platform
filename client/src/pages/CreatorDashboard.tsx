import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

interface CreatorStats {
  totalXP: number;
  gamesPlayed: number;
  tier: {
    tier: string;
    name: string;
    min: number;
    max: number;
    payoutMin: number;
  };
  nextTier: string | null;
  nextTierProgress: number;
  xpToNextTier: number;
  referrals: {
    total: number;
    active: number;
  };
  earnings: {
    estimated: number;
    currency: string;
  };
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load creator stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!stats) return <div className="p-8">Failed to load stats</div>;

  const tierColors = {
    ROOKIE: "text-gray-500",
    RISING: "text-blue-500",
    VETERAN: "text-purple-500",
    ELITE: "text-yellow-500"
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Creator Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.gamesPlayed} games</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creator Tier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tierColors[stats.tier.tier as keyof typeof tierColors]}`}>
              {stats.tier.name}
            </div>
            <p className="text-xs text-muted-foreground">Min payout: ${stats.tier.payoutMin}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referrals.total}</div>
            <p className="text-xs text-muted-foreground">{stats.referrals.active} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.earnings.estimated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.earnings.currency}</p>
          </CardContent>
        </Card>
      </div>

      {stats.nextTier && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress to {stats.nextTier}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.nextTierProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {stats.xpToNextTier.toLocaleString()} XP until {stats.nextTier}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Minimum payout for {stats.tier.name}: ${stats.tier.payoutMin}
          </p>
          <Button 
            disabled={stats.earnings.estimated < stats.tier.payoutMin}
            onClick={() => {
              fetch("/api/creator/payout/request", { method: "POST" })
                .then(res => res.json())
                .then(data => alert(data.message))
                .catch(err => alert("Failed to request payout"));
            }}
          >
            Request Payout (${stats.earnings.estimated.toFixed(2)})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
