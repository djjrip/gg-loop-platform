import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StripeAppeal() {
  const { toast } = useToast();

  const appealEmail = `Subject: Appeal: GG LOOP Account Review - Skill-Based Gaming Community Platform

Dear Stripe Support Team,

I am writing to appeal the recent restriction of my Stripe account (acct_1SRQKuB1sv9iRVCE) for GG LOOP.

BUSINESS MODEL CLARIFICATION:

GG LOOP is a skill-based gaming community platform that rewards competitive gameplay in League of Legends and VALORANT. We are NOT a gambling, betting, or pay-to-win service.

Key Compliance Points:

1. NO GAMBLING MECHANICS
   - Users earn points through skilled gameplay (match wins)
   - Zero randomness or chance-based rewards
   - No wagering, betting, or real-money gambling

2. SUBSCRIPTION-BASED MODEL (Like Patreon/Discord Nitro)
   - Basic ($5/mo), Pro ($12/mo), Elite ($25/mo)
   - Subscription = access to rewards program + community features
   - Points CANNOT be purchased - only earned through gameplay

3. RIOT GAMES COMPLIANCE
   - Fully compliant with Riot Games Developer Policies
   - Uses official Riot Games API (approved developer account)
   - No unauthorized modifications or cheating tools

4. REWARDS STRUCTURE
   - Users redeem points for physical goods (gift cards, gaming gear)
   - Transparent point-based rewards catalog
   - Monthly earning caps prevent abuse
   - Similar to Xbox Game Pass Rewards or Twitch Channel Points

5. LEGITIMATE BUSINESS USE CASES
   - Esports team training incentives
   - Gaming community engagement tools
   - Streamer audience retention programs
   - Similar to: Buff.game, Overwolf Rewards, Discord Nitro perks

COMPARABLE STRIPE MERCHANTS:
- Buff.game (loyalty rewards for gaming)
- G2A.com (gaming marketplace)
- Discord (Nitro subscriptions with perks)
- Twitch (subscriptions with channel points)

We are happy to provide:
- Detailed financial projections
- Terms of Service review
- Riot Games API approval documentation
- Sample user flows and screenshots

This is a legitimate SaaS business serving the $200B+ gaming industry. We respectfully request a manual review of our account.

Thank you for your consideration.

Best regards,
[Your Name]
GG LOOP Founder
Email: info@ggloop.io
Stripe Account: acct_1SRQKuB1sv9iRVCE`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appealEmail);
    toast({
      title: "Copied to clipboard!",
      description: "Email template ready to send to Stripe support",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Stripe Appeal Materials</h1>

        <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Appeal Email Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send this to Stripe support at: <strong>support@stripe.com</strong> or through your Stripe Dashboard
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
{appealEmail}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-background rounded-md hover:bg-accent"
                data-testid="button-copy-appeal"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appeal Success Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Be Professional & Patient</h3>
              <p className="text-sm text-muted-foreground">
                Response times: 3-7 business days. Don't spam multiple appeals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Provide Documentation</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Screenshot of Riot Games API approval</li>
                <li>Terms of Service (emphasize "no gambling")</li>
                <li>Sample user flow showing skill-based earning</li>
                <li>Competitor analysis (Buff.game uses Stripe)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Reposition if Needed</h3>
              <p className="text-sm text-muted-foreground">
                Emphasize "Gaming Community Platform" not "Rewards Platform" in future applications
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Alternative Contact Methods</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Stripe Dashboard → Support Chat</li>
                <li>Twitter: @StripeDev (public visibility sometimes helps)</li>
                <li>Email: support@stripe.com</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Realistic Expectations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Success Rate:</strong> ~20-30% for gaming-related appeals
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Timeline:</strong> 3-7 days for response, up to 2 weeks for final decision
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Backup Plan:</strong> Apply to Paddle or Lemon Squeezy simultaneously (see other tabs)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
