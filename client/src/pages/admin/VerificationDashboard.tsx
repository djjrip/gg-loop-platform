import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Flag, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function VerificationDashboard() {
    const { data: stats, isLoading } = useQuery<{
        pending: number;
        approved: number;
        rejected: number;
        flagged: number;
        highRiskAlerts: number;
    }>({
        queryKey: ["/api/verification/stats"],
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>
                <div className="text-muted-foreground">Loading stats...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Verification Dashboard</h1>
                <p className="text-muted-foreground">Monitor and manage verification queue</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            Pending Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.pending || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting admin action</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.approved || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Verified proofs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Rejected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.rejected || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Invalid proofs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Flag className="h-4 w-4 text-orange-500" />
                            Flagged
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.flagged || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-red-600" />
                            High Risk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.highRiskAlerts || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Fraud alerts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/verification/queue">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle>Review Queue</CardTitle>
                            <CardDescription>Process pending verification items</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{stats?.pending || 0} items</Badge>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/verification/fraud-alerts">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle>Fraud Alerts</CardTitle>
                            <CardDescription>Review high-risk fraud detections</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="destructive">{stats?.highRiskAlerts || 0} alerts</Badge>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/verification/flagged">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle>Flagged Items</CardTitle>
                            <CardDescription>Review flagged submissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline">{stats?.flagged || 0} flagged</Badge>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
