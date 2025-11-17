import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Package, 
  DollarSign, 
  Users, 
  Trophy, 
  Settings, 
  Shield,
  ArrowRight,
  TrendingUp,
  Gift,
  Award
} from "lucide-react";

interface PendingReward {
  id: string;
  reward: {
    realValue: number;
  };
}

interface Sponsor {
  id: string;
  status: string;
}

export default function AdminDashboard() {
  const { data: pendingRewards } = useQuery<PendingReward[]>({
    queryKey: ["/api/admin/pending-rewards"],
  });

  const { data: sponsors } = useQuery<Sponsor[]>({
    queryKey: ["/api/admin/sponsors"],
  });

  const pendingCount = pendingRewards?.length || 0;
  const pendingValue = pendingRewards?.reduce((sum, r) => sum + r.reward.realValue, 0) || 0;
  const activeSponsors = sponsors?.filter(s => s.status === 'active').length || 0;

  const adminCapabilities = [
    {
      title: "Founder Controls",
      description: "Manual point adjustments, spending limits, fraud detection, and system health",
      icon: Shield,
      href: "/admin/founder-controls",
      badge: "New",
      badgeVariant: "default",
      stats: "Complete operational control",
      testId: "link-founder-controls"
    },
    {
      title: "Fulfillment Dashboard",
      description: "Manage reward deliveries, add tracking numbers, and fulfill orders",
      icon: Package,
      href: "/fulfillment",
      badge: pendingCount > 0 ? `${pendingCount} pending` : null,
      badgeVariant: pendingCount > 0 ? "default" : "secondary",
      stats: `${pendingCount} pending • $${pendingValue} value`,
      testId: "link-fulfillment"
    },
    {
      title: "Sponsor Management",
      description: "View sponsor proposals, manage partnerships, and track challenge budgets",
      icon: DollarSign,
      href: "/admin/sponsors",
      badge: activeSponsors > 0 ? `${activeSponsors} active` : null,
      badgeVariant: "secondary",
      stats: `${activeSponsors} active sponsors`,
      testId: "link-sponsors"
    },
    {
      title: "User Management",
      description: "View user accounts, subscription tiers, and platform activity",
      icon: Users,
      href: "/leaderboard",
      badge: "Coming Soon",
      badgeVariant: "outline",
      stats: "Monitor user engagement",
      testId: "link-users"
    },
    {
      title: "Rewards Catalog",
      description: "Add, edit, or remove rewards from the catalog",
      icon: Gift,
      href: "/admin/rewards",
      badge: null,
      badgeVariant: "secondary",
      stats: "Manage reward inventory",
      testId: "link-rewards"
    },
  ];

  const quickStats = [
    {
      label: "Pending Fulfillments",
      value: pendingCount,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      label: "Pending Value",
      value: `$${pendingValue}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      label: "Active Sponsors",
      value: activeSponsors,
      icon: Award,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-heading tracking-tight">
                Admin Control Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage all aspects of GG Loop
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, idx) => (
            <Card key={idx} className={`p-6 ${stat.borderColor}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-mono" data-testid={`stat-${idx}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Admin Capabilities */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading">Admin Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCapabilities.map((capability) => (
              <Link key={capability.href} href={capability.href}>
                <Card 
                  className="p-6 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover-elevate active-elevate-2 h-full"
                  data-testid={capability.testId}
                >
                  <CardHeader className="p-0 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <capability.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-heading">
                          {capability.title}
                        </CardTitle>
                      </div>
                      {capability.badge && (
                        <Badge 
                          variant={capability.badgeVariant as any}
                          className="font-mono text-xs"
                        >
                          {capability.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-mono">
                        {capability.stats}
                      </p>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Permissions Info */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Your Admin Permissions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You have full access to all admin functions because your email is in the ADMIN_EMAILS environment variable.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Fulfillment:</strong> Mark rewards as fulfilled, add tracking numbers, view customer shipping info
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Sponsors:</strong> Review proposals, manage partnerships, create sponsored challenges
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Security:</strong> All admin endpoints protected - only emails in ADMIN_EMAILS can access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/fulfillment">
            <Button size="lg" data-testid="button-quick-fulfillment">
              <Package className="h-4 w-4 mr-2" />
              View Pending Orders
            </Button>
          </Link>
          <Link href="/admin/sponsors">
            <Button size="lg" variant="outline" data-testid="button-quick-sponsors">
              <DollarSign className="h-4 w-4 mr-2" />
              Manage Sponsors
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
