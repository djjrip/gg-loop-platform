import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export default function AdminBrandsPanel() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [rejectReason, setRejectReason] = useState("");
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

    const { data: brandsData } = useQuery<{ brands: any[]; total: number }>({
        queryKey: ["/api/admin/brands/pending"],
    });

    const approveMutation = useMutation({
        mutationFn: async (brandId: string) => {
            const response = await fetch(`/api/admin/brands/approve/${brandId}`, {
                method: "POST",
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to approve brand");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Brand Approved", description: "Brand has been approved and is now live" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/brands/pending"] });
        },
        onError: (error: Error) => {
            toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ brandId, reason }: { brandId: string; reason: string }) => {
            const response = await fetch(`/api/admin/brands/reject/${brandId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to reject brand");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Brand Rejected", description: "Brand application has been rejected" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/brands/pending"] });
            setSelectedBrandId(null);
            setRejectReason("");
        },
        onError: (error: Error) => {
            toast({ title: "Rejection Failed", description: error.message, variant: "destructive" });
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Brand Partner Management</h1>
                <p className="text-muted-foreground">
                    Review and approve brand partnership applications
                </p>
            </div>

            <div className="mb-4">
                <Badge variant="secondary">
                    {brandsData?.total || 0} Pending Applications
                </Badge>
            </div>

            <div className="space-y-4">
                {brandsData?.brands.map((brand) => (
                    <Card key={brand.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        {brand.name}
                                    </CardTitle>
                                    <CardDescription>{brand.website}</CardDescription>
                                </div>
                                <Badge variant="secondary">{brand.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-semibold mb-1">Description:</div>
                                    <div className="text-sm text-muted-foreground">{brand.description}</div>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold mb-1">Submitted:</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(brand.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {selectedBrandId === brand.id ? (
                                    <div className="space-y-3 pt-3 border-t">
                                        <div className="text-sm font-semibold">Rejection Reason:</div>
                                        <Textarea
                                            placeholder="Enter reason for rejection..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => rejectMutation.mutate({ brandId: brand.id, reason: rejectReason })}
                                                disabled={rejectMutation.isPending || !rejectReason}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                Confirm Rejection
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedBrandId(null);
                                                    setRejectReason("");
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            onClick={() => approveMutation.mutate(brand.id)}
                                            disabled={approveMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve Brand
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedBrandId(brand.id)}
                                            variant="destructive"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Brand
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {brandsData?.brands.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        No pending brand applications
                    </div>
                )}
            </div>
        </div>
    );
}
