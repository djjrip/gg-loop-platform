import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Gift, Download, Mail, Trophy, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClaimedReward {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
  fulfillmentData: any;
  trackingNumber: string | null;
  fulfilledAt: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  reward: {
    id: string;
    title: string;
    description: string | null;
    pointsCost: number;
    realValue: number;
    imageUrl: string | null;
    category: string;
    tier: number;
    fulfillmentType: string;
  };
}

export default function MyRewards() {
  const { user, isAuthenticated } = useAuth();

  const { data: claimedRewards, isLoading } = useQuery<ClaimedReward[]>({
    queryKey: ["/api/user/rewards"],
    enabled: isAuthenticated,
  });

  const getFulfillmentIcon = (type: string) => {
    switch (type) {
      case "automatic":
        return Trophy;
      case "digital_key":
        return Download;
      case "code":
        return Mail;
      case "physical":
        return Package;
      default:
        return Gift;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "processing":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string, fulfillmentType: string, trackingNumber?: string | null) => {
    if (status === "fulfilled") return "Fulfilled";
    if (status === "pending" && fulfillmentType === "automatic") return "Active";
    if (status === "pending" && fulfillmentType === "digital_key") return "Check Email";
    if (status === "pending" && fulfillmentType === "physical") {
      return trackingNumber ? "Shipped" : "Processing";
    }
    return "Processing";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Rewards</h1>
            <p className="text-muted-foreground">Please log in to view your rewards.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight mb-4" data-testid="heading-my-rewards">
            My Rewards
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            View and manage all your claimed rewards
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-32 mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : claimedRewards && claimedRewards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedRewards.map((claimed) => {
              const FulfillmentIcon = getFulfillmentIcon(claimed.reward.fulfillmentType);
              
              return (
                <Card key={claimed.id} data-testid={`card-claimed-${claimed.id}`}>
                  <CardHeader className="space-y-4">
                    {claimed.reward.imageUrl && (
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={claimed.reward.imageUrl} 
                          alt={claimed.reward.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{claimed.reward.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {claimed.reward.description}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(claimed.status)}>
                        {getStatusText(claimed.status, claimed.reward.fulfillmentType, claimed.trackingNumber)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Points Spent</span>
                      <span className="font-mono font-bold text-primary">
                        {claimed.pointsSpent.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Claimed On</span>
                      <span className="font-medium">
                        {new Date(claimed.redeemedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <FulfillmentIcon className="h-4 w-4" />
                      <span className="capitalize">{claimed.reward.fulfillmentType.replace('_', ' ')}</span>
                    </div>

                    {claimed.reward.fulfillmentType === "automatic" && claimed.status === "pending" && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
                        <p className="text-primary font-semibold mb-1">Badge Active!</p>
                        <p className="text-muted-foreground text-xs">
                          Your {claimed.reward.title} is now visible on your profile.
                        </p>
                      </div>
                    )}

                    {claimed.reward.fulfillmentType === "digital_key" && claimed.status === "pending" && (
                      <div className="bg-muted border border-border rounded-lg p-3 text-sm">
                        <p className="font-semibold mb-1">Check Your Email</p>
                        <p className="text-muted-foreground text-xs">
                          Your reward code has been sent to {user?.email}
                        </p>
                      </div>
                    )}

                    {claimed.reward.fulfillmentType === "physical" && (
                      <>
                        {claimed.trackingNumber ? (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-green-600" />
                              <p className="font-semibold text-green-600">Shipped</p>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="text-muted-foreground">Tracking Number:</p>
                              <code className="block bg-muted px-2 py-1 rounded font-mono text-xs" data-testid="text-tracking-number">
                                {claimed.trackingNumber}
                              </code>
                            </div>
                            {claimed.shippingAddress && (
                              <div className="space-y-1 text-xs pt-2 border-t border-green-500/20">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>Shipping To:</span>
                                </div>
                                <p className="text-muted-foreground">
                                  {claimed.shippingAddress}<br />
                                  {claimed.shippingCity}, {claimed.shippingState} {claimed.shippingZip}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : claimed.status === "fulfilled" ? (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <p className="font-semibold text-green-600">Fulfilled</p>
                            </div>
                            {claimed.fulfilledAt && (
                              <p className="text-muted-foreground text-xs mt-1">
                                Completed on {new Date(claimed.fulfilledAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-muted border border-border rounded-lg p-3 space-y-2">
                            <p className="font-semibold text-sm">Processing Order</p>
                            <p className="text-muted-foreground text-xs">
                              We'll email you tracking details within 2-3 business days.
                            </p>
                            {claimed.shippingAddress && (
                              <div className="space-y-1 text-xs pt-2 border-t">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>Shipping To:</span>
                                </div>
                                <p className="text-muted-foreground">
                                  {claimed.shippingAddress}<br />
                                  {claimed.shippingCity}, {claimed.shippingState} {claimed.shippingZip}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Gift className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No Rewards Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start earning points and claim your first reward!
                </p>
                <Button onClick={() => window.location.href = '/#rewards'}>
                  Browse Rewards
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
