import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { SiDiscord, SiTwitch } from "react-icons/si";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();

  const handleLogin = async (provider: string) => {
    try {
      // Check if the provider is configured before redirecting
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 501) {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Configuration Missing",
          description: data.message || `${provider} login is not configured yet.`,
        });
        return;
      }

      // If configured (or redirects), proceed with actual login
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error("Login check failed:", error);
      // Fallback to direct redirect if check fails
      window.location.href = `/api/auth/${provider}`;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-12 w-12 text-primary" />
            <h1 className="font-bold text-4xl tracking-tight">GG LOOP</h1>
          </div>
          <CardTitle className="text-2xl" data-testid="heading-login">Welcome to GG Loop</CardTitle>
          <CardDescription>
            Choose your preferred login method to unlock membership rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Discord Login - Temporarily Disabled
          <Button
            onClick={() => window.location.href = "/api/auth/discord"}
            variant="outline"
            className="w-full h-12 text-base gap-3 hover-elevate active-elevate-2"
            data-testid="button-discord-login"
          >
            <SiDiscord className="h-5 w-5" style={{ color: '#5865F2' }} />
            Continue with Discord
          </Button>
          */}

          <Button
            onClick={() => handleLogin('twitch')}
            variant="outline"
            className="w-full h-12 text-base gap-3 hover-elevate active-elevate-2"
            data-testid="button-twitch-login"
          >
            <SiTwitch className="h-5 w-5" style={{ color: '#9146FF' }} />
            Continue with Twitch
          </Button>

          <Button
            onClick={() => handleLogin('google')}
            variant="outline"
            className="w-full h-12 text-base gap-3 hover-elevate active-elevate-2"
            data-testid="button-google-login"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = "/quick-start"}
            variant="ghost"
            className="w-full h-12 text-base gap-3"
            data-testid="button-guest-login"
          >
            <Trophy className="h-5 w-5" />
            Continue without Login
          </Button>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
