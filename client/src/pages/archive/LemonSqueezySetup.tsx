import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ExternalLink, CheckCircle2 } from "lucide-react";

export default function LemonSqueezySetup() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Lemon Squeezy Integration Guide</h1>

        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Why Lemon Squeezy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Gaming-Friendly:</strong> Better approval rates for SaaS/gaming than Stripe</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Fast Setup:</strong> Usually approved in 48-72 hours</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Developer-Friendly:</strong> Clean API, excellent docs</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Handles Taxes:</strong> Automatic global tax compliance</p>
            <p className="text-sm"><strong>Fees:</strong> 5% + payment processing (vs Stripe's 2.9%)</p>
            <p className="text-sm"><strong>Strategy:</strong> Start here to launch fast, migrate to Stripe/Paddle later if needed</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: Sign Up (Fastest Option)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Create Account:</h3>
              <a 
                href="https://www.lemonsqueezy.com/signup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
                data-testid="link-lemonsqueezy-signup"
              >
                https://www.lemonsqueezy.com/signup
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Application Tips:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Store Name:</strong> GG LOOP</li>
                <li><strong>Category:</strong> Software/SaaS (NOT Gaming/Entertainment)</li>
                <li><strong>Description:</strong> "Subscription platform for competitive gaming communities"</li>
                <li><strong>Website:</strong> ggloop.io</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What You'll Need:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Business email (not Gmail/personal)</li>
                <li>Website URL (ggloop.io)</li>
                <li>Bank account details for payouts</li>
                <li>Government ID for KYC verification</li>
                <li>Business details (LLC recommended but not required)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Timeline:</strong> Usually approved within 48-72 hours after document submission.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Create Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">In Lemon Squeezy Dashboard:</h3>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                <li>Go to Products → Create Product</li>
                <li>Create 3 subscriptions:
                  <ul className="ml-6 mt-1 list-disc list-inside">
                    <li>GG LOOP Basic - $5/month</li>
                    <li>GG LOOP Pro - $12/month</li>
                    <li>GG LOOP Elite - $25/month</li>
                  </ul>
                </li>
                <li>Enable "Subscription" billing</li>
                <li>Copy the Product IDs (you'll need these)</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: Technical Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Install SDK:</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs">
npm install @lemonsqueezy/lemonsqueezy.js
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Get API Key:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Settings → API → Create New API Key
              </p>
              <p className="text-sm text-muted-foreground">
                Add to your Replit Secrets: <code className="bg-muted px-1 rounded">LEMONSQUEEZY_API_KEY</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Integration Approach:</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lemon Squeezy uses hosted checkout pages. Copy the "Buy Link" URL from each product variant in the dashboard and redirect users to it.
              </p>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// server/routes.ts
// Simple approach: Use Buy Links from Lemon Squeezy dashboard
export async function getCheckoutUrl(tier: string, userId: string) {
  const buyLinks = {
    basic: process.env.LS_BASIC_BUY_LINK,    // Copy from LS dashboard
    pro: process.env.LS_PRO_BUY_LINK,        // Copy from LS dashboard
    elite: process.env.LS_ELITE_BUY_LINK,    // Copy from LS dashboard
  };

  // Append custom data as URL params
  const url = new URL(buyLinks[tier]!);
  url.searchParams.append('checkout[custom][user_id]', userId);
  
  return url.toString();
}

// Advanced: Use SDK createCheckout API - check Lemon Squeezy docs`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 4: Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Setup Webhook:</h3>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                <li>Go to Settings → Webhooks → Add Endpoint</li>
                <li>URL: <code className="bg-muted px-1 rounded">https://ggloop.io/api/lemonsqueezy/webhook</code></li>
                <li>Events to subscribe:
                  <ul className="ml-6 mt-1 list-disc list-inside">
                    <li>order_created</li>
                    <li>subscription_created</li>
                    <li>subscription_updated</li>
                    <li>subscription_cancelled</li>
                  </ul>
                </li>
                <li>Copy the signing secret</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Webhook Handler (Use SDK):</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// server/routes.ts
import crypto from 'crypto';

app.post('/api/lemonsqueezy/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-signature'] as string;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const rawBody = req.body.toString();
  
  // Verify HMAC signature (Lemon Squeezy docs: use signing secret)
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const checksum = Buffer.from(signature, 'utf8');
  
  // Constant-time comparison
  if (digest.length !== checksum.length || !crypto.timingSafeEqual(digest, checksum)) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(rawBody);
  
  // Handle events
  if (event.meta.event_name === 'subscription_created') {
    const userId = event.meta.custom_data?.user_id;
    // Award subscription bonus points
  }
  
  res.json({ received: true });
});

// NOTE: Check Lemon Squeezy docs for latest webhook verification method`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><strong>Approval:</strong> 48-72 hours after KYC submission</p>
            <p className="text-sm"><strong>Setup Time:</strong> 2-3 hours of dev work</p>
            <p className="text-sm"><strong>Best For:</strong> Fast launch with minimal application friction</p>
            <p className="text-sm"><strong>Trade-off:</strong> 5% fees vs Stripe's 2.9%, but saves weeks of approval time</p>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Strategy:</strong> Launch with Lemon Squeezy, validate your business model, then migrate to lower-fee processors once established
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
