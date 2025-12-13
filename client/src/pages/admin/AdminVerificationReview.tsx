import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Flag, ExternalLink } from "lucide-react";

export default function AdminVerificationReview() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [notes, setNotes] = useState("");

    const { data: queue } = useQuery<{ items: any[]; total: number }>({
        queryKey: ["/api/verification/queue", { status: "pending", limit: 20 }],
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, action }: { id: number; action: string }) => {
            const response = await fetch(`/api/verification/review/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, notes }),
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to process review");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Review Processed", description: "Verification item updated successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/verification/queue"] });
            queryClient.invalidateQueries({ queryKey: ["/api/verification/stats"] });
            setSelectedItem(null);
            setNotes("");
        },
        onError: (error: Error) => {
            toast({ title: "Review Failed", description: error.message, variant: "destructive" });
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Verification Review Queue</h1>
                <p className="text-muted-foreground">{queue?.total || 0} items pending review</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Queue List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Pending Items</h2>
                    {queue?.items.map((item) => (
                        <Card
                            key={item.id}
                            className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? "border-primary" : ""
                                }`}
                            onClick={() => setSelectedItem(item)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {item.itemType} #{item.itemId}
                                    </CardTitle>
                                    <Badge variant={
                                        item.priority === 4 ? "destructive" :
                                            item.priority === 3 ? "default" :
                                                "secondary"
                                    }>
                                        Priority {item.priority}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    User: {item.userId} | Due: {new Date(item.dueBy).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                    {queue?.items.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No pending items
                        </div>
                    )}
                </div>

                {/* Review Panel */}
                <div>
                    {selectedItem ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Item #{selectedItem.id}</CardTitle>
                                <CardDescription>
                                    {selectedItem.itemType} | Priority {selectedItem.priority}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold">Item Details:</div>
                                    <div className="text-sm text-muted-foreground">
                                        Type: {selectedItem.itemType}<br />
                                        Item ID: {selectedItem.itemId}<br />
                                        User ID: {selectedItem.userId}<br />
                                        Status: {selectedItem.status}<br />
                                        Created: {new Date(selectedItem.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Review Notes:</label>
                                    <Textarea
                                        placeholder="Add notes about this review..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => reviewMutation.mutate({ id: selectedItem.id, action: "approve" })}
                                        disabled={reviewMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => reviewMutation.mutate({ id: selectedItem.id, action: "reject" })}
                                        disabled={reviewMutation.isPending}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => reviewMutation.mutate({ id: selectedItem.id, action: "flag" })}
                                        disabled={reviewMutation.isPending}
                                        variant="outline"
                                    >
                                        <Flag className="h-4 w-4 mr-2" />
                                        Flag
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Select an item from the queue to review
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
