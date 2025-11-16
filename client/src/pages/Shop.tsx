import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap,
  Star,
  Crown,
  Shirt,
  Coffee,
  Headphones,
  Lock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Reward } from "@shared/schema";

interface EnhancedReward extends Reward {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited: boolean;
  utid?: string; // Tango Card UTID
}

// Rarity mapping based on points cost
function getRarity(pointsCost: number): 'common' | 'rare' | 'epic' | 'legendary' {
  if (pointsCost >= 30000) return 'legendary';
  if (pointsCost >= 10000) return 'epic';
  if (pointsCost >= 3000) return 'rare';
  return 'common';
}

const rarityConfig = {
  legendary: {
    color: 'from-yellow-600 to-orange-600',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    icon: Crown,
    label: 'Legendary',
  },
  epic: {
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    icon: Sparkles,
    label: 'Epic',
  },
  rare: {
    color: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    icon: Star,
    label: 'Rare',
  },
  common: {
    color: 'from-gray-600 to-gray-500',
    border: 'border-gray-500/50',
    bg: 'bg-gray-500/10',
    icon: Zap,
    label: 'Common',
  },
};

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Fetch Tango Card catalog
  const { data: tangoItems, isLoading: tangoLoading } = useQuery<any[]>({
    queryKey: ["/api/tango/catalog"],
  });

  // Fetch local rewards (for legacy support)
  const { data: localRewards, isLoading: localLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const isLoading = tangoLoading || localLoading;
  const rewards = [...(tangoItems || []), ...(localRewards || [])];

  // Enhance rewards with rarity and limited status
  const enhancedRewards: EnhancedReward[] = (rewards || []).map(reward => ({
    ...reward,
    rarity: getRarity(reward.pointsCost),
    // Only limited if stock is defined AND less than 50
    isLimited: reward.stock !== null && reward.stock < 50,
  }));

  const filteredItems = enhancedRewards.filter(item => {
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    return rarityMatch;
  });

  const canAfford = (pointsCost: number) => {
    return user && user.totalPoints >= pointsCost;
  };

  const meetsRequirements = (item: EnhancedReward) => {
    if (!user) return false;
    // For MVP, allow all items - in production, check real win counts
    return true;
  };

  const redeemMutation = useMutation({
    mutationFn: async (item: EnhancedReward) => {
      // Check if this is a Tango Card item (has utid field)
      if (item.utid) {
        // SECURITY: Only send UTID, server determines price from catalog
        const res = await apiRequest("POST", "/api/tango/redeem", { 
          utid: item.utid
        });
        return await res.json();
      } else {
        // Local reward
        const res = await apiRequest("POST", "/api/user/rewards/redeem", { rewardId: item.id });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tango/catalog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/rewards"] });
      toast({
        title: "Item Claimed!",
        description: "Your reward has been sent to your email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem item",
        variant: "destructive",
      });
    },
  });

  const handleRedeem = (item: EnhancedReward) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Sign in to redeem merchandise",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford(item.pointsCost)) {
      toast({
        title: "Insufficient Points",
        description: `You need ${item.pointsCost.toLocaleString()} points to redeem this item`,
        variant: "destructive",
      });
      return;
    }

    if (!meetsRequirements(item)) {
      toast({
        title: "Requirements Not Met",
        description: "You don't meet the requirements for this item",
        variant: "destructive",
      });
      return;
    }

    // Pass the entire item so we can determine if it's Tango or local
    redeemMutation.mutate(item);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">Merch Shop</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Redeem your points for exclusive gaming gear, apparel, and collectibles
          </p>
          
          {isAuthenticated && user && (
            <div className="mt-6 inline-flex items-center gap-3 bg-primary/10 border-2 border-primary/30 rounded-lg px-6 py-3">
              <Trophy className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-points-balance">
                  {user.totalPoints.toLocaleString()} points
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedRarity === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedRarity('all')}
              data-testid="filter-rarity-all"
            >
              All Rarities
            </Button>
            <Button
              size="sm"
              variant={selectedRarity === 'legendary' ? 'default' : 'outline'}
              onClick={() => setSelectedRarity('legendary')}
              data-testid="filter-rarity-legendary"
            >
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              Legendary
            </Button>
            <Button
              size="sm"
              variant={selectedRarity === 'epic' ? 'default' : 'outline'}
              onClick={() => setSelectedRarity('epic')}
              data-testid="filter-rarity-epic"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Epic
            </Button>
            <Button
              size="sm"
              variant={selectedRarity === 'rare' ? 'default' : 'outline'}
              onClick={() => setSelectedRarity('rare')}
              data-testid="filter-rarity-rare"
            >
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Rare
            </Button>
            <Button
              size="sm"
              variant={selectedRarity === 'common' ? 'default' : 'outline'}
              onClick={() => setSelectedRarity('common')}
              data-testid="filter-rarity-common"
            >
              Common
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
            const rarity = rarityConfig[item.rarity];
            const RarityIcon = rarity.icon;
            const affordable = canAfford(item.pointsCost);
            const unlocked = meetsRequirements(item);
            const outOfStock = item.stock !== null && item.stock <= 0;

            return (
              <Card 
                key={item.id} 
                className={`relative overflow-hidden ${rarity.border} ${unlocked && !outOfStock ? '' : 'opacity-60'}`}
                data-testid={`merch-card-${item.id}`}
              >
                {outOfStock && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="destructive" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Sold Out
                    </Badge>
                  </div>
                )}

                {item.isLimited && !outOfStock && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="destructive" className="gap-1">
                      <Flame className="h-3 w-3" />
                      Limited
                    </Badge>
                  </div>
                )}

                {!unlocked && !outOfStock && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${rarity.color}`} />

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${rarity.bg} gap-1.5`}>
                          <RarityIcon className="h-3 w-3" />
                          {rarity.label}
                        </Badge>
                        {item.stock !== null && item.stock < 20 && item.stock > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {item.stock} left
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {item.description || 'Exclusive gaming merchandise'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className={`text-xl font-bold ${affordable ? 'text-primary' : 'text-muted-foreground'}`}>
                        {item.pointsCost.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRedeem(item)}
                      disabled={!isAuthenticated || !affordable || !unlocked || outOfStock}
                      data-testid={`button-redeem-${item.id}`}
                    >
                      {!isAuthenticated ? 'Login' : outOfStock ? 'Sold Out' : !unlocked ? 'Locked' : !affordable ? 'Insufficient' : 'Redeem'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items match your filters</p>
          </div>
        )}

        {!isAuthenticated && (
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Sign In to Start Shopping</h3>
              <p className="text-muted-foreground mb-6">
                Earn points by winning matches and redeem them for exclusive merch
              </p>
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
