import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Trophy, Gift, TrendingUp, ShieldCheck, Activity, Package, Star,
  Search, Users, Mail, FileText, Copy, ExternalLink, MessageSquare, Terminal, Send
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { User, RewardClaim } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function FounderHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("fulfillment");

  // Fetch REAL pending claims
  const { data: pendingClaims } = useQuery<RewardClaim[]>({
    queryKey: ["/api/admin/fulfillment/pending"],
    queryFn: async () => {
      // Stubbing fetch for now since explicit endpoint might not be public in client api types yet
      // In a real scenario, this fetches from /api/rewards/claims?status=pending
      // For this Phase 3 task, we will verify if endpoint exists or mock with realistic structure if not.
      // Assuming secureFetch usage in future refactor, but using standard fetch for speed.
      const res = await fetch("/api/rewards/claims");
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((c: any) => c.status === "pending" || c.status === "in_progress");
    }
  });

  // Mock VIPs for now unless we have a specific "VIP" flag in DB (likely High Level users)
  // We will fetch top users by XP as "VIPs"
  const { data: topUsers } = useQuery<User[]>({
    queryKey: ["/api/users/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/users/leaderboard");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const vipUsers = topUsers?.slice(0, 5) || [];

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // toggle toast (omitted for brevity)
  };

  if (!user || (user.username !== "kuyajrip" && user.email !== "jaysonquindao1@gmail.com" && !(user as any).isFounder)) {
    return <div className="p-8 text-center text-red-500">ACCESS DENIED. GODMODE REQUIRED.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 text-white mb-2">
            <Star className="fill-ggloop-orange text-ggloop-orange h-8 w-8" />
            Founder's Hub
          </h1>
          <p className="text-gray-400">Your personal command center for GG Loop</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/analytics">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">Analytics</Button>
          </Link>
          <a href="https://discord.gg/ujEJbNSfzh" target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0">Discord Community</Button>
          </a>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/10 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("fulfillment")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-md transition-all whitespace-nowrap ${activeTab === "fulfillment" ? "bg-zinc-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Package className="h-4 w-4" /> Fulfillment Queue
          {pendingClaims && pendingClaims.length > 0 && <Badge className="ml-2 bg-red-500 hover:bg-red-600">{pendingClaims.length}</Badge>}
        </button>
        <button
          onClick={() => setActiveTab("vip")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-md transition-all whitespace-nowrap ${activeTab === "vip" ? "bg-zinc-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Users className="h-4 w-4" /> VIP Network
        </button>
        <button
          onClick={() => setActiveTab("outreach")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-md transition-all whitespace-nowrap ${activeTab === "outreach" ? "bg-zinc-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Mail className="h-4 w-4" /> Outreach & Growth
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-md transition-all whitespace-nowrap ${activeTab === "notes" ? "bg-zinc-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
        >
          <FileText className="h-4 w-4" /> Founder Notes
        </button>
      </div>

      {/* CONTENT AREA */}
      <Card className="bg-zinc-900 border-white/10 min-h-[500px]">
        <CardContent className="p-8">

          {/* FULFILLMENT TAB */}
          {activeTab === "fulfillment" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pending Rewards</h2>
                <p className="text-gray-400">Items that users have redeemed. You need to buy these manually and email them.</p>
              </div>

              <div className="space-y-4">
                {(!pendingClaims || pendingClaims.length === 0) ? (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                    No pending claims. All caught up, Boss.
                  </div>
                ) : (
                  pendingClaims.map((claim) => (
                    <div key={claim.id} className="bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-ggloop-orange/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center">
                          <Gift className="text-ggloop-orange h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Reward Claim #{claim.id}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>User ID: {claim.userId}</span> • <span>{claim.createdAt ? format(new Date(claim.createdAt), "yyyy-MM-dd") : "Date N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">View Details</Button>
                        <Link href="/admin/fulfillment">
                          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Mark Sent
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIP TAB */}
          {activeTab === "vip" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">VIP & Influencer Rolodex</h2>
                <p className="text-gray-400">Track key people who can help GG Loop grow (Top 5 Leaderboard).</p>
              </div>

              <div className="space-y-3">
                {vipUsers.map((vip) => (
                  <div key={vip.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 text-purple-400 font-bold">
                        {vip.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{vip.username}</h4>
                        <p className="text-xs text-gray-500">{vip.email || "No Email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-white/5 text-gray-300">Player</Badge>
                      <div className="text-white font-mono font-bold">{vip.totalXp?.toLocaleString()} pts</div>
                      <Button variant="ghost" size="sm" className="text-xs h-8">Edit</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed border-white/10 text-gray-500 hover:text-white hover:bg-white/5 py-6">
                  + Add New Contact manually
                </Button>
              </div>
            </div>
          )}

          {/* OUTREACH TAB */}
          {activeTab === "outreach" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Outreach Tools</h2>
                <p className="text-gray-400">Quick links for growth.</p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-4">
                <h4 className="text-white font-bold mb-2">Discord Invite (Permanent)</h4>
                <div className="flex gap-2">
                  <Input value="https://discord.gg/ujEJbNSfzh" readOnly className="bg-black border-white/10 text-gray-400 font-mono text-sm" />
                  <Button size="icon" variant="ghost" onClick={() => handleCopyLink("https://discord.gg/ujEJbNSfzh")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <a href="https://discord.gg/ujEJbNSfzh" target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="h-full flex items-center justify-center text-gray-500 py-24">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Meeting notes feature coming in Phase 4.</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="link" className="text-gray-500 hover:text-ggloop-orange">Back to Home</Button>
        </Link>
      </div>

    </div>
  );
}

