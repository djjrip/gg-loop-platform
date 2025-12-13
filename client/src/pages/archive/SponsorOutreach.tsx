import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SponsorOutreach() {
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

  const sponsors = [
    {
      id: "gfuel",
      name: "G Fuel",
      contact: "partnerships@gfuel.com",
      altContact: "Use contact form on gfuel.com/pages/sponsorships",
      budget: "$500-2,000/month pilot",
      why: "Gaming energy drinks, huge in League/VALORANT community",
      template: `Subject: G Fuel x GG Loop - Gaming Sponsorship Pilot

Hi G Fuel Partnerships Team,

I'm the founder of GG Loop (ggloop.io), a subscription platform where competitive League of Legends and VALORANT players earn real rewards for verified match wins.

Quick stats:
• 150 active users, 68% paid conversion
• 20+ hours/week average playtime per user
• Direct integration with Riot Games API

Pilot Opportunity:
We'd like to run a 2-week sponsored challenge:
• "Earn 500 bonus G Fuel points for 5 wins with G Fuel in your setup"
• $500-1,000 budget (we fund the bonus points)
• Users share screenshots, tag @GFuelEnergy
• We provide completion analytics + engagement metrics

Our users are exactly your demographic: competitive gamers who already buy energy drinks. This gets G Fuel in front of them during their grind sessions.

Available for a 15-min call this week?

Best,
[Your Name]
Founder, GG Loop
[Your Email]
ggloop.io`,
    },
    {
      id: "razer",
      name: "Razer",
      contact: "sponsorships@razer.com",
      altContact: "LinkedIn: Search 'Razer Sponsorship Manager'",
      budget: "$1,000-5,000/month",
      why: "Gaming peripherals, already sponsors esports teams",
      template: `Subject: Razer Sponsored Challenge - GG Loop Partnership

Hi Razer Sponsorships,

GG Loop is a rewards platform for competitive League and VALORANT players. We turn match wins into real-world rewards.

Our users (150 active, 68% paid subscribers) average 20+ hours/week gameplay and are actively buying gaming peripherals.

Sponsorship Opportunity:
• Sponsored challenge: "Earn 1,000 Razer points for 10 wins"
• $1,000-2,000 pilot budget
• 2-week campaign with performance analytics
• Direct access to your target demographic during purchase decisions

These aren't casual gamers - they're grinding ranked daily and investing in their setups.

Can we schedule a brief call to discuss?

[Your Name]
Founder, GG Loop
[Your Email]
ggloop.io`,
    },
    {
      id: "steelseries",
      name: "SteelSeries",
      contact: "sponsorship@steelseries.com",
      altContact: "Twitter DM: @SteelSeries (they respond)",
      budget: "$500-2,000/month",
      why: "Gaming peripherals, active in League/VALORANT scene",
      template: `Subject: SteelSeries x GG Loop - Sponsored Challenge Pilot

Hello SteelSeries Team,

I'm building GG Loop - a platform where competitive gamers earn rewards for verified League/VALORANT match wins. We have 150 active users with 68% paid conversion.

Partnership Idea:
• Run a SteelSeries-sponsored challenge
• "Earn 750 bonus points for 5 wins using SteelSeries gear"
• $500-1,500 pilot budget (covers bonus point pool)
• Users post screenshots, tag @SteelSeries
• You get analytics: completion rate, engagement, conversions

Our users are in-market for peripherals - they're serious about competitive play and invest in their setups.

Open to a quick call this week?

Best,
[Your Name]
ggloop.io`,
    },
    {
      id: "discord",
      name: "Discord",
      contact: "partnerships@discord.com",
      altContact: "Apply: discord.com/partners",
      budget: "Partnership (non-cash)",
      why: "Platform integration, community feature promotion",
      template: `Subject: Discord Integration - GG Loop Partnership

Hi Discord Partnerships,

GG Loop is a gaming rewards platform (150 users, 68% conversion) where League/VALORANT players earn real rewards for verified wins.

Integration Opportunity:
• Discord bot: "/report-win" command posts to GG Loop
• Rich embeds showing point earnings in Discord servers
• Server partnerships with gaming communities
• Drives Discord engagement during gaming sessions

Our users already use Discord while gaming. This integration makes Discord the central hub for their competitive grind.

Interested in exploring this?

[Your Name]
Founder, GG Loop
[Your Email]
ggloop.io`,
    },
    {
      id: "logitech",
      name: "Logitech G",
      contact: "LogitechG@logitech.com",
      altContact: "LinkedIn: Search 'Logitech Gaming Partnerships'",
      budget: "$1,000-3,000/month",
      why: "Gaming peripherals, large marketing budget",
      template: `Subject: Logitech G Sponsorship - Competitive Gaming Rewards Platform

Hi Logitech G Team,

GG Loop rewards competitive League of Legends and VALORANT players for verified match wins. We have 150 active users (68% paid conversion) who average 20+ hours/week gameplay.

Sponsorship Proposal:
• Logitech G sponsored challenges
• "Earn 1,000 bonus points using Logitech G gear"
• $1,000-2,000 pilot budget for 2-week campaign
• Performance analytics + user engagement metrics
• Direct access to gamers actively upgrading peripherals

These are serious competitive players investing in their setups - exactly your target market.

Can we schedule a call?

Best,
[Your Name]
Founder, GG Loop
ggloop.io`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Sponsor Outreach Kit</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Ready-to-send emails for gaming brands. Send 5 emails this week, follow up 2x.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Outreach Strategy</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Send all 5 emails on Monday morning (9-11am PST)</li>
                <li>Follow up #1: Wednesday if no response (same thread)</li>
                <li>Follow up #2: Friday with added value ("Here's our analytics dashboard")</li>
                <li>Goal: 1+ pilot commitment by Week 6</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} data-testid={`card-sponsor-${sponsor.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{sponsor.name}</CardTitle>
                    <CardDescription>{sponsor.why}</CardDescription>
                  </div>
                  <Badge variant="outline">{sponsor.budget}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Primary Contact</div>
                    <div className="text-sm text-muted-foreground font-mono">{sponsor.contact}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1">Alternative</div>
                    <div className="text-sm text-muted-foreground">{sponsor.altContact}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Email Template</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(sponsor.template, sponsor.id)}
                      data-testid={`button-copy-${sponsor.id}`}
                    >
                      {copiedId === sponsor.id ? (
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
                    {sponsor.template}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    asChild
                    data-testid={`button-email-${sponsor.id}`}
                  >
                    <a
                      href={`mailto:${sponsor.contact}?subject=${encodeURIComponent(sponsor.template.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(sponsor.template.split('\n').slice(2).join('\n'))}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(sponsor.template, sponsor.id)}
                    data-testid={`button-copy-alt-${sponsor.id}`}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle>Follow-Up Email Template</CardTitle>
            <CardDescription>Use this if no response after 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
{`Subject: Re: [Original Subject]

Hi [Brand] Team,

Following up on my email from Monday about a sponsored challenge pilot.

Quick add: We just hit 175 active users with 70% paid conversion. Happy to share our analytics dashboard showing user engagement patterns.

Is this something your team would be interested in exploring?

[Your Name]`}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
