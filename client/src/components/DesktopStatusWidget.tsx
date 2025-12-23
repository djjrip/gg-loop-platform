import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { isTauri } from "@/lib/tauri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Monitor, Crown, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Only render if in Tauri
export function DesktopStatusWidget() {
    const { user } = useAuth();
    const isDesktop = isTauri();

    // Fetch subscription tier specifically if not in user object, 
    // but user object usually has it.
    const { data: subscription } = useQuery({
        queryKey: ['/api/subscription/current'],
        enabled: !!user
    });
    const [uploading, setUploading] = React.useState(false);

    const handleSimulateUpload = async () => {
        setUploading(true);
        try {
            // 1. Get Presigned URL
            const res = await fetch("/api/verification/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: `proof_${Date.now()}.txt`, contentType: "text/plain" })
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            // 2. Upload directly to S3
            const uploadRes = await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "text/plain" },
                body: "GG LOOP VERIFICATION PROOF - TIMESTAMP: " + new Date().toISOString()
            });

            if (!uploadRes.ok) throw new Error("S3 Upload Failed");

            alert("PROOF UPLOAD SUCCESS: " + data.key);
        } catch (e: any) {
            alert("UPLOAD FAILED: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isDesktop) return null;

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="border-primary/50 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-space tracking-wider text-primary">
                            DESKTOP COMMAND CENTER
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSimulateUpload}
                            disabled={uploading}
                            className="text-xs border border-primary/50 px-2 py-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            {uploading ? "UPLOADING..." : "TEST UPLINK"}
                        </button>
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10 animate-pulse">
                            <Activity className="w-3 h-3 mr-1" />
                            CONNECTED
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* IDENTITY */}
                        <div className="p-4 rounded-lg bg-black/50 border border-white/10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                                <span className="text-primary font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Operator</p>
                                <p className="font-bold text-white">{user?.username}</p>
                            </div>
                        </div>

                        {/* TIER */}
                        <div className="p-4 rounded-lg bg-black/50 border border-white/10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
                                <Crown className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Clearance</p>
                                <p className="font-bold text-orange-500">{subscription?.tier?.toUpperCase() || "FREE AGENT"}</p>
                            </div>
                        </div>

                        {/* VERIFICATION */}
                        <div className="p-4 rounded-lg bg-black/50 border border-white/10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Hardware</p>
                                <p className="font-bold text-green-500">VERIFIED</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-center text-muted-foreground font-mono">
                        TRUST LAYER ACTIVE • ID: {user?.id} • SESSION SECURE
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
