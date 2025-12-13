import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold mb-1 text-destructive">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            data-testid="button-retry"
          >
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}
