import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Zap, Shield, DollarSign } from "lucide-react";

export default function DeveloperAPI() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="border-b border-border bg-gradient-to-b from-background to-muted/20 py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <Code className="h-4 w-4" />
                            <span className="text-sm font-medium">Developer API</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            Gaming Rewards
                            <br />
                            <span className="text-primary">As A Service</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Integrate GG Loop's rewards system into your gaming platform, tournament organizer, or Discord bot. Simple API, powerful features.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8" asChild>
                                <a href="https://github.com/djjrip/gg-loop-platform/blob/main/API_DOCS.md" target="_blank">
                                    View Docs
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                                <a href="/business">Get API Key</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <Card>
                            <CardHeader>
                                <Zap className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>10ms Latency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Award points in real-time. No delays, no lag.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Shield className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Anti-Cheat Built-In</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Desktop verification prevents point farming.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Code className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>5 Min Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">RESTful API. One endpoint. Done.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <DollarSign className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Free to Start</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">10K API calls/month free. No credit card.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Code Example */}
            <section className="py-20 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Simple Integration</h2>

                        <Card className="bg-muted">
                            <CardContent className="p-6">
                                <pre className="text-sm overflow-x-auto">
                                    <code>{`// Award points when tournament ends
const response = await fetch('https://ggloop.io/api/v1/points/award', {
  method: 'POST',
  headers: {
    'X-API-Key': 'gg_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'player_123',
    points: 500,
    reason: 'Tournament 1st Place'
  })
});

const result = await response.json();
// { success: true, newBalance: 2500 }`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">API Pricing</h2>

                    <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Free</CardTitle>
                                <div className="text-3xl font-bold">$0</div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">10K calls/month</p>
                                <Button className="w-full" variant="outline" asChild>
                                    <a href="/business">Get Started</a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pro</CardTitle>
                                <div className="text-3xl font-bold">$99</div>
                                <p className="text-sm text-muted-foreground">/month</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">100K calls/month</p>
                                <Button className="w-full" asChild>
                                    <a href="/business">Get Started</a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Business</CardTitle>
                                <div className="text-3xl font-bold">$499</div>
                                <p className="text-sm text-muted-foreground">/month</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">1M calls/month</p>
                                <Button className="w-full" asChild>
                                    <a href="/business">Get Started</a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle>Enterprise</CardTitle>
                                <div className="text-3xl font-bold">Custom</div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">Unlimited + SLA</p>
                                <Button className="w-full" variant="outline" asChild>
                                    <a href="/business">Contact Sales</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}
