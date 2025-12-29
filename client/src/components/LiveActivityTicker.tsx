/**
 * LIVE ACTIVITY TICKER
 * Real-time feed of platform activity
 * Shows in homepage/dashboard for social proof
 */

import { useEffect, useState } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ActivityEvent {
    id: string;
    type: string;
    message: string;
    timestamp: string;
}

export function LiveActivityTicker() {
    const { data: activityData, refetch } = useQuery({
        queryKey: ['/api/growth/activity/live'],
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const [currentIndex, setCurrentIndex] = useState(0);

    // Rotate through activities
    useEffect(() => {
        if (!activityData?.activity?.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activityData.activity.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [activityData]);

    if (!activityData?.activity?.length) return null;

    const currentActivity = activityData.activity[currentIndex];
    const stats = activityData.stats;

    return (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary px-4 py-3 rounded-lg">
            <div className="flex items-center gap-4">
                {/* Live Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-semibold text-primary">LIVE</span>
                </div>

                {/* Activity Message */}
                <div className="flex-1 text-sm text-foreground">
                    {currentActivity.message}
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{stats.liveUsers} online</span>
                    </div>
                    <div>{stats.totalUsers} users</div>
                </div>
            </div>
        </div>
    );
}
