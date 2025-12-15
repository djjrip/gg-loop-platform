import React from "react";
import { Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MobileTrack() {
  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Activity className="text-blue-500" /> Live Tracking
      </h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
             <div className="text-gray-400 text-xs uppercase mb-1">Today''s XP</div>
             <div className="text-2xl font-bold text-white">1,250</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
             <div className="text-gray-400 text-xs uppercase mb-1">Matches</div>
             <div className="text-2xl font-bold text-white">5</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Real-time telemetry from desktop client.
      </div>
    </div>
  );
}
