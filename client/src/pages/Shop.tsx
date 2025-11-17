import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  Zap
} from "lucide-react";
import { Link } from "wouter";

// Mock rewards data for MVP presentation
const MOCK_REWARDS = [
  // Gift Cards
  { id: '1', title: 'Steam Gift Card $25', category: 'gift-cards', pointsCost: 12000, rarity: 'rare', imageUrl: 'https://images.unsplash.com/photo-1633969707708-3f9644786f8d?w=800&h=600&fit=crop', description: 'Instantly delivered digital gift card for Steam platform' },
  { id: '2', title: 'Amazon Gift Card $50', category: 'gift-cards', pointsCost: 25000, rarity: 'epic', imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop', description: 'Versatile gift card for millions of products' },
  { id: '3', title: 'Discord Nitro 1 Year', category: 'subscriptions', pointsCost: 15000, rarity: 'rare', imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop', description: 'Premium Discord features for one year' },
  { id: '4', title: 'PlayStation Store $100', category: 'gift-cards', pointsCost: 50000, rarity: 'legendary', imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop', description: 'PlayStation Network wallet credit' },
  
  // Gaming Gear
  { id: '5', title: 'Razer DeathAdder V3', category: 'gaming-gear', pointsCost: 35000, rarity: 'epic', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop', description: 'Professional gaming mouse with 30K DPI sensor' },
  { id: '6', title: 'HyperX Cloud II Headset', category: 'gaming-gear', pointsCost: 28000, rarity: 'epic', imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=600&fit=crop', description: '7.1 surround sound gaming headset' },
  { id: '7', title: 'Logitech G Pro X Keyboard', category: 'gaming-gear', pointsCost: 42000, rarity: 'legendary', imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=600&fit=crop', description: 'Mechanical gaming keyboard with RGB' },
  { id: '8', title: 'SteelSeries Mousepad XXL', category: 'gaming-gear', pointsCost: 8000, rarity: 'common', imageUrl: 'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=800&h=600&fit=crop', description: 'Extended gaming surface with anti-slip base' },
  
  // More Gift Cards
  { id: '9', title: 'Xbox Gift Card $25', category: 'gift-cards', pointsCost: 12000, rarity: 'rare', imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&h=600&fit=crop', description: 'Microsoft Store and Xbox credit' },
  { id: '10', title: 'Riot Points 5000 RP', category: 'gift-cards', pointsCost: 20000, rarity: 'epic', imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop', description: 'League of Legends in-game currency' },
  { id: '11', title: 'Visa Prepaid Card $100', category: 'gift-cards', pointsCost: 52000, rarity: 'legendary', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop', description: 'Use anywhere Visa is accepted' },
  { id: '12', title: 'Google Play $15', category: 'gift-cards', pointsCost: 7000, rarity: 'common', imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop', description: 'Android apps, games, and media' },
];

const rarityConfig = {
  legendary: { color: 'from-amber-600 to-orange-600', border: 'border-amber-600/40', icon: Crown, label: 'Legendary' },
  epic: { color: 'from-purple-600 to-purple-700', border: 'border-purple-600/40', icon: Sparkles, label: 'Epic' },
  rare: { color: 'from-blue-600 to-blue-700', border: 'border-blue-600/40', icon: Star, label: 'Rare' },
  common: { color: 'from-slate-500 to-slate-600', border: 'border-slate-500/40', icon: Zap, label: 'Common' },
};

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter rewards
  const filteredRewards = MOCK_REWARDS.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Rewards', icon: Gift },
    { value: 'gift-cards', label: 'Gift Cards', icon: CreditCard },
    { value: 'gaming-gear', label: 'Gaming Gear', icon: Gamepad2 },
    { value: 'subscriptions', label: 'Subscriptions', icon: Headphones },
  ];

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
            Redeem your points for gaming gear, gift cards, and subscriptions
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
        {filteredRewards.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-results">No rewards found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const config = rarityConfig[reward.rarity as keyof typeof rarityConfig];
              const Icon = config.icon;
              const canAfford = isAuthenticated && user && user.totalPoints >= reward.pointsCost;
              
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
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
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
                        disabled
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Redeem (Coming Soon)
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
              Redeem your points for instant digital delivery of gift cards and gaming gear. 
              Rewards are typically delivered within 24 hours to your registered email address.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
