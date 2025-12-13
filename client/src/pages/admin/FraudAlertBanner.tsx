import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

export default function FraudAlertBanner() {
    const { data: alerts } = useQuery<{ alerts: any[]; total: number }>({
        queryKey: ["/api/verification/fraud-alerts", { severity: "high", limit: 5 }],
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const highRiskAlerts = alerts?.alerts.filter(a => a.severity === "high" || a.severity === "critical") || [];

    if (highRiskAlerts.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                    {highRiskAlerts.length} High-Risk Fraud Alert{highRiskAlerts.length > 1 ? "s" : ""}
                    <Badge variant="destructive">{highRiskAlerts.length}</Badge>
                </AlertTitle>
                <AlertDescription>
                    <div className="mt-2 space-y-2">
                        {highRiskAlerts.slice(0, 3).map((alert, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span>
                                    {alert.detectionType} - Risk Score: {alert.riskScore}/100
                                </span>
                                <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                                    {alert.severity}
                                </Badge>
                            </div>
                        ))}
                        {highRiskAlerts.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                                +{highRiskAlerts.length - 3} more alerts
                            </div>
                        )}
                    </div>
                    <Link href="/admin/verification/fraud-alerts">
                        <button className="mt-3 text-sm font-semibold hover:underline">
                            View All Fraud Alerts →
                        </button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    );
}
