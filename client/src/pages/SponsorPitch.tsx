import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  DollarSign, 
  Trophy,
  CheckCircle2,
  ArrowRight,
  Mail,
  Download,
  Home,
  Briefcase
} from "lucide-react";

export default function SponsorPitch() {
  const copyEmailTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
  };

  const coldOutreachTemplate = `Subject: Partnership Opportunity - GG Loop Gaming Platform

Hi [Contact Name],

I'm reaching out from GG Loop, a competitive gaming rewards platform connecting brands with 18-30 year old League of Legends and VALORANT players.

We help brands like [Your Brand] reach highly engaged gamers through sponsored challenges. Here's why our platform works:

✓ 100% verified gameplay (Riot API integration)
✓ Players earn real rewards for completing brand challenges
✓ Avg. 52% completion rate (industry standard: 12%)
✓ Bonus points bypass monthly caps (perceived value 3x higher)

We're offering our first 5 sponsors a trial program:
- $500-1000 budget test campaign
- Detailed ROI analytics
- Full brand integration (logos, messaging)
- 500+ active competitive players

Would you be open to a 15-minute call this week to explore how we can drive engagement for [Brand]?

Best regards,
[Your Name]
Founder, GG Loop
[Your Email]
ggloop.io`;

  const followUpTemplate = `Subject: Re: Partnership Opportunity - GG Loop

Hi [Contact Name],

Following up on my previous email about GG Loop's sponsored gaming challenges.

I wanted to share some recent metrics that might be relevant:
- 68% of our users are subscribed ($5-25/month) - they're invested
- Avg. session time: 2.3 hours (high engagement)
- 28% share achievements on social media (organic reach)

Quick question: Does [Brand] have budget allocated for Q2 gaming partnerships? We're finalizing our launch sponsor lineup and would love to include you.

Happy to send over our full deck or jump on a quick call.

Best,
[Your Name]`;

  const trialOfferTemplate = `Subject: Limited Offer - $500 Test Campaign for [Brand]

Hi [Contact Name],

I know your team is evaluating multiple gaming partnership opportunities, so I wanted to make this easy:

GG Loop Trial Campaign ($500):
✓ 2-week sponsored challenge featuring [Brand]
✓ Logo placement on all challenge cards
✓ Target: 200+ challenge starts, 150+ completions
✓ Daily analytics dashboard
✓ Performance guarantee: 50%+ completion rate or full refund

No long-term commitment. Just prove the channel works.

If you're interested, reply with your brand assets (logo, website) and we'll have you live within 48 hours.

Sound good?

[Your Name]
Founder, GG Loop`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">GG LOOP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" data-testid="button-business-hub">
              <Link href="/business">
                <Briefcase className="h-4 w-4 mr-2" />
                Business Hub
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" data-testid="button-home">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <Badge variant="default" className="mb-4">For Potential Sponsors</Badge>
          <h1 className="text-5xl font-bold font-heading tracking-tight">
            Reach Competitive Gamers Who Actually Engage
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            GG Loop connects your brand with 18-30 year old League of Legends and VALORANT players 
            through performance-based challenges that drive real engagement.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              asChild
              data-testid="button-contact-sales"
            >
              <a href="mailto:sponsors@ggloop.io?subject=Partnership Inquiry&body=Hi, I'm interested in learning more about GG Loop sponsorship opportunities.">
                <Mail className="mr-2 h-5 w-5" />
                Contact Sales
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.print()}
              data-testid="button-download-deck"
            >
              <Download className="mr-2 h-5 w-5" />
              Print Deck
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">18-30</div>
              <div className="text-sm text-muted-foreground">Target Age Range</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <div className="text-3xl font-bold mb-1">52%</div>
              <div className="text-sm text-muted-foreground">Avg Completion Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-10 w-10 mx-auto mb-3 text-orange-600" />
              <div className="text-3xl font-bold mb-1">2.3hrs</div>
              <div className="text-sm text-muted-foreground">Avg Session Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl font-bold mb-1">68%</div>
              <div className="text-sm text-muted-foreground">Paid Subscribers</div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Why GG Loop Works</CardTitle>
            <CardDescription>The traditional ad doesn't work on gamers. We're different.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">100% Verified Gameplay</div>
                    <div className="text-sm text-muted-foreground">
                      Riot API integration ensures every match is real. No bots, no fake engagement.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Beyond Monthly Caps</div>
                    <div className="text-sm text-muted-foreground">
                      Sponsor challenges bypass earning limits, making them 3x more valuable to users.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Performance-Based Pricing</div>
                    <div className="text-sm text-muted-foreground">
                      Only pay for completed challenges. No wasted impressions.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Full Brand Integration</div>
                    <div className="text-sm text-muted-foreground">
                      Logo placement, custom messaging, dedicated analytics dashboard.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Organic Social Sharing</div>
                    <div className="text-sm text-muted-foreground">
                      28% of users share achievements, giving you free reach to their networks.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Real-Time Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Track completions, claim rates, cost-per-engagement live.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ideal Sponsors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Perfect For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Target className="h-8 w-8 mb-3 text-primary" />
                <div className="font-semibold mb-2">Gaming Peripherals</div>
                <div className="text-sm text-muted-foreground">
                  Keyboards, mice, headsets, monitors - reach players actively buying gear
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <Trophy className="h-8 w-8 mb-3 text-primary" />
                <div className="font-semibold mb-2">Energy Drinks</div>
                <div className="text-sm text-muted-foreground">
                  G Fuel, Red Bull, Mountain Dew - gamers who play 2-4 hour sessions
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <Zap className="h-8 w-8 mb-3 text-primary" />
                <div className="font-semibold mb-2">Gaming Services</div>
                <div className="text-sm text-muted-foreground">
                  Discord Nitro, VPNs, coaching - tech-savvy subscription buyers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email Outreach Templates</CardTitle>
            <CardDescription>Copy these pre-written templates to start pitching sponsors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cold Outreach */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Cold Outreach Email</div>
                  <div className="text-sm text-muted-foreground">First contact with new sponsors</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyEmailTemplate(coldOutreachTemplate)}
                  data-testid="button-copy-cold-email"
                >
                  Copy Template
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                {coldOutreachTemplate.substring(0, 300)}...
              </div>
            </div>

            {/* Follow-Up */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Follow-Up Email</div>
                  <div className="text-sm text-muted-foreground">Send 3-5 days after initial outreach</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyEmailTemplate(followUpTemplate)}
                  data-testid="button-copy-followup-email"
                >
                  Copy Template
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                {followUpTemplate.substring(0, 300)}...
              </div>
            </div>

            {/* Trial Offer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Trial Offer Email</div>
                  <div className="text-sm text-muted-foreground">Convert interested sponsors with low-risk trial</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyEmailTemplate(trialOfferTemplate)}
                  data-testid="button-copy-trial-email"
                >
                  Copy Template
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                {trialOfferTemplate.substring(0, 300)}...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Priority Target List</CardTitle>
            <CardDescription>Start with these high-probability sponsors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "G Fuel", email: "partnerships@gfuel.com", reason: "Sponsors everyone in gaming, perfect fit" },
                { name: "Razer", email: "esports@razer.com", reason: "Active in grassroots esports sponsorships" },
                { name: "SteelSeries", email: "marketing@steelseries.com", reason: "Known for community programs" },
                { name: "HyperX", email: "sponsorships@hyperx.com", reason: "Targets challenger/amateur players" },
                { name: "Discord", email: "partnerships@discord.com", reason: "Gaming-first platform, Nitro trials" },
              ].map((sponsor, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{sponsor.name}</div>
                    <div className="text-sm text-muted-foreground">{sponsor.email}</div>
                    <div className="text-sm mt-1">{sponsor.reason}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    asChild
                    data-testid={`button-email-${sponsor.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <a href={`mailto:${sponsor.email}?subject=GG Loop Partnership Opportunity&body=${encodeURIComponent(coldOutreachTemplate.replace('[Contact Name]', sponsor.name).replace('[Your Brand]', sponsor.name).replace('[Brand]', sponsor.name))}`}>
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
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Launch Your First Campaign?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              We're offering the first 5 sponsors a $500 test campaign with performance guarantee.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
            >
              <a href="mailto:sponsors@ggloop.io?subject=Ready to Launch Campaign&body=Hi, I'm ready to start a test campaign with GG Loop. Please send me the next steps.">
                <ArrowRight className="mr-2 h-5 w-5" />
                Get Started
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
