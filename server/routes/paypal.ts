import { Router } from "express";
import { verifyPayPalSubscription, verifyPayPalWebhook } from "../paypal";
import { db } from "../database";
import { users, subscriptions, pointTransactions } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { pointsEngine } from "../pointsEngine";

const router = Router();

// Helper to validate and get Plan ID
const getPlanIdForTier = (tier: string) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Production Plan IDs (Must be set in Railway)
    const PROD_PLANS = {
        basic: process.env.PAYPAL_BASIC_PLAN_ID,
        pro: process.env.PAYPAL_PRO_PLAN_ID,
        elite: process.env.PAYPAL_ELITE_PLAN_ID,
    };

    // Sandbox Plan IDs (Fallbacks)
    const SANDBOX_PLANS = {
        basic: "P-6A485619U8349492UNEK4RRA",
        pro: "P-7PE45456B7870481SNEK4TRY",
        elite: "P-369148416D044494CNEK4UDQ",
    };

    if (isProduction) {
        return PROD_PLANS[tier as keyof typeof PROD_PLANS];
    }
    return SANDBOX_PLANS[tier as keyof typeof SANDBOX_PLANS];
};

// 1. Create Subscription Intent
router.post("/create-subscription", async (req, res) => {
    try {
        const { planId, tier } = req.body;

        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate request matches server config
        const serverPlanId = getPlanIdForTier(tier);

        // In production, enforce strict plan matching
        if (process.env.NODE_ENV === "production" && planId !== serverPlanId) {
            console.error(`Security Warning: Client planId ${planId} does not match server config ${serverPlanId}`);
            return res.status(400).json({ message: "Invalid subscription plan configuration" });
        }

        // Return the authorized plan ID to the client
        // This confirms the backend "signs off" on this tier selection
        res.json({
            planId: serverPlanId || planId, // Fallback to client ID if server config missing in dev
            tier
        });

    } catch (error) {
        console.error("Create Subscription Error:", error);
        res.status(500).json({ message: "Failed to initialize subscription" });
    }
});

// 2. Subscription Approved (Callback)
router.post("/subscription-approved", async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        console.log(`[PayPal] Verifying subscription ${subscriptionId} for user ${userId}`);

        // Verify with PayPal API
        const verification = await verifyPayPalSubscription(subscriptionId);

        if (!verification.valid) {
            console.error(`[PayPal] Verification failed: ${verification.error}`);
            return res.status(400).json({ message: verification.error || "Invalid subscription" });
        }

        // Success! Update Database
        const now = new Date();
        // Default to 30 days from now if not returned by PayPal (safety net)
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        // 1. Upsert Subscription Record
        await db.insert(subscriptions).values({
            userId,
            paypalSubscriptionId: subscriptionId,
            tier: verification.tier || 'basic',
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
                paypalSubscriptionId: subscriptionId,
                tier: verification.tier || 'basic',
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                updatedAt: now
            }
        });

        // 2. Award First Month Points Immediately
        const tierPoints = {
            basic: 3000,
            pro: 10000,
            elite: 25000
        };
        const points = tierPoints[verification.tier as keyof typeof tierPoints] || 0;

        if (points > 0) {
            await pointsEngine.awardPoints(
                userId,
                points,
                'MONTHLY_ALLOWANCE',
                subscriptionId,
                'subscription',
                `Monthly points for ${verification.tier} tier`
            );
        }

        res.json({
            success: true,
            tier: verification.tier,
            status: 'active'
        });

    } catch (error: any) {
        console.error("Subscription Approval Error:", error);
        res.status(500).json({ message: "Failed to process subscription" });
    }
});

// 3. Manual Sync (Recovery)
router.post("/manual-sync", async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Re-use verification logic
        const verification = await verifyPayPalSubscription(subscriptionId);

        if (!verification.valid) {
            return res.status(400).json({ message: "Could not verify this subscription ID with PayPal." });
        }

        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        // Upsert
        await db.insert(subscriptions).values({
            userId,
            paypalSubscriptionId: subscriptionId,
            tier: verification.tier || 'basic',
            status: 'active', // Should theoretically check verification.status
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
                paypalSubscriptionId: subscriptionId,
                tier: verification.tier || 'basic',
                status: 'active',
                updatedAt: now
            }
        });

        res.json({
            success: true,
            tier: verification.tier,
            message: "Subscription synced successfully"
        });

    } catch (error) {
        console.error("Manual Sync Error:", error);
        res.status(500).json({ message: "Failed to sync subscription" });
    }
});

