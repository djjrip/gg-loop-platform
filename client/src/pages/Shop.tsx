import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  Gamepad2,
  Headphones,
  CreditCard,
  Search,
  Lock,
  Crown,
  Sparkles,
  Star,
  Zap,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  category: string;
  tier: number;
  inStock: boolean;
  fulfillmentType: string;
}

const rarityConfig: Record<number, { color: string; border: string; icon: any; label: string }> = {
  4: { color: 'from-amber-600 to-orange-600', border: 'border-amber-600/40', icon: Crown, label: 'Legendary' },
  3: { color: 'from-purple-600 to-purple-700', border: 'border-purple-600/40', icon: Sparkles, label: 'Epic' },
  2: { color: 'from-blue-600 to-blue-700', border: 'border-blue-600/40', icon: Star, label: 'Rare' },
  1: { color: 'from-slate-500 to-slate-600', border: 'border-slate-500/40', icon: Zap, label: 'Common' },
};

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch rewards from API
  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });

  // Redemption mutation
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await apiRequest('POST', '/api/user/rewards/redeem', { rewardId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] }); // Refresh user points
      queryClient.invalidateQueries({ queryKey: ['/api/user/rewards'] }); // Refresh user rewards

      toast({
        title: "Reward Redeemed!",
        description: "Your request has been received. We will process it shortly and email you the details.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Could not redeem reward. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter rewards
  const filteredRewards = rewards?.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reward.description && reward.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const categories = [
    { value: 'all', label: 'All Rewards', icon: Gift },
    { value: 'gift-cards', label: 'Gift Cards', icon: CreditCard },
    { value: 'gaming-gear', label: 'Gaming Gear', icon: Gamepad2 },
    { value: 'subscriptions', label: 'Subscriptions', icon: Headphones },
  ];

  const handleRedeem = (reward: Reward) => {
    if (!confirm(`Are you sure you want to redeem ${reward.title} for ${reward.pointsCost.toLocaleString()} points?`)) {
      return;
    }
    redeemMutation.mutate(reward.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2" data-testid="text-shop-title">
            Rewards Shop
          </h1>
          <p className="text-muted-foreground">
            Redeem your points for gift cards and rewards (Manual fulfillment subject to availability)
          </p>
          {isAuthenticated && user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold" data-testid="text-available-points">
                {user.totalPoints?.toLocaleString() || 0} points available
              </span>
            </div>
          )}
        </div>

        {/* Manual Fulfillment Banner */}
        <Alert variant="default" className="mb-6 border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manual Fulfillment Process</AlertTitle>
          <AlertDescription>
            All reward redemptions are processed manually by our team. Please allow 2-5 business days for fulfillment. Rewards are subject to availability.
          </AlertDescription>
        </Alert>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-rewards"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 max-w-2xl" data-testid="tabs-categories">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.value} value={cat.value} data-testid={`tab-${cat.value}`}>
                    <Icon className="h-4 w-4 mr-2" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Rewards Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-results">No rewards found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const config = rarityConfig[reward.tier] || rarityConfig[1];
              const Icon = config.icon;
              const canAfford = isAuthenticated && user && user.totalPoints >= reward.pointsCost;
              const isRedeeming = redeemMutation.isPending && redeemMutation.variables === reward.id;

              return (
                <Card
                  key={reward.id}
                  className={`overflow-hidden hover-elevate ${config.border}`}
                  data-testid={`card-reward-${reward.id}`}
                >
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={`bg-gradient-to-r ${config.color}`} data-testid={`badge-rarity-${reward.id}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Image */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Gift className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2" data-testid={`text-reward-title-${reward.id}`}>
                      {reward.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-primary" data-testid={`text-reward-points-${reward.id}`}>
                        {reward.pointsCost.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">points</span>
                    </div>

                    {!isAuthenticated ? (
                      <Link href="/login">
                        <Button className="w-full" variant="outline" data-testid={`button-login-${reward.id}`}>
                          <Lock className="mr-2 h-4 w-4" />
                          Login to Redeem
                        </Button>
                      </Link>
                    ) : canAfford ? (
                      <Button
                        className="w-full"
                        data-testid={`button-redeem-${reward.id}`}
                        onClick={() => handleRedeem(reward)}
                        disabled={isRedeeming || !reward.inStock}
                      >
                        {isRedeeming ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Gift className="mr-2 h-4 w-4" />
                        )}
                        {reward.inStock ? 'Request Reward' : 'Out of Stock'}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="secondary" className="w-full justify-center" data-testid={`badge-insufficient-${reward.id}`}>
                          Need {(reward.pointsCost - (user?.totalPoints || 0)).toLocaleString()} more points
                        </Badge>
                        <Link href="/subscription">
                          <Button variant="outline" className="w-full" size="sm" data-testid={`button-upgrade-${reward.id}`}>
                            Upgrade Tier
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        <Card className="mt-12 bg-muted/30">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-bold mb-2">How Redemption Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Request redemption for available rewards.
              Rewards are processed manually by our team (subject to availability).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
