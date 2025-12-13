import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    openRate: number;
    clickRate: number;
}

interface EmailEvent {
    email: string;
    event_type: string;
    timestamp: number;
    campaign_type: string;
}

export default function EmailAnalytics() {
    const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
    const [recentEvents, setRecentEvents] = useState<EmailEvent[]>([]);
    const [campaignType, setCampaignType] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [campaignType]);

    async function fetchMetrics() {
        try {
            const query = campaignType !== 'all' ? `?campaign=${campaignType}` : '';
            const res = await fetch(`/api/admin/email-metrics${query}`);
            const data = await res.json();

            setMetrics(data.metrics);
            setRecentEvents(data.recentEvents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching email metrics:', error);
        }
    }

    if (loading) {
        return <div className="p-8">Loading email analytics...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">📧 Email Analytics</h1>

                <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">All Campaigns</option>
                    <option value="early-access">Early Access</option>
                    <option value="streamer-outreach">Streamer Outreach</option>
                </select>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics?.sent || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Delivered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics?.delivered || 0}</div>
                        <p className="text-sm text-gray-500">
                            {metrics?.sent ? Math.round((metrics.delivered / metrics.sent) * 100) : 0}% delivery rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Opened</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{metrics?.opened || 0}</div>
                        <p className="text-sm text-gray-500">
                            {metrics?.openRate.toFixed(1)}% open rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Clicked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{metrics?.clicked || 0}</div>
                        <p className="text-sm text-gray-500">
                            {metrics?.clickRate.toFixed(1)}% click rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentEvents.slice(0, 10).map((event, i) => (
                            <div key={i} className="flex justify-between items-center p-2 border-b">
                                <div>
                                    <span className="font-mono text-sm">{event.email}</span>
                                    <span className="ml-2 text-xs text-gray-500">
                                        {event.campaign_type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${event.event_type === 'open' ? 'bg-green-100 text-green-800' :
                                            event.event_type === 'click' ? 'bg-blue-100 text-blue-800' :
                                                event.event_type === 'delivered' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {event.event_type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.timestamp * 1000).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
