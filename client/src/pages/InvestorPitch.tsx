import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  CheckCircle2,
  Mail,
  Copy,
  ArrowRight,
  Gamepad2,
  Trophy,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const coldInvestorTemplate = `Subject: GG Loop - Gaming Rewards Platform Raising Seed Round

Hi [Investor Name],

I'm the founder of GG Loop, a subscription-based gaming rewards platform solving a real problem: competitive gamers aged 18-30 invest 20+ hours/week into League of Legends and VALORANT but earn nothing unless they're top 1% streamers.

Quick snapshot:
• Dual revenue model: $5-25/month subscriptions + sponsor-funded challenges
• 68% paid conversion in early cohort, n~150 (vs. industry avg 5-10%)
• Dual revenue: subscriptions + sponsor-funded challenges (100% margin)
• Riot Games API integration ensures verified gameplay (anti-abuse built-in)
• Raising $500K seed to scale to 10K users in 6 months

We're targeting the US core esports audience (42M players, Source: Statista 2024) within a $6.5B gaming sponsorship market (Nielsen Sports).

Would love to send over our deck and discuss the opportunity. Available for a call this week?

Best,
[Your Name]
Founder, GG Loop`;

const followUpTemplate = `Subject: Re: GG Loop Seed Round

Hi [Investor Name],

Following up on my previous email about GG Loop's $500K seed round.

Quick update since we last spoke:
• Launched sponsored challenges with 52% completion rate (4x industry standard)
• Platform built with full Riot API integration + anti-abuse systems
• Target pipeline: G Fuel, Razer, SteelSeries for sponsored challenges
• Early cohort showing 2.3 hour avg session time (strong engagement signals)

Our competitive advantage:
1. Verified gameplay (can't fake match wins)
2. Bonus points bypass monthly caps (higher perceived value)
3. Built-in anti-abuse systems (same-day match limits, rate limiting)

The gaming rewards market is fragmented with loyalty programs that don't verify skill. We're the only platform with real-time Riot API integration + sustainable economics.

Can we grab 15 minutes this week to discuss further?

Best,
[Your Name]`;

const targetInvestors = [
  {
    name: "Bitkraft Ventures",
    focus: "Gaming & esports infrastructure",
    email: "team@bitkraft.vc",
    reason: "Led rounds for gaming platforms, focus on competitive gaming ecosystem"
  },
  {
    name: "Galaxy Interactive",
    focus: "Interactive content & gaming",
    email: "info@galaxyinteractive.io",
    reason: "Invested in gaming loyalty/rewards platforms, strong esports thesis"
  },
  {
    name: "1Up Ventures",
    focus: "Gaming & interactive entertainment",
    email: "contact@1upventures.com",
    reason: "Early-stage gaming infrastructure, passion for competitive gaming"
  },
  {
    name: "Play Ventures",
    focus: "Gaming startups",
    email: "hello@play.vc",
    reason: "Seed-stage gaming companies, strong Asia presence (League/VALORANT hotspots)"
  },
  {
    name: "Makers Fund",
    focus: "Interactive entertainment",
    email: "hello@makersfund.com",
    reason: "Gaming platforms at intersection of community & commerce"
  }
];

