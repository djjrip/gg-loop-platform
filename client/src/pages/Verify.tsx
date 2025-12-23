import React from "react";
import { Shield, ShieldCheck, ShieldAlert, Loader2, BarChart3, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

interface TrustScore {
  score: number;
  tier: string;
  reasons: string[];
  components: any;
}

export default function MobileVerify() {
  const { data: trustData, isLoading, isError } = useQuery<TrustScore>({
    queryKey: ['/api/trust/score'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ggloop-orange" />
      </div>
    );
  }

  const score = trustData?.score || 0;
  const tier = trustData?.tier || 'UNVERIFIED';
  const reasons = trustData?.reasons || [];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ELITE': return 'text-purple-500 border-purple-500';
      case 'TRUSTED': return 'text-green-500 border-green-500';
      case 'DEVELOPING': return 'text-yellow-500 border-yellow-500';
      default: return 'text-zinc-500 border-zinc-500';
    }
  };

  const tierColor = getTierColor(tier);

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 font-sans">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="text-ggloop-orange" /> Verification
      </h1>

      {/* Trust Score Card */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${tier === 'ELITE' ? 'from-purple-500 to-blue-600' : tier === 'TRUSTED' ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-500'}`} />
        <CardContent className="p-6 text-center">
          <div className="mb-2 text-sm text-zinc-400 uppercase tracking-widest font-semibold">Current Trust Score</div>
          <div className={`text-6xl font-black mb-2 flex items-center justify-center gap-1 ${tierColor.split(' ')[0]}`}>
            {score}
            <span className="text-lg text-zinc-600 font-normal">/100</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${tierColor} bg-opacity-10 mb-6 uppercase`}>
            {tier} Tier
          </div>

          <Progress value={score} className="h-2 bg-zinc-800 mb-4" indicatorClassName={tier === 'ELITE' ? 'bg-purple-500' : tier === 'TRUSTED' ? 'bg-green-500' : 'bg-yellow-500'} />

          <p className="text-xs text-zinc-500 mb-6">
            Trust scores are earned over time through verified gameplay, consistent activity, and valid hardware checks.
          </p>

          <Button className="w-full bg-ggloop-orange hover:bg-orange-600 text-white font-bold">
            {tier === 'UNVERIFIED' ? 'Start Verification \u2192' : 'View Detailed Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Breakdown / Reasons */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-zinc-400" /> Score Breakdown
        </h3>

        {reasons.length > 0 ? (
          reasons.map((reason, idx) => (
            <Card key={idx} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm font-medium">{reason}</span>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed text-zinc-500 text-sm">
            No trust signals detected yet.
          </div>
        )}

        {/* How to Improve (Static for now, could be dynamic) */}
        {score < 100 && (
          <Card className="bg-zinc-900 border-zinc-800 opacity-75">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Lock className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Desktop App Verification</div>
                <div className="text-xs text-zinc-500">+40 Points (Locked)</div>
              </div>
              <Button size="sm" variant="outline" className="h-8 border-zinc-700 text-xs">
                Get App
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
