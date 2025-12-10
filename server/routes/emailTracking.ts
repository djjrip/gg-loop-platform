import { Router } from 'express';
import { handleSendGridWebhook, getEmailMetrics, getRecentEvents, getTopEngaged } from '../emailTracker';

const router = Router();

/**
 * SendGrid webhook endpoint
 * SendGrid POSTs events here when emails are opened, clicked, etc.
 */
router.post('/webhooks/sendgrid', async (req, res) => {
    try {
        const events = req.body;

        if (!Array.isArray(events)) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        // Process events asynchronously
        handleSendGridWebhook(events).catch(err => {
            console.error('Error processing SendGrid webhook:', err);
        });

        // Respond immediately to SendGrid
        res.status(200).json({ received: events.length });
    } catch (error) {
        console.error('SendGrid webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get email metrics dashboard
 */
router.get('/admin/email-metrics', async (req, res) => {
    try {
        const campaignType = req.query.campaign as string | undefined;

        const metrics = await getEmailMetrics(campaignType);
        const recentEvents = await getRecentEvents(50);
        const topEngaged = await getTopEngaged(campaignType);

        res.json({
            metrics,
            recentEvents,
            topEngaged,
            campaignType: campaignType || 'all'
        });
    } catch (error) {
        console.error('Error fetching email metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

/**
 * Get streameroutreach engagement
 */
router.get('/admin/streamer-engagement', async (req, res) => {
    try {
        const fs = await import('fs/promises');
        const data = JSON.parse(await fs.readFile('./streamers-to-contact.json', 'utf-8'));

        // Filter streamers with engagement data
        const engaged = data.streamers.filter((s: any) => s.engagement?.opened || s.engagement?.clicked);
        const contacted = data.contacted || [];

        res.json({
            total: data.streamers.length,
            contacted: contacted.length,
            engaged: engaged.length,
            engagedStreamers: engaged,
            metrics: {
                engagementRate: contacted.length > 0 ? (engaged.length / contacted.length) * 100 : 0
            }
        });
    } catch (error) {
        console.error('Error fetching streamer engagement:', error);
        res.status(500).json({ error: 'Failed to fetch engagement data' });
    }
});

export default router;
