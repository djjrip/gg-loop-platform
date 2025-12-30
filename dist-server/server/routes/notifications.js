import { Router } from "express";
import { db } from "../database";
import { notifications, notificationCampaigns } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
const router = Router();
// Middleware to ensure admin (reused from existing auth if available, otherwise check req.user)
const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.isAdmin || req.user.isFounder || req.user.username === "djjrip" || req.user.username === "kuyajrip")) {
        return next();
    }
    return res.status(403).json({ message: "Admin access required" });
};
// GET /api/notifications - Get current user's notifications
router.get("/", async (req, res) => {
    if (!req.isAuthenticated())
        return res.sendStatus(401);
    try {
        const userNotifs = await db.select().from(notifications)
            .where(eq(notifications.userId, req.user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);
        res.json(userNotifs);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});
// POST /api/notifications/mark-read - Mark list of IDs as read
router.post("/mark-read", async (req, res) => {
    if (!req.isAuthenticated())
        return res.sendStatus(401);
    const { ids } = req.body; // Array of IDs
    if (!ids || !Array.isArray(ids))
        return res.status(400).json({ message: "Invalid IDs" });
    try {
        // In a real app we'd verify ownership of these notification IDs, but for speed 
        // we assume the IDs provided match the user (or we filter by user in the update query if Drizzle supports it easily)
        // For now, looping updates or single update if supported.
        // Simplifying to single "mark all read" or specific ID for now.
        // Safer:
        for (const id of ids) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(and(eq(notifications.id, id), eq(notifications.userId, req.user.id)));
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to mark read" });
    }
});
// ADMIN: Send Notification
router.post("/send", ensureAdmin, async (req, res) => {
    const { userId, type, title, message, metadata } = req.body;
    if (!userId || !title || !message) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const newNotif = await db.insert(notifications).values({
            userId,
            type: type || 'system',
            title,
            message,
            metadata,
            isRead: false
        }).returning();
        res.json(newNotif[0]);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to send notification" });
    }
});
// ADMIN: Create Campaign (Draft or Send)
router.post("/campaigns", ensureAdmin, async (req, res) => {
    // Scaffold for future Phase 2 expansion
    const { title, message, targetAudience } = req.body;
    try {
        const campaign = await db.insert(notificationCampaigns).values({
            title,
            message,
            targetAudience,
            createdBy: req.user.id,
            status: 'draft'
        }).returning();
        res.json(campaign[0]);
    }
    catch (e) {
        res.status(500).json({ message: "Failed to create campaign" });
    }
});
export default router;
