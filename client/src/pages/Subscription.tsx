import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trophy, Zap, Star, Flame, Gift, Sparkles, Coins, AlertCircle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { Subscription } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import PayPalSubscriptionButton from "@/components/PayPalSubscriptionButton";

function getRemainingDays(endDate: string | Date): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [paypalSubId, setPaypalSubId] = useState("");
  const [showManualSync, setShowManualSync] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update countdown timers every hour to keep them accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const { data: subscription, isLoading: subLoading } = useQuery<Subscription | null>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  const { data: pointsData } = useQuery<{ balance: number }>({
    queryKey: ["/api/points/balance"],
    enabled: isAuthenticated,
  });

  const { data: userData } = useQuery<{ freeTrial: boolean; freeTrialEndsAt?: string }>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
  });

  const { data: freeTierData } = useQuery<{ 
    ggCoins: number; 
    coinsNeeded: number; 
    canRedeemTrial: boolean;
    hasActiveTrial: boolean; 
    currentStreak: number;
  }>({
    queryKey: ["/api/free-tier/status"],
    enabled: isAuthenticated,
  });


  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the current period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const freeTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/referrals/start-trial", { 
        referralCode: referralCode.trim() || undefined 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Free Trial Started!",
        description: "You now have 7 days of temporary Basic access with starter points to explore membership benefits!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start free trial",
        variant: "destructive",
      });
    },
  });

  const redeemTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/free-tier/redeem-trial", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trial Unlocked! 🎉",
        description: "7 days of Basic tier activated! Track your wins and explore membership benefits.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/free-tier/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to Redeem",
        description: error.message || "Failed to redeem trial",
        variant: "destructive",
      });
    },
  });

  const manualSyncMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest("POST", "/api/paypal/manual-sync", { subscriptionId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Synced! 🎉",
        description: `Your ${data.tier} subscription is now active!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setPaypalSubId("");
      setShowManualSync(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync subscription. Check your PayPal Subscription ID.",
        variant: "destructive",
      });
    },
  });

  const paypalPlanIds = {
    basic: "P-6A485619U8349492UNEK4RRA",
    pro: "P-7PE45456B7870481SNEK4TRY",
    elite: "P-369148416D044494CNEK4UDQ",
  };

  const tiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      icon: Coins,
      description: "Earn GG Coins to unlock trial access",
      features: [
        { text: "10 GG Coins per match win", included: true },
        { text: "50 GG Coins per 7-day login streak", included: true },
        { text: "100 coin monthly cap", included: true },
        { text: "Unlock 7-day Basic tier trial with 500 coins", included: true },
        { text: "Track match wins & achievements", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Monthly point allocation (subscribe for this!)", included: false, highlight: true },
        { text: "Rewards catalog access (subscribe for this!)", included: false, highlight: true },
      ],
    },
    {
      id: "basic",
      name: "Basic",
      price: 5,
      icon: Trophy,
      description: "Start redeeming gaming gear and rewards",
      pointsHighlight: "3,000 monthly points",
      features: [
        { text: "Access rewards catalog - redeem for gaming gear, peripherals & subscriptions", included: true, highlight: true },
        { text: "3,000 points deposited monthly", included: true },
        { text: "Automatic point allocation on billing cycle", included: true },
        { text: "Track match wins & achievements", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Achievement tracking", included: true },
        { text: "Bonus challenge eligibility", included: false },
        { text: "Priority support", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 12,
      icon: Flame,
      description: "More points, more rewards every month",
      badge: "7-Day Free Trial",
      freeTrial: "7 days free",
      pointsHighlight: "10,000 monthly points",
      features: [
        { text: "7-day free trial, then $12/month", included: true },
        { text: "Access rewards catalog - unlock better rewards faster", included: true, highlight: true },
        { text: "10,000 points deposited monthly (3.3x Basic)", included: true },
        { text: "Automatic point allocation on billing cycle", included: true },
        { text: "Bonus challenge eligibility for extra points", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Achievement tracking", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive Pro badge", included: true },
      ],
    },
    {
      id: "elite",
      name: "Elite",
      price: 25,
      icon: Star,
      description: "Maximum rewards - redeem premium gear monthly",
      badge: "3-Day Free Trial",
      freeTrial: "3 days free",
      pointsHighlight: "25,000 monthly points",
      features: [
        { text: "3-day free trial, then $25/month", included: true },
        { text: "Access rewards catalog - redeem premium rewards every month", included: true, highlight: true },
        { text: "25,000 points deposited monthly (8.3x Basic!)", included: true },
        { text: "Automatic point allocation on billing cycle", included: true },
        { text: "Priority bonus challenge access for extra points", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Achievement tracking", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive Elite badge & perks", included: true },
      ],
    },
  ];

  const hasActiveSubscription = Boolean(subscription && (subscription.status === "active" || subscription.status === "past_due"));
  const showSubscriptionCard = Boolean(subscription && subscription.status !== "canceled");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4" data-testid="heading-subscription">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Redeem membership points for gaming gear and rewards
          </p>
          {isAuthenticated && pointsData && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold" data-testid="text-points-balance">
                {pointsData.balance} Points Available
              </span>
            </div>
          )}
        </div>

        {/* Manual Sync for PayPal Subscription Issues */}
        {isAuthenticated && !subscription?.tier && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-3">
                <button
                  onClick={() => setShowManualSync(!showManualSync)}
                  className="flex items-center justify-between w-full text-left hover-elevate p-2 -m-2 rounded-md"
                  data-testid="button-toggle-manual-sync"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent-foreground" />
                    <CardTitle className="text-base">Subscription Not Showing?</CardTitle>
                  </div>
                  {showManualSync ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CardHeader>
              {showManualSync && (
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    If you completed payment but your subscription isn't showing, manually sync it using your PayPal Subscription ID.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="paypal-sub-id" className="text-sm">
                      PayPal Subscription ID
                    </Label>
                    <Input
                      id="paypal-sub-id"
                      placeholder="I-XXXXXXXXXX"
                      value={paypalSubId}
                      onChange={(e) => setPaypalSubId(e.target.value)}
                      data-testid="input-paypal-subscription-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in your PayPal account under Subscriptions
                    </p>
                  </div>
                  <Button
                    onClick={() => paypalSubId && manualSyncMutation.mutate(paypalSubId)}
                    disabled={!paypalSubId || manualSyncMutation.isPending}
                    className="w-full"
                    data-testid="button-sync-subscription"
                  >
                    {manualSyncMutation.isPending ? "Syncing..." : "Sync Subscription"}
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {isAuthenticated && subLoading ? (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-24 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {showSubscriptionCard && subscription && (
              <Card className={`mb-8 ${
                subscription.status === "active" || subscription.status === "past_due"
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/50 border-muted"
              }`} data-testid="card-current-subscription">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        {subscription.status === "active" ? "Current Subscription" : "Subscription Status"}
                      </CardTitle>
                      <CardDescription>
                        {subscription.tier === "elite" ? "Elite" : subscription.tier === "pro" ? "Pro" : "Basic"} Plan
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={subscription.status === "active" ? "default" : "secondary"}
                      data-testid="badge-status"
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-background/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <p className="text-sm font-medium">Days Until {subscription.status === "canceling" ? "Expiration" : "Renewal"}</p>
                      </div>
                      <div className="text-3xl font-bold font-mono text-primary" data-testid="text-days-remaining">
                        {getRemainingDays(subscription.currentPeriodEnd)}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (getRemainingDays(subscription.currentPeriodEnd) / 30) * 100))}%` 
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          {subscription.status === "canceling" ? "Ends On" : "Renews On"}
                        </p>
                        <p className="font-semibold" data-testid="text-period-end">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Monthly Allocation</p>
                        <p className="font-semibold" data-testid="text-monthly-points">
                          {subscription.tier === "elite" ? "25,000" : subscription.tier === "pro" ? "10,000" : "3,000"} points
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {subscription.status === "past_due" && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-destructive font-medium">
                        Payment Failed - Your subscription is past due. Please update your payment method.
                      </p>
                    </div>
                  )}
                  
                  {subscription.status === "canceling" && (
                    <div className="bg-muted border border-border rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground">
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                        You can resubscribe anytime.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {subscription.status === "active" && (
                    <Button
                      variant="outline"
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                      data-testid="button-cancel-subscription"
                    >
                      {cancelMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  )}
                  {subscription.status === "past_due" && paypalPlanIds[subscription.tier as keyof typeof paypalPlanIds] && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        To update your payment method, please cancel and create a new subscription:
                      </p>
                      <PayPalSubscriptionButton 
                        planId={paypalPlanIds[subscription.tier as keyof typeof paypalPlanIds]} 
                        tier={subscription.tier}
                      />
                    </div>
                  )}
                  {subscription.status === "canceling" && paypalPlanIds[subscription.tier as keyof typeof paypalPlanIds] && (
                    <PayPalSubscriptionButton 
                      planId={paypalPlanIds[subscription.tier as keyof typeof paypalPlanIds]} 
                      tier={subscription.tier}
                    />
                  )}
                </CardFooter>
              </Card>
            )}

            {/* Free Trial Card - Show if authenticated, no subscription, and hasn't used trial */}
            {isAuthenticated && !hasActiveSubscription && !userData?.freeTrial && (
              <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5" data-testid="card-free-trial">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        Start Your Free Trial
                        <Badge variant="default" className="animate-pulse">
                          <Sparkles className="w-3 h-3 mr-1" />
                          7 Days Free
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Try GG Loop risk-free. No credit card required.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-background/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-primary mb-1">7 Days</div>
                        <p className="text-xs text-muted-foreground">Full Access</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-primary mb-1">500 Points</div>
                        <p className="text-xs text-muted-foreground">Bonus Starter</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-primary mb-1">$0</div>
                        <p className="text-xs text-muted-foreground">No Card Needed</p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Earn points by reporting match wins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Access Tier 1 rewards catalog</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Share achievements on social media</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">Invite friends and earn referral rewards</span>
                      </li>
                    </ul>

                    <div className="space-y-2">
                      <Label htmlFor="referral-code" className="text-sm">
                        Have a Referral Code? (Optional)
                      </Label>
                      <Input
                        id="referral-code"
                        placeholder="Enter code..."
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        disabled={freeTrialMutation.isPending}
                        data-testid="input-referral-code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Using a referral code gives bonus points to you and your friend!
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => freeTrialMutation.mutate()}
                    disabled={freeTrialMutation.isPending}
                    data-testid="button-start-free-trial"
                  >
                    {freeTrialMutation.isPending ? "Starting Trial..." : "Start 7-Day Free Trial"}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Active Free Trial Status - Show if user is on trial */}
            {isAuthenticated && userData?.freeTrial && userData?.freeTrialEndsAt && (
              <Card className="mb-8 bg-primary/5 border-primary/20" data-testid="card-trial-active">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Free Trial Active
                      </CardTitle>
                      <CardDescription>
                        Enjoying GG Loop? Subscribe to keep earning rewards!
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      Trial Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <p className="text-sm font-medium">Days Remaining</p>
                      </div>
                      <div className="text-3xl font-bold font-mono text-primary" data-testid="text-trial-days-remaining">
                        {getRemainingDays(userData.freeTrialEndsAt)}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (getRemainingDays(userData.freeTrialEndsAt) / 7) * 100))}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Trial Ends On</p>
                    <p className="text-lg font-semibold mb-2" data-testid="text-trial-end-date">
                      {new Date(userData.freeTrialEndsAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subscribe before your trial ends to keep your points and continue earning rewards!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-4 gap-6">
              {tiers.map((tier) => {
                const TierIcon = tier.icon;
                const isCurrentTier = subscription?.tier === tier.id;
                const isElite = tier.id === "elite";
                const isFree = tier.id === "free";
                
                // Allow upgrades: if user has basic, they can upgrade to pro/elite
                // if user has pro, they can upgrade to elite
                const canUpgrade = subscription && (
                  (subscription.tier === 'basic' && (tier.id === 'pro' || tier.id === 'elite')) ||
                  (subscription.tier === 'pro' && tier.id === 'elite')
                );
                
                // Block downgrades: if user has a higher tier, block lower tiers
                const isDowngrade = subscription && (
                  (subscription.tier === 'elite' && (tier.id === 'pro' || tier.id === 'basic')) ||
                  (subscription.tier === 'pro' && tier.id === 'basic')
                );
                
                // Debug logging
                console.log(`Tier: ${tier.id}`, {
                  isAuthenticated,
                  isCurrentTier,
                  isDowngrade,
                  hasPayPalId: !!paypalPlanIds[tier.id as keyof typeof paypalPlanIds],
                  paypalPlanId: paypalPlanIds[tier.id as keyof typeof paypalPlanIds],
                  subscription
                });

                return (
                  <Card
                    key={tier.id}
                    className={`relative flex flex-col ${
                      isElite ? "border-primary/50 bg-primary/5" : ""
                    }`}
                    data-testid={`card-tier-${tier.id}`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="secondary" data-testid="badge-coming-soon">
                          {tier.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isElite ? "bg-primary/20" : "bg-muted"
                          }`}
                        >
                          <TierIcon
                            className={`w-6 h-6 ${
                              isElite ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <CardTitle>{tier.name}</CardTitle>
                        {isCurrentTier && (
                          <Badge variant="default" data-testid="badge-current-plan">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold" data-testid={`text-price-${tier.id}`}>
                            ${tier.price}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {!isFree && (tier as any).pointsHighlight && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Monthly Points</span>
                          </div>
                          <p className="text-2xl font-bold font-mono">{(tier as any).pointsHighlight}</p>
                        </div>
                      )}
                      <ul className="space-y-3">
                        {tier.features.map((feature: any, idx) => (
                          <li key={idx} className={`flex items-start gap-2 ${feature.highlight && feature.included ? 'bg-primary/5 -mx-2 px-2 py-2 rounded-lg border border-primary/20' : ''} ${feature.highlight && !feature.included ? 'bg-muted/30 -mx-2 px-2 py-2 rounded-lg border border-muted' : ''}`}>
                            {feature.included ? (
                              <Check className={`w-5 h-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-primary'}`} />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <span
                              className={
                                feature.included
                                  ? feature.highlight ? "text-foreground font-semibold" : "text-foreground"
                                  : feature.highlight ? "text-muted-foreground font-medium" : "text-muted-foreground"
                              }
                              data-testid={`text-feature-${tier.id}-${idx}`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="mt-auto">
                      {isFree ? (
                        <div className="w-full space-y-3">
                          {isAuthenticated && freeTierData && (
                            <>
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">Your GG Coins</span>
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-4 w-4 text-accent-foreground" />
                                    <span className="text-lg font-bold">{freeTierData.ggCoins}</span>
                                    <span className="text-xs text-muted-foreground">/ 500</span>
                                  </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-accent h-2 rounded-full transition-all" 
                                    style={{ width: `${Math.min(100, (freeTierData.ggCoins / 500) * 100)}%` }}
                                  />
                                </div>
                                {freeTierData.coinsNeeded > 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {freeTierData.coinsNeeded} more coins to unlock trial
                                  </p>
                                )}
                              </div>
                              {freeTierData.canRedeemTrial && !freeTierData.hasActiveTrial && (
                                <Button
                                  className="w-full"
                                  variant="default"
                                  onClick={() => redeemTrialMutation.mutate()}
                                  disabled={redeemTrialMutation.isPending}
                                  data-testid="button-redeem-trial"
                                >
                                  {redeemTrialMutation.isPending ? "Unlocking..." : "Unlock 7-Day Trial"}
                                </Button>
                              )}
                            </>
                          )}
                          <Link href={isAuthenticated ? '/stats' : '/login'}>
                            <Button
                              className="w-full"
                              variant={isAuthenticated && freeTierData?.canRedeemTrial ? "outline" : "default"}
                              data-testid={`button-free-${tier.id}`}
                            >
                              {isAuthenticated ? "View Stats Dashboard" : "Get Started Free"}
                            </Button>
                          </Link>
                        </div>
                      ) : !isAuthenticated ? (
                        <Link href="/login">
                          <Button
                            className="w-full"
                            variant={isElite ? "default" : "outline"}
                            data-testid={`button-login-${tier.id}`}
                          >
                            Log in to Subscribe
                          </Button>
                        </Link>
                      ) : isCurrentTier ? (
                        <Button
                          className="w-full"
                          variant="secondary"
                          disabled
                          data-testid={`button-current-${tier.id}`}
                        >
                          Current Plan
                        </Button>
                      ) : isDowngrade ? (
                        <div className="w-full space-y-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            disabled
                            data-testid={`button-downgrade-disabled-${tier.id}`}
                          >
                            Downgrade Not Available
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Cancel your current subscription first to switch to this tier
                          </p>
                        </div>
                      ) : !isDowngrade && paypalPlanIds[tier.id as keyof typeof paypalPlanIds] ? (
                        <div className="w-full">
                          <PayPalSubscriptionButton 
                            planId={paypalPlanIds[tier.id as keyof typeof paypalPlanIds]} 
                            tier={tier.name}
                          />
                        </div>
                      ) : null}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-16 bg-muted/50 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center" data-testid="heading-how-it-works">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-step-1-title">
                Subscribe
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-step-1-desc">
                Choose your plan and start earning points immediately
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-step-2-title">
                Play & Earn
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-step-2-desc">
                Earn points through gameplay, achievements, and tournaments
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-step-3-title">
                Redeem Rewards
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-step-3-desc">
                Exchange points for gaming peripherals, gear, and subscriptions
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
