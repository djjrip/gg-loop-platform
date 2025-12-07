import { motion } from "framer-motion";
import { Target, Zap, Heart, Globe, Brain, TrendingUp, Home, Sparkles, Trophy, Shield, Dumbbell, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function Roadmap() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero/Title Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 to-black"></div>
                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500/10 border border-orange-500/30 mb-8">
                            <Trophy className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-bold text-orange-500 tracking-wider uppercase">The Empire Vision</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                            ROADMAP
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light">
                            Where gaming meets financial dignity, athlete culture, and global opportunity
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 1 - THE WHY (THE LIGHT) */}
            <section className="py-24 px-4 bg-gradient-to-b from-black to-charcoal-950">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight">
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">THE LIGHT</span>
                        </h2>
                        <div className="prose prose-invert prose-lg md:prose-xl max-w-none">
                            <p className="text-2xl md:text-3xl leading-relaxed font-light text-gray-200 italic border-l-4 border-orange-500 pl-8">
                                Gaming is the <span className="font-bold text-orange-400">only global sport anyone can join</span>. No height requirements. No genetics. No gatekeepers. Every gamer deserves <span className="font-bold text-white">financial dignity, wellness, identity, and rewards</span>. GG LOOP exists to bring <span className="font-black text-orange-500">LIGHT</span> to a generation dealing with stress, poverty, burnout, and economic instability. We combine gaming, fashion, wellness, and wealth-building into one universal platform. <span className="font-black text-red-500">This is NOT a gaming app</span> — this is a <span className="font-bold text-white">lifestyle and upward-mobility engine</span>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2 - THE EMPIRE TIERS */}
            <section className="py-24 px-4 bg-background">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            THE <span className="text-orange-500">EMPIRE</span> TIERS
                        </h2>
                        <p className="text-xl text-gray-400">Four phases of evolution toward homeownership</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Tier 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-gradient-to-br from-orange-950/30 to-black border-orange-500/30 h-full hover:border-orange-500/60 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                                        <Zap className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-orange-400">TIER 1</CardTitle>
                                    <CardDescription className="text-lg font-semibold text-white">Immediate Rewards (Now)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-gray-300">
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Play → Earn → Redeem</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Groceries, gas, bills, health items, blue-light glasses</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Seasonal cosmetics and identity items (fashion layer)</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Balanced gaming philosophy (athlete mindset)</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Tier 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-gradient-to-br from-red-950/30 to-black border-red-500/30 h-full hover:border-red-500/60 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                        <Trophy className="h-8 w-8 text-red-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-red-400">TIER 2</CardTitle>
                                    <CardDescription className="text-lg font-semibold text-white">Digital Athlete Era (Months 1-8)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-gray-300">
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Gamer profiles with tunnel-fit culture</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Weekly challenges, drip cosmetics, competitive ladders</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Wellness integrations (mental health, exercise incentives)</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Elite Season Pass + Options Hunter intelligence</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Tier 3 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-gradient-to-br from-orange-950/30 to-black border-orange-500/30 h-full hover:border-orange-500/60 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                                        <DollarSign className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-orange-400">TIER 3</CardTitle>
                                    <CardDescription className="text-lg font-semibold text-white">Financial Empowerment Era (Months 9-18)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-gray-300">
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Pay down bills through gaming</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Earn toward major purchases</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Investment pathways</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Stability dashboards</p>
                                    <p className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Global micro-income support (Philippines, Brazil, India)</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Tier 4 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="bg-gradient-to-br from-red-950/30 to-black border-red-500/30 h-full hover:border-red-500/60 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                        <Home className="h-8 w-8 text-red-500" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-red-400">TIER 4</CardTitle>
                                    <CardDescription className="text-lg font-semibold text-white">Homeownership Era (Year 2+)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-gray-300">
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Down payment rewards</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Property investment fund</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> GG LOOP x Real Estate partnership</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> "First House Earned Through Gaming" initiative</p>
                                    <p className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Multi-year savings and equity-building plan within the app</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SECTION 3 - GAME EXPANSION PIPELINE */}
            <section className="py-24 px-4 bg-gradient-to-b from-black to-charcoal-950">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            GAME <span className="text-orange-500">EXPANSION</span>
                        </h2>
                        <p className="text-xl text-gray-400">Automated integration pipeline</p>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            { phase: "Phase 1", games: "League of Legends, Valorant, TFT", status: "LIVE", color: "orange" },
                            { phase: "Phase 2", games: "Fortnite, Apex Legends, Overwatch", status: "Q2 2025", color: "orange" },
                            { phase: "Phase 3", games: "NBA 2K, Madden, FIFA", status: "Q3 2025", color: "red" },
                            { phase: "Phase 4", games: "Global MOBAs, Mobile Esports", status: "Q4 2025", color: "red" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-lg border ${item.color === "orange"
                                    ? "bg-orange-950/20 border-orange-500/30 hover:border-orange-500/60"
                                    : "bg-red-950/20 border-red-500/30 hover:border-red-500/60"
                                    } transition-all duration-300`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${item.color === "orange" ? "text-orange-400" : "text-red-400"} mb-2`}>
                                            {item.phase}
                                        </h3>
                                        <p className="text-gray-300 text-lg">{item.games}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full ${item.status === "LIVE"
                                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                                        : `bg-${item.color}-500/20 border border-${item.color}-500/50 text-${item.color}-400`
                                        } font-bold`}>
                                        {item.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4 - NBA x CULTURE CROSSOVER */}
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-950/10 via-red-950/10 to-orange-950/10"></div>
                <div className="container mx-auto max-w-6xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            NBA × <span className="text-orange-500">CULTURE</span>
                        </h2>
                        <p className="text-xl text-gray-400">Where performance meets swagger</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-orange-950/40 to-black p-8 rounded-lg border border-orange-500/30"
                        >
                            <Shield className="h-12 w-12 text-orange-500 mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">The Aesthetic</h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Fashion, performance, wellness, discipline, swagger</li>
                                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> Athletes and creators express themselves</li>
                                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> "Digital Tunnel Walk" concept defines identity</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-red-950/40 to-black p-8 rounded-lg border border-red-500/30"
                        >
                            <Sparkles className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">The Vision</h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> GG LOOP merges NBA culture with gaming identity</li>
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> New platform for self-expression</li>
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Long-term: Official NBA player partnerships</li>
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center p-8 bg-gradient-to-r from-black via-orange-950/20 to-black border-y border-orange-500/30"
                    >
                        <p className="text-3xl font-bold text-white italic">
                            "Like the tunnel walk before a game, but <span className="text-orange-500">digital and universal</span>."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 5 - AI + AUTONOMY */}
            <section className="py-24 px-4 bg-gradient-to-b from-black to-charcoal-950">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            AI + <span className="text-orange-500">AUTONOMY</span>
                        </h2>
                        <p className="text-xl text-gray-400">The empire runs itself</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Brain, title: "Self-Healing", desc: "Infrastructure auto-recovers from failures" },
                            { icon: Zap, title: "Automated Marketing", desc: "Bots handle campaigns 24/7" },
                            { icon: TrendingUp, title: "Real-Time Monitoring", desc: "Prometheus + Grafana + Loki stack" },
                            { icon: Brain, title: "AI Content", desc: "Dynamic systems, zero manual work" },
                            { icon: Shield, title: "Zero Downtime", desc: "Health checks + auto-restart" },
                            { icon: Target, title: "AWS Scaling", desc: "Ready to scale from homelab to cloud" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-lg bg-gradient-to-br from-orange-950/20 to-black border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300"
                            >
                                <item.icon className="h-10 w-10 text-orange-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 text-center p-6 bg-orange-950/10 border border-orange-500/30 rounded-lg"
                    >
                        <p className="text-lg text-gray-300 italic">
                            "The empire operates like a <span className="text-orange-500 font-bold">living organism</span> — detecting, fixing, expanding, and evolving without human intervention."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 6 - GLOBAL IMPACT */}
            <section className="py-24 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            GLOBAL <span className="text-orange-500">IMPACT</span>
                        </h2>
                        <p className="text-xl text-gray-400">Uplifting humanity through gaming</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { icon: Globe, title: "Regional Support", desc: "Gamers in low-income regions can earn real stability" },
                            { icon: Heart, title: "Financial Dignity", desc: "Real earnings for families, not just individuals" },
                            { icon: Dumbbell, title: "Wellness Access", desc: "Affordable health tools and mental health resources" },
                            { icon: TrendingUp, title: "Ecosystem Uplift", desc: "Communities, not just solo players" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-lg bg-gradient-to-br from-red-950/30 to-black border border-red-500/30 hover:border-red-500/60 transition-all duration-300"
                            >
                                <item.icon className="h-12 w-12 text-red-500 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-300">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 text-center"
                    >
                        <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                            GG LOOP as a vehicle of <span className="text-red-500">opportunity</span>
                        </p>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                            Simple, powerful, universal. Every redemption brings someone closer to stability.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 7 - PUBLIC TIMELINE */}
            <section className="py-24 px-4 bg-gradient-to-b from-black to-charcoal-950">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            THE <span className="text-orange-500">TIMELINE</span>
                        </h2>
                        <p className="text-xl text-gray-400">Clean. No fluff.</p>
                    </motion.div>

                    <div className="space-y-6">
                        {[
                            { period: "Q1 2025", title: "Foundation", color: "orange" },
                            { period: "Q2-Q4 2025", title: "Digital Athlete Era", color: "orange" },
                            { period: "2026", title: "Financial Engine + Global Rollouts", color: "red" },
                            { period: "2027+", title: "Homeownership + NBA Partnerships", color: "red" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center justify-between p-6 rounded-lg border ${item.color === "orange"
                                    ? "bg-orange-950/20 border-orange-500/30 hover:border-orange-500/60"
                                    : "bg-red-950/20 border-red-500/30 hover:border-red-500/60"
                                    } transition-all duration-300`}
                            >
                                <div className={`text-2xl md:text-3xl font-black ${item.color === "orange" ? "text-orange-400" : "text-red-400"}`}>
                                    {item.period}
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-white">
                                    {item.title}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 8 - CALL TO ACTION */}
            <section className="py-32 px-4 bg-gradient-to-b from-black via-orange-950/10 to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent)]"></div>
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            This is just the <span className="text-orange-500">beginning</span>.
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                            GG LOOP is the future of gaming culture, wellness, financial dignity, and identity.
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-white mb-12">
                            Join the movement before it becomes <span className="text-orange-500">undeniable</span>.
                        </p>

                        <Link href="/subscription">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg px-12 py-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-orange-500/50"
                            >
                                START YOUR JOURNEY
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
