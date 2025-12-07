import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle2, Rocket, Target, BarChart3, DollarSign, RefreshCw, Wifi, WifiOff
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
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<PlatformStats>({
        queryKey: ['/api/public/platform-stats'],
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const isOperational = stats?.platformStatus === 'operational';

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="border-b border-brand-copper/20 bg-black">
                <div className="container mx-auto py-8 px-4 max-w-6xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-white">
                                GG Loop × AWS Partnership Roadmap
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Gaming rewards platform seeking infrastructure partnership
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isOperational ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                                    Live
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
                {/* WHERE WE ARE TODAY */}
                <Card className="mb-8 border-brand-copper/30 bg-brand-dark/50 backdrop-blur">
                    <CardHeader className="border-b border-brand-copper/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl text-brand-copper">
                                <BarChart3 className="h-6 w-6" />
                                Where We Are Today
                                <Badge className="bg-brand-copper/20 text-brand-copper text-xs">LIVE DATA</Badge>
                            </CardTitle>
                            <button
                                onClick={() => refetchStats()}
                                className="text-brand-copper hover:text-brand-copper-light transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-gray-400 mt-2 text-sm">
                            Real numbers from production • Updated {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : '...'}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Platform Status</div>
                                <div className="text-2xl font-bold text-brand-copper">
                                    {stats?.stage === 'pilot' ? 'Pilot' : 'Active'}
                                </div>
                            </div>
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Users</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalUsers || 0}</div>
                            </div>
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Paying Customers</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.activeSubscriptions || 0}</div>
                            </div>
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Rewards Catalog</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalRewards || 0}</div>
                            </div>
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Rewards Claimed</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.rewardsRedeemed || 0}</div>
                            </div>
                            <div className="bg-black/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Uptime</div>
                                <div className="text-2xl font-bold text-brand-copper">
                                    {stats ? formatUptime(stats.uptimeSeconds) : '...'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-lg p-4">
                            <p className="text-sm text-gray-300">
                                <strong className="text-brand-copper">100% Honesty:</strong> We're in pilot with {stats?.actualMetrics.totalUsers || 0} early testers.
                                These are real numbers—no inflation. We're here to show you what we've built and scale it with AWS.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* WHAT WE'VE BUILT */}
                <Card className="mb-8 border-brand-copper/30 bg-brand-dark/50 backdrop-blur">
                    <CardHeader className="border-b border-brand-copper/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-brand-copper">
                            <CheckCircle2 className="h-6 w-6" />
                            What We've Built
                        </CardTitle>
                        <p className="text-gray-400 mt-2 text-sm">
                            Production-ready features live on ggloop.io
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-brand-copper font-semibold mb-3">Core Platform</h4>
                                <ul className="space-y-2">
                                    {stats?.capabilities.authProviders.map((provider) => (
                                        <li key={provider} className="text-gray-300 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-brand-copper" />
                                            {provider} login (OAuth)
                                        </li>
                                    ))}
                                    <li className="text-gray-300 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-brand-copper" />
                                        {stats?.capabilities.paymentProvider} payments
                                    </li>
                                    <li className="text-gray-300 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-brand-copper" />
                                        PostgreSQL database
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-brand-copper font-semibold mb-3">Features</h4>
                                <ul className="space-y-2">
                                    {stats?.capabilities.featuresReady.slice(0, 6).map((feature) => (
                                        <li key={feature} className="text-gray-300 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-brand-copper" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WHERE WE WANT TO GO */}
                <Card className="mb-8 border-amber-500/30 bg-brand-dark/50 backdrop-blur">
                    <CardHeader className="border-b border-amber-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-amber-400">
                            <Target className="h-6 w-6" />
                            Where We Want To Go
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs">GOALS</Badge>
                        </CardTitle>
                        <p className="text-gray-400 mt-2 text-sm">
                            These are targets, not current numbers
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-black/50 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">6-Month Goal</div>
                                <div className="text-2xl font-bold text-white">1,000 users</div>
                            </div>
                            <div className="bg-black/50 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">1-Year Target</div>
                                <div className="text-2xl font-bold text-white">10,000 users</div>
                            </div>
                            <div className="bg-black/50 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Revenue Goal (Year 1)</div>
                                <div className="text-2xl font-bold text-white">$100K ARR</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WHY AWS */}
                <Card className="mb-8 border-blue-500/30 bg-brand-dark/50 backdrop-blur">
                    <CardHeader className="border-b border-blue-500/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-blue-400">
                            <Rocket className="h-6 w-6" />
                            Why We Need AWS
                        </CardTitle>
                        <p className="text-gray-400 mt-2 text-sm">
                            We're ready to scale with the right partner
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="bg-black/50 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Current Setup (Railway)</h4>
                                <p className="text-gray-300 text-sm">
                                    Hosted on Railway with Neon PostgreSQL. Great for pilot, but limited scalability.
                                </p>
                            </div>
                            <div className="bg-black/50 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">AWS Migration Benefits</h4>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        EC2 + RDS for better performance
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        CloudFront CDN for global reach
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Auto-scaling for growth
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Enterprise security & compliance
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WHAT WE'RE ASKING FOR */}
                <Card className="border-brand-copper/30 bg-brand-dark/50 backdrop-blur">
                    <CardHeader className="border-b border-brand-copper/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-brand-copper">
                            <DollarSign className="h-6 w-6" />
                            What We're Asking For
                        </CardTitle>
                        <p className="text-gray-400 mt-2 text-sm">
                            Partnership to scale from pilot to production
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-lg p-4">
                                <h4 className="text-brand-copper font-semibold mb-2">1. AWS Activate Credits</h4>
                                <p className="text-gray-300 text-sm mb-2">
                                    $10K-$25K in credits to offset infrastructure costs
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Helps us migrate without burning runway
                                </p>
                            </div>
                            <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-lg p-4">
                                <h4 className="text-brand-copper font-semibold mb-2">2. Technical Partnership</h4>
                                <p className="text-gray-300 text-sm mb-2">
                                    Architecture review and deployment guidance
                                </p>
                                <p className="text-gray-500 text-xs">
                                    AWS expertise to do it right the first time
                                </p>
                            </div>
                            <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-lg p-4">
                                <h4 className="text-brand-copper font-semibold mb-2">3. Long-term Growth</h4>
                                <p className="text-gray-300 text-sm">
                                    As we grow, AWS grows with us
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm border-t border-brand-copper/20 pt-6">
                    <p>
                        <strong className="text-brand-copper">Transparency:</strong> "Where We Are Today" = real-time production data •
                        "Goals" = aspirational targets
                    </p>
                </div>
            </div>
        </div>
    );
}
