import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface Redemption {
    id: string;
    rewardId: string;
    pointsSpent: number;
    status: string;
    redeemedAt: string;
    fulfilledAt: string | null;
    trackingNumber: string | null;
    rewardTitle: string;
    rewardCategory: string;
}

export default function Redemptions() {
    const { user, isAuthenticated } = useAuth();

    const { data: redemptionsData, isLoading } = useQuery<{ redemptions: Redemption[] }>({
        queryKey: ['/api/rewards/my-redemptions'],
        enabled: isAuthenticated,
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'fulfilled':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fulfilled':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-heading mb-2" data-testid="text-redemptions-title">
                        My Redemptions
                    </h1>
                    <p className="text-muted-foreground">
                        Track the status of your reward redemptions
                    </p>
                </div>

                {!isAuthenticated ? (
                    <Card className="p-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please login to view your redemption history.
                        </p>
                        <Link href="/login">
                            <Button>Login</Button>
                        </Link>
                    </Card>
                ) : isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !redemptionsData?.redemptions?.length ? (
                    <Card className="p-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Redemptions Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            You haven't redeemed any rewards yet. Visit the shop to spend your points!
                        </p>
                        <Link href="/shop">
                            <Button>Go to Shop</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {redemptionsData.redemptions.map((redemption) => (
                            <Card key={redemption.id} data-testid={`card-redemption-${redemption.id}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{redemption.rewardTitle}</CardTitle>
                                        <Badge className={getStatusColor(redemption.status)}>
                                            {getStatusIcon(redemption.status)}
                                            <span className="ml-1 capitalize">{redemption.status}</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Category</p>
                                            <p className="font-medium capitalize">{redemption.rewardCategory}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Points Spent</p>
                                            <p className="font-mono font-bold text-primary">
                                                {redemption.pointsSpent.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Redeemed</p>
                                            <p>{new Date(redemption.redeemedAt).toLocaleDateString()}</p>
                                        </div>
                                        {redemption.fulfilledAt && (
                                            <div>
                                                <p className="text-muted-foreground">Fulfilled</p>
                                                <p>{new Date(redemption.fulfilledAt).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    {redemption.trackingNumber && (
                                        <div className="mt-4 p-3 rounded-lg bg-muted/30">
                                            <p className="text-sm text-muted-foreground">Tracking Number</p>
                                            <p className="font-mono font-semibold">{redemption.trackingNumber}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Info Banner */}
                <Card className="mt-8 bg-muted/30">
                    <CardContent className="py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Rewards are fulfilled manually within 2-5 business days. Contact support if you have questions.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
