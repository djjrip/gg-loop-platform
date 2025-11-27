import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Search, Mail, Calendar, Trophy, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    totalPoints: number;
    isFounder: boolean;
    founderNumber: number | null;
    createdAt: string;
    lastLoginAt: string | null;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch users",
                });
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch users",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <>
            <Header />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">User Management</h1>
                    <p className="text-muted-foreground">View and manage all platform users</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Search Users</CardTitle>
                        <CardDescription>Search by email, name, or ID</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading users...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Users: {filteredUsers.length}</CardTitle>
                                    <CardDescription>
                                        {users.filter(u => u.isFounder).length} Founders · {users.length - users.filter(u => u.isFounder).length} Regular Members
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>

                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                                            {user.firstName || "Guest User"}
                                                            {user.isFounder && (
                                                                <Badge variant="default" className="ml-2">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    Founder #{user.founderNumber}
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    ID: {user.id}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Trophy className="h-4 w-4 text-primary" />
                                                    <span className="font-semibold">{user.totalPoints.toLocaleString()}</span>
                                                    <span className="text-muted-foreground">points</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    Joined {formatDate(user.createdAt)}
                                                </div>
                                                {user.lastLoginAt ? (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                        Last login {formatDate(user.lastLoginAt)}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <XCircle className="h-3 w-3 text-yellow-500" />
                                                        Never logged in
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/profile/${user.id}`}
                                                >
                                                    View Profile
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">No users found matching your search</p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
