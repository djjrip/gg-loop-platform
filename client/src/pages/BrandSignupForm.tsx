import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle } from "lucide-react";

export default function BrandSignupForm() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        brandName: "",
        website: "",
        logo: "",
        description: "",
        basicOffer: "",
        proOffer: "",
        eliteOffer: ""
    });

    const signupMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await fetch("/api/brands/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Failed to submit brand signup");
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Brand Signup Submitted",
                description: "Your brand application is pending admin review"
            });
            setFormData({
                brandName: "",
                website: "",
                logo: "",
                description: "",
                basicOffer: "",
                proOffer: "",
                eliteOffer: ""
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Brand Partner Signup
                    </CardTitle>
                    <CardDescription>
                        Register your brand to offer exclusive deals to GG LOOP users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="brandName">Brand Name *</Label>
                            <Input
                                id="brandName"
                                placeholder="e.g., Razer, Logitech"
                                value={formData.brandName}
                                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website *</Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://yourbrand.com"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo URL *</Label>
                            <Input
                                id="logo"
                                type="url"
                                placeholder="https://yourbrand.com/logo.png"
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Brand Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of your brand and products"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Tier Offers */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tier Offers</h3>
                        <p className="text-sm text-muted-foreground">
                            Define exclusive offers for each sponsorship tier
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="basicOffer">Basic Tier (10,000 points) *</Label>
                            <Textarea
                                id="basicOffer"
                                placeholder="e.g., 10% off all products"
                                rows={2}
                                value={formData.basicOffer}
                                onChange={(e) => setFormData({ ...formData, basicOffer: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proOffer">Pro Tier (25,000 points) *</Label>
                            <Textarea
                                id="proOffer"
                                placeholder="e.g., 15% off + free shipping"
                                rows={2}
                                value={formData.proOffer}
                                onChange={(e) => setFormData({ ...formData, proOffer: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eliteOffer">Elite Tier (50,000 points) *</Label>
                            <Textarea
                                id="eliteOffer"
                                placeholder="e.g., 20% off + dedicated account manager"
                                rows={2}
                                value={formData.eliteOffer}
                                onChange={(e) => setFormData({ ...formData, eliteOffer: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => signupMutation.mutate(formData)}
                        disabled={signupMutation.isPending || !formData.brandName || !formData.website}
                        className="w-full"
                    >
                        {signupMutation.isPending ? "Submitting..." : "Submit Brand Application"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
