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
          <p className="text-muted-foreground mt-2 ml-4">Last Updated: November 18, 2025</p>
        </div>

        <Card className="p-8 space-y-6 border-primary/20">
          <section>
            <p className="text-muted-foreground">
              Welcome to GG LOOP ("GG LOOP," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of our website, services, and features available at ggloop.io (the "Platform").
            </p>
            <p className="text-muted-foreground mt-4">
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, do not use GG LOOP.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Eligibility</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>You must be at least 13 years old (or the minimum age of digital consent in your country) to use GG LOOP.</li>
              <li>If you are under the age of majority in your jurisdiction, you may only use the Platform with permission from a parent or legal guardian.</li>
              <li>You are responsible for ensuring that using GG LOOP and participating in any rewards programs is lawful in your region.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Description of the Service</h2>
            <p className="text-muted-foreground mb-3">
              GG LOOP is a gaming rewards platform that allows players of supported games (such as League of Legends and Valorant) to earn points and rewards based on verified in-game activity, such as match wins, participation in events, and other actions.
            </p>
            <p className="text-muted-foreground mb-3">Key features may include:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Account creation and player profiles</li>
              <li>Verification of in-game accounts using third-party APIs</li>
              <li>Points, tiers, or subscription-based access</li>
              <li>Rewards such as digital gift cards, gaming gear, or sponsor perks</li>
              <li>Community features, leaderboards, or challenges</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              GG LOOP is not a gambling platform and does not offer wagering, betting, or games of chance. We may modify, add, or remove features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Accounts and Security</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>To use certain features, you may need to create an account on the Platform. You agree to provide accurate, current, and complete information.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
              <li>You agree to notify us immediately at jaysonquindao@ggloop.io if you suspect any unauthorized use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms or appear to be fraudulent or abusive.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Subscriptions, Payments, and Billing</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>GG LOOP may offer free and paid tiers, including subscription plans with monthly or recurring fees.</li>
              <li>By subscribing to a paid plan, you authorize us and our payment processors to charge the applicable fees to your selected payment method.</li>
              <li>All fees are displayed before purchase and, unless otherwise stated, are non-refundable.</li>
              <li>You may cancel your subscription at any time, but cancellation will typically apply at the end of the current billing period.</li>
              <li>We may change subscription prices or plans. Any changes will be communicated in advance and will only apply to future billing cycles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Points, Rewards, and Limitations</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Points are a virtual reward with no cash value outside of the Platform. They cannot be sold, transferred (except as explicitly allowed by us), or redeemed for cash.</li>
              <li>Earning points may depend on: verified match results, compliance with game rules and Platform rules, subscription tier, or event participation.</li>
              <li>We may impose caps or limits on points or rewards per user.</li>
              <li>We reserve the right to review and reverse points or rewards if we detect fraud, abuse, account sharing, match manipulation, or other suspicious behavior.</li>
              <li>Rewards are provided "as available" and may be subject to third-party terms (e.g., gift card issuers, shipping providers, sponsors).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Use of Third-Party Services and Game APIs</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>GG LOOP may integrate with third-party services (e.g., Riot Games APIs, TikTok, Discord, payment providers).</li>
              <li>Your use of these third-party services is subject to their own terms and policies.</li>
              <li>We are not endorsed by, directly affiliated with, or officially sponsored by Riot Games, TikTok, or any other third party unless explicitly stated.</li>
              <li>Game account verification and match data accuracy depend on these third-party services. We are not responsible for outages, inaccuracies, or changes in their systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Acceptable Use and Community Rules</h2>
            <p className="text-muted-foreground mb-3">You agree not to:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Use GG LOOP for any unlawful, fraudulent, or abusive purpose.</li>
              <li>Manipulate match results, use bots, exploit bugs, or attempt to earn rewards dishonestly.</li>
              <li>Harass, threaten, or abuse other users, or share hateful, discriminatory, or explicit content.</li>
              <li>Reverse engineer, interfere with, or disrupt the Platform or its infrastructure.</li>
              <li>Use multiple accounts or false identities to circumvent limits or bans.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We may suspend or terminate accounts or remove rewards for violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground">
              Platform content (logos, branding, designs, software, etc.) is owned by GG LOOP or its licensors. You get a limited, non-exclusive, non-transferable license to use the Platform for personal, non-commercial purposes. You may not copy, modify, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">User Content</h2>
            <p className="text-muted-foreground">
              You retain ownership of content you submit (e.g., usernames, clips, comments). You grant GG LOOP a non-exclusive, worldwide, royalty-free license to use, display, and reproduce that content to operate and promote the Platform. You represent that your content does not infringe others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Platform is provided "as is" and "as available." We do not guarantee uninterrupted or error-free operation, or the accuracy of match data or reward availability. Your use is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent allowed by law, GG LOOP is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill. Our total liability is limited to the amount you paid us in the last 3 months or USD $50, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless GG LOOP from claims, damages, or expenses arising from your use of the Platform, your violation of these Terms, or your violation of others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your access at any time, especially for violations or fraud. Upon termination, your right to use the Platform ends and unused points or rewards may be forfeited, subject to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Changes to the Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms and will post the updated version with a new "Last Updated" date. Continued use means you accept the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the State of Texas, USA. Disputes will be resolved in the state or federal courts located in Texas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading mb-4">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at <a href="mailto:jaysonquindao@ggloop.io" className="text-primary hover:underline">jaysonquindao@ggloop.io</a> or visit <a href="https://ggloop.io" className="text-primary hover:underline">ggloop.io</a>.
            </p>
          </section>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>By using GG LOOP, you acknowledge that you have read and understood these Terms of Service.</p>
        </div>
      </main>
    </div>
  );
}
