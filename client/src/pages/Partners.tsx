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
  Mail
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Partners() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    message: ""
  });

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
    
    window.location.href = `mailto:jaysonquindao@ggloop.io?subject=${subject}&body=${body}`;
    
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
            Reach Gaming's Most
            <span className="text-primary"> Engaged Audience</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Partner with GG Loop to sponsor challenges, reward dedicated gamers, 
            and build authentic connections with your target audience.
          </p>
        </div>
      </section>

      {/* Why Partner */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading mb-4">
            Why Partner With GG Loop?
          </h2>
          <p className="text-lg text-muted-foreground">
            Direct access to passionate, dedicated gamers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-6">
            <CardContent className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Engaged Community</h3>
              <p className="text-sm text-muted-foreground">
                Members actively playing ranked matches and earning rewards
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Targeted Reach</h3>
              <p className="text-sm text-muted-foreground">
                Connect with competitive gamers and aspiring content creators
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Measurable Impact</h3>
              <p className="text-sm text-muted-foreground">
                Track challenge participation and brand engagement metrics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Authentic Connection</h3>
              <p className="text-sm text-muted-foreground">
                Reward players for achievements they already care about
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading mb-4">
            Partnership Opportunities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">
                Sponsored Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create branded challenges with bonus point rewards for specific achievements:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Win streaks and tournament placements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Champion mastery milestones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Seasonal competitive goals</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-8 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">
                Reward Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Feature your products as redemption options in our rewards catalog:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Gaming peripherals and hardware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Software subscriptions and services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Exclusive branded merchandise</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">
                Custom Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Work with our team to create custom partnership campaigns:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Product launches and announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Seasonal promotions and events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Content creator collaborations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading mb-4">
              Let's Work Together
            </h2>
            <p className="text-lg text-muted-foreground">
              Interested in partnering with GG Loop? Get in touch with our partnerships team.
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
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  data-testid="textarea-message"
                  placeholder="Tell us about your partnership ideas..."
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
                Send Partnership Inquiry
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Or email us directly at{" "}
            <a 
              href="mailto:jaysonquindao@ggloop.io" 
              className="text-primary hover:underline"
            >
              jaysonquindao@ggloop.io
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
