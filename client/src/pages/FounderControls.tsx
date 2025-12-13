import AdminLayout from "@/components/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Shield, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface SystemHealth {
  timestamp: string;
  payment: {
    successRate: number;
    failedCount: number;
    lastFailure: string | null;
  };
  rewards: {
    pending: number;
    apiStatus: string;
  };
  users: {
    newSignups24h: number;
    activeSubscriptions: number;
  };
  matchSync: {
    lastSync: string;
    status: string;
    failedCount: number;
  };
}

interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetUserId: string;
  details: {
    before?: number;
    after?: number;
    reason: string;
    amount?: number;
  };
  timestamp: string;
  ipAddress?: string;
}

export default function FounderControls() {
  const { toast } = useToast();
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  // Fetch system health
  const { data: health, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery<AuditLogEntry[]>({
    queryKey: ["/api/admin/audit-log"],
  });

  // Manual point adjustment mutation
  const adjustPointsMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; amount: number; reason: string }) => {
      const res = await apiRequest("POST", "/api/admin/points/adjust", data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Points Adjusted",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-log"] });
      setAdjustUserId("");
      setAdjustAmount("");
      setAdjustReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust points",
        variant: "destructive",
      });
    },
  });

  const handleAdjustPoints = () => {
    if (!adjustUserId || !adjustAmount || !adjustReason) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(adjustAmount);
    if (isNaN(amount)) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a number",
        variant: "destructive",
      });
      return;
    }

    adjustPointsMutation.mutate({
      targetUserId: adjustUserId,
      amount,
      reason: adjustReason,
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto max-w-7xl px-4 py-16 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-heading tracking-tight">
                  Founder Controls
                </h1>
                <p className="text-muted-foreground mt-1">
                  Complete operational control of GG Loop
                </p>
              </div>
            </div>
            <Button 
              onClick={() => refetchHealth()} 
              variant="outline" 
              size="sm"
              data-testid="button-refresh-health"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Health</p>
                  <p className="text-2xl font-bold font-mono" data-testid="stat-payment-health">
                    {health?.payment.successRate || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <p className="text-2xl font-bold font-mono" data-testid="stat-pending-rewards">
                    {health?.rewards.pending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Signups (24h)</p>
                  <p className="text-2xl font-bold font-mono" data-testid="stat-new-signups">
                    {health?.users.newSignups24h || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={health?.matchSync.status === "healthy" ? "border-green-500/20" : "border-red-500/20"}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg border ${
                  health?.matchSync.status === "healthy" 
                    ? "bg-green-500/10 border-green-500/20" 
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <Activity className={`h-6 w-6 ${
                    health?.matchSync.status === "healthy" ? "text-green-500" : "text-red-500"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Match Sync</p>
                  <p className="text-lg font-bold capitalize" data-testid="stat-match-sync">
                    {health?.matchSync.status || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Tabs */}
        <Tabs defaultValue="points" className="space-y-6">
          <TabsList>
            <TabsTrigger value="points" data-testid="tab-points">
              <DollarSign className="h-4 w-4 mr-2" />
              Point Adjustments
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">
              <Shield className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="limits" data-testid="tab-limits">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Spending Limits
            </TabsTrigger>
          </TabsList>

          {/* Point Adjustments Tab */}
          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle>Manual Point Adjustment</CardTitle>
                <CardDescription>
                  Add or remove points from any user account. All adjustments are logged to the audit trail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user UUID"
                    value={adjustUserId}
                    onChange={(e) => setAdjustUserId(e.target.value)}
                    data-testid="input-user-id"
                  />
                  <p className="text-sm text-muted-foreground">
                    Find user IDs in the User Management section or database
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Positive to add, negative to remove"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    data-testid="input-amount"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter positive numbers to add points, negative to remove
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Required)</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Compensation for technical issue, Refund for unfulfilled reward, etc."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    rows={3}
                    data-testid="input-reason"
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a clear explanation for this adjustment (minimum 5 characters)
                  </p>
                </div>

                <Button
                  onClick={handleAdjustPoints}
                  disabled={adjustPointsMutation.isPending}
                  data-testid="button-adjust-points"
                >
                  {adjustPointsMutation.isPending ? "Processing..." : "Adjust Points"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Complete history of all admin actions. Logs are permanent and cannot be deleted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border rounded-lg space-y-2"
                        data-testid={`audit-entry-${log.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-muted-foreground">
                              by {log.adminEmail}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        
                        {log.details.amount !== undefined && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Amount: </span>
                            <span className={log.details.amount > 0 ? "text-green-500" : "text-red-500"}>
                              {log.details.amount > 0 ? "+" : ""}{log.details.amount}
                            </span>
                            <span className="text-muted-foreground ml-4">
                              {log.details.before} → {log.details.after}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          <span>{log.details.reason}</span>
                        </div>

                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit log entries yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spending Limits Tab */}
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>Spending Limits Configuration</CardTitle>
                <CardDescription>
                  Safety limits to protect your budget and prevent abuse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Per-User Daily Redemptions</span>
                      <Badge variant="secondary">3 / day</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maximum number of rewards a single user can redeem per day
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Per-User Monthly Value</span>
                      <Badge variant="secondary">$500 / month</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maximum dollar value a user can redeem per month
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Global Daily Value</span>
                      <Badge variant="secondary">$5,000 / day</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total platform-wide daily reward redemption cap
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Large Redemption Cooling</span>
                      <Badge variant="secondary">60 minutes</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Wait time between large redemptions ($100+)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">Budget Protection Active</p>
                      <p className="text-sm text-muted-foreground">
                        These limits automatically prevent abuse and protect your monthly budget. 
                        You can override them for specific users if needed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
