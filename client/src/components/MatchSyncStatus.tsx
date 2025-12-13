import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useRef } from "react";

interface SyncStatusData {
  lastSyncAt: string | null;
  nextSyncIn: number | null;
  linkedAccounts: number;
  timestamp: string;
}

export default function MatchSyncStatus() {
  const { data } = useQuery<SyncStatusData>({
    queryKey: ["/api/activity/sync-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (data?.nextSyncIn !== null && data?.nextSyncIn !== undefined) {
      setCountdown(data.nextSyncIn);
      
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1000;
        });
      }, 1000);
    } else {
      // Reset countdown to null when API returns null/undefined
      setCountdown(null);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data?.nextSyncIn]);

  const formatCountdown = (ms: number | null) => {
    if (ms === null || ms <= 0) return "Soon";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div 
      className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border rounded-lg"
      data-testid="container-sync-status"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${countdown && countdown > 0 ? '' : 'animate-spin'}`} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Match Sync</div>
          {data?.lastSyncAt ? (
            <div className="text-sm font-medium" data-testid="text-last-sync">
              {formatDistanceToNow(new Date(data.lastSyncAt), { addSuffix: true })}
            </div>
          ) : (
            <div className="text-sm font-medium">Never</div>
          )}
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Next Sync</div>
          <div className="text-sm font-medium" data-testid="text-next-sync">
            {formatCountdown(countdown)}
          </div>
        </div>
      </div>

      {data && data.linkedAccounts > 0 && (
        <>
          <div className="h-8 w-px bg-border" />
          <div>
            <div className="text-xs text-muted-foreground">Tracking</div>
            <div className="text-sm font-medium" data-testid="text-linked-accounts">
              {data.linkedAccounts} account{data.linkedAccounts !== 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
