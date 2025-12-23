import {
  Client,
  Environment,
  LogLevel,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  console.warn("[PayPal] Warning: PAYPAL_CLIENT_ID not configured");
}

if (!PAYPAL_CLIENT_SECRET) {
  console.warn("[PayPal] Warning: PAYPAL_CLIENT_SECRET not configured");
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
  subscriberEmail?: string;
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
    console.error("[PayPal] CRITICAL: PayPal plan IDs not configured in production");
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
    const subscriberEmail = (subscription as any).subscriber?.email_address;

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
      console.error(`[PayPal] Security: Unrecognized PayPal plan ID ${planId}`);
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
        subscriberEmail,
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
    console.error("[PayPal] Verification error:", error);
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
    console.error("[PayPal] Cancellation error:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel PayPal subscription",
    };
  }
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: any
): Promise<{ valid: boolean; error?: string }> {
  // Security: Fail closed - reject webhooks if credentials not configured
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("[PayPal] CRITICAL: PayPal credentials not configured - rejecting webhook");
    return {
      valid: false,
      error: "PayPal webhook verification unavailable: credentials not configured"
    };
  }

  try {
    // PayPal webhook verification requires specific headers
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Security: Fail closed - reject webhooks if webhook ID not configured
    if (!webhookId) {
      console.error("[PayPal] CRITICAL: PAYPAL_WEBHOOK_ID not configured - rejecting webhook");
      return {
        valid: false,
        error: "PayPal webhook verification unavailable: webhook ID not configured"
      };
    }

    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const authAlgo = headers['paypal-auth-algo'];

    if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig || !authAlgo) {
      return {
        valid: false,
        error: "Missing required PayPal webhook headers"
      };
    }

    // Verify webhook using PayPal's verify-webhook-signature API
    const apiUrl = process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Get OAuth token
    const authResponse = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error(`PayPal auth failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Verify webhook signature
    const verifyResponse = await fetch(`${apiUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: body,
      }),
    });

    if (!verifyResponse.ok) {
      return {
        valid: false,
        error: `PayPal verification failed: ${verifyResponse.statusText}`
      };
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.verification_status === 'SUCCESS') {
      return { valid: true };
    }

    return {
      valid: false,
      error: `Verification status: ${verifyData.verification_status}`
    };
  } catch (error: any) {
    console.error("[PayPal] Webhook verification error:", error);
    return {
      valid: false,
      error: error.message || "Webhook verification failed"
    };
  }
}
