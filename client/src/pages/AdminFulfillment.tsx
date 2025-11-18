import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MapPin,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Link } from "wouter";

interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
  trackingNumber: string | null;
  fulfillmentNotes: string | null;
  fulfilledAt: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  user: {
    username: string | null;
    email: string | null;
  };
  reward: {
    title: string;
    fulfillmentType: string;
  };
}

export default function AdminFulfillment() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");

  const isAdmin = user?.email?.includes("@ggloop.io");

  // Client-side admin check - redirect non-admins and guests
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect unauthenticated users to login
        setLocation("/login");
      } else if (!isAdmin) {
        // Redirect authenticated non-admins to home
        setLocation("/");
      }
    }
  }, [user, isAdmin, authLoading, setLocation]);

  const { data: redemptions, isLoading } = useQuery<Redemption[]>({
    queryKey: ["/api/admin/redemptions"],
    enabled: isAdmin, // Only fetch if admin
  });

  const fulfillMutation = useMutation({
    mutationFn: async (data: { 
      redemptionId: string; 
      trackingNumber?: string; 
      notes?: string;
      giftCardCode?: string;
    }) => {
      return apiRequest("POST", "/api/admin/fulfill-redemption", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/redemptions"] });
      toast({
        title: "Success!",
        description: "Redemption marked as fulfilled",
      });
      setSelectedRedemption(null);
      setTrackingNumber("");
      setNotes("");
      setGiftCardCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show loading while checking auth
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

  // Show access denied only for authenticated non-admins (will redirect immediately)
  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const pendingRedemptions = redemptions?.filter(r => r.status === "pending") || [];
  const fulfilledRedemptions = redemptions?.filter(r => r.status === "fulfilled") || [];

  const handleFulfill = () => {
    if (!selectedRedemption) return;

    fulfillMutation.mutate({
      redemptionId: selectedRedemption.id,
      trackingNumber: trackingNumber || undefined,
      notes: notes || undefined,
      giftCardCode: giftCardCode || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "default" as const, icon: Clock, text: "Pending" },
      fulfilled: { variant: "default" as const, icon: CheckCircle, text: "Fulfilled" },
      failed: { variant: "destructive" as const, icon: XCircle, text: "Failed" },
    };
    const badge = variants[status as keyof typeof variants] || variants.pending;
    const Icon = badge.icon;
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-admin-title">Manual Fulfillment Dashboard</h1>
          <p className="text-muted-foreground">
            Track and fulfill reward redemptions manually
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card data-testid="card-pending-count">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-pending-count">
                <Clock className="h-6 w-6 text-yellow-500" />
                {pendingRedemptions.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-fulfilled-count">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fulfilled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-fulfilled-count">
                <CheckCircle className="h-6 w-6 text-green-500" />
                {fulfilledRedemptions.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-count">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-total-count">
                <Package className="h-6 w-6 text-primary" />
                {redemptions?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Redemptions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Fulfillment</CardTitle>
            <CardDescription>These redemptions need manual processing</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : pendingRedemptions.length === 0 ? (
              <p className="text-muted-foreground">No pending redemptions</p>
            ) : (
              <div className="space-y-4">
                {pendingRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`redemption-${redemption.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{redemption.reward.title}</h3>
                        {getStatusBadge(redemption.status)}
                        <Badge variant="outline" className="text-xs">
                          {redemption.reward.fulfillmentType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {redemption.user.email || redemption.user.username}
                        </div>
                        <div>
                          Points: {redemption.pointsSpent.toLocaleString()}
                        </div>
                        <div>
                          Redeemed: {format(new Date(redemption.redeemedAt), "MMM d, yyyy")}
                        </div>
                        {redemption.shippingAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {redemption.shippingCity}, {redemption.shippingState}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedRedemption(redemption);
                        setTrackingNumber(redemption.trackingNumber || "");
                        setNotes(redemption.fulfillmentNotes || "");
                      }}
                      data-testid="button-fulfill"
                    >
                      Fulfill
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Fulfilled */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Fulfilled</CardTitle>
            <CardDescription>Last 10 completed redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            {fulfilledRedemptions.length === 0 ? (
              <p className="text-muted-foreground">No fulfilled redemptions yet</p>
            ) : (
              <div className="space-y-3">
                {fulfilledRedemptions.slice(0, 10).map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    data-testid={`fulfilled-${redemption.id}`}
                  >
                    <div>
                      <p className="font-medium">{redemption.reward.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {redemption.user.email} • Fulfilled {format(new Date(redemption.fulfilledAt!), "MMM d")}
                      </p>
                    </div>
                    {redemption.trackingNumber && (
                      <Badge variant="outline" className="text-xs">
                        {redemption.trackingNumber}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Dialog */}
      <Dialog
        open={!!selectedRedemption}
        onOpenChange={(open) => !open && setSelectedRedemption(null)}
      >
        <DialogContent className="max-w-2xl" data-testid="dialog-fulfill">
          <DialogHeader>
            <DialogTitle>Fulfill Redemption</DialogTitle>
            <DialogDescription>
              Mark this redemption as fulfilled and add tracking information
            </DialogDescription>
          </DialogHeader>

          {selectedRedemption && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedRedemption.reward.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">User:</span> {selectedRedemption.user.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Points:</span> {selectedRedemption.pointsSpent}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedRedemption.reward.fulfillmentType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Redeemed:</span>{" "}
                    {format(new Date(selectedRedemption.redeemedAt), "MMM d, yyyy")}
                  </div>
                </div>
                {selectedRedemption.shippingAddress && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Shipping Address:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRedemption.shippingAddress}<br />
                      {selectedRedemption.shippingCity}, {selectedRedemption.shippingState} {selectedRedemption.shippingZip}<br />
                      {selectedRedemption.shippingCountry}
                    </p>
                  </div>
                )}
              </div>

              {selectedRedemption.reward.fulfillmentType === "digital" && (
                <div className="space-y-2">
                  <Label>Gift Card Code</Label>
                  <Input
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Enter gift card code to email to user"
                    data-testid="input-gift-card-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be emailed to the user automatically
                  </p>
                </div>
              )}

              {selectedRedemption.reward.fulfillmentType === "physical" && (
                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="UPS/FedEx tracking number"
                    data-testid="input-tracking-number"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Fulfillment Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this fulfillment..."
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRedemption(null)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFulfill}
                  disabled={fulfillMutation.isPending}
                  data-testid="button-confirm-fulfill"
                >
                  {fulfillMutation.isPending ? "Processing..." : "Mark as Fulfilled"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
