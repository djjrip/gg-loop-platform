import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "wouter";
import {
  Users, Trophy, Gift, DollarSign, Activity, Package,
  TrendingUp, Shield, BarChart3, Settings, Calendar, Megaphone
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalPoints: number;
  activeToday: number;
  totalRewards: number;
  founderCount: number;
  revenueThisMonth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPoints: 0,
    activeToday: 0,
    totalRewards: 0,
    founderCount: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminPages = [
    {
      title: "User Management",
      description: "View and manage all platform users",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Daily Operations",
      description: "Daily tasks and platform health",
      icon: Activity,
      href: "/admin/daily-ops",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Rewards Management",
      description: "Manage rewards catalog and inventory",
      icon: Gift,
      href: "/admin/rewards",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Fulfillment",
      description: "Process and track reward fulfillment",
      icon: Package,
      href: "/admin/fulfillment",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Sponsors",
      description: "Manage sponsor relationships",
      icon: DollarSign,
      href: "/admin/sponsors",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Affiliates",
      description: "Track affiliate performance",
      icon: Megaphone,
      href: "/admin/affiliates",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Charities",
      description: "Manage charity campaigns",
      icon: Shield,
      href: "/admin/charities",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Launch KPIs",
      description: "Track key performance indicators",
      icon: TrendingUp,
      href: "/launch-dashboard",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Admin Control Center
          </h1>
          <p className="text-muted-foreground">Comprehensive platform management and analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.founderCount} founders
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalUsers > 0 ? ((stats.activeToday / stats.totalUsers) * 100).toFixed(1) : 0}% of users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards Claimed</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalRewards.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">${stats.revenueThisMonth.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Subscriptions + sponsors
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/founder-controls">
                  <Shield className="h-4 w-4 mr-2" />
                  Founder Controls
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Pages Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Management Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {adminPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.href} href={page.href}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${page.bgColor} flex items-center justify-center mb-3`}>
                        <Icon className={`h-6 w-6 ${page.color}`} />
                      </div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Platform Activity
            </CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Activity feed will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
