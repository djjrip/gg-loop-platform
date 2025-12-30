/**
 * AFFILIATE REVENUE DASHBOARD API
 * Real-time commission tracking and revenue analytics
 */
import { Router } from 'express';
import { getAffiliateRevenue, handleRewardProcurement, AFFILIATE_NETWORKS } from '../affiliate-revenue';
const router = Router();
/**
 * GET /api/affiliate/revenue
 * Get affiliate revenue metrics
 */
router.get('/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const revenue = await getAffiliateRevenue(start, end);
        res.json({
            period: {
                start: start.toISOString(),
                end: end.toISOString()
            },
            ...revenue,
            networks: AFFILIATE_NETWORKS
        });
    }
    catch (error) {
        console.error('Error fetching affiliate revenue:', error);
        res.status(500).json({ error: 'Failed to fetch affiliate revenue' });
    }
});
/**
 * GET /api/affiliate/procurement/:redemptionId
 * Get procurement instructions with affiliate link
 */
router.get('/procurement/:redemptionId', async (req, res) => {
    try {
        const { redemptionId } = req.params;
        const { rewardId } = req.query;
        if (!rewardId) {
            return res.status(400).json({ error: 'rewardId required' });
        }
        const procurement = await handleRewardProcurement(redemptionId, rewardId);
        res.json(procurement);
    }
    catch (error) {
        console.error('Error generating procurement instructions:', error);
        res.status(500).json({ error: 'Failed to generate procurement instructions' });
    }
});
/**
 * GET /api/affiliate/dashboard
 * Complete affiliate analytics dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Last 7 days
        const last7Days = await getAffiliateRevenue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
        // Last 30 days
        const last30Days = await getAffiliateRevenue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
        // All time
        const allTime = await getAffiliateRevenue(new Date('2024-01-01'), new Date());
        res.json({
            last7Days,
            last30Days,
            allTime,
            projectedMonthly: last7Days.totalCommission * 4.3, // Weekly × 4.3
            networks: {
                amazon: {
                    name: AFFILIATE_NETWORKS.amazon.name,
                    commission: AFFILIATE_NETWORKS.amazon.commission,
                    last30Days: last30Days.amazonCommission
                },
                impact: {
                    name: AFFILIATE_NETWORKS.impact.name,
                    commission: AFFILIATE_NETWORKS.impact.commission,
                    last30Days: last30Days.impactCommission
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching affiliate dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch affiliate dashboard' });
    }
});
export default router;
