import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Shield, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FraudAlert {
    id: string;
    userId: string;
    username: string | null;
    detectionType: string;
    severity: string;
    riskScore: number;
    sourceType: string;
    sourceId: string;
    detectionData: any;
    status: string;
    createdAt: Date;
}

interface PatternStats {
    detectionType: string;
    totalCount: number;
    avgRiskScore: string;
    highSeverityCount: number;
}

export default function AdminIntegrityDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: alertsData, isLoading: alertsLoading } = useQuery<{ alerts: FraudAlert[] }>({
        queryKey: ["/api/admin/integrity/alerts"],
    });

    const { data: patternsData, isLoading: patternsLoading } = useQuery<{
        statistics: PatternStats[];
        recentPatterns: any[];
    }>({
        queryKey: ["/api/admin/integrity/patterns"],
    });

    const resolveAlert = useMutation({
        mutationFn: async ({ id, action }: { id: string; action: string }) => {
            const response = await fetch(`/api/admin/integrity/resolve/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action }),
            });
            if (!response.ok) throw new Error("Failed to resolve alert");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/integrity/alerts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/integrity/patterns"] });
            toast({ title: "Alert resolved successfully" });
        },
        onError: () => {
            toast({ title: "Failed to resolve alert", variant: "destructive" });
        },
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "text-red-600 bg-red-50 border-red-200";
            case "high": return "text-orange-600 bg-orange-50 border-orange-200";
            case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical": return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case "high": return <AlertCircle className="w-5 h-5 text-orange-600" />;
            default: return <Shield className="w-5 h-5 text-yellow-600" />;
        }
    };

    if (alertsLoading || patternsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const alerts = alertsData?.alerts || [];
    const statistics = patternsData?.statistics || [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Shield className="w-10 h-10 text-blue-600" />
                    Integrity Dashboard
                </h1>
                <p className="text-lg text-gray-600">Fraud detection and pattern monitoring</p>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-red-600">{alerts.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Pending review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detection Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-blue-600">{statistics.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Active patterns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">High Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-orange-600">
                            {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Requires immediate action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pattern Statistics */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Detection Patterns
                    </CardTitle>
                    <CardDescription>Statistical overview of fraud detection types</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {statistics.map((stat) => (
                            <div key={stat.detectionType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {stat.detectionType.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Avg Risk Score: {stat.avgRiskScore}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{stat.totalCount}</p>
                                    <p className="text-sm text-orange-600">{stat.highSeverityCount} high severity</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Active Fraud Alerts
                    </CardTitle>
                    <CardDescription>Pending fraud detection alerts requiring review</CardDescription>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600">No active alerts - all clear!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`border-2 rounded-lg p-6 ${getSeverityColor(alert.severity)}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getSeverityIcon(alert.severity)}
                                            <div>
                                                <h3 className="font-bold text-lg capitalize">
                                                    {alert.detectionType.replace(/_/g, ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    User: {alert.username || 'Unknown'} | Risk Score: {alert.riskScore}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={getSeverityColor(alert.severity)}>
                                            {alert.severity}
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-700">
                                            <strong>Source:</strong> {alert.sourceType} ({alert.sourceId})
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => resolveAlert.mutate({ id: alert.id, action: 'dismiss' })}
                                            disabled={resolveAlert.isPending}
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Dismiss
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => resolveAlert.mutate({ id: alert.id, action: 'confirm' })}
                                            disabled={resolveAlert.isPending}
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Confirm Fraud
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => resolveAlert.mutate({ id: alert.id, action: 'escalate' })}
                                            disabled={resolveAlert.isPending}
                                        >
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                            Escalate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
