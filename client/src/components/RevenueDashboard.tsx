/**
 * REVENUE DASHBOARD COMPONENT
 * Real-time affiliate commission tracking
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Package, Percent, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AffiliateDashboard {
    last7Days: {
        totalRedemptions: number;
        totalCommission: number;
        amazonCommission: number;
        impactCommission: number;
    };
    last30Days: {
        totalRedemptions: number;
        totalCommission: number;
        amazonCommission: number;
        impactCommission: number;
    };
    allTime: {
        totalRedemptions: number;
        totalCommission: number;
    };
    projectedMonthly: number;
    networks: {
        amazon: { name: string; commission: number; last30Days: number };
        impact: { name: string; commission: number; last30Days: number };
    };
}

export function RevenueDashboard() {
    const { data, isLoading } = useQuery<AffiliateDashboard>({
        queryKey: ['/api/affiliate/dashboard'],
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Affiliate Revenue</h2>
                <p className="text-muted-foreground">
                    Real-time commission tracking from Amazon Associates & Impact.com
                </p>
            </div>

            {/* Main Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Last 7 Days</CardDescription>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(data.last7Days.totalCommission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.last7Days.totalRedemptions} redemptions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Last 30 Days</CardDescription>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(data.last30Days.totalCommission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.last30Days.totalRedemptions} redemptions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Projected Monthly</CardDescription>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.projectedMonthly)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Based on last 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>All Time</CardDescription>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(data.allTime.totalCommission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.allTime.totalRedemptions} total redemptions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Network Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <img
                                src="https://logo.clearbit.com/amazon.com"
                                alt="Amazon"
                                className="h-5 w-5"
                            />
                            Amazon Associates
                        </CardTitle>
                        <CardDescription>Physical gaming products</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Commission Rate</span>
                            <Badge variant="secondary">
                                {(data.networks.amazon.commission * 100).toFixed(0)}%
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last 30 Days</span>
                            <span className="text-lg font-bold text-primary">
                                {formatCurrency(data.networks.amazon.last30Days)}
                            </span>
                        </div>
                        <a
                            href="https://affiliate-program.amazon.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                            View Dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <img
                                src="https://logo.clearbit.com/impact.com"
                                alt="Impact"
                                className="h-5 w-5"
                            />
                            Impact.com Network
                        </CardTitle>
                        <CardDescription>Gift cards, game keys, digital</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Avg Commission</span>
                            <Badge variant="secondary">
                                {(data.networks.impact.commission * 100).toFixed(0)}%
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last 30 Days</span>
                            <span className="text-lg font-bold text-primary">
                                {formatCurrency(data.networks.impact.last30Days)}
                            </span>
                        </div>
                        <a
                            href="https://app.impact.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                            View Dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Commission Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>30-Day Commission Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Amazon Associates</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatCurrency(data.last30Days.amazonCommission)}
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500"
                                    style={{
                                        width: `${(data.last30Days.amazonCommission / data.last30Days.totalCommission) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Impact.com Network</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatCurrency(data.last30Days.impactCommission)}
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{
                                        width: `${(data.last30Days.impactCommission / data.last30Days.totalCommission) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
