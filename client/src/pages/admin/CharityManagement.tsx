import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Heart, Plus, Pencil, Trash2, TrendingUp, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  featuredOrder: number;
  isActive: boolean;
  createdAt: string;
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

export default function CharityManagement() {
  const { toast } = useToast();
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CharityCampaign | null>(null);
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);

  const { data: charities = [] } = useQuery<Charity[]>({
    queryKey: ["/api/admin/charities"],
  });

  const { data: campaigns = [] } = useQuery<CharityCampaign[]>({
    queryKey: ["/api/admin/charity-campaigns"],
  });

  const createCharityMutation = useMutation({
    mutationFn: async (data: Partial<Charity>) => {
      return apiRequest("POST", "/api/admin/charities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/charities"] });
      toast({ title: "Success", description: "Charity created successfully" });
      setIsEditingCharity(false);
      setSelectedCharity(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCharityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Charity> }) => {
      return apiRequest("PATCH", `/api/admin/charities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/charities"] });
      toast({ title: "Success", description: "Charity updated successfully" });
      setIsEditingCharity(false);
      setSelectedCharity(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCharityMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/charities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/charities"] });
      toast({ title: "Success", description: "Charity deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: Partial<CharityCampaign>) => {
      return apiRequest("POST", "/api/admin/charity-campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/charity-campaigns"] });
      toast({ title: "Success", description: "Campaign created successfully" });
      setIsEditingCampaign(false);
      setSelectedCampaign(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CharityCampaign> }) => {
      return apiRequest("PATCH", `/api/admin/charity-campaigns/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/charity-campaigns"] });
      toast({ title: "Success", description: "Campaign updated successfully" });
      setIsEditingCampaign(false);
      setSelectedCampaign(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalImpact = charities.reduce((sum, c) => sum + c.totalDonated, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GG Loop Cares Management</h1>
            <p className="text-muted-foreground">Manage charity partners and campaigns</p>
          </div>
          <Dialog open={isEditingCharity} onOpenChange={setIsEditingCharity}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedCharity(null)} data-testid="button-add-charity">
                <Plus className="h-4 w-4 mr-2" />
                Add Charity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <CharityForm
                charity={selectedCharity}
                onSubmit={(data) => {
                  if (selectedCharity?.id) {
                    updateCharityMutation.mutate({ id: selectedCharity.id, data });
                  } else {
                    createCharityMutation.mutate(data);
                  }
                }}
                isPending={createCharityMutation.isPending || updateCharityMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                ${totalImpact.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Charities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {charities.filter(c => c.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                {campaigns.filter(c => c.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Charity Partners</CardTitle>
              <CardDescription>Manage nonprofit organizations</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charities.map((charity) => (
                <div
                  key={charity.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`card-charity-${charity.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{charity.name}</h3>
                        <Badge variant={charity.isActive ? "default" : "destructive"}>
                          {charity.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{charity.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {charity.description}
                      </p>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Donated:</span>
                          <p className="font-semibold text-green-600">${charity.totalDonated.toLocaleString()}</p>
                        </div>
                        {charity.impactMetric && (
                          <div>
                            <span className="text-muted-foreground">Impact:</span>
                            <p className="font-semibold">{charity.impactValue} {charity.impactMetric}</p>
                          </div>
                        )}
                        {charity.website && (
                          <div>
                            <a
                              href={charity.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Visit Website →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCharity(charity);
                          setIsEditingCharity(true);
                        }}
                        data-testid={`button-edit-charity-${charity.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete ${charity.name}?`)) {
                            deleteCharityMutation.mutate(charity.id);
                          }
                        }}
                        data-testid={`button-delete-charity-${charity.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {charities.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No charities yet. Add your first charity partner!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage fundraising campaigns</CardDescription>
            </div>
            <Dialog open={isEditingCampaign} onOpenChange={setIsEditingCampaign}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setSelectedCampaign(null)}
                  disabled={charities.length === 0}
                  data-testid="button-add-campaign"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <CampaignForm
                  campaign={selectedCampaign}
                  charities={charities}
                  onSubmit={(data) => {
                    if (selectedCampaign?.id) {
                      updateCampaignMutation.mutate({ id: selectedCampaign.id, data });
                    } else {
                      createCampaignMutation.mutate(data);
                    }
                  }}
                  isPending={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
                return (
                  <div
                    key={campaign.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`card-campaign-${campaign.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <Badge variant={campaign.isActive ? "default" : "destructive"}>
                            {campaign.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{campaign.charity.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsEditingCampaign(true);
                          }}
                          data-testid={`button-edit-campaign-${campaign.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{campaign.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">${campaign.currentAmount.toLocaleString()} raised</span>
                        <span className="text-muted-foreground">of ${campaign.goalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{Math.round(progress)}% funded</p>
                    </div>
                  </div>
                );
              })}
              {campaigns.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No campaigns yet. Create your first campaign!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function CharityForm({
  charity,
  onSubmit,
  isPending,
}: {
  charity: Charity | null;
  onSubmit: (data: Partial<Charity>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Charity>>(
    charity || {
      name: "",
      description: "",
      website: "",
      logo: "",
      category: "gaming",
      impactMetric: "",
      impactValue: "",
      totalDonated: 0,
      featuredOrder: 0,
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{charity ? "Edit Charity" : "Add Charity"}</DialogTitle>
        <DialogDescription>Manage charity partner information</DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="name">Charity Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="youth">Youth</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.org"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="impactMetric">Impact Metric</Label>
          <Input
            id="impactMetric"
            value={formData.impactMetric}
            onChange={(e) => setFormData({ ...formData, impactMetric: e.target.value })}
            placeholder="e.g., students supported, trees planted"
          />
        </div>

        <div>
          <Label htmlFor="impactValue">Impact Value</Label>
          <Input
            id="impactValue"
            value={formData.impactValue}
            onChange={(e) => setFormData({ ...formData, impactValue: e.target.value })}
            placeholder="e.g., 1,000+"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalDonated">Total Donated ($)</Label>
          <Input
            id="totalDonated"
            type="number"
            value={formData.totalDonated}
            onChange={(e) => setFormData({ ...formData, totalDonated: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label htmlFor="featuredOrder">Featured Order</Label>
          <Input
            id="featuredOrder"
            type="number"
            value={formData.featuredOrder}
            onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : charity ? "Update Charity" : "Create Charity"}
      </Button>
    </form>
  );
}

function CampaignForm({
  campaign,
  charities,
  onSubmit,
  isPending,
}: {
  campaign: CharityCampaign | null;
  charities: Charity[];
  onSubmit: (data: Partial<CharityCampaign>) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<Partial<CharityCampaign>>(
    campaign || {
      charityId: charities[0]?.id || "",
      title: "",
      description: "",
      goalAmount: 0,
      currentAmount: 0,
      startDate: "",
      endDate: "",
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{campaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
        <DialogDescription>Manage fundraising campaign details</DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="charityId">Charity *</Label>
        <Select
          value={formData.charityId}
          onValueChange={(value) => setFormData({ ...formData, charityId: value })}
        >
          <SelectTrigger id="charityId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {charities.map((charity) => (
              <SelectItem key={charity.id} value={charity.id}>
                {charity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Campaign Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
          <Input
            id="goalAmount"
            type="number"
            value={formData.goalAmount}
            onChange={(e) => setFormData({ ...formData, goalAmount: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <Label htmlFor="currentAmount">Current Amount ($)</Label>
          <Input
            id="currentAmount"
            type="number"
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate?.split("T")[0] || ""}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate?.split("T")[0] || ""}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : campaign ? "Update Campaign" : "Create Campaign"}
      </Button>
    </form>
  );
}
