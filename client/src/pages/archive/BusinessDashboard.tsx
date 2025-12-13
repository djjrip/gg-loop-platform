import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Rocket,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: "complete" | "in_progress" | "pending";
  weight: number;
}

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  domainStatus: string;
  milestones: Milestone[];
  launchReadiness: number;
}

export default function BusinessDashboard() {
  // For now, using mock data since we need API endpoint
  const milestones: Milestone[] = [
    {
      id: "domain",
      title: "Custom Domain Setup",
      description: "ggloop.io DNS configured",
      status: "in_progress",
      weight: 10
    },
    {
      id: "deployment",
      title: "Production Deployment",
      description: "App deployed on Replit Autoscale",
      status: "complete",
      weight: 15
    },
    {
      id: "payments",
      title: "Payment Processing",
      description: "Stripe integration configured",
      status: "complete",
      weight: 15
    },
    {
      id: "gaming_webhooks",
      title: "Gaming Integration",
      description: "Webhook API for match tracking",
      status: "complete",
      weight: 10
    },
    {
      id: "marketing",
      title: "Marketing Tools",
      description: "TikTok content generator live",
      status: "complete",
      weight: 5
    },
    {
      id: "profiles",
      title: "Public Profiles",
      description: "Shareable gamer profiles",
      status: "complete",
      weight: 10
    },
    {
      id: "first_user",
      title: "First User Signup",
      description: "Get first organic user",
      status: "pending",
      weight: 10
    },
    {
      id: "first_payment",
      title: "First Payment",
      description: "First $5 subscription received",
      status: "pending",
      weight: 15
    },
    {
      id: "10_users",
      title: "10 Active Users",
      description: "Reach 10 paying subscribers",
      status: "pending",
      weight: 5
    },
    {
      id: "100_revenue",
      title: "$100 MRR",
      description: "Monthly recurring revenue milestone",
      status: "pending",
      weight: 5
    }
  ];

  const completedMilestones = milestones.filter(m => m.status === "complete");
  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
  const completedWeight = completedMilestones.reduce((sum, m) => sum + m.weight, 0);
  const launchReadiness = Math.round((completedWeight / totalWeight) * 100);

  const inProgressMilestones = milestones.filter(m => m.status === "in_progress");
  const pendingMilestones = milestones.filter(m => m.status === "pending");

  const getStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "in_progress") return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "complete") return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    if (status === "in_progress") return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Launch Dashboard
          </h1>
          <p className="text-muted-foreground">Track your progress to global scale</p>
        </div>

        {/* Launch Readiness Score */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Launch Readiness</h2>
              <p className="text-sm text-muted-foreground">
                {completedMilestones.length} of {milestones.length} milestones complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold font-mono text-primary" data-testid="text-launch-readiness">
                {launchReadiness}%
              </div>
            </div>
          </div>
          <Progress value={launchReadiness} className="h-3" />
          {launchReadiness === 100 ? (
            <p className="text-sm text-green-500 mt-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ready to scale! All systems go.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">
              {100 - launchReadiness}% remaining to full launch
            </p>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Total Users</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-users">0</p>
            <p className="text-xs text-muted-foreground mt-1">Waiting for first signup</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Active Subs</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-subs">0</p>
            <p className="text-xs text-muted-foreground mt-1">Paying subscribers</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">MRR</h3>
            </div>
            <p className="text-3xl font-bold font-mono" data-testid="text-stat-revenue">$0</p>
            <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Domain</h3>
            </div>
            <p className="text-lg font-bold" data-testid="text-stat-domain">ggloop.io</p>
            <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              DNS propagating
            </p>
          </Card>
        </div>

        {/* In Progress Milestones */}
        {inProgressMilestones.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              In Progress
            </h2>
            <div className="space-y-3">
              {inProgressMilestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20"
                  data-testid={`milestone-${milestone.id}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(milestone.status)}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Completed Milestones */}
        {completedMilestones.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed ({completedMilestones.length})
            </h2>
            <div className="space-y-2">
              {completedMilestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                  data-testid={`milestone-${milestone.id}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h3 className="font-semibold text-sm">{milestone.title}</h3>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(milestone.status)}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pending Milestones */}
        {pendingMilestones.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Circle className="h-5 w-5 text-muted-foreground" />
              Next Steps ({pendingMilestones.length})
            </h2>
            <div className="space-y-2">
              {pendingMilestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                  data-testid={`milestone-${milestone.id}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h3 className="font-semibold text-sm">{milestone.title}</h3>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(milestone.status)}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* SMS Alerts CTA */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Get SMS Milestone Alerts</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Receive text notifications when you hit milestones (first signup, $100 MRR, etc.)
              </p>
              <Button variant="outline" size="sm" disabled data-testid="button-setup-sms">
                Setup SMS Alerts (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
