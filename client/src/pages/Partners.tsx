import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Target,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  Mail,
  Lock,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Partners() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    message: ""
  });

  // Check sponsor eligibility
  const { data: eligibilityData } = useQuery<{
    eligible: boolean;
    verifiedPoints: number;
    desktopVerified: boolean;
    fraudScore: number;
  }>({
    queryKey: ["/api/sponsors/eligibility"],
    enabled: isAuthenticated,
  });

  const isEligible = eligibilityData?.eligible || false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create mailto link with form data
    const subject = encodeURIComponent(`Partnership Inquiry from ${formData.company}`);
    const body = encodeURIComponent(
      `Company: ${formData.company}\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );

    window.location.href = `mailto:info@ggloop.io?subject=${subject}&body=${body}`;

    toast({
      title: "Opening email client",
      description: "Your default email app will open with the partnership inquiry."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50" data-testid="badge-partnerships">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Brand Partnerships</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight" data-testid="text-hero-title">
            THE 'NIL' MODEL FOR
            <span className="text-primary"> GAMERS</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Reach the most engaged demographic in the world by becoming their sponsor, not just their advertiser.
          </p>

          <Button
            className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-bold"
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Inquire About Pilots
          </Button>
        </div>
      </section>

      {/* Sponsor Access Gating */}
      {!isEligible && isAuthenticated ? (
        <section className="container mx-auto px-4 py-24">
          <Card className="max-w-3xl mx-auto bg-muted/10 border-primary/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10 border border-primary/30">
                  <Lock className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-4">
                Sponsor Options Locked
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground text-center">
                You'll unlock sponsorship options after verified gameplay milestones.
              </p>

              <div className="bg-background/50 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-bold mb-4">Requirements to Unlock:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">10,000+ Verified Points</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {eligibilityData?.verifiedPoints || 0} points
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Desktop App Verification</div>
                      <div className="text-sm text-muted-foreground">
                        {eligibilityData?.desktopVerified ? "✓ Verified" : "Pending - Install desktop app"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Fraud Risk Score ≤ 30</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {eligibilityData?.fraudScore || 0}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => window.location.href = '/stats'}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  View Your Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {/* The Problem */}
          <section className="container mx-auto px-4 py-16 bg-muted/10 border-y border-white/5">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">GAMERS HATE ADS. THEY LOVE SPONSORS.</h2>
              <p className="text-lg text-gray-400">
                Traditional ad spend in gaming is dying. Ad-blockers are standard. But every gamer dreams of being 'sponsored.' We turned that dream into a scalable platform.
              </p>
            </div>
          </section>

          {/* The Solution */}
          <section className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-heading mb-4">
                INTRODUCING: CHOOSE YOUR SPONSOR
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                On GG LOOP, players don't just see your logo. They pledge allegiance to it. They sign up as 'Team [Your Brand]' and earn points specifically to redeem your products.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    Zero Integration Tax
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We handle the tech. You don't need to build APIs or dashboards. We track the gameplay; you provide the rewards.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    Capped Reward Pools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You control the budget. Set a specific number of gift cards or products for the pilot. No runaway costs.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    Verified Humans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No bot traffic. Just real competitive gamers grinding for rewards, verified manually by our team.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* Contact Form */}
      <section id="contact-form" className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading mb-4">
              Start Your Scouting Report
            </h2>
            <p className="text-lg text-muted-foreground">
              We are currently accepting pilot partners for Q1.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  data-testid="input-company"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message / Pilot Interest</Label>
                <Textarea
                  id="message"
                  data-testid="textarea-message"
                  placeholder="Tell us about your brand goals..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                data-testid="button-submit-partnership"
              >
                <Mail className="mr-2 h-5 w-5" />
                Inquire About Pilots
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Or email us directly at{" "}
            <a
              href="mailto:info@ggloop.io"
              className="text-primary hover:underline"
            >
              info@ggloop.io
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
