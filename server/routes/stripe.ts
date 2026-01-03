/**
 * Stripe Routes
 * 
 * Handles:
 * - Founding Member checkout session creation
 * - Webhook events (checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed)
 */

import { Router } from 'express';
import express from 'express';
import { getStripeClient, getStripeWebhookSecret, isStripeConfigured } from '../stripe';
import { db } from '../database';
import { users } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { storage } from '../storage';
import { pointsEngine } from '../pointsEngine';
import Stripe from 'stripe';

const router = Router();

const FOUNDING_MEMBER_PRICE = 2900; // $29.00 in cents
const FOUNDING_MEMBER_MAX = 50; // First 50 only

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout session for Founding Member $29 payment
 * 
 * Idempotency: Uses user ID + timestamp to prevent duplicate sessions
 */
router.post('/create-checkout', async (req: any, res) => {
  try {
    if (!isStripeConfigured()) {
      console.error('[Stripe] Checkout creation failed: Stripe not configured');
      return res.status(500).json({ error: 'Payment processing not available' });
    }

    // Check if we've reached the limit
    const [founderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isFounder, true));
    
    const currentCount = Number(founderCount?.count || 0);
    if (currentCount >= FOUNDING_MEMBER_MAX) {
      return res.status(400).json({ error: 'Founding Member spots are sold out' });
    }

    // Support both logged-in and guest users
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (req.isAuthenticated() && req.user?.oidcSub) {
      const dbUser = await storage.getUserByOidcSub(req.user.oidcSub);
      if (dbUser) {
        // Check if user is already a Founding Member
        if (dbUser.isFounder) {
          return res.status(400).json({ error: 'You are already a Founding Member' });
        }
        userId = dbUser.id;
        userEmail = dbUser.email || undefined;
      }
    }

    console.log(`[Stripe] Creating Founding Member checkout session (${userId ? `user: ${userId}` : 'guest'})`);

    const stripe = getStripeClient();
    const baseUrl = process.env.BASE_URL || 'https://ggloop.io';

    const sessionConfig: any = {
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Founding Member - Lifetime Access',
              description: 'Join the first 50 members. Lock in lifetime benefits: 2x points forever, name on wall, early access, and more.',
            },
            unit_amount: FOUNDING_MEMBER_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/founding-member?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/founding-member?canceled=true`,
      metadata: {
        type: 'founding_member',
        billing_type: 'lifetime',
      },
    };

    // Add customer email if available
    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    // Add userId if authenticated
    if (userId) {
      sessionConfig.metadata.userId = userId;
      sessionConfig.payment_intent_data = {
        metadata: {
          userId,
          type: 'founding_member',
          billing_type: 'lifetime',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[Stripe] ✅ Checkout session created: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Stripe] Checkout creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/stripe/create-subscription-checkout
 * Creates a Stripe Checkout session for subscription tiers (basic, pro, elite)
 * 
 * Mode: subscription (recurring monthly)
 */
router.post('/create-subscription-checkout', async (req: any, res) => {
  try {
    if (!isStripeConfigured()) {
      console.error('[Stripe] Subscription checkout creation failed: Stripe not configured');
      return res.status(500).json({ error: 'Payment processing not available' });
    }

    const { tier } = req.body;
    if (!tier) {
      return res.status(400).json({ error: 'Tier is required' });
    }

    // Subscription pricing (monthly, in cents)
    const tierPricing: Record<string, { price: number; name: string; points: number }> = {
      basic: { price: 500, name: 'Basic', points: 3000 },
      pro: { price: 1200, name: 'Pro', points: 10000 },
      builder: { price: 1200, name: 'Builder', points: 10000 },
      elite: { price: 2500, name: 'Elite', points: 25000 },
    };

    const tierConfig = tierPricing[tier.toLowerCase()];
    if (!tierConfig) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Support both logged-in and guest users
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (req.isAuthenticated() && req.user?.oidcSub) {
      const dbUser = await storage.getUserByOidcSub(req.user.oidcSub);
      if (dbUser) {
        userId = dbUser.id;
        userEmail = dbUser.email || undefined;
      }
    }

    console.log(`[Stripe] Creating subscription checkout (${userId ? `user: ${userId}` : 'guest'}), tier: ${tierConfig.name}`);

    const stripe = getStripeClient();
    const baseUrl = process.env.BASE_URL || 'https://ggloop.io';

    const sessionConfig: any = {
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierConfig.name} Subscription`,
              description: `${tierConfig.points.toLocaleString()} monthly points`,
            },
            unit_amount: tierConfig.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: {
        type: 'subscription',
        tier: tier.toLowerCase(),
        billing_type: 'monthly',
      },
    };

    // Add customer email if available
    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    // Add userId if authenticated
    if (userId) {
      sessionConfig.metadata.userId = userId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[Stripe] ✅ Subscription checkout session created: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Stripe] Subscription checkout creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription checkout session' });
  }
});

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 * 
 * Events handled:
 * - checkout.session.completed: Grant Founding Member status
 * - payment_intent.succeeded: Backup confirmation
 * - payment_intent.payment_failed: Log failure
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: any, res) => {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    console.error('[Stripe Webhook] ❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Stripe Webhook] ❌ Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`[Stripe Webhook] ✅ Signature verified: ${event.type}`);
  } catch (err: any) {
    console.error(`[Stripe Webhook] ❌ Signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe Webhook] ⚠️  Payment failed: ${paymentIntent.id}`);
        console.log(`[Stripe Webhook] Failure reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    // Return 200 to prevent Stripe from retrying (we log the error)
    res.status(200).json({ received: true, error: 'Processing error logged' });
  }
});

/**
 * Handle checkout.session.completed event
 * Grants Founding Member status and applies entitlements
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Stripe Webhook] Processing checkout.session.completed: ${session.id}`);

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('[Stripe Webhook] ❌ No userId in session metadata');
    return;
  }

  if (session.payment_status !== 'paid') {
    console.warn(`[Stripe Webhook] ⚠️  Checkout session ${session.id} not paid (status: ${session.payment_status})`);
    return;
  }

  // Prevent duplicate processing (check if user already has founder status)
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user?.isFounder) {
    console.log(`[Stripe Webhook] ⏭️  User ${userId} already has Founding Member status, skipping`);
    return;
  }

  await grantFoundingMemberStatus(userId, session.id);
}

