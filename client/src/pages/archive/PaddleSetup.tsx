import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink } from "lucide-react";

export default function PaddleSetup() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Paddle Integration Guide</h1>

        <Card className="mb-6 border-green-500/30 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Why Paddle?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Gaming-Friendly:</strong> Accepts SaaS/gaming businesses</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Handles Tax Compliance:</strong> Automatic VAT/sales tax globally</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Merchant of Record:</strong> They handle chargebacks/disputes/compliance</p>
            <p className="text-sm"><CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" /><strong>Established Platform:</strong> Used by thousands of SaaS companies</p>
            <p className="text-sm"><strong>Fees:</strong> 5% + payment processing (same as Lemon Squeezy)</p>
            <p className="text-sm"><strong>Timeline:</strong> 1-2 weeks approval process with more diligence</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: Application Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Apply Here:</h3>
              <a 
                href="https://www.paddle.com/signup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
                data-testid="link-paddle-signup"
              >
                https://www.paddle.com/signup
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Application Tips:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Business Type:</strong> Select "SaaS" not "Gaming/Gambling"</li>
                <li><strong>Product Description:</strong> "Community platform for competitive gamers with subscription tiers"</li>
                <li><strong>Website:</strong> Use ggloop.io (make sure it's live first)</li>
                <li><strong>Expected Revenue:</strong> $5k-10k/month (realistic for 100-200 subs)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Documents Needed:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Business registration (LLC/Sole Prop)</li>
                <li>Government ID</li>
                <li>Bank account details</li>
                <li>Terms of Service URL</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Technical Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Install Paddle SDK:</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs">
npm install @paddle/paddle-node-sdk
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Create Products in Paddle Dashboard:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Basic Tier - $5/month (recurring)</li>
                <li>Pro Tier - $12/month (recurring)</li>
                <li>Elite Tier - $25/month (recurring)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Integration Code (Backend):</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// server/paddle.ts
import { Paddle } from '@paddle/paddle-node-sdk';

// Initialize SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY!);

// Frontend opens checkout using Paddle.js
// Backend can create subscriptions programmatically:
export async function createSubscription(userId: string, userEmail: string, tier: string) {
  const priceIds = {
    basic: process.env.PADDLE_BASIC_PRICE_ID!,
    pro: process.env.PADDLE_PRO_PRICE_ID!,
    elite: process.env.PADDLE_ELITE_PRICE_ID!,
  };

  // Create customer first (or use existing)
  const customer = await paddle.customers.create({
    email: userEmail,
  });

  // Create subscription
  const subscription = await paddle.subscriptions.create({
    customerId: customer.id,
    items: [{ priceId: priceIds[tier], quantity: 1 }],
    collectionMode: 'automatic',
  });

  return subscription;
}

// Or use Paddle.js on frontend (recommended):
// Paddle.Checkout.open({ items: [{ priceId: 'pri_...', quantity: 1 }] })`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: Webhook Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Paddle Webhook URL:</h3>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                https://ggloop.io/api/paddle/webhook
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Events to Listen For:</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><code>subscription.created</code> - Award subscription bonus points</li>
                <li><code>subscription.updated</code> - Handle tier changes</li>
                <li><code>subscription.canceled</code> - Remove subscription access</li>
                <li><code>payment.succeeded</code> - Confirm payment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><strong>Application Review:</strong> 1-3 business days</p>
            <p className="text-sm"><strong>Account Setup:</strong> 1-2 days after approval</p>
            <p className="text-sm"><strong>Integration Time:</strong> 2-4 hours of dev work</p>
            <p className="text-sm"><strong>Testing:</strong> Use Paddle Sandbox before going live</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
