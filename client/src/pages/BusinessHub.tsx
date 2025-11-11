import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Rocket, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Home,
  Target,
  Mail,
  Briefcase
} from "lucide-react";

export default function BusinessHub() {
  const resources = [
    {
      id: "launch",
      title: "Launch Checklist",
      description: "Your master action plan. Start here.",
      icon: Rocket,
      path: "/launch",
      badge: "START HERE",
      badgeVariant: "default" as const,
    },
    {
      id: "twitch",
      title: "Twitch Outreach",
      description: "Invite users TODAY. Send 20 DMs to 5-50 viewer streamers.",
      icon: Users,
      path: "/twitch-outreach",
      badge: "Action Today",
      badgeVariant: "default" as const,
    },
    {
      id: "sponsor",
      title: "Sponsor Outreach",
      description: "Email G Fuel, Razer, SteelSeries, Discord, Logitech.",
      icon: Briefcase,
      path: "/sponsor-outreach",
      badge: "Week 1",
      badgeVariant: "outline" as const,
    },
    {
      id: "investor",
      title: "Investor Outreach",
      description: "Email Bitkraft, Makers Fund, 1Up Ventures, angels.",
      icon: DollarSign,
      path: "/investor-outreach",
      badge: "Week 2",
      badgeVariant: "outline" as const,
    },
    {
      id: "roadmap",
      title: "6-Week Roadmap",
      description: "Full validation sprint plan with go/no-go criteria.",
      icon: Calendar,
      path: "/roadmap",
      badge: "Strategy",
      badgeVariant: "outline" as const,
    },
  ];

  const pitchPages = [
    {
      id: "sponsor-pitch",
      title: "Sponsor Pitch Page",
      description: "Public page to share with brands",
      icon: Target,
      path: "/sponsor-pitch",
    },
    {
      id: "investor-pitch",
      title: "Investor Pitch Page",
      description: "Public page to share with VCs/angels",
      icon: TrendingUp,
      path: "/investor-pitch",
    },
  ];

  const adminPages = [
    {
      id: "sponsor-mgmt",
      title: "Sponsor Management",
      description: "Admin dashboard for sponsor campaigns",
      path: "/admin/sponsors",
    },
    {
      id: "fulfillment",
      title: "Fulfillment Dashboard",
      description: "Manage reward redemptions",
      path: "/fulfillment",
    },
    {
      id: "business-dashboard",
      title: "Analytics Dashboard",
      description: "Business metrics and insights",
      path: "/launch-dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Business Hub</h1>
              <p className="text-lg text-muted-foreground">
                All your founder resources in one place
              </p>
            </div>
            <Button asChild variant="outline" data-testid="button-home">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Rocket className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Platform is 100% Ready - Start Inviting Users</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  All core features working. Rewards catalog loaded. Stripe live. 
                  Go to Launch Checklist and send 20 Twitch DMs today.
                </p>
                <Button asChild data-testid="button-launch">
                  <Link href="/launch">
                    View Launch Checklist
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Outreach & Growth</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Card key={resource.id} className="hover-elevate" data-testid={`card-${resource.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription className="mt-1">{resource.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={resource.badgeVariant}>{resource.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full" data-testid={`button-${resource.id}`}>
                        <Link href={resource.path}>
                          View {resource.title}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Public Pitch Pages</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pitchPages.map((page) => {
                const Icon = page.icon;
                return (
                  <Card key={page.id} className="hover-elevate" data-testid={`card-${page.id}`}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          <CardDescription className="mt-1">{page.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full" data-testid={`button-${page.id}`}>
                        <Link href={page.path}>
                          Open Page
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Admin & Analytics</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {adminPages.map((page) => (
                <Card key={page.id} className="hover-elevate" data-testid={`card-${page.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{page.title}</CardTitle>
                    <CardDescription className="text-sm">{page.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="sm" className="w-full" data-testid={`button-${page.id}`}>
                      <Link href={page.path}>
                        Open
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Quick Access URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 font-mono">
              <div className="text-muted-foreground">Bookmark these for quick access:</div>
              <div>/business - This hub</div>
              <div>/launch - Launch checklist</div>
              <div>/twitch-outreach - User acquisition</div>
              <div>/sponsor-outreach - Sponsor emails</div>
              <div>/investor-outreach - Investor emails</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
