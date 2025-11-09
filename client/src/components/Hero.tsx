import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
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
          className="h-full w-full object-cover"
          data-testid="video-background"
        >
          <source 
            src="/assets/basketball-hero.mp4" 
            type="video/mp4" 
          />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-6 py-32 md:py-48">
        <div className="max-w-3xl space-y-10">
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-foreground"
          >
            Play.{" "}
            <span className="text-primary">Earn.</span>{" "}
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
