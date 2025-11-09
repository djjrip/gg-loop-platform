import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-background">
      <div className="relative container mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-8">
            <span className="block text-foreground">Play.</span>
            <span className="block text-primary">Earn.</span>
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
