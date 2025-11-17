import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Clock, DollarSign, Shield, Zap } from "lucide-react";

export default function PaymentProcessorGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Payment Processor Recovery Plan</h1>
        <p className="text-muted-foreground mb-8">
          Stripe restricted GG LOOP due to gaming policies. Here's your complete recovery strategy to get payments live fast.
        </p>

        <Card className="mb-8 border-amber-500/30 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-2">Start with: Lemon Squeezy</p>
            <p className="text-sm text-muted-foreground mb-4">
              Why? Gaming-friendly approval process, typically 2-3 days setup. Get live fast, validate the business, then optimize later.
            </p>
            <div className="flex gap-4">
              <Link href="/lemonsqueezy-setup">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90" data-testid="button-lemonsqueezy">
                  → Lemon Squeezy Setup Guide
                </button>
              </Link>
              <Link href="/stripe-appeal">
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90" data-testid="button-stripe-appeal">
                  Try Stripe Appeal Anyway
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Comparison Matrix</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stripe */}
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Stripe (Rejected)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Approval:</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400"><XCircle className="h-4 w-4 inline mr-2" />Rejected (gaming restrictions)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Fees:</span>
                </div>
                <p className="text-sm">2.9% + $0.30/transaction</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Appeal:</span>
                </div>
                <p className="text-sm">~20-30% success rate</p>
                <p className="text-xs text-muted-foreground">Worth trying if you want lowest fees</p>
              </div>

              <Link href="/stripe-appeal">
                <button className="w-full mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 text-sm" data-testid="button-stripe-appeal-detail">
                  View Appeal Template →
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Lemon Squeezy */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Lemon Squeezy <Badge variant="default" className="ml-2 text-xs">Recommended</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Approval:</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400"><CheckCircle2 className="h-4 w-4 inline mr-2" />Gaming-friendly (48-72 hours)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Fees:</span>
                </div>
                <p className="text-sm">5% + payment processing</p>
                <p className="text-xs text-muted-foreground">Higher, but easiest setup</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Best For:</span>
                </div>
                <p className="text-sm">Getting live FAST</p>
                <p className="text-xs text-muted-foreground">Perfect for validation phase</p>
              </div>

              <Link href="/lemonsqueezy-setup">
                <button className="w-full mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm" data-testid="button-lemonsqueezy-detail">
                  Setup Guide →
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Paddle */}
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                Paddle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Approval:</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400"><CheckCircle2 className="h-4 w-4 inline mr-2" />Gaming-friendly (1-3 days)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Fees:</span>
                </div>
                <p className="text-sm">5% + payment processing</p>
                <p className="text-xs text-muted-foreground">Same as Lemon Squeezy</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Best For:</span>
                </div>
                <p className="text-sm">Long-term stability</p>
                <p className="text-xs text-muted-foreground">Handles tax compliance globally</p>
              </div>

              <Link href="/paddle-setup">
                <button className="w-full mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 text-sm" data-testid="button-paddle-detail">
                  Setup Guide →
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Strategy (3-Step Plan)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">This Week: Apply to Lemon Squeezy</h3>
                <p className="text-sm text-muted-foreground">
                  Apply and get approved within 2-3 days. Start charging customers immediately. Validate your business model.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Parallel Track: Submit Stripe Appeal + Apply to Paddle</h3>
                <p className="text-sm text-muted-foreground">
                  While running on Lemon Squeezy, appeal Stripe and apply to Paddle. One might approve in 1-2 weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Month 2-3: Optimize (If Needed)</h3>
                <p className="text-sm text-muted-foreground">
                  Once at $5k+/month revenue, migrate to Stripe/Paddle to save 2% in fees. Only if approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ: Payment Processor Rejection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Why did Stripe reject GG LOOP?</h3>
              <p className="text-sm text-muted-foreground">
                Stripe has strict policies on gaming/virtual currency platforms. They often classify rewards programs as "gambling-adjacent" even if skill-based.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is this normal for gaming startups?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. Many gaming platforms (Buff.game, Overwolf, etc.) faced similar rejections before finding alternative processors.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Should I give up on Stripe?</h3>
              <p className="text-sm text-muted-foreground">
                No. Try the appeal. But don't wait for it—start with Lemon Squeezy immediately so you can launch on schedule.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I use PayPal instead?</h3>
              <p className="text-sm text-muted-foreground">
                PayPal Business works but has higher fees (~3.5%) and worse developer experience. Lemon Squeezy/Paddle are better options.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
