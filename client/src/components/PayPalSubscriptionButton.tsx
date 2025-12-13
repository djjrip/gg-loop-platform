import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setError("PayPal not configured");
      setLoading(false);
      console.error("VITE_PAYPAL_CLIENT_ID not set");
      return;
    }

    // Load PayPal SDK
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.addEventListener("load", () => {
        setLoading(false);
        renderButton();
      });
      script.addEventListener("error", () => {
        setError("Failed to load PayPal SDK");
        setLoading(false);
      });
      document.body.appendChild(script);
    } else {
      setLoading(false);
      renderButton();
    }
  }, [planId]);

  const renderButton = () => {
    if (!window.paypal || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "subscribe",
        },
        createSubscription: async function (data: any, actions: any) {
          try {
            // Call backend to validate and get plan ID
            const response = await apiRequest("POST", "/api/paypal/create-subscription", {
              planId,
              tier,
            });

            const result = await response.json();

            // Use the plan ID to create subscription with PayPal
            return actions.subscription.create({
              plan_id: result.planId,
            });
          } catch (error: any) {
            console.error("Error creating subscription:", error);
            toast({
              title: "Subscription Error",
              description: error.message || "Failed to create subscription",
              variant: "destructive",
            });
            throw error;
          }
        },
        onApprove: async function (data: any) {
          try {
            // Notify backend that subscription was approved
            const response = await apiRequest("POST", "/api/paypal/subscription-approved", {
              subscriptionId: data.subscriptionID,
            });

            const result = await response.json();

            toast({
              title: "Subscription Activated!",
              description: `You're now subscribed to the ${result.tier} tier. Welcome!`,
            });

            // Refresh user and subscription data
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });

            // Redirect to success page
            window.location.href = "/subscription/success";
          } catch (error: any) {
            console.error("Error approving subscription:", error);
            toast({
              title: "Activation Error",
              description: error.message || "Failed to activate subscription. Please contact support.",
              variant: "destructive",
            });
          }
        },
        onCancel: function () {
          toast({
            title: "Subscription Cancelled",
            description: "You cancelled the subscription process",
            variant: "default",
          });
        },
        onError: function (err: any) {
          console.error("PayPal error:", err);
          toast({
            title: "PayPal Error",
            description: "An error occurred with PayPal. Please try again or contact support.",
            variant: "destructive",
          });
        },
      })
      .render(containerRef.current);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Button variant="destructive" disabled className="w-full">
          {error}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} />
    </div>
  );
}
