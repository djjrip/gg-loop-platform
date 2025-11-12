import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginNotification } from "@/components/LoginNotification";
import Footer from "@/components/Footer";
import { useAuth } from "./hooks/useAuth";
import Home from "@/pages/Home";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";
import TikTokContentGenerator from "@/pages/TikTokContentGenerator";
import Profile from "@/pages/Profile";
import BusinessDashboard from "@/pages/BusinessDashboard";
import SponsorManagement from "@/pages/SponsorManagement";
import SponsorPitch from "@/pages/SponsorPitch";
import InvestorPitch from "@/pages/InvestorPitch";
import FounderRoadmap from "@/pages/FounderRoadmap";
import SponsorOutreach from "@/pages/SponsorOutreach";
import InvestorOutreach from "@/pages/InvestorOutreach";
import TwitchOutreach from "@/pages/TwitchOutreach";
import LaunchChecklist from "@/pages/LaunchChecklist";
import BusinessHub from "@/pages/BusinessHub";
import ReportMatch from "@/pages/ReportMatch";
import Referrals from "@/pages/Referrals";
import Settings from "@/pages/Settings";
import FulfillmentDashboard from "@/pages/FulfillmentDashboard";
import MyRewards from "@/pages/MyRewards";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
import QuickStart from "@/pages/QuickStart";
import Stats from "@/pages/Stats";
import FreeTier from "@/pages/FreeTier";
import Shop from "@/pages/Shop";
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
      <Route path="/admin/sponsors" component={SponsorManagement} />
      <Route path="/sponsor-pitch" component={SponsorPitch} />
      <Route path="/investor-pitch" component={InvestorPitch} />
      <Route path="/roadmap" component={FounderRoadmap} />
      <Route path="/sponsor-outreach" component={SponsorOutreach} />
      <Route path="/investor-outreach" component={InvestorOutreach} />
      <Route path="/twitch-outreach" component={TwitchOutreach} />
      <Route path="/launch" component={LaunchChecklist} />
      <Route path="/business" component={BusinessHub} />
      <Route path="/report-match" component={ReportMatch} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/my-rewards" component={MyRewards} />
      <Route path="/settings" component={Settings} />
      <Route path="/fulfillment" component={FulfillmentDashboard} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/login" component={Login} />
      <Route path="/quick-start" component={QuickStart} />
      <Route path="/stats" component={Stats} />
      <Route path="/free-tier" component={FreeTier} />
      <Route path="/shop" component={Shop} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoginNotification />
        <Toaster />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Router />
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
