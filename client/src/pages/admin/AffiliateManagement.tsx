import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AffiliateApplication {
  id: string;
  userId: string;
  status: string;
  applicationData: {
    platform: string;
    audience: string;
    contentType: string;
    reason: string;
    payoutEmail: string;
  };
  commissionTier: string;
  monthlyEarnings: number;
  totalEarnings: number;
  reviewNotes?: string;
  approvedAt?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface AffiliateStats {
  totalApplications: number;
  pendingReview: number;
  activeAffiliates: number;
  totalPaid: number;
}

export default function AffiliateManagement() {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<AffiliateApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [commissionTier, setCommissionTier] = useState("standard");

  const { data: stats } = useQuery<AffiliateStats>({
    queryKey: ["/api/admin/affiliate-stats"],
  });

  const { data: applications = [], isLoading } = useQuery<AffiliateApplication[]>({
    queryKey: ["/api/admin/affiliates"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reviewNotes,
      commissionTier,
    }: {
      id: string;
      status: string;
      reviewNotes?: string;
      commissionTier?: string;
    }) => {
      return apiRequest("PATCH", `/api/admin/affiliates/${id}`, {
        status,
        reviewNotes,
        commissionTier,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-stats"] });
      toast({
        title: "Application Updated",
        description: "Affiliate application has been updated successfully",
      });
      setSelectedApp(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedApp) return;
    updateMutation.mutate({
      id: selectedApp.id,
      status: "approved",
      reviewNotes,
      commissionTier,
    });
  };

  const handleReject = () => {
    if (!selectedApp) return;
    updateMutation.mutate({
      id: selectedApp.id,
      status: "rejected",
      reviewNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "default" as const, icon: Clock, text: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Rejected" },
    };
    const badge = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1 w-fit">
        <badge.icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Management</h1>
          <p className="text-muted-foreground">Review and manage affiliate applications</p>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {stats.totalApplications}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  {stats.pendingReview}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Affiliates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {stats.activeAffiliates}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  ${stats.totalPaid.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Affiliate Applications</CardTitle>
            <CardDescription>Review, approve, or reject affiliate applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && <p className="text-muted-foreground">Loading applications...</p>}

              {!isLoading && applications.length === 0 && (
                <p className="text-muted-foreground">No affiliate applications yet</p>
              )}

              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`card-affiliate-${app.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{app.user.username || app.user.email}</h3>
                      <p className="text-sm text-muted-foreground">{app.applicationData.payoutEmail}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Platform:</span>
                      <p className="font-medium">{app.applicationData.platform}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Audience:</span>
                      <p className="font-medium">{app.applicationData.audience}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Content Type:</span>
                      <p className="font-medium">{app.applicationData.contentType}</p>
                    </div>
                  </div>

                  {app.status === "approved" && (
                    <div className="grid md:grid-cols-3 gap-3 mb-3 p-3 bg-primary/5 rounded-lg">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Commission Tier:</span>
                        <p className="font-semibold">{app.commissionTier}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Monthly Earnings:</span>
                        <p className="font-semibold text-green-600">${app.monthlyEarnings}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total Earnings:</span>
                        <p className="font-semibold text-blue-600">${app.totalEarnings}</p>
                      </div>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes(app.reviewNotes || "");
                          setCommissionTier(app.commissionTier || "standard");
                        }}
                        data-testid={`button-review-${app.id}`}
                      >
                        {app.status === "pending" ? "Review Application" : "View Details"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Application from {app.user.username || app.user.email}</DialogTitle>
                        <DialogDescription>
                          Submitted on {new Date(app.createdAt).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Why GG Loop?</Label>
                          <p className="mt-1 p-3 bg-muted rounded-lg">{app.applicationData.reason}</p>
                        </div>

                        {app.status === "pending" && (
                          <>
                            <div>
                              <Label htmlFor="commissionTier">Commission Tier</Label>
                              <Select value={commissionTier} onValueChange={setCommissionTier}>
                                <SelectTrigger id="commissionTier">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard (5%)</SelectItem>
                                  <SelectItem value="silver">Silver (7.5%)</SelectItem>
                                  <SelectItem value="gold">Gold (10%)</SelectItem>
                                  <SelectItem value="platinum">Platinum (15%)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                              <Textarea
                                id="reviewNotes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                placeholder="Add internal notes about this application..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={handleApprove}
                                disabled={updateMutation.isPending}
                                className="flex-1"
                                data-testid="button-approve"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={handleReject}
                                disabled={updateMutation.isPending}
                                variant="destructive"
                                className="flex-1"
                                data-testid="button-reject"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </>
                        )}

                        {app.status !== "pending" && app.reviewNotes && (
                          <div>
                            <Label className="text-muted-foreground">Review Notes</Label>
                            <p className="mt-1 p-3 bg-muted rounded-lg">{app.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
