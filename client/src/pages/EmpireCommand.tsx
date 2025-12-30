import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    DollarSign,
    Users,
    Activity,
    Cpu,
    Monitor,
    Mic,
    TrendingUp,
    Radio,
    ShieldAlert
} from "lucide-react";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EmpireCommand() {
    // REAL DATA FEED
    const { data: stats, isLoading } = useQuery({
        queryKey: ['empire-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/empire-stats');
            if (!res.ok) throw new Error('Failed to fetch empire stats');
            return res.json();
        },
        // Fallback initial data to avoid hydration flicker
        initialData: {
            studioFund: { goal: 15000, current: 0, percent: 0 },
            monthlyRevenue: 0,
            activeFounders: 0,
            vibeState: "0.0",
            growthVelocity: 1.0,
            recentEvents: []
        }
    });

    const studioFundGoal = stats.studioFund.goal;
    const currentFund = stats.studioFund.current;
    const percentFunded = stats.studioFund.percent;

    return (
        <div className="min-h-screen bg-black text-foreground font-mono">
            <Header />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">
                            Empire Command
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            OPERATIONAL STATUS: <span className="text-green-500 animate-pulse">ONLINE</span>
                        </p>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-500 px-4 py-1">
                        VIBE PROTOCOL: ACTIVE
                    </Badge>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Card className="p-6 bg-green-950/10 border-green-900/50 hover:bg-green-900/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-xs text-green-500 font-bold">+12%</span>
                        </div>
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Monthly Recurring</h3>
                        <p className="text-3xl font-bold text-white">${stats.monthlyRevenue.toFixed(2)}</p>
                    </Card>

                    <Card className="p-6 bg-blue-950/10 border-blue-900/50 hover:bg-blue-900/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-xs text-blue-500 font-bold">LIVE</span>
                        </div>
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Active Founders</h3>
                        <p className="text-3xl font-bold text-white">{stats.activeFounders.toLocaleString()}</p>
                    </Card>

                    <Card className="p-6 bg-purple-950/10 border-purple-900/50 hover:bg-purple-900/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Activity className="w-6 h-6 text-purple-500" />
                            </div>
                            <span className="text-xs text-purple-500 font-bold">HIGH</span>
                        </div>
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Vibe State</h3>
                        <p className="text-3xl font-bold text-white">{stats.vibeState}%</p>
                    </Card>

                    <Card className="p-6 bg-orange-950/10 border-orange-900/50 hover:bg-orange-900/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="text-xs text-orange-500 font-bold">Q1 GOAL</span>
                        </div>
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Growth Velocity</h3>
                        <p className="text-3xl font-bold text-white">x{stats.growthVelocity}</p>
                    </Card>
                </div>

                {/* STUDIO BUILD-OUT FUND */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <Card className="p-8 border-white/10 bg-black relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Building2 className="w-64 h-64" />
                            </div>

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-orange-500" />
                                PROJECT: IRON CITADEL (Studio Build)
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Funding Progress</span>
                                        <span className="text-white font-bold">${currentFund.toLocaleString()} / ${studioFundGoal.toLocaleString()}</span>
                                    </div>
                                    <Progress value={percentFunded} className="h-4 bg-zinc-800" indicatorClassName="bg-gradient-to-r from-orange-600 to-yellow-500" />
                                    <p className="text-xs text-right mt-2 text-muted-foreground">{percentFunded.toFixed(1)}% Funded</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center gap-4 opacity-50">
                                        <Monitor className="w-8 h-8 text-zinc-600" />
                                        <div>
                                            <h4 className="font-bold text-zinc-400">Pro Display XDR</h4>
                                            <p className="text-xs text-zinc-600">Pending Funds</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center gap-4 opacity-50">
                                        <Cpu className="w-8 h-8 text-zinc-600" />
                                        <div>
                                            <h4 className="font-bold text-zinc-400">Mac Studio M3</h4>
                                            <p className="text-xs text-zinc-600">Pending Funds</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center gap-4 opacity-50">
                                        <Mic className="w-8 h-8 text-zinc-600" />
                                        <div>
                                            <h4 className="font-bold text-zinc-400">Shure SM7B</h4>
                                            <p className="text-xs text-zinc-600">Pending Funds</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/50 flex items-center gap-4">
                                        <Cpu className="w-8 h-8 text-green-500" />
                                        <div>
                                            <h4 className="font-bold text-green-400">Vibe Coding MVP</h4>
                                            <p className="text-xs text-green-600">DEPLOYED</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ACTION FEED */}
                    <Card className="p-6 border-white/10 bg-zinc-950/50 overflow-hidden">
                        <h3 className="font-bold text-lg mb-4 text-white uppercase tracking-wider border-b border-white/10 pb-2">
                            System Events
                        </h3>
                        <div className="space-y-4 text-xs font-mono">
                            {stats.recentEvents.map((event: any, i: number) => (
                                <div key={i} className={`flex gap-3 text-${event.color}-400`}>
                                    <span className="opacity-50">{event.time}</span>
                                    <span>{event.msg}</span>
                                </div>
                            ))}
                            <div className="flex gap-3 text-zinc-500">
                                <span className="opacity-50">10:45:00</span>
                                <span>[BOT] Twitter Prompt Updated</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <ConfigModule />

            </div>
        </div>
    );
}

