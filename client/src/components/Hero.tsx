import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import basketballBg from "@assets/stock_images/basketball_game_acti_facb9589.jpg";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={basketballBg} 
          alt="Basketball action" 
          className="h-full w-full object-cover opacity-20"
          style={{ 
            animation: 'slow-pan 30s ease-in-out infinite alternate'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, rgba(255, 102, 0, 0.05) 0%, transparent 50%, rgba(255, 102, 0, 0.08) 100%)',
            animation: 'gradient-shift 8s ease-in-out infinite alternate'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-primary/5" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="max-w-3xl space-y-6">
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
