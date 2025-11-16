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

        {/* Strategic Vision Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading mb-6" data-testid="heading-vision">
              Why GG Loop?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The gaming industry is broken for everyday players. We're fixing it.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  What's Our Solution?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">The Problem:</strong> Gamers spend thousands of hours and dollars on their passion, but receive zero tangible value in return. Streaming platforms pay out pennies to small creators. Sponsorships only go to the top 1%. Casual and semi-pro gamers get nothing.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Our Solution:</strong> GG Loop is a <span className="text-primary font-semibold">membership rewards program</span> that gives gamers fixed monthly point allocations they can redeem for real gaming gear - without relying on sponsorships, ads, or grinding for views.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-2 text-primary">How It Works</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Subscribe:</strong> Choose Basic ($5), Pro ($12), or Elite ($25) tier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Earn Points:</strong> Get fixed monthly allocations (3,000 - 25,000 points) + bonus challenges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Redeem:</strong> Trade points for gaming gear, gift cards, peripherals via Tango Card fulfillment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Track Progress:</strong> Automatic match sync (LoL, Valorant, TFT) + public Trophy Case profiles</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Why Are WE Building This?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">The Founder's Story:</strong> I've been a gamer for 20+ years and watched thousands of talented players pour their heart into games only to walk away with nothing but memories. Meanwhile, brands spend billions on influencer marketing that only reaches the top 0.1% of creators.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Our Unique Position:</strong> We're not another esports company trying to monetize tournaments. We're not a streaming platform fighting for ad dollars. We're building infrastructure that works for the 99% of gamers who will never go pro but deserve recognition for their dedication.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-3">What Makes Us Different</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">✓ Founder is a gamer first</p>
                      <p className="font-medium text-foreground">✓ Built for small streamers (10-100 viewers)</p>
                      <p className="font-medium text-foreground">✓ No ads, no sponsors required</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">✓ Transparent business model</p>
                      <p className="font-medium text-foreground">✓ Fixed rewards, not pay-to-win</p>
                      <p className="font-medium text-foreground">✓ Community-first approach</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Why Is NOW the Right Time?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Market Timing:</strong> Three major shifts are happening simultaneously that make this the perfect moment to launch GG Loop.
                </p>
                <div className="space-y-4 mt-4">
                  <div className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold mb-1">1. Creator Economy Saturation</h4>
                    <p className="text-sm text-muted-foreground">
                      Twitch/YouTube are oversaturated. 90% of streamers make less than $100/month. Small creators are desperate for alternative revenue that doesn't depend on views or donations.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold mb-1">2. Web3 Gaming Backlash</h4>
                    <p className="text-sm text-muted-foreground">
                      Play-to-earn crashed. NFT games failed. Gamers are burned out on crypto promises. There's a vacuum for <span className="text-primary font-semibold">real, sustainable value</span> without blockchain hype.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold mb-1">3. Loyalty Program Technology Maturity</h4>
                    <p className="text-sm text-muted-foreground">
                      Stripe/PayPal subscriptions are battle-tested. Riot API provides reliable match data. Tango Card offers instant digital gift card fulfillment. The infrastructure exists to execute this TODAY.
                    </p>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">The Window Is Open</h4>
                  <p className="text-sm text-muted-foreground">
                    In 6-12 months, a big gaming company will copy this model with millions in funding. We're launching NOW to capture the early adopter gaming community and build defensibility through brand loyalty before the giants arrive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
