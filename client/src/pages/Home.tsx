import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Gamepad2,
  TrendingUp,
  Gift,
  Zap,
  Trophy,
  Users,
  ArrowRight,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-black via-brand-dark to-black py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="mb-6">
              <span className="text-sm text-brand-copper uppercase tracking-wider">
                Membership Rewards for Gamers
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Play. </span>
              <span className="text-brand-copper">Earn. </span>
              <span className="text-white">Loop.</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Subscribe to GG Loop and earn points for every ranked match you win.
              Redeem points for gaming gear, gift cards, and exclusive rewards.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/subscription">
                  <Button
                    size="lg"
                    className="bg-brand-copper hover:bg-brand-copper-light text-white px-8 py-6 text-lg"
                  >
                    Sign Up Free →
                  </Button>
                </Link>
                <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-brand-copper text-brand-copper hover:bg-brand-copper/10 px-8 py-6 text-lg"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join Discord
                  </Button>
                </a>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/stats">
                  <Button
                    size="lg"
                    className="bg-brand-copper hover:bg-brand-copper-light text-white px-8 py-6 text-lg"
                  >
                    View Dashboard
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-12 text-sm text-gray-500">
              <Zap className="inline h-4 w-4 text-brand-gold mr-2" />
              Try Pro free for 7 days or Elite free for 3 days
            </div>
          </div>
        </section>

        {/* Stats Panel (Authenticated Users) */}
        {isAuthenticated && user && (
          <section className="bg-brand-dark/50 border-y border-brand-copper/20 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-black/50 border-brand-copper/30 p-6">
                  <div className="text-brand-copper text-sm font-semibold mb-2">Total Points</div>
                  <div className="text-4xl font-bold text-white">{Number(user.totalPoints ?? 0).toLocaleString()}</div>
                  <Link href="/shop">
                    <div className="text-sm text-brand-copper-light mt-2 hover:text-brand-copper flex items-center">
                      Shop Rewards <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </Link>
                </Card>

                <Card className="bg-black/50 border-brand-copper/30 p-6">
                  <div className="text-brand-copper text-sm font-semibold mb-2">Login Streak</div>
                  <div className="text-4xl font-bold text-white">{user.loginStreak || 0} days</div>
                  <div className="text-sm text-gray-500 mt-2">Longest: {user.longestStreak || 0} days</div>
                </Card>

                <Card className="bg-black/50 border-brand-copper/30 p-6">
                  <div className="text-brand-copper text-sm font-semibold mb-2">Membership</div>
                  <div className="text-4xl font-bold text-white uppercase">Free</div>
                  <Link href="/subscription">
                    <div className="text-sm text-brand-copper-light mt-2 hover:text-brand-copper flex items-center">
                      Upgrade <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </Link>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-20 px-4 bg-black">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Three simple steps to start earning rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-b from-brand-dark/50 to-black border-brand-copper/20 p-8 hover:border-brand-copper/50 transition-colors">
                <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gamepad2 className="h-8 w-8 text-brand-copper" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Play</h3>
                <p className="text-gray-400">
                  Connect your Riot account and play your favorite games. We automatically track your ranked matches.
                </p>
              </Card>

              <Card className="bg-gradient-to-b from-brand-dark/50 to-black border-brand-copper/20 p-8 hover:border-brand-copper/50 transition-colors">
                <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-brand-copper" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Earn</h3>
                <p className="text-gray-400">
                  Earn points for every win. Pro and Elite members get monthly point allocations plus win bonuses.
                </p>
              </Card>

              <Card className="bg-gradient-to-b from-brand-dark/50 to-black border-brand-copper/20 p-8 hover:border-brand-copper/50 transition-colors">
                <div className="bg-brand-copper/10 border border-brand-copper/30 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gift className="h-8 w-8 text-brand-copper" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Redeem</h3>
                <p className="text-gray-400">
                  Exchange your points for gaming peripherals, gift cards, and exclusive gear from top brands.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Supported Games */}
        <section className="py-20 px-4 bg-brand-dark/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Supported Games</h2>
              <p className="text-gray-400">Currently tracking ranked play for Riot Games titles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/50 border-brand-copper/30 p-6 hover:border-brand-copper transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">League of Legends</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-gray-400 text-sm">Ranked Summoner's Rift</p>
              </Card>

              <Card className="bg-black/50 border-brand-copper/30 p-6 hover:border-brand-copper transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Valorant</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-gray-400 text-sm">Competitive Queue</p>
              </Card>

              <Card className="bg-black/50 border-brand-copper/30 p-6 hover:border-brand-copper transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Teamfight Tactics</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-gray-400 text-sm">Ranked Tactics</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-black to-brand-dark">
          <div className="container mx-auto max-w-4xl text-center">
            <Trophy className="h-16 w-16 text-brand-copper mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to start earning?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of gamers turning their gameplay into real rewards.
            </p>
            {!isAuthenticated && (
              <Link href="/subscription">
                <Button
                  size="lg"
                  className="bg-brand-copper hover:bg-brand-copper-light text-white px-12 py-6 text-lg"
                >
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
