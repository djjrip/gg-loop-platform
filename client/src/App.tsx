import Notifications from '@/pages/Notifications';
import Verify from '@/pages/Verify';
import Track from '@/pages/Track';
import Passport from '@/pages/Passport';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginNotification } from "@/components/LoginNotification";
import Footer from "@/components/Footer";
import { useAuth } from "./hooks/useAuth";
import MobileNav from "@/components/MobileNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Partners from "@/pages/Partners";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Shop from "@/pages/Shop";
import CreatorTools from "@/pages/CreatorTools";
import Subscription from "@/pages/Subscription";
import DesktopDownload from "@/pages/DesktopDownload";

// User pages
import Login from "@/pages/Login";
import QuickStart from "@/pages/archive/QuickStart";
import Profile from "@/pages/Profile";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import MyRewards from "@/pages/MyRewards";
import Referrals from "@/pages/Referrals";
import Redemptions from "@/pages/Redemptions";
import LaunchDashboard from "@/pages/LaunchDashboard";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";
import AffiliateProgram from "@/pages/AffiliateProgram";
import GGLoopCares from "@/pages/GGLoopCares";
// import AWSRoadmap from "@/pages/AWSRoadmap"; // REMOVED PUBLIC ROUTE
import Roadmap from "@/pages/Roadmap";
import Trust from "@/pages/Trust";
import RequestGame from "@/pages/RequestGame";
import RiotCallback from "@/pages/RiotCallback";

// Admin pages
import AdminDashboard from "@/pages/AdminDashboardPage";
import FounderControls from "@/pages/FounderControls";
import FulfillmentDashboard from "@/pages/FulfillmentDashboard";
import AdminFulfillment from "@/pages/AdminFulfillment";
import RewardsManagement from "@/pages/RewardsManagement";
import DailyOps from "@/pages/DailyOps";
import SponsorManagement from "@/pages/SponsorManagement";
import AffiliateManagement from "@/pages/admin/AffiliateManagement";
import CharityManagement from "@/pages/admin/CharityManagement";
import FounderHub from "@/pages/admin/FounderHub";
import UserManagement from "@/pages/admin/UserManagement";
import CreatorDashboard from "@/pages/CreatorDashboard";
import CreatorLeaderboard from "@/pages/CreatorLeaderboard";
import AdminAntiCheat from "@/pages/AdminAntiCheat";
import AdminAnalytics from "@/pages/AdminAnalytics";
import GameRequestsAnalytics from "@/pages/admin/GameRequestsAnalytics";
import PitchDeck from "@/pages/PitchDeck";

// 404
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
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/partners" component={Partners} />
      <Route path="/shop" component={Shop} />
      <Route path="/creator-tools" component={CreatorTools} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/download" component={DesktopDownload} />

      {/* User Routes */}
      <Route path="/login" component={Login} />
      <Route path="/quick-start" component={QuickStart} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/stats" component={Stats} />
      <Route path="/settings" component={Settings} />
      <Route path="/my-rewards" component={MyRewards} />
      <Route path="/redemptions" component={Redemptions} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/affiliate-program" component={AffiliateProgram} />
      <Route path="/gg-loop-cares" component={GGLoopCares} />
      <Route path="/request-game" component={RequestGame} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/launch-dashboard" component={LaunchDashboard} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancel" component={SubscriptionCancel} />
      <Route path="/riot/callback" component={RiotCallback} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/founder-controls" component={FounderControls} />
      <Route path="/admin/rewards" component={RewardsManagement} />
      <Route path="/admin/sponsors" component={SponsorManagement} />
      <Route path="/admin/affiliates" component={AffiliateManagement} />
      <Route path="/admin/charities" component={CharityManagement} />
      <Route path="/admin/daily-ops" component={DailyOps} />
      <Route path="/admin/fulfillment" component={AdminFulfillment} />
      <Route path="/admin/founder-hub" component={FounderHub} />
      <Route path="/admin/users" component={UserManagement} />
      {/* Route removed: AWS Roadmap */}
      <Route path="/fulfillment" component={FulfillmentDashboard} />

      {/* Level 11: Creator Economy */}
      <Route path="/creator-dashboard" component={CreatorDashboard} />
      <Route path="/creator-leaderboard" component={CreatorLeaderboard} />

      {/* Level 12: Anti-Cheat Lite */}
      <Route path="/admin/anticheat" component={AdminAntiCheat} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/game-requests" component={GameRequestsAnalytics} />
      <Route path="/trust" component={Trust} />
      <Route path="/vision" component={PitchDeck} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;




