import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16 space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-2 ml-4">Last updated: November 10, 2024</p>
        </div>

        <Card className="p-8 space-y-6 border-primary/20">
          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We collect the following types of information:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Account Information:</strong> Name, email address, profile picture</li>
              <li><strong>Gaming Data:</strong> Connected gaming accounts, match history, achievements</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li><strong>Device Information:</strong> Browser type, IP address, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">2. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Process subscriptions and reward redemptions</li>
              <li>Track gameplay achievements and award points</li>
              <li>Send service updates and reward fulfillment emails</li>
              <li>Improve platform features and user experience</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Payment Processors:</strong> Stripe for subscription billing</li>
              <li><strong>Gaming Platforms:</strong> To verify achievements and match history</li>
              <li><strong>Service Providers:</strong> Email delivery, analytics, hosting</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">5. Your Rights</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-3">We use cookies and similar technologies to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You can control cookies through your browser settings, but this may limit platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">7. Children's Privacy</h2>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-semibold mb-2">AGE RESTRICTION</p>
              <p className="text-sm text-muted-foreground">
                GG Loop is intended for users 18 years and older. We do not knowingly collect information from anyone under 18. If we discover that a user under 18 has provided personal information, we will immediately delete that data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance, fraud prevention, and dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">9. International Users</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in the United States or other countries where our service providers operate. By using GG Loop, you consent to this transfer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. We will notify you of material changes via email and update the "Last updated" date above. Continued use after changes indicates acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at: privacy@ggloop.io
            </p>
          </section>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Your privacy matters to us. We are committed to protecting your personal information.</p>
        </div>
      </main>
    </div>
  );
}
