import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PayPalSubscriptionButtonProps {
  planId: string;
  tier: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalSubscriptionButton({ planId, tier }: PayPalSubscriptionButtonProps) {
  const { toast } = useToast();

  // LEVEL 2 STABILITY: PayPal integration is incomplete (missing backend routes)
  // Gracefully disable to prevent infinite loading popup
  const handleDisabledClick = () => {
    toast({
      title: "PayPal Checkout Temporarily Unavailable",
      description: "We're working on payment integration. Please check back soon or contact support at jaysonquindao@ggloop.io",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full space-y-2">
      <Button
        onClick={handleDisabledClick}
        className="w-full"
        variant="outline"
        disabled
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        PayPal Checkout (Coming Soon)
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Payment integration in progress. Contact us for manual setup.
      </p>
    </div>
  );
}
