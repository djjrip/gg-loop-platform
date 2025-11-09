import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommunityFeedItemProps {
  username: string;
  action: string;
  game: string;
  details: string;
  time: string;
  type: "achievement" | "highscore" | "milestone";
}

export default function CommunityFeedItem({ username, action, game, details, time, type }: CommunityFeedItemProps) {
  const getIcon = () => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-4 w-4 text-primary" />;
      case "highscore":
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case "milestone":
        return <Award className="h-4 w-4 text-primary" />;
    }
  };

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-feed-${username.toLowerCase()}`}>
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold" data-testid={`text-username-${username.toLowerCase()}`}>{username}</p>
              <p className="text-sm text-muted-foreground">{action}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-time-${username.toLowerCase()}`}>
              {time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getIcon()}
            <Badge variant="secondary" className="text-xs" data-testid={`badge-game-${game.toLowerCase()}`}>
              {game}
            </Badge>
          </div>

          <p className="text-sm font-medium" data-testid={`text-details-${username.toLowerCase()}`}>{details}</p>
        </div>
      </div>
    </Card>
  );
}
