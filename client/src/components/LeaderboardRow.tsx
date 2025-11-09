import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardRowProps {
  rank: number;
  username: string;
  score: string;
  games: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({ rank, username, score, games, isCurrentUser }: LeaderboardRowProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg hover-elevate",
        isCurrentUser && "border-2 border-primary bg-primary/5"
      )}
      data-testid={`row-leaderboard-${rank}`}
    >
      <div className="flex items-center justify-center w-12 h-12">
        {getRankIcon() || (
          <span className="text-2xl font-bold font-mono text-muted-foreground" data-testid={`text-rank-${rank}`}>
            {rank}
          </span>
        )}
      </div>

      <Avatar>
        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" data-testid={`text-username-${rank}`}>
          {username}
          {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
        </p>
        <p className="text-sm text-muted-foreground" data-testid={`text-games-${rank}`}>
          {games} games played
        </p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold font-mono" data-testid={`text-score-${rank}`}>{score}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
}
