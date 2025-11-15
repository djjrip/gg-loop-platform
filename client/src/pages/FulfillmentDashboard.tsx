import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, CheckCircle, Clock, DollarSign, Mail, Copy, MapPin, Truck } from "lucide-react";
import { useState } from "react";

interface PendingReward {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
  trackingNumber: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  reward: {
    id: string;
    title: string;
    description: string;
    pointsCost: number;
    realValue: number;
    category: string;
    fulfillmentType: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function FulfillmentDashboard() {
  const { toast } = useToast();
  const [fulfillmentCodes, setFulfillmentCodes] = useState<Record<string, string>>({});
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const { data: pendingRewards, isLoading, error, refetch } = useQuery<PendingReward[]>({
    queryKey: ["/api/admin/pending-rewards"],
  });

  const fulfillMutation = useMutation({
    mutationFn: async ({ userRewardId, giftCardCode }: { userRewardId: string; giftCardCode?: string }) => {
      const res = await apiRequest("POST", "/api/admin/rewards/fulfill", { userRewardId, giftCardCode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-rewards"] });
      toast({
        title: "Success!",
        description: "Reward marked as fulfilled",
      });
      setFulfillmentCodes({});
      setTrackingNumbers({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fulfill reward",
        variant: "destructive",
      });
    },
  });

  const addTrackingMutation = useMutation({
    mutationFn: async ({ userRewardId, trackingNumber }: { userRewardId: string; trackingNumber: string }) => {
      const res = await apiRequest("POST", "/api/admin/rewards/tracking", { userRewardId, trackingNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-rewards"] });
      toast({
        title: "Tracking number added!",
        description: "Customer will be notified via email",
      });
      setTrackingNumbers({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking number",
        variant: "destructive",
      });
    },
  });

  const handleFulfill = (userRewardId: string) => {
    const giftCardCode = fulfillmentCodes[userRewardId];
    fulfillMutation.mutate({ userRewardId, giftCardCode });
  };

  const handleAddTracking = (userRewardId: string) => {
    const trackingNumber = trackingNumbers[userRewardId];
    if (!trackingNumber?.trim()) {
      toast({
        title: "Missing tracking number",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }
    addTrackingMutation.mutate({ userRewardId, trackingNumber: trackingNumber.trim() });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(label);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const totalPending = pendingRewards?.length || 0;
  const totalValue = pendingRewards?.reduce((sum, r) => sum + r.reward.realValue, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-heading tracking-tight flex items-center gap-3">
              <span className="w-1 h-8 bg-primary shadow-[0_0_10px_rgba(255,140,66,0.5)]" />
              Fulfillment Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 ml-4">Manage pending reward deliveries</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh">
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-3xl font-bold font-mono" data-testid="text-pending-count">{totalPending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold font-mono" data-testid="text-total-value">${totalValue}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Savings</p>
                <p className="text-3xl font-bold font-mono text-green-500" data-testid="text-savings">
                  ${(totalValue * 0.075).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">7.5% avg Raise.com discount</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Rewards List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading">Pending Deliveries</h2>
          
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-32 w-full" />
                </Card>
              ))}
            </>
          ) : error ? (
            <Card className="p-12 text-center border-destructive/50">
              <div className="max-w-md mx-auto space-y-4">
                {error.message?.includes("Forbidden") || error.message?.includes("Admin access required") ? (
                  <>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 inline-block">
                      <Package className="h-12 w-12 text-destructive mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-destructive">Access Denied</h3>
                    <p className="text-muted-foreground">
                      Admin privileges are required to access the fulfillment dashboard.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      If you believe you should have access, please contact the site administrator.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-destructive font-semibold">Failed to load pending rewards</p>
                    <p className="text-sm text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
                    <Button onClick={() => refetch()} className="mt-4" variant="outline">
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ) : !pendingRewards || pendingRewards.length === 0 ? (
            <Card className="p-12 text-center border-primary/10">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending rewards to fulfill</p>
            </Card>
          ) : (
            pendingRewards.map((reward) => (
              <Card key={reward.id} className="p-6 border-primary/20 hover:border-primary/30 transition-colors" data-testid={`card-pending-${reward.id}`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold font-heading">{reward.reward.title}</h3>
                        <Badge variant="secondary" className="font-mono">
                          ${reward.reward.realValue}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.reward.description}</p>
                    </div>
                    <Badge className="font-mono" data-testid={`badge-status-${reward.id}`}>
                      {reward.status}
                    </Badge>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-muted">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer</p>
                      <p className="font-semibold" data-testid={`text-user-name-${reward.id}`}>
                        {reward.user.firstName} {reward.user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm" data-testid={`text-user-email-${reward.id}`}>
                          {reward.user.email}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(reward.user.email, "Email")}
                          data-testid={`button-copy-email-${reward.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Redeemed</p>
                      <p className="text-sm" data-testid={`text-redeemed-at-${reward.id}`}>
                        {new Date(reward.redeemedAt).toLocaleDateString()} {new Date(reward.redeemedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Points Spent</p>
                      <p className="font-mono font-semibold text-primary" data-testid={`text-points-${reward.id}`}>
                        {reward.pointsSpent} pts
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address for Physical Items */}
                  {reward.reward.fulfillmentType === "physical" && reward.shippingAddress && (
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-600">Shipping Address</h4>
                      </div>
                      <div className="text-sm space-y-1" data-testid={`text-shipping-address-${reward.id}`}>
                        <p className="font-medium">{reward.user.firstName} {reward.user.lastName}</p>
                        <p>{reward.shippingAddress}</p>
                        <p>{reward.shippingCity}, {reward.shippingState} {reward.shippingZip}</p>
                        <p>{reward.shippingCountry || 'US'}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          `${reward.user.firstName} ${reward.user.lastName}\n${reward.shippingAddress}\n${reward.shippingCity}, ${reward.shippingState} ${reward.shippingZip}\n${reward.shippingCountry || 'US'}`,
                          "Address"
                        )}
                        className="mt-2"
                        data-testid={`button-copy-address-${reward.id}`}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Address
                      </Button>
                    </div>
                  )}

                  {/* Fulfillment Instructions */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      {reward.reward.fulfillmentType === "physical" ? <Truck className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      Fulfillment Steps
                    </h4>
                    {reward.reward.fulfillmentType === "physical" ? (
                      <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                        <li>Purchase "{reward.reward.title}" from supplier</li>
                        <li>Ship to address above</li>
                        <li>Add tracking number below</li>
                        <li>Customer will be automatically notified via email</li>
                        <li>Mark as fulfilled once delivered</li>
                      </ol>
                    ) : (
                      <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                        <li>Go to <a href="https://raise.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Raise.com</a></li>
                        <li>Search for "{reward.reward.title}" gift card</li>
                        <li>Buy ${reward.reward.realValue} card (usually ~7.5% discount)</li>
                        <li>Copy the gift card code below</li>
                        <li>Email the code to: <strong>{reward.user.email}</strong></li>
                        <li>Mark as fulfilled</li>
                      </ol>
                    )}
                  </div>

                  {/* Fulfillment Actions */}
                  {reward.reward.fulfillmentType === "physical" ? (
                    <div className="space-y-4">
                      {reward.trackingNumber ? (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="font-semibold text-green-600">Tracking Added</p>
                          </div>
                          <code className="block bg-muted px-2 py-1 rounded font-mono text-sm">
                            {reward.trackingNumber}
                          </code>
                        </div>
                      ) : (
                        <div className="flex items-end gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Tracking Number</label>
                            <Input
                              placeholder="Enter USPS/UPS/FedEx tracking number..."
                              value={trackingNumbers[reward.id] || ""}
                              onChange={(e) => setTrackingNumbers({ ...trackingNumbers, [reward.id]: e.target.value })}
                              data-testid={`input-tracking-${reward.id}`}
                            />
                          </div>
                          <Button
                            onClick={() => handleAddTracking(reward.id)}
                            disabled={addTrackingMutation.isPending}
                            data-testid={`button-add-tracking-${reward.id}`}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Add Tracking
                          </Button>
                        </div>
                      )}
                      <Button
                        onClick={() => handleFulfill(reward.id)}
                        disabled={fulfillMutation.isPending}
                        variant="default"
                        className="w-full"
                        data-testid={`button-fulfill-${reward.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Fulfilled
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Gift Card Code (Optional)</label>
                        <Input
                          placeholder="Enter gift card code..."
                          value={fulfillmentCodes[reward.id] || ""}
                          onChange={(e) => setFulfillmentCodes({ ...fulfillmentCodes, [reward.id]: e.target.value })}
                          data-testid={`input-code-${reward.id}`}
                        />
                      </div>
                      <Button
                        onClick={() => handleFulfill(reward.id)}
                        disabled={fulfillMutation.isPending}
                        data-testid={`button-fulfill-${reward.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Fulfilled
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
