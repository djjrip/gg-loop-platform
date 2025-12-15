import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PlatformMetrics {
  users: {
    totalUsers: number;
    activeUsers24h: number;
    activeUsers7d: number;
    activeUsers30d: number;
    newUsers24h: number;
    newUsers7d: number;
    newUsers30d: number;
  };
  engagement: {
    avgXPPerUser: number;
  };
  revenue: {
    totalXP: number;
  };
}

interface EngagementMetrics {
  dau: number;
  mau: number;
  dauMauRatio: number;
}

interface RevenueMetrics {
  totalXP: number;
  xpLast24h: number;
  xpLast7d: number;
  xpLast30d: number;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, engagementRes, revenueRes] = await Promise.all([
        fetch("/api/analytics/overview", { credentials: "include" }),
        fetch("/api/analytics/engagement", { credentials: "include" }),
        fetch("/api/analytics/revenue", { credentials: "include" })
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setPlatformMetrics(data);
      }

      if (engagementRes.ok) {
        const data = await engagementRes.json();
        setEngagement(data);
      }

      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenue(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Fraud score ≤30, not banned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{platformMetrics?.users.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users (24h)</CardTitle>
            <CardDescription>Users with XP activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{platformMetrics?.users.activeUsers24h || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Users (24h)</CardTitle>
            <CardDescription>Signups in last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{platformMetrics?.users.newUsers24h || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>DAU (Daily Active)</CardTitle>
            <CardDescription>Active in last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{engagement?.dau || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MAU (Monthly Active)</CardTitle>
            <CardDescription>Active in last 30d</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{engagement?.mau || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DAU/MAU Ratio</CardTitle>
            <CardDescription>Engagement stickiness</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{engagement?.dauMauRatio.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total XP</CardTitle>
            <CardDescription>All-time verified XP</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{revenue?.totalXP.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>XP (24h)</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{revenue?.xpLast24h.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>XP (7d)</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{revenue?.xpLast7d.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>XP (30d)</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{revenue?.xpLast30d.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="font-bold">{platformMetrics?.users.activeUsers7d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>New Users:</span>
                <span className="font-bold">{platformMetrics?.users.newUsers7d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg XP/User:</span>
                <span className="font-bold">{platformMetrics?.engagement.avgXPPerUser.toFixed(0) || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>30-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="font-bold">{platformMetrics?.users.activeUsers30d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>New Users:</span>
                <span className="font-bold">{platformMetrics?.users.newUsers30d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total XP:</span>
                <span className="font-bold">{platformMetrics?.revenue.totalXP.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Fraud Gating Active:</strong> All metrics exclude users with fraud score &gt; 30 and banned users. Only verified XP transactions are counted.
        </p>
      </div>
    </div>
  );
}
