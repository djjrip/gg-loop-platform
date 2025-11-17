import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentWin {
  username: string;
  game: string;
  pointsEarned: number;
  timestamp: string;
}

export default function GlobalActivityFeed() {
  const { data: recentWins = [] } = useQuery<RecentWin[]>({
    queryKey: ["/api/activity/recent-wins"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getGameDisplay = (game: string) => {
    switch (game) {
      case 'league': return 'League of Legends';
      case 'valorant': return 'Valorant';
      case 'tft': return 'TFT';
      default: return game;
    }
  };

  return (
    <Card data-testid="card-global-activity">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Activity</CardTitle>
              <CardDescription>Recent wins across the platform</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentWins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity yet. Be the first to win!
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentWins.map((win, idx) => (
              <div
                key={`${win.username}-${win.timestamp}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate transition-all"
                data-testid={`activity-item-${idx}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate" data-testid={`text-username-${idx}`}>
                        {win.username}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getGameDisplay(win.game)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(win.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-sm font-bold text-primary" data-testid={`text-points-${idx}`}>
                    +{win.pointsEarned}
                  </span>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
