import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit, Trash2, Gift, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reward } from "@shared/schema";

export default function RewardsManagement() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointsCost: "",
    realValue: "",
    imageUrl: "",
    category: "gaming-gear"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      pointsCost: "",
      realValue: "",
      imageUrl: "",
      category: "gaming-gear"
    });
    setEditingReward(null);
    setShowAddForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setFormData({
      title: reward.title,
      description: reward.description || "",
      pointsCost: reward.pointsCost.toString(),
      realValue: reward.realValue.toString(),
      imageUrl: reward.imageUrl || "",
      category: reward.category
    });
    setEditingReward(reward);
    setShowAddForm(true);
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    try {
      await apiRequest("DELETE", `/api/admin/rewards/${rewardId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      toast({
        title: "Reward deleted",
        description: "The reward has been removed from the catalog"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reward",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        pointsCost: parseInt(formData.pointsCost),
        realValue: parseInt(formData.realValue),
        imageUrl: formData.imageUrl || null,
        category: formData.category
      };

      if (editingReward) {
        await apiRequest("PATCH", `/api/admin/rewards/${editingReward.id}`, payload);
        toast({
          title: "Reward updated",
          description: `${formData.title} has been updated successfully`
        });
      } else {
        await apiRequest("POST", "/api/admin/rewards", payload);
        toast({
          title: "Reward created",
          description: `${formData.title} has been added to the catalog`
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save reward",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Rewards Catalog Management</h1>
            <p className="text-muted-foreground">
              Add, edit, or remove rewards from the catalog
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-add-reward"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reward
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</CardTitle>
              <CardDescription>
                Fill in the details for the reward
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Reward Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Gaming Mouse RGB"
                      required
                      data-testid="input-reward-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaming-gear">Gaming Gear</SelectItem>
                        <SelectItem value="peripherals">Peripherals</SelectItem>
                        <SelectItem value="gift-cards">Gift Cards</SelectItem>
                        <SelectItem value="subscriptions">Subscriptions</SelectItem>
                        <SelectItem value="swag">Swag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pointsCost">Points Cost *</Label>
                    <Input
                      id="pointsCost"
                      type="number"
                      value={formData.pointsCost}
                      onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                      placeholder="e.g., 2500"
                      required
                      data-testid="input-points-cost"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="realValue">Real Dollar Value *</Label>
                    <Input
                      id="realValue"
                      type="number"
                      value={formData.realValue}
                      onChange={(e) => setFormData({ ...formData, realValue: e.target.value })}
                      placeholder="e.g., 25 (in dollars)"
                      required
                      data-testid="input-real-value"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the reward..."
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-image-url"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    data-testid="button-save-reward"
                  >
                    {isSubmitting ? "Saving..." : editingReward ? "Update Reward" : "Create Reward"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading rewards...</div>
        ) : rewards && rewards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first reward to the catalog
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Reward
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards?.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                {reward.imageUrl && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {reward.category}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reward.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {reward.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{reward.pointsCost.toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">${reward.realValue}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(reward)}
                      data-testid={`button-edit-${reward.id}`}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(reward.id)}
                      data-testid={`button-delete-${reward.id}`}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
