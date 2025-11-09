import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Save, ExternalLink } from "lucide-react";

type UserData = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Settings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");

  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      return await apiRequest("/api/user/username", "POST", { username: newUsername });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Username updated!",
        description: "Your profile URL has been updated.",
      });
      setUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update username",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    updateUsernameMutation.mutate(username);
  };

  const currentUsername = user?.username || "Not set";
  const profileUrl = user?.username 
    ? `/profile/${user.username}` 
    : user?.id ? `/profile/${user.id}` : "#";

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your GG Loop profile</p>
        </div>

        <Card data-testid="card-username-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username
            </CardTitle>
            <CardDescription>
              Customize your profile URL to make it easy to share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Username</Label>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 bg-muted rounded font-mono text-sm flex-1" data-testid="text-current-username">
                  {currentUsername}
                </code>
                {user?.username && (
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-profile">
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="coolstreamer123"
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={20}
                  data-testid="input-username"
                />
                <p className="text-xs text-muted-foreground">
                  3-20 characters. Letters, numbers, and underscores only.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={updateUsernameMutation.isPending || !username.trim()}
                className="gap-2"
                data-testid="button-save-username"
              >
                <Save className="h-4 w-4" />
                {updateUsernameMutation.isPending ? "Saving..." : "Save Username"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details from Replit Auth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