// 4. PayPal Webhook (Automated Lifecycle Events)
router.post("/webhook", async (req, res) => {
    try {
        // Extract headers for signature verification
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
                headers[key.toLowerCase()] = value;
            }
        }

        // Verify webhook signature
        const verification = await verifyPayPalWebhook(headers, req.body);

        if (!verification.valid) {
            console.error(`[PayPal Webhook] Signature verification failed: ${verification.error}`);
            return res.status(401).json({ error: "Invalid webhook signature" });
        }

        const event = req.body;
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`[PayPal Webhook] Received event: ${eventType}`);

        // Handle different event types
        switch (eventType) {
            case "BILLING.SUBSCRIPTION.ACTIVATED":
                // Subscription became active (handles renewals too)
                if (resource?.id) {
                    const subscriptionId = resource.id;
                    const [existingSub] = await db
                        .select()
                        .from(subscriptions)
                        .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

                    if (existingSub) {
                        const now = new Date();
                        const periodEnd = new Date();
                        periodEnd.setDate(periodEnd.getDate() + 30);

                        await db
                            .update(subscriptions)
                            .set({
                                status: 'active',
                                currentPeriodStart: now,
                                currentPeriodEnd: periodEnd,
                                updatedAt: now
                            })
                            .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

                        console.log(`[PayPal Webhook] Subscription ${subscriptionId} renewed/activated`);
                    }
                }
                break;

            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.EXPIRED":
                // Subscription ended
                if (resource?.id) {
                    const subscriptionId = resource.id;
                    await db
                        .update(subscriptions)
                        .set({
                            status: 'cancelled',
                            updatedAt: new Date()
                        })
                        .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

                    console.log(`[PayPal Webhook] Subscription ${subscriptionId} cancelled/expired`);
                }
                break;

            case "BILLING.SUBSCRIPTION.SUSPENDED":
                // Payment failed, subscription suspended
                if (resource?.id) {
                    const subscriptionId = resource.id;
                    await db
                        .update(subscriptions)
                        .set({
                            status: 'suspended',
                            updatedAt: new Date()
                        })
                        .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

                    console.log(`[PayPal Webhook] Subscription ${subscriptionId} suspended`);
                }
                break;

            case "PAYMENT.SALE.COMPLETED":
                // Successful payment - Award monthly points on renewal
                console.log(`[PayPal Webhook] Payment completed - processing monthly points`);

                // Extract subscription ID from billing agreement
                const billingAgreementId = resource?.billing_agreement_id;
                if (billingAgreementId) {
                    const [existingSub] = await db
                        .select()
                        .from(subscriptions)
                        .where(eq(subscriptions.paypalSubscriptionId, billingAgreementId));

                    if (existingSub && existingSub.status === 'active') {
                        // Determine points based on tier
                        const tierPoints: Record<string, number> = {
                            basic: 3000,
                            pro: 10000,
                            elite: 25000
                        };
                        const points = tierPoints[existingSub.tier] || 0;

                        if (points > 0) {
                            // Check if we already awarded points for this transaction (idempotency)
                            const transactionId = resource?.id;

                            await pointsEngine.awardPoints(
                                existingSub.userId,
                                points,
                                'MONTHLY_ALLOWANCE',
                                transactionId || billingAgreementId,
                                'subscription',
                                `Monthly renewal points for ${existingSub.tier} tier`
                            );

                            console.log(`[PayPal Webhook] Awarded ${points} points to user ${existingSub.userId} for ${existingSub.tier} renewal`);
                        }

                        // Update subscription period
                        const now = new Date();
                        const periodEnd = new Date();
                        periodEnd.setDate(periodEnd.getDate() + 30);

                        await db
                            .update(subscriptions)
                            .set({
                                currentPeriodStart: now,
                                currentPeriodEnd: periodEnd,
                                updatedAt: now
                            })
                            .where(eq(subscriptions.paypalSubscriptionId, billingAgreementId));
                    }
                }
                break;

            case "PAYMENT.SALE.DENIED":
                // Payment failed
                console.log(`[PayPal Webhook] Payment denied for subscription`);
                break;

            default:
                console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ received: true, eventType });

    } catch (error: any) {
        console.error("[PayPal Webhook] Error processing webhook:", error);
        // Return 200 to prevent PayPal from retrying (we log the error)
        res.status(200).json({ received: true, error: "Processing error logged" });
    }
});

export default router;

