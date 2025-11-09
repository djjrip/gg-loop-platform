import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
  }));

  return (
    <section className="relative w-full overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs with parallax */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
          animate={{
            x: [mousePosition.x, mousePosition.x + 50],
            y: [mousePosition.y, mousePosition.y + 50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"
          animate={{
            x: [-mousePosition.x, -mousePosition.x - 30],
            y: [-mousePosition.y, -mousePosition.y - 30],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: '0 0 10px 2px rgba(255, 140, 66, 0.4)',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Animated grid overlay */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 140, 66, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 140, 66, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 140, 66, 0.1) 2px, rgba(255, 140, 66, 0.1) 4px)',
        }} />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Real Rewards. Real Gaming.</span>
          </motion.div>

          {/* Animated title with glitch effect */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-9xl font-bold leading-none tracking-tighter mb-8"
          >
            <motion.span
              className="block text-foreground"
              whileHover={{ scale: 1.02 }}
              style={{
                textShadow: '0 0 40px rgba(255, 140, 66, 0.2)',
              }}
            >
              Play.{" "}
            </motion.span>
            
            <motion.span
              className="block text-primary"
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 140, 66, 0.5)',
                  '0 0 60px rgba(255, 140, 66, 0.8)',
                  '0 0 20px rgba(255, 140, 66, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              whileHover={{ scale: 1.02 }}
            >
              Earn.{" "}
            </motion.span>
            
            <motion.span
              className="block text-foreground"
              whileHover={{ scale: 1.02 }}
              style={{
                textShadow: '0 0 40px rgba(255, 140, 66, 0.2)',
              }}
            >
              Loop.
            </motion.span>
          </motion.h1>

          {/* Animated description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-10"
          >
            Turn your gaming into rewards. Every match played, every win earned—real value for real skill.
          </motion.p>

          {/* Animated buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/subscription">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="text-base px-8 relative overflow-hidden group"
                  data-testid="button-get-started"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                  <Play className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
              </motion.div>
            </Link>
            
            <Link href="#games">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-8 border-primary/30 hover:border-primary/60"
                  data-testid="button-explore"
                >
                  Explore Games
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap gap-12 pt-16"
          >
            {[
              { value: "500K+", label: "Players", delay: 0.9 },
              { value: "50+", label: "Games", delay: 1.0 },
              { value: "$2M+", label: "Rewards", delay: 1.1 },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stat.delay }}
                whileHover={{ scale: 1.1 }}
                className="space-y-1"
              >
                <motion.div
                  className="text-4xl font-bold font-mono text-foreground"
                  animate={{
                    textShadow: index === 2 ? [
                      '0 0 10px rgba(255, 140, 66, 0.3)',
                      '0 0 20px rgba(255, 140, 66, 0.6)',
                      '0 0 10px rgba(255, 140, 66, 0.3)',
                    ] : 'none',
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
