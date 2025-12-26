import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gamepad2,
  TrendingUp,
  Gift,
  Zap,
  Trophy,
  Users,
  Target,
  Shield,
  Activity,
  ArrowRight,
  Rocket,
  Check,
  Coins,
  Flame,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import OnboardingModal from "@/components/OnboardingModal";
import logo from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";
import { isTauri } from "@/lib/tauri";
import { DesktopStatusWidget } from "@/components/DesktopStatusWidget";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: subscription } = useQuery<any>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenOnboarding = localStorage.getItem("ggloop_onboarding_completed");
      if (!hasSeenOnboarding) {
        const timer = setTimeout(() => setShowOnboarding(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem("ggloop_onboarding_completed", "true");
  };

  // DESKTOP MODE (STRICT SCOPE)
  if (isTauri() && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
        </div>

        <div className="z-10 w-full max-w-4xl">
          <div className="flex justify-center mb-12">
            <img src={logo} alt="GG LOOP" className="h-20 w-auto opacity-80" />
          </div>

          <DesktopStatusWidget />

          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-gray-500 font-mono tracking-wider">
              SECURE DESKTOP ENVIRONMENT
            </p>
            <p className="text-xs text-gray-700">
              Client v0.1.0 • Build 2025.12.20 • <span className="text-green-500">Online</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,40,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        <Header />
        <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />

        <main>
          {/* HERO SECTION - SIGNATURE "PLAY. EARN. LOOP." */}
          <section className="container mx-auto px-4 py-20 md:py-32 max-w-7xl">
            <div className="text-center mb-12">
              {/* Controller Logo */}
              <div className="flex justify-center mb-8">
                <img src={logo} alt="GG LOOP" className="h-24 w-auto" />
              </div>

              {/* Main Hero Text */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight">
                <span className="text-foreground">PLAY. </span>
                <span className="text-primary font-bold">EARN. </span>
                <span className="text-foreground">LOOP.</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-8 font-medium">
                {isAuthenticated
                  ? `Welcome back, ${user?.firstName || 'Operator'}! Your rewards hub is ready.`
                  : "A gaming identity platform for everyone. Verify your skills, earn real rewards."}
              </p>

              {!isAuthenticated && (
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <Link href="/login">
                    <button className="bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-8 py-4 font-bold text-white text-lg transition-all duration-300 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      START EARNING
                    </button>
                  </Link>
                  <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                    <button className="border-2 border-ggloop-orange text-ggloop-orange hover:bg-ggloop-orange/10 rounded-lg px-8 py-4 font-bold text-lg transition-all duration-300 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      JOIN THE DISCORD
                    </button>
                  </a>
                </div>
              )}

              {isAuthenticated && (
                <Link href="/stats">
                  <button className="bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-10 py-5 font-bold text-white text-xl transition-all duration-300">
                    VIEW DASHBOARD
                  </button>
                </Link>
              )}

              <div className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-ggloop-rose-gold" />
                Built by Gamers. Verified by Humans. Join the Movement.
              </div>
            </div>
          </section>

          {/* AUTHENTICATED DASHBOARD */}
          {isAuthenticated && user && (
            <section className="container mx-auto px-4 mb-16 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-ggloop-dark-shadow/80 border-ggloop-orange/30 p-6 hover:border-ggloop-orange/60 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-ggloop-rose-gold text-sm font-semibold mb-2 uppercase tracking-wide">Total Points</div>
                      <div className="text-4xl font-bold text-white">{Number(user.totalPoints ?? 0).toLocaleString()}</div>
                    </div>
                    <Trophy className="h-8 w-8 text-ggloop-orange" />
                  </div>
                  <Link href="/shop">
                    <div className="text-sm text-ggloop-orange hover:text-ggloop-orange-light flex items-center gap-1 font-semibold">
                      Shop Rewards <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </Card>

                <Card className="bg-ggloop-dark-shadow/80 border-ggloop-orange/30 p-6 hover:border-ggloop-orange/60 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-ggloop-rose-gold text-sm font-semibold mb-2 uppercase tracking-wide">Login Streak</div>
                      <div className="text-4xl font-bold text-white">{user.loginStreak || 0} <span className="text-xl text-gray-500">days</span></div>
                    </div>
                    <Activity className="h-8 w-8 text-ggloop-orange" />
                  </div>
                  <div className="text-sm text-gray-500">Longest: {user.longestStreak || 0} days</div>
                </Card>

                <Card className="bg-ggloop-dark-shadow/80 border-ggloop-orange/30 p-6 hover:border-ggloop-orange/60 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-ggloop-rose-gold text-sm font-semibold mb-2 uppercase tracking-wide">Membership</div>
                      <div className="text-4xl font-bold text-white uppercase">
                        {subscription?.tier || "FREE"}
                      </div>
                    </div>
                    <Shield className="h-8 w-8 text-ggloop-orange" />
                  </div>
                  <Link href="/subscription">
                    <div className="text-sm text-ggloop-orange hover:text-ggloop-orange-light flex items-center gap-1 font-semibold">
                      Upgrade <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </Card>
              </div>
            </section>
          )}

          {/* HOW IT WORKS */}
          <section className="container mx-auto px-4 py-20 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Path, Your Pace</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Ways to participate within the GG LOOP ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gamepad2 className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">THE GYM</h3>
                <p className="text-gray-400">
                  Focus on consistency. Build your baseline and learn the flow of the league. Casual play, verified.
                </p>
              </div>

              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">THE PARK</h3>
                <p className="text-gray-400">
                  Step up the competition. Complete missions and challenges keyed off your actual gameplay performance.
                </p>
              </div>

              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gift className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">THE LEAGUE</h3>
                <p className="text-gray-400">
                  The ultimate level. Optimize your performance for maximum visibility and elite opportunities.
                </p>
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section id="pricing" className="container mx-auto px-4 py-20 max-w-7xl bg-ggloop-dark-shadow/20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Participation Tiers</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Choose your level of engagement within the GG LOOP ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Free Tier */}
              <Card className="bg-ggloop-dark-shadow/60 border-ggloop-orange/20 hover:border-ggloop-orange/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-6 w-6 text-ggloop-orange" />
                    <CardTitle className="text-xl">Free</CardTitle>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$0</div>
                  <CardDescription>100 points/month cap</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Match verification rewards (coming soon)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">50 coins per 7-day streak</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Unlock trial with 500 coins</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={isAuthenticated ? "/stats" : "/login"} className="w-full">
                    <button className="w-full border-2 border-ggloop-orange text-ggloop-orange hover:bg-ggloop-orange/10 rounded-lg px-6 py-3 font-bold transition-all duration-300">
                      {isAuthenticated ? "View Dashboard" : "Get Started"}
                    </button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Basic Tier */}
              <Card className="bg-ggloop-dark-shadow/60 border-ggloop-orange/20 hover:border-ggloop-orange/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-6 w-6 text-ggloop-orange" />
                    <CardTitle className="text-xl">THE GYM</CardTitle>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$5</div>
                  <CardDescription>Casual Participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-ggloop-orange/10 border border-ggloop-orange/30 rounded-lg p-3 mb-4">
                    <div className="text-sm font-semibold text-ggloop-orange mb-1">7-Day Free Trial</div>
                    <div className="text-2xl font-bold text-white">3,000 pts</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Access rewards catalog</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Manual fulfillment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Monthly allocation</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/subscription" className="w-full">
                    <button className="w-full bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-6 py-3 font-bold text-white transition-all duration-300">
                      Start Trial
                    </button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Tier */}
              <Card className="bg-ggloop-dark-shadow/60 border-ggloop-orange/40 hover:border-ggloop-orange/70 transition-all relative">
                <div className="absolute -top-3 right-4">
                  <div className="bg-ggloop-orange text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-6 w-6 text-ggloop-orange" />
                    <CardTitle className="text-xl">THE PARK</CardTitle>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$12</div>
                  <CardDescription>Community Participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-ggloop-orange/10 border border-ggloop-orange/30 rounded-lg p-3 mb-4">
                    <div className="text-sm font-semibold text-ggloop-orange mb-1">7-Day Free Trial</div>
                    <div className="text-2xl font-bold text-white">10,000 pts</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">3.3x Basic points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Bonus challenges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/subscription" className="w-full">
                    <button className="w-full bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-6 py-3 font-bold text-white transition-all duration-300">
                      Start Trial
                    </button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Elite Tier */}
              <Card className="bg-gradient-to-br from-ggloop-orange/10 to-ggloop-rose-gold/10 border-ggloop-orange/50 hover:border-ggloop-orange transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-6 w-6 text-ggloop-orange" />
                    <CardTitle className="text-xl">THE LEAGUE</CardTitle>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$25</div>
                  <CardDescription>Enhanced Participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-ggloop-orange/20 border border-ggloop-orange/40 rounded-lg p-3 mb-4">
                    <div className="text-sm font-semibold text-ggloop-orange mb-1">3-Day Free Trial</div>
                    <div className="text-2xl font-bold text-white">25,000 pts</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">8.3x Basic points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Priority challenges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-ggloop-orange shrink-0 mt-0.5" />
                      <span className="text-gray-300">Elite badge & perks</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/subscription" className="w-full">
                    <button className="w-full bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-6 py-3 font-bold text-white transition-all duration-300">
                      Start Trial
                    </button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* SUPPORTED GAMES */}
          <section id="games" className="container mx-auto px-4 py-20 max-w-7xl bg-ggloop-dark-shadow/40">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Supported Games</h2>
              <p className="text-gray-400 text-lg">
                Coming soon — pending Riot API production approval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">League of Legends</h3>
                  <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">Coming Soon</div>
                </div>
                <p className="text-gray-400 text-sm">Riot API integration pending</p>
              </Card>

              <Card className="bg-card border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">VALORANT</h3>
                  <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">Coming Soon</div>
                </div>
                <p className="text-gray-400 text-sm">Riot API integration pending</p>
              </Card>

              <Card className="bg-card border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Teamfight Tactics</h3>
                  <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">Coming Soon</div>
                </div>
                <p className="text-gray-400 text-sm">Riot API integration pending</p>
              </Card>
            </div>
          </section>

          {/* LEADERBOARDS - REMOVED AS REQUESTED (COMING SOON) */}
          {/*
          <section id="leaderboards" className="container mx-auto px-4 py-20 max-w-7xl">
            ...
          </section>
          */}

          {/* ABOUT, MISSION & WHY - RESTORED CONTENT */}
          <section id="about" className="container mx-auto px-4 py-20 max-w-7xl border-t border-ggloop-orange/10">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  About <span className="text-ggloop-orange">GG LOOP</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  GG LOOP is a culture-driven gaming rewards ecosystem built for everyday gamers. We blend sneaker culture, basketball flow, streetwear aesthetics, and personal identity into a platform where players earn real value for doing what they already love - gaming.
                </p>

                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  To build the most inclusive and culturally-rooted rewards platform that empowers gamers with real value, real community, and real-life support - from sneakers to groceries to wellness resources - all through a modern, subscription-first ecosystem that respects their time and grind.
                </p>
              </div>

              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Target className="h-6 w-6 text-ggloop-rose-gold" />
                  Why We're Building This
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  GG LOOP exists to uplift gamers who never get rewarded for the grind they put in. It's built for the communities we grew up with - culture-first, identity-driven, and grounded in the reality that gaming is more than a hobby. It's lifestyle, escape, art, and hustle.
                </p>
                <div className="flex items-center gap-2 text-sm text-ggloop-orange font-bold uppercase tracking-wider">
                  <Shield className="h-4 w-4" />
                  Built for the Culture
                </div>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="container mx-auto px-4 py-20 max-w-4xl text-center">
            <div className="bg-gradient-to-br from-ggloop-orange/10 to-ggloop-rose-gold/10 border border-ggloop-orange/30 rounded-2xl p-12">
              <Trophy className="h-16 w-16 text-ggloop-orange mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to get rewarded for winning?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join early users earning real rewards for their competitive gameplay.
              </p>
              {!isAuthenticated && (
                <Link href="/subscription">
                  <button className="bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-12 py-5 font-bold text-white text-xl transition-all duration-300">
                    START EARNING NOW
                  </button>
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

