import { Shield, Eye, EyeOff, Lock, Trash2, Download, Server, Globe, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TrustPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                        <Shield className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Trust & <span className="text-green-500">Privacy</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We verify gameplay, not surveil gamers. Here's exactly what we collect, why, and what we never touch.
                    </p>
                </div>

                {/* The Principle */}
                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8 mb-12">
                    <p className="text-2xl font-bold text-center text-green-400">
                        "Everything we collect exists for ONE purpose: proving you're a real human playing games. Nothing more."
                    </p>
                </div>

                {/* What We Collect vs Don't */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* What We Collect */}
                    <Card className="bg-zinc-900 border-green-500/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-green-500" />
                                <h2 className="text-xl font-bold">What We Collect</h2>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <div>
                                        <p className="font-medium">Game process names</p>
                                        <p className="text-sm text-gray-400">To know which game you're playing</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <div>
                                        <p className="font-medium">Session duration</p>
                                        <p className="text-sm text-gray-400">To calculate your playtime</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <div>
                                        <p className="font-medium">Input timing patterns</p>
                                        <p className="text-sm text-gray-400">HOW you move, not WHAT you type</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <div>
                                        <p className="font-medium">Match/achievement results</p>
                                        <p className="text-sm text-gray-400">To award points fairly</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* What We NEVER Collect */}
                    <Card className="bg-zinc-900 border-red-500/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <EyeOff className="w-6 h-6 text-red-500" />
                                <h2 className="text-xl font-bold">What We NEVER Collect</h2>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <div>
                                        <p className="font-medium">Keystrokes (what you type)</p>
                                        <p className="text-sm text-gray-400">Your messages are private</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <div>
                                        <p className="font-medium">Screenshots or recordings</p>
                                        <p className="text-sm text-gray-400">We never see your screen</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <div>
                                        <p className="font-medium">Game memory or RAM</p>
                                        <p className="text-sm text-gray-400">No kernel-level access</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <div>
                                        <p className="font-medium">Webcam, microphone, location</p>
                                        <p className="text-sm text-gray-400">Absolutely never</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Your Rights */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center">Your Data Rights</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-zinc-900 border-white/10 text-center">
                            <CardContent className="p-6">
                                <Download className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                                <h3 className="font-bold mb-2">Download Your Data</h3>
                                <p className="text-sm text-gray-400">Export everything we have about you in one click</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-white/10 text-center">
                            <CardContent className="p-6">
                                <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                <h3 className="font-bold mb-2">Delete Everything</h3>
                                <p className="text-sm text-gray-400">One click to permanently erase all your data</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-white/10 text-center">
                            <CardContent className="p-6">
                                <Eye className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                                <h3 className="font-bold mb-2">See What We Have</h3>
                                <p className="text-sm text-gray-400">Full transparency in your settings dashboard</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Security */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center">How We Protect Your Data</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-white/10">
                            <CardContent className="p-6 flex items-start gap-4">
                                <Lock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold mb-2">Encrypted Everywhere</h3>
                                    <p className="text-sm text-gray-400">TLS 1.3 in transit, AES-256 at rest. Industry standard encryption for all data.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-white/10">
                            <CardContent className="p-6 flex items-start gap-4">
                                <Server className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold mb-2">Secure Infrastructure</h3>
                                    <p className="text-sm text-gray-400">Hosted on AWS with automatic backups, DDoS protection, and 24/7 monitoring.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-white/10">
                            <CardContent className="p-6 flex items-start gap-4">
                                <Globe className="w-8 h-8 text-green-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold mb-2">GDPR Compliant</h3>
                                    <p className="text-sm text-gray-400">Following EU data protection standards, even for players outside Europe.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-white/10">
                            <CardContent className="p-6 flex items-start gap-4">
                                <Heart className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold mb-2">Open Source App</h3>
                                    <p className="text-sm text-gray-400">Our desktop app code is public. <a href="https://github.com/djjrip/gg-loop-platform" className="text-primary underline">Audit it yourself.</a></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Promises */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-center">Our Promises</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will NEVER sell your data</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will NEVER share individual data with publishers</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will NEVER use your data to ban you</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will ALWAYS delete on request within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will ALWAYS show you what we have</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">✓</span>
                            <span>We will ALWAYS be transparent about changes</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <p className="text-gray-400 mb-6">Questions about our data practices?</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <a href="mailto:info@ggloop.io">
                            <Button variant="outline" className="border-white/20">
                                Contact Us
                            </Button>
                        </a>
                        <Link href="/download">
                            <Button className="bg-primary text-black hover:bg-primary/80">
                                Download the App
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
