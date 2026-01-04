import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, Sparkles, Crown, Star, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  lifetime?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    description: '1 month of Basic tier',
    icon: <Star className="h-6 w-6" />,
    features: ['1.5x Points Multiplier', 'Basic Rewards Access', 'Community Discord'],
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 8,
    description: '1 month of Builder tier',
    icon: <Zap className="h-6 w-6" />,
    features: ['2x Points Multiplier', 'Priority Support', 'Exclusive Drops'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 12,
    description: '1 month of Pro tier',
    icon: <Sparkles className="h-6 w-6" />,
    features: ['3x Points Multiplier', 'Early Access', 'Pro Badge'],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 25,
    description: '1 month of Elite tier',
    icon: <Crown className="h-6 w-6" />,
    features: ['5x Points Multiplier', 'VIP Support', 'Elite Badge', 'All Features'],
  },
  {
    id: 'founder',
    name: 'Founding Member',
    price: 29,
    description: 'Lifetime access',
    icon: <Crown className="h-6 w-6 text-amber-500" />,
    features: ['2x Points Forever', 'Founder Badge', 'Name on Wall', 'Lifetime Access'],
    lifetime: true,
  },
];

export default function GiftTier() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createGiftMutation = useMutation({
    mutationFn: async ({ tier, recipientEmail }: { tier: string; recipientEmail: string }) => {
      const res = await apiRequest("POST", "/api/gift/create-checkout", {
        tier,
        recipientEmail,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create gift checkout");
    },
  });

  const handleGift = () => {
    if (!selectedTier) {
      setError("Please select a tier to gift");
      return;
    }
    if (!recipientEmail || !recipientEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    createGiftMutation.mutate({ tier: selectedTier, recipientEmail });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Gift className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Gift a Subscription</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Give the Gift of Gaming Rewards</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gift a GG LOOP subscription to a friend and help them earn points for playing their favorite games.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {TIERS.map((tier) => (
            <Card 
              key={tier.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedTier === tier.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-muted hover:border-primary/50'
              } ${tier.popular ? 'ring-2 ring-primary/30' : ''}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              <CardHeader className="pb-3 text-center">
                {tier.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {tier.lifetime && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500">
                    Lifetime
                  </Badge>
                )}
                <div className={`mx-auto p-3 rounded-full ${
                  selectedTier === tier.id ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold mb-2">
                  ${tier.price}
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {tier.features.slice(0, 2).map((f, i) => (
                    <li key={i} className="flex items-center gap-1 justify-center">
                      <Check className="h-3 w-3 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recipient Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Gift Details
            </CardTitle>
            <CardDescription>
              Enter the email address of the person you want to gift.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="friend@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                They'll receive an email with a link to claim their gift.
              </p>
            </div>

            {selectedTier && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selected Tier</span>
                  <span className="font-medium">
                    {TIERS.find(t => t.id === selectedTier)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${TIERS.find(t => t.id === selectedTier)?.price}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGift}
              disabled={!selectedTier || !recipientEmail || createGiftMutation.isPending}
            >
              {createGiftMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <Gift className="mr-2 h-5 w-5" />
                  Gift with Stripe
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Gift expires in 30 days if not claimed. Non-refundable after purchase.
            </p>
          </CardContent>
        </Card>

        {/* How it Works */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">How Gift-a-Tier Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Choose a Tier</h3>
              <p className="text-sm text-muted-foreground">
                Select the subscription tier you want to gift.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Enter Their Email</h3>
              <p className="text-sm text-muted-foreground">
                We'll send them a claim link to their email.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">They Claim It</h3>
              <p className="text-sm text-muted-foreground">
                They create an account (or log in) to claim their gift.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

