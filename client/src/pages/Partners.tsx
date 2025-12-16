import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, Code, ShieldCheck, Zap } from "lucide-react";

export default function Partners() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
       <div className="max-w-5xl mx-auto">
           {/* HERO */}
           <div className="text-center mb-16">
               <Badge className="bg-ggloop-orange/20 text-ggloop-orange hover:bg-ggloop-orange/30 mb-4 border-ggloop-orange/50">LEVEL 15 API LIVE</Badge>
               <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
                   The <span className="text-ggloop-rose-gold">Infrastructure of Trust</span> for Your Platform
               </h1>
               <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                   Integrate GG LOOP''s Verified Skill Protocol directly into your tournament platform, recruitment tool, or matchmaking engine.
               </p>
               <div className="flex justify-center gap-4">
                   <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold">Read Documentation</Button>
                   <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">Request API Key</Button>
               </div>
           </div>

           {/* FEATURES */}
           <div className="grid md:grid-cols-3 gap-6 mb-24">
               <Card className="bg-zinc-900 border-white/10">
                   <CardContent className="p-8">
                       <ShieldCheck className="w-10 h-10 text-green-500 mb-6" />
                       <h3 className="text-xl font-bold mb-2">Fraud-Free Identity</h3>
                       <p className="text-gray-400 text-sm">Verify user hardware ID and gameplay integrity instantly via the device-verified badge.</p>
                   </CardContent>
               </Card>
               <Card className="bg-zinc-900 border-white/10">
                   <CardContent className="p-8">
                       <Zap className="w-10 h-10 text-yellow-500 mb-6" />
                       <h3 className="text-xl font-bold mb-2">Real-Time Stats</h3>
                       <p className="text-gray-400 text-sm">Fetch live skill ratings (XP, Match History) verified by our local anti-cheat client.</p>
                   </CardContent>
               </Card>
               <Card className="bg-zinc-900 border-white/10">
                   <CardContent className="p-8">
                       <Layout className="w-10 h-10 text-purple-500 mb-6" />
                       <h3 className="text-xl font-bold mb-2">Universal Profile</h3>
                       <p className="text-gray-400 text-sm">One ID for all games. Eliminate smurfs from your platform forever.</p>
                   </CardContent>
               </Card>
           </div>

           {/* DOCS */}
           <div className="p-8 md:p-12 bg-zinc-900/50 border border-white/10 rounded-2xl mb-12">
               <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Code className="text-ggloop-orange" /> Integration</h2>

               <div className="space-y-12">
                   <div>
                       <h3 className="text-xl font-bold mb-4">1. Verify User</h3>
                       <p className="text-gray-400 mb-4">Check if a user matches our Verified Database.</p>
                       <div className="bg-black p-6 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto text-gray-300">
                           <div className="flex gap-2 mb-2">
                               <span className="text-purple-400">POST</span>
                               <span className="text-white">https://api.ggloop.io/v1/partner/verify-user</span>
                           </div>
                           <pre className="text-green-400 mb-2">Header: x-api-key: YOUR_KEY</pre>
                           <pre>{`{
  "email": "player@example.com"
}`}</pre>
                       </div>
                   </div>

                   <div>
                       <h3 className="text-xl font-bold mb-4">2. Get Status & Skill</h3>
                       <p className="text-gray-400 mb-4">Retrieve verified metrics for matchmaking or rewards.</p>
                       <div className="bg-black p-6 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto text-gray-300">
                           <div className="flex gap-2 mb-2">
                               <span className="text-blue-400">GET</span>
                               <span className="text-white">https://api.ggloop.io/v1/partner/user-status/:id</span>
                           </div>
                           <pre className="text-yellow-400">{`{
  "userId": 1024,
  "username": "TopGamer",
  "trustScore": 100,
  "isHardwareVerified": true,
  "totalXp": 15450,
  "status": "active"
}`}</pre>
                       </div>
                   </div>
               </div>
           </div>
           
           <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-ggloop-orange/20 to-transparent rounded-2xl border border-ggloop-orange/20">
               <h3 className="text-2xl font-bold mb-4">Ready to build?</h3>
               <Link href="/vision">
                   <Button size="lg" className="bg-ggloop-orange text-black hover:bg-orange-400 font-bold">View Our Vision</Button>
               </Link>
           </div>

       </div>
    </div>
  );
}
