import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

interface OnlineUsersData {
  count: number;
  timestamp: string;
}

export default function OnlineUsersCounter() {
  const { data } = useQuery<OnlineUsersData>({
    queryKey: ["/api/activity/online-users"],
    refetchInterval: 60000, // Refresh every minute
  });

  const onlineCount = data?.count || 0;

  return (
    <div 
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg"
      data-testid="container-online-users"
    >
      <div className="relative">
        <Users className="w-4 h-4 text-primary" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-primary" data-testid="text-online-count">
          {onlineCount}
        </span>
        <span className="text-sm text-muted-foreground">
          player{onlineCount !== 1 ? 's' : ''} online
        </span>
      </div>
    </div>
  );
}
