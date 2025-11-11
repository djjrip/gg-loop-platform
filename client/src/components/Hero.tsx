import { Button } from "@/components/ui/button";
import { Trophy, Gift, Users } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-gradient-to-b from-background via-background to-card overflow-hidden">
      {/* Animated gradient orbs - subtle, premium feel */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float opacity-40" />
      <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl animate-float-delayed opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slower opacity-20" />
      
      {/* Floating achievement cards in background */}
      <div className="absolute top-20 right-1/4 opacity-10 hover:opacity-20 transition-opacity duration-700">
        <div className="animate-float">
          <div className="w-32 h-40 bg-gradient-to-br from-card to-muted rounded-xl shadow-2xl border border-border" />
        </div>
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-10 hover:opacity-20 transition-opacity duration-700">
        <div className="animate-float-delayed">
          <div className="w-28 h-36 bg-gradient-to-br from-card to-muted rounded-xl shadow-2xl border border-border" />
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative container mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 backdrop-blur-sm animate-pulse">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">7-Day Free Trial • No Credit Card Required</span>
            </div>
            
            {/* Main headline with staggered animation */}
            <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tighter mb-6">
              <span className="block text-foreground mb-2 hover:text-primary transition-colors duration-500">Play.</span>
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mb-2 
                             hover:scale-105 transition-transform duration-500 inline-block">Earn.</span>
              <span className="block text-foreground hover:text-primary transition-colors duration-500">Loop.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
              Turn every match into <span className="text-primary font-semibold">real rewards</span>. Start free for 7 days, then choose your tier. <span className="text-primary font-semibold">Earn points</span> from wins, unlock <span className="text-primary font-semibold">bonus challenges</span> from sponsors, and redeem for gift cards and gaming gear.
            </p>

            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Invite friends, both earn <span className="font-bold text-foreground">bonus points</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Share achievements on <span className="font-bold text-foreground">Twitter & TikTok</span></span>
              </div>
            </div>

            {/* CTA Buttons with subtle hover effects */}
            <div className="flex flex-wrap gap-4 justify-center items-center mb-16">
              <Link href="/subscription">
                <Button 
                  size="lg" 
                  className="text-lg font-bold gap-3 px-10 py-7 h-auto shadow-lg hover:shadow-xl transition-all duration-300" 
                  data-testid="button-get-started"
                >
                  <Gift className="h-6 w-6" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/referrals">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg font-bold px-10 py-7 h-auto backdrop-blur-sm hover:bg-card/50 border-2 transition-all duration-300" 
                  data-testid="button-referral-program"
                >
                  <Users className="h-5 w-5" />
                  Referral Program
                </Button>
              </Link>
            </div>

            {/* Stats bar - premium collectible feel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 transition-colors">2,400+</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Streamers</div>
              </div>
              <div className="group bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 transition-colors">$89K+</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rewards Earned</div>
              </div>
              <div className="group bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 transition-colors">100:1</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Points to Value</div>
              </div>
            </div>
          </div>

          {/* Featured moments preview - NBA Top Shot style */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-10">Your Achievements Become Collectibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sample trophy card 1 */}
              <div className="group relative bg-gradient-to-b from-card to-card/50 rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Common</span>
                    <span className="text-xs font-mono text-muted-foreground">#/1000</span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-4 flex items-center justify-center transition-transform duration-300">
                    <Trophy className="h-20 w-20 text-primary/60" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">First Win</h3>
                  <p className="text-sm text-muted-foreground">Victory in competitive match</p>
                </div>
              </div>

              {/* Sample trophy card 2 - Rare */}
              <div className="group relative bg-gradient-to-b from-card to-card/50 rounded-2xl border-2 border-primary/30 overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Rare</span>
                    <span className="text-xs font-mono text-muted-foreground">#/100</span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl mb-4 flex items-center justify-center transition-transform duration-300">
                    <Trophy className="h-20 w-20 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Tournament Top 10</h3>
                  <p className="text-sm text-muted-foreground">Ranked finish in major event</p>
                </div>
              </div>

              {/* Sample trophy card 3 - Epic */}
              <div className="group relative bg-gradient-to-b from-card to-card/50 rounded-2xl border-2 border-primary/50 overflow-hidden shadow-lg hover:shadow-xl hover:border-primary transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary to-primary" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Epic</span>
                    <span className="text-xs font-mono text-muted-foreground">#/25</span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-primary/40 to-primary/15 rounded-xl mb-4 flex items-center justify-center transition-transform duration-300 shadow-inner">
                    <Trophy className="h-20 w-20 text-primary drop-shadow-lg" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">100 Stream Hours</h3>
                  <p className="text-sm text-muted-foreground">Verified streaming milestone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </section>
  );
}
