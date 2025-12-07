import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle2, Clock, Target, Zap, Shield, DollarSign, Users, TrendingUp,
    Activity, Database, Server, RefreshCw, Wifi, WifiOff
} from "lucide-react";

// Types for API responses
interface PlatformStats {
    platformStatus: string;
    databaseStatus: string;
    uptimeSeconds: number;
    lastUpdated: string;
    actualMetrics: {
        totalUsers: number;
        activeSubscriptions: number;
        totalRewards: number;
        rewardsRedeemed: number;
        totalReferrals: number;
        totalGames: number;
    };
    capabilities: {
        authProviders: string[];
        paymentProvider: string;
        gamesSupported: string[];
        featuresReady: string[];
    };
    stage: string;
}

interface HealthStatus {
    status: string;
    timestamp: string;
    database: string;
    uptime: number;
}

// Format uptime to readable string
function formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
}

export default function AWSRoadmap() {
    // Fetch REAL platform stats
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<PlatformStats>({
        queryKey: ['/api/public/platform-stats'],
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Fetch health status
    const { data: health, isLoading: healthLoading } = useQuery<HealthStatus>({
        queryKey: ['/api/health'],
        refetchInterval: 15000,
    });

    const isHealthy = health?.status === 'healthy';
    const isOperational = stats?.platformStatus === 'operational';

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl print:py-4">
            {/* Header */}
            <div className="mb-8 print:mb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent print:text-black">
                            GG Loop AWS Partnership Roadmap
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Pilot-stage gaming rewards platform seeking AWS infrastructure partnership
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOperational ? (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                                <Wifi className="w-3 h-3 mr-1" /> Platform Operational
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                                <WifiOff className="w-3 h-3 mr-1" /> Status Unknown
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* =============================================== */}
            {/* CURRENT ACTUAL DATA - REAL NUMBERS FROM DATABASE */}
            {/* =============================================== */}
            <Card className="mb-8 border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Activity className="h-5 w-5 text-green-500" />
                            Current Actual Data
                            <Badge variant="outline" className="ml-2 text-xs bg-green-500/10 text-green-400">LIVE</Badge>
                        </CardTitle>
                        <button
                            onClick={() => refetchStats()}
                            className="text-muted-foreground hover:text-green-400 transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <CardDescription>
                        Real metrics from production database • Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Loading...'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {statsLoading ? (
                        <div className="text-muted-foreground">Loading real metrics...</div>
                    ) : statsError ? (
                        <div className="text-red-400">Failed to load metrics - showing defaults</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <MetricCard
                                label="Total Users"
                                value={stats?.actualMetrics.totalUsers ?? 0}
                                icon={<Users className="h-4 w-4" />}
                            />
                            <MetricCard
                                label="Active Subscriptions"
                                value={stats?.actualMetrics.activeSubscriptions ?? 0}
                                icon={<DollarSign className="h-4 w-4" />}
                            />
                            <MetricCard
                                label="Rewards Available"
                                value={stats?.actualMetrics.totalRewards ?? 0}
                                icon={<Target className="h-4 w-4" />}
                            />
                            <MetricCard
                                label="Rewards Redeemed"
                                value={stats?.actualMetrics.rewardsRedeemed ?? 0}
                                icon={<CheckCircle2 className="h-4 w-4" />}
                            />
                            <MetricCard
                                label="Referrals"
                                value={stats?.actualMetrics.totalReferrals ?? 0}
                                icon={<Users className="h-4 w-4" />}
                            />
                            <MetricCard
                                label="Games Integrated"
                                value={stats?.actualMetrics.totalGames ?? 0}
                                icon={<Zap className="h-4 w-4" />}
                            />
                        </div>
                    )}

                    {/* Platform Status Row */}
                    <div className="mt-6 pt-4 border-t border-green-500/20">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <StatusIndicator
                                label="Platform"
                                status={isOperational ? 'operational' : 'unknown'}
                            />
                            <StatusIndicator
                                label="Database"
                                status={stats?.databaseStatus === 'connected' ? 'connected' : 'unknown'}
                            />
                            <StatusIndicator
                                label="API"
                                status={isHealthy ? 'healthy' : 'unknown'}
                            />
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Server className="h-4 w-4" />
                                Uptime: {stats?.uptimeSeconds ? formatUptime(stats.uptimeSeconds) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Database className="h-4 w-4" />
                                Stage: <span className="capitalize text-white">{stats?.stage || 'pilot'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* =============================================== */}
            {/* WHAT'S BUILT & WORKING */}
            {/* =============================================== */}
            <Card className="mb-8 border-blue-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        What's Built & Working
                    </CardTitle>
                    <CardDescription>Production-ready features deployed now</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3 text-green-400">✅ Core Platform</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> React 18 + TypeScript frontend</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Node.js + Express backend</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> PostgreSQL database (Drizzle ORM)</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> OAuth: {stats?.capabilities.authProviders.join(', ') || 'Google, Discord, Twitch'}</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> {stats?.capabilities.paymentProvider || 'PayPal'} subscription payments</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Admin dashboard with controls</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-green-400">✅ Features Ready</h3>
                        <ul className="space-y-2 text-sm">
                            {(stats?.capabilities.featuresReady || [
                                'User Authentication (OAuth)',
                                'Subscription Payments',
                                'Rewards Catalog',
                                'Referral System',
                                'Admin Dashboard',
                                'Fulfillment Tracking'
                            ]).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* =============================================== */}
            {/* TARGETS / PROJECTIONS - CLEARLY LABELED */}
            {/* =============================================== */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-bold">Targets & Projections</h2>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">GOALS</Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                    These are aspirational targets contingent on achieving product-market fit. They are NOT current metrics.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                    {/* Phase 1 */}
                    <Card className="border-blue-500/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    Phase 1: Foundation
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">Months 1-3</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground">Infrastructure migration to AWS</p>
                            <ul className="space-y-1">
                                <li>• ECS Fargate deployment</li>
                                <li>• RDS PostgreSQL (Multi-AZ)</li>
                                <li>• ElastiCache Redis</li>
                                <li>• CloudFront CDN</li>
                            </ul>
                            <div className="pt-3 border-t border-border mt-3">
                                <p className="text-xs text-muted-foreground">TARGET: 1,000 engaged users</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Phase 2 */}
                    <Card className="border-yellow-500/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    Phase 2: Scale
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">Months 4-6</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground">Auto-scaling & multi-game</p>
                            <ul className="space-y-1">
                                <li>• ECS auto-scaling</li>
                                <li>• RDS read replicas</li>
                                <li>• Valorant integration</li>
                                <li>• CS2 integration</li>
                            </ul>
                            <div className="pt-3 border-t border-border mt-3">
                                <p className="text-xs text-muted-foreground">TARGET: 10,000 users</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Phase 3 */}
                    <Card className="border-green-500/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Phase 3: Enterprise
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">Year 2</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground">Global scale & B2B</p>
                            <ul className="space-y-1">
                                <li>• Multi-region deployment</li>
                                <li>• White-label solution</li>
                                <li>• Publisher API</li>
                                <li>• Enterprise SLA</li>
                            </ul>
                            <div className="pt-3 border-t border-border mt-3">
                                <p className="text-xs text-muted-foreground">TARGET: 50,000+ users</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* =============================================== */}
            {/* AWS PARTNERSHIP ASK */}
            {/* =============================================== */}
            <Card className="mb-8 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <DollarSign className="h-5 w-5 text-purple-500" />
                        AWS Partnership Request
                    </CardTitle>
                    <CardDescription>What we're asking for to validate production readiness</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">1. AWS Credits (Pilot)</h3>
                        <p className="text-sm text-muted-foreground mb-2">$10,000 - $25,000 for 6-month pilot</p>
                        <ul className="text-sm space-y-1">
                            <li>• RDS PostgreSQL (Multi-AZ)</li>
                            <li>• ElastiCache Redis</li>
                            <li>• ECS Fargate compute</li>
                            <li>• S3 + CloudFront CDN</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">2. Technical Partnership</h3>
                        <p className="text-sm text-muted-foreground mb-2">Solutions architect guidance</p>
                        <ul className="text-sm space-y-1">
                            <li>• Architecture review</li>
                            <li>• Migration planning</li>
                            <li>• Security audit</li>
                            <li>• Cost optimization</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* =============================================== */}
            {/* ARCHITECTURE DIAGRAM */}
            {/* =============================================== */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Proposed AWS Architecture
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-green-400 overflow-x-auto print:text-[10px]">
                        <pre>{`
┌─────────────────────────────────────────────────────┐
│                    USERS (Global)                   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Route 53 DNS  │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │   CloudFront   │ ◄── S3 (Static Assets)
              │      (CDN)     │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │   WAF + Shield │ (Security Layer)
              └───────┬────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Application Load      │
         │  Balancer (ALB)        │
         └───────────┬────────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
       ┌─────────┐       ┌─────────┐
       │ ECS     │       │ ECS     │  (Auto-scaling)
       │ Task 1  │       │ Task 2  │
       └────┬────┘       └────┬────┘
            │                 │
            └────────┬────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
       ┌─────────┐       ┌─────────┐
       │   RDS   │       │  Redis  │
       │ Primary │◄─────►│ Cache   │
       └────┬────┘       └─────────┘
            │
            ▼
       ┌─────────┐
       │   RDS   │
       │ Replica │
       └─────────┘

Monitoring: CloudWatch + X-Ray
Secrets: Secrets Manager + KMS
            `}</pre>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Note */}
            <div className="p-4 bg-muted/50 rounded-lg border print:bg-white print:border-gray-300">
                <p className="text-sm text-muted-foreground print:text-gray-600">
                    <strong>Note:</strong> GG Loop is in pilot/MVP stage with early testers. All "Current Actual Data"
                    reflects real database values. All "Targets & Projections" are clearly labeled as aspirational goals
                    contingent on product-market fit validation. We seek AWS partnership to establish secure, scalable
                    infrastructure that can grow with our user base.
                </p>
            </div>
        </div>
    );
}

// Metric card component
function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                {icon}
                {label}
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    );
}

// Status indicator component
function StatusIndicator({ label, status }: { label: string; status: string }) {
    const isGood = status === 'operational' || status === 'connected' || status === 'healthy';
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-muted-foreground">{label}:</span>
            <span className={isGood ? 'text-green-400' : 'text-yellow-400'}>{status}</span>
        </div>
    );
}
