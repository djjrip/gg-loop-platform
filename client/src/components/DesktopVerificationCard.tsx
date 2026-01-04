import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Monitor, CheckCircle, XCircle, Clock, Gamepad2, Download, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopVerificationStatus {
  connected: boolean;
  lastGame: string | null;
  lastVerifiedAt: string | null;
  sessionPoints: number;
  activeMinutes: number;
  confidenceScore: number;
  verificationState: 'NOT_PLAYING' | 'GAME_DETECTED' | 'ACTIVE_PLAY_CONFIRMED' | 'PAUSED' | 'ERROR' | null;
  recentSessions: Array<{
    id: string;
    points: number;
    description: string;
    timestamp: string;
    confidenceScore?: number;
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
    refetchInterval: 15000, // Refresh every 15 seconds for real-time feel
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

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return 'Verified';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    if (score >= 30) return 'Low';
    return 'Suspicious';
  };

  const getStateLabel = (state: string | null) => {
    switch (state) {
      case 'ACTIVE_PLAY_CONFIRMED': return { label: 'Active Play', color: 'bg-green-500', icon: CheckCircle };
      case 'GAME_DETECTED': return { label: 'Game Detected', color: 'bg-yellow-500', icon: AlertTriangle };
      case 'PAUSED': return { label: 'Paused', color: 'bg-yellow-500', icon: Clock };
      case 'ERROR': return { label: 'Error', color: 'bg-red-500', icon: XCircle };
      default: return { label: 'Not Playing', color: 'bg-gray-500', icon: Monitor };
    }
  };

  const stateInfo = getStateLabel(status?.verificationState || null);
  const StateIcon = stateInfo.icon;
  const confidenceScore = status?.confidenceScore || 0;

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
            {/* Verification State Banner */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              status?.verificationState === 'ACTIVE_PLAY_CONFIRMED' 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-muted/50'
            }`}>
              <StateIcon className={`h-4 w-4 ${
                status?.verificationState === 'ACTIVE_PLAY_CONFIRMED' ? 'text-green-500' : 'text-muted-foreground'
              }`} />
              <span className={`text-sm font-medium ${
                status?.verificationState === 'ACTIVE_PLAY_CONFIRMED' ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                {stateInfo.label}
              </span>
              {status?.verificationState === 'ACTIVE_PLAY_CONFIRMED' && (
                <span className="text-xs text-green-400 ml-auto">Points Accruing</span>
              )}
            </div>

            {/* Last Verified Game */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gamepad2 className="h-4 w-4" />
                Last Verified Game
              </div>
              <span className="font-medium">{status?.lastGame || 'Unknown'}</span>
            </div>

            {/* Active Minutes This Session */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Active Minutes
              </div>
              <span className="font-medium">{status?.activeMinutes || 0} min</span>
            </div>

            {/* Confidence Meter */}
            {confidenceScore > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Verification Confidence
                  </div>
                  <span className={`font-bold ${getConfidenceColor(confidenceScore)}`}>
                    {confidenceScore}% ({getConfidenceLabel(confidenceScore)})
                  </span>
                </div>
                <Progress value={confidenceScore} className="h-2" />
              </div>
            )}

            {/* Last Verified Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Verified</span>
              <span className="font-medium">{lastVerified || 'N/A'}</span>
            </div>

            {/* Session Points */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-muted">
              <span className="text-muted-foreground">Points Earned (This Session)</span>
              <span className="font-bold text-green-500 text-lg">+{status?.sessionPoints || 0}</span>
            </div>

            {/* Recent Sessions */}
            {status?.recentSessions && status.recentSessions.length > 0 && (
              <div className="pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground mb-2">Recent Verified Sessions</div>
                <div className="space-y-1">
                  {status.recentSessions.slice(0, 3).map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[180px]">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="truncate">{session.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.confidenceScore && (
                          <span className={`text-[10px] ${getConfidenceColor(session.confidenceScore)}`}>
                            {session.confidenceScore}%
                          </span>
                        )}
                        <span className="text-green-500 font-medium">+{session.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Indicator */}
            <div className="pt-2 border-t border-muted">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Shield className="h-3 w-3" />
                Verified via Desktop App Gameplay Detection
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Points only accrue during active, foreground gameplay. Typing/idle = 0 points.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="text-4xl mb-2">🎮</div>
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
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Points only accrue when actively playing</p>
              <p>✓ Game must be in foreground</p>
              <p>✓ Minimum 5 minutes active play</p>
              <p>✓ Typing/mouse-only = 0 points</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
