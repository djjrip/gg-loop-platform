import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 gaming-gradient-bg">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slower"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 rounded-full blur-[120px] animate-spin-slow"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 140, 66, 0.02) 3px, rgba(255, 140, 66, 0.02) 4px)',
        }}></div>
      </div>

      <div className="relative container mx-auto max-w-6xl px-6 py-32 md:py-48">
        <div className="max-w-3xl space-y-10">
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter text-foreground"
            style={{textShadow: '0 0 30px rgba(255, 140, 66, 0.3)'}}
          >
            Play.{" "}
            <span className="text-primary" style={{textShadow: '0 0 40px rgba(255, 140, 66, 0.6)'}}>Earn.</span>{" "}
            <span className="block mt-2">Loop.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Turn your gaming into rewards. Every match played, every win earned—real value for real skill.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/subscription">
              <Button 
                size="lg" 
                className="text-base px-8"
                data-testid="button-get-started"
              >
                <Play className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            
            <Link href="#games">
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8"
                data-testid="button-explore"
              >
                Explore Games
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 pt-12 text-sm">
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono text-foreground">500K+</div>
              <div className="text-muted-foreground uppercase tracking-wide">Players</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono text-foreground">50+</div>
              <div className="text-muted-foreground uppercase tracking-wide">Games</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono text-primary">$2M+</div>
              <div className="text-muted-foreground uppercase tracking-wide">Rewards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
