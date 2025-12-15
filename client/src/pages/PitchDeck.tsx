import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Shield, 
  Trophy, 
  Activity, 
  Target, 
  Users, 
  Lock, 
  ArrowRight, 
  Zap,
  Globe,
  Database,
  Smartphone
} from "lucide-react";

export default function PitchDeck() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,40,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ggloop-orange/10 border border-ggloop-orange/20 text-ggloop-orange text-sm font-semibold tracking-wider uppercase mb-4">
            CONFIDENTIAL • 886 STUDIOS
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            THE <span className="text-primary">INFRASTRUCTURE</span><br/>
            OF TRUST
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-medium">
            Building the verified economy for the next generation of gamers.
          </p>
        </div>

        {/* The Hook */}
        <div className="mb-20">
          <Card className="bg-ggloop-dark-shadow/80 border-ggloop-orange/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-ggloop-orange" />
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-6">The Thesis</h2>
              <blockquote className="text-2xl md:text-3xl text-gray-300 font-medium leading-relaxed border-l-4 border-ggloop-rose-gold pl-6 py-2 italic mb-8">
                "The resumes of the future are being written in game lobbies, but there's no way to verify them. LinkedIn is for jobs. GG LOOP is for the gaming economy."
              </blockquote>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-white/10">
                  <Shield className="h-8 w-8 text-ggloop-orange" />
                  <div>
                    <div className="font-bold text-white">Fraud-Gated</div>
                    <div className="text-sm text-gray-400">Desktop verified inputs</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-white/10">
                  <Trophy className="h-8 w-8 text-ggloop-orange" />
                  <div>
                    <div className="font-bold text-white">Merit-Based</div>
                    <div className="text-sm text-gray-400">Skill &gt; Popularity</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-white/10">
                  <Database className="h-8 w-8 text-ggloop-orange" />
                  <div>
                    <div className="font-bold text-white">Data-Driven</div>
                    <div className="text-sm text-gray-400">Granular analytics</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Live Demo Flow */}
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Activity className="h-8 w-8 text-ggloop-rose-gold" />
          The Live Ecosystem
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Level 12: Integrity */}
          <Link href="/admin/anticheat">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-red-900/40 to-black border border-red-500/30 rounded-xl p-6 h-full hover:border-red-500/60 transition-all hover:scale-105 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <Lock className="h-8 w-8 text-red-500" />
                  <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded">LEVEL 12</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Integrity Layer</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We don't guess. We verify. Real-time anomaly detection, velocity checks, and session validation.
                </p>
                <div className="text-red-400 text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  View Anti-Cheat <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Level 11: Economy */}
          <Link href="/creator-dashboard">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/30 rounded-xl p-6 h-full hover:border-green-500/60 transition-all hover:scale-105 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                  <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">LEVEL 11</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Economy Layer</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Gamified career paths. From Rookie to Elite. Automated payouts based on verified engagement metrics.
                </p>
                <div className="text-green-400 text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  View Economy <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Level 13: Data */}
          <Link href="/admin/analytics">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 rounded-xl p-6 h-full hover:border-blue-500/60 transition-all hover:scale-105 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">LEVEL 13</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Data Layer</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Granular engagement tracking. Not just clicks—verified sessions. We see the gameplay telemetry others miss.
                </p>
                <div className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  View Analytics <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* The Vision */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Target className="h-8 w-8 text-ggloop-rose-gold" />
            The Roadmap (Level 14-20)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-2 py-1">LIVE BETA</div>
              <div className="text-green-400 text-lg font-bold mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Mobile Companion (Level 14)
              </div>
              <p className="text-gray-400">PWA Verified. "Verified Skill Anywhere." Matches synced from desktop to mobile instantly.</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="text-ggloop-orange text-lg font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" /> Verification API
              </div>
              <p className="text-gray-400">Licensing our fraud-gating layer to other platforms. The "Stripe Identity" of gaming.</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center border-t border-white/10 pt-16">
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">BUILT BY GAMERS • VERIFIED BY CODE</p>
          <div className="flex items-center justify-center gap-4">
            <Zap className="h-6 w-6 text-ggloop-rose-gold animate-pulse" />
            <span className="text-2xl font-bold text-white">GG LOOP x 886 STUDIOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
