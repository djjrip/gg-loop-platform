/**
 * 🎁 ADMIN FULFILLMENT DASHBOARD
 *
 * Quick approve/fulfill redemptions
 * Built for fast manual fulfillment
 */
import { Router } from 'express';
import { db } from '../database';
import { userRewards, rewards, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';
import { sendEmail } from '../services/email';
const router = Router();
// Admin-only middleware
const adminOnly = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!user[0] || !adminEmails.includes(user[0].email)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
/**
 * GET /api/admin/fulfillment/pending
 * Get all pending redemptions
 */
router.get('/pending', isAuthenticated, adminOnly, async (req, res) => {
    try {
        const pending = await db
            .select({
            id: userRewards.id,
            userId: userRewards.userId,
            rewardId: userRewards.rewardId,
            rewardTitle: rewards.title,
            rewardValue: rewards.realValue,
            pointsSpent: userRewards.pointsSpent,
            userEmail: users.email,
            userDisplayName: users.username,
            redeemedAt: userRewards.redeemedAt,
            shippingAddress: userRewards.shippingAddress,
            affiliateUrl: rewards.affiliateUrl,
            affiliateProgram: rewards.affiliateProgram
        })
            .from(userRewards)
            .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
            .innerJoin(users, eq(userRewards.userId, users.id))
            .where(eq(userRewards.status, 'pending'))
            .orderBy(desc(userRewards.redeemedAt))
            .limit(50);
        res.json({ pending, count: pending.length });
    }
    catch (error) {
        console.error('Pending redemptions error:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * POST /api/admin/fulfillment/fulfill
 * Mark redemption as fulfilled
 */
router.post('/fulfill', isAuthenticated, adminOnly, async (req, res) => {
    try {
        const { redemptionId, fulfillmentNotes, fulfillmentData } = req.body;
        if (!redemptionId) {
            return res.status(400).json({ error: 'Redemption ID required' });
        }
        // Get redemption with user info
        const [redemption] = await db
            .select({
            redemption: userRewards,
            user: users,
            reward: rewards
        })
            .from(userRewards)
            .innerJoin(users, eq(userRewards.userId, users.id))
            .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
            .where(eq(userRewards.id, redemptionId))
            .limit(1);
        if (!redemption) {
            return res.status(404).json({ error: 'Redemption not found' });
        }
        // Update status
        await db
            .update(userRewards)
            .set({
            status: 'fulfilled',
            fulfilledAt: new Date(),
            fulfillmentNotes: fulfillmentNotes || null,
            fulfillmentData: fulfillmentData || null
        })
            .where(eq(userRewards.id, redemptionId));
        // Send fulfillment email
        if (redemption.user.email) {
            await sendEmail({
                to: redemption.user.email,
                subject: `Your GG LOOP Reward: ${redemption.reward.title} is Ready!`,
                htmlBody: `
          <h2>🎁 Your Reward is Ready!</h2>
          <p>Hi ${redemption.user.username || 'there'},</p>
          <p>Your redemption for <strong>${redemption.reward.title}</strong> has been fulfilled!</p>
          ${fulfillmentNotes ? `<p><strong>Notes:</strong> ${fulfillmentNotes}</p>` : ''}
          ${redemption.reward.affiliateUrl ? `<p><a href="${redemption.reward.affiliateUrl}" style="background: #C87941; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Claim Your Reward</a></p>` : ''}
          <p>Thanks for gaming with GG LOOP!</p>
        `
            }).catch(err => console.error('Failed to send fulfillment email:', err));
        }
        res.json({ success: true, message: 'Redemption fulfilled' });
    }
    catch (error) {
        console.error('Fulfill redemption error:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * POST /api/admin/fulfillment/bulk-fulfill
 * Fulfill multiple redemptions at once
 */
router.post('/bulk-fulfill', isAuthenticated, adminOnly, async (req, res) => {
    try {
        const { redemptionIds } = req.body;
        if (!Array.isArray(redemptionIds) || redemptionIds.length === 0) {
            return res.status(400).json({ error: 'Redemption IDs array required' });
        }
        let fulfilled = 0;
        let errors = 0;
        for (const id of redemptionIds) {
            try {
                await db
                    .update(userRewards)
                    .set({
                    status: 'fulfilled',
                    fulfilledAt: new Date()
                })
                    .where(eq(userRewards.id, id));
                fulfilled++;
            }
            catch (error) {
                errors++;
            }
        }
        res.json({ success: true, fulfilled, errors });
    }
    catch (error) {
        console.error('Bulk fulfill error:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
