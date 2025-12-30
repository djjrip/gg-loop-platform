/**
 * CATALOG OPTIMIZER API
 * Endpoints for automated catalog optimization
 */
import { Router } from 'express';
import { optimizeCatalog, getAllAffiliateDeals, filterByMargin, selectBestDeals } from '../catalog-optimizer';
const router = Router();
/**
 * POST /api/catalog/optimize
 * Run full catalog optimization
 */
router.post('/optimize', async (req, res) => {
    try {
        const results = await optimizeCatalog();
        res.json(results);
    }
    catch (error) {
        console.error('Error optimizing catalog:', error);
        res.status(500).json({ error: 'Failed to optimize catalog' });
    }
});
/**
 * GET /api/catalog/scan-deals
 * Scan affiliate networks for available deals
 */
router.get('/scan-deals', async (req, res) => {
    try {
        const deals = await getAllAffiliateDeals();
        const filtered = filterByMargen(deals, 5);
        const best = selectBestDeals(filtered);
        res.json({
            total: deals.length,
            filtered: filtered.length,
            best: best.length,
            deals: best.slice(0, 20) // Return top 20
        });
    }
    catch (error) {
        console.error('Error scanning deals:', error);
        res.status(500).json({ error: 'Failed to scan deals' });
    }
});
/**
 * GET /api/catalog/stats
 * Get catalog optimization stats
 */
router.get('/stats', async (req, res) => {
    try {
        const deals = await getAllAffiliateDeals();
        const filtered = filterByMargin(deals, 5);
        const avgMargin = filtered.reduce((sum, d) => sum + (d.margin / d.faceValue) * 100, 0) / filtered.length;
        res.json({
            totalDealsAvailable: deals.length,
            highMarginDeals: filtered.length,
            avgMarginPercent: avgMargin.toFixed(2),
            lastScanned: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
export default router;
