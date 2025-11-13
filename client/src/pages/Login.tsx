import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { SiDiscord, SiTwitch } from "react-icons/si";

export default function Login() {
  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const handleTwitchLogin = () => {
    window.location.href = "/api/auth/twitch";
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
          <Button
            onClick={handleDiscordLogin}
            variant="outline"
            className="w-full h-12 text-base gap-3 hover-elevate active-elevate-2"
            data-testid="button-discord-login"
          >
            <SiDiscord className="h-5 w-5" style={{ color: '#5865F2' }} />
            Continue with Discord
          </Button>

          <Button
            onClick={handleTwitchLogin}
            variant="outline"
            className="w-full h-12 text-base gap-3 hover-elevate active-elevate-2"
            data-testid="button-twitch-login"
          >
            <SiTwitch className="h-5 w-5" style={{ color: '#9146FF' }} />
            Continue with Twitch
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
              <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
