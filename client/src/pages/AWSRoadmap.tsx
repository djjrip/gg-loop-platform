import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    CheckCircle2, Rocket, Target, BarChart3, DollarSign, RefreshCw, WifiOff, Home, Heart, Users
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
    const { data: stats, refetch: refetchStats } = useQuery<PlatformStats>({
        queryKey: ['/api/public/platform-stats'],
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const isOperational = stats?.platformStatus === 'operational';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-primary/20 bg-background">
                <div className="container mx-auto py-8 px-4 max-w-6xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="mb-4">
                                    <Home className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <h1 className="text-4xl font-bold mb-2 text-foreground">
                                GG Loop × AWS Partnership Roadmap
                            </h1>
                            <p className="text-muted-foreground text-lg">
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
                {/* ABOUT GG LOOP & MISSION */}
                <Card className="mb-8 border-primary/30 bg-card backdrop-blur">
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* About GG Loop */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">About GG Loop</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    GG LOOP is an all-in-one gaming rewards ecosystem for every kind of gamer. Whether you're grinding competitive matches or relaxing on a casual night in, you earn points for playing the games you already love — redeemable for real-life value. GG LOOP blends gaming culture with sneaker-inspired aesthetics, subtle basketball energy, modern fashion influence, and real-world identity.
                                </p>
                            </div>

                            {/* Mission */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">Mission</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    To build the most inclusive and culturally-rooted rewards platform that empowers gamers with real value, real community, and real-life support — from shoes to groceries to wellness resources — while celebrating gaming, culture, and individuality.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Platform Status</div>
                                <div className="text-2xl font-bold text-brand-copper">
                                    {stats?.stage === 'pilot' ? 'Pilot' : 'Active'}
                                </div>
                            </div>
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Users</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalUsers || 0}</div>
                            </div>
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Paying Customers</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.activeSubscriptions || 0}</div>
                            </div>
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Rewards Catalog</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.totalRewards || 0}</div>
                            </div>
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Rewards Claimed</div>
                                <div className="text-2xl font-bold text-white">{stats?.actualMetrics.rewardsRedeemed || 0}</div>
                            </div>
                            <div className="bg-card/50 border border-brand-copper/20 rounded-lg p-4">
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

                {/* 3-PHASE ROADMAP - PLAIN ENGLISH */}
                <Card className="mb-8 border-primary/30 bg-card/50 backdrop-blur">
                    <CardHeader className="border-b border-primary/20">
                        <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                            <Target className="h-6 w-6 text-primary" />
                            3-Phase Roadmap
                            <Badge className="bg-primary/20 text-primary text-xs">PLAIN ENGLISH</Badge>
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Our clear path from pilot to global platform
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Phase 1 */}
                            <div className="bg-card border border-primary/20 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-primary">Phase 1 — Strengthen the Foundation</h3>
                                    <Badge className="bg-primary/20 text-primary text-xs">Next 8–12 Weeks</Badge>
                                </div>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Make the platform more stable
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Add better tracking so we know when something breaks
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Add better tools so the system doesn't slow down or crash
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Organize the backend code so it's easier to build on
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Improve load times and reliability for users
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                        Make sure everything scales safely before moving to AWS
                                    </li>
                                </ul>
                            </div>

                            {/* Phase 2 */}
                            <div className="bg-card border border-blue-500/30 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-blue-400">Phase 2 — Move to AWS</h3>
                                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">4 Weeks</Badge>
                                </div>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" />
                                        Move our servers from our current host to AWS
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" />
                                        Store our data in Amazon's database system
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" />
                                        Use AWS to make the site faster worldwide
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" />
                                        Use AWS tools so the app automatically grows with more players
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" />
                                        Use AWS to make our system more secure, reliable, and professional
                                    </li>
                                </ul>
                            </div>

                            {/* Phase 3 */}
                            <div className="bg-card border border-amber-500/30 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-amber-400">Phase 3 — Growth & Expansion</h3>
                                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Long-Term</Badge>
                                </div>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                        Add more games
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                        Build better rewards
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                        Build the marketplace later
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                        Add more community and culture features
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                        Scale responsibly as users grow
                                    </li>
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
                            <div className="bg-card/50 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">6-Month Goal</div>
                                <div className="text-2xl font-bold text-white">1,000 users</div>
                            </div>
                            <div className="bg-card/50 border border-amber-500/20 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">1-Year Target</div>
                                <div className="text-2xl font-bold text-white">10,000 users</div>
                            </div>
                            <div className="bg-card/50 border border-amber-500/20 rounded-lg p-4">
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
                            <div className="bg-card/50 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Why We Need AWS First</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Before we scale, we need a stronger foundation. AWS helps us handle more players, stay online,
                                    grow globally, and operate like a professional large-scale platform. This roadmap shows the steps
                                    we take to get ready for that growth.
                                </p>
                            </div>
                            <div className="bg-card/50 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Current Setup (Railway)</h4>
                                <p className="text-gray-300 text-sm">
                                    Hosted on Railway with Neon PostgreSQL. Great for pilot, but limited scalability.
                                </p>
                            </div>
                            <div className="bg-card/50 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">What AWS Unlocks</h4>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Faster website load times
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Handles thousands more players without breaking
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Better security
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Better monitoring so we catch issues early
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Global performance boost
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        Lower long-term infrastructure costs as we scale
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
                <div className="mt-8 text-center text-gray-500 text-sm border-t border-brand-copper/20 pt-6 space-y-2">
                    <p>
                        <strong className="text-brand-copper">Transparency:</strong> "Where We Are Today" = real-time production data •
                        "Goals" = aspirational targets
                    </p>
                    <p className="text-gray-400 italic max-w-3xl mx-auto">
                        This roadmap shows our honest, clear path from a small pilot to a stable, scalable,
                        global platform built on AWS — with transparency at every step.
                    </p>
                </div>
            </div>
        </div>
    );
}
