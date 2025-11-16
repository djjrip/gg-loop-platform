import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DailyMetrics {
  // Financial
  mrrTotal: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  activeSubscribers: {
    basic: number;
    pro: number;
    elite: number;
    total: number;
  };
  
  // Fulfillment
  pendingFulfillments: number;
  pendingValue: number;
  fulfilledToday: number;
  
  // User Activity
  totalUsers: number;
  newSignupsToday: number;
  newSignupsThisWeek: number;
  activeEarnersToday: number;
  activeEarnersThisWeek: number;
  
  // Points & Economy
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  pointsLiability: number;
}

interface ChecklistItem {
  id: string;
  date: string;
  taskId: string;
  taskLabel: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export default function DailyOps() {
  const today = new Date().toISOString().split('T')[0];

  const { data: metrics, isLoading } = useQuery<DailyMetrics>({
    queryKey: ["/api/admin/daily-metrics"],
  });

  const { data: checklistItems = [] } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/admin/checklist", today],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, taskLabel, completed }: { taskId: string; taskLabel: string; completed: boolean }) => {
      return apiRequest("/api/admin/checklist/toggle", {
        method: "POST",
        body: JSON.stringify({ date: today, taskId, taskLabel, completed }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/checklist", today] });
    },
  });

  const dailyChecklist = [
    { id: "fulfillment", label: "Check pending fulfillments", priority: "high", link: "/fulfillment" },
    { id: "revenue", label: "Review today's revenue & subscriptions", priority: "high", link: "/launch-dashboard" },
    { id: "users", label: "Check new user signups", priority: "medium", link: "/admin" },
    { id: "support", label: "Review customer emails", priority: "medium", link: null },
    { id: "rewards", label: "Verify reward inventory levels", priority: "low", link: "/admin/rewards" },
  ];

  const isChecked = (taskId: string) => {
    return checklistItems.some(item => item.taskId === taskId && item.completed);
  };

  const toggleCheck = (taskId: string) => {
    const currentlyChecked = isChecked(taskId);
    const task = dailyChecklist.find(t => t.id === taskId);
    toggleMutation.mutate({ 
      taskId, 
      taskLabel: task?.label || taskId,
      completed: !currentlyChecked 
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  const completedCount = dailyChecklist.filter(item => isChecked(item.id)).length;
  const completionRate = completedCount / dailyChecklist.length * 100;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3" data-testid="heading-daily-ops">
            <Activity className="h-8 w-8 text-primary" />
            Daily Operations
          </h1>
          <p className="text-muted-foreground mt-2">
            Your command center for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Daily Checklist */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Daily Checklist
                </CardTitle>
                <CardDescription>Critical tasks to complete today</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary font-mono">
                  {completedCount}/{dailyChecklist.length}
                </div>
                <p className="text-xs text-muted-foreground">{completionRate.toFixed(0)}% complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyChecklist.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover-elevate"
                  data-testid={`checklist-${item.id}`}
                >
                  <button
                    onClick={() => toggleCheck(item.id)}
                    className="flex-shrink-0"
                    data-testid={`button-checklist-${item.id}`}
                  >
                    {isChecked(item.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${isChecked(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                      {item.label}
                    </p>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  {item.link && (
                    <Link href={item.link}>
                      <Button size="sm" variant="ghost">
                        Go →
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        {metrics && (metrics.pendingFulfillments > 0 || metrics.newSignupsToday > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.pendingFulfillments > 0 && (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{metrics.pendingFulfillments}</p>
                      <p className="text-sm text-muted-foreground">Pending fulfillments (${(metrics.pendingValue / 100).toFixed(2)})</p>
                    </div>
                    <Link href="/fulfillment">
                      <Button variant="destructive" data-testid="button-goto-fulfillment">
                        Fulfill Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {metrics.newSignupsToday > 0 && (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    New Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{metrics.newSignupsToday}</p>
                      <p className="text-sm text-muted-foreground">New signups today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono" data-testid="metric-mrr">
                ${(metrics?.mrrTotal || 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Revenue Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-500" data-testid="metric-revenue-today">
                ${((metrics?.revenueToday || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Week: ${((metrics?.revenueThisWeek || 0) / 100).toFixed(2)} • 
                Month: ${((metrics?.revenueThisMonth || 0) / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Active Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono" data-testid="metric-active-subs">
                {metrics?.activeSubscribers.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Basic: {metrics?.activeSubscribers.basic || 0} • 
                Pro: {metrics?.activeSubscribers.pro || 0} • 
                Elite: {metrics?.activeSubscribers.elite || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Fulfillments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono" data-testid="metric-pending-fulfillments">
                {metrics?.pendingFulfillments || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fulfilled today: {metrics?.fulfilledToday || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity
            </CardTitle>
            <CardDescription>Platform engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                <p className="text-2xl font-bold" data-testid="metric-total-users">{metrics?.totalUsers || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">New Today</p>
                <p className="text-2xl font-bold text-green-500" data-testid="metric-new-today">{metrics?.newSignupsToday || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Earners Today</p>
                <p className="text-2xl font-bold" data-testid="metric-earners-today">{metrics?.activeEarnersToday || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active This Week</p>
                <p className="text-2xl font-bold" data-testid="metric-earners-week">{metrics?.activeEarnersThisWeek || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points Economy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Points Economy
            </CardTitle>
            <CardDescription>Track your points liability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Points Issued</p>
                <p className="text-2xl font-bold font-mono" data-testid="metric-points-issued">
                  {(metrics?.totalPointsIssued || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Points Redeemed</p>
                <p className="text-2xl font-bold font-mono text-green-500" data-testid="metric-points-redeemed">
                  {(metrics?.totalPointsRedeemed || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding Liability</p>
                <p className="text-2xl font-bold font-mono text-yellow-500" data-testid="metric-points-liability">
                  {(metrics?.pointsLiability || 0).toLocaleString()} pts
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${((metrics?.pointsLiability || 0) / 1333).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Link href="/fulfillment">
                <Button variant="default" data-testid="button-quick-fulfillment">
                  <Package className="h-4 w-4 mr-2" />
                  Process Fulfillments
                </Button>
              </Link>
              <Link href="/admin/rewards">
                <Button variant="outline" data-testid="button-quick-rewards">
                  Manage Rewards
                </Button>
              </Link>
              <Link href="/launch-dashboard">
                <Button variant="outline" data-testid="button-quick-financials">
                  View Full Financials
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" data-testid="button-quick-admin">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
