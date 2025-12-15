import React from "react";
import { Globe, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MobilePassport() {
  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Globe className="text-purple-500" /> GG Passport
      </h1>
      
      <Card className="bg-zinc-900 border-white/10 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
        <CardContent className="p-6 flex flex-col items-center">
           <div className="bg-white p-4 rounded-xl mb-4">
             <QrCode className="h-32 w-32 text-black" />
           </div>
           <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Universal ID</div>
           <div className="text-xl font-mono font-bold text-white">886-GG-LOOP-V1</div>
        </CardContent>
      </Card>
      
      <p className="text-center text-gray-400 text-sm">Scan at partner venues to verify rank.</p>
    </div>
  );
}
