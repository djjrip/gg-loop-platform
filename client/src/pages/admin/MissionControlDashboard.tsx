import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface MissionControlMetrics {
  totalClaims: number;
  pendingClaims: number;
  totalUsdSpent: number;
  fulfillmentRate: number;
  topRewardTypes: Array<{ type: string; count: number }>;
  streamerMetrics: Array<{
    userId: string;
    displayName: string;
    claimCount: number;
  }>;
}

interface RewardType {
  id: string;
  name: string;
  type: string;
  pointsCost: number;
  realValue: number;
  category: string;
  isActive: boolean;
}

interface RewardClaim {
  id: string;
  userId: string;
  rewardTypeId: string;
  status: "pending" | "in_progress" | "fulfilled" | "rejected";
  claimedAt: string;
  fulfillmentMethod?: string;
  fulfillmentData?: Record<string, any>;
  fulfillmentNotes?: string;
  adminNotes?: string;
  pointsSpent: number;
  userEmail?: string;
  userDisplayName?: string;
  fulfilledAt?: string;
  rejectedReason?: string;
}

export default function MissionControlDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("");
  const [fulfillmentCode, setFulfillmentCode] = useState("");
  const [fulfillmentNotes, setFulfillmentNotes] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.email?.includes("@ggloop.io");

  // Check auth on load
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLocation("/login");
      } else if (!isAdmin) {
        setLocation("/");
      }
    }
  }, [user, isAdmin, authLoading, setLocation]);

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<MissionControlMetrics>({
    queryKey: ["/api/admin/fulfillment/metrics"],
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch reward types
  const { data: rewardTypes = [] } = useQuery<RewardType[]>({
    queryKey: ["/api/admin/fulfillment/reward-types"],
    enabled: isAdmin,
  });

  // Fetch claims with filters
  const { data: claimsData, isLoading: claimsLoading } = useQuery<{
    claims: RewardClaim[];
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["/api/admin/fulfillment/claims", statusFilter],
    enabled: isAdmin && activeTab === "queue",
    queryFn: () =>
      apiRequest("GET", `/api/admin/fulfillment/claims?status=${statusFilter}`),
  });

  // Fetch streamer stats
  const { data: streamerStats } = useQuery<{
    streamerMetrics: MissionControlMetrics["streamerMetrics"];
  }>({
    queryKey: ["/api/admin/fulfillment/streamer-stats"],
    enabled: isAdmin && activeTab === "streamers",
  });

  // Update claim mutation
  const updateClaimMutation = useMutation({
    mutationFn: async (data: {
      claimId: string;
      status: string;
      fulfillmentMethod?: string;
      fulfillmentData?: Record<string, any>;
      fulfillmentNotes?: string;
      rejectedReason?: string;
    }) => {
      return apiRequest("PATCH", `/api/admin/fulfillment/claims/${data.claimId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fulfillment/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fulfillment/metrics"] });
      toast({
        title: "Success!",
        description: "Claim updated successfully",
      });
      setSelectedClaim(null);
      setFulfillmentMethod("");
      setFulfillmentCode("");
      setFulfillmentNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Founder access required</p>
        </div>
      </div>
    );
  }

  const handleFulfillClick = (claim: RewardClaim) => {
    setSelectedClaim(claim);
    setFulfillmentMethod("");
    setFulfillmentCode("");
    setFulfillmentNotes("");
  };

  const handleConfirmFulfill = () => {
    if (!selectedClaim) return;

    updateClaimMutation.mutate({
      claimId: selectedClaim.id,
      status: "fulfilled",
      fulfillmentMethod: fulfillmentMethod || "manual_note",
      fulfillmentData: fulfillmentCode ? { code: fulfillmentCode } : undefined,
      fulfillmentNotes: fulfillmentNotes || undefined,
    });
  };

  const handleRejectClaim = (claim: RewardClaim, reason: string) => {
    updateClaimMutation.mutate({
      claimId: claim.id,
      status: "rejected",
      rejectedReason: reason,
    });
  };

  const claims = claimsData?.claims || [];
  const chartData = metrics?.topRewardTypes || [];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Founder Mission Control</h1>
          <p className="text-muted-foreground">
            Manage reward fulfillment and monitor streamer performance
          </p>
        </div>

        {/* High-Level Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.totalClaims || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {metrics?.pendingClaims || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Needs fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                USD Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(metrics?.totalUsdSpent || 0) / 100}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fulfillment cost</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fulfillment Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.fulfillmentRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Claims Queue</TabsTrigger>
            <TabsTrigger value="streamers">Streamer Stats</TabsTrigger>
          </TabsList>

          {/* TAB: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Reward Types</CardTitle>
                <CardDescription>Most claimed rewards this period</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Claims Queue */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fulfillment Queue</CardTitle>
                    <CardDescription>Manage pending and in-progress claims</CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <p className="text-muted-foreground">Loading claims...</p>
                ) : claims.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No claims in this status</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{claim.userDisplayName}</span>
                            <Badge
                              variant={
                                claim.status === "pending"
                                  ? "default"
                                  : claim.status === "fulfilled"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {claim.userEmail} • {claim.pointsSpent} points
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Claimed: {format(new Date(claim.claimedAt), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                        {claim.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFulfillClick(claim)}
                            >
                              Fulfill
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClaim(claim, "Admin rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Streamer Stats */}
          <TabsContent value="streamers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Streamers</CardTitle>
                <CardDescription>Streamer performance by reward claims</CardDescription>
              </CardHeader>
              <CardContent>
                {!streamerStats || streamerStats.streamerMetrics.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No streamer data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {streamerStats.streamerMetrics.map((streamer, idx) => (
                      <div
                        key={streamer.userId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{idx + 1}</Badge>
                          <div>
                            <p className="font-semibold">{streamer.displayName}</p>
                            <p className="text-xs text-muted-foreground">{streamer.userId}</p>
                          </div>
                        </div>
                        <Badge>{streamer.claimCount} claims</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fulfill Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fulfill Reward Claim</DialogTitle>
            <DialogDescription>
              Complete the fulfillment process and add tracking info
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6">
              {/* Claim Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-semibold">{selectedClaim.userDisplayName}</p>
                <p className="text-sm text-muted-foreground">{selectedClaim.userEmail}</p>
                <p className="text-sm text-muted-foreground">
                  Points: {selectedClaim.pointsSpent}
                </p>
                <p className="text-xs text-muted-foreground">
                  Claimed: {format(new Date(selectedClaim.claimedAt), "MMM d, yyyy")}
                </p>
              </div>

              {/* Fulfillment Method */}
              <div className="space-y-2">
                <Label>Fulfillment Method</Label>
                <Select value={fulfillmentMethod} onValueChange={setFulfillmentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_code">Email Code</SelectItem>
                    <SelectItem value="manual_note">Manual Note</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Code/Tracking */}
              {fulfillmentMethod === "email_code" && (
                <div className="space-y-2">
                  <Label>Gift Card Code</Label>
                  <Input
                    value={fulfillmentCode}
                    onChange={(e) => setFulfillmentCode(e.target.value)}
                    placeholder="Enter code to send to user"
                  />
                </div>
              )}

              {fulfillmentMethod === "shipped" && (
                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input
                    value={fulfillmentCode}
                    onChange={(e) => setFulfillmentCode(e.target.value)}
                    placeholder="UPS/FedEx tracking number"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Fulfillment Notes</Label>
                <Textarea
                  value={fulfillmentNotes}
                  onChange={(e) => setFulfillmentNotes(e.target.value)}
                  placeholder="Add any notes about this fulfillment..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedClaim(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmFulfill}
                  disabled={updateClaimMutation.isPending}
                >
                  {updateClaimMutation.isPending ? "Processing..." : "Mark Fulfilled"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