/**
 * Handle payment_intent.succeeded event (backup confirmation)
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[Stripe Webhook] Processing payment_intent.succeeded: ${paymentIntent.id}`);

  const userId = paymentIntent.metadata?.userId;
  if (!userId || paymentIntent.metadata?.type !== 'founding_member') {
    return; // Not a Founding Member payment
  }

  // Backup: If checkout.session.completed didn't fire, process here
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isFounder) {
    console.log(`[Stripe Webhook] Backup processing: Granting Founding Member status for payment ${paymentIntent.id}`);
    await grantFoundingMemberStatus(userId, paymentIntent.id);
  } else {
    console.log(`[Stripe Webhook] User ${userId} already has Founding Member status, skipping backup processing`);
  }
}

/**
 * Grant Founding Member status to user
 * - Sets isFounder = true
 * - Assigns founderNumber (next available)
 * - Applies 2x points multiplier (via subscriptionTier or metadata)
 * - Awards welcome bonus points
 */
async function grantFoundingMemberStatus(userId: string, paymentId: string): Promise<void> {
  console.log(`[Stripe] Granting Founding Member status to user ${userId} (payment: ${paymentId})`);

  await db.transaction(async (tx: any) => {
    // Get next founder number
    const [lastFounder] = await tx
      .select({ founderNumber: users.founderNumber })
      .from(users)
      .where(sql`${users.founderNumber} IS NOT NULL`)
      .orderBy(sql`${users.founderNumber} DESC`)
      .limit(1);

    const nextFounderNumber = (lastFounder?.founderNumber ? Number(lastFounder.founderNumber) : 0) + 1;

    if (nextFounderNumber > FOUNDING_MEMBER_MAX) {
      throw new Error(`Founding Member limit (${FOUNDING_MEMBER_MAX}) exceeded`);
    }

    // Update user
    await tx
      .update(users)
      .set({
        isFounder: true,
        founderNumber: nextFounderNumber,
        subscriptionTier: 'founding_member', // For 2x points logic
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Award welcome bonus points (1,000 points)
    await pointsEngine.awardPoints(
      userId,
      1000,
      'FOUNDING_MEMBER_BONUS',
      `stripe-${paymentId}`,
      'stripe_payment',
      `Founding Member #${nextFounderNumber} Welcome Bonus`,
      tx
    );

    console.log(`[Stripe] ✅ Granted Founding Member #${nextFounderNumber} to user ${userId}`);
  });
}

export default router;

