import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Lock, CheckCircle, Trophy, Star, Zap } from "lucide-react";

interface Brand {
    id: string;
    name: string;
    logo: string;
    description: string;
    tier: "basic" | "pro" | "elite";
    requiredPoints: number;
    benefits: string[];
    active: boolean;
}

export default function BrandsDashboard() {
    const { user } = useAuth();

    const { data: brandsData } = useQuery<{ brands: Brand[]; userPoints: number; eligibility: any }>({
        queryKey: ["/api/brands"],
    });

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "basic": return Trophy;
            case "pro": return Star;
            case "elite": return Zap;
            default: return Trophy;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "basic": return "bg-blue-500";
            case "pro": return "bg-purple-500";
            case "elite": return "bg-orange-500";
            default: return "bg-gray-500";
        }
    };

    const isUnlocked = (requiredPoints: number) => {
        return (brandsData?.userPoints || 0) >= requiredPoints &&
            brandsData?.eligibility?.desktopVerified &&
            (brandsData?.eligibility?.fraudScore || 100) <= 30;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Brand Marketplace</h1>
                <p className="text-muted-foreground">
                    Unlock exclusive brand partnerships with verified points
                </p>
            </div>

            {/* User Stats */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Verified Points</div>
                            <div className="text-2xl font-bold">{brandsData?.userPoints?.toLocaleString() || 0}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Desktop Verified</div>
                            <div className="text-2xl font-bold">
                                {brandsData?.eligibility?.desktopVerified ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <Lock className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Fraud Score</div>
                            <div className="text-2xl font-bold">
                                {brandsData?.eligibility?.fraudScore || 0}/100
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tier Unlocks */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Sponsorship Tiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { tier: "basic", name: "Basic", points: 10000, color: "blue" },
                        { tier: "pro", name: "Pro", points: 25000, color: "purple" },
                        { tier: "elite", name: "Elite", points: 50000, color: "orange" }
                    ].map((tierInfo) => {
                        const unlocked = isUnlocked(tierInfo.points);
                        const TierIcon = getTierIcon(tierInfo.tier);

                        return (
                            <Card key={tierInfo.tier} className={unlocked ? "border-primary" : "opacity-60"}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TierIcon className="h-5 w-5" />
                                            {tierInfo.name} Tier
                                        </CardTitle>
                                        {unlocked ? (
                                            <Badge variant="default">Unlocked</Badge>
                                        ) : (
                                            <Badge variant="secondary">Locked</Badge>
                                        )}
                                    </div>
                                    <CardDescription>{tierInfo.points.toLocaleString()} points required</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            Progress: {Math.min(((brandsData?.userPoints || 0) / tierInfo.points) * 100, 100).toFixed(0)}%
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${getTierColor(tierInfo.tier)} h-2 rounded-full transition-all`}
                                                style={{ width: `${Math.min(((brandsData?.userPoints || 0) / tierInfo.points) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Brand Partners */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Available Brands</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brandsData?.brands.map((brand) => {
                        const unlocked = isUnlocked(brand.requiredPoints);
                        const TierIcon = getTierIcon(brand.tier);

                        return (
                            <Card key={brand.id} className={unlocked ? "" : "opacity-50"}>
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <TierIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{brand.name}</CardTitle>
                                            <Badge variant="outline" className="mt-1">
                                                {brand.tier} tier
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription>{brand.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold">Benefits:</div>
                                        <ul className="space-y-1">
                                            {brand.benefits.map((benefit, idx) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-3">
                                            {unlocked ? (
                                                <Button className="w-full">View Offers</Button>
                                            ) : (
                                                <Button className="w-full" variant="outline" disabled>
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    {brand.requiredPoints.toLocaleString()} points required
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
