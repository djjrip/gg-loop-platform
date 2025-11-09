import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <XCircle className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl" data-testid="heading-cancel">
            Subscription Canceled
          </CardTitle>
          <CardDescription data-testid="text-cancel-message">
            You canceled the checkout process.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center">
          <p data-testid="text-info">
            No charges were made. You can try again anytime when you're ready.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="flex-1" variant="outline" asChild data-testid="button-home">
            <Link href="/">Go Home</Link>
          </Button>
          <Button className="flex-1" asChild data-testid="button-try-again">
            <Link href="/subscription">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
