/**
 * Stripe Integration Module
 * 
 * Handles Stripe payment processing for Founding Member $29 payments
 * - Environment validation (fail fast if keys missing)
 * - Checkout session creation (server-side only)
 * - Webhook signature verification
 * - Post-payment state changes
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Fail fast if critical env vars missing
if (!STRIPE_SECRET_KEY) {
  console.error('[Stripe] ❌ CRITICAL: STRIPE_SECRET_KEY not configured');
  console.error('[Stripe] Payment processing will fail');
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('[Stripe] ⚠️  WARNING: STRIPE_PUBLISHABLE_KEY not configured');
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('[Stripe] ⚠️  WARNING: STRIPE_WEBHOOK_SECRET not configured');
  console.warn('[Stripe] Webhook signature verification will fail');
}

// Initialize Stripe client (LIVE mode only - no test mode)
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe initialization failed: STRIPE_SECRET_KEY not configured');
  }

  console.log('[Stripe] ✅ Initializing Stripe client (LIVE mode)');
  
  stripeClient = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY && !!STRIPE_PUBLISHABLE_KEY;
}

export function getStripePublishableKey(): string | null {
  return STRIPE_PUBLISHABLE_KEY || null;
}

export function getStripeWebhookSecret(): string | null {
  return STRIPE_WEBHOOK_SECRET || null;
}

