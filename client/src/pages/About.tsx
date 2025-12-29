import { Trophy, Target, Heart, Users, Sparkles, TrendingUp, Home, DollarSign, Gamepad2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About GG LOOP</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight" data-testid="heading-about">
            Play. Earn. Loop.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <span className="text-primary font-semibold">A gaming rewards platform built for the players who never felt seen.</span> A place where your grind finally has value.
          </p>
        </section>

        {/* What is GG LOOP */}
        <section className="bg-muted/50 rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-heading">What is GG LOOP?</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                GG LOOP is a gaming rewards platform built for the players who never felt seen. A place where your grind finally has value.
              </p>
              <p>
                A platform created by a <span className="text-primary font-semibold">Filipino-American gamer</span> who grew up on basketball courts, sneakers, and long nights on ranked queues - a place where community was everything.
              </p>
              <p className="text-foreground font-medium">
                GG LOOP exists to bridge gaming culture, esports mentality, and real-world rewards into one loop:<br />
                <span className="text-primary text-2xl font-bold">Play. Earn. Loop.</span>
              </p>
              <p>
                Easy. Honest. Human.
              </p>
              <p>
                We're building something for the everyday gamer, not just pros. Something rooted in culture, identity, and the belief that <span className="text-primary font-semibold">gaming can uplift people, not drain them</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading mb-4" data-testid="heading-mission">
              Our Mission
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg">
              <p className="text-primary font-bold text-2xl">
                To heal the inner gamer - the version of ourselves that just needed a win.
              </p>
              <p className="text-foreground font-medium">
                We create a system where every match, every moment of effort, every ranked climb means something. We want gamers to earn real-world value, build community and feel pride in their grind.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  What We Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-foreground font-semibold">Reward gamers fairly</span> - Your time and skill deserve recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-foreground font-semibold">Make gaming financially accessible</span> - Turn your passion into tangible value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-foreground font-semibold">Build a culture-driven ecosystem</span> - Grounded in streetwear, hoops, and identity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-foreground font-semibold">Give back to players and communities</span> - Support the gamers who support us</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-foreground font-semibold">Create generational empowerment through gaming</span>, not exploitation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-primary font-semibold">Community First</span> - Built by gamers, for gamers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-primary font-semibold">Transparency Always</span> - No hidden agendas or fine print</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-primary font-semibold">Respect Humanity</span> - No addiction mechanics, ever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-primary font-semibold">Real Value</span> - Actual rewards, not crypto promises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                    <span><span className="text-primary font-semibold">Sustainable Growth</span> - Built for the long haul</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="heading-how-it-works">
              How GG Loop Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We operate on a simple membership model designed to be sustainable and rewarding for our community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Play</CardTitle>
                <CardDescription>
                  Download the desktop app and play games normally - we auto-track your sessions in League, Valorant, CS2, and 15+ other games
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Earn</CardTitle>
                <CardDescription>
                  Get monthly point allocations based on your tier, plus bonus points for wins and achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Loop</CardTitle>
                <CardDescription>
                  Redeem points for gaming gear, gift cards, subscriptions, and exclusive rewards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Transparency */}
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

        {/* CTA Section */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold" data-testid="heading-get-started">
            Ready to Start Your Loop?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join GG Loop today and start turning your gaming sessions into tangible rewards. Every match matters, every win counts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/subscription">
              <Button size="lg" data-testid="button-view-plans">
                View Plans
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="button-start-free">
                Sign In
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
