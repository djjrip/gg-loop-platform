import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalXP: number;
  gamesPlayed: number;
  tier: {
    tier: string;
    name: string;
  };
  fraudScore: number;
}

export default function CreatorLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/leaderboard?limit=100")
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load leaderboard:", err);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const tierColors = {
    ROOKIE: "bg-gray-100 text-gray-700",
    RISING: "bg-blue-100 text-blue-700",
    VETERAN: "bg-purple-100 text-purple-700",
    ELITE: "bg-yellow-100 text-yellow-700"
  };

  if (loading) return <div className="p-8">Loading leaderboard...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Creator Leaderboard</h1>
      <p className="text-muted-foreground mb-8">
        Top creators ranked by verified desktop XP. Only creators with fraud score ≤30 are shown.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Top 100 Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank) || (
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{entry.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.gamesPlayed} games played
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tierColors[entry.tier.tier as keyof typeof tierColors]
                    }`}
                  >
                    {entry.tier.name}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {entry.totalXP.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
