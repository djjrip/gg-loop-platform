import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16 space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-2 ml-4">Last updated: November 10, 2024</p>
        </div>

        <Card className="p-8 space-y-6 border-primary/20">
          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using GG Loop ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">2. Age Requirement</h2>
            <p className="text-muted-foreground mb-2">
              You must be at least 18 years of age to use this Service. By using the Service, you represent and warrant that you are at least 18 years old.
            </p>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-semibold">⚠️ IMPORTANT: Users under 18 are prohibited from using this platform.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">3. Subscription and Payments</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Subscriptions are billed monthly at $5/month (Basic) or $10/month (Premium)</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellations take effect at the end of the current billing period</li>
              <li><strong>No refunds will be issued for partial months or unused points</strong></li>
              <li>All sales are final - we do not provide refunds for subscription fees or purchased rewards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">4. Points System</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Points are earned through gameplay achievements and subscription benefits</li>
              <li><strong>Points expire 12 months after being awarded</strong></li>
              <li>Points have no cash value and cannot be transferred or sold</li>
              <li>GG Loop reserves the right to adjust point values and expiration policies with 30 days notice</li>
              <li>Point balances are subject to verification and may be adjusted for fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">5. Rewards Redemption</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Rewards are subject to availability and may be substituted with items of equal or greater value</li>
              <li>Reward fulfillment typically occurs within 3-5 business days</li>
              <li>Digital gift cards will be sent to your registered email address</li>
              <li>Physical items will be shipped to the address on file</li>
              <li><strong>Redeemed rewards are final and cannot be exchanged or refunded</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">6. Account Termination</h2>
            <p className="text-muted-foreground">
              GG Loop reserves the right to suspend or terminate accounts for violation of these terms, fraudulent activity, or abuse of the Service. Terminated accounts forfeit all points and rewards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind, either express or implied. GG Loop does not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              GG Loop shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              GG Loop reserves the right to modify these terms at any time. We will notify users of material changes via email. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at: support@ggloop.io
            </p>
          </section>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>By using GG Loop, you acknowledge that you have read and understood these Terms of Service.</p>
        </div>
      </main>
    </div>
  );
}
