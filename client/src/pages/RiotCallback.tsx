import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RiotCallback() {
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying with Riot Games...");
    const [location, setLocation] = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const verifyRiot = async () => {
            try {
                // Parse params
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                const state = params.get("state");

                if (!code || !state) {
                    setStatus("error");
                    setMessage("Missing authentication parameters from Riot.");
                    return;
                }

                // Call backend
                const res = await fetch("/api/riot/oauth/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, state })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to link account");
                }

                setStatus("success");
                setMessage(`Successfully linked Riot Account: ${data.gameName} #${data.tagLine}`);

                // Auto-redirect after 3 seconds
                setTimeout(() => {
                    if (user?.id) {
                        setLocation(`/profile/${user.id}`);
                    } else {
                        setLocation("/dashboard"); // Fallback
                    }
                }, 3000);

            } catch (error: any) {
                console.error("Riot Callback Error", error);
                setStatus("error");
                setMessage(error.message || "Failed to link Riot Account. Please try again.");
            }
        };

        verifyRiot();
    }, [user, setLocation]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 text-center space-y-6">
                {status === "verifying" && (
                    <>
                        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                        <h2 className="text-xl font-bold">Connecting to Riot...</h2>
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h2 className="text-xl font-bold">Connected!</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm text-primary animate-pulse">Redirecting to profile...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-12 w-12 text-destructive mx-auto" />
                        <h2 className="text-xl font-bold">Connection Failed</h2>
                        <p className="text-destructive font-medium">{message}</p>
                        <Button
                            variant="default"
                            onClick={() => user?.id ? setLocation(`/profile/${user.id}`) : setLocation("/")}
                        >
                            Return to App
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}
