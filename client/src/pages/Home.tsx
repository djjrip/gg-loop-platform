import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  TrendingUp, 
  Gift, 
  Zap,
  Trophy,
  Users,
  ArrowRight,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Static mock rewards for marketing presentation
const MOCK_REWARDS = [
  { id: "1", title: "Steam Gift Card $25", pointsCost: 12000, imageUrl: "https://images.unsplash.com/photo-1633969707708-3f9644786f8d?w=400&h=400&fit=crop" },
  { id: "2", title: "Razer DeathAdder V3", pointsCost: 35000, imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
  { id: "3", title: "HyperX Cloud II", pointsCost: 28000, imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop" },
  { id: "4", title: "Discord Nitro 1 Year", pointsCost: 15000, imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop" },
  { id: "5", title: "Logitech G Pro X", pointsCost: 42000, imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop" },
  { id: "6", title: "Amazon Gift Card $50", pointsCost: 25000, imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="outline" className="px-4 py-2 text-sm" data-testid="badge-membership">
            Membership Rewards for Gamers
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold font-heading tracking-tight" data-testid="text-hero-title">
            Play. <span className="text-primary">Earn.</span> Loop.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Subscribe to GG Loop and earn points for every ranked match you win. 
            Redeem points for gaming gear, gift cards, and exclusive rewards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link href="/stats">
                <Button size="lg" data-testid="button-dashboard">
                  View Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/subscription">
                <Button size="lg" data-testid="button-sign-up">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <a 
              href="https://discord.gg/X6GXg2At2D" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" data-testid="button-discord">
                <Users className="mr-2 h-5 w-5" />
                Join Discord
              </Button>
            </a>
            
            <Link href="/partners">
              <Button variant="ghost" size="lg" data-testid="button-partner">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading mb-4" data-testid="text-how-it-works">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to start earning rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1: Play */}
          <Card className="text-center p-8 hover-elevate" data-testid="card-step-play">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-heading">1. Play</h3>
              <p className="text-muted-foreground">
                Link your Riot account and play ranked matches in League of Legends or Valorant
              </p>
            </CardContent>
          </Card>

          {/* Step 2: Earn */}
          <Card className="text-center p-8 hover-elevate" data-testid="card-step-earn">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-heading">2. Earn</h3>
              <p className="text-muted-foreground">
                Get monthly point allocations + bonus points for wins, streaks, and achievements
              </p>
            </CardContent>
          </Card>

          {/* Step 3: Loop */}
          <Card className="text-center p-8 hover-elevate" data-testid="card-step-loop">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-heading">3. Loop</h3>
              <p className="text-muted-foreground">
                Redeem points for gaming gear, gift cards, and exclusive rewards
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Our Mission</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-heading" data-testid="text-mission-title">
            Rewarding Gamers for Their Dedication
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Gamers spend thousands of hours perfecting their skills, but receive zero tangible value in return. 
            GG Loop changes that with a <span className="text-primary font-semibold">membership rewards program</span> that 
            gives you fixed monthly point allocations to redeem for real gaming gear - without relying on sponsorships, ads, or grinding for views.
          </p>

          <div className="bg-muted/50 rounded-lg p-8 space-y-6 text-left">
            <h3 className="text-2xl font-bold text-center">What Makes Us Different</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Built for the 99%</p>
                    <p className="text-sm text-muted-foreground">
                      Not just pro players - rewards for dedicated gamers and aspiring creators
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Transparent & Sustainable</p>
                    <p className="text-sm text-muted-foreground">
                      Fixed monthly allocations, no pay-to-win, points expire after 12 months
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Real Value</p>
                    <p className="text-sm text-muted-foreground">
                      Gaming peripherals, gift cards, and subscriptions - no crypto promises
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Community First</p>
                    <p className="text-sm text-muted-foreground">
                      Built by gamers, for gamers - recognition for your dedication
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href="/about">
            <Button variant="outline" size="lg" data-testid="button-learn-more">
              Learn More About Our Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading mb-4" data-testid="text-membership-tiers">
            Membership Tiers
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the tier that matches your gaming dedication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic */}
          <Card className="p-8 hover-elevate" data-testid="card-tier-basic">
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-heading">Basic</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold" data-testid="text-price-basic">$5</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>3,000 monthly points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>Bonus points for wins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span>Access to rewards catalog</span>
                </div>
              </div>
              <Link href="/subscription">
                <Button className="w-full" variant="outline" data-testid="button-basic">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro - Featured */}
          <Card className="p-8 border-primary shadow-lg hover-elevate" data-testid="card-tier-pro">
            <CardContent className="space-y-6">
              <div>
                <Badge className="mb-2" data-testid="badge-popular">Most Popular</Badge>
                <h3 className="text-2xl font-bold font-heading">Pro</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold" data-testid="text-price-pro">$12</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>10,000 monthly points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>2x bonus points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span>Priority rewards access</span>
                </div>
              </div>
              <Link href="/subscription">
                <Button className="w-full" data-testid="button-pro">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Elite */}
          <Card className="p-8 hover-elevate" data-testid="card-tier-elite">
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-heading">Elite</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold" data-testid="text-price-elite">$25</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>25,000 monthly points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>3x bonus points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span>Exclusive elite rewards</span>
                </div>
              </div>
              <Link href="/subscription">
                <Button className="w-full" variant="outline" data-testid="button-elite">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rewards Preview - Static Mock Data */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading mb-4" data-testid="text-rewards-preview">
            Redeem For Real Rewards
          </h2>
          <p className="text-lg text-muted-foreground">
            Gaming gear, gift cards, and more
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {MOCK_REWARDS.map((reward) => (
            <Card key={reward.id} className="hover-elevate overflow-hidden" data-testid={`card-reward-${reward.id}`}>
              <CardContent className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img 
                    src={reward.imageUrl} 
                    alt={reward.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-sm line-clamp-2" data-testid={`text-reward-title-${reward.id}`}>
                    {reward.title}
                  </h4>
                  <p className="text-primary font-bold font-mono" data-testid={`text-reward-points-${reward.id}`}>
                    {reward.pointsCost.toLocaleString()} pts
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button size="lg" variant="outline" data-testid="button-view-all-rewards">
              View All Rewards
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="bg-primary text-primary-foreground p-12 text-center" data-testid="card-cta">
          <CardContent className="space-y-6">
            <h2 className="text-4xl font-bold font-heading" data-testid="text-cta-title">
              Ready to Start Earning?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of gamers already earning rewards for doing what they love.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link href="/stats">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    data-testid="button-cta-dashboard"
                  >
                    View Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/subscription">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    data-testid="button-cta-sign-up"
                  >
                    Sign Up Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
