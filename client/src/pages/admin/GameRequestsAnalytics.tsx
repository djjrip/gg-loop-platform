import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Gamepad2, TrendingUp, BarChart3, Users, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const COLORS = ['#C19A6B', '#D4A373', '#8B7355', '#A0826D', '#C4A484', '#DEB887', '#F5DEB3', '#FFE4C4'];

interface GameRequest {
    id: string;
    gameName: string;
    platform: string;
    notes?: string;
    userId: string;
    createdAt: string;
}

interface GameStats {
    gameName: string;
    count: number;
    percentage: number;
}

export default function GameRequestsAnalytics() {
    const { data: requests, isLoading, refetch } = useQuery<GameRequest[]>({
        queryKey: ['game-requests'],
        queryFn: async () => {
            const res = await fetch('/api/admin/game-requests', {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        }
    });

    // Process data for charts
    const gameStats: GameStats[] = requests ?
        Object.entries(
            requests.reduce((acc: Record<string, number>, req) => {
                acc[req.gameName] = (acc[req.gameName] || 0) + 1;
                return acc;
            }, {})
        )
            .map(([gameName, count]) => ({
                gameName,
                count: count as number,
                percentage: Math.round((count as number / requests.length) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        : [];

    const platformStats = requests ?
        Object.entries(
            requests.reduce((acc: Record<string, number>, req) => {
                acc[req.platform] = (acc[req.platform] || 0) + 1;
                return acc;
            }, {})
        ).map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Link href="/admin">
                            <Button variant="ghost" className="pl-0 mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Admin
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Gamepad2 className="h-8 w-8 text-primary" />
                            Game Request Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            See which games your users want — prioritize based on demand
                        </p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Total Requests</span>
                        </div>
                        <p className="text-3xl font-bold">{requests?.length || 0}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Gamepad2 className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Unique Games</span>
                        </div>
                        <p className="text-3xl font-bold">{gameStats.length}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Most Requested</span>
                        </div>
                        <p className="text-xl font-bold truncate">{gameStats[0]?.gameName || 'N/A'}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Last 7 Days</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {requests?.filter(r => {
                                const date = new Date(r.createdAt);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return date > weekAgo;
                            }).length || 0}
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Top Requested Games */}
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Top Requested Games</h2>
                        {isLoading ? (
                            <div className="h-[300px] flex items-center justify-center">Loading...</div>
                        ) : gameStats.length === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                No requests yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={gameStats} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#888" />
                                    <YAxis type="category" dataKey="gameName" stroke="#888" width={90} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        formatter={(value: number) => [`${value} requests`, 'Count']}
                                    />
                                    <Bar dataKey="count" fill="#C19A6B" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Pie Chart - Platform Distribution */}
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Platform Distribution</h2>
                        {isLoading ? (
                            <div className="h-[300px] flex items-center justify-center">Loading...</div>
                        ) : platformStats.length === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                No requests yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={platformStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {platformStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Request List */}
                <div className="bg-card border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">All Game Requests</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Game</th>
                                    <th className="text-left py-3 px-4">Platform</th>
                                    <th className="text-left py-3 px-4">Notes</th>
                                    <th className="text-left py-3 px-4">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
                                ) : requests?.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No requests yet</td></tr>
                                ) : (
                                    requests?.slice(0, 50).map((req) => (
                                        <tr key={req.id} className="border-b border-border/50 hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{req.gameName}</td>
                                            <td className="py-3 px-4">{req.platform}</td>
                                            <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]">
                                                {req.notes || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
