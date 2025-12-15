import React from "react";
import { ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MobileVerify() {
  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-ggloop-orange" /> Verification
      </h1>
      
      <Card className="bg-zinc-900 border-ggloop-orange/50 mb-6">
        <CardContent className="p-6 text-center">
           <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
             <ShieldCheck className="h-10 w-10 text-green-500" />
           </div>
           <h2 className="text-xl font-bold text-white mb-2">PC Verified</h2>
           <p className="text-gray-400 text-sm mb-4">Device ID: DESKTOP-886-STUDIOS</p>
           <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
             Sync Status Active
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
