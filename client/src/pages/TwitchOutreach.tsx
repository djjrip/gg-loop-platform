import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TwitchOutreach() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "Message template ready to paste",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const twitchMessage = `Hey [Name]! 👋

I'm building GG Loop - a platform where competitive League/VALORANT players like you can earn real rewards (gift cards, gaming gear) for verified match wins.

No need to stream or have viewers - just play ranked, report your wins, and earn points. 

We have 3 tiers:
• Basic: $5/mo → earn up to 500 points/month ($5 in rewards)
• Pro: $12/mo → earn up to 1,200 points/month ($12 in rewards)
• Elite: $25/mo → earn up to 2,500 points/month ($25 in rewards)

PLUS sponsor challenges where you can earn bonus points beyond your cap (100% bonus).

Early Bird Offer:
First 100 users get a Founder's Badge + 500 bonus points.

Interested? Check it out: ggloop.io

Would love to have you in the founding cohort!`;

  const discordMessage = `@everyone 

🎮 **Earn Real Rewards for Your League/VALORANT Wins**

GG Loop is a new platform where competitive players can turn match wins into real money.

**How it works:**
1. Subscribe ($5, $12, or $25/month depending on tier)
2. Play ranked League or VALORANT
3. Report your wins (verified via Riot API)
4. Earn points → redeem for Amazon cards, Steam credit, gaming gear

**Early Bird Bonus:**
First 100 users get:
• Founder's Badge on your profile
• 500 bonus points ($5 value)
• Access to exclusive sponsor challenges

No streaming required. No viewer count needed. Just play and earn.

Join: **ggloop.io**

Questions? DM me!`;

  const findStreamersSteps = [
    {
      platform: "Twitch",
      search: "twitch.tv/directory/game/League%20of%20Legends",
      filter: "Sort by viewers: 5-50 average",
      why: "Perfect size - active, engaged, struggling to monetize",
      action: "DM via Twitch or find their Twitter/Discord in bio",
    },
    {
      platform: "Twitch",
      search: "twitch.tv/directory/game/VALORANT",
      filter: "Sort by viewers: 10-100 average",
      why: "VALORANT streamers super engaged, younger demo",
      action: "DM directly on Twitch with template",
    },
    {
      platform: "Discord",
      search: "Gaming servers with 1K-10K members",
      filter: "Search: League, VALORANT, competitive gaming",
      why: "Active communities, can post in partnership channels",
      action: "Ask admins for partnership, post in announcements",
    },
    {
      platform: "Reddit",
      search: "r/leagueoflegends, r/VALORANT, r/summonerschool",
      filter: "Post in weekly threads or create discussion",
      why: "Organic reach, can test messaging",
      action: "Comment on 'how to improve' threads with value + mention",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Twitch Streamer Outreach</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your target users: 5-100 viewer streamers grinding ranked daily. Start inviting TODAY.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Quick Start: Send 20 Invites Today
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to Twitch → Browse League/VALORANT streams</li>
                <li>Filter: 5-50 viewers (sweet spot)</li>
                <li>Copy DM template below, personalize with their name</li>
                <li>Send to 20 streamers TODAY</li>
                <li>Goal: 5-10 signups this week</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Twitch DM Template</span>
              <Badge variant="outline">Copy & Personalize</Badge>
            </CardTitle>
            <CardDescription>Send this to 5-100 viewer streamers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Message (Personalize [Name])</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(twitchMessage, 'twitch')}
                  data-testid="button-copy-twitch"
                >
                  {copiedId === 'twitch' ? (
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
              <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                {twitchMessage}
              </div>
            </div>

            <div className="text-sm space-y-2">
              <h4 className="font-semibold">Personalization Tips:</h4>
              <ul className="ml-6 space-y-1 text-muted-foreground list-disc list-inside">
                <li>Watch their stream for 2 mins, mention something specific they did</li>
                <li>Reference their rank: "Saw you hit Diamond 2 - nice grind!"</li>
                <li>If they have &lt;20 viewers: "You put in the hours, you should earn from it"</li>
                <li>Don't spam - max 20 DMs per day to avoid bans</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Discord Server Message</span>
              <Badge variant="outline">For Gaming Communities</Badge>
            </CardTitle>
            <CardDescription>Post in partnership/announcements channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Discord Announcement</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(discordMessage, 'discord')}
                  data-testid="button-copy-discord"
                >
                  {copiedId === 'discord' ? (
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
              <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap font-mono">
                {discordMessage}
              </div>
            </div>

            <div className="text-sm space-y-2">
              <h4 className="font-semibold">Discord Strategy:</h4>
              <ul className="ml-6 space-y-1 text-muted-foreground list-disc list-inside">
                <li>Find 10-20 gaming Discord servers (1K-10K members)</li>
                <li>DM admins asking for partnership post permission</li>
                <li>Offer: "Happy to give your mods free Elite tier access"</li>
                <li>Post in #partnerships or #announcements channels</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Where to Find Your Target Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {findStreamersSteps.map((step, idx) => (
                <div key={idx} className="border-l-2 border-l-primary pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{step.platform}</h4>
                    <Badge variant="outline" className="text-xs">{step.filter}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-muted-foreground">
                      <strong>Search:</strong> {step.search}
                    </div>
                    <div className="text-muted-foreground">
                      <strong>Why:</strong> {step.why}
                    </div>
                    <div className="text-muted-foreground">
                      <strong>Action:</strong> {step.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle>Weekly Goal: 50 New Signups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Twitch DMs</span>
                <span className="font-semibold">20/day = 100/week</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Discord Server Posts</span>
                <span className="font-semibold">5 servers/week</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Reddit Engagement</span>
                <span className="font-semibold">10 comments/week</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Expected Conversion</span>
                <span className="font-semibold">10-15% → 50 signups</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground pt-2 border-t">
              <strong>Pro Tip:</strong> Track which channel works best. Double down on winners.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
