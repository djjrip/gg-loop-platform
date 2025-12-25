import { Router } from "express";
import { db } from "../db";
import { rewards, userRewards, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { pointsEngine } from "../pointsEngine";
import { z } from "zod";

const rewardRedemptionRouter = Router();

// Validation schema
const redeemRewardSchema = z.object({
    rewardId: z.string().uuid(),
    shippingAddress: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingState: z.string().optional(),
    shippingZip: z.string().optional(),
    shippingCountry: z.string().default("US"),
});

/**
 * GET /api/rewards
 * 
 * Returns available rewards for the shop (PUBLIC - no auth required).
 * This is called by Shop.tsx to display the catalog.
 */
rewardRedemptionRouter.get("/", async (req: any, res) => {
    try {
        const availableRewards = await db.select()
            .from(rewards)
            .where(eq(rewards.inStock, true));

        res.json(availableRewards);
    } catch (error) {
        console.error("Get rewards catalog error:", error);
        res.status(500).json({ error: "Failed to get rewards catalog" });
    }
});

/**
 * POST /api/rewards/redeem
 * 
 * Redeems a reward for the logged-in user.
 * Deducts points and creates a pending fulfillment record.
 * Notifies admin via console log (email notification can be added later).
 */
rewardRedemptionRouter.post("/redeem", async (req: any, res) => {
    try {
        // 1. Verify user is authenticated
        const user = req.user || req.dbUser;
        if (!user?.id) {
            return res.status(401).json({ error: "You must be logged in to redeem rewards" });
        }

        const userId = user.id;

        // 2. Validate request body
        const parseResult = redeemRewardSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: parseResult.error.errors
            });
        }

        const { rewardId, shippingAddress, shippingCity, shippingState, shippingZip, shippingCountry } = parseResult.data;

        // 3. Get the reward
        const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId));

        if (!reward) {
            return res.status(404).json({ error: "Reward not found" });
        }

        if (!reward.inStock) {
            return res.status(400).json({ error: "This reward is currently out of stock" });
        }

        // 4. Get user's current balance
        const balance = await pointsEngine.getUserBalance(userId);

        if (balance < reward.pointsCost) {
            return res.status(400).json({
                error: "Insufficient points",
                required: reward.pointsCost,
                current: balance,
                needed: reward.pointsCost - balance
            });
        }

        // 5. Deduct points
        const transaction = await pointsEngine.spendPoints(
            userId,
            reward.pointsCost,
            "reward_redemption",
            rewardId,
            "reward",
            `Redeemed: ${reward.title}`
        );

        // 6. Create redemption record
        const [redemption] = await db.insert(userRewards).values({
            userId: userId,
            rewardId: rewardId,
            pointsSpent: reward.pointsCost,
            status: "pending",
            shippingAddress: shippingAddress,
            shippingCity: shippingCity,
            shippingState: shippingState,
            shippingZip: shippingZip,
            shippingCountry: shippingCountry,
        }).returning();

        // 7. Update stock if tracked
        if (reward.stock !== null && reward.stock > 0) {
            await db.update(rewards)
                .set({
                    stock: reward.stock - 1,
                    inStock: reward.stock - 1 > 0
                })
                .where(eq(rewards.id, rewardId));
        }

        // 8. Admin notification (console log for now, can add email later)
        console.log(`
========================================
🎁 NEW REWARD REDEMPTION!
========================================
User ID: ${userId}
User Email: ${user.email || 'Unknown'}
Reward: ${reward.title}
Points Spent: ${reward.pointsCost}
Real Value: $${(reward.realValue / 100).toFixed(2)}
Category: ${reward.category}
Redemption ID: ${redemption.id}
Status: PENDING (Manual fulfillment required)

Shipping Info:
${shippingAddress || 'Not provided'}
${shippingCity || ''}, ${shippingState || ''} ${shippingZip || ''}
${shippingCountry}
========================================
    `);

        // 9. Return success
        res.json({
            success: true,
            redemption: {
                id: redemption.id,
                reward: reward.title,
                pointsSpent: reward.pointsCost,
                status: "pending",
                message: "Your redemption is being processed! We'll notify you when it ships."
            },
            newBalance: balance - reward.pointsCost
        });

    } catch (error: any) {
        console.error("Reward redemption error:", error);
        res.status(500).json({
            error: "Failed to redeem reward. Please try again later.",
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/rewards/my-redemptions
 * 
 * Returns the user's redemption history.
 */
rewardRedemptionRouter.get("/my-redemptions", async (req: any, res) => {
    try {
        const user = req.user || req.dbUser;
        if (!user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const redemptions = await db.select({
            id: userRewards.id,
            rewardId: userRewards.rewardId,
            pointsSpent: userRewards.pointsSpent,
            status: userRewards.status,
            redeemedAt: userRewards.redeemedAt,
            fulfilledAt: userRewards.fulfilledAt,
            trackingNumber: userRewards.trackingNumber,
            rewardTitle: rewards.title,
            rewardCategory: rewards.category,
        })
            .from(userRewards)
            .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
            .where(eq(userRewards.userId, user.id))
            .orderBy(userRewards.redeemedAt);

        res.json({ redemptions });
    } catch (error) {
        console.error("Get redemptions error:", error);
        res.status(500).json({ error: "Failed to get redemptions" });
    }
});

/**
 * GET /api/rewards/catalog
 * 
 * Returns available rewards for the shop.
 */
rewardRedemptionRouter.get("/catalog", async (req: any, res) => {
    try {
        const availableRewards = await db.select()
            .from(rewards)
            .where(eq(rewards.inStock, true));

        res.json({ rewards: availableRewards });
    } catch (error) {
        console.error("Get catalog error:", error);
        res.status(500).json({ error: "Failed to get rewards catalog" });
    }
});

export default rewardRedemptionRouter;
