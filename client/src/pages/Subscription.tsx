import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trophy, Zap, Star, Flame } from "lucide-react";
import type { Subscription } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: subscription, isLoading: subLoading } = useQuery<Subscription | null>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  const { data: pointsData } = useQuery<{ balance: number }>({
    queryKey: ["/api/points/balance"],
    enabled: isAuthenticated,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await apiRequest("POST", "/api/create-checkout-session", { tier });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    },
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

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: 5,
      icon: Trophy,
      description: "Start earning rewards from your gameplay",
      features: [
        { text: "150 base points per month", included: true },
        { text: "150-300 performance bonus points", included: true },
        { text: "Access to Tier 1-2 rewards", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Achievement tracking", included: true },
        { text: "Performance multipliers", included: false },
        { text: "Priority support", included: false },
        { text: "Exclusive tournaments", included: false },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 10,
      icon: Flame,
      description: "Maximize your earning potential",
      badge: "Coming Soon",
      features: [
        { text: "300 base points per month", included: true },
        { text: "300-600 performance bonus points", included: true },
        { text: "Access to all reward tiers", included: true },
        { text: "Leaderboard rankings", included: true },
        { text: "Achievement tracking", included: true },
        { text: "1.5-2x performance multipliers", included: true },
        { text: "Priority support", included: true },
        { text: "Exclusive tournaments", included: true },
      ],
    },
  ];

  const hasActiveSubscription = Boolean(subscription && (subscription.status === "active" || subscription.status === "past_due"));
  const showSubscriptionCard = Boolean(subscription && subscription.status !== "canceled");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4" data-testid="heading-subscription">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Earn real rewards for your gaming performance
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
                        {subscription.tier === "premium" ? "Premium" : "Basic"} Plan
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
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">
                        {subscription.status === "canceling" ? "Ends On" : "Current Period Ends"}
                      </p>
                      <p className="font-semibold" data-testid="text-period-end">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Points</p>
                      <p className="font-semibold" data-testid="text-monthly-points">
                        {subscription.tier === "premium" ? "300-600" : "150-300"} points
                      </p>
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
                  {subscription.status === "past_due" && (
                    <Button
                      variant="default"
                      onClick={() => checkoutMutation.mutate(subscription.tier)}
                      disabled={checkoutMutation.isPending}
                      data-testid="button-update-payment"
                    >
                      {checkoutMutation.isPending ? "Loading..." : "Update Payment Method"}
                    </Button>
                  )}
                  {subscription.status === "canceling" && (
                    <Button
                      variant="default"
                      onClick={() => checkoutMutation.mutate(subscription.tier)}
                      disabled={checkoutMutation.isPending}
                      data-testid="button-resubscribe"
                    >
                      {checkoutMutation.isPending ? "Loading..." : "Resubscribe"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {tiers.map((tier) => {
                const TierIcon = tier.icon;
                const isCurrentTier = subscription?.tier === tier.id;
                const isPremium = tier.id === "premium";

                return (
                  <Card
                    key={tier.id}
                    className={`relative ${
                      isPremium ? "border-primary/50 bg-primary/5" : ""
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
                            isPremium ? "bg-primary/20" : "bg-muted"
                          }`}
                        >
                          <TierIcon
                            className={`w-6 h-6 ${
                              isPremium ? "text-primary" : "text-muted-foreground"
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

                    <CardContent>
                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <span
                              className={
                                feature.included
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }
                              data-testid={`text-feature-${tier.id}-${idx}`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      {!isAuthenticated ? (
                        <Button
                          className="w-full"
                          variant={isPremium ? "default" : "outline"}
                          onClick={() => window.location.href = '/api/login'}
                          data-testid={`button-login-${tier.id}`}
                        >
                          Log in to Subscribe
                        </Button>
                      ) : isCurrentTier ? (
                        <Button
                          className="w-full"
                          variant="secondary"
                          disabled
                          data-testid={`button-current-${tier.id}`}
                        >
                          Current Plan
                        </Button>
                      ) : isPremium ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled
                          data-testid={`button-disabled-${tier.id}`}
                        >
                          Coming Soon
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => checkoutMutation.mutate(tier.id)}
                          disabled={checkoutMutation.isPending || hasActiveSubscription}
                          data-testid={`button-subscribe-${tier.id}`}
                        >
                          {checkoutMutation.isPending ? "Loading..." : "Subscribe Now"}
                        </Button>
                      )}
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
                Exchange points for gift cards, gaming gear, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
