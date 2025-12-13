import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function SubscriptionSuccess() {
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    queryClient.invalidateQueries({ queryKey: ["/api/points/balance"] });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl" data-testid="heading-success">
            Subscription Activated!
          </CardTitle>
          <CardDescription data-testid="text-success-message">
            Welcome to GG Loop! Your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p data-testid="text-info-1">
            You'll receive your monthly base points within a few minutes.
          </p>
          <p data-testid="text-info-2">
            Start earning additional points through gameplay, achievements, and tournaments.
          </p>
          <p data-testid="text-info-3">
            Check out the rewards catalog to see what you can redeem!
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="flex-1" asChild data-testid="button-dashboard">
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button className="flex-1" variant="outline" asChild data-testid="button-subscription">
            <Link href="/subscription">View Subscription</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
