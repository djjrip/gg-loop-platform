import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Coins } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function UserManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pointsAmount, setPointsAmount] = useState("");
    const [pointsReason, setPointsReason] = useState("");

    const { data: users, isLoading } = useQuery({
        queryKey: ["/api/admin/users"],
    });

    const adjustPointsMutation = useMutation({
        mutationFn: async (data: { userId: string; points: number; reason: string }) => {
            await apiRequest("POST", `/api/admin/users/${data.userId}/points`, {
                points: data.points,
                reason: data.reason,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({
                title: "Success",
                description: "Points adjusted successfully",
            });
            setSelectedUser(null);
            setPointsAmount("");
            setPointsReason("");
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to adjust points",
                variant: "destructive",
            });
        },
    });

    const filteredUsers = users?.filter((user: any) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdjustPoints = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        adjustPointsMutation.mutate({
            userId: selectedUser.id,
            points: parseInt(pointsAmount),
            reason: pointsReason,
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto p-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers?.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {user.profileImageUrl && (
                                                <img
                                                    src={user.profileImageUrl}
                                                    alt={user.username}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            )}
                                            {user.username || "No Username"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.totalPoints}</TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog open={selectedUser?.id === user.id} onOpenChange={(open) => !open && setSelectedUser(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <Coins className="mr-2 h-4 w-4" />
                                                    Adjust Points
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Adjust Points for {user.username}</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleAdjustPoints} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Amount (positive to add, negative to remove)</Label>
                                                        <Input
                                                            type="number"
                                                            value={pointsAmount}
                                                            onChange={(e) => setPointsAmount(e.target.value)}
                                                            placeholder="e.g. 500 or -100"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Reason (for audit log)</Label>
                                                        <Input
                                                            value={pointsReason}
                                                            onChange={(e) => setPointsReason(e.target.value)}
                                                            placeholder="e.g. Manual correction for..."
                                                            required
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        className="w-full"
                                                        disabled={adjustPointsMutation.isPending}
                                                    >
                                                        {adjustPointsMutation.isPending ? "Processing..." : "Confirm Adjustment"}
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
}
