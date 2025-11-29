import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users, auditLogs, type User } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// Admin Middleware (Duplicated for safety/isolation)
const adminMiddleware = async (req: any, res: any, next: any) => {
    try {
        if (!req.isAuthenticated() || !req.user?.oidcSub) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const oidcSub = req.user.oidcSub;
        const dbUser = await storage.getUserByOidcSub(oidcSub);
        if (!dbUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // MVP: Owner email check
        const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
        if (!ADMIN_EMAILS.includes(dbUser.email || '')) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.dbUser = dbUser;
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        res.status(500).json({ message: "Failed to authenticate admin" });
    }
};

// Apply middleware to all routes
router.use(adminMiddleware);

// System Status
router.get("/system-status", async (req, res) => {
    try {
        // Check DB
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;

        // Check External APIs (Mock for now, or simple ping)
        const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
        const tremendousConfigured = !!process.env.TREMENDOUS_API_KEY;

        res.json({
            database: { status: "healthy", latency: dbLatency },
            stripe: { status: stripeConfigured ? "configured" : "missing_config" },
            tremendous: { status: tremendousConfigured ? "configured" : "missing_config" },
            serverTime: new Date().toISOString(),
            uptime: process.uptime(),
        });
    } catch (error) {
        res.status(500).json({ database: { status: "unhealthy", error: String(error) } });
    }
});

// User Management - List
router.get("/users", async (req, res) => {
    try {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt || sql`now()`)).limit(100);
        res.json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    } catch (error) {
        console.error("Error adjusting points:", error);
        res.status(500).json({ message: "Failed to adjust points" });
    }
});

// Audit Logs
router.get("/audit-logs", async (req, res) => {
    try {
        const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
});

export default router;
