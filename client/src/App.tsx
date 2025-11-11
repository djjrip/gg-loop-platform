import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import Home from "@/pages/Home";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";
import TikTokContentGenerator from "@/pages/TikTokContentGenerator";
import Profile from "@/pages/Profile";
import BusinessDashboard from "@/pages/BusinessDashboard";
import ReportMatch from "@/pages/ReportMatch";
import Referrals from "@/pages/Referrals";
import Settings from "@/pages/Settings";
import FulfillmentDashboard from "@/pages/FulfillmentDashboard";
import MyRewards from "@/pages/MyRewards";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancel" component={SubscriptionCancel} />
      <Route path="/tiktok-content" component={TikTokContentGenerator} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/launch-dashboard" component={BusinessDashboard} />
      <Route path="/report-match" component={ReportMatch} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/my-rewards" component={MyRewards} />
      <Route path="/settings" component={Settings} />
      <Route path="/fulfillment" component={FulfillmentDashboard} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
