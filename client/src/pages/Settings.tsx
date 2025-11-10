import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Save, ExternalLink, Twitch, Unlink, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

type UserData = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  twitchUsername: string | null;
  twitchConnectedAt: string | null;
};

export default function Settings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [location] = useLocation();

  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('twitch') === 'connected') {
      toast({
        title: "Twitch connected!",
        description: "Your Twitch account has been linked successfully.",
      });
      window.history.replaceState({}, '', '/settings');
    }
  }, [toast]);

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

  const connectTwitchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/twitch/auth', {
        credentials: 'include',
      });
      const data = await response.json();
      return data.authUrl;
    },
    onSuccess: (authUrl: string) => {
      window.location.href = authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Failed to connect Twitch",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const disconnectTwitchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/twitch/disconnect", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Twitch disconnected",
        description: "Your Twitch account has been unlinked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to disconnect Twitch",
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

        <Card data-testid="card-twitch-integration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitch className="h-5 w-5" />
              Twitch Integration
            </CardTitle>
            <CardDescription>
              Connect your Twitch account to earn points automatically while streaming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.twitchUsername ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-connected-twitch">
                      Connected as @{user.twitchUsername}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(user.twitchConnectedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectTwitchMutation.mutate()}
                    disabled={disconnectTwitchMutation.isPending}
                    className="gap-2"
                    data-testid="button-disconnect-twitch"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Earn points while streaming:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>5 points per hour of live streaming</li>
                    <li>Bonus points for viewer milestones</li>
                    <li>Automatic verification every 10 minutes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Benefits of connecting Twitch:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Earn 5 points per hour of live streaming</li>
                    <li>Get bonus points for viewer milestones</li>
                    <li>Automatic verification - no manual reporting needed</li>
                    <li>Build credibility with verified streaming hours</li>
                  </ul>
                </div>
                <Button
                  onClick={() => connectTwitchMutation.mutate()}
                  disabled={connectTwitchMutation.isPending}
                  className="gap-2"
                  data-testid="button-connect-twitch"
                >
                  <Twitch className="h-4 w-4" />
                  {connectTwitchMutation.isPending ? "Connecting..." : "Connect Twitch Account"}
                </Button>
              </div>
            )}
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
