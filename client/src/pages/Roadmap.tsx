import { motion } from "framer-motion";
import { Target, Zap, Globe, Shield, Gift, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function Roadmap() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 to-black"></div>
                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                            ROADMAP
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light">
                            Building a sustainable rewards platform for gamers. Transparency first.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Phase 1: FOUNDATION */}
            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="border border-green-500/30 bg-green-950/10 rounded-xl p-8 mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-green-500/20 p-3 rounded-full">
                                <Zap className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">PHASE 1: FOUNDATION (LIVE NOW)</h2>
                                <p className="text-green-400 font-semibold">Building the Bedrock</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>**Player Profiles:** Basic stat tracking and identity.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>**"Choose Your Sponsor" Beta:** Players can select a brand affinity.</span>
                                </li>
                            </ul>
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>**Manual Rewards:** Real humans fulfilling real rewards. No bots.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>**Community Core:** A verified Discord ecosystem.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Phase 2: PILOTS */}
                    <div className="border border-orange-500/30 bg-orange-950/10 rounded-xl p-8 mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-orange-500/20 p-3 rounded-full">
                                <Target className="h-8 w-8 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">PHASE 2: THE PILOT ERA (NEXT UP)</h2>
                                <p className="text-orange-400 font-semibold">Testing with Real Brands</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-500 font-bold">►</span>
                                    <span>**Brand Pilots:** 30-day challenges with specific partners.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-500 font-bold">►</span>
                                    <span>**Verified Gameplay:** Moving to deeper API connections.</span>
                                </li>
                            </ul>
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-500 font-bold">►</span>
                                    <span>**Referral Leaderboards:** Incentivizing community "Scouts".</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-orange-500 font-bold">►</span>
                                    <span>**Team Queues:** Rewards for squad play.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Phase 3: ECOSYSTEM */}
                    <div className="border border-gray-700 bg-gray-900/10 rounded-xl p-8 opacity-80">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gray-700/50 p-3 rounded-full">
                                <Globe className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-300">PHASE 3: THE ECOSYSTEM</h2>
                                <p className="text-gray-500 font-semibold">Future Vision</p>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6 italic">
                            "Where competitive gaming meets sustainable income."
                        </p>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="opacity-50">•</span>
                                <span>Direct-to-Bank Payouts (Partnered Fintech)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="opacity-50">•</span>
                                <span>Pro-Tier Scouting for Esports Orgs</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="opacity-50">•</span>
                                <span>Physical Events & LANs</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-black text-white mb-6">Build With Us</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        We are building this platform openly with our community. Join the Discord to see development in real-time.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/subscription">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 text-lg font-bold rounded-full">
                                Join Early Access
                            </Button>
                        </Link>
                        <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="border-orange-500 text-orange-500 px-8 py-6 text-lg font-bold rounded-full hover:bg-orange-500/10">
                                Join Discord
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
