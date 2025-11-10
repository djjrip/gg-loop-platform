import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-background overflow-hidden">
      <div className="absolute inset-0 opacity-20 animate-pulse-slower" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 140, 66, 0.5) 2px, transparent 2px),
          linear-gradient(90deg, rgba(255, 140, 66, 0.5) 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px',
      }} />
      
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slower" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="animate-orbit">
          <div className="w-4 h-4 bg-primary/60 rounded-full shadow-[0_0_10px_rgba(255,140,66,0.6)] animate-pulse-slower" />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="animate-reverse-orbit" style={{ animationDelay: '5s' }}>
          <div className="w-3 h-3 bg-primary/40 rounded-full shadow-[0_0_8px_rgba(255,140,66,0.4)] animate-pulse-slow" />
        </div>
      </div>
      
      <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="relative container mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-8">
            <span className="block text-foreground">Play.</span>
            <span className="block text-primary drop-shadow-[0_0_50px_rgba(255,140,66,1)] animate-pulse-slow">Earn.</span>
            <span className="block text-foreground">Loop.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            Turn your gaming into rewards. Every match played, every win earned—real value for real skill.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/subscription">
              <Button size="lg" className="text-base font-semibold gap-2" data-testid="button-get-started">
                <Play className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base font-semibold" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-background" />
              </div>
              <span>Join 2,400+ streamers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
