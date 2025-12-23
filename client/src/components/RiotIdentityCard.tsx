import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Link as LinkIcon, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface RiotStatus {
    linked: boolean;
    account?: {
        gameName: string;
        tagLine: string;
        lastSyncAt: string | null;
        game: string;
        region: string;
    };
}

export function RiotIdentityCard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isLinking, setIsLinking] = useState(false);

    // Fetch Status
    const { data: status, isLoading } = useQuery<RiotStatus>({
        queryKey: ["riot-status"],
        queryFn: async () => {
            const res = await fetch("/api/riot/status");
            if (!res.ok) throw new Error("Failed to fetch status");
            return res.json();
        }
    });

    // Sync Mutation
    const syncMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/matches/sync", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Sync failed");
            return data;
        },
        onSuccess: (data) => {
            toast({
                title: "Sync Complete",
                description: `Fetched ${data.matchesFetched}, New ${data.matchesNewInserted}, Skipped ${data.matchesSkipped}`,
            });
            queryClient.invalidateQueries({ queryKey: ["riot-status"] });
            // Optionally invalidate profile stats if they update
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
        },
        onError: (error: any) => {
            toast({
                title: "Sync Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    // Link Action
    const handleLink = async () => {
        setIsLinking(true);
        try {
            const res = await fetch("/api/riot/oauth/init", { method: "POST" });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No redirect URL returned");
            }
        } catch (error: any) {
            toast({
                title: "Connection Failed",
                description: "Could not initialize Riot Login. Please try again.",
                variant: "destructive"
            });
            setIsLinking(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                </div>
            </Card>
        );
    }

    const isLinked = status?.linked && status.account;

    return (
        <Card className="p-6 mb-6 border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <LinkIcon className="w-24 h-24" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">

                {/* Identity Info */}
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isLinked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isLinked ? <CheckCircle className="h-6 w-6" /> : <LinkIcon className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            Riot Games ID
                            {isLinked && <Badge variant="default" className="bg-green-600 text-white">LINKED</Badge>}
                            {!isLinked && <Badge variant="secondary">NOT LINKED</Badge>}
                        </h3>
                        {isLinked ? (
                            <div className="text-sm text-muted-foreground">
                                <span className="font-mono text-foreground font-medium">{status.account!.gameName} #{status.account!.tagLine}</span>
                                <span className="mx-2">•</span>
                                {status.account!.region.toUpperCase()}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Link your account to verify matches and earn rewards.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isLinked ? (
                        <div className="text-right w-full md:w-auto">
                            <p className="text-xs text-muted-foreground mb-1">
                                Last synced: {status.account!.lastSyncAt ? formatDistanceToNow(new Date(status.account!.lastSyncAt), { addSuffix: true }) : 'Never'}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncMutation.mutate()}
                                disabled={syncMutation.isPending}
                            >
                                {syncMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                Sync Matches
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleLink}
                            disabled={isLinking}
                            className="w-full md:w-auto"
                        >
                            {isLinking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                            Link Riot Account
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
