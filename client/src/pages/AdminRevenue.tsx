/**
 * 💰 ADMIN REVENUE DASHBOARD
 * 
 * Real-time revenue analytics for CEO/admin
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminRevenue() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-revenue-overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/revenue/overview');
      if (!res.ok) throw new Error('Failed to fetch revenue overview');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-revenue-trends'],
    queryFn: async () => {
      const res = await fetch('/api/admin/revenue/trends?days=30');
      if (!res.ok) throw new Error('Failed to fetch revenue trends');
      return res.json();
    },
  });

  const { data: topRewards, isLoading: topRewardsLoading } = useQuery({
    queryKey: ['admin-top-rewards'],
    queryFn: async () => {
      const res = await fetch('/api/admin/revenue/top-rewards');
      if (!res.ok) throw new Error('Failed to fetch top rewards');
      return res.json();
    },
  });

  if (overviewLoading) {
    return <div className="p-8">Loading revenue data...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">💰 Revenue Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.mrr || 0}/mo</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.totalRevenue || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.activeSubscriptions || 0}</div>
            <div className="text-sm text-muted-foreground">
              {overview?.conversionRate || 0}% conversion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.pendingRedemptionsValue || 0}</div>
            <div className="text-sm text-muted-foreground">
              {overview?.pendingRedemptions || 0} items
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Rewards */}
      {topRewards && (
        <Card>
          <CardHeader>
            <CardTitle>Top Redeemed Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRewards.topRewards?.map((reward: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{reward.rewardTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {reward.redemptionCount} redemptions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${reward.totalValue?.toFixed(2) || 0}</div>
                    <div className="text-sm text-green-600">
                      ${reward.totalCommissions?.toFixed(2) || 0} commissions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

