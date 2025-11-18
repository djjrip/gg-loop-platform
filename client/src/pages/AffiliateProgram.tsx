import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Copy,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

interface AffiliateStats {
  status: string;
  totalReferrals: number;
  monthlyEarnings: number;
  totalEarnings: number;
  commissionTier: string;
  referralCode: string;
}

const applicationSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  audience: z.string().min(1, "Audience size is required"),
  contentType: z.string().min(1, "Content type is required"),
  reason: z.string().min(50, "Please provide at least 50 characters"),
  payoutEmail: z.string().email("Valid email required"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export default function AffiliateProgram() {
  const { toast } = useToast();

  const form = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      platform: "",
      audience: "",
      contentType: "",
      reason: "",
      payoutEmail: "",
    },
  });

  const { data: stats, isLoading } = useQuery<AffiliateStats>({
    queryKey: ["/api/affiliate/stats"],
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      return apiRequest("POST", "/api/affiliate/apply", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/stats"] });
      toast({
        title: "Application Submitted!",
        description: "We'll review your application within 48 hours",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ApplicationData) => {
    applicationMutation.mutate(data);
  };

  const copyReferralLink = () => {
    if (!stats?.referralCode) return;
    const link = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { variant: "default" as const, icon: Clock, text: "Pending Review" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Active Affiliate" },
      rejected: { variant: "destructive" as const, icon: XCircle, text: "Application Rejected" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <badge.icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    );
  };

  const commissionRates = [
    { tier: "Standard", rate: "5%", signups: "< 10/month" },
    { tier: "Silver", rate: "7.5%", signups: "10-25/month" },
    { tier: "Gold", rate: "10%", signups: "25-50/month" },
    { tier: "Platinum", rate: "15%", signups: "50+/month" },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Affiliate Program</h1>
          <p className="text-muted-foreground">
            Partner with GG Loop and earn commissions by promoting our membership platform to the gaming community
          </p>
        </div>

        {/* Current Status */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(stats.status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {stats.totalReferrals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  ${stats.monthlyEarnings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  ${stats.totalEarnings}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats?.status === "approved" ? (
          <>
            {/* Affiliate Dashboard */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Affiliate Dashboard</CardTitle>
                <CardDescription>Track your performance and access promotional materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Unique Referral Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={`${window.location.origin}?ref=${stats.referralCode}`}
                      readOnly
                      data-testid="input-referral-link"
                    />
                    <Button onClick={copyReferralLink} size="icon" data-testid="button-copy-link">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Commission Tier: {stats.commissionTier}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Earn higher rates as you grow your referrals
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Promotional Materials
                    </h3>
                    <Button variant="outline" size="sm" className="mt-2" data-testid="button-download-assets">
                      Download Assets
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Tiers</CardTitle>
                <CardDescription>Earn more as you grow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {commissionRates.map((tier) => (
                    <div
                      key={tier.tier}
                      className={`p-4 border rounded-lg ${
                        stats.commissionTier.toLowerCase() === tier.tier.toLowerCase()
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <h3 className="font-bold text-lg">{tier.tier}</h3>
                      <p className="text-2xl font-bold text-primary mt-2">{tier.rate}</p>
                      <p className="text-sm text-muted-foreground mt-2">{tier.signups}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Earn Up to 15%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Competitive commission rates that increase with your performance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Proven Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Promote a product gamers actually want and use daily
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Marketing Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access promotional assets, tracking tools, and dedicated support
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <Card>
              <CardHeader>
                <CardTitle>Apply to Become an Affiliate</CardTitle>
                <CardDescription>
                  Tell us about your platform and audience to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Twitch, YouTube, TikTok, Discord"
                              data-testid="input-platform"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audience Size *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 5,000 followers, 10k monthly views"
                              data-testid="input-audience"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Gaming streams, tutorials, reviews"
                              data-testid="input-content-type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why GG Loop? * (min 50 characters)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us why you want to partner with GG Loop and how you'll promote us to your audience..."
                              rows={4}
                              data-testid="textarea-reason"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payoutEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="paypal@example.com"
                              data-testid="input-payout-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={applicationMutation.isPending}
                      className="w-full"
                      data-testid="button-submit-application"
                    >
                      {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
