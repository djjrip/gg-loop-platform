import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, Circle, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-50"
          data-testid="video-background"
        >
          <source 
            src="/assets/basketball-hero.mp4" 
            type="video/mp4" 
          />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/80" />
        
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 102, 0, 0.1) 2px,
              rgba(255, 102, 0, 0.1) 4px
            )`,
            animation: 'scanline 8s linear infinite'
          }}
        />
        
        <div 
          className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(255, 102, 0, 0.6) 0%, transparent 60%)',
          }}
        />
        
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        <div 
          className="absolute left-0 top-1/4 w-96 h-96 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #FF6600 0%, transparent 30%, transparent 70%, #FF6600 100%)',
            opacity: 0.6,
            borderTop: '3px solid #FF6600',
            boxShadow: '0 -10px 40px rgba(255, 102, 0, 0.4)'
          }}
        />
        
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
          style={{
            border: '4px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)'
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

        <div className="max-w-4xl space-y-8">
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-black/80 border-l-[6px] border-primary shadow-lg"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0 100%)',
              boxShadow: '0 0 30px rgba(255, 102, 0, 0.5), inset 0 0 20px rgba(255, 102, 0, 0.1)'
            }}
            data-testid="broadcast-label"
          >
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-primary font-black text-base uppercase tracking-[0.2em]">Championship Series 2024</span>
          </div>
          
          <div className="relative">
            <div 
              className="absolute -left-4 -top-4 w-32 h-32 opacity-20 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #FF6600 0%, transparent 70%)',
                clipPath: 'polygon(0 0, 100% 0, 0 100%)'
              }}
            />
            <h1 
              className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-white relative"
              style={{
                textShadow: '4px 4px 0px #FF6600, 8px 8px 0px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 102, 0, 0.6)',
                lineHeight: '0.95'
              }}
            >
              PLAY. EARN.{" "}
              <span 
                className="block text-primary mt-2"
                style={{
                  WebkitTextStroke: '2px #FF6600',
                  textShadow: '0 0 30px #FF6600, 0 0 60px #FF6600, 4px 4px 0px rgba(0, 0, 0, 0.8)'
                }}
              >
                DOMINATE.
              </span>
            </h1>
          </div>
          
          <div 
            className="bg-gradient-to-r from-black/90 to-transparent pl-6 pr-12 py-4 border-l-4 border-cyan-400"
            style={{
              clipPath: 'polygon(0 0, 98% 0, 95% 100%, 0 100%)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
            }}
          >
            <p className="text-xl md:text-2xl text-white font-bold uppercase tracking-wide max-w-2xl">
              Connect gameplay to real rewards • Climb leaderboards • Join 500K+ gamers
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-6">
            <Link href="/subscription">
              <div 
                className="relative group cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 102, 0, 0.6))'
                }}
              >
                <div 
                  className="px-8 py-4 bg-primary text-black font-black text-lg uppercase tracking-wider flex items-center gap-3 transition-all group-hover:scale-105"
                  style={{
                    clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                    boxShadow: '0 0 30px rgba(255, 102, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                  }}
                  data-testid="button-get-started"
                >
                  <Play className="h-5 w-5" />
                  Get Started
                </div>
                <div 
                  className="absolute inset-0 bg-primary/50 -z-10 blur-md"
                  style={{
                    clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)'
                  }}
                />
              </div>
            </Link>
            
            <Link href="/leaderboards">
              <div 
                className="relative group cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.4))'
                }}
              >
                <div 
                  className="px-8 py-4 bg-black/90 border-2 border-cyan-400 text-cyan-400 font-black text-lg uppercase tracking-wider flex items-center gap-3 transition-all group-hover:scale-105 group-hover:bg-cyan-400/10"
                  style={{
                    clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)'
                  }}
                  data-testid="button-view-leaderboards"
                >
                  <TrendingUp className="h-5 w-5" />
                  View Leaderboards
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 pt-12">
            <div 
              className="relative px-6 py-4 bg-black/80 border-l-4 border-primary min-w-[140px]"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)',
                boxShadow: '0 0 20px rgba(255, 102, 0, 0.3)'
              }}
            >
              <div className="flex flex-col">
                <span className="text-5xl font-black font-mono text-primary" style={{ textShadow: '0 0 20px #FF6600' }}>500K+</span>
                <span className="text-xs uppercase tracking-widest text-white/70 font-bold mt-1">Players</span>
              </div>
            </div>
            
            <div 
              className="relative px-6 py-4 bg-black/80 border-l-4 border-cyan-400 min-w-[140px]"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}
            >
              <div className="flex flex-col">
                <span className="text-5xl font-black font-mono text-cyan-400" style={{ textShadow: '0 0 20px #00FFFF' }}>50+</span>
                <span className="text-xs uppercase tracking-widest text-white/70 font-bold mt-1">Games</span>
              </div>
            </div>
            
            <div 
              className="relative px-6 py-4 bg-black/80 border-l-4 border-primary min-w-[140px]"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)',
                boxShadow: '0 0 20px rgba(255, 102, 0, 0.3)'
              }}
            >
              <div className="flex flex-col">
                <span className="text-5xl font-black font-mono text-primary" style={{ textShadow: '0 0 20px #FF6600' }}>$2M+</span>
                <span className="text-xs uppercase tracking-widest text-white/70 font-bold mt-1">Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
