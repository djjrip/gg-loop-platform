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
          <p className="text-muted-foreground mt-2 ml-4">Last Updated: November 18, 2025</p>
        </div>

        <Card className="p-8 space-y-6 border-primary/20">
          <section>
            <p className="text-muted-foreground">
              GG LOOP ("we," "us," "our") operates the gaming rewards platform available at ggloop.io ("Platform"). This Privacy Policy explains how we collect, use, and protect information when you use the Platform. If you do not agree, please do not use GG LOOP.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">1. Information We Collect</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Account information:</strong> email address, username, and basic profile details you provide.</li>
              <li><strong>Game-related information:</strong> in-game IDs, match data, rank or stats obtained via third-party game APIs (for example, Riot Games APIs).</li>
              <li><strong>Usage data:</strong> pages visited, actions taken on the Platform, device information, IP address, and general location (city/region level).</li>
              <li><strong>Payment information:</strong> handled by our third-party payment processors; we do not store full card numbers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">2. How We Use Information</h2>
            <p className="text-muted-foreground mb-3">We use your information to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Create and manage your GG LOOP account and profile.</li>
              <li>Verify your in-game activity and award points or rewards.</li>
              <li>Operate, maintain, and improve the Platform.</li>
              <li>Prevent fraud, abuse, match manipulation, or security issues.</li>
              <li>Communicate with you about your account, updates, and promotions (where allowed).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">3. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">We may integrate with:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Game APIs (e.g., Riot Games) to fetch match and account data.</li>
              <li>Social platforms (e.g., TikTok, Discord) for login or sharing features.</li>
              <li>Payment providers for processing subscription fees or purchases.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              These third parties have their own privacy policies, and your use of their services is governed by those policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">4. Cookies and Similar Technologies</h2>
            <p className="text-muted-foreground mb-3">
              We may use cookies or similar technologies to remember your preferences, keep you logged in, and understand how users interact with the Platform. You can usually manage cookies through your browser settings, but disabling them may impact some features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">5. Data Sharing</h2>
            <p className="text-muted-foreground mb-3">We may share information with:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Service providers who help us host, operate, analyze, or support the Platform.</li>
              <li>Partners, sponsors, or reward providers when needed to deliver rewards.</li>
              <li>Authorities or third parties when required by law or to protect our rights, users, or the public.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We keep your information for as long as needed to operate the Platform, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">7. Your Choices</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>You can update or correct certain account details in your profile settings.</li>
              <li>You may request deletion of your account by contacting us at jaysonquindao@ggloop.io.</li>
              <li>You may opt out of certain marketing communications by following the instructions in those messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">8. Security</h2>
            <p className="text-muted-foreground">
              We use reasonable technical and organizational measures to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              GG LOOP is not intended for children under 13 (or the minimum age of digital consent in your region). If we learn that we have collected personal information from a child without appropriate consent, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will post the updated version on the Platform and update the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, contact us at <a href="mailto:jaysonquindao@ggloop.io" className="text-primary hover:underline">jaysonquindao@ggloop.io</a> and include "Privacy" in the subject line.
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
