import { Trophy, Target, Heart, Users, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 py-16 space-y-16">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Our Mission</span>
          </div>
          <h1 className="text-5xl font-bold font-heading tracking-tight" data-testid="heading-about">
            About GG Loop
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're building a loyalty platform that rewards gamers for doing what they already love - playing games.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Vision</CardTitle>
              <CardDescription>
                Transform gaming passion into tangible rewards through a sustainable membership model
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Values</CardTitle>
              <CardDescription>
                Transparency, fairness, and building genuine value for the gaming community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Community</CardTitle>
              <CardDescription>
                Gamers, content creators, and esports enthusiasts who want their dedication recognized
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="heading-how-it-works">
              How GG Loop Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We operate on a simple membership model designed to be sustainable and rewarding for our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  The Business Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Subscription Tiers</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer three paid tiers (Basic $5, Pro $12, Elite $25) that provide fixed monthly point allocations. These points can be redeemed for gaming gear, peripherals, gift cards, and subscriptions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Free Tier</h3>
                  <p className="text-sm text-muted-foreground">
                    New users start with a Free tier where they earn GG Coins through match wins and login streaks. Collect 500 coins to unlock a 7-day trial of the Basic tier.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sustainability</h3>
                  <p className="text-sm text-muted-foreground">
                    Points are membership perks, not cash equivalents. They expire after 12 months to maintain program sustainability. This ensures we can continue rewarding our community long-term.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Community Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Match Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic synchronization with League of Legends and Valorant matches via Riot Games API. Track your performance, wins, and achievements.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Creator Program</h3>
                  <p className="text-sm text-muted-foreground">
                    Create TikTok content using our viral templates and earn bonus points. Help grow the community while getting rewarded for your creativity.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sponsored Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Participate in brand-sponsored challenges to unlock capped bonus points beyond your monthly tier allocation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted/50 rounded-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="heading-transparency">
              Our Commitment to Transparency
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in being upfront about how our platform works and how we make it sustainable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="font-semibold text-base">What We Do</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>Provide fixed monthly point allocations based on your subscription tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>Track your gaming performance across supported titles</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>Offer a curated rewards catalog with real gaming gear</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>Create opportunities for bonus points through challenges and content creation</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-base">What We Don't Do</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span>Sell or trade points as cryptocurrency or cash equivalents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span>Guarantee unlimited point earnings or "get rich quick" schemes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span>Promise unrealistic returns on subscription investment</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span>Share or sell your personal data or gaming statistics</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold" data-testid="heading-get-started">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join GG Loop today and start turning your gaming sessions into tangible rewards. Start with the Free tier and unlock your first trial with GG Coins.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/subscription">
              <Button size="lg" data-testid="button-view-plans">
                View Plans
              </Button>
            </Link>
            <Link href="/free-tier">
              <Button size="lg" variant="outline" data-testid="button-start-free">
                Start Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
