import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  BarChart3
} from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  contactEmail: string | null;
  contactName: string | null;
  totalBudget: number;
  spentBudget: number;
  status: 'active' | 'paused' | 'inactive';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const sponsorSchema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal('')),
  contactName: z.string().optional(),
  totalBudget: z.coerce.number().min(0, "Budget must be positive"),
  status: z.enum(['active', 'paused', 'inactive']),
  notes: z.string().optional(),
});

type SponsorFormData = z.infer<typeof sponsorSchema>;

export default function SponsorManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [addingBudgetTo, setAddingBudgetTo] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [viewingAnalytics, setViewingAnalytics] = useState<string | null>(null);

  // Fetch sponsors
  const { data: sponsors = [], isLoading } = useQuery<Sponsor[]>({
    queryKey: ['/api/admin/sponsors'],
  });

  // Fetch sponsor analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/sponsors', viewingAnalytics, 'analytics'],
    queryFn: async () => {
      if (!viewingAnalytics) return null;
      const res = await apiRequest(`/api/admin/sponsors/${viewingAnalytics}/analytics`, 'GET');
      return res.json();
    },
    enabled: !!viewingAnalytics,
  });

  // Create sponsor mutation
  const createMutation = useMutation({
    mutationFn: async (data: SponsorFormData) => {
      return await apiRequest('/api/admin/sponsors', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sponsors'] });
      toast({ title: "Sponsor created successfully" });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create sponsor", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update sponsor mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SponsorFormData> }) => {
      return await apiRequest(`/api/admin/sponsors/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sponsors'] });
      toast({ title: "Sponsor updated successfully" });
      setEditingSponsor(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update sponsor", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete sponsor mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/sponsors/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sponsors'] });
      toast({ title: "Sponsor deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete sponsor", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      return await apiRequest(`/api/admin/sponsors/${id}/add-budget`, 'POST', { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sponsors'] });
      toast({ title: "Budget added successfully" });
      setAddingBudgetTo(null);
      setBudgetAmount("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add budget", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Form for create/edit
  const form = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: "",
      logo: "",
      website: "",
      contactEmail: "",
      contactName: "",
      totalBudget: 0,
      status: "active",
      notes: "",
    },
  });

  // Reset form when editing changes
  if (editingSponsor && form.getValues().name !== editingSponsor.name) {
    form.reset({
      name: editingSponsor.name,
      logo: editingSponsor.logo || "",
      website: editingSponsor.website || "",
      contactEmail: editingSponsor.contactEmail || "",
      contactName: editingSponsor.contactName || "",
      totalBudget: editingSponsor.totalBudget,
      status: editingSponsor.status,
      notes: editingSponsor.notes || "",
    });
  }

  const onSubmit = (data: SponsorFormData) => {
    if (editingSponsor) {
      updateMutation.mutate({ id: editingSponsor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddBudget = (sponsorId: string) => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    addBudgetMutation.mutate({ id: sponsorId, amount });
  };

  // Calculate totals
  const totalBudget = sponsors.reduce((sum, s) => sum + s.totalBudget, 0);
  const totalSpent = sponsors.reduce((sum, s) => sum + s.spentBudget, 0);
  const totalRemaining = totalBudget - totalSpent;
  const activeSponsors = sponsors.filter(s => s.status === 'active').length;

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500';
    if (status === 'paused') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Sponsor Management</h1>
            <p className="text-muted-foreground">Manage brand partnerships and challenge budgets</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-sponsor">
                <Plus className="mr-2 h-4 w-4" />
                New Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sponsor</DialogTitle>
                <DialogDescription>
                  Add a brand partner to fund challenges and engage users
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Red Bull, Logitech, Mountain Dew" {...field} data-testid="input-sponsor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} data-testid="input-logo-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} data-testid="input-website" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@sponsor.com" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Budget (points)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10000" {...field} data-testid="input-total-budget" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full border rounded-md p-2" data-testid="select-status">
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Internal notes about this sponsor..." {...field} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Sponsor
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-sponsors">{sponsors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSponsors} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-budget">
                {totalBudget.toLocaleString()} pts
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(totalBudget / 100).toFixed(2)} value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-spent">
                {totalSpent.toLocaleString()} pts
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-remaining">
                {totalRemaining.toLocaleString()} pts
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(totalRemaining / 100).toFixed(2)} available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsors List */}
        <Card>
          <CardHeader>
            <CardTitle>All Sponsors</CardTitle>
            <CardDescription>View and manage sponsor partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {sponsors.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sponsors yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first sponsor to start funding challenges
                </p>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Sponsor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                    data-testid={`card-sponsor-${sponsor.id}`}
                  >
                    {/* Logo */}
                    {sponsor.logo ? (
                      <img 
                        src={sponsor.logo} 
                        alt={sponsor.name} 
                        className="w-16 h-16 object-contain rounded-md border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-sponsor-name-${sponsor.id}`}>
                            {sponsor.name}
                          </h3>
                          {sponsor.website && (
                            <a 
                              href={sponsor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              {sponsor.website}
                            </a>
                          )}
                        </div>
                        <Badge variant={sponsor.status === 'active' ? 'default' : 'secondary'}>
                          {sponsor.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">{sponsor.totalBudget.toLocaleString()} pts</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Spent</p>
                          <p className="font-semibold">{sponsor.spentBudget.toLocaleString()} pts</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className="font-semibold text-green-600">
                            {(sponsor.totalBudget - sponsor.spentBudget).toLocaleString()} pts
                          </p>
                        </div>
                      </div>

                      {sponsor.contactEmail && (
                        <p className="text-sm text-muted-foreground">
                          Contact: {sponsor.contactName || sponsor.contactEmail}
                        </p>
                      )}

                      {sponsor.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          {sponsor.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Dialog open={addingBudgetTo === sponsor.id} onOpenChange={(open) => !open && setAddingBudgetTo(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setAddingBudgetTo(sponsor.id)}
                            data-testid={`button-add-budget-${sponsor.id}`}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Budget
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Budget to {sponsor.name}</DialogTitle>
                            <DialogDescription>
                              Current budget: {sponsor.totalBudget.toLocaleString()} points
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="budget-amount">Amount (points)</Label>
                              <Input
                                id="budget-amount"
                                type="number"
                                placeholder="10000"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                data-testid="input-budget-amount"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setAddingBudgetTo(null);
                                  setBudgetAmount("");
                                }}
                                data-testid="button-cancel-budget"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleAddBudget(sponsor.id)}
                                disabled={addBudgetMutation.isPending}
                                data-testid="button-confirm-budget"
                              >
                                {addBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Budget
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingAnalytics(sponsor.id)}
                        data-testid={`button-analytics-${sponsor.id}`}
                      >
                        <BarChart3 className="mr-1 h-3 w-3" />
                        Analytics
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSponsor(sponsor)}
                        data-testid={`button-edit-${sponsor.id}`}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Delete sponsor "${sponsor.name}"? This cannot be undone.`)) {
                            deleteMutation.mutate(sponsor.id);
                          }
                        }}
                        data-testid={`button-delete-${sponsor.id}`}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingSponsor} onOpenChange={(open) => !open && setEditingSponsor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Sponsor</DialogTitle>
              <DialogDescription>
                Update sponsor information and settings
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-logo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded-md p-2" data-testid="select-edit-status">
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-edit-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingSponsor(null)}
                    data-testid="button-edit-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-edit-submit"
                  >
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={!!viewingAnalytics} onOpenChange={(open) => !open && setViewingAnalytics(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sponsor Analytics - {analytics?.sponsor.name}</DialogTitle>
              <DialogDescription>
                Detailed performance metrics and ROI tracking
              </DialogDescription>
            </DialogHeader>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Total Budget</div>
                      <div className="text-2xl font-bold">{analytics.overview.totalBudget.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Spent</div>
                      <div className="text-2xl font-bold text-orange-600">{analytics.overview.spentBudget.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Participants</div>
                      <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalParticipants.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">users</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Claims</div>
                      <div className="text-2xl font-bold text-green-600">{analytics.overview.totalClaims.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">completed</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Active Challenges</div>
                      <div className="text-xl font-semibold">{analytics.overview.activeChallenges} / {analytics.overview.totalChallenges}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Completion Rate</div>
                      <div className="text-xl font-semibold">{analytics.overview.avgCompletionRate}%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Claim Rate</div>
                      <div className="text-xl font-semibold">{analytics.overview.avgClaimRate}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Per-Challenge Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Challenge Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.challenges.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No challenges created yet for this sponsor
                        </p>
                      ) : (
                        analytics.challenges.map((challenge: any) => (
                          <div key={challenge.challengeId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">{challenge.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={challenge.isActive ? 'default' : 'secondary'}>
                                    {challenge.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground">Budget</div>
                                <div className="font-semibold">{challenge.budget.toLocaleString()} pts</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Distributed</div>
                                <div className="font-semibold text-orange-600">{challenge.distributed.toLocaleString()} pts</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Participants</div>
                                <div className="font-semibold">{challenge.participants}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                                <div className="font-semibold">{challenge.completed}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Claimed</div>
                                <div className="font-semibold text-green-600">{challenge.claimed}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm pt-2 border-t">
                              <div>
                                <div className="text-xs text-muted-foreground">Completion Rate</div>
                                <div className="font-semibold">{challenge.completionRate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Claim Rate</div>
                                <div className="font-semibold">{challenge.claimRate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Cost Per Claim</div>
                                <div className="font-semibold">{challenge.costPerClaim.toLocaleString()} pts</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
