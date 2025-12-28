import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, CheckCircle, Zap, Shield, Gauge } from "lucide-react";
import { useState } from "react";

export default function Business() {
    const [formData, setFormData] = useState({
        orgName: "",
        email: "",
        website: "",
        memberCount: "",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Send to your backend or email service
        try {
            const response = await fetch('/api/business-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to submit:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/20">
                <div className="container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm font-medium">For Esports Organizations</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            White-Label
                            <br />
                            <span className="text-primary">Gaming Rewards</span>
                            <br />
                            For Your Community
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Deploy a fully branded rewards platform for your esports org, gaming community, or tournament platform in 2 weeks.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                                Request Demo
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                                <a href="https://ggloop.io" target="_blank" rel="noopener noreferrer">
                                    See Live Demo
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 border-b border-border">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What You Get</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <Card className="border-border">
                            <CardHeader>
                                <Zap className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Fully Branded</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Your logo, colors, domain. White-labeled platform that looks 100% yours.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <Shield className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Desktop Verification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Tracks 17+ games locally. No API limits. Anti-cheat built-in.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <Gauge className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Admin Dashboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Manage users, rewards, analytics. Auto-fulfillment for redemptions.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Hosted & Managed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">We handle hosting, updates, and support. You focus on your community.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-muted-foreground">One-time setup + monthly hosting. No hidden fees.</p>
                    </div>

                    <Card className="max-w-2xl mx-auto border-primary/50 shadow-lg shadow-primary/10">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl">White-Label Platform</CardTitle>
                            <CardDescription className="text-lg">Everything you need to launch</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-bold">$5,000</span>
                                <span className="text-muted-foreground">one-time setup</span>
                            </div>

                            <div className="text-center">
                                <span className="text-2xl font-bold">+ $1,000/month</span>
                                <p className="text-muted-foreground mt-1">hosting & support</p>
                            </div>

                            <div className="border-t border-border pt-6">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Fully branded platform (your logo, colors, domain)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Desktop verification app with your branding</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Admin dashboard & analytics</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Multi-game support (17+ games)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Auto-fulfillment system</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Hosted on AWS (99.9% uptime)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>2-week deployment timeline</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Request a Demo</h2>
                            <p className="text-xl text-muted-foreground">See the platform in action. We'll set up a personalized demo for your organization.</p>
                        </div>

                        {submitted ? (
                            <Card className="border-primary/50 bg-primary/5">
                                <CardContent className="text-center py-12">
                                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Demo Request Received!</h3>
                                    <p className="text-muted-foreground">We'll contact you within 24 hours to schedule your demo.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="orgName">Organization Name *</Label>
                                            <Input
                                                id="orgName"
                                                required
                                                placeholder="Your Esports Org"
                                                value={formData.orgName}
                                                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                placeholder="contact@yourorg.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                placeholder="https://yourorg.com"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="memberCount">Community Size</Label>
                                            <Input
                                                id="memberCount"
                                                placeholder="e.g., 10,000 Discord members"
                                                value={formData.memberCount}
                                                onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Tell us about your needs</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="What are you looking to build? Any specific requirements?"
                                                className="min-h-32"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" size="lg" className="w-full">
                                            Request Demo
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
