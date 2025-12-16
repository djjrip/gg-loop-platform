import { Router } from "express";
import { db } from "../db";
import { users, partnerApiKeys, verificationProofs } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

// Middleware: Validate API Key
const validateApiKey = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) return res.status(401).json({ message: "Missing x-api-key header" });

    try {
        // In prod, use hashed keys. Here we compare directly for MVP.
        const partner = await db.select().from(partnerApiKeys).where(eq(partnerApiKeys.apiKey, apiKey)).limit(1);
        
        if (partner.length === 0 || !partner[0].isActive) {
            return res.status(403).json({ message: "Invalid or inactive API Key" });
        }

        // Rate Limit Check (Basic) - In prod use Redis
        // Update request count
        await db.update(partnerApiKeys)
           .set({ 
               totalRequests: sql`total_requests + 1`, 
               lastUsedAt: new Date() 
            })
           .where(eq(partnerApiKeys.id, partner[0].id));

        req.partnerId = partner[0].id; // Attach to req
        next();
    } catch (e) {
        res.status(500).json({ message: "API Key Validation Failed" });
    }
};

// POST /api/partner/verify-user
// Lookup a user by email or username to get their Public ID
router.post("/verify-user", validateApiKey, async (req, res) => {
    const { email, username } = req.body;
    
    if (!email && !username) {
        return res.status(400).json({ message: "Provide email or username" });
    }

    try {
        // Find existing user
        let foundUser;
        if (email) {
            const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
            foundUser = result[0];
        } else if (username) {
             const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
             foundUser = result[0];
        }

        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return limited public info
        res.json({
            id: foundUser.id,
            username: foundUser.username,
            isVerified: true, // If they exist in our DB, they have basic account. 
            // Better logic: Check verificationProofs
        });
    } catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET /api/partner/user-status/:id
// Get detailed status (Trust Score, XP, Verification Level)
router.get("/user-status/:id", validateApiKey, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid ID" });

    try {
        const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userRes.length === 0) return res.status(404).json({ message: "User not found" });

        // Get Verification Proofs (e.g. is their hardware verified?)
        const proofs = await db.select().from(verificationProofs).where(eq(verificationProofs.userId, userId));
        const hardwareVerified = proofs.some(p => p.verificationType === 'hardware_id');

        // Mock Trust Score calculation for now (or retrieve from table if implemented)
        // Trust Score starts at 100, drops with violations (antiCheat tables)
        
        res.json({
            userId: userId,
            username: userRes[0].username,
            trustScore: 100, // Placeholder
            isHardwareVerified: hardwareVerified,
            totalXp: 15450, // Placeholder or fetch from dailyMetrics/aggregation
            status: "active"
        });

    } catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
