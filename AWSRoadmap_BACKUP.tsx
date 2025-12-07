import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Target, Zap, Shield, DollarSign, Users, TrendingUp } from "lucide-react";

export default function AWSRoadmap() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">GG Loop AWS Partnership Roadmap</h1>
                <p className="text-muted-foreground text-lg">
                    Strategic infrastructure plan for Monday's AWS meeting
                </p>
            </div>

            {/* Current State */}
            <Card className="mb-8 border-green-500/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        Current State (What's Built)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">✅ Production Ready</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• React 18 + TypeScript frontend</li>
                            <li>• Node.js + Express backend</li>
                            <li>• PostgreSQL database (Drizzle ORM)</li>
                            <li>• OAuth (Google, Discord, Twitch)</li>
                            <li>• PayPal subscription payments</li>
                            <li>• Admin dashboard + controls</li>
                            <li>• Rewards system + fulfillment</li>
                            <li>• AI marketing automation</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">📊 Current Metrics</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• Status: Pilot/MVP stage</li>
                            <li>• Users: Early beta testers</li>
                            <li>• Revenue: $0 (pre-launch)</li>
                            <li>• Hosting: Railway (current)</li>
                            <li>• Database: Neon PostgreSQL</li>
                            <li>• CDN: CloudFlare (basic)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* AWS Migration Plan */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">AWS Migration Roadmap</h2>

                {/* Phase 1 */}
                <Card className="mb-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                Phase 1: Foundation (Months 1-3)
                            </CardTitle>
                            <Badge variant="outline">Pilot Stage</Badge>
                        </div>
                        <CardDescription>Establish secure, scalable infrastructure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Infrastructure</h4>
                                <ul className="text-sm space-y-1">
                                    <li>✓ ECS Fargate (containers)</li>
                                    <li>✓ RDS PostgreSQL (Multi-AZ)</li>
                                    <li>✓ ElastiCache Redis</li>
                                    <li>✓ S3 (static assets)</li>
                                    <li>✓ CloudFront (CDN)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Security</h4>
                                <ul className="text-sm space-y-1">
                                    <li>✓ Secrets Manager</li>
                                    <li>✓ KMS encryption</li>
                                    <li>✓ WAF (firewall)</li>
                                    <li>✓ Shield (DDoS)</li>
                                    <li>✓ IAM roles</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Monitoring</h4>
                                <ul className="text-sm space-y-1">
                                    <li>✓ CloudWatch logs</li>
                                    <li>✓ X-Ray tracing</li>
                                    <li>✓ SNS alerts</li>
                                    <li>✓ Cost Explorer</li>
                                    <li>✓ Health Dashboard</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                            <p className="text-sm font-semibold">Goal: 1,000 engaged users | 99.9% uptime | Sub-100ms response</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Phase 2 */}
                <Card className="mb-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Phase 2: Scale (Months 4-6)
                            </CardTitle>
                            <Badge variant="outline">Growth Stage</Badge>
                        </div>
                        <CardDescription>Auto-scaling and multi-game expansion</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Auto-Scaling</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• ECS auto-scaling</li>
                                    <li>• RDS read replicas</li>
                                    <li>• Lambda functions</li>
                                    <li>• API Gateway</li>
                                    <li>• Load balancing</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Multi-Game</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Valorant integration</li>
                                    <li>• CS2 integration</li>
                                    <li>• Overwatch2 integration</li>
                                    <li>• Custom games API</li>
                                    <li>• Publisher partnerships</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Optimization</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Reserved instances</li>
                                    <li>• Savings plans</li>
                                    <li>• Spot instances</li>
                                    <li>• Cost optimization</li>
                                    <li>• Performance tuning</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                            <p className="text-sm font-semibold">Goal: 10,000 users | 99.95% uptime | Multi-region ready</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Phase 3 */}
                <Card className="mb-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Phase 3: Enterprise (Year 2)
                            </CardTitle>
                            <Badge variant="outline">Scale Stage</Badge>
                        </div>
                        <CardDescription>Global scale and enterprise features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Global Scale</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Multi-region deployment</li>
                                    <li>• Global accelerator</li>
                                    <li>• Route 53 geo-routing</li>
                                    <li>• Regional RDS</li>
                                    <li>• Edge locations</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Enterprise</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• White-label solution</li>
                                    <li>• Publisher API</li>
                                    <li>• B2B dashboard</li>
                                    <li>• Custom integrations</li>
                                    <li>• SLA guarantees</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Advanced</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• ML recommendations</li>
                                    <li>• Fraud detection</li>
                                    <li>• Real-time analytics</li>
                                    <li>• Data lake (S3)</li>
                                    <li>• Business intelligence</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                            <p className="text-sm font-semibold">Goal: 50,000+ users | 99.99% uptime | $50K/month AWS spend</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AWS Partnership Ask */}
            <Card className="mb-8 border-purple-500/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-purple-500" />
                        AWS Partnership Request
                    </CardTitle>
                    <CardDescription>What we're asking for Monday's meeting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3">1. AWS Credits</h3>
                            <p className="text-sm mb-2">$10,000 - $25,000 for 6-month pilot</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• RDS PostgreSQL (Multi-AZ)</li>
                                <li>• ElastiCache Redis</li>
                                <li>• ECS Fargate compute</li>
                                <li>• S3 + CloudFront CDN</li>
                                <li>• Secrets Manager + KMS</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">2. Technical Partnership</h3>
                            <p className="text-sm mb-2">Assigned solutions architect</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Architecture review</li>
                                <li>• Migration planning</li>
                                <li>• Security audit</li>
                                <li>• Cost optimization</li>
                                <li>• Performance tuning</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">3. Cost Optimization</h3>
                            <p className="text-sm mb-2">40-70% savings potential</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Reserved instances (40% off)</li>
                                <li>• Savings plans (30% off)</li>
                                <li>• Spot instances (70% off)</li>
                                <li>• Right-sizing guidance</li>
                                <li>• Cost monitoring setup</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">4. Marketing & PR</h3>
                            <p className="text-sm mb-2">Joint case study opportunity</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• "Gaming Platform on AWS" blog</li>
                                <li>• Partner directory listing</li>
                                <li>• Joint webinar</li>
                                <li>• Startup showcase</li>
                                <li>• AWS re:Invent demo</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Technical Architecture */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-500" />
                        Proposed AWS Architecture
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 p-6 rounded-lg font-mono text-sm text-green-400">
                        <pre>{`
┌─────────────────────────────────────────────────────────┐
│                    USERS (Global)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Route 53 DNS  │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   CloudFront   │ ◄── S3 (Static Assets)
            │      (CDN)     │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   WAF + Shield │ (Security Layer)
            └────────┬───────┘
                     │
                     ▼
       ┌─────────────────────────┐
       │  Application Load       │
       │  Balancer (ALB)         │
       └─────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐       ┌─────────┐
   │ ECS     │       │ ECS     │  (Auto-scaling)
   │ Task 1  │       │ Task 2  │
   └────┬────┘       └────┬────┘
        │                 │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐       ┌─────────┐
   │   RDS   │       │  Redis  │
   │ Primary │◄─────►│ Cache   │
   └────┬────┘       └─────────┘
        │
        ▼
   ┌─────────┐
   │   RDS   │
   │ Replica │
   └─────────┘

Monitoring: CloudWatch + X-Ray
Secrets: Secrets Manager + KMS
Backups: Automated snapshots to S3
            `}</pre>
                    </div>
                </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-green-500" />
                        Success Metrics & Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                            <h4 className="font-semibold mb-2">Month 3</h4>
                            <ul className="text-sm space-y-1">
                                <li>• 1,000 active users</li>
                                <li>• 99.9% uptime</li>
                                <li>• $500-2000 MRR</li>
                                <li>• AWS migration complete</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-yellow-500/10 rounded-lg">
                            <h4 className="font-semibold mb-2">Month 6</h4>
                            <ul className="text-sm space-y-1">
                                <li>• 10,000 active users</li>
                                <li>• 99.95% uptime</li>
                                <li>• $5,000-10,000 MRR</li>
                                <li>• 3+ games integrated</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg">
                            <h4 className="font-semibold mb-2">Year 2</h4>
                            <ul className="text-sm space-y-1">
                                <li>• 50,000+ active users</li>
                                <li>• 99.99% uptime</li>
                                <li>• $50,000+ MRR</li>
                                <li>• Enterprise partnerships</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                    <strong>Note for AWS Team:</strong> This roadmap represents our strategic vision for scaling GG Loop on AWS infrastructure.
                    We're currently in pilot/MVP stage with early beta testers. All projections are aspirational models based on successful
                    product-market fit validation. We're seeking AWS partnership to establish secure, scalable infrastructure that can grow
                    with our user base.
                </p>
            </div>
        </div>
    );
}
