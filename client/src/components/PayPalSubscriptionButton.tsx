import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [buttonRendered, setButtonRendered] = useState(false);
  const buttonIdRef = useRef(`paypal-button-${tier}-${Date.now()}`);

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "ASvoH44nGW2ZS_V2Xki0SLlVKtYh1dYJyPQ82m_rIOuWa1F6crnP9c2_TMFgFBO_d8IrBuc6UcwAKoJO";

    // COMPLETE cleanup before rendering
    if (buttonContainerRef.current) {
      buttonContainerRef.current.innerHTML = '';
      setButtonRendered(false);
    }

    const renderButton = () => {
      if (window.paypal && buttonContainerRef.current && !buttonRendered) {
        try {
          window.paypal.Buttons({
            style: {
              shape: 'pill',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: function (data: any, actions: any) {
              return actions.subscription.create({
                plan_id: planId
              });
            },
            onApprove: async function (data: any) {
              try {
                await apiRequest("POST", "/api/paypal/subscription-approved", {
                  subscriptionId: data.subscriptionID
                });

                queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });

                toast({
                  title: "Subscription Activated! 🎉",
                  description: `Welcome to GG Loop ${tier}! Your monthly points will be deposited shortly.`,
                });

                setTimeout(() => {
                  window.location.href = "/subscription/success";
                }, 1500);
              } catch (error: any) {
                console.error("Subscription approval error:", error);
                toast({
                  title: "Error",
                  description: error.message || "Failed to activate subscription",
                  variant: "destructive",
                });
              }
            },
            onError: function (err: any) {
              console.error("PayPal error:", err);
              toast({
                title: "Payment Error",
                description: "There was an issue with PayPal. Please try again.",
                variant: "destructive",
              });
            },
            onCancel: function () {
              toast({
                title: "Subscription Cancelled",
                description: "You cancelled the subscription process.",
              });
            }
          }).render(buttonContainerRef.current);

          setButtonRendered(true);
        } catch (error) {
          console.error('PayPal button render error:', error);
          setButtonRendered(false);
        }
      }
    };

    // Load PayPal SDK if not already loaded
    if (window.paypal) {
      renderButton();
    } else {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);

      if (existingScript) {
        existingScript.addEventListener('load', renderButton);
      } else {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        script.onload = renderButton;
        script.onerror = () => {
          console.error('Failed to load PayPal SDK');
          toast({
            title: "Error",
            description: "Failed to load payment system. Please refresh the page.",
            variant: "destructive",
          });
        };
        document.body.appendChild(script);
      }
    }

    // Complete cleanup on unmount
    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
      setButtonRendered(false);
    };
  }, [planId]); // Only re-render when planId changes, NOT on every tier change

  return (
    <div
      ref={buttonContainerRef}
      id={buttonIdRef.current}
      data-testid={`paypal-button-${tier.toLowerCase()}`}
      style={{ minHeight: '50px' }}
    />
  );
}
