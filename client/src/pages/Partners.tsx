import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, Code, ShieldCheck, Zap, Mail, AlertCircle } from "lucide-react";

export default function Partners() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
                {/* HERO */}
                <div className="text-center mb-16">
                    <Badge className="bg-ggloop-orange/20 text-ggloop-orange hover:bg-ggloop-orange/30 mb-4 border-ggloop-orange/50">PARTNER API BETA</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
                        The <span className="text-ggloop-rose-gold">Infrastructure of Trust</span> for Your Platform
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Integrate GG LOOP's Verified Player Protocol directly into your tournament platform, recruitment tool, or matchmaking engine.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <a href="mailto:info@ggloop.io?subject=API Key Request">
                            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold">
                                <Mail className="mr-2 h-4 w-4" />
                                Request API Key
                            </Button>
                        </a>
                        <Link href="/vision">
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">View Our Vision</Button>
                        </Link>
                    </div>
                </div>

                {/* BETA NOTICE */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-12 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-300 font-medium">Beta API</p>
                        <p className="text-yellow-200/70 text-sm">
                            Our Partner API is in beta. Contact us at{' '}
                            <a href="mailto:info@ggloop.io" className="underline">info@ggloop.io</a>
                            {' '}to request access and discuss your integration needs.
                        </p>
                    </div>
                </div>

                {/* FEATURES */}
                <div className="grid md:grid-cols-3 gap-6 mb-24">
                    <Card className="bg-zinc-900 border-white/10">
                        <CardContent className="p-8">
                            <ShieldCheck className="w-10 h-10 text-green-500 mb-6" />
                            <h3 className="text-xl font-bold mb-2">User Verification</h3>
                            <p className="text-gray-400 text-sm">Look up users by email or username to verify they have a GG LOOP account.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-white/10">
                        <CardContent className="p-8">
                            <Zap className="w-10 h-10 text-yellow-500 mb-6" />
                            <h3 className="text-xl font-bold mb-2">Player Stats</h3>
                            <p className="text-gray-400 text-sm">Fetch XP, trust scores, and verification status for matchmaking or rewards.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-white/10">
                        <CardContent className="p-8">
                            <Layout className="w-10 h-10 text-purple-500 mb-6" />
                            <h3 className="text-xl font-bold mb-2">API Key Auth</h3>
                            <p className="text-gray-400 text-sm">Secure access via API keys with rate limiting and usage tracking.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* DOCS */}
                <div className="p-8 md:p-12 bg-zinc-900/50 border border-white/10 rounded-2xl mb-12">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Code className="text-ggloop-orange" /> API Reference</h2>

                    <div className="space-y-12">
                        <div>
                            <h3 className="text-xl font-bold mb-4">1. Verify User</h3>
                            <p className="text-gray-400 mb-4">Check if a user exists in the GG LOOP database.</p>
                            <div className="bg-black p-6 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto text-gray-300">
                                <div className="flex gap-2 mb-2">
                                    <span className="text-purple-400">POST</span>
                                    <span className="text-white">https://ggloop.io/api/partner/verify-user</span>
                                </div>
                                <pre className="text-green-400 mb-2">Header: x-api-key: YOUR_KEY</pre>
                                <pre>{`{
  "email": "player@example.com"
}`}</pre>
                                <pre className="text-gray-500 mt-4">// Response:</pre>
                                <pre className="text-yellow-400">{`{
  "id": "abc123",
  "username": "TopGamer",
  "isVerified": true
}`}</pre>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">2. Get User Status</h3>
                            <p className="text-gray-400 mb-4">Retrieve player stats and verification status.</p>
                            <div className="bg-black p-6 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto text-gray-300">
                                <div className="flex gap-2 mb-2">
                                    <span className="text-blue-400">GET</span>
                                    <span className="text-white">https://ggloop.io/api/partner/user-status/:id</span>
                                </div>
                                <pre className="text-green-400 mb-2">Header: x-api-key: YOUR_KEY</pre>
                                <pre className="text-gray-500 mb-2">// Response:</pre>
                                <pre className="text-yellow-400">{`{
  "userId": "abc123",
  "username": "TopGamer",
  "trustScore": 100,
  "isHardwareVerified": false,
  "totalXp": 0,
  "status": "active"
}`}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-ggloop-orange/20 to-transparent rounded-2xl border border-ggloop-orange/20">
                    <h3 className="text-2xl font-bold mb-4">Ready to integrate?</h3>
                    <p className="text-gray-400 mb-6 text-center max-w-md">
                        Email us to request an API key. We'll set you up within 24 hours.
                    </p>
                    <a href="mailto:info@ggloop.io?subject=API Key Request&body=Hi, I'd like to request an API key for my platform. Here are the details:%0A%0APlatform name:%0AUse case:%0AExpected monthly API calls:%0A">
                        <Button size="lg" className="bg-ggloop-orange text-black hover:bg-orange-400 font-bold">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Us for API Access
                        </Button>
                    </a>
                </div>

            </div>
        </div>
    );
}
