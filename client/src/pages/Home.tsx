import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
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
  Rocket
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import OnboardingModal from "@/components/OnboardingModal";
import logo from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";

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
                <span className="text-white">PLAY. </span>
                <span className="text-ggloop-orange ggloop-glow-text">EARN. </span>
                <span className="text-white">LOOP.</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-8 font-medium">
                {isAuthenticated
                  ? `Welcome back, ${user?.firstName || 'Operator'}! Your gaming portfolio is ready.`
                  : "The gaming rewards platform that pays you to dominate. Connect your accounts, win ranked matches, and redeem real gear."}
              </p>

              {!isAuthenticated && (
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <Link href="/subscription">
                    <button className="bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-8 py-4 font-bold text-white text-lg transition-all duration-300 flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      GET STARTED FREE
                    </button>
                  </Link>
                  <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                    <button className="border-2 border-ggloop-orange text-ggloop-orange hover:bg-ggloop-orange/10 rounded-lg px-8 py-4 font-bold text-lg transition-all duration-300 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      JOIN DISCORD
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
                Try Pro free for 7 days or Elite free for 3 days
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Three simple steps to turn your gameplay into real rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gamepad2 className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">PLAY</h3>
                <p className="text-gray-400">
                  Connect your Riot, Steam, or Xbox account. We automatically track your ranked matches and performance.
                </p>
              </div>

              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">EARN</h3>
                <p className="text-gray-400">
                  Earn points for every win. Subscribers get monthly point allocations plus bonus challenges.
                </p>
              </div>

              <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8 hover:border-ggloop-orange/50 transition-colors">
                <div className="bg-gradient-to-br from-ggloop-orange/20 to-ggloop-rose-gold/20 border border-ggloop-orange/40 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gift className="h-8 w-8 text-ggloop-orange" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">REDEEM</h3>
                <p className="text-gray-400">
                  Exchange points for gaming peripherals, gift cards, exclusive gear, and real-world prizes.
                </p>
              </div>
            </div>
          </section>

          {/* SUPPORTED GAMES */}
          <section id="games" className="container mx-auto px-4 py-20 max-w-7xl bg-ggloop-dark-shadow/40">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Supported Games</h2>
              <p className="text-gray-400 text-lg">
                Currently tracking ranked play across Riot Games titles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-primary/30 p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">League of Legends</h3>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-gray-400 text-sm">Ranked Summoner's Rift • 5v5</p>
              </Card>

              <Card className="bg-card border-primary/30 p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">VALORANT</h3>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-gray-400 text-sm">Competitive Queue • 5v5</p>
              </Card>

              <Card className="bg-card border-primary/30 p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Teamfight Tactics</h3>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-gray-400 text-sm">Ranked Tactics • Auto Battler</p>
              </Card>
            </div>
          </section>

          {/* LEADERBOARDS */}
          <section id="leaderboards" className="container mx-auto px-4 py-20 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Leaderboards</h2>
              <p className="text-gray-400 text-lg">
                Compete with players worldwide and climb the ranks
              </p>
            </div>

            <div className="bg-ggloop-dark-shadow/60 border border-ggloop-orange/20 rounded-xl p-8">
              <div className="text-center">
                <Target className="h-16 w-16 text-ggloop-orange mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Global Rankings Coming Soon</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Track your progress against the best players worldwide. Leaderboards will feature ranked stats, win rates, and exclusive rewards for top performers.
                </p>
                {isAuthenticated && (
                  <Link href="/stats">
                    <button className="mt-6 bg-gradient-to-r from-ggloop-orange to-ggloop-rose-gold hover:shadow-[0_0_30px_var(--ggloop-neon-glow)] rounded-lg px-8 py-3 font-bold text-white transition-all duration-300">
                      View Your Stats
                    </button>
                  </Link>
                )}
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
                Join thousands of gamers turning their competitive gameplay into real-world prizes.
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
