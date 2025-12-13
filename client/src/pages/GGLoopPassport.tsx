import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Shield, Star, Zap, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export default function GGLoopPassport() {
    const { user } = useAuth();

    const { data: passportStats } = useQuery<{
        points: number;
        rank: string;
        fraudScore: number;
        desktopVerified: boolean;
        rewardsClaimed: number;
        sponsorUnlocks: number;
    }>({
        queryKey: ["/api/passport/stats"],
    });

    const { data: history } = useQuery<{
        submissions: Array<{
            id: number;
            type: string;
            status: string;
            timestamp: string;
            verdict: string;
        }>;
    }>({
        queryKey: ["/api/passport/history"],
    });

    const getBadge = (points: number) => {
        if (points >= 50000) return { name: "Elite", icon: Zap, color: "text-orange-500", bg: "bg-orange-100" };
        if (points >= 25000) return { name: "Champion", icon: Star, color: "text-purple-500", bg: "bg-purple-100" };
        if (points >= 10000) return { name: "Veteran", icon: Shield, color: "text-blue-500", bg: "bg-blue-100" };
        return { name: "Rookie", icon: Trophy, color: "text-gray-500", bg: "bg-gray-100" };
    };

    const badge = getBadge(passportStats?.points || 0);
    const BadgeIcon = badge.icon;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">GG LOOP Passport</h1>
                <p className="text-muted-foreground">Your verified gaming identity</p>
            </div>

            {/* User Badge */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        <div className={`${badge.bg} p-6 rounded-full`}>
                            <BadgeIcon className={`h-16 w-16 ${badge.color}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-1">{user?.firstName || "Player"}</h2>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="default" className="text-lg px-3 py-1">
                                    {badge.name}
                                </Badge>
                                {passportStats?.desktopVerified && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Points</div>
                                    <div className="text-xl font-bold">{passportStats?.points?.toLocaleString() || 0}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Rank</div>
                                    <div className="text-xl font-bold">{passportStats?.rank || "Unranked"}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Fraud Score</div>
                                    <div className={`text-xl font-bold ${(passportStats?.fraudScore || 0) > 30 ? "text-red-500" : "text-green-500"}`}>
                                        {passportStats?.fraudScore || 0}/100
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Rewards Claimed</div>
                                    <div className="text-xl font-bold">{passportStats?.rewardsClaimed || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Desktop Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {passportStats?.desktopVerified ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">Verified</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                                <XCircle className="h-5 w-5" />
                                <span className="font-semibold">Not Verified</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sponsor Unlocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passportStats?.sponsorUnlocks || 0}</div>
                        <div className="text-sm text-muted-foreground">Brand partnerships</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Trust Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(passportStats?.fraudScore || 0) <= 30 ? "text-green-600" : "text-red-600"}`}>
                            {passportStats?.fraudScore ? (100 - passportStats.fraudScore) : 100}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {(passportStats?.fraudScore || 0) <= 30 ? "Excellent standing" : "Needs review"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verification History */}
            <Card>
                <CardHeader>
                    <CardTitle>Verification History</CardTitle>
                    <CardDescription>Your proof submissions and verdicts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {history?.submissions.map((submission) => (
                            <div key={submission.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${submission.status === 'verified' ? 'bg-green-100' :
                                            submission.status === 'rejected' ? 'bg-red-100' :
                                                submission.status === 'flagged' ? 'bg-orange-100' :
                                                    'bg-gray-100'
                                        }`}>
                                        {submission.status === 'verified' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                        {submission.status === 'rejected' && <XCircle className="h-5 w-5 text-red-600" />}
                                        {submission.status === 'flagged' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                                        {submission.status === 'pending' && <Clock className="h-5 w-5 text-gray-600" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{submission.type}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(submission.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={
                                        submission.status === 'verified' ? 'default' :
                                            submission.status === 'rejected' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {submission.status}
                                    </Badge>
                                    {submission.verdict && (
                                        <div className="text-xs text-muted-foreground mt-1">{submission.verdict}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!history?.submissions || history.submissions.length === 0) && (
                            <div className="text-center text-muted-foreground py-8">
                                No verification history yet
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