export default function InvestorPitch() {
  const { toast } = useToast();

  const copyTemplate = (template: string, name: string) => {
    navigator.clipboard.writeText(template);
    toast({
      title: "Copied!",
      description: `${name} template copied to clipboard`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Raising $500K Seed Round
          </div>
          <h1 className="text-5xl font-bold">GG Loop Investor Pitch</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Turning gaming achievements into real-world rewards through a sustainable 
            subscription + sponsorship model targeting 42M core esports fans in the US.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              asChild
              data-testid="button-contact-investor"
            >
              <a href="mailto:invest@ggloop.io?subject=Investment Inquiry&body=Hi, I'm interested in learning more about GG Loop's seed round. Please send me the pitch deck.">
                <Mail className="mr-2 h-5 w-5" />
                Request Pitch Deck
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.print()}
              data-testid="button-print-deck"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Print Overview
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">42M</div>
              <div className="text-sm text-muted-foreground">Core Esports Fans (US)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <div className="text-3xl font-bold mb-1">68%</div>
              <div className="text-sm text-muted-foreground">Paid Conversion</div>
              <div className="text-xs text-muted-foreground mt-1">Early Cohort, n≈150</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl font-bold mb-1">2.3hrs</div>
              <div className="text-sm text-muted-foreground">Avg Session Time</div>
              <div className="text-xs text-muted-foreground mt-1">Early Cohort, n≈150</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-orange-600" />
              <div className="text-3xl font-bold mb-1">52%</div>
              <div className="text-sm text-muted-foreground">Challenge Completion</div>
              <div className="text-xs text-muted-foreground mt-1">Early Cohort, n≈150</div>
            </CardContent>
          </Card>
        </div>

        {/* Problem */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">The Problem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              <strong>42 million core esports fans in the US grind competitive games daily, but 99% earn $0.</strong>
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Struggling Streamers</div>
                  <div className="text-sm text-muted-foreground">
                    Players aged 18-30 invest 20+ hours/week into League of Legends and VALORANT 
                    but can't monetize unless they're top 1% content creators.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Brands Can't Reach Them</div>
                  <div className="text-sm text-muted-foreground">
                    Gaming brands (G Fuel, Razer, SteelSeries) spend billions on influencer marketing 
                    but struggle to authentically engage mid-tier competitive players.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Existing Solutions Are Broken</div>
                  <div className="text-sm text-muted-foreground">
                    Loyalty programs don't verify skill, Twitch requires massive audiences, 
                    tournament prizes are inaccessible to average players.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">The Solution: GG Loop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              <strong>A subscription platform that rewards verified match wins with points redeemable 
              for gift cards, gaming gear, and exclusive rewards.</strong>
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Dual Revenue Model</div>
                  <div className="text-sm text-muted-foreground">
                    Users pay $5-25/month for subscription tiers. Sponsors fund bonus challenges 
                    that bypass monthly earning caps.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Verified Gameplay via Riot API</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time integration with League of Legends and VALORANT ensures users can't 
                    fake wins. Anti-abuse systems prevent exploitation.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Dual Revenue Model</div>
                  <div className="text-sm text-muted-foreground">
                    Subscription MRR ($5-25/user/month) + sponsor-funded challenges (bonus points fully funded by brands). 
                    Reward fulfillment via wholesale gift card partnerships (targeting 30-40% below retail). 
                    Point expiration (12-month window) and partial redemption behavior reduce costs.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Business Model & Unit Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Revenue Streams</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Basic ($5/mo)</span>
                    <span className="font-mono text-sm">500pt cap</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pro ($12/mo)</span>
                    <span className="font-mono text-sm">1,440pt cap</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Elite ($25/mo)</span>
                    <span className="font-mono text-sm">3,750pt cap</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-sm">Sponsor Revenue</span>
                      <span className="text-sm">Variable</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Brands fund bonus challenges at $500-5000/campaign
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Unit Economics (Early Stage)</h3>
                <div className="space-y-3">
                  <div className="text-sm bg-muted/50 p-3 rounded">
                    <strong className="block mb-2">Margin Drivers</strong>
                    <p className="text-muted-foreground text-xs">
                      • Wholesale gift card sourcing (targeting 30-40% below retail)<br/>
                      • Partial redemption behavior (not all users max out monthly caps)<br/>
                      • Point expiration and breakage (12-month expiry window)<br/>
                      • Sponsor-funded bonus challenges (100% margin contribution)<br/>
                      • Tier mix (Elite tier has highest absolute profit per user)
                    </p>
                  </div>
                  <div className="text-sm">
                    <strong>Economic Model</strong>
                    <p className="text-muted-foreground text-xs">
                      Subscription revenue funds base reward pool. Sponsor campaigns add incremental earning opportunities 
                      at 100% margin. Conservative model assumes 70% avg redemption across tiers. Detailed financial 
                      projections available in full deck for interested investors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Opportunity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Market Opportunity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">$2.1B</div>
                <div className="text-sm font-semibold mb-1">US Esports Market (2024)</div>
                <div className="text-xs text-muted-foreground">
                  Source: Newzoo Global Esports Report
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">42M</div>
                <div className="text-sm font-semibold mb-1">US Core Esports Audience</div>
                <div className="text-xs text-muted-foreground">
                  Source: Statista 2024 (18-34 demographic)
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">$6.5B</div>
                <div className="text-sm font-semibold mb-1">Gaming Sponsorship Spend (2024)</div>
                <div className="text-xs text-muted-foreground">
                  Source: Nielsen Sports Gaming Report
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Traction & Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">User Engagement (Early Cohort, n~150)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid Conversion</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Session Time</span>
                    <span className="font-semibold">2.3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Challenge Completion</span>
                    <span className="font-semibold">52%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Social Sharing</span>
                    <span className="font-semibold">28%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Business Metrics (Projected)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CAC (Target)</span>
                    <span className="font-semibold">$15-25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">LTV (12mo Target)</span>
                    <span className="font-semibold">$60-300</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sponsor ARPU (Target)</span>
                    <span className="font-semibold">$0.75-1.25/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Churn (Target)</span>
                    <span className="font-semibold">15-20%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Ask */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <Gamepad2 className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h2 className="text-3xl font-bold mb-3">The Ask: $500K Seed Round</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're raising $500K to scale to 10,000 users in 6 months, launch 5 sponsor partnerships, 
                and expand to additional games (Apex Legends, Fortnite).
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-background/50 backdrop-blur rounded-md p-4">
                <div className="text-2xl font-bold text-primary mb-1">$250K</div>
                <div className="text-sm text-muted-foreground">User Acquisition</div>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-md p-4">
                <div className="text-2xl font-bold text-primary mb-1">$150K</div>
                <div className="text-sm text-muted-foreground">Product Development</div>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-md p-4">
                <div className="text-2xl font-bold text-primary mb-1">$100K</div>
                <div className="text-sm text-muted-foreground">Operations & Runway</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Investor Outreach Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Cold Outreach Template</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyTemplate(coldInvestorTemplate, "Cold Outreach")}
                  data-testid="button-copy-cold-template"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {coldInvestorTemplate}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Follow-Up Template</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyTemplate(followUpTemplate, "Follow-Up")}
                  data-testid="button-copy-followup-template"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {followUpTemplate}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Target Investors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Target Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {targetInvestors.map((investor) => (
                <div key={investor.name} className="flex items-start justify-between gap-4 p-4 border rounded-md hover-elevate">
                  <div>
                    <div className="font-semibold">{investor.name}</div>
                    <div className="text-sm text-muted-foreground mb-1">{investor.focus}</div>
                    <div className="text-sm">{investor.reason}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    asChild
                    data-testid={`button-email-${investor.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={`mailto:${investor.email}?subject=GG Loop - Gaming Rewards Platform Raising Seed Round&body=${encodeURIComponent(coldInvestorTemplate.replace('[Investor Name]', investor.name))}`}>
                      <Mail className="mr-1 h-3 w-3" />
                      Email
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Join the Loop?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Let's discuss how GG Loop can transform competitive gaming into a sustainable 
              revenue channel for millions of players.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
            >
              <a href="mailto:invest@ggloop.io?subject=GG Loop Investment Discussion&body=Hi, I'd love to discuss GG Loop's seed round. When can we connect?">
                <ArrowRight className="mr-2 h-5 w-5" />
                Schedule a Call
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
