import {
  Client,
  Environment,
  LogLevel,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  console.warn("PAYPAL_CLIENT_ID not configured");
}

if (!PAYPAL_CLIENT_SECRET) {
  console.warn("PAYPAL_CLIENT_SECRET not configured");
}

const client = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET ? new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: process.env.NODE_ENV === "production"
    ? Environment.Production
    : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
}) : null;

const subscriptionsController = client ? new SubscriptionsController(client) : null;

export async function verifyPayPalSubscription(subscriptionId: string): Promise<{
  valid: boolean;
  status?: string;
  planId?: string;
  tier?: string;
  error?: string;
}> {
  if (!subscriptionsController) {
    return { valid: false, error: "PayPal not configured" };
  }

  try {
    const { result } = await subscriptionsController.subscriptionsGet({ id: subscriptionId });
    
    const status = result.status;
    const planId = result.planId;

    const planTierMap: Record<string, string> = {
      "P-6A485619U8349492UNEK4RRA": "basic",
      "P-7PE45456B7870481SNEK4TRY": "pro",
      "P-369148416D044494CNEK4UDQ": "elite",
    };

    const tier = planId ? planTierMap[planId] : undefined;

    if (status === "ACTIVE" || status === "APPROVED") {
      return {
        valid: true,
        status,
        planId,
        tier,
      };
    }

    return {
      valid: false,
      status,
      planId,
      tier,
      error: `Subscription status is ${status}, expected ACTIVE or APPROVED`,
    };
  } catch (error: any) {
    console.error("PayPal verification error:", error);
    return {
      valid: false,
      error: error.message || "Failed to verify subscription with PayPal",
    };
  }
}

export async function cancelPayPalSubscription(subscriptionId: string, reason?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!subscriptionsController) {
    return { success: false, error: "PayPal not configured" };
  }

  try {
    await subscriptionsController.cancelSubscription({
      id: subscriptionId,
      body: {
        reason: reason || "User requested cancellation",
      },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("PayPal cancellation error:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel PayPal subscription",
    };
  }
}
