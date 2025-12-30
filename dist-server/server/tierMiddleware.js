import { storage } from "./storage";
/**
 * Subscription tier hierarchy
 * basic < pro < elite
 */
const TIER_HIERARCHY = {
    basic: 1,
    pro: 2,
    elite: 3,
};
/**
 * Middleware factory to enforce minimum subscription tier requirements
 *
 * Usage:
 * app.post('/api/exclusive-feature', getUserMiddleware, requireTier('pro'), async (req, res) => { ... });
 *
 * @param minimumTier - The minimum required tier (basic, pro, or elite)
 * @returns Express middleware function
 */
export function requireTier(minimumTier) {
    return async (req, res, next) => {
        try {
            const user = req.dbUser;
            if (!user) {
                return res.status(401).json({
                    message: "Authentication required",
                });
            }
            // Get user's current subscription
            const subscription = await storage.getSubscription(user.id);
            if (!subscription) {
                return res.status(403).json({
                    message: `This feature requires an active subscription. Minimum tier: ${minimumTier.toUpperCase()}`,
                    requiredTier: minimumTier,
                    currentTier: null,
                });
            }
            const userTier = subscription.tier;
            const userTierLevel = TIER_HIERARCHY[userTier] || 0;
            const requiredTierLevel = TIER_HIERARCHY[minimumTier];
            if (userTierLevel < requiredTierLevel) {
                return res.status(403).json({
                    message: `This feature requires ${minimumTier.toUpperCase()} tier or higher. Your current tier: ${userTier.toUpperCase()}`,
                    requiredTier: minimumTier,
                    currentTier: userTier,
                    upgradeUrl: "/subscribe",
                });
            }
            // User has sufficient tier, proceed
            next();
        }
        catch (error) {
            console.error("Error in tier middleware:", error);
            res.status(500).json({
                message: "Failed to verify subscription tier",
            });
        }
    };
}
/**
 * Middleware to require pro tier or higher
 */
export const requireProTier = requireTier('pro');
/**
 * Middleware to require elite tier
 */
export const requireEliteTier = requireTier('elite');
/**
 * Helper function to check if a user has a specific tier or higher
 * (Can be used in route handlers for custom logic)
 */
export async function userHasTier(userId, minimumTier) {
    try {
        const subscription = await storage.getSubscription(userId);
        if (!subscription) {
            return false;
        }
        const userTier = subscription.tier;
        const userTierLevel = TIER_HIERARCHY[userTier] || 0;
        const requiredTierLevel = TIER_HIERARCHY[minimumTier];
        return userTierLevel >= requiredTierLevel;
    }
    catch (error) {
        console.error("Error checking user tier:", error);
        return false;
    }
}
