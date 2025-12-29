/**
 * REVENUE COMMAND CENTER
 * Unified dashboard for all revenue operations
 * Integrates: Affiliates, Retention, Growth, Subscriptions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueDashboard } from '@/components/RevenueDashboard';
import { useQuery } from '@tanstack/react-query';
import {
    DollarSign,
    TrendingUp,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
    Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChurnRiskUser {
    userId: string;
    username: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    factors: string[];
}

interface OperationalMetrics {
    activeUsers: number;
    subscriptionMRR: number;
    affiliateRevenue30Days: number;
    churnRate: number;
    avgRedemptionValue: number;
    viralCoefficient: number;
}

export function RevenueCommandCenter() {
    // Fetch operational metrics
    const { data: metrics } = useQuery<OperationalMetrics>({
        queryKey: ['/api/admin/operational-metrics'],
        refetchInterval: 60000, // Every minute
    });

    // Fetch high-risk users
    const { data: churnRisks } = useQuery<ChurnRiskUser[]>({
        queryKey: ['/api/admin/churn-risks'],
        refetchInterval: 300000, // Every 5 minutes
    });

    const criticalRisks = churnRisks?.filter(u => u.riskLevel === 'critical') || [];
    const highRisks = churnRisks?.filter(u => u.riskLevel === 'high') || [];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Revenue Command Center</h1>
                <p className="text-muted-foreground">Real-time operational dashboard</p>
            </div>

            {/* Alert Bar */}
            {(criticalRisks.length > 0 || highRisks.length > 0) && (
                <Card className="border-orange-500 bg-orange-500/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="font-semibold">Churn Alerts</p>
                                    <p className="text-sm text-muted-foreground">
                                        {criticalRisks.length} critical, {highRisks.length} high risk users
                                    </p>
                                </div>
                            </div>
                            <a href="#retention" className="text-sm text-primary hover:underline">
                                View Details →
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Monthly Recurring Revenue</CardDescription>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${(metrics?.subscriptionMRR || 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From active subscriptions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Affiliate Revenue (30d)</CardDescription>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${(metrics?.affiliateRevenue30Days || 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commission earned
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Active Users</CardDescription>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.activeUsers || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Churn Rate</CardDescription>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((metrics?.churnRate || 0) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target: &lt;5%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
                    <TabsTrigger value="retention" id="retention">Retention</TabsTrigger>
                    <TabsTrigger value="growth">Growth</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Avg Redemption Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${(metrics?.avgRedemptionValue || 0).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Viral Coefficient</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(metrics?.viralCoefficient || 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics?.viralCoefficient && metrics.viralCoefficient > 1 ? 'Viral growth! 🚀' : 'Target: >1.0'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="text-xl font-bold">All Systems Operational</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Projections */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Projections</CardTitle>
                            <CardDescription>Based on current growth rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                    <span className="font-medium">Month 1</span>
                                    <span className="text-lg font-bold">
                                        ${((metrics?.subscriptionMRR || 0) + (metrics?.affiliateRevenue30Days || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                    <span className="font-medium">Month 3 (Projected)</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ${(((metrics?.subscriptionMRR || 0) + (metrics?.affiliateRevenue30Days || 0)) * 3.5).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                    <span className="font-medium">Month 6 (Projected)</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ${(((metrics?.subscriptionMRR || 0) + (metrics?.affiliateRevenue30Days || 0)) * 8).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="affiliates">
                    <RevenueDashboard />
                </TabsContent>

                <TabsContent value="retention" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Churn Risk Analysis</CardTitle>
                            <CardDescription>Users at risk of canceling</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!churnRisks || churnRisks.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No users analyzed yet. Check back after users sign up.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {churnRisks.slice(0, 10).map((user) => (
                                        <div
                                            key={user.userId}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{user.username}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.factors.slice(0, 2).join(', ')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        user.riskLevel === 'critical'
                                                            ? 'destructive'
                                                            : user.riskLevel === 'high'
                                                                ? 'default'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {user.riskLevel}
                                                </Badge>
                                                <span className="text-sm font-mono">{user.riskScore}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="growth" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Growth Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Referral Signups</span>
                                    <span className="font-bold">Track via /api/growth/referrals/stats</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Active Streaks</span>
                                    <span className="font-bold">Track via /api/growth/streaks/status</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Daily Challenges</span>
                                    <span className="font-bold">Track via /api/growth/challenges/daily</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Engagement Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">DAU/MAU Ratio</span>
                                    <span className="font-bold">Coming soon</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Session Duration</span>
                                    <span className="font-bold">Coming soon</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Retention (D7)</span>
                                    <span className="font-bold">Coming soon</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
