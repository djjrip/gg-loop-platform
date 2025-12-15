import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldCheck, 
  Trophy, 
  Activity, 
  Layout, 
  Globe, 
  ChevronDown, 
  Users, 
  Coins, 
  Rocket, 
  Lock,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Components ---

const Section = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <section className={cn("py-24 px-4 relative overflow-hidden", className)}>
    <div className="max-w-6xl mx-auto relative z-10 w-full">
      {children}
    </div>
  </section>
);

const HeroText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h1 className={cn("text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent", className)}>
    {children}
  </h1>
);

const SubText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={cn("text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl", className)}>
    {children}
  </p>
);

const StatCard = ({ icon: Icon, value, label }: { icon: LucideIcon, value: string, label: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
    <Icon className="h-8 w-8 text-ggloop-orange mb-4" />
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</div>
  </div>
);

const RoadmapItem = ({ phase, title, status, description }: { phase: string, title: string, status: "Live" | "In Development" | "Planned", description: string }) => (
  <div className="relative pl-8 border-l border-white/10 pb-12 last:pb-0">
    <div className={cn(
      "absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2",
      status === "Live" ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
      status === "In Development" ? "bg-ggloop-orange border-ggloop-orange" : "bg-black border-gray-600"
    )} />
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs font-bold text-ggloop-rose-gold uppercase tracking-widest">{phase}</span>
      {status === "Live" && <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Live Beta</span>}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed max-w-md">{description}</p>
  </div>
);

export default function PitchDeck() {
  const { user } = useAuth();
  // Safe check for admin access (kuyajrip specific or generic admin flag)
  const isAdmin = user && ((user.username === "kuyajrip" || user.email === "jaysonquindao1@gmail.com") || (user as any).isAdmin);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-ggloop-orange/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-ggloop-orange/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      </div>

      {/* Founder Mode Badge */}
      {isAdmin && (
        <Link href="/admin">
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 bg-zinc-900 border border-ggloop-orange/50 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ggloop-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-ggloop-orange"></span>
              </span>
              <span className="text-xs font-bold text-ggloop-orange uppercase tracking-wider">Founder Mode Active</span>
            </div>
          </div>
        </Link>
      )}

      {/* --- HERO SECTION --- */}
      <Section className="min-h-screen flex items-center justify-center text-center pt-32">
        <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-ggloop-rose-gold mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-ggloop-orange animate-pulse" />
            Live Investor Presentation
          </div>
          <HeroText className="max-w-4xl mx-auto">
            THE INFRASTRUCTURE<br />
            <span className="text-ggloop-orange">OF TRUST</span>
          </HeroText>
          <SubText className="mx-auto mb-12">
            The world's first verified skills economy for gamers. <br/>
            We don't just track stats. We validate careers.
          </SubText>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatCard icon={Users} value="10M+" label="Target Gamers" />
            <StatCard icon={ShieldCheck} value="100%" label="Verified Inputs" />
            <StatCard icon={Coins} value="$0" label="Fraud Loss" />
            <StatCard icon={Activity} value="<50ms" label="Latency" />
          </div>

          <div className="mt-20">
             <ChevronDown className="h-10 w-10 text-gray-600 animate-bounce mx-auto" />
          </div>
        </div>
      </Section>

      {/* --- THE PROBLEM --- */}
      <Section className="bg-zinc-900/50 border-y border-white/5">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-ggloop-rose-gold font-bold tracking-widest uppercase mb-4 text-sm">The Problem</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Gaming Has a <br/>Trust Issue.</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Esports is a billion-dollar industry built on unverified data. Smurfs ruins ranked play. Cheaters steal prize pools. Toxicity drives away users.
            </p>
            <p className="text-white text-lg font-medium">
              Without verification, there is no real economy.
            </p>
          </div>
          <div className="grid gap-4">
             <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
               <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Lock className="text-red-500 w-5 h-5" /> Fraud & Cheats</h4>
               <p className="text-sm text-gray-400">Billions lost in prize money and brand trust annually.</p>
             </div>
             <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
               <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Users className="text-red-500 w-5 h-5" /> Fragmented Identity</h4>
               <p className="text-sm text-gray-400">A player''s skill on PC doesn't carry over to Mobile or Console.</p>
             </div>
          </div>
        </div>
      </Section>

      {/* --- THE SOLUTION (GG LOOP) --- */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-ggloop-rose-gold font-bold tracking-widest uppercase mb-4 text-sm">The Solution</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-white">The "Stripe" for Gamer Identity</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Link href={isAdmin ? "/admin/anticheat" : "/about"}>
            <div className="group bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-ggloop-orange/50 transition-all cursor-pointer h-full relative overflow-hidden">
               {isAdmin && <div className="absolute top-0 right-0 bg-ggloop-orange text-black text-[10px] font-bold px-2 py-1">ADMIN ACCESS</div>}
              <div className="w-12 h-12 bg-ggloop-orange/20 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-ggloop-orange" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-ggloop-orange transition-colors">1. Verify</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Proprietary anti-cheat layer runs locally. We validate every kill, every match, every input.
              </p>
            </div>
          </Link>

          <Link href="/creator-dashboard">
            <div className="group bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-ggloop-orange/50 transition-all cursor-pointer h-full">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-500 transition-colors">2. Reward</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Skill = Income. Verified matches unlock real-world rewards, creator status, and instant payouts.
              </p>
            </div>
          </Link>

          <Link href={isAdmin ? "/admin/analytics" : "/partners"}>
            <div className="group bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-ggloop-orange/50 transition-all cursor-pointer h-full relative overflow-hidden">
             {isAdmin && <div className="absolute top-0 right-0 bg-blue-500 text-black text-[10px] font-bold px-2 py-1">ADMIN ACCESS</div>}
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
              <Globe className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-500 transition-colors">3. Connect</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              One unified ID. We export our "Trust Score" to partners, tournaments, and social platforms.
            </p>
          </div>
          </Link>
        </div>
      </Section>

      {/* --- TRACTION / ROADMAP --- */}
      <Section className="bg-white/5">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-ggloop-rose-gold font-bold tracking-widest uppercase mb-4 text-sm">Where We Are</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">Execution Machine.</h3>
            <p className="text-gray-400 text-lg mb-8">
              We don't write decks. We ship code. In the last 48 hours, we've deployed our core analytics engine and mobile beta.
            </p>
            
            <Link href="/">
              <div className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <Rocket className="h-5 w-5" />
                Live Demo
              </div>
            </Link>
          </div>
          
          <div className="bg-black/40 p-8 rounded-2xl border border-white/10">
            <h4 className="text-white font-bold mb-8">Roadmap Status</h4>
            <div className="space-y-0">
               <RoadmapItem 
                 phase="Level 13" 
                 title="Analytics Engine" 
                 status="Live" 
                 description="Real-time telemetry processing 1000+ events/sec. Fraud gating active." 
               />
               <RoadmapItem 
                 phase="Level 14" 
                 title="Mobile Companion" 
                 status="Live" 
                 description="PWA launched. Gamers can verify skills on-the-go. Notification layer active." 
               />
               <RoadmapItem 
                 phase="Level 15" 
                 title="Partner API" 
                 status="In Development" 
                 description="Opening our 'Trust Protocol' to 3rd party tournament organizers." 
               />
            </div>
          </div>
        </div>
      </Section>

      {/* --- THE ASK / INVESTMENT --- */}
      <Section className="text-center relative">
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-ggloop-orange/10 to-transparent pointer-events-none" />
        
        <h2 className="text-ggloop-rose-gold font-bold tracking-widest uppercase mb-4 text-sm animate-pulse">Investment Opportunity</h2>
        <h3 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
          JOIN THE REVOLUTION
        </h3>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
          We are seeking strategic partners to help us scale the <strong className="text-white">Infrastructure of Trust</strong> to 10M users.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
           <a href="mailto:founder@ggloop.io" className="bg-ggloop-orange text-black text-lg font-bold px-8 py-4 rounded-xl hover:bg-orange-400 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-2">
             <Layout className="h-5 w-5" />
             Partner With Us
           </a>
           <div className="text-gray-500 text-sm font-medium">
             Seed Round Open • Strategic Allocations Available
           </div>
        </div>

        <div className="mt-24 border-t border-white/10 pt-8 flex items-center justify-center gap-3 opacity-50">
          <ShieldCheck className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-bold tracking-widest text-gray-500">GG LOOP • EST 2025</span>
        </div>
      </Section>

    </div>
  );
}