function ConfigModule() {
    const [dbUrl, setDbUrl] = useState("");
    const [sesEmail, setSesEmail] = useState("");
    const [awsAccessKey, setAwsAccessKey] = useState("");
    const [awsSecretKey, setAwsSecretKey] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [msg, setMsg] = useState("");

    const handleSubmit = async () => {
        setStatus("loading");
        try {
            const res = await fetch('/api/admin/config/env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ databaseUrl: dbUrl, sesEmail, awsAccessKey, awsSecretKey })
            });
            const data = await res.json();

            if (data.success) {
                setStatus("success");
                setMsg("Configuration Updated. System rebooting...");
                setTimeout(() => window.location.reload(), 3000);
            } else {
                throw new Error(data.error || "Update failed");
            }
        } catch (e: any) {
            setStatus("error");
            setMsg(e.message);
        }
    };

    return (
        <Card className="p-8 border-red-900/50 bg-red-950/10 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-64 h-64 text-red-500" />
            </div>

            <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-red-500">
                    <Radio className="w-6 h-6 animate-pulse" />
                    NETWORK UPLINK (CLASSIFIED)
                </h2>
                <p className="text-muted-foreground mb-6">
                    Establish secure connection to production mainframe. Input authorized command keys below.
                </p>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="db" className="text-red-400">DATABASE_URL (PostgreSQL Connection String)</Label>
                        <Input
                            id="db"
                            type="password"
                            className="bg-black/50 border-red-900 focus:border-red-500"
                            placeholder="postgres://user:pass@host:5432/db"
                            value={dbUrl}
                            onChange={(e) => setDbUrl(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ses" className="text-red-400">SES_VERIFIED_EMAIL (AWS Sender Identity)</Label>
                        <Input
                            id="ses"
                            className="bg-black/50 border-red-900 focus:border-red-500"
                            placeholder="masterchief@vibe-coding.io"
                            value={sesEmail}
                            onChange={(e) => setSesEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="awsKey" className="text-red-400">AWS_ACCESS_KEY_ID</Label>
                            <Input
                                id="awsKey"
                                className="bg-black/50 border-red-900 focus:border-red-500"
                                placeholder="AKIA..."
                                value={awsAccessKey}
                                onChange={(e) => setAwsAccessKey(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="awsSecret" className="text-red-400">AWS_SECRET_ACCESS_KEY</Label>
                            <Input
                                id="awsSecret"
                                type="password"
                                className="bg-black/50 border-red-900 focus:border-red-500"
                                placeholder="Secret..."
                                value={awsSecretKey}
                                onChange={(e) => setAwsSecretKey(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={status === 'loading'}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold w-full mt-4"
                    >
                        {status === 'loading' ? (
                            <span className="flex items-center gap-2">
                                <Activity className="animate-spin" /> UPLINKING...
                            </span>
                        ) : (
                            "INITIALIZE PRODUCTION LINK"
                        )}
                    </Button>

                    {status === 'success' && (
                        <div className="p-4 bg-green-900/20 border border-green-500 text-green-400 rounded-md flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            {msg}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-900/20 border border-red-500 text-red-400 rounded-md">
                            ERROR: {msg}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
