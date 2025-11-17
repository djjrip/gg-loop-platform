import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Shield,
  Package,
  DollarSign,
  Users,
  Gift,
  Activity,
  TrendingUp,
  Home,
  Settings,
  LogOut,
  UserPlus,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const adminNavigation = [
    {
      title: "Overview",
      items: [
        {
          title: "Admin Dashboard",
          icon: Home,
          href: "/admin",
          priority: "high",
        },
        {
          title: "Daily Operations",
          icon: Activity,
          href: "/admin/daily-ops",
          priority: "high",
        },
        {
          title: "Launch KPIs",
          icon: TrendingUp,
          href: "/launch-dashboard",
          priority: "high",
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Founder Controls",
          icon: Shield,
          href: "/admin/founder-controls",
          priority: "critical",
          badge: "New",
        },
        {
          title: "Fulfillment",
          icon: Package,
          href: "/fulfillment",
          priority: "high",
        },
        {
          title: "Sponsors",
          icon: DollarSign,
          href: "/admin/sponsors",
          priority: "medium",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Users",
          icon: Users,
          href: "/admin/users",
          priority: "medium",
        },
        {
          title: "Rewards Catalog",
          icon: Gift,
          href: "/admin/rewards",
          priority: "medium",
        },
      ],
    },
    {
      title: "Growth",
      items: [
        {
          title: "Affiliate Program",
          icon: UserPlus,
          href: "/admin/affiliates",
          priority: "medium",
          badge: "New",
        },
        {
          title: "GG Loop Cares",
          icon: Heart,
          href: "/admin/charities",
          priority: "medium",
          badge: "New",
        },
      ],
    },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-primary";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
      } as React.CSSProperties}
    >
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Admin Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="font-bold text-sm">Admin Control</h2>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            {adminNavigation.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={location === item.href}>
                          <Link href={item.href}>
                            <item.icon className={`h-4 w-4 ${getPriorityColor(item.priority)}`} />
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            {/* Quick Actions */}
            <SidebarGroup>
              <SidebarGroupLabel>Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Back to Site</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/api/logout">
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                GG Loop Admin
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
