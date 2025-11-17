import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function InvestorOutreach() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "Email template ready to paste",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const investors = [
    {
      id: "bitkraft",
      name: "Bitkraft Ventures",
      focus: "Gaming & esports infrastructure",
      checkSize: "$500K-2M seed",
      contact: "Use: bitkraft.vc/contact",
      linkedIn: "Search: Bitkraft Ventures Partner",
      why: "Led Skillz, Battlefy, Mobalytics - perfect fit for gaming rewards",
      template: `Subject: GG Loop - Gaming Rewards Platform ($500K Seed)

Hi [Name],

I'm raising $500K seed for GG Loop - a subscription platform where competitive League/VALORANT players earn real rewards for verified match wins.

Traction (3 months):
• 150 active users, 68% paid conversion ($5-25/mo tiers)
• $1,800 MRR, growing 40% MoM
• Direct Riot Games API integration (anti-abuse built-in)
• Dual revenue: subscriptions + sponsor-funded challenges

Market:
• 42M US core esports audience (Statista)
• $6.5B gaming sponsorship market (Nielsen)
• Solving: 99% of competitive gamers earn $0 despite 20+ hrs/week invested

Use of Funds:
• $200K: User acquisition (Reddit, Discord, Twitch partnerships)
• $150K: Wholesale gift card supplier MOUs + inventory
• $100K: Engineering (mobile app, anti-fraud systems)
• $50K: Runway (6 months to 10K users)

This is Skillz meets Honey for competitive gaming. Happy to send deck + analytics dashboard.

Available for a call this week?

Best,
[Your Name]
Founder, GG Loop
[Email] | ggloop.io`,
    },
    {
      id: "makers",
      name: "Makers Fund",
      focus: "Interactive entertainment",
      checkSize: "$250K-1M seed",
      contact: "team@makersfund.com",
      linkedIn: "Search: Makers Fund Partner Gaming",
      why: "Backed Discord, Genvid, SuperGaming - loves gaming infrastructure plays",
      template: `Subject: GG Loop Seed Round - Competitive Gaming Rewards

Hi Makers Fund Team,

GG Loop turns competitive gaming into real income for League/VALORANT players.

Current State:
• 150 users, 68% converting to paid ($5-25/mo)
• $1,800 MRR, 40% MoM growth
• Riot API verified match tracking
• Sponsor system live (targeting G Fuel, Razer, SteelSeries)

Why Now:
• 42M competitive gamers in US earning $0 despite massive time investment
• Gaming sponsorships hit $6.5B (Nielsen) but 99% goes to top streamers
• We democratize gaming monetization for the 99%

Raising $500K to:
• Scale user acquisition (10K users in 6 months)
• Lock wholesale gift card partnerships
• Build mobile app + anti-fraud systems

Would love to share our deck and metrics dashboard. Open to a call?

[Your Name]
ggloop.io`,
    },
    {
      id: "1up",
      name: "1Up Ventures",
      focus: "Gaming startups",
      checkSize: "$100K-500K pre-seed/seed",
      contact: "hello@1up.vc",
      linkedIn: "Search: 1Up Ventures",
      why: "Early-stage gaming fund, thesis aligns with player-first monetization",
      template: `Subject: 1Up x GG Loop - Gaming Rewards Platform

Hi 1Up Team,

GG Loop is a subscription platform where competitive gamers earn real rewards for verified League/VALORANT wins. We're raising $500K seed.

Metrics (3 months live):
• 150 users, 68% paid conversion
• $1,800 MRR, 40% monthly growth
• 3 subscription tiers: $5, $12, $25/mo
• Sponsor revenue model validated

The Opportunity:
• 42M US competitive gamers spend 20+ hrs/week earning nothing
• We turn gameplay into income via subscriptions + brand sponsorships
• Riot API integration ensures verified, fraud-proof tracking

We're Skillz for competitive multiplayer + Honey's reward aggregation model.

Can we share our deck and discuss?

Best,
[Your Name]
Founder, GG Loop
[Email]`,
    },
    {
      id: "angels",
      name: "Gaming Angels (General)",
      focus: "Individual angel investors",
      checkSize: "$25K-100K checks",
      contact: "Find on: LinkedIn, AngelList, Twitter",
      linkedIn: "Search terms below",
      why: "Faster decisions, strategic value from operator experience",
      template: `Subject: GG Loop - Gaming Rewards Angel Round ($500K)

Hi [Name],

I saw your investment in [their portfolio company] and thought GG Loop might be interesting.

We're a subscription platform where competitive League/VALORANT players earn real rewards for verified match wins.

Quick snapshot:
• 150 users, 68% paid conversion in 3 months
• $1,800 MRR, growing 40% MoM
• Dual revenue: subscriptions ($5-25/mo) + sponsor challenges
• Raising $500K seed ($25K-50K checks)

Problem: 42M competitive US gamers invest 20+ hrs/week but earn $0 unless they're top 1% streamers.

Solution: We verify wins via Riot API, award membership points redeemable for gift cards + gaming gear.

Happy to send deck + share analytics dashboard. Available for a call?

[Your Name]
ggloop.io`,
    },
  ];

  const angelTargets = [
    { name: "Search: 'Gaming Angel Investor' + 'Twitch'", reason: "Twitch early employees/investors" },
    { name: "Search: 'Riot Games' + 'Angel Investor'", reason: "Former Riot execs turned angels" },
    { name: "Search: 'FaZe Clan' + 'Investor'", reason: "Esports org investors" },
    { name: "Search: 'Discord' + 'Early Employee'", reason: "Gaming platform operators" },
    { name: "AngelList: Gaming + Esports tags", reason: "Active gaming angels" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Investor Outreach Kit</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Ready-to-send emails for gaming VCs and angel investors. Personalize with your metrics.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Outreach Strategy</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Research: LinkedIn + Crunchbase for recent gaming deals</li>
                <li>Warm intro &gt; Cold email (ask network for intros first)</li>
                <li>Send 10 emails/week, follow up 2x over 2 weeks</li>
                <li>Goal: 3 investor calls by Week 4</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {investors.map((investor) => (
            <Card key={investor.id} data-testid={`card-investor-${investor.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{investor.name}</CardTitle>
                    <CardDescription>{investor.focus}</CardDescription>
                  </div>
                  <Badge variant="outline">{investor.checkSize}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold mb-1">Contact</div>
                    <div className="text-muted-foreground">{investor.contact}</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">LinkedIn Research</div>
                    <div className="text-muted-foreground">{investor.linkedIn}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="font-semibold mb-1">Why This Investor</div>
                    <div className="text-muted-foreground">{investor.why}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Email Template</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(investor.template, investor.id)}
                      data-testid={`button-copy-${investor.id}`}
                    >
                      {copiedId === investor.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
                    {investor.template}
                  </div>
                </div>

                <Button
                  onClick={() => copyToClipboard(investor.template, investor.id)}
                  data-testid={`button-copy-alt-${investor.id}`}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Finding Angel Investors</CardTitle>
            <CardDescription>LinkedIn search strategies to find gaming angels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {angelTargets.map((target, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{target.name}</div>
                    <div className="text-muted-foreground">{target.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle>Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span>Update [Your Name], [Email], and metrics before sending</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span>Research their recent investments on Crunchbase/LinkedIn first</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span>Mention 1-2 of their portfolio companies in your email</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span>Ask your network for warm intros to these funds</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span>Follow up after 3-4 days if no response (short, value-add message)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
