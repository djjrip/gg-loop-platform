import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Charity {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  category: string;
  impactMetric: string;
  impactValue: string;
  totalDonated: number;
  isActive: boolean;
}

interface CharityCampaign {
  id: string;
  charityId: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  charity: Charity;
}

export default function GGLoopCares() {
  const { data: charities = [], isLoading: charitiesLoading } = useQuery<Charity[]>({
    queryKey: ["/api/charities"],
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<CharityCampaign[]>({
    queryKey: ["/api/charity-campaigns"],
  });

  const totalImpact = charities.reduce((sum, charity) => sum + charity.totalDonated, 0);

  const categoryColors: Record<string, string> = {
    education: "bg-blue-500",
    health: "bg-red-500",
    environment: "bg-green-500",
    youth: "bg-purple-500",
    gaming: "bg-orange-500",
    other: "bg-gray-500",
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Heart className="h-12 w-12 text-red-500 fill-red-500" />
            GG Loop Cares
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            At GG Loop, we believe in giving back to the communities that make gaming special. 
            As a founder-led initiative, we carefully select and support nonprofits and charities 
            that align with our mission of empowering gamers and making a positive impact.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-total-impact">
                <TrendingUp className="h-6 w-6 text-green-500" />
                ${totalImpact.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Donated to causes we care about</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-active-partners">
                <Globe className="h-6 w-6 text-blue-500" />
                {charities.filter(c => c.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Nonprofits we support</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2" data-testid="text-active-campaigns">
                <Users className="h-6 w-6 text-purple-500" />
                {campaigns.filter(c => c.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Ongoing initiatives</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Active Campaigns</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {campaigns.filter(c => c.isActive).map((campaign) => {
                const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
                return (
                  <Card key={campaign.id} className="hover-elevate" data-testid={`card-campaign-${campaign.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2" data-testid={`text-campaign-title-${campaign.id}`}>{campaign.title}</CardTitle>
                          <CardDescription>{campaign.charity.name}</CardDescription>
                        </div>
                        <Badge
                          className={categoryColors[campaign.charity.category.toLowerCase()] || categoryColors.other}
                          data-testid={`badge-category-${campaign.id}`}
                        >
                          {campaign.charity.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{campaign.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium" data-testid={`text-raised-${campaign.id}`}>${campaign.currentAmount.toLocaleString()} raised</span>
                          <span className="text-muted-foreground" data-testid={`text-goal-${campaign.id}`}>of ${campaign.goalAmount.toLocaleString()}</span>
                        </div>
                        <Progress value={progress} className="h-2" data-testid={`progress-campaign-${campaign.id}`} />
                        <p className="text-sm text-muted-foreground" data-testid={`text-progress-${campaign.id}`}>{Math.round(progress)}% funded</p>
                      </div>

                      {campaign.endDate && (
                        <p className="text-sm text-muted-foreground">
                          Ends {new Date(campaign.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Partner Charities */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Partner Charities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.filter(c => c.isActive).map((charity) => (
              <Card key={charity.id} className="hover-elevate" data-testid={`card-charity-${charity.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {charity.logo && (
                      <img
                        src={charity.logo}
                        alt={charity.name}
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`img-logo-${charity.id}`}
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-charity-name-${charity.id}`}>{charity.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={categoryColors[charity.category.toLowerCase()] || categoryColors.other}
                        data-testid={`badge-category-${charity.id}`}
                      >
                        {charity.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{charity.description}</p>
                  
                  {charity.impactMetric && charity.impactValue && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Impact</p>
                      <p className="font-semibold" data-testid={`text-impact-${charity.id}`}>{charity.impactValue} {charity.impactMetric}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Contributed</p>
                      <p className="text-lg font-bold text-green-600" data-testid={`text-donated-${charity.id}`}>${charity.totalDonated.toLocaleString()}</p>
                    </div>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                        data-testid={`link-website-${charity.id}`}
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {charities.length === 0 && !charitiesLoading && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              We're currently selecting our first partner charities. Check back soon!
            </p>
          </div>
        )}

        {/* Founder's Message */}
        <Card className="mt-12 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">A Message from the Founder</h3>
                <p className="text-muted-foreground mb-4">
                  GG Loop Cares is more than just a charitable initiative—it's a core part of who we are. 
                  As gamers, we've seen firsthand how this community can come together to make incredible things happen. 
                  Every membership, every subscription, contributes to our ability to support causes that matter.
                </p>
                <p className="text-muted-foreground">
                  I personally review and select each charity partner to ensure they align with our values of 
                  empowering youth, supporting mental health, and giving back to the gaming community. 
                  Together, we're proving that gaming culture can be a force for positive change.
                </p>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  – Jayson Quindao, Founder & CEO
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
