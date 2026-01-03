import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, CheckCircle, XCircle, Clock, Gamepad2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopVerificationStatus {
  connected: boolean;
  lastGame: string | null;
  lastVerifiedAt: string | null;
  sessionPoints: number;
  recentSessions: Array<{
    id: string;
    points: number;
    description: string;
    timestamp: string;
  }>;
}

export default function DesktopVerificationCard() {
  const { user } = useAuth();

  const { data: status, isLoading } = useQuery<DesktopVerificationStatus>({
    queryKey: ["/api/desktop/verification-status", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user");
      const res = await fetch(`/api/desktop/verification-status/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-muted-foreground animate-pulse" />
            <span className="text-muted-foreground">Loading desktop status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivity = status?.connected && status?.recentSessions?.length > 0;
  const lastVerified = status?.lastVerifiedAt 
    ? new Date(status.lastVerifiedAt).toLocaleString()
    : null;

  return (
    <Card className={`border ${hasActivity ? 'border-green-500/30 bg-green-500/5' : 'border-muted'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Desktop Verification
          </div>
          <Badge 
            variant={hasActivity ? "default" : "outline"}
            className={hasActivity ? "bg-green-600" : ""}
          >
            {hasActivity ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasActivity ? (
          <>
            {/* Last Verified Game */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gamepad2 className="h-4 w-4" />
                Last Verified Game
              </div>
              <span className="font-medium">{status?.lastGame || 'Unknown'}</span>
            </div>

            {/* Last Verified Time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last Verified
              </div>
              <span className="font-medium">{lastVerified || 'N/A'}</span>
            </div>

            {/* Session Points */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session Points</span>
              <span className="font-bold text-green-500">+{status?.sessionPoints || 0} pts</span>
            </div>

            {/* Recent Sessions */}
            {status?.recentSessions && status.recentSessions.length > 0 && (
              <div className="pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground mb-2">Recent Verified Sessions</div>
                <div className="space-y-1">
                  {status.recentSessions.slice(0, 3).map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
                    >
                      <span className="truncate max-w-[200px]">{session.description}</span>
                      <span className="text-green-500 font-medium">+{session.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Indicator */}
            <div className="pt-2 border-t border-muted">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Points verified via Desktop App gameplay detection
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Download the Desktop App to verify your gameplay and earn points automatically.
            </p>
            <a
              href="https://github.com/djjrip/gg-loop-platform/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Desktop App
              </Button>
            </a>
            <p className="text-xs text-muted-foreground">
              Points only accrue when actively playing supported games.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

