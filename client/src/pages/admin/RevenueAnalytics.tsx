/**
 * Revenue Analytics Dashboard Component
 * Visual real-time metrics for autonomous monitoring
 */

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Users, Target, Award } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    prefix?: string;
    suffix?: string;
}

function MetricCard({ title, value, change, icon, prefix = '', suffix = '' }: MetricCardProps) {
    const changeColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-gray-500';

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                <div className="text-purple-400">{icon}</div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-white">
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </p>
                    {change !== undefined && (
                        <p className={`text-sm mt-1 ${changeColor} flex items-center gap-1`}>
                            {change > 0 && '↑'}
                            {change < 0 && '↓'}
                            {Math.abs(change)}% vs last period
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RevenueAnalytics() {
    const { data: revenue } = useQuery({
        queryKey: ['/api/admin/analytics/revenue'],
        refetchInterval: 60000, // Refresh every minute
    });

    const { data: conversions } = useQuery({
        queryKey: ['/api/admin/analytics/conversions'],
        refetchInterval: 60000,
    });

    const { data: userMetrics } = useQuery({
        queryKey: ['/api/admin/analytics/users'],
        refetchInterval: 60000,
    });

    const { data: topReferrers } = useQuery({
        queryKey: ['/api/admin/analytics/referrals'],
        refetchInterval: 300000, // Refresh every 5 minutes
    });

    if (!revenue || !conversions || !userMetrics) {
        return <div className="text-center py-12">Loading analytics...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Revenue Analytics</h1>
                <p className="text-gray-400">Real-time metrics for autonomous monitoring</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Monthly Recurring Revenue"
                    value={revenue.mrr}
                    change={revenue.growthRate}
                    icon={<DollarSign className="h-6 w-6" />}
                    prefix="$"
                />

                <MetricCard
                    title="Active Subscribers"
                    value={revenue.activeSubscribers}
                    icon={<Users className="h-6 w-6" />}
                />

                <MetricCard
                    title="Trial Conversion Rate"
                    value={conversions.trialToProRate}
                    icon={<Target className="h-6 w-6" />}
                    suffix="%"
                />

                <MetricCard
                    title="Total Users"
                    value={userMetrics.totalUsers}
                    change={userMetrics.weekOverWeekGrowth}
                    icon={<TrendingUp className="h-6 w-6" />}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Annual Recurring Revenue"
                    value={revenue.arr}
                    icon={<DollarSign className="h-6 w-6" />}
                    prefix="$"
                />

                <MetricCard
                    title="Trialing Users"
                    value={revenue.trialingUsers}
                    icon={<Users className="h-6 w-6" />}
                />

                <MetricCard
                    title="Signups This Week"
                    value={userMetrics.signupsThisWeek}
                    icon={<TrendingUp className="h-6 w-6" />}
                />
            </div>

            {/* Top Referrers */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Award className="h-6 w-6 text-purple-400" />
                    <h2 className="text-xl font-bold">Top Referrers</h2>
                </div>

                <div className="space-y-3">
                    {topReferrers?.map((referrer: any, index: number) => (
                        <div
                            key={referrer.userId}
                            className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold text-purple-400">#{index + 1}</div>
                                <div>
                                    <p className="font-semibold">{referrer.firstName || 'User'}</p>
                                    <p className="text-sm text-gray-400">{referrer.email}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-white">{referrer.referralCount} referrals</p>
                                <p className="text-sm text-gray-400">
                                    ~${referrer.estimatedRevenue.toFixed(0)} revenue
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Signups Today</p>
                    <p className="text-2xl font-bold">{userMetrics.signupsToday}</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Signups This Month</p>
                    <p className="text-2xl font-bold">{userMetrics.signupsThisMonth}</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Free Users</p>
                    <p className="text-2xl font-bold">{revenue.freeUsers}</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Conversions</p>
                    <p className="text-2xl font-bold">{conversions.totalConversions}</p>
                </div>
            </div>
        </div>
    );
}
