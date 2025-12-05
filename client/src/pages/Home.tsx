import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { HUDPanel } from "@/components/Empire/HUDPanel";
import { TacticalButton } from "@/components/Empire/TacticalButton";
import { StatusBadge } from "@/components/Empire/StatusBadge";
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
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import OnboardingModal from "@/components/OnboardingModal";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Stats Query
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
    <div className="min-h-screen bg-empire-dark text-emerald-500 font-mono relative overflow-hidden selection:bg-empire-green selection:text-empire-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.03),transparent_70%)]" />
        <div className="absolute inset-0 tactical-grid opacity-10" />
        <div className="scanline-overlay" />
      </div>

      <div className="relative z-10">
        <Header />

        <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />

        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Welcome / Hero Section */}
          <section className="mb-12 text-center md:text-left">
            <div className="inline-block mb-4">
              <StatusBadge status="online" label="SYSTEM ONLINE" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 predator-text glow-text">
              {isAuthenticated ? `WELCOME BACK, OPERATOR ${user?.firstName || 'UNKNOWN'}` : 'EMPIRE COMMAND CENTER'}
            </h1>
            <p className="text-emerald-500/60 max-w-2xl text-lg">
              {isAuthenticated
                ? "Mission status: ACTIVE. Ready for deployment."
                : "Initialize your gaming portfolio. Earn rewards. Dominate the loop."}
            </p>

            {!isAuthenticated && (
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <Link href="/subscription">
                  <TacticalButton size="lg" icon={<RocketIcon className="h-4 w-4" />}>
                    INITIALIZE ACCESS
                  </TacticalButton>
                </Link>
                <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                  <TacticalButton variant="secondary" size="lg" icon={<Users className="h-4 w-4" />}>
                    COMMUNICATIONS
                  </TacticalButton>
                </a>
              </div>
            )}
          </section>

          {/* Authenticated Dashboard Grid */}
          {isAuthenticated && user && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
              {/* Vitals Panel */}
              <div className="col-span-1 md:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <HUDPanel title="TOTAL POINTS" variant="corners-bottom">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{Number(user.totalPoints ?? 0).toLocaleString()}</span>
                      <span className="text-xs text-emerald-500/60 mb-1">PTS</span>
                    </div>
                    <Link href="/shop" className="mt-2 block">
                      <div className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        ACCESS ARMORY <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  </HUDPanel>

                  <HUDPanel title="STREAK STATUS" variant="corners-bottom">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{user.loginStreak || 0}</span>
                      <span className="text-xs text-emerald-500/60 mb-1">DAYS</span>
                    </div>
                    <div className="text-xs text-emerald-500/40 mt-1">MAX: {user.longestStreak || 0} DAYS</div>
                  </HUDPanel>

                  <HUDPanel title="CLEARANCE LEVEL" variant="corners-bottom">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white uppercase">{subscription?.tier || "FREE"}</span>
                    </div>
                    <Link href="/subscription" className="mt-2 block">
                      <div className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        UPGRADE CLEARANCE <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  </HUDPanel>
                </div>

                {/* Main Mission Area */}
                <HUDPanel title="ACTIVE OPERATIONS" className="mt-6 h-64 flex items-center justify-center border-emerald-500/20 bg-emerald-950/20">
                  <div className="text-center">
                    <Gamepad2 className="h-12 w-12 text-emerald-500/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-emerald-500/60">NO ACTIVE MISSIONS DETECTED</h3>
                    <p className="text-xs text-emerald-500/40 mt-2">Connect Riot Account to begin tracking</p>
                    <Link href="/settings">
                      <TacticalButton size="sm" className="mt-4">
                        LINK ACCOUNT
                      </TacticalButton>
                    </Link>
                  </div>
                </HUDPanel>
              </div>

              {/* Side Intel Panel */}
              <div className="col-span-1 md:col-span-4 space-y-6">
                <HUDPanel title="INTEL FEED" className="h-full min-h-[300px]">
                  <div className="space-y-4">
                    <div className="border-b border-emerald-500/20 pb-2">
                      <span className="text-[10px] text-emerald-500/40">TODAY 0800</span>
                      <p className="text-sm font-bold text-emerald-400">Double XP Weekend Active</p>
                    </div>
                    <div className="border-b border-emerald-500/20 pb-2">
                      <span className="text-[10px] text-emerald-500/40">YESTERDAY 1400</span>
                      <p className="text-sm font-bold text-emerald-400">New Rewards Added to Armory</p>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] text-emerald-500/40">SYSTEM</span>
                      <p className="text-sm font-bold text-emerald-400">Welcome to Empire Systems v2.0</p>
                    </div>
                  </div>
                </HUDPanel>
              </div>
            </div>
          )}

          {/* Public Features Grid (Shown to all, but styled differently) */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-emerald-500/30" />
              <h2 className="text-xl font-bold tracking-widest text-emerald-500">SYSTEM CAPABILITIES</h2>
              <div className="h-[1px] flex-1 bg-emerald-500/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HUDPanel title="PROTOCOL: PLAY" scanned>
                <Gamepad2 className="h-8 w-8 text-emerald-500 mb-4" />
                <p className="text-sm text-emerald-500/80">
                  Automatic tracking of competitive performance across supported titles.
                </p>
              </HUDPanel>

              <HUDPanel title="PROTOCOL: EARN" scanned>
                <TrendingUp className="h-8 w-8 text-emerald-500 mb-4" />
                <p className="text-sm text-emerald-500/80">
                  Accumulate credits through victory. Performance multipliers active.
                </p>
              </HUDPanel>

              <HUDPanel title="PROTOCOL: REDEEM" scanned>
                <Gift className="h-8 w-8 text-emerald-500 mb-4" />
                <p className="text-sm text-emerald-500/80">
                  Exchange credits for hardware, currency, and tactical gear.
                </p>
              </HUDPanel>
            </div>
          </section>

          {/* Games List */}
          <section id="games" className="mb-12">
            <HUDPanel title="SUPPORTED THEATERS" variant="no-corners">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">LEAGUE OF LEGENDS</h3>
                    <StatusBadge status="online" />
                  </div>
                  <p className="text-xs text-emerald-500/60 group-hover:text-emerald-500">Ranked Summoner's Rift</p>
                </div>

                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">VALORANT</h3>
                    <StatusBadge status="online" />
                  </div>
                  <p className="text-xs text-emerald-500/60 group-hover:text-emerald-500">Competitive Queue</p>
                </div>

                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">TFT</h3>
                    <StatusBadge status="online" />
                  </div>
                  <p className="text-xs text-emerald-500/60 group-hover:text-emerald-500">Ranked Tactics</p>
                </div>
              </div>
            </HUDPanel>
          </section>

        </main>
      </div>
    </div>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
