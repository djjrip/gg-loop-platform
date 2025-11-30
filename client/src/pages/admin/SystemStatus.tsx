import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";

export default function SystemStatus() {
    const { data: status, isLoading, error } = useQuery({
        queryKey: ["/api/admin/system-status"],
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                Failed to load system status
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "healthy":
            case "configured":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "unhealthy":
            case "missing_config":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
            case "configured":
                return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "unhealthy":
            case "missing_config":
                return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default:
                return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto p-8">
                <h1 className="mb-8 text-3xl font-bold">System Status</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Database Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database</CardTitle>
                            {getStatusIcon(status.database.status)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{status.database.status}</div>
                            <p className="text-xs text-muted-foreground">
                                Latency: {status.database.latency}ms
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tremendous Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tremendous Rewards</CardTitle>
                            {getStatusIcon(status.tremendous.status)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {status.tremendous.status.replace("_", " ")}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gift card fulfillment integration
                            </p>
                        </CardContent>
                    </Card>

                    {/* Server Info */}
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Server Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Server Time</div>
                                <div className="text-lg">{new Date(status.serverTime).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                                <div className="text-lg">{(status.uptime / 60).toFixed(2)} minutes</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
