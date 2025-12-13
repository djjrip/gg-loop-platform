import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, CheckCircle, XCircle, Package, DollarSign } from "lucide-react";

export default function AdminRewardsPanel() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: rewardsData } = useQuery<{ rewards: any[]; claims: any[] }>({
        queryKey: ["/api/admin/rewards"],
    });

    const approveMutation = useMutation({
        mutationFn: async (claimId: number) => {
            const response = await fetch(`/api/admin/rewards/approve/${claimId}`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to approve claim");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Claim Approved", description: "Reward claim approved successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
        },
        onError: (error: Error) => {
            toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (claimId: number) => {
            const response = await fetch(`/api/admin/rewards/reject/${claimId}`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to reject claim");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Claim Rejected", description: "Reward claim rejected" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
        },
        onError: (error: Error) => {
            toast({ title: "Rejection Failed", description: error.message, variant: "destructive" });
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Rewards Management</h1>
                <p className="text-muted-foreground">Manage reward catalog and approve claims</p>
            </div>

            {/* Reward Catalog */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Reward Catalog
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewardsData?.rewards.map((reward) => (
                        <Card key={reward.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{reward.name}</CardTitle>
                                <CardDescription>{reward.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Cost:</span>
                                        <Badge variant="secondary">{reward.costInPoints.toLocaleString()} pts</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Stock:</span>
                                        <Badge variant={reward.stock > 10 ? "default" : "destructive"}>
                                            {reward.stock} available
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Type:</span>
                                        <Badge variant="outline">{reward.type}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Status:</span>
                                        <Badge variant={reward.active ? "default" : "secondary"}>
                                            {reward.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Pending Claims */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Gift className="h-6 w-6" />
                    Pending Claims ({rewardsData?.claims.filter(c => c.status === 'pending').length || 0})
                </h2>
                <div className="space-y-4">
                    {rewardsData?.claims
                        .filter(claim => claim.status === 'pending')
                        .map((claim) => (
                            <Card key={claim.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Claim #{claim.id}</CardTitle>
                                            <CardDescription>
                                                User: {claim.userId} | Reward: {claim.rewardId}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{claim.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                <span className="font-semibold">Points Cost:</span> {claim.pointsCost?.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Claimed: {new Date(claim.claimedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => approveMutation.mutate(claim.id)}
                                                disabled={approveMutation.isPending}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => rejectMutation.mutate(claim.id)}
                                                disabled={rejectMutation.isPending}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    {rewardsData?.claims.filter(c => c.status === 'pending').length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No pending claims
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
