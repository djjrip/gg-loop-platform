import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, Circle, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-40"
          data-testid="video-background"
        >
          <source 
            src="/assets/basketball-hero.mp4" 
            type="video/mp4" 
          />
        </video>
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 102, 0, 0.15) 0%, transparent 50%, rgba(255, 102, 0, 0.2) 100%)',
            animation: 'gradient-shift 8s ease-in-out infinite alternate'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-primary/15" />
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.4) 100%)',
            mixBlendMode: 'multiply'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.4) 0%, transparent 50%, rgba(255, 102, 0, 0.4) 100%)',
            borderTop: '2px solid rgba(255, 102, 0, 0.3)'
          }}
        />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div 
          className="absolute top-8 left-0 right-0 flex items-center justify-between px-8 text-sm font-bold uppercase tracking-wider"
          data-testid="broadcast-ticker"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded">
              <Circle className="h-2 w-2 fill-white animate-pulse" />
              LIVE
            </span>
            <span className="text-foreground/70">GG LOOP ARENA</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-foreground/50">Q4</span>
            <span className="font-mono text-primary">12:47</span>
            <span className="text-foreground/50">|</span>
            <span className="text-foreground/70">SEASON 2024</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 mb-2 bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-primary font-bold text-sm uppercase tracking-wider"
            data-testid="broadcast-label"
          >
            <Trophy className="h-4 w-4" />
            <span>Championship Series</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground">
            Play. Earn.{" "}
            <span className="text-primary">Dominate.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/90 max-w-2xl">
            Connect your gameplay to real-world rewards. Climb leaderboards, unlock achievements, 
            and join a thriving community of competitive gamers.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/subscription">
              <Button size="lg" className="text-base font-semibold" data-testid="button-get-started">
                <Play className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/leaderboards">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base font-semibold backdrop-blur-md bg-background/20 border-foreground/20" 
                data-testid="button-view-leaderboards"
              >
                View Leaderboards
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-8 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-foreground/90"><span className="font-mono font-bold text-foreground">500K+</span> Players</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <span className="text-foreground/90"><span className="font-mono font-bold text-foreground">50+</span> Games</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-foreground/90"><span className="font-mono font-bold text-foreground">$2M+</span> Rewards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
