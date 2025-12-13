import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, TrendingUp, AlertCircle } from "lucide-react";

export default function FounderRoadmap() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">6-Week Validation Roadmap</h1>
          <p className="text-lg text-muted-foreground">
            Focused sprint to validate GG Loop's scalability. Clear success metrics, explicit go/no-go decisions.
          </p>
        </div>

        <Card className="mb-8 border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sprint Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold mb-2">Primary Objective</div>
              <p className="text-sm text-muted-foreground">
                Prove that 68% paid conversion is replicable beyond founding cohort AND secure first sponsor pilot.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-2">Success Criteria (Go Decision)</div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>≥40% paid conversion on cold/paid traffic cohort (100+ signups)</li>
                <li>CAC &lt; $30 for paid tier users</li>
                <li>1+ sponsor pilot live with committed $500+ budget</li>
                <li>Wholesale supplier MOU signed (30%+ discount confirmed)</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">No-Go Criteria (Reassess)</div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>&lt;25% paid conversion on new cohort</li>
                <li>CAC &gt; $50 for paid users</li>
                <li>Zero sponsor interest after 20 outreach emails</li>
                <li>Can't secure 25%+ wholesale discount</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Week 1-2: Validate Conversion Replicability</span>
                <Badge variant="outline">Critical Path</Badge>
              </CardTitle>
              <CardDescription>Prove 68% wasn't a fluke with warm network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Action Items
                </h4>
                <ul className="text-sm space-y-2 ml-6">
                  <li data-testid="text-week1-action1">
                    <strong>Day 1-2:</strong> Set up 3 acquisition experiments:
                    <ul className="ml-4 mt-1 text-muted-foreground list-disc list-inside">
                      <li>Reddit ads on r/leagueoflegends + r/VALORANT ($100 budget each)</li>
                      <li>Discord partnership with 2-3 gaming servers (10K+ members)</li>
                      <li>TikTok organic content (post 5 videos showing point earnings)</li>
                    </ul>
                  </li>
                  <li data-testid="text-week1-action2">
                    <strong>Day 3-7:</strong> Launch campaigns, track signups with UTM codes
                  </li>
                  <li data-testid="text-week1-action3">
                    <strong>Day 8-14:</strong> Analyze conversion funnel:
                    <ul className="ml-4 mt-1 text-muted-foreground list-disc list-inside">
                      <li>Signup → Email verification rate</li>
                      <li>Verified → First match reported rate</li>
                      <li>Active → Paid subscription rate</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Success Metrics
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target New Signups</span>
                    <span className="font-semibold">100-150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Paid Conversion</span>
                    <span className="font-semibold">≥40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acceptable CAC</span>
                    <span className="font-semibold">&lt;$30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Active Before Conversion</span>
                    <span className="font-semibold">Track median</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Week 3-4: Lock Wholesale Suppliers</span>
                <Badge variant="outline">Revenue Foundation</Badge>
              </CardTitle>
              <CardDescription>Validate unit economics assumptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Action Items
                </h4>
                <ul className="text-sm space-y-2 ml-6">
                  <li data-testid="text-week3-action1">
                    <strong>Day 15-16:</strong> Research + contact gift card wholesalers:
                    <ul className="ml-4 mt-1 text-muted-foreground list-disc list-inside">
                      <li>Gift-card wholesalers (e.g., Tremendous) — Tango Card previously considered; mark as future integration</li>
                      <li>CardCash Business</li>
                      <li>GiftCardGranny Bulk</li>
                      <li>CashStar (Blackhawk Network)</li>
                    </ul>
                  </li>
                  <li data-testid="text-week3-action2">
                    <strong>Day 17-21:</strong> Request pricing for $5K monthly volume:
                    <ul className="ml-4 mt-1 text-muted-foreground list-disc list-inside">
                      <li>Amazon Gift Cards (most requested)</li>
                      <li>Steam Wallet codes</li>
                      <li>PlayStation/Xbox</li>
                    </ul>
                  </li>
                  <li data-testid="text-week3-action3">
                    <strong>Day 22-28:</strong> Negotiate terms, request sample order ($500 test)
                  </li>
                  <li data-testid="text-week3-action4">
                    <strong>Goal:</strong> Signed MOU with 2 suppliers showing 30%+ discount at $10K+ monthly volume
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Success Metrics
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MOUs Signed</span>
                    <span className="font-semibold">≥2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmed Discount</span>
                    <span className="font-semibold">≥30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Timeline</span>
                    <span className="font-semibold">&lt;48hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Test Order Completed</span>
                    <span className="font-semibold">Yes/No</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Week 5-6: First Sponsor Pilot</span>
                <Badge variant="outline">Growth Engine</Badge>
              </CardTitle>
              <CardDescription>Prove sponsor model generates incremental revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Action Items
                </h4>
                <ul className="text-sm space-y-2 ml-6">
                  <li data-testid="text-week5-action1">
                    <strong>Day 29-30:</strong> Send outreach emails to 5 sponsor targets (use Outreach Kit)
                  </li>
                  <li data-testid="text-week5-action2">
                    <strong>Day 31-35:</strong> Follow up 2x with non-responders, schedule calls with interested brands
                  </li>
                  <li data-testid="text-week5-action3">
                    <strong>Day 36-38:</strong> Pitch pilot campaign:
                    <ul className="ml-4 mt-1 text-muted-foreground list-disc list-inside">
                      <li>"Earn 500 bonus points for 3 wins using [Brand] product" (user self-reports)</li>
                      <li>$500-1000 pilot budget (covers 1,000-2,000 bonus points)</li>
                      <li>2-week campaign duration</li>
                      <li>Provide completion analytics + brand exposure metrics</li>
                    </ul>
                  </li>
                  <li data-testid="text-week5-action4">
                    <strong>Day 39-42:</strong> Launch pilot, track completion rate + user engagement
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Success Metrics
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sponsor Commitments</span>
                    <span className="font-semibold">≥1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pilot Budget</span>
                    <span className="font-semibold">$500-1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challenge Completion Rate</span>
                    <span className="font-semibold">Track %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sponsor Satisfaction</span>
                    <span className="font-semibold">8+/10</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Burnout Prevention Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p className="font-semibold">Non-Negotiable Rules:</p>
                <ul className="ml-6 space-y-1 text-muted-foreground list-disc list-inside">
                  <li>No work on Sundays (full reset day)</li>
                  <li>Daily shutdown at 8pm (no email checking)</li>
                  <li>Sleep 7+ hours minimum</li>
                  <li>3 meals per day (no skipping to work)</li>
                </ul>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-semibold">Delegate/Automate:</p>
                <ul className="ml-6 space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Customer support: Set up Intercom or Crisp chatbot</li>
                  <li>Reward fulfillment: Virtual assistant ($15/hr) sends codes</li>
                  <li>Social media: Buffer/Hootsuite schedule 1 week in advance</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1">Week 6 Go/No-Go Decision:</p>
                <p className="text-muted-foreground">
                  If metrics hit (40%+ conversion, 1 sponsor, MOU signed) → raise seed round.<br/>
                  If metrics miss → take 2-week break, then decide: pivot, pause, or kill.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
