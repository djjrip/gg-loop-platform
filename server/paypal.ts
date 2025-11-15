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

  // In production, require plan IDs to be explicitly configured
  const isProduction = process.env.NODE_ENV === "production";
  const basicPlanId = process.env.PAYPAL_BASIC_PLAN_ID;
  const proPlanId = process.env.PAYPAL_PRO_PLAN_ID;
  const elitePlanId = process.env.PAYPAL_ELITE_PLAN_ID;

  if (isProduction && (!basicPlanId || !proPlanId || !elitePlanId)) {
    console.error("CRITICAL: PayPal plan IDs not configured in production");
    return { 
      valid: false, 
      error: "PayPal configuration incomplete. Contact support." 
    };
  }

  try {
    const response = await subscriptionsController.getSubscription({ id: subscriptionId });
    const subscription = response.result;
    
    const status = (subscription as any).status;
    const planId = (subscription as any).planId;

    // Strict plan ID mapping - only accept configured plan IDs
    // In production, only configured IDs are accepted (no fallback)
    // In development, fallback to sandbox IDs for testing
    const planTierMap: Record<string, string> = {};
    
    if (basicPlanId) planTierMap[basicPlanId] = "basic";
    else if (!isProduction) planTierMap["P-6A485619U8349492UNEK4RRA"] = "basic"; // Sandbox fallback
    
    if (proPlanId) planTierMap[proPlanId] = "pro";
    else if (!isProduction) planTierMap["P-7PE45456B7870481SNEK4TRY"] = "pro"; // Sandbox fallback
    
    if (elitePlanId) planTierMap[elitePlanId] = "elite";
    else if (!isProduction) planTierMap["P-369148416D044494CNEK4UDQ"] = "elite"; // Sandbox fallback

    const tier = planId ? planTierMap[planId] : undefined;
    
    // Security: Reject if plan ID not recognized
    if (!tier) {
      console.error(`Security: Unrecognized PayPal plan ID ${planId}`);
      return {
        valid: false,
        status,
        planId,
        error: "Unrecognized subscription plan. Contact support.",
      };
    }

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
