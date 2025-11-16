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
  Lock,
  Search,
  Gift,
  Gamepad2,
  CreditCard,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-600/40',
    bg: 'bg-amber-950/10',
    icon: Crown,
    label: 'Legendary',
  },
  epic: {
    color: 'from-purple-600 to-purple-700',
    border: 'border-purple-600/40',
    bg: 'bg-purple-950/10',
    icon: Sparkles,
    label: 'Epic',
  },
  rare: {
    color: 'from-blue-600 to-blue-700',
    border: 'border-blue-600/40',
    bg: 'bg-blue-950/10',
    icon: Star,
    label: 'Rare',
  },
  common: {
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-500/40',
    bg: 'bg-slate-950/10',
    icon: Zap,
    label: 'Common',
  },
};

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Enhanced categorization with comprehensive keyword mapping
  const categorizeItem = (item: EnhancedReward): string => {
    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const combined = `${titleLower} ${descLower}`;
    
    // Gift cards - highest priority to catch card-related items
    const giftCardKeywords = ['gift card', 'giftcard', 'egift', 'e-gift', 'digital card', 'prepaid card'];
    if (giftCardKeywords.some(kw => combined.includes(kw))) return 'gift-cards';
    
    // Gaming gear - comprehensive hardware keywords
    const gamingGearKeywords = [
      'headset', 'headphone', 'mouse', 'keyboard', 'controller', 'gamepad',
      'monitor', 'webcam', 'microphone', 'mic', 'capture card',
      'logitech', 'razer', 'steelseries', 'hyperx', 'corsair', 'astro',
      'gaming chair', 'desk pad', 'mousepad', 'rgb', 'mechanical',
      'wireless gaming', 'gaming headset', 'pro gaming'
    ];
    if (gamingGearKeywords.some(kw => combined.includes(kw))) return 'gaming-gear';
    
    // Subscriptions
    const subscriptionKeywords = [
      'subscription', 'premium', 'membership', 'monthly', 'annual',
      'plus', 'pro', 'xbox live', 'game pass', 'playstation plus',
      'nintendo online', 'discord nitro'
    ];
    if (subscriptionKeywords.some(kw => combined.includes(kw))) return 'subscriptions';
    
    // Apparel
    const apparelKeywords = [
      'apparel', 'shirt', 't-shirt', 'tee', 'hoodie', 'sweatshirt',
      'jacket', 'hat', 'cap', 'merch', 'clothing', 'wear'
    ];
    if (apparelKeywords.some(kw => combined.includes(kw))) return 'apparel';
    
    return 'other';
  };

  const filteredItems = enhancedRewards.filter(item => {
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    const categoryMatch = selectedCategory === 'all' || categorizeItem(item) === selectedCategory;
    const searchMatch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return rarityMatch && categoryMatch && searchMatch;
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

        {/* Search and Filters */}
        <Card className="mb-8 p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rewards by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-rewards"
              />
            </div>

            {/* Category Filters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Categories</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  data-testid="filter-category-all"
                >
                  All Items
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'gift-cards' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('gift-cards')}
                  data-testid="filter-category-gift-cards"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  Gift Cards
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'subscriptions' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('subscriptions')}
                  data-testid="filter-category-subscriptions"
                >
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Subscriptions
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'gaming-gear' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('gaming-gear')}
                  data-testid="filter-category-gaming-gear"
                >
                  <Headphones className="h-3.5 w-3.5 mr-1.5" />
                  Gaming Gear
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'apparel' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('apparel')}
                  data-testid="filter-category-apparel"
                >
                  <Shirt className="h-3.5 w-3.5 mr-1.5" />
                  Apparel
                </Button>
              </div>
            </div>

            {/* Rarity Filters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Rarity</p>
              </div>
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

            {/* Results Count */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || selectedRarity !== 'all') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedRarity('all');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

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
