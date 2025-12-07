import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle2, Clock, Target, Zap, Shield, DollarSign, Users, TrendingUp,
    Activity, Database, Server, RefreshCw, Wifi, WifiOff, BarChart3, Rocket
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header with Empire theme */}
            <div className="border-b border-green-500/20 bg-slate-950/50 backdrop-blur-sm">
                <div className="container mx-auto py-6 px-4 max-w-6xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-green-400" style={{ textShadow: '0 0 20px rgba(34,197,94,0.5)' }}>
                                GG Loop × AWS Partnership Roadmap
                            </h1>
                            <p className="text-slate-400 text-lg">
                                Gaming rewards platform • Seeking infrastructure partnership
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isOperational ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                                    System Online
                                </Badge>
                            ) : (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/50 px-3 py-1">
                                    <WifiOff className="w-3 h-3 mr-2" />
                                    Checking...
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* =============================================== */}
                {/* WHERE WE ARE TODAY - REAL NUMBERS */}
                {/* =============================================== */}
                <Card className="mb-8 border-green-500/30 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="border-b border-green-500/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl text-green-400">
                                <BarChart3 className="h-6 w-6" />
                                Where We Are Today
                                <Badge className="bg-green-500/20 text-green-400 text-xs">LIVE DATA</Badge>
                            </CardTitle>
                            <button
                                onClick={() => refetchStats()}
                                className="text-green-400 hover:text-green-300 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                            Real numbers from our production database • Updated {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : '...'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Platform Status</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {stats?.stage === 'pilot' ? 'Pilot Stage' : 'Active'}
                                </div>
                            </div>
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Users</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalUsers || 0}</div>
                            </div>
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Paying Customers</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.activeSubscriptions || 0}</div>
                            </div>
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Rewards Catalog</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalRewards || 0}</div>
                            </div>
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Rewards Claimed</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.rewardsRedeemed || 0}</div>
                            </div>
                            <div className="bg-slate-800/30 border border-green-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Uptime</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {stats ? formatUptime(stats.uptimeSeconds) : '...'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <p className="text-sm text-slate-300">
                                <strong className="text-green-400">Honesty first:</strong> We're in pilot stage with {stats?.actualMetrics.totalUsers || 0} early testers.
                                These are real numbers—no inflation, no estimates. We're here to show you what we've built and scale it with AWS.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* =============================================== */}
                {/* WHAT WE'VE BUILT */}
                {/* =============================================== */}
                <Card className="mb-8 border-green-500/30 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="border-b border-green-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-green-400">
                            <CheckCircle2 className="h-6 w-6" />
                            What We've Built
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            Production-ready features live on ggloop.io right now
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Core Platform
                                </h4>
                                <ul className="space-y-2">
                                    {stats?.capabilities.authProviders.map((provider) => (
                                        <li key={provider} className="text-slate-300 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            {provider} login (OAuth)
                                        </li>
                                    ))}
                                    <li className="text-slate-300 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        {stats?.capabilities.paymentProvider} subscription payments
                                    </li>
                                    <li className="text-slate-300 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        PostgreSQL database (Neon)
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Features
                                </h4>
                                <ul className="space-y-2">
                                    {stats?.capabilities.featuresReady.slice(0, 6).map((feature) => (
                                        <li key={feature} className="text-slate-300 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =============================================== */}
                {/* WHERE WE WANT TO GO - GOALS */}
                {/* =============================================== */}
                <Card className="mb-8 border-amber-500/30 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="border-b border-amber-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-amber-400">
                            <Target className="h-6 w-6" />
                            Where We Want To Go
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs">GOALS</Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            These are our targets—not current numbers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800/30 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Short-term Goal (6 months)</div>
                                <div className="text-2xl font-bold text-white">1,000 users</div>
                            </div>
                            <div className="bg-slate-800/30 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">1-Year Target</div>
                                <div className="text-2xl font-bold text-white">10,000 users</div>
                            </div>
                            <div className="bg-slate-800/30 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-slate-400 text-sm mb-1">Revenue Goal (Year 1)</div>
                                <div className="text-2xl font-bold text-white">$100K ARR</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =============================================== */}
                {/* WHY AWS */}
                {/* =============================================== */}
                <Card className="mb-8 border-blue-500/30 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="border-b border-blue-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-blue-400">
                            <Rocket className="h-6 w-6" />
                            Why We Need AWS
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            We're ready to scale, but need the right infrastructure partner
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="bg-slate-800/30 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Where We Are (Railway)</h4>
                                <p className="text-slate-300 text-sm">
                                    Currently hosted on Railway with Neon PostgreSQL. Great for getting started, but limited scalability.
                                </p>
                            </div>
                            <div className="bg-slate-800/30 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Where We Want To Be (AWS)</h4>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        <strong>Better performance:</strong> EC2 for compute, RDS for database
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        <strong>Global reach:</strong> CloudFront CDN for fast loading worldwide
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        <strong>Room to grow:</strong> Auto-scaling to handle thousands of concurrent users
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        <strong>Enterprise-grade:</strong> Security, compliance, and reliability
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =============================================== */}
                {/* WHAT WE'RE ASKING FOR */}
                {/* =============================================== */}
                <Card className="border-green-500/30 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="border-b border-green-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-green-400">
                            <DollarSign className="h-6 w-6" />
                            What We're Asking For
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            Partnership to help us scale from pilot to production
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h4 className="text-green-400 font-semibold mb-2">1. AWS Activate Credits</h4>
                                <p className="text-slate-300 text-sm mb-2">
                                    $10,000 - $25,000 in AWS credits to offset initial infrastructure costs
                                </p>
                                <p className="text-slate-400 text-xs">
                                    This helps us migrate from Railway to AWS without burning through our runway
                                </p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h4 className="text-green-400 font-semibold mb-2">2. Technical Partnership</h4>
                                <p className="text-slate-300 text-sm mb-2">
                                    Architecture review and guidance for production deployment
                                </p>
                                <p className="text-slate-400 text-xs">
                                    We want to do this right the first time—AWS expertise would be invaluable
                                </p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h4 className="text-green-400 font-semibold mb-2">3. Long-term Partnership</h4>
                                <p className="text-slate-300 text-sm">
                                    As we grow, AWS grows with us. We're building for the long haul.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer note */}
                <div className="mt-8 text-center text-slate-500 text-sm border-t border-green-500/20 pt-6">
                    <p className="mb-2">
                        <strong className="text-green-400">Data Transparency:</strong> "Where We Are Today" shows real-time production data.
                        "Where We Want To Go" shows aspirational targets.
                    </p>
                    <p className="text-xs">
                        Platform operational since {stats ? new Date(stats.lastUpdated).toLocaleDateString() : '2025'} •
                        Powered by React, Node.js, PostgreSQL
                    </p>
                </div>
            </div>
        </div>
    );
}
