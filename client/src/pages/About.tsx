import { Trophy, Target, Heart, Users, Sparkles, TrendingUp, Home, DollarSign, Dumbbell, Shield } from "lucide-react";
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
            <span className="text-sm font-medium text-primary">The Only Sport for Everyone</span>
          </div>
          <h1 className="text-5xl font-bold font-heading tracking-tight" data-testid="heading-about">
            Gaming Is The Universal Sport
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No height requirements. No genetics. No barriers. Just skill, strategy, and dedication. <span className="text-primary font-semibold">GG Loop rewards excellence like professional athletes</span> - because gaming deserves the same respect.
          </p>
        </section>

        {/* NBA Philosophy Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading mb-6" data-testid="heading-vision">
              A Performance Economy for Gamers
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <span className="text-primary font-semibold">Raised on NBA culture (Dallas Mavericks, 1996)</span> - where stats matter, highlights are celebrated, and excellence is rewarded. <span className="font-semibold text-foreground">Gaming mirrors professional sports</span>: skill beats luck, discipline beats randomness, performance beats talk.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Home className="h-6 w-6 text-primary" />
                  The Vision: Houses Through Gaming 🏠
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Why We Exist:</strong> A gamer should one day be able to earn <span className="text-primary font-bold">a HOUSE</span> by playing video games. Not crypto promises. Not NFT scams. <span className="font-semibold text-foreground">Real property. Real wealth.</span>
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">How It Works:</strong> GG Loop is a <span className="text-primary font-semibold">digital salary engine</span> that builds toward real-life goals: <span className="font-semibold">Tier 1:</span> Groceries, gas, utilities → <span className="font-semibold">Tier 2:</span> Gaming gear, peripherals → <span className="font-semibold">Tier 3:</span> Tech upgrades, investing → <span className="font-semibold">Tier 4:</span> Fractional real estate → <span className="text-primary font-bold">Your First House</span>.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-2 text-primary">Wealth Engine Roadmap</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Immediate Needs (NOW):</strong> Groceries, gas, utilities - real help, real life</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Gaming Lifestyle:</strong> Peripherals, headsets, gaming chairs - upgrade your setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Major Purchases:</strong> PCs, consoles, monitors - professional-grade equipment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <span><strong>Property Investment (FUTURE):</strong> Fractional real estate → Down payments → <span className="text-primary font-bold">Homeownership</span></span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-950/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  Gaming = The ONLY Universal Sport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">No Barriers, Ever:</strong> NBA taught me basketball excellence but also showed me its limits. <span className="text-emerald-400 font-semibold">You can't play basketball if you're 5'2". You can't run track without functioning legs. You can't swim competitively without access to pools.</span> Gaming breaks ALL of these barriers.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">True Global Equality:</strong> Gaming transcends race, language, class, background, geography, and genetics. <span className="font-semibold text-foreground">ANYBODY can compete.</span> ANYWHERE. With EQUAL opportunity for excellence. <span className="text-primary font-bold">That deserves professional-level rewards.</span>
                </p>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-3 text-emerald-400">NBA Players Get It</h4>
                  <p className="text-sm text-muted-foreground mb-3">Professional athletes understand performance, stats, highlights, competitive drive. <span className="text-foreground font-semibold">NBA players love gaming too.</span> GG Loop speaks their language:</p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">✓ Stats matter (like box scores)</p>
                      <p className="font-medium text-foreground">✓ Performance earns rewards (like contracts)</p>
                      <p className="font-medium text-foreground">✓ Excellence recognized (like MVP awards)</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">✓ Skill over time (smart training wins)</p>
                      <p className="font-medium text-foreground">✓ Balanced approach (rest = part of game)</p>
                      <p className="font-medium text-foreground">✓ Long-term career building (wealth engine)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-950/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-orange-400" />
                  Health & Balance Built Into The System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Hard Rule:</strong> <span className="text-orange-400 font-bold">"Reward excellence. Respect humanity."</span> We will NEVER build addiction mechanics. NEVER reward excessive hours. NEVER promote unhealthy gaming.
                </p>
                <div className="space-y-4 mt-4">
                  <div className="border-l-2 border-orange-400 pl-4">
                    <h4 className="font-semibold mb-1">Reward SMART Play, Not LONG Play</h4>
                    <p className="text-sm text-muted-foreground">
                      Like NBA training: quality {'>'}  quantity. <span className="font-semibold text-foreground">Fixed monthly points mean you don't grind 16-hour sessions.</span> You earn through membership, not exhaustion. Skill matters more than time logged.
                    </p>
                  </div>
                  <div className="border-l-2 border-orange-400 pl-4">
                    <h4 className="font-semibold mb-1">Breaks, Sleep, Gym = Part of the System</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional athletes rest. Gamers should too. <span className="text-orange-400 font-semibold">GG Loop rewards balanced excellence.</span> Take breaks. Hit the gym. Get sleep. <span className="font-semibold text-foreground">Mental clarity beats burnout.</span>
                    </p>
                  </div>
                  <div className="border-l-2 border-orange-400 pl-4">
                    <h4 className="font-semibold mb-1">No Addiction, Ever</h4>
                    <p className="text-sm text-muted-foreground">
                      We check every feature against this: <span className="text-foreground font-semibold">"Does this respect human health and balance?"</span> If no, we redesign it. <span className="text-orange-400 font-bold">Your well-being {'>'}  our metrics.</span>
                    </p>
                  </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">Built for Sustainable Careers</h4>
                  <p className="text-sm text-muted-foreground">
                    You can't earn a house through gaming if you burn out in 6 months. <span className="font-semibold text-foreground">GG Loop is designed for LONG-TERM wealth building through BALANCED gameplay.</span> Like any professional career.
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
                <Home className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our North Star</CardTitle>
              <CardDescription>
                Build the world's first digital salary system where gamers can earn enough to buy a HOUSE through gameplay
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle>Our Values</CardTitle>
              <CardDescription>
                Gaming = the ONLY sport where EVERYBODY can compete equally. No barriers. No genetics. Just skill.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>Our Commitment</CardTitle>
              <CardDescription>
                Reward excellence. Respect humanity. No addiction mechanics. Health and balance built into every feature.
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
