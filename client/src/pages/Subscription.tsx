import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Trophy, Zap, Star, Flame, Code, Crown } from "lucide-react";
import type { Subscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function SubscriptionPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  const handleStripeCheckout = async (tier: string, isFounder = false) => {
    try {
      const endpoint = isFounder ? "/api/stripe/create-checkout" : "/api/stripe/create-subscription-checkout";
      const body = isFounder ? {} : { tier };
      
      const response = await apiRequest("POST", endpoint, body);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  const tiers = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      icon: Trophy,
      description: "Get started",
      features: [
        "Leaderboard rankings",
        "Achievement tracking",
        "Basic rewards access",
      ],
    },
    {
      id: "basic",
      name: "Basic",
      price: "$5",
      period: "/month",
      icon: Trophy,
      description: "3,000 monthly points",
      features: [
        "Everything in Free",
        "3,000 points/month",
        "Rewards catalog access",
        "Manual fulfillment",
      ],
    },
    {
      id: "builder",
      name: "Builder",
      price: "$12",
      period: "/month",
      icon: Code,
      description: "For Vibe Coders",
      badge: "2x XP",
      features: [
        "Everything in Basic",
        "10,000 points/month",
        "2x XP for coding sessions",
        "Verified Builder badge",
        "Priority support",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$12",
      period: "/month",
      icon: Flame,
      description: "10,000 monthly points",
      features: [
        "Everything in Basic",
        "10,000 points/month",
        "Bonus challenges",
        "Priority support",
        "Exclusive Pro badge",
      ],
    },
    {
      id: "elite",
      name: "Elite",
      price: "$25",
      period: "/month",
      icon: Star,
      description: "25,000 monthly points",
      features: [
        "Everything in Pro",
        "25,000 points/month",
        "Priority rewards access",
        "Exclusive Elite perks",
        "VIP support",
      ],
    },
    {
      id: "founder",
      name: "Founding Member",
      price: "$29",
      period: "lifetime",
      icon: Crown,
      description: "First 50 only",
      badge: "Lifetime",
      highlight: true,
      features: [
        "2x points FOREVER",
        "Name on Founders Wall",
        "Early access to all features",
        "Direct line to founder",
        "Vote on game additions",
        "Exclusive Discord channel",
      ],
    },
  ];

  const isCurrentTier = (tierId: string) => subscription?.tier === tierId;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Start earning points and redeeming rewards today
          </p>
        </div>

        {/* 6-tier balanced grid - responsive with no orphaned cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-[1800px] mx-auto">
          {tiers.map((tier) => {
            const TierIcon = tier.icon;
            const isFree = tier.id === "free";
            const isFounder = tier.id === "founder";
            const current = isCurrentTier(tier.id);

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col ${
                  tier.highlight
                    ? "border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 to-primary/10"
                    : ""
                } ${current ? "border-primary" : ""}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="animate-pulse">
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div
                      className={`p-3 rounded-lg ${
                        tier.highlight ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <TierIcon
                        className={`w-6 h-6 ${
                          tier.highlight ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-3">
                    <div className="text-3xl font-bold">{tier.price}</div>
                    {tier.period && (
                      <div className="text-sm text-muted-foreground">{tier.period}</div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>

                <CardContent className="flex-1 px-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  {isFree ? (
                    <Link href={isAuthenticated ? "/stats" : "/login"} className="w-full">
                      <Button className="w-full" variant="outline">
                        {isAuthenticated ? "Dashboard" : "Get Started Free"}
                      </Button>
                    </Link>
                  ) : current ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${tier.highlight ? "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600" : ""}`}
                      variant={tier.highlight ? "default" : "outline"}
                      onClick={() => handleStripeCheckout(tier.id, isFounder)}
                    >
                      {isFounder 
                        ? "Lock In $29 Forever"
                        : isAuthenticated
                          ? "Subscribe with Stripe"
                          : "Sign Up & Subscribe"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>All subscriptions managed through Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}

