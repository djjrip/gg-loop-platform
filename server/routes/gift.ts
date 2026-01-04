import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../database';
import { giftPurchases, users, subscriptions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
});

// Tier pricing (in cents)
const TIER_PRICES: Record<string, { amount: number; name: string; months?: number }> = {
    basic: { amount: 500, name: 'Basic', months: 1 },
    builder: { amount: 800, name: 'Builder', months: 1 },
    pro: { amount: 1200, name: 'Pro', months: 1 },
    elite: { amount: 2500, name: 'Elite', months: 1 },
    founder: { amount: 2900, name: 'Founding Member', months: undefined }, // Lifetime
};

/**
 * POST /api/gift/create-checkout
 * Create a Stripe checkout session for gifting a tier
 */
router.post('/create-checkout', async (req: any, res) => {
    try {
        const { tier, recipientEmail } = req.body;
        const purchaserId = req.user?.id || null; // Can be guest

        // Validate tier
        if (!tier || !TIER_PRICES[tier]) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Validate email
        if (!recipientEmail || !recipientEmail.includes('@')) {
            return res.status(400).json({ error: 'Valid recipient email required' });
        }

        const tierInfo = TIER_PRICES[tier];

        // Generate unique claim token
        const claimToken = crypto.randomBytes(32).toString('hex');

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Gift: GG LOOP ${tierInfo.name}`,
                        description: tier === 'founder' 
                            ? 'Lifetime Founding Member access for recipient'
                            : `1 month of ${tierInfo.name} tier for recipient`,
                    },
                    unit_amount: tierInfo.amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.APP_URL || 'https://ggloop.io'}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL || 'https://ggloop.io'}/gift`,
            customer_email: purchaserId ? undefined : recipientEmail, // Pre-fill for guests
            metadata: {
                type: 'gift_tier',
                tier,
                recipientEmail,
                purchaserId: purchaserId || 'guest',
                claimToken,
            },
        });

        // Calculate expiration (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Create gift purchase record
        await db.insert(giftPurchases).values({
            purchaserId,
            recipientEmail,
            tier,
            stripeSessionId: session.id,
            claimToken,
            expiresAt,
            amount: tierInfo.amount,
            status: 'pending',
        });

        console.log(`[Gift] Checkout created: ${tier} for ${recipientEmail} | Token: ${claimToken.substring(0, 8)}...`);

        res.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (error: any) {
        console.error('[Gift] Checkout creation failed:', error);
        res.status(500).json({ error: 'Failed to create gift checkout' });
    }
});

/**
 * GET /api/gift/claim/:token
 * Get gift info for claiming
 */
router.get('/claim/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const [gift] = await db.select()
            .from(giftPurchases)
            .where(eq(giftPurchases.claimToken, token))
            .limit(1);

        if (!gift) {
            return res.status(404).json({ error: 'Gift not found' });
        }

        if (gift.status === 'claimed') {
            return res.status(400).json({ error: 'Gift already claimed' });
        }

        if (gift.status === 'expired' || new Date(gift.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'Gift has expired' });
        }

        if (gift.status !== 'pending') {
            return res.status(400).json({ error: 'Gift is not available' });
        }

        res.json({
            tier: gift.tier,
            tierName: TIER_PRICES[gift.tier]?.name || gift.tier,
            expiresAt: gift.expiresAt,
            recipientEmail: gift.recipientEmail,
        });
    } catch (error: any) {
        console.error('[Gift] Claim lookup failed:', error);
        res.status(500).json({ error: 'Failed to lookup gift' });
    }
});

/**
 * POST /api/gift/claim/:token
 * Claim a gift (requires authentication)
 */
router.post('/claim/:token', async (req: any, res) => {
    try {
        const { token } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Must be logged in to claim gift' });
        }

        const [gift] = await db.select()
            .from(giftPurchases)
            .where(eq(giftPurchases.claimToken, token))
            .limit(1);

        if (!gift) {
            return res.status(404).json({ error: 'Gift not found' });
        }

        if (gift.status === 'claimed') {
            return res.status(400).json({ error: 'Gift already claimed' });
        }

        if (gift.status === 'expired' || new Date(gift.expiresAt) < new Date()) {
            await db.update(giftPurchases)
                .set({ status: 'expired' })
                .where(eq(giftPurchases.id, gift.id));
            return res.status(400).json({ error: 'Gift has expired' });
        }

        // Apply the tier to the user
        const tierInfo = TIER_PRICES[gift.tier];
        const now = new Date();
        
        if (gift.tier === 'founder') {
            // Founding member - set flag on user
            await db.update(users)
                .set({ isFounder: true })
                .where(eq(users.id, userId));
            
            console.log(`[Gift] Founding Member gift claimed by ${userId}`);
        } else {
            // Regular subscription tier
            const periodEnd = new Date();
            if (tierInfo.months) {
                periodEnd.setMonth(periodEnd.getMonth() + tierInfo.months);
            }

            // Create or update subscription
            const [existingSub] = await db.select()
                .from(subscriptions)
                .where(eq(subscriptions.userId, userId))
                .limit(1);

            if (existingSub) {
                await db.update(subscriptions)
                    .set({
                        tier: gift.tier,
                        status: 'active',
                        currentPeriodEnd: periodEnd,
                        updatedAt: now,
                    })
                    .where(eq(subscriptions.id, existingSub.id));
            } else {
                await db.insert(subscriptions).values({
                    userId,
                    tier: gift.tier,
                    status: 'active',
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                });
            }

            console.log(`[Gift] ${gift.tier} subscription gift claimed by ${userId}`);
        }

        // Mark gift as claimed
        await db.update(giftPurchases)
            .set({
                status: 'claimed',
                claimedAt: now,
                claimedByUserId: userId,
            })
            .where(eq(giftPurchases.id, gift.id));

        res.json({
            success: true,
            tier: gift.tier,
            message: `Successfully claimed ${tierInfo.name} gift!`,
        });
    } catch (error: any) {
        console.error('[Gift] Claim failed:', error);
        res.status(500).json({ error: 'Failed to claim gift' });
    }
});

/**
 * GET /api/gift/my-gifts
 * Get gifts purchased by the current user
 */
router.get('/my-gifts', async (req: any, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const gifts = await db.select()
            .from(giftPurchases)
            .where(eq(giftPurchases.purchaserId, userId))
            .orderBy(giftPurchases.createdAt);

        res.json(gifts.map(g => ({
            id: g.id,
            tier: g.tier,
            tierName: TIER_PRICES[g.tier]?.name || g.tier,
            recipientEmail: g.recipientEmail,
            status: g.status,
            amount: g.amount,
            createdAt: g.createdAt,
            claimedAt: g.claimedAt,
            expiresAt: g.expiresAt,
        })));
    } catch (error: any) {
        console.error('[Gift] My gifts lookup failed:', error);
        res.status(500).json({ error: 'Failed to get gifts' });
    }
});

export default router;

