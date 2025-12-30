/**
 * EMAIL RESPONSE TRACKER
 * Integrates with SendGrid to track email engagement
 * Auto-updates databases when people open/click/reply
 */
import { db } from '../database';
/**
 * Process SendGrid webhook events
 */
export async function handleSendGridWebhook(events) {
    console.log(`📧 Processing ${events.length} SendGrid events`);
    for (const event of events) {
        try {
            await processEvent(event);
        }
        catch (error) {
            console.error(`Error processing event ${event.sg_event_id}:`, error);
        }
    }
}
/**
 * Process individual email event
 */
async function processEvent(event) {
    const { email, event: eventType, timestamp, url, category } = event;
    // Determine campaign type from categories
    const isEarlyAccess = category?.includes('early-access');
    const isStreamerOutreach = category?.includes('streamer-outreach');
    // Log event to database
    await db.execute(`
        INSERT INTO email_events (
            email,
            event_type,
            timestamp,
            url,
            campaign_type,
            sg_event_id,
            sg_message_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        email,
        eventType,
        timestamp,
        url || null,
        isEarlyAccess ? 'early-access' : isStreamerOutreach ? 'streamer-outreach' : 'other',
        event.sg_event_id,
        event.sg_message_id
    ]);
    // Update streamer database if it's outreach
    if (isStreamerOutreach && (eventType === 'open' || eventType === 'click')) {
        await updateStreamerEngagement(email, eventType);
    }
    console.log(`✅ ${eventType.toUpperCase()}: ${email}`);
}
/**
 * Update streamer-to-contact.json when they engage
 */
async function updateStreamerEngagement(email, eventType) {
    const fs = await import('fs/promises');
    const path = './streamers-to-contact.json';
    try {
        const data = JSON.parse(await fs.readFile(path, 'utf-8'));
        // Find streamer by email
        const streamer = data.streamers.find((s) => s.email === email);
        if (streamer) {
            if (!streamer.engagement) {
                streamer.engagement = { opened: false, clicked: false, replied: false };
            }
            if (eventType === 'open') {
                streamer.engagement.opened = true;
                streamer.engagement.openedAt = new Date().toISOString();
            }
            if (eventType === 'click') {
                streamer.engagement.clicked = true;
                streamer.engagement.clickedAt = new Date().toISOString();
            }
            await fs.writeFile(path, JSON.stringify(data, null, 2));
            console.log(`📊 Updated engagement for ${streamer.username}`);
        }
    }
    catch (error) {
        console.error('Error updating streamer engagement:', error);
    }
}
/**
 * Get email metrics for a campaign
 */
export async function getEmailMetrics(campaignType) {
    const whereClause = campaignType ? `WHERE campaign_type = ?` : '';
    const params = campaignType ? [campaignType] : [];
    const results = await db.execute(`
        SELECT 
            COUNT(CASE WHEN event_type = 'delivered' THEN 1 END) as delivered,
            COUNT(CASE WHEN event_type = 'open' THEN 1 END) as opened,
            COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicked,
            COUNT(CASE WHEN event_type = 'bounce' THEN 1 END) as bounced,
            COUNT(DISTINCT email) as unique_recipients
        FROM email_events
        ${whereClause}
    `, params);
    const row = results[0];
    return {
        sent: row.unique_recipients || 0,
        delivered: row.delivered || 0,
        opened: row.opened || 0,
        clicked: row.clicked || 0,
        bounced: row.bounced || 0,
        openRate: row.delivered > 0 ? (row.opened / row.delivered) * 100 : 0,
        clickRate: row.opened > 0 ? (row.clicked / row.opened) * 100 : 0,
    };
}
/**
 * Get recent email events
 */
export async function getRecentEvents(limit = 50) {
    return await db.execute(`
        SELECT * FROM email_events
        ORDER BY timestamp DESC
        LIMIT ?
    `, [limit]);
}
/**
 * Get top engaged emails
 */
export async function getTopEngaged(campaignType) {
    const whereClause = campaignType ? `WHERE campaign_type = ?` : '';
    const params = campaignType ? [campaignType] : [];
    return await db.execute(`
        SELECT 
            email,
            MAX(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END) as opened,
            MAX(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicked,
            COUNT(*) as total_events,
            MAX(timestamp) as last_activity
        FROM email_events
        ${whereClause}
        GROUP BY email
        HAVING opened = 1 OR clicked = 1
        ORDER BY clicked DESC, opened DESC, last_activity DESC
        LIMIT 20
    `, params);
}
export default handleSendGridWebhook;
