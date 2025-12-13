import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  users, userGames, riotAccounts, sponsors, insertSponsorSchema, challenges,
  challengeCompletions, insertChallengeSchema, insertChallengeCompletionSchema,
  insertGameSchema, insertUserGameSchema, insertLeaderboardEntrySchema,
  insertAchievementSchema, insertRewardSchema, insertUserRewardSchema, userRewards,
  rewards, subscriptions,
  matchWinWebhookSchema, achievementWebhookSchema, tournamentWebhookSchema,
  insertReferralSchema, processedRiotMatches, referrals, affiliateApplications,
  charities, charityCampaigns, games, leaderboardEntries,
  verificationProofs, fraudDetectionLogs, verificationQueue
} from "@shared/schema";
import { and, eq, sql, inArray, desc, gte } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "./auth";
import { setupTwitchAuth } from "./twitchAuth";
import { z } from "zod";
import { verifyPayPalSubscription, cancelPayPalSubscription, verifyPayPalWebhook } from "./paypal";
import { pointsEngine } from "./pointsEngine";
import { createWebhookSignatureMiddleware } from "./webhookSecurity";
import { twitchAPI } from "./lib/twitch";
import { calculateReferralReward, FREE_TRIAL_DURATION_DAYS } from "./lib/referral";
import crypto from 'crypto';
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import adminRouter from "./routes/admin";
import { verificationService } from "./services/verificationService";
import { fraudDetectionService } from "./services/fraudDetectionService";

// Middleware that accepts BOTH guest sessions AND OAuth sessions
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    let dbUser;

    // Check for guest session first
    if (req.session.guestUserId) {
      dbUser = await storage.getUser(req.session.guestUserId);
    }
    // Check for OAuth session
    else if (req.isAuthenticated() && req.user?.oidcSub) {
      const oidcSub = req.user.oidcSub;
      dbUser = await storage.getUserByOidcSub(oidcSub);
    }

    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Alias for backwards compatibility
const getUserMiddleware = requireAuth;

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

    // SECURITY: Hardened admin check with fail-safes
    const adminEmailsEnv = process.env.ADMIN_EMAILS;

    // FAIL-SAFE #1: If ADMIN_EMAILS is not set, deny all access
    if (!adminEmailsEnv || adminEmailsEnv.trim() === '') {
      console.error('❌ SECURITY: ADMIN_EMAILS not configured - denying admin access');
      return res.status(403).json({
        message: "Forbidden: Admin system not configured"
      });
    }

    const ADMIN_EMAILS = adminEmailsEnv.split(',').map(e => e.trim()).filter(e => e.length > 0);

    // FAIL-SAFE #2: If no valid emails after parsing, deny all access
    if (ADMIN_EMAILS.length === 0) {
      console.error('❌ SECURITY: ADMIN_EMAILS contains no valid emails - denying admin access');
      return res.status(403).json({
        message: "Forbidden: Admin system not configured"
      });
    }

    // FAIL-SAFE #3: User must have a valid email address
    if (!dbUser.email || dbUser.email.trim() === '') {
      console.warn(`⚠️ SECURITY: User ${dbUser.id} attempted admin access with no email`);
      return res.status(403).json({
        message: "Forbidden: Admin access requires verified email"
      });
    }

    // FINAL CHECK: User email must be in admin list
    if (!ADMIN_EMAILS.includes(dbUser.email)) {
      console.warn(`⚠️ SECURITY: User ${dbUser.email} attempted unauthorized admin access`);
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    res.status(500).json({ message: "Failed to authenticate admin" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication FIRST - this is critical for OAuth to work
  console.log('🔐 Initializing authentication...');
  await setupAuth(app);
  await setupTwitchAuth(app);
  console.log('✅ Authentication initialized');
  // TEMPORARY: Direct admin login for testing (REMOVE IN PRODUCTION)
  app.get('/api/test/admin-login', async (req: any, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).send('Not found');
    }

    try {
      // Create or get test admin user directly using db to avoid storage.upsertUser Postgres dependencies
      const existing = await db.select().from(users).where(eq(users.oidcSub, 'test:admin')).limit(1);
      let adminUser = existing[0];

      if (!adminUser) {
        const now = new Date();
        const [newUser] = await db.insert(users).values({
          id: crypto.randomUUID(),
          oidcSub: 'test:admin',
          email: 'admin@ggloop.io',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'Tester',
          profileImageUrl: null,
          totalPoints: 1000,
          isFounder: true,
          createdAt: now,
          updatedAt: now,
        } as any).returning();
        adminUser = newUser;
      }

      // Log the user in via session
      req.login(adminUser, (err: any) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).send('Login failed');
        }
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Session save failed');
          }
          res.redirect('/');
        });
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).send('Failed to create admin session: ' + (error as Error).message);
    }
  });

  app.get('/tiktokPDhff2hq8ipXw4JhJXalxaRHIa5mV037.txt', (req, res) => {
    res.type('text/plain');
    res.send('tiktok-developers-site-verification=PDhff2hq8ipXw4JhJXalxaRHIa5mV037');
  });

  // HMAC signature validation middleware for gaming webhooks
  const webhookAuth = createWebhookSignatureMiddleware(storage);

  // Object Storage Routes
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for guest session first
      if (req.session.guestUserId) {
        const user = await storage.getUser(req.session.guestUserId);
        return res.json(user || null);
      }

      // Check for OAuth session
      if (!req.isAuthenticated() || !req.user?.oidcSub) {
        return res.json(null);
      }
      const oidcSub = req.user.oidcSub;
      const user = await storage.getUserByOidcSub(oidcSub);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check if user is admin
  app.get('/api/auth/is-admin', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.oidcSub) {
        return res.json({ isAdmin: false });
      }

      const oidcSub = req.user.oidcSub;
      const user = await storage.getUserByOidcSub(oidcSub);

      if (!user || !user.email) {
        return res.json({ isAdmin: false });
      }

      const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
      const isAdmin = ADMIN_EMAILS.includes(user.email);

      res.json({ isAdmin });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.json({ isAdmin: false });
    }
  });

  // Admin: Get all users
  app.get('/api/admin/users', adminMiddleware, async (req: any, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: Get dashboard stats
  app.get('/api/admin/dashboard-stats', adminMiddleware, async (req: any, res) => {
    try {
      // Get total users
      const totalUsersResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
      const totalUsers = Number(totalUsersResult[0]?.count || 0);

      // Get founder count
      const founderResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(eq(users.isFounder, true));
      const founderCount = Number(founderResult[0]?.count || 0);

      // Get users active today (logged in today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(gte(users.lastLoginAt, today));
      const activeToday = Number(activeResult[0]?.count || 0);

      // Get total points issued
      const pointsResult = await db.select({ total: sql<number>`COALESCE(SUM(${users.totalPoints}), 0)` }).from(users);
      const totalPoints = Number(pointsResult[0]?.total || 0);

      // Get total rewards claimed
      const rewardsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(userRewards);
      const totalRewards = Number(rewardsResult[0]?.count || 0);

      // Revenue this month (placeholder  - would need subscription tracking)
      const revenueThisMonth = 0;

      res.json({
        totalUsers,
        founderCount,
        activeToday,
        totalPoints,
        totalRewards,
        revenueThisMonth,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin: Revenue metrics
  app.get('/api/admin/revenue-metrics', adminMiddleware, async (req: any, res) => {
    try {
      // Get total users
      const totalUsersResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
      const totalUsers = Number(totalUsersResult[0]?.count || 0);

      // Get active subscriptions
      const activeSubscriptionsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(eq(users.subscriptionStatus, 'active'));
      const activeSubscriptions = Number(activeSubscriptionsResult[0]?.count || 0);

      // Get total rewards redeemed
      const rewardsRedeemedResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userRewards)
        .where(eq(userRewards.status, 'fulfilled'));
      const rewardsRedeemed = Number(rewardsRedeemedResult[0]?.count || 0);

      // Calculate revenue metrics
      const monthlyRevenue = activeSubscriptions * 10; // $10/month average
      const totalRevenue = monthlyRevenue;
      const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;
      const averageOrderValue = 25;
      const projectedMonthly = monthlyRevenue * 1.5;

      res.json({
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        totalUsers,
        rewardsRedeemed,
        conversionRate,
        averageOrderValue,
        projectedMonthly,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      res.status(500).json({ error: 'Failed to fetch revenue metrics' });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      // Test database connection
      await db.select({ count: sql<number>`COUNT(*)` }).from(users);

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: (error as Error).message
      });
    }
  });

  // Sponsor Eligibility Check
  app.get('/api/sponsors/eligibility', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Get verified points from verificationProofs table
      const verifiedProofsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(verificationProofs)
        .where(
          and(
            eq(verificationProofs.userId, userId),
            eq(verificationProofs.status, 'verified')
          )
        );

      // Each verified proof = 100 points (placeholder logic until desktop app)
      const verifiedPoints = Number(verifiedProofsResult[0]?.count || 0) * 100;

      // Check desktop verification status (placeholder - will be real when desktop app exists)
      // For now, check if user has any verified proofs with device metadata
      const desktopVerifiedResult = await db
        .select()
        .from(verificationProofs)
        .where(
          and(
            eq(verificationProofs.userId, userId),
            eq(verificationProofs.status, 'verified')
          )
        )
        .limit(1);

      const desktopVerified = desktopVerifiedResult.length > 0 &&
        desktopVerifiedResult[0].fileMetadata !== null;

      // Get fraud score from fraudDetectionLogs table
      const fraudLogsResult = await db
        .select()
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.userId, userId))
        .orderBy(desc(fraudDetectionLogs.createdAt))
        .limit(1);

      const fraudScore = fraudLogsResult.length > 0
        ? fraudLogsResult[0].riskScore
        : 0;

      // Determine eligibility
      const eligible = verifiedPoints >= 10000 &&
        desktopVerified &&
        fraudScore <= 30;

      res.json({
        eligible,
        verifiedPoints,
        desktopVerified,
        fraudScore
      });
    } catch (error) {
      console.error('Error checking sponsor eligibility:', error);
      res.status(500).json({
        eligible: false,
        verifiedPoints: 0,
        desktopVerified: false,
        fraudScore: 100,
        error: 'Failed to check eligibility'
      });
    }
  });

  // ========================================
  // VERIFICATION ENDPOINTS (Level 5)
  // ========================================

  // Submit verification proof
  app.post('/api/verification/submit-proof', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { sourceType, sourceId, fileUrl, fileType, fileSizeBytes, fileMetadata } = req.body;

      const proof = await verificationService.handleProofUpload(
        userId,
        sourceType,
        sourceId,
        fileUrl,
        fileType,
        fileSizeBytes,
        fileMetadata
      );

      res.json({ success: true, proof });
    } catch (error) {
      console.error('Error submitting proof:', error);
      res.status(500).json({ error: 'Failed to submit proof' });
    }
  });

  // Get verification queue (admin only)
  app.get('/api/verification/queue', adminMiddleware, async (req: any, res) => {
    try {
      const { status, priority, limit = 50 } = req.query;

      const queueItems = await db
        .select()
        .from(verificationQueue)
        .where(
          and(
            status ? eq(verificationQueue.status, status as string) : undefined,
            priority ? eq(verificationQueue.priority, Number(priority)) : undefined
          )
        )
        .orderBy(desc(verificationQueue.priority), desc(verificationQueue.createdAt))
        .limit(Number(limit));

      res.json({ items: queueItems, total: queueItems.length });
    } catch (error) {
      console.error('Error fetching queue:', error);
      res.status(500).json({ error: 'Failed to fetch queue' });
    }
  });

  // Admin review verification item
  app.post('/api/verification/review/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body; // action: 'approve' | 'reject' | 'flag'
      const adminId = req.dbUser.id;

      const result = await verificationService.processAdminReview(
        Number(id),
        adminId,
        action,
        notes
      );

      res.json({ success: true, result });
    } catch (error) {
      console.error('Error processing review:', error);
      res.status(500).json({ error: 'Failed to process review' });
    }
  });

  // Get verification stats (admin dashboard)
  app.get('/api/verification/stats', adminMiddleware, async (req: any, res) => {
    try {
      const [pendingCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(verificationQueue)
        .where(eq(verificationQueue.status, 'pending'));

      const [approvedCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(verificationProofs)
        .where(eq(verificationProofs.status, 'verified'));

      const [rejectedCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(verificationProofs)
        .where(eq(verificationProofs.status, 'rejected'));

      const [flaggedCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(verificationProofs)
        .where(eq(verificationProofs.status, 'flagged'));

      const [highRiskCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(fraudDetectionLogs)
        .where(
          and(
            gte(fraudDetectionLogs.riskScore, 70),
            eq(fraudDetectionLogs.status, 'pending')
          )
        );

      res.json({
        pending: Number(pendingCount?.count || 0),
        approved: Number(approvedCount?.count || 0),
        rejected: Number(rejectedCount?.count || 0),
        flagged: Number(flaggedCount?.count || 0),
        highRiskAlerts: Number(highRiskCount?.count || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Bulk action on verification items (admin only)
  app.post('/api/verification/bulk-action', adminMiddleware, async (req: any, res) => {
    try {
      const { itemIds, action } = req.body; // action: 'approve' | 'reject'
      const adminId = req.dbUser.id;

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ error: 'itemIds must be a non-empty array' });
      }

      const results = [];
      for (const itemId of itemIds) {
        try {
          const result = await verificationService.processAdminReview(
            itemId,
            adminId,
            action,
            `Bulk ${action}`
          );
          results.push({ itemId, success: true, result });
        } catch (error) {
          results.push({ itemId, success: false, error: (error as Error).message });
        }
      }

      res.json({ results, total: results.length });
    } catch (error) {
      console.error('Error processing bulk action:', error);
      res.status(500).json({ error: 'Failed to process bulk action' });
    }
  });

  // Get fraud alerts (admin only)
  app.get('/api/verification/fraud-alerts', adminMiddleware, async (req: any, res) => {
    try {
      const { severity, limit = 50 } = req.query;

      const alerts = await fraudDetectionService.getActiveFraudAlerts(
        severity as 'low' | 'medium' | 'high' | 'critical' | undefined,
        Number(limit)
      );

      res.json({ alerts, total: alerts.length });
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      res.status(500).json({ error: 'Failed to fetch fraud alerts' });
    }
  });

  // ========================================
  // DESKTOP VERIFICATION ENDPOINTS (Level 6)
  // ========================================

  // Start desktop verification session
  app.post('/api/desktop/session/start', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { deviceHash, timestamp } = req.body;

      const sessionId = `session_${userId}_${Date.now()}`;

      // Create session record (placeholder - would use desktopSessions table in production)
      console.log(`[Desktop] Session started: ${sessionId} for user ${userId}`);

      res.json({
        success: true,
        sessionId,
        userId,
        startedAt: timestamp || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting desktop session:', error);
      res.status(500).json({ error: 'Failed to start session' });
    }
  });

  // End desktop verification session
  app.post('/api/desktop/session/end', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { sessionId, duration, windowCount, gameProcessCount, timestamp } = req.body;

      console.log(`[Desktop] Session ended: ${sessionId} (${duration}s, ${gameProcessCount} game processes)`);

      // Update session record with end data
      res.json({
        success: true,
        sessionId,
        duration,
        gameProcessCount,
        endedAt: timestamp || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error ending desktop session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  });

  // Submit desktop verification payload
  app.post('/api/desktop/verification/payload', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { sessionId, matchId, matchDuration, processName, validationScore, timestamp } = req.body;

      // Create verification proof with desktop session data
      const [proof] = await db
        .insert(verificationProofs)
        .values({
          userId,
          sourceType: 'desktop_session',
          sourceId: sessionId,
          status: 'pending',
          fileMetadata: {
            sessionId,
            matchId,
            matchDuration,
            processName,
            validationScore,
            timestamp
          },
          // Level 6 fields (will be added to schema)
          sessionId: sessionId,
          deviceHash: req.body.deviceHash || null,
          desktopVerified: true,
          playDuration: matchDuration || 0
        })
        .returning();

      console.log(`[Desktop] Verification payload submitted: ${sessionId}`);

      res.json({
        success: true,
        proofId: proof.id,
        sessionId,
        validationScore
      });
    } catch (error) {
      console.error('Error submitting verification payload:', error);
      res.status(500).json({ error: 'Failed to submit payload' });
    }
  });

  // Heartbeat endpoint
  app.post('/api/desktop/heartbeat', requireAuth, async (req: any, res) => {
    try {
      const { sessionId, timestamp, status } = req.body;

      // Log heartbeat (in production, would update session last_seen timestamp)
      console.log(`[Desktop] Heartbeat received: ${sessionId} at ${timestamp}`);

      res.json({
        success: true,
        serverTime: new Date().toISOString(),
        status: 'acknowledged'
      });
    } catch (error) {
      console.error('Error processing heartbeat:', error);
      res.status(500).json({ error: 'Failed to process heartbeat' });
    }
  });

  // Get desktop app version
  app.get('/api/desktop/version', async (req, res) => {
    res.json({
      version: '1.0.0',
      minVersion: '1.0.0',
      updateRequired: false,
      downloadUrl: 'https://ggloop.io/downloads/verifier'
    });
  });

  // ========================================
  // REWARD SYSTEM ENDPOINTS (Level 7)
  // ========================================

  // Get rewards catalog
  app.get('/api/rewards', async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const catalogPath = path.join(__dirname, '../data/rewards.json');

      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

      // Filter to only active rewards
      const activeRewards = catalog.rewards.filter((r: any) => r.active && r.stock > 0);

      res.json({
        rewards: activeRewards,
        categories: catalog.categories,
        metadata: catalog.metadata
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  });

  // Claim reward
  app.post('/api/rewards/claim', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { rewardId } = req.body;

      // Load reward catalog
      const fs = require('fs');
      const path = require('path');
      const catalogPath = path.join(__dirname, '../data/rewards.json');
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

      const reward = catalog.rewards.find((r: any) => r.id === rewardId);
      if (!reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }

      // Check stock
      if (reward.stock <= 0) {
        return res.status(400).json({ error: 'Reward out of stock' });
      }

      // Check user points balance
      const userBalance = await pointsEngine.getUserBalance(userId);
      if (userBalance < reward.costInPoints) {
        return res.status(400).json({
          error: 'Insufficient points',
          required: reward.costInPoints,
          current: userBalance
        });
      }

      // Check desktop verification
      const hasDesktopSession = await db
        .select()
        .from(verificationProofs)
        .where(
          and(
            eq(verificationProofs.userId, userId),
            eq(verificationProofs.desktopVerified, true)
          )
        )
        .limit(1);

      if (hasDesktopSession.length === 0) {
        return res.status(403).json({ error: 'Desktop verification required' });
      }

      // Check fraud score
      const fraudCheck = await db
        .select()
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.userId, userId))
        .orderBy(desc(fraudDetectionLogs.createdAt))
        .limit(1);

      const fraudScore = fraudCheck.length > 0 ? fraudCheck[0].riskScore : 0;
      if (fraudScore > 30) {
        return res.status(403).json({
          error: 'Fraud score too high',
          score: fraudScore,
          maxAllowed: 30
        });
      }

      // Create claim record (using userRewards table)
      const [claim] = await db
        .insert(userRewards)
        .values({
          userId,
          rewardId: reward.id,
          status: 'pending',
          pointsCost: reward.costInPoints,
          claimedAt: new Date()
        })
        .returning();

      // Deduct points
      await pointsEngine.spendPoints(
        userId,
        reward.costInPoints,
        'reward_claim',
        claim.id.toString(),
        'reward',
        `Claimed: ${reward.name}`
      );

      console.log(`[Rewards] Claim created: ${claim.id} for user ${userId}`);

      res.json({
        success: true,
        claimId: claim.id,
        reward: {
          id: reward.id,
          name: reward.name,
          cost: reward.costInPoints
        },
        status: 'pending'
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  });

  // Get claim status
  app.get('/api/rewards/claim/status/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const claimId = parseInt(req.params.id);

      const [claim] = await db
        .select()
        .from(userRewards)
        .where(
          and(
            eq(userRewards.id, claimId),
            eq(userRewards.userId, userId)
          )
        );

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      res.json({
        claimId: claim.id,
        rewardId: claim.rewardId,
        status: claim.status,
        claimedAt: claim.claimedAt,
        fulfilledAt: claim.fulfilledAt
      });
    } catch (error) {
      console.error('Error fetching claim status:', error);
      res.status(500).json({ error: 'Failed to fetch claim status' });
    }
  });

  // ========================================
  // ADMIN REWARD ENDPOINTS (Level 7)
  // ========================================

  // Get rewards catalog + pending claims (admin only)
  app.get('/api/admin/rewards', adminMiddleware, async (req: any, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const catalogPath = path.join(__dirname, '../data/rewards.json');
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

      // Get all pending claims
      const claims = await db
        .select()
        .from(userRewards)
        .where(eq(userRewards.status, 'pending'))
        .orderBy(desc(userRewards.claimedAt));

      res.json({
        rewards: catalog.rewards,
        claims,
        categories: catalog.categories
      });
    } catch (error) {
      console.error('Error fetching admin rewards:', error);
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  });

  // Approve reward claim (admin only)
  app.post('/api/admin/rewards/approve/:claimId', adminMiddleware, async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const adminId = req.dbUser.id;

      const [claim] = await db
        .select()
        .from(userRewards)
        .where(eq(userRewards.id, claimId));

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      if (claim.status !== 'pending') {
        return res.status(400).json({ error: 'Claim already processed' });
      }

      // Update claim status
      await db
        .update(userRewards)
        .set({
          status: 'fulfilled',
          fulfilledAt: new Date()
        })
        .where(eq(userRewards.id, claimId));

      // Update reward stock (in production, would update database)
      console.log(`[Admin] Claim ${claimId} approved by admin ${adminId}`);

      res.json({
        success: true,
        claimId,
        status: 'fulfilled',
        approvedBy: adminId
      });
    } catch (error) {
      console.error('Error approving claim:', error);
      res.status(500).json({ error: 'Failed to approve claim' });
    }
  });

  // Reject reward claim (admin only)
  app.post('/api/admin/rewards/reject/:claimId', adminMiddleware, async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const adminId = req.dbUser.id;

      const [claim] = await db
        .select()
        .from(userRewards)
        .where(eq(userRewards.id, claimId));

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      if (claim.status !== 'pending') {
        return res.status(400).json({ error: 'Claim already processed' });
      }

      // Refund points to user
      await pointsEngine.awardPoints(
        claim.userId,
        claim.pointsCost || 0,
        'REWARD_REFUND',
        claimId.toString(),
        'reward_claim',
        `Refund for rejected claim #${claimId}`
      );

      // Update claim status
      await db
        .update(userRewards)
        .set({
          status: 'rejected',
          fulfilledAt: new Date()
        })
        .where(eq(userRewards.id, claimId));

      console.log(`[Admin] Claim ${claimId} rejected by admin ${adminId}, points refunded`);

      res.json({
        success: true,
        claimId,
        status: 'rejected',
        rejectedBy: adminId,
        pointsRefunded: claim.pointsCost
      });
    } catch (error) {
      console.error('Error rejecting claim:', error);
      res.status(500).json({ error: 'Failed to reject claim' });
    }
  });

  // ========================================
  // BRAND MARKETPLACE ENDPOINTS (Level 8)
  // ========================================

  // Get all approved brands (filtered by user tier)
  app.get('/api/brands', async (req: any, res) => {
    try {
      const userId = req.dbUser?.id;
      let userPoints = 0;
      let desktopVerified = false;
      let fraudScore = 100;

      if (userId) {
        // Get user eligibility
        userPoints = await pointsEngine.getUserBalance(userId);

        const desktopCheck = await db
          .select()
          .from(verificationProofs)
          .where(
            and(
              eq(verificationProofs.userId, userId),
              eq(verificationProofs.desktopVerified, true)
            )
          )
          .limit(1);

        desktopVerified = desktopCheck.length > 0;

        const fraudCheck = await db
          .select()
          .from(fraudDetectionLogs)
          .where(eq(fraudDetectionLogs.userId, userId))
          .orderBy(desc(fraudDetectionLogs.createdAt))
          .limit(1);

        fraudScore = fraudCheck.length > 0 ? fraudCheck[0].riskScore : 0;
      }

      // Mock brands data (in production, would come from database)
      const allBrands = [
        {
          id: "brand_001",
          name: "Razer",
          logo: "https://assets.ggloop.io/brands/razer.png",
          description: "Premium gaming peripherals and accessories",
          tier: "basic",
          requiredPoints: 10000,
          benefits: ["10% off all products", "Early access to new releases", "Exclusive colorways"],
          active: true,
          approved: true
        },
        {
          id: "brand_002",
          name: "Logitech G",
          logo: "https://assets.ggloop.io/brands/logitech.png",
          description: "Professional gaming gear for competitive players",
          tier: "pro",
          requiredPoints: 25000,
          benefits: ["15% off all products", "Free shipping", "Priority customer support", "Beta testing opportunities"],
          active: true,
          approved: true
        },
        {
          id: "brand_003",
          name: "HyperX",
          logo: "https://assets.ggloop.io/brands/hyperx.png",
          description: "High-performance gaming headsets and keyboards",
          tier: "elite",
          requiredPoints: 50000,
          benefits: ["20% off all products", "Free premium shipping", "Dedicated account manager", "Exclusive product bundles", "Early beta access"],
          active: true,
          approved: true
        }
      ];

      // Filter to approved brands only
      const approvedBrands = allBrands.filter(b => b.approved && b.active);

      res.json({
        brands: approvedBrands,
        userPoints,
        eligibility: {
          desktopVerified,
          fraudScore
        }
      });
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  });

  // Brand signup
  app.post('/api/brands/signup', async (req, res) => {
    try {
      const { brandName, website, logo, description, basicOffer, proOffer, eliteOffer } = req.body;

      // Create brand signup record (in production, would insert into brands table)
      const brandSignup = {
        id: `brand_${Date.now()}`,
        name: brandName,
        website,
        logo,
        description,
        offers: {
          basic: basicOffer,
          pro: proOffer,
          elite: eliteOffer
        },
        status: 'pending',
        createdAt: new Date()
      };

      console.log('[Brands] New signup:', brandSignup.id, brandName);

      res.json({
        success: true,
        brandId: brandSignup.id,
        status: 'pending',
        message: 'Brand signup submitted for review'
      });
    } catch (error) {
      console.error('Error creating brand signup:', error);
      res.status(500).json({ error: 'Failed to submit brand signup' });
    }
  });

  // Get brand details
  app.get('/api/brands/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Mock brand data (in production, would query database)
      const brands: any = {
        brand_001: {
          id: "brand_001",
          name: "Razer",
          logo: "https://assets.ggloop.io/brands/razer.png",
          description: "Premium gaming peripherals and accessories",
          website: "https://razer.com",
          tier: "basic",
          requiredPoints: 10000,
          benefits: ["10% off all products", "Early access to new releases", "Exclusive colorways"],
          offers: {
            basic: "Get 10% off all Razer products with your GG LOOP partnership"
          }
        }
      };

      const brand = brands[id];
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      res.json(brand);
    } catch (error) {
      console.error('Error fetching brand:', error);
      res.status(500).json({ error: 'Failed to fetch brand' });
    }
  });

  // Unlock brand tier
  app.post('/api/brands/unlock', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { brandId, tier } = req.body;

      // Validate user eligibility
      const userPoints = await pointsEngine.getUserBalance(userId);

      const desktopCheck = await db
        .select()
        .from(verificationProofs)
        .where(
          and(
            eq(verificationProofs.userId, userId),
            eq(verificationProofs.desktopVerified, true)
          )
        )
        .limit(1);

      if (desktopCheck.length === 0) {
        return res.status(403).json({ error: 'Desktop verification required' });
      }

      const fraudCheck = await db
        .select()
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.userId, userId))
        .orderBy(desc(fraudDetectionLogs.createdAt))
        .limit(1);

      const fraudScore = fraudCheck.length > 0 ? fraudCheck[0].riskScore : 0;
      if (fraudScore > 30) {
        return res.status(403).json({ error: 'Fraud score too high', score: fraudScore });
      }

      // Check tier requirements
      const tierRequirements: Record<string, number> = {
        basic: 10000,
        pro: 25000,
        elite: 50000
      };

      const requiredPoints = tierRequirements[tier];
      if (userPoints < requiredPoints) {
        return res.status(403).json({
          error: 'Insufficient points for tier',
          required: requiredPoints,
          current: userPoints
        });
      }

      // Create unlock record (in production, would insert into brandUnlocks table)
      console.log(`[Brands] User ${userId} unlocked ${tier} tier for brand ${brandId}`);

      res.json({
        success: true,
        brandId,
        tier,
        unlockedAt: new Date()
      });
    } catch (error) {
      console.error('Error unlocking brand:', error);
      res.status(500).json({ error: 'Failed to unlock brand' });
    }
  });

  // ========================================
  // ADMIN BRAND ENDPOINTS (Level 8)
  // ========================================

  // Get pending brand signups (admin only)
  app.get('/api/admin/brands/pending', adminMiddleware, async (req: any, res) => {
    try {
      // Mock pending brands (in production, would query database)
      const pendingBrands = [
        {
          id: "brand_pending_001",
          name: "SteelSeries",
          website: "https://steelseries.com",
          description: "Gaming peripherals and accessories",
          status: 'pending',
          createdAt: new Date()
        }
      ];

      res.json({ brands: pendingBrands, total: pendingBrands.length });
    } catch (error) {
      console.error('Error fetching pending brands:', error);
      res.status(500).json({ error: 'Failed to fetch pending brands' });
    }
  });

  // Approve brand (admin only)
  app.post('/api/admin/brands/approve/:id', adminMiddleware, async (req: any, res) => {
    try {
      const brandId = req.params.id;
      const adminId = req.dbUser.id;

      // Update brand status (in production, would update database)
      console.log(`[Admin] Brand ${brandId} approved by admin ${adminId}`);

      res.json({
        success: true,
        brandId,
        status: 'approved',
        approvedBy: adminId
      });
    } catch (error) {
      console.error('Error approving brand:', error);
      res.status(500).json({ error: 'Failed to approve brand' });
    }
  });

  // Reject brand (admin only)
  app.post('/api/admin/brands/reject/:id', adminMiddleware, async (req: any, res) => {
    try {
      const brandId = req.params.id;
      const adminId = req.dbUser.id;
      const { reason } = req.body;

      // Update brand status (in production, would update database)
      console.log(`[Admin] Brand ${brandId} rejected by admin ${adminId}: ${reason}`);

      res.json({
        success: true,
        brandId,
        status: 'rejected',
        rejectedBy: adminId,
        reason
      });
    } catch (error) {
      console.error('Error rejecting brand:', error);
      res.status(500).json({ error: 'Failed to reject brand' });
    }
  });

  // ========================================
  // PASSPORT ENDPOINTS (Level 9)
  // ========================================

  // Get user passport stats
  app.get('/api/passport/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Get user points
      const points = await pointsEngine.getUserBalance(userId);

      // Determine rank based on points
      let rank = "Rookie";
      if (points >= 50000) rank = "Elite";
      else if (points >= 25000) rank = "Champion";
      else if (points >= 10000) rank = "Veteran";

      // Check desktop verification
      const desktopCheck = await db
        .select()
        .from(verificationProofs)
        .where(
          and(
            eq(verificationProofs.userId, userId),
            eq(verificationProofs.desktopVerified, true)
          )
        )
        .limit(1);

      const desktopVerified = desktopCheck.length > 0;

      // Get fraud score
      const fraudCheck = await db
        .select()
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.userId, userId))
        .orderBy(desc(fraudDetectionLogs.createdAt))
        .limit(1);

      const fraudScore = fraudCheck.length > 0 ? fraudCheck[0].riskScore : 0;

      // Get rewards claimed count
      const rewardsClaimedResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userRewards)
        .where(
          and(
            eq(userRewards.userId, userId),
            eq(userRewards.status, 'fulfilled')
          )
        );

      const rewardsClaimed = Number(rewardsClaimedResult[0]?.count || 0);

      // Calculate sponsor unlocks (based on tier thresholds)
      let sponsorUnlocks = 0;
      if (points >= 10000) sponsorUnlocks++;
      if (points >= 25000) sponsorUnlocks++;
      if (points >= 50000) sponsorUnlocks++;

      res.json({
        points,
        rank,
        fraudScore,
        desktopVerified,
        rewardsClaimed,
        sponsorUnlocks
      });
    } catch (error) {
      console.error('Error fetching passport stats:', error);
      res.status(500).json({ error: 'Failed to fetch passport stats' });
    }
  });

  // Get verification history
  app.get('/api/passport/history', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Get verification proofs
      const proofs = await db
        .select()
        .from(verificationProofs)
        .where(eq(verificationProofs.userId, userId))
        .orderBy(desc(verificationProofs.createdAt))
        .limit(20);

      const submissions = proofs.map(proof => ({
        id: proof.id,
        type: proof.sourceType,
        status: proof.status,
        timestamp: proof.createdAt,
        verdict: proof.status === 'verified' ? 'Approved' :
          proof.status === 'rejected' ? 'Rejected' :
            proof.status === 'flagged' ? 'Flagged for review' :
              'Pending review'
      }));

      res.json({ submissions });
    } catch (error) {
      console.error('Error fetching passport history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Submit verification feedback/dispute
  app.post('/api/passport/feedback', requireAuth, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { proofId, message, disputeReason } = req.body;

      // Log feedback (in production, would insert into feedback table)
      console.log(`[Passport] User ${userId} submitted feedback for proof ${proofId}: ${message}`);

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        ticketId: `ticket_${Date.now()}`
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Public platform stats for AWS demo (no auth required, real data only)
  app.get('/api/public/platform-stats', async (req, res) => {
    try {
      // Get REAL counts from database - no fake numbers
      const totalUsersResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
      const totalUsers = Number(totalUsersResult[0]?.count || 0);

      const activeSubscriptionsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active'));
      const activeSubscriptions = Number(activeSubscriptionsResult[0]?.count || 0);

      const totalRewardsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(rewards);
      const totalRewards = Number(totalRewardsResult[0]?.count || 0);

      const rewardsRedeemedResult = await db.select({ count: sql<number>`COUNT(*)` }).from(userRewards);
      const rewardsRedeemed = Number(rewardsRedeemedResult[0]?.count || 0);

      const totalReferralsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(referrals);
      const totalReferrals = Number(totalReferralsResult[0]?.count || 0);

      const gamesResult = await db.select({ count: sql<number>`COUNT(*)` }).from(games);
      const totalGames = Number(gamesResult[0]?.count || 0);

      res.json({
        // Platform health
        platformStatus: 'operational',
        databaseStatus: 'connected',
        uptimeSeconds: Math.floor(process.uptime()),
        lastUpdated: new Date().toISOString(),

        // REAL metrics from database
        actualMetrics: {
          totalUsers,
          activeSubscriptions,
          totalRewards,
          rewardsRedeemed,
          totalReferrals,
          totalGames,
        },

        // Platform capabilities (static, true facts)
        capabilities: {
          authProviders: ['Google', 'Discord', 'Twitch'],
          paymentProvider: 'PayPal',
          gamesSupported: ['League of Legends'],
          featuresReady: [
            'User Authentication (OAuth)',
            'Subscription Payments',
            'Rewards Catalog',
            'Referral System',
            'Admin Dashboard',
            'Fulfillment Tracking'
          ]
        },

        // Clearly labeled as current stage
        stage: totalUsers > 100 ? 'growth' : totalUsers > 10 ? 'early_adopters' : 'pilot'
      });
    } catch (error) {
      console.error('Error fetching public platform stats:', error);
      res.status(500).json({
        platformStatus: 'error',
        error: 'Failed to fetch platform stats'
      });
    }
  });

  // Guest account creation
  app.post('/api/auth/guest', async (req: any, res) => {
    try {
      const { email, primaryGame, selectedGames = [], riotId, tagLine, region } = req.body;

      // Only email and primaryGame are required
      if (!email || !primaryGame) {
        return res.status(400).json({ message: "Email and primary game are required" });
      }

      // Generate UUID-based username for guest
      const guestId = crypto.randomUUID();
      const guestUsername = `guest_${guestId.split('-')[0]}`;

      // Create guest user with null oidcSub and primaryGame
      const user = await storage.createUser({
        oidcSub: null,
        email,
        username: guestUsername,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        primaryGame, // Store user's favorite game
      });

      // Create userGames records for selected games (non-verified initially)
      if (selectedGames.length > 0) {
        for (const gameId of selectedGames) {
          try {
            await storage.connectUserGame({
              userId: user.id,
              gameId,
              accountName: null,
            });
          } catch (error) {
            console.warn(`Failed to create userGame record for game ${gameId}:`, error);
          }
        }
      }

      // If Riot account details provided, verify and add Riot metadata
      if (riotId && tagLine && region && selectedGames.length > 0) {
        const { RiotApiService } = await import('./riotApi');
        const riotApi = new RiotApiService();

        try {
          const account = await riotApi.verifyAccount(riotId, tagLine, region);

          // Link Riot account to each selected game's userGame record
          for (const gameId of selectedGames) {
            try {
              await storage.linkRiotAccount(user.id, gameId, {
                puuid: account.puuid,
                gameName: account.gameName,
                tagLine: account.tagLine,
                region,
              });
            } catch (error) {
              console.warn(`Failed to link Riot account for game ${gameId}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Riot account verification failed for ${riotId}#${tagLine}, but user created successfully with unverified game selections`);
        }
      }

      // Store guest session
      req.session.guestUserId = user.id;
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Failed to create session' });
        }

        res.json({
          success: true,
          userId: user.id,
          message: 'Account created successfully'
        });
      });
    } catch (error) {
      console.error("Error creating guest account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Get and clear login notification
  app.get('/api/auth/login-notification', async (req: any, res) => {
    try {
      const notification = req.session.loginNotification;

      if (notification) {
        // Clear notification after retrieving (one-time display)
        delete req.session.loginNotification;
      }

      res.json(notification || null);
    } catch (error) {
      console.error("Error fetching login notification:", error);
      res.status(500).json({ message: "Failed to fetch notification" });
    }
  });

  // Twitch OAuth - Initiate authorization
  app.get('/api/twitch/auth', isAuthenticated, (req: any, res) => {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      req.session.twitchState = state;

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const redirectUri = `${baseUrl}/api/auth/twitch/callback`;
      const authUrl = twitchAPI.getAuthorizationUrl(redirectUri, state);

      res.json({ authUrl });
    } catch (error) {
      console.error('Error initiating Twitch auth:', error);
      res.status(500).json({ message: 'Failed to initiate Twitch authorization' });
    }
  });

  // Twitch OAuth - Handle callback
  app.get('/api/twitch/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code, state } = req.query;

      if (!code || !state || state !== req.session.twitchState) {
        return res.redirect('/?error=invalid_twitch_auth');
      }

      delete req.session.twitchState;

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const redirectUri = `${baseUrl}/api/auth/twitch/callback`;
      const tokens = await twitchAPI.exchangeCodeForTokens(code as string, redirectUri);
      const twitchUser = await twitchAPI.getUserInfo(twitchAPI.encryptToken(tokens.access_token));

      const oidcSub = req.user.oidcSub;
      await storage.connectTwitchAccount(oidcSub, {
        twitchId: twitchUser.id,
        twitchUsername: twitchUser.login,
        accessToken: twitchAPI.encryptToken(tokens.access_token),
        refreshToken: twitchAPI.encryptToken(tokens.refresh_token),
      });

      res.redirect('/settings?twitch=connected');
    } catch (error) {
      console.error('Error handling Twitch callback:', error);
      res.redirect('/?error=twitch_connection_failed');
    }
  });

  // Twitch - Disconnect account
  app.post('/api/twitch/disconnect', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const user = req.dbUser;
      await storage.disconnectTwitchAccount(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error disconnecting Twitch:', error);
      res.status(500).json({ message: 'Failed to disconnect Twitch account' });
    }
  });

  // Riot Account - Step 1: Request Verification Code
  app.post('/api/riot/:gameId/request-code', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const { gameId } = req.params;
      const { riotId, region = 'na' } = req.body;

      if (!riotId || !riotId.includes('#')) {
        return res.status(400).json({
          message: 'Invalid Riot ID format. Use: GameName#TAG (e.g., Faker#NA1)'
        });
      }

      if (!region) {
        return res.status(400).json({
          message: 'Region is required. Please select your region.'
        });
      }

      const [gameName, tagLine] = riotId.split('#');

      // Verify account exists via Riot API
      const { RiotApiService } = await import('./riotApi');
      const riotApi = new RiotApiService();

      const account = await riotApi.verifyAccount(gameName.trim(), tagLine.trim(), region);

      // Generate 8-character alphanumeric code
      const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

      // Store pending verification (expires in 10 minutes)
      // Store platform region (na, euw, kr) NOT routing cluster (americas, europe)
      req.session.riotVerification = {
        userId: req.dbUser.id,
        gameId,
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        region, // This is the platform region (na, euw, kr, etc.)
        code: verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000
      };

      res.json({
        success: true,
        verificationCode,
        riotId: `${account.gameName}#${account.tagLine}`,
        instructions: gameId.includes('league')
          ? 'Enter this code in League client: Settings → Verification'
          : 'Add this code to your Valorant profile (Account → Profile → About Me)'
      });
    } catch (error: any) {
      console.error('Error requesting Riot verification:', error);
      const status = (error?.code === 404) ? 404 : (error?.code === 429) ? 429 : 500;
      res.status(status).json({
        message: error.message || 'Failed to verify Riot account. Please check your Riot ID and try again.'
      });
    }
  });

  // Health: Riot connectivity
  app.get('/api/health/riot', async (_req, res) => {
    try {
      const hasKey = !!process.env.RIOT_API_KEY;
      if (!hasKey) {
        return res.status(500).json({ ok: false, message: 'RIOT_API_KEY missing' });
      }
      return res.json({ ok: true, message: 'Key present' });
    } catch (err) {
      console.error('Riot health error:', err);
      res.status(500).json({ ok: false });
    }
  });

  // Riot Account - Step 2: Verify Code and Link
  app.post('/api/riot/:gameId/verify', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const { gameId } = req.params;

      // Check if there's a pending verification
      const pending = req.session.riotVerification;
      if (!pending || pending.gameId !== gameId || pending.userId !== req.dbUser.id) {
        return res.status(400).json({
          message: 'No pending verification found. Please request a new verification code.'
        });
      }

      // Check if expired
      if (Date.now() > pending.expiresAt) {
        delete req.session.riotVerification;
        return res.status(400).json({
          message: 'Verification code expired. Please request a new code.'
        });
      }

      // Verify the code via Riot API third-party endpoint
      const { RiotApiService } = await import('./riotApi');
      const riotApi = new RiotApiService();

      const verified = await riotApi.verifyThirdPartyCode(pending.puuid, pending.code, pending.region);

      if (!verified) {
        return res.status(400).json({
          message: 'Verification code not found. Make sure you entered it in your Riot client.'
        });
      }

      // Link the account (code verified!)
      await storage.linkRiotAccount(req.dbUser.id, gameId, {
        puuid: pending.puuid,
        gameName: pending.gameName,
        tagLine: pending.tagLine,
        region: pending.region
      });

      // Clear pending verification
      delete req.session.riotVerification;

      res.json({
        success: true,
        account: {
          gameName: pending.gameName,
          tagLine: pending.tagLine,
          region: pending.region
        }
      });
    } catch (error: any) {
      console.error('Error verifying Riot account:', error);
      res.status(500).json({
        message: error.message || 'Failed to verify account. Please try again.'
      });
    }
  });

  // Riot Account - Provisional Link (Valorant only - no verification)
  app.post('/api/riot/:gameId/link-provisional', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const { gameId } = req.params;
      const { riotId, region = 'na' } = req.body;

      // Validate that this is actually Valorant by querying the game
      const game = await storage.getGame(gameId);

      if (!game) {
        return res.status(404).json({
          message: 'Game not found'
        });
      }

      // Only allow provisional linking for Valorant
      if (!game.title.toLowerCase().includes('valorant')) {
        return res.status(400).json({
          message: 'Provisional linking is only available for Valorant'
        });
      }

      if (!riotId || !riotId.includes('#')) {
        return res.status(400).json({
          message: 'Invalid Riot ID format. Use: GameName#TAG (e.g., TenZ#NA1)'
        });
      }

      const [gameName, tagLine] = riotId.split('#');

      // Verify account exists via Riot API
      const { RiotApiService } = await import('./riotApi');
      const riotApi = new RiotApiService();

      const account = await riotApi.verifyAccount(gameName.trim(), tagLine.trim(), region);

      // Link with provisional status (verifiedAt = null)
      const existing = await db.select().from(userGames)
        .where(and(eq(userGames.userId, req.dbUser.id), eq(userGames.gameId, gameId)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(userGames)
          .set({
            riotPuuid: account.puuid,
            riotGameName: account.gameName,
            riotTagLine: account.tagLine,
            riotRegion: region,
            verifiedAt: null, // Provisional - not verified
          })
          .where(eq(userGames.id, existing[0].id));
      } else {
        await db.insert(userGames).values({
          userId: req.dbUser.id,
          gameId,
          riotPuuid: account.puuid,
          riotGameName: account.gameName,
          riotTagLine: account.tagLine,
          riotRegion: region,
          verifiedAt: null, // Provisional - not verified
        });

        await db.update(users)
          .set({ gamesConnected: sql`${users.gamesConnected} + 1` })
          .where(eq(users.id, req.dbUser.id));
      }

      res.json({
        success: true,
        provisional: true,
        riotId: `${account.gameName}#${account.tagLine}`,
        message: 'Account linked provisionally. Stats are self-reported.'
      });
    } catch (error: any) {
      console.error('Error linking Valorant provisionally:', error);
      res.status(500).json({
        message: error.message || 'Failed to link account. Please check your Riot ID and try again.'
      });
    }
  });

  // Riot Account - Disconnect
  app.post('/api/riot/:gameId/disconnect', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const { gameId } = req.params;
      const userId = req.dbUser.id;

      // Remove Riot account link by deleting the userGame record
      const account = await storage.getRiotAccount(userId, gameId);
      if (account) {
        await db.delete(userGames)
          .where(and(
            eq(userGames.userId, userId),
            eq(userGames.gameId, gameId)
          ));
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error disconnecting Riot account:', error);
      res.status(500).json({ message: 'Failed to disconnect Riot account' });
    }
  });

  // Riot Account - Get Status
  app.get('/api/riot/:gameId/status', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const { gameId } = req.params;
      const account = await storage.getRiotAccount(req.dbUser.id, gameId);

      if (account && account.riotPuuid) {
        res.json({
          linked: true,
          gameName: account.riotGameName,
          tagLine: account.riotTagLine,
          region: account.riotRegion,
          verifiedAt: account.verifiedAt
        });
      } else {
        res.json({ linked: false });
      }
    } catch (error) {
      console.error('Error fetching Riot account status:', error);
      res.status(500).json({ message: 'Failed to fetch account status' });
    }
  });

  // Public Profile - No auth required (supports both UUID and username)
  app.get('/api/profile/:userIdOrUsername', async (req, res) => {
    try {
      const { userIdOrUsername } = req.params;

      // Try to find user by UUID first, then by username
      let user = await storage.getUser(userIdOrUsername);
      if (!user) {
        user = await storage.getUserByUsername(userIdOrUsername);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;

      // Get achievements with game names
      const achievements = await storage.getUserAchievements(userId, 10);

      // Get leaderboard rankings
      const userGames = await storage.getUserGames(userId);
      const leaderboardRankings = [];
      for (const userGame of userGames) {
        // Get weekly leaderboard for this game
        const leaderboard = await storage.getLeaderboard(userGame.gameId, 'weekly', 100);
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        if (userEntry) {
          leaderboardRankings.push({
            gameId: userGame.gameId,
            gameName: userGame.game.title,
            rank: userEntry.rank,
            score: userEntry.score,
            period: 'weekly'
          });
        }
      }

      // Calculate stats
      const allAchievements = await storage.getUserAchievements(userId, 1000);
      const avgRank = leaderboardRankings.length > 0
        ? Math.round(leaderboardRankings.reduce((sum, r) => sum + r.rank, 0) / leaderboardRankings.length)
        : 0;

      const joinedDaysAgo = user.createdAt
        ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Get claimed badges (only completed automatic badges that show on profile)

      // TODO: Implement badge retrieval and complete profile response
      res.json({
        user: {
          id: user.id,
          username: user.username,
          totalPoints: user.totalPoints,
          profileImageUrl: user.profileImageUrl
        },
        achievements: achievements.slice(0, 10),
        leaderboardRankings,
        stats: {
          avgRank,
          joinedDaysAgo,
          totalAchievements: allAchievements.length
        }
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });


  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.get('/api/user/games', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const userGames = await storage.getUserGames(userId);
      res.json(userGames);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.status(500).json({ message: "Failed to fetch user games" });
    }
  });

  app.get('/api/user/expiring-points', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const expiringData = await pointsEngine.getExpiringPoints(userId, 30);
      res.json(expiringData);
    } catch (error) {
      console.error("Error fetching expiring points:", error);
      res.status(500).json({ message: "Failed to fetch expiring points" });
    }
  });

  app.post('/api/user/username', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { username } = z.object({
        username: z.string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be at most 20 characters")
          .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      }).parse(req.body);

      // Check if username is already taken
      const existing = await storage.getUserByUsername(username);
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const updatedUser = await storage.updateUsername(userId, username);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating username:", error);
      res.status(400).json({ message: error.message || "Failed to update username" });
    }
  });

  app.post('/api/user/shipping-address', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { address, city, state, zip, country } = z.object({
        address: z.string().min(1, "Address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zip: z.string().min(1, "ZIP code is required"),
        country: z.string().default("US")
      }).parse(req.body);

      await db.update(users)
        .set({
          shippingAddress: address,
          shippingCity: city,
          shippingState: state,
          shippingZip: zip,
          shippingCountry: country
        })
        .where(eq(users.id, userId));

      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating shipping address:", error);
      res.status(400).json({ message: error.message || "Failed to update shipping address" });
    }
  });

  app.post('/api/user/games', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const validated = insertUserGameSchema.parse({ ...req.body, userId });
      const userGame = await storage.connectUserGame(validated);
      res.json(userGame);
    } catch (error: any) {
      console.error("Error connecting game:", error);
      res.status(400).json({ message: error.message || "Failed to connect game" });
    }
  });

  // DEPRECATED: Insecure endpoint - use /api/riot/verification/* instead
  // This endpoint has been disabled due to security vulnerability (no ownership verification)
  app.post('/api/riot/link-account-DISABLED', getUserMiddleware, async (req: any, res) => {
    return res.status(410).json({
      message: 'This endpoint has been disabled for security reasons. Use /api/riot/verification/request-verification instead.',
      migration: {
        step1: 'POST /api/riot/verification/request-verification with {game, gameName, tagLine, region}',
        step2: 'Add verification code to your in-game Riot ID',
        step3: 'POST /api/riot/verification/verify-ownership to complete linking'
      }
    });
  });

  app.post('/api/riot/link-account-secure', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { game, gameName, tagLine, region = 'na1' } = req.body;

      if (!game || !gameName || !tagLine) {
        return res.status(400).json({
          message: "Game, Riot ID (GameName#Tag), and region are required"
        });
      }

      // Verify account exists via Riot API
      const { getRiotAPI } = await import('./lib/riot');
      const riotAPI = getRiotAPI();

      // Get routing region for Account API (americas, europe, asia, sea)
      const routingRegion = region.startsWith('na') || region.startsWith('br') || region.startsWith('la') ? 'americas' :
        region.startsWith('kr') || region.startsWith('jp') ? 'asia' :
          region.startsWith('oc') || region.startsWith('ph') || region.startsWith('sg') || region.startsWith('th') || region.startsWith('tw') || region.startsWith('vn') ? 'sea' :
            'europe';

      const riotAccount = await riotAPI.getAccountByRiotId(gameName, tagLine, routingRegion);

      // Save to database
      await db.insert(riotAccounts).values({
        userId,
        puuid: riotAccount.puuid,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        region,
        game: game === 'league' ? 'league' : 'valorant',
      }).onConflictDoUpdate({
        target: [riotAccounts.userId, riotAccounts.game],
        set: {
          puuid: riotAccount.puuid,
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        account: {
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          verified: true,
        }
      });
    } catch (error: any) {
      console.error("Error linking Riot account:", error);
      res.status(400).json({
        message: error.message || "Failed to link Riot account. Check your Riot ID format (GameName#Tag)"
      });
    }
  });

  // Link League of Legends account
  app.post('/api/riot/link/league', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { riotId, region = 'na1' } = req.body;

      if (!riotId || !riotId.includes('#')) {
        return res.status(400).json({
          message: "Riot ID in format GameName#TAG is required"
        });
      }

      const [gameName, tagLine] = riotId.split('#');

      // Verify account exists via Riot API
      const { getRiotAPI, getRoutingRegion } = await import('./lib/riot');
      const riotAPI = getRiotAPI();
      const routingRegion = getRoutingRegion(region);

      const riotAccount = await riotAPI.getAccountByRiotId(gameName, tagLine, routingRegion);

      // Check if user already has a League account linked
      const [existingAccount] = await db.select().from(riotAccounts).where(
        and(
          eq(riotAccounts.userId, userId),
          eq(riotAccounts.game, 'league')
        )
      );

      // If switching to a different player (different PUUID), delete old match history and leaderboard entries
      // This prevents showing stats from a different player's account
      if (existingAccount && existingAccount.puuid !== riotAccount.puuid) {
        console.log(`[Riot Link] User ${userId} switching League accounts. Deleting old data (PUUID: ${existingAccount.puuid} -> ${riotAccount.puuid})`);

        // Delete match history
        await db.delete(processedRiotMatches).where(
          eq(processedRiotMatches.riotAccountId, existingAccount.id)
        );

        // Delete leaderboard entries (they're tied to the old account's performance)
        const [leagueGame] = await db.select().from(games).where(eq(games.title, 'League of Legends')).limit(1);
        if (leagueGame) {
          await db.delete(leaderboardEntries).where(
            and(
              eq(leaderboardEntries.userId, userId),
              eq(leaderboardEntries.gameId, leagueGame.id)
            )
          );
        }
      }

      // Save to database (update if exists, insert if new)
      await db.insert(riotAccounts).values({
        userId,
        puuid: riotAccount.puuid,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        region,
        game: 'league',
      }).onConflictDoUpdate({
        target: [riotAccounts.userId, riotAccounts.game],
        set: {
          puuid: riotAccount.puuid,
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        account: {
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          verified: true,
        }
      });
    } catch (error: any) {
      console.error("Error linking League account:", error);
      res.status(400).json({
        message: error.message || "Failed to link League account. Check your Riot ID format (GameName#Tag)"
      });
    }
  });

  // Link Valorant account
  app.post('/api/riot/link/valorant', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { riotId, region } = req.body;

      if (!riotId || !riotId.includes('#')) {
        return res.status(400).json({
          message: "Riot ID in format GameName#TAG is required"
        });
      }

      // Validate Valorant region
      const validValorantRegions = ['na', 'eu', 'ap', 'kr', 'br', 'latam', 'pbe'];
      if (!region || !validValorantRegions.includes(region.toLowerCase())) {
        return res.status(400).json({
          message: `Invalid Valorant region. Please select one of: ${validValorantRegions.join(', ')}`
        });
      }

      const [gameName, tagLine] = riotId.split('#');

      // Verify account exists via Riot API
      const { getRiotAPI, getValorantRoutingRegion } = await import('./lib/riot');
      const riotAPI = getRiotAPI();
      const routingRegion = getValorantRoutingRegion(region);

      const riotAccount = await riotAPI.getAccountByRiotId(gameName, tagLine, routingRegion);

      // Check if user already has a Valorant account linked
      const [existingAccount] = await db.select().from(riotAccounts).where(
        and(
          eq(riotAccounts.userId, userId),
          eq(riotAccounts.game, 'valorant')
        )
      );

      // If switching to a different player (different PUUID), delete old match history and leaderboard entries
      // This prevents showing stats from a different player's account
      if (existingAccount && existingAccount.puuid !== riotAccount.puuid) {
        console.log(`[Riot Link] User ${userId} switching Valorant accounts. Deleting old data (PUUID: ${existingAccount.puuid} -> ${riotAccount.puuid})`);

        // Delete match history
        await db.delete(processedRiotMatches).where(
          eq(processedRiotMatches.riotAccountId, existingAccount.id)
        );

        // Delete leaderboard entries (they're tied to the old account's performance)
        const [valorantGame] = await db.select().from(games).where(eq(games.title, 'Valorant')).limit(1);
        if (valorantGame) {
          await db.delete(leaderboardEntries).where(
            and(
              eq(leaderboardEntries.userId, userId),
              eq(leaderboardEntries.gameId, valorantGame.id)
            )
          );
        }
      }

      // Save to database (update if exists, insert if new)
      await db.insert(riotAccounts).values({
        userId,
        puuid: riotAccount.puuid,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        region,
        game: 'valorant',
      }).onConflictDoUpdate({
        target: [riotAccounts.userId, riotAccounts.game],
        set: {
          puuid: riotAccount.puuid,
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        account: {
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          region,
          verified: true,
        }
      });
    } catch (error: any) {
      console.error("Error linking Valorant account:", error);
      res.status(400).json({
        message: error.message || "Failed to link Valorant account. Check your Riot ID format (GameName#Tag)"
      });
    }
  });

  // Get user's linked Riot account with sync stats
  app.get('/api/riot/account/:game', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { game } = req.params;

      const [riotAccount] = await db.select().from(riotAccounts).where(
        and(eq(riotAccounts.userId, userId), eq(riotAccounts.game, game))
      );

      if (!riotAccount) {
        return res.json({ linked: false });
      }

      // Get match stats for this account
      const matches = await db.select({
        match: processedRiotMatches,
      })
        .from(processedRiotMatches)
        .where(eq(processedRiotMatches.riotAccountId, riotAccount.id))
        .orderBy(desc(processedRiotMatches.processedAt))
        .limit(1);

      const totalMatches = await db.select({ count: sql<number>`count(*)::int` })
        .from(processedRiotMatches)
        .where(eq(processedRiotMatches.riotAccountId, riotAccount.id));

      const wins = await db.select({ count: sql<number>`count(*)::int` })
        .from(processedRiotMatches)
        .where(
          and(
            eq(processedRiotMatches.riotAccountId, riotAccount.id),
            eq(processedRiotMatches.isWin, true)
          )
        );

      const lastSyncedAt = matches[0]?.match.processedAt || riotAccount.createdAt;
      const totalMatchCount = totalMatches[0]?.count || 0;
      const winCount = wins[0]?.count || 0;

      res.json({
        linked: true,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        region: riotAccount.region,
        verifiedAt: riotAccount.createdAt,
        lastSyncedAt,
        totalMatches: totalMatchCount,
        wins: winCount,
        losses: totalMatchCount - winCount,
      });
    } catch (error: any) {
      console.error("Error fetching Riot account:", error);
      res.status(500).json({ message: "Failed to fetch Riot account" });
    }
  });

  // Get user's processed Riot matches
  app.get('/api/riot/matches', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const userRiotAccounts = await db.select().from(riotAccounts).where(
        eq(riotAccounts.userId, userId)
      );

      if (userRiotAccounts.length === 0) {
        return res.json([]);
      }

      const accountIds = userRiotAccounts.map((acc: any) => acc.id);

      const matches = await db.select({
        match: processedRiotMatches,
        account: riotAccounts,
      })
        .from(processedRiotMatches)
        .innerJoin(riotAccounts, eq(processedRiotMatches.riotAccountId, riotAccounts.id))
        .where(
          inArray(processedRiotMatches.riotAccountId, accountIds)
        )
        .orderBy(desc(processedRiotMatches.gameEndedAt))
        .limit(limit);

      const formattedMatches = matches.map((m: any) => ({
        id: m.match.id,
        matchId: m.match.matchId,
        game: m.account.game,
        gameName: m.account.gameName,
        tagLine: m.account.tagLine,
        region: m.account.region,
        isWin: m.match.isWin,
        pointsAwarded: m.match.pointsAwarded,
        gameEndedAt: m.match.gameEndedAt,
        processedAt: m.match.processedAt,
      }));

      res.json(formattedMatches);
    } catch (error: any) {
      console.error("Error fetching Riot matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Global activity feed - recent wins across all users
  app.get('/api/activity/recent-wins', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 15;

      const recentWins = await db.select({
        match: processedRiotMatches,
        account: riotAccounts,
        user: users,
      })
        .from(processedRiotMatches)
        .innerJoin(riotAccounts, eq(processedRiotMatches.riotAccountId, riotAccounts.id))
        .innerJoin(users, eq(riotAccounts.userId, users.id))
        .where(eq(processedRiotMatches.isWin, true))
        .orderBy(desc(processedRiotMatches.processedAt))
        .limit(limit);

      const formattedActivity = recentWins.map((w: any) => ({
        username: w.user.username || w.account.gameName,
        game: w.account.game,
        pointsEarned: w.match.pointsAwarded,
        timestamp: w.match.processedAt,
      }));

      res.json(formattedActivity);
    } catch (error: any) {
      console.error("Error fetching recent wins:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Online users count - users active in last 10 minutes
  app.get('/api/activity/online-users', async (req, res) => {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const result = await db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(sql`${users.lastLoginAt} >= ${tenMinutesAgo}`);

      const onlineCount = result[0]?.count || 0;

      res.json({
        count: onlineCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  // Match sync status - last sync time and recent activity
  app.get('/api/activity/sync-status', async (req, res) => {
    try {
      const lastProcessed = await db.select({
        processedAt: processedRiotMatches.processedAt,
      })
        .from(processedRiotMatches)
        .orderBy(desc(processedRiotMatches.processedAt))
        .limit(1);

      const totalLinkedAccounts = await db.select({ count: sql<number>`count(*)::int` })
        .from(riotAccounts);

      const lastSyncTime = lastProcessed[0]?.processedAt || null;
      const linkedCount = totalLinkedAccounts[0]?.count || 0;

      // Match sync service runs every 5 minutes
      const SYNC_INTERVAL_MS = 5 * 60 * 1000;
      let nextSyncIn = null;

      if (lastSyncTime) {
        const timeSinceLastSync = Date.now() - new Date(lastSyncTime).getTime();
        nextSyncIn = Math.max(0, SYNC_INTERVAL_MS - timeSinceLastSync);
      }

      res.json({
        lastSyncAt: lastSyncTime,
        nextSyncIn: nextSyncIn,
        linkedAccounts: linkedCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching sync status:", error);
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  app.get('/api/leaderboard/:gameId/:period', async (req, res) => {
    try {
      const { gameId, period } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const entries = await storage.getLeaderboard(gameId, period, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/user/achievements', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const achievements = await storage.getUserAchievements(userId, limit);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/rewards', async (req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });



  app.get('/api/user/rewards', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const userRewards = await storage.getUserRewards(userId);
      res.json(userRewards);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      res.status(500).json({ message: "Failed to fetch user rewards" });
    }
  });

  app.get('/api/admin/pending-rewards', adminMiddleware, async (req: any, res) => {
    try {
      const pendingRewards = await storage.getAllPendingRewards();
      res.json(pendingRewards);
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
      res.status(500).json({ message: "Failed to fetch pending rewards" });
    }
  });

  app.get('/api/admin/daily-metrics', adminMiddleware, async (req: any, res) => {
    try {
      const metrics = await storage.getDailyMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching daily metrics:", error);
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  // Lightweight public metrics for authenticated users (non-admin) — used for dashboards
  app.get('/api/public/daily-metrics', requireAuth, async (req: any, res) => {
    try {
      const metrics = await storage.getDailyMetrics();
      // Return only subset of metrics safe for non-admin view
      res.json({
        totalUsers: metrics.totalUsers,
        newSignupsToday: metrics.newSignupsToday,
        activeEarnersToday: metrics.activeEarnersToday,
        activeEarnersThisWeek: metrics.activeEarnersThisWeek,
      });
    } catch (error) {
      console.error("Error fetching public daily metrics:", error);
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  app.get('/api/admin/checklist/:date', adminMiddleware, async (req: any, res) => {
    try {
      const { date } = req.params;
      const items = await storage.getChecklistItems(date);
      res.json(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  });

  app.post('/api/admin/checklist/toggle', adminMiddleware, async (req: any, res) => {
    try {
      const { date, taskId, taskLabel, completed } = z.object({
        date: z.string(),
        taskId: z.string(),
        taskLabel: z.string(),
        completed: z.boolean(),
      }).parse(req.body);

      const item = await storage.toggleChecklistItem(date, taskId, taskLabel, completed);
      res.json(item);
    } catch (error: any) {
      console.error("Error toggling checklist item:", error);
      res.status(400).json({ message: error.message || "Failed to toggle checklist item" });
    }
  });

  app.post('/api/admin/rewards/fulfill', adminMiddleware, async (req: any, res) => {
    try {
      const { userRewardId, giftCardCode } = z.object({
        userRewardId: z.string(),
        giftCardCode: z.string().optional()
      }).parse(req.body);

      const userReward = await storage.updateUserRewardStatus(
        userRewardId,
        'fulfilled',
        giftCardCode ? { giftCardCode, fulfilledAt: new Date() } : { fulfilledAt: new Date() }
      );

      res.json(userReward);
    } catch (error: any) {
      console.error("Error fulfilling reward:", error);
      res.status(400).json({ message: error.message || "Failed to fulfill reward" });
    }
  });

  app.post('/api/admin/rewards/tracking', adminMiddleware, async (req: any, res) => {
    try {
      const { userRewardId, trackingNumber } = z.object({
        userRewardId: z.string(),
        trackingNumber: z.string()
      }).parse(req.body);

      const userReward = await db.update(userRewards)
        .set({ trackingNumber })
        .where(eq(userRewards.id, userRewardId))
        .returning();

      if (!userReward[0]) {
        return res.status(404).json({ message: "User reward not found" });
      }

      console.log(`📦 Tracking number added for reward ${userRewardId}: ${trackingNumber}`);

      res.json(userReward[0]);
    } catch (error: any) {
      console.error("Error adding tracking number:", error);
      res.status(400).json({ message: error.message || "Failed to add tracking number" });
    }
  });

  app.get('/api/admin/redemptions', adminMiddleware, async (req: any, res) => {
    try {
      const redemptions = await db.select({
        id: userRewards.id,
        userId: userRewards.userId,
        rewardId: userRewards.rewardId,
        pointsSpent: userRewards.pointsSpent,
        redeemedAt: userRewards.redeemedAt,
        status: userRewards.status,
        trackingNumber: userRewards.trackingNumber,
        fulfillmentNotes: userRewards.fulfillmentNotes,
        fulfilledAt: userRewards.fulfilledAt,
        shippingAddress: userRewards.shippingAddress,
        shippingCity: userRewards.shippingCity,
        shippingState: userRewards.shippingState,
        shippingZip: userRewards.shippingZip,
        shippingCountry: userRewards.shippingCountry,
        user: {
          username: users.username,
          email: users.email,
          isFounder: users.isFounder,
          founderNumber: users.founderNumber,
        },
        reward: {
          title: rewards.title,
          fulfillmentType: rewards.fulfillmentType,
        }
      })
        .from(userRewards)
        .innerJoin(users, eq(userRewards.userId, users.id))
        .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
        .orderBy(
          sql`CASE WHEN ${users.isFounder} = true THEN 0 ELSE 1 END`, // Founders first
          sql`CASE WHEN ${userRewards.status} = 'pending' THEN 0 ELSE 1 END`, // Pending first
          desc(userRewards.redeemedAt) // Then by date
        );

      res.json(redemptions);
    } catch (error: any) {
      console.error("Error fetching redemptions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch redemptions" });
    }
  });

  app.post('/api/admin/fulfill-redemption', adminMiddleware, async (req: any, res) => {
    try {
      const { redemptionId, trackingNumber, notes, giftCardCode } = z.object({
        redemptionId: z.string(),
        trackingNumber: z.string().optional(),
        notes: z.string().optional(),
        giftCardCode: z.string().optional(),
      }).parse(req.body);

      const fulfillmentData: any = { giftCardCode };
      const updateData: any = {
        status: 'fulfilled',
        fulfilledAt: new Date(),
        fulfillmentData: giftCardCode ? fulfillmentData : null,
      };

      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (notes) updateData.fulfillmentNotes = notes;

      const [updated] = await db.update(userRewards)
        .set(updateData)
        .where(eq(userRewards.id, redemptionId))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Redemption not found" });
      }

      console.log(`✅ Redemption fulfilled: ${redemptionId}`);
      res.json(updated);
    } catch (error: any) {
      console.error("Error fulfilling redemption:", error);
      res.status(400).json({ message: error.message || "Failed to fulfill redemption" });
    }
  });

  app.post('/api/admin/rewards', adminMiddleware, async (req: any, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const newReward = await storage.createReward(rewardData);
      console.log(`✨ Created reward: ${newReward.title} (${newReward.pointsCost} points)`);
      res.json(newReward);
    } catch (error: any) {
      console.error("Error creating reward:", error);
      res.status(400).json({ message: error.message || "Failed to create reward" });
    }
  });

  app.patch('/api/admin/rewards/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const updates = insertRewardSchema.partial().parse(req.body);
      const updatedReward = await storage.updateReward(id, updates);
      console.log(`✏️ Updated reward: ${updatedReward.title}`);
      res.json(updatedReward);
    } catch (error: any) {
      console.error("Error updating reward:", error);
      res.status(400).json({ message: error.message || "Failed to update reward" });
    }
  });

  app.delete('/api/admin/rewards/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(req.params);
      await storage.deleteReward(id);
      console.log(`🗑️ Deleted reward: ${id}`);
      res.json({ message: "Reward deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting reward:", error);
      res.status(400).json({ message: error.message || "Failed to delete reward" });
    }
  });

  app.post('/api/user/rewards/redeem', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { rewardId } = z.object({ rewardId: z.string() }).parse(req.body);

      // Check if user already claimed this reward
      const existingClaim = await storage.getUserRewards(userId);
      if (existingClaim.some(ur => ur.rewardId === rewardId)) {
        return res.status(400).json({ message: "You have already claimed this reward" });
      }

      // Get reward to calculate actual points cost (security: don't trust client)
      const allRewards = await storage.getAllRewards();
      const reward = allRewards.find(r => r.id === rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }

      // Get user's current shipping address for physical items
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if reward is Founder-only (contains "Founder Exclusive" in title)
      if (reward.title.includes('Founder Exclusive') || reward.title.includes('🏆')) {
        if (!user.isFounder) {
          return res.status(403).json({
            message: "This reward is exclusive to Founder Badge members (first 100 signups only)"
          });
        }
      }

      // For physical items, require complete and valid shipping address
      if (reward.fulfillmentType === 'physical') {
        const missingFields: string[] = [];

        if (!user.shippingAddress?.trim()) missingFields.push("Street Address");
        if (!user.shippingCity?.trim()) missingFields.push("City");
        if (!user.shippingState?.trim()) missingFields.push("State/Province");
        if (!user.shippingZip?.trim()) missingFields.push("ZIP/Postal Code");

        if (missingFields.length > 0) {
          return res.status(400).json({
            message: `Please complete your shipping address in Settings. Missing: ${missingFields.join(", ")}`
          });
        }

        // Comprehensive address format validation
        // Safe to use non-null assertion - already validated above
        const address = user.shippingAddress!.trim();
        const city = user.shippingCity!.trim();
        const state = user.shippingState!.trim();
        const zip = user.shippingZip!.trim();
        const country = (user.shippingCountry || 'US').trim().toUpperCase();

        // Validate street address - must contain letters and numbers (not purely numeric)
        if (address.length < 5) {
          return res.status(400).json({
            message: "Street address must be at least 5 characters"
          });
        }

        if (/^\d+$/.test(address)) {
          return res.status(400).json({
            message: "Street address cannot be only numbers. Please include street name."
          });
        }

        if (!/[a-zA-Z]/.test(address)) {
          return res.status(400).json({
            message: "Street address must contain letters"
          });
        }

        // Validate city name - must contain letters (no purely numeric cities)
        if (city.length < 2) {
          return res.status(400).json({
            message: "City name must be at least 2 characters"
          });
        }

        if (!/[a-zA-Z]/.test(city)) {
          return res.status(400).json({
            message: "City name must contain letters"
          });
        }

        // Validate state/province - must be letters only (2-letter codes or full names)
        if (state.length < 2) {
          return res.status(400).json({
            message: "State/Province must be at least 2 characters"
          });
        }

        if (!/^[a-zA-Z\s.-]+$/.test(state)) {
          return res.status(400).json({
            message: "State/Province must contain only letters, spaces, hyphens, or periods"
          });
        }

        // Validate ZIP/postal code - country-aware validation
        if (zip.length < 3) {
          return res.status(400).json({
            message: "ZIP/Postal code must be at least 3 characters"
          });
        }

        // US ZIP code: 5 digits or 5+4 format (12345 or 12345-6789)
        if (country === 'US') {
          if (!/^\d{5}(-\d{4})?$/.test(zip)) {
            return res.status(400).json({
              message: "US ZIP code must be 5 digits (e.g., 12345) or 9 digits (e.g., 12345-6789)"
            });
          }
        }
        // Canada postal code: A1A 1A1 or A1A1A1
        else if (country === 'CA') {
          if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(zip)) {
            return res.status(400).json({
              message: "Canadian postal code must be in format A1A 1A1"
            });
          }
        }
        // UK postcode: various formats
        else if (country === 'GB' || country === 'UK') {
          if (!/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i.test(zip)) {
            return res.status(400).json({
              message: "UK postcode must be in valid format (e.g., SW1A 1AA)"
            });
          }
        }
        // For other countries, ensure it contains at least one alphanumeric character
        else {
          if (!/[a-zA-Z0-9]/.test(zip)) {
            return res.status(400).json({
              message: "Postal code must contain at least one letter or number"
            });
          }
        }
      }

      // Server-side calculation of pointsSpent (security critical)
      const validated = insertUserRewardSchema.parse({
        userId,
        rewardId,
        pointsSpent: reward.pointsCost,
        // Copy shipping address if it's a physical item
        ...(reward.fulfillmentType === 'physical' && {
          shippingAddress: user.shippingAddress,
          shippingCity: user.shippingCity,
          shippingState: user.shippingState,
          shippingZip: user.shippingZip,
          shippingCountry: user.shippingCountry || 'US'
        })
      });

      const userReward = await storage.redeemReward(validated);

      // IMPORTANT: Notification for fulfillment
      const shippingInfo = reward.fulfillmentType === 'physical'
        ? `\nShipping Address:\n${user.shippingAddress}\n${user.shippingCity}, ${user.shippingState} ${user.shippingZip}\n${user.shippingCountry || 'US'}`
        : '';

      console.log(`
🎁 REWARD REDEMPTION ALERT 🎁
━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: ${req.dbUser.email} (${req.dbUser.firstName || 'Unknown'})
Reward: ${reward.title}
Points Spent: ${reward.pointsCost}
Real Value: $${reward.realValue}
Fulfillment Type: ${reward.fulfillmentType}${shippingInfo}
Time: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION NEEDED: ${reward.fulfillmentType === 'physical'
          ? 'Purchase and ship item to address above'
          : `Buy and email gift card code to ${req.dbUser.email}`}
      `);

      // Discord Notification for Admins
      try {
        const discordWebhookUrl = process.env.DISCORD_ADMIN_WEBHOOK_URL;
        if (discordWebhookUrl) {
          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: '🎁 New Reward Redemption!',
                description: `**User:** ${req.dbUser.email}\n**Reward:** ${reward.title}\n**Cost:** ${reward.pointsCost} pts`,
                color: 0x10B981, // Emerald Green
                fields: [
                  { name: 'Fulfillment Type', value: reward.fulfillmentType, inline: true },
                  { name: 'Action Required', value: 'Check Admin Panel to fulfill', inline: true }
                ],
                timestamp: new Date().toISOString()
              }]
            })
          });
        }
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError);
      }

      // TODO: Add email notification - see Replit docs for email integration

      res.json(userReward);
    } catch (error: any) {
      console.error("Error redeeming reward:", error);
      res.status(400).json({ message: error.message || "Failed to redeem reward" });
    }
  });

  app.get('/api/points/balance', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const balance = await pointsEngine.getUserBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching points balance:", error);
      res.status(500).json({ message: "Failed to fetch points balance" });
    }
  });

  app.get('/api/points/transactions', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getPointTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // User Rewards History
  app.get('/api/user/rewards', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const userRedemptions = await db
        .select({
          id: userRewards.id,
          title: rewards.title,
          pointsSpent: userRewards.pointsSpent,
          status: userRewards.status,
          redeemedAt: userRewards.redeemedAt,
          fulfillmentData: userRewards.fulfillmentData,
        })
        .from(userRewards)
        .leftJoin(rewards, eq(userRewards.rewardId, rewards.id))
        .where(eq(userRewards.userId, userId))
        .orderBy(desc(userRewards.redeemedAt));

      res.json(userRedemptions);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards history" });
    }
  });

  // Redeem Reward
  app.post('/api/user/rewards/redeem', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { rewardId } = req.body;

      if (!rewardId) {
        return res.status(400).json({ message: "Reward ID is required" });
      }

      // Execute redemption in a transaction
      const result = await db.transaction(async (tx: any) => {
        // 1. Get reward with lock
        const [reward] = await tx
          .select()
          .from(rewards)
          .where(eq(rewards.id, rewardId))
          .for("update")
          .limit(1);

        if (!reward) {
          throw new Error("Reward not found");
        }

        if (!reward.inStock || (reward.stock !== null && reward.stock <= 0)) {
          throw new Error("Reward is out of stock");
        }

        // 2. Deduct points (this checks balance internally)
        await pointsEngine.spendPoints(
          userId,
          reward.pointsCost,
          "reward_redemption",
          reward.id,
          "reward",
          `Redeemed: ${reward.title}`,
          tx
        );

        // 3. Create redemption record
        const [redemption] = await tx
          .insert(userRewards)
          .values({
            userId,
            rewardId,
            pointsSpent: reward.pointsCost,
            status: "pending", // Default to pending for manual fulfillment
            redeemedAt: new Date(),
          })
          .returning();

        // 4. Update stock if tracked
        if (reward.stock !== null) {
          await tx
            .update(rewards)
            .set({
              stock: sql`${rewards.stock} - 1`,
              inStock: sql`CASE WHEN ${rewards.stock} - 1 <= 0 THEN false ELSE true END`
            })
            .where(eq(rewards.id, rewardId));
        }

        return redemption;
      });

      // TODO: Send email notification to admin (using ADMIN_EMAILS env var)
      console.log(`[Redemption] User ${userId} redeemed reward ${rewardId}. Order ID: ${result.id}`);

      res.json({ success: true, message: "Reward redeemed successfully!", orderId: result.id });

    } catch (error: any) {
      console.error("Redemption error:", error);
      if (error.message.includes("Insufficient points")) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      if (error.message.includes("out of stock")) {
        return res.status(400).json({ message: "Reward is out of stock" });
      }
      res.status(500).json({ message: error.message || "Failed to redeem reward" });
    }
  });


  // Match submission routes
  app.get('/api/match-submissions', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const submissions = await storage.getUserMatchSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching match submissions:", error);
      res.status(500).json({ message: "Failed to fetch match submissions" });
    }
  });

  app.post('/api/match-submissions', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { gameId, notes, screenshotUrl } = req.body;

      const { RiotApiService } = await import('./riotApi');
      const riotApi = new RiotApiService();

      // Get recent match IDs (last 24 hours)
      const matchIds = await riotApi.getRecentMatchIds(
        riotAccount.riotPuuid,
        riotAccount.riotRegion || 'na',
        20
      );

      if (matchIds.length === 0) {
        return res.status(400).json({
          message: 'No recent matches found. Play a match and try again!'
        });
      }

      // Check each match until we find an unredeemed win
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);

      for (const matchId of matchIds) {
        // Check if this match was already redeemed
        const existingSubmission = await storage.getMatchSubmissionByRiotMatchId(userId, matchId);
        if (existingSubmission) {
          continue; // Skip already redeemed matches
        }

        // Fetch and verify this specific match
        const matchDetails = await riotApi.getMatchDetails(matchId, riotAccount.riotRegion || 'na');

        // Check if match is within 24 hours
        if (matchDetails.info.gameEndTimestamp < cutoffTime) {
          break; // Matches are ordered newest first, so we can stop
        }

        // Find player's data in this match
        const participant = matchDetails.info.participants.find(p => p.puuid === riotAccount.riotPuuid);

        if (participant && participant.win) {
          // FOUND AN UNREDEEMED WIN!
          // Determine match type and points from game metadata
          const gameMode = matchDetails.info.gameMode || 'CLASSIC';
          const queueId = matchDetails.info.queueId || 0;

          // Map queue types to point values
          let matchType = 'win';
          let pointsAwarded = 10;

          // Ranked queues (420 = Ranked Solo, 440 = Ranked Flex)
          if (queueId === 420 || queueId === 440) {
            matchType = 'ranked';
            pointsAwarded = 15;
          }
          // Tournament queues
          else if (queueId === 700 || queueId === 710 || queueId === 720) {
            matchType = 'tournament';
            pointsAwarded = 50;
          }

          // Normalize screenshot URL if provided
          let normalizedScreenshotUrl = null;
          if (screenshotUrl) {
            const objectStorageService = new ObjectStorageService();
            normalizedScreenshotUrl = objectStorageService.normalizeObjectEntityPath(screenshotUrl);
          }

          // Create verified submission with match ID
          const submission = await storage.createMatchSubmission({
            userId,
            gameId,
            matchType,
            notes: notes || null,
            screenshotUrl: normalizedScreenshotUrl,
            riotMatchId: matchId,
            verifiedViaRiot: true,
            matchData: {
              championName: participant.championName,
              kills: participant.kills,
              deaths: participant.deaths,
              assists: participant.assists,
              gameMode,
              queueId,
              gameDuration: matchDetails.info.gameDuration,
            },
          });

          // Auto-approve and award points
          await storage.updateMatchSubmission(submission.id, {
            status: 'approved',
            pointsAwarded,
            reviewedAt: new Date(),
          });

          // Award points AND track challenge progress in single transaction
          await db.transaction(async (tx: any) => {
            // Award points
            await pointsEngine.awardPoints(
              userId,
              pointsAwarded,
              'MATCH_WIN',
              submission.id,
              'match_submission',
              `Verified ${matchType} win - ${participant.championName}`,
              tx
            );

            // Auto-track challenge progress (atomic)
            const now = new Date();
            const activeChallenges = await tx
              .select()
              .from(challenges)
              .where(
                and(
                  eq(challenges.isActive, true),
                  eq(challenges.requirementType, 'match_wins'),
                  sql`${challenges.startDate} <= ${now}`,
                  sql`${challenges.endDate} >= ${now}`
                )
              );

            for (const challenge of activeChallenges) {
              // Atomic upsert with ON CONFLICT to prevent race conditions
              await tx
                .insert(challengeCompletions)
                .values({
                  userId,
                  challengeId: challenge.id,
                  progress: 1,
                  pointsAwarded: 0,
                  completedAt: challenge.requirementCount === 1 ? new Date() : null
                })
                .onConflictDoUpdate({
                  target: [challengeCompletions.userId, challengeCompletions.challengeId],
                  set: {
                    progress: sql`CASE 
                        WHEN ${challengeCompletions.claimed} = true THEN ${challengeCompletions.progress}
                        ELSE LEAST(${challengeCompletions.progress} + 1, ${challenge.requirementCount})
                      END`,
                    completedAt: sql`COALESCE(
                        ${challengeCompletions.completedAt},
                        CASE 
                          WHEN ${challengeCompletions.progress} + 1 >= ${challenge.requirementCount} 
                          THEN NOW() 
                        END
                      )`,
                    updatedAt: new Date()
                  }
                });
            }
          });

          return res.json({
            success: true,
            pointsAwarded,
            verified: true,
            matchType,
            championName: participant.championName,
            kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
            message: `Victory verified! +${pointsAwarded} points`
          });
        }
      }

      // No unredeemed wins found
      return res.status(400).json({
        message: 'No new wins found in your recent matches. All recent wins have already been redeemed!'
      });

    } catch (error: any) {
      console.error("Error creating match submission:", error);

      // Check for duplicate match ID error
      if (error.message?.includes('unique') || error.code === '23505') {
        return res.status(400).json({
          message: 'This match has already been redeemed!'
        });
      }

      res.status(500).json({ message: error.message || "Failed to submit match" });
    }
  });

  // ============================================
  // SPONSORED CHALLENGES API
  // ============================================

  // GET /api/challenges - List active challenges with user progress
  app.get('/api/challenges', async (req: any, res) => {
    try {
      const userId = req.isAuthenticated() && req.user?.oidcSub
        ? (await storage.getUserByOidcSub(req.user.oidcSub))?.id
        : null;

      const now = new Date();
      const activeChallenges = await db
        .select()
        .from(challenges)
        .where(
          and(
            eq(challenges.isActive, true),
            sql`${challenges.startDate} <= ${now}`,
            sql`${challenges.endDate} >= ${now}`
          )
        );

      // Enrich with user progress if authenticated
      const enriched = await Promise.all(activeChallenges.map(async (challenge: any) => {
        if (!userId) {
          return { ...challenge, userProgress: null, canClaim: false };
        }

        const [completion] = await db
          .select()
          .from(challengeCompletions)
          .where(
            and(
              eq(challengeCompletions.userId, userId),
              eq(challengeCompletions.challengeId, challenge.id)
            )
          )
          .limit(1);

        return {
          ...challenge,
          userProgress: completion?.progress || 0,
          canClaim: completion ?
            (completion.progress >= challenge.requirementCount && !completion.claimed) :
            false,
          claimed: completion?.claimed || false
        };
      }));

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // POST /api/challenges/:id/claim - Claim reward (TRANSACTIONAL)
  app.post('/api/challenges/:id/claim', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const challengeId = req.params.id;

      // Execute claim in transaction
      const result = await db.transaction(async (tx: any) => {
        // SELECT FOR UPDATE - lock the completion row
        const [completion] = await tx
          .select()
          .from(challengeCompletions)
          .where(
            and(
              eq(challengeCompletions.userId, userId),
              eq(challengeCompletions.challengeId, challengeId)
            )
          )
          .for("update")
          .limit(1);

        if (!completion) {
          throw new Error("Challenge not started");
        }

        if (completion.claimed) {
          throw new Error("Challenge already claimed");
        }

        // SELECT FOR UPDATE - lock the challenge
        const [challenge] = await tx
          .select()
          .from(challenges)
          .where(eq(challenges.id, challengeId))
          .for("update")
          .limit(1);

        if (!challenge) {
          throw new Error("Challenge not found");
        }

        // Verify completion
        if (completion.progress < challenge.requirementCount) {
          throw new Error(`Progress incomplete: ${completion.progress}/${challenge.requirementCount}`);
        }

        // Check budget (even though DB has CHECK constraint)
        const budgetRemaining = challenge.totalBudget - challenge.pointsDistributed;
        if (budgetRemaining < challenge.bonusPoints) {
          throw new Error("Challenge budget exhausted");
        }

        // Check completion limit
        if (challenge.maxCompletions && challenge.currentCompletions >= challenge.maxCompletions) {
          throw new Error("Challenge completion limit reached");
        }

        // Award sponsored points (bypasses monthly cap!)
        const transaction = await pointsEngine.awardSponsoredPoints(
          userId,
          challenge.bonusPoints,
          challenge.id,
          challenge.title,
          tx
        );

        // Update completion record
        await tx
          .update(challengeCompletions)
          .set({
            claimed: true,
            claimedAt: new Date(),
            pointsAwarded: challenge.bonusPoints,
            transactionId: transaction.id,
            ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
            userAgent: req.headers['user-agent'] as string,
            updatedAt: new Date()
          })
          .where(eq(challengeCompletions.id, completion.id));

        // Update challenge aggregates
        await tx
          .update(challenges)
          .set({
            pointsDistributed: challenge.pointsDistributed + challenge.bonusPoints,
            currentCompletions: challenge.currentCompletions + 1,
            updatedAt: new Date()
          })
          .where(eq(challenges.id, challenge.id));

        return {
          pointsAwarded: challenge.bonusPoints,
          newBalance: transaction.balanceAfter,
          challengeTitle: challenge.title
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error claiming challenge:", error);

      if (error.message?.includes("already claimed")) {
        return res.status(409).json({ message: error.message });
      }
      if (error.message?.includes("budget exhausted") || error.message?.includes("limit reached")) {
        return res.status(422).json({ message: error.message });
      }
      if (error.message?.includes("not started") || error.message?.includes("incomplete")) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: "Failed to claim challenge" });
    }
  });

  // POST /api/admin/challenges - Create new challenge (ADMIN ONLY)
  app.post('/api/admin/challenges', adminMiddleware, async (req: any, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);

      // DUAL-WRITE: If sponsorId provided, populate legacy sponsorName/Logo from sponsor
      let finalChallengeData = { ...challengeData };

      if (challengeData.sponsorId) {
        const [sponsor] = await db.select()
          .from(sponsors)
          .where(eq(sponsors.id, challengeData.sponsorId))
          .limit(1);

        if (!sponsor) {
          return res.status(400).json({ message: "Sponsor not found" });
        }

        // Populate legacy fields for backward compatibility
        finalChallengeData.sponsorName = sponsor.name;
        finalChallengeData.sponsorLogo = sponsor.logo;

        // Validate sponsor has enough budget (including reserved funds from active challenges)
        const activeChallenges = await db.select()
          .from(challenges)
          .where(and(
            eq(challenges.sponsorId, challengeData.sponsorId),
            eq(challenges.isActive, true)
          ));

        // Reserved budget = sum of (totalBudget - pointsDistributed) for active challenges
        const reservedBudget = activeChallenges.reduce((sum: number, c: any) =>
          sum + (c.totalBudget - c.pointsDistributed), 0
        );

        const availableBudget = sponsor.totalBudget - sponsor.spentBudget - reservedBudget;

        if (challengeData.totalBudget > availableBudget) {
          return res.status(400).json({
            message: `Insufficient sponsor budget. Available: ${availableBudget} pts (Total: ${sponsor.totalBudget}, Spent: ${sponsor.spentBudget}, Reserved: ${reservedBudget}), Required: ${challengeData.totalBudget} pts`
          });
        }
      }

      const [challenge] = await db
        .insert(challenges)
        .values(finalChallengeData)
        .returning();

      res.json(challenge);
    } catch (error: any) {
      console.error("Error creating challenge:", error);

      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid challenge data", errors: error.errors });
      }

      res.status(500).json({ message: error.message || "Failed to create challenge" });
    }
  });

  app.get('/api/subscription/status', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const subscription = await storage.getSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // PayPal: Create subscription (called by PayPal SDK on button click)
  app.post('/api/paypal/create-subscription', getUserMiddleware, async (req: any, res) => {
    const { planId, tier } = req.body;
    const userId = req.dbUser.id;

    if (!planId || !tier) {
      return res.status(400).json({ message: "Plan ID and tier are required" });
    }

    try {
      // Validate tier
      const validTiers = ['basic', 'pro', 'elite', 'Basic', 'Pro', 'Elite'];
      if (!validTiers.includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      // The PayPal SDK handles the actual subscription creation on the client side
      // This endpoint just validates the request and returns the plan ID
      // The SDK will use this plan ID to create the subscription with PayPal
      console.log(`PayPal subscription creation initiated: planId=${planId}, tier=${tier}, userId=${userId}`);

      res.json({
        planId: planId,
        message: "Subscription creation initiated"
      });
    } catch (error: any) {
      console.error("Error in PayPal create-subscription:", error);
      res.status(500).json({
        message: error.message || "Failed to initiate subscription"
      });
    }
  });

  // Manual PayPal subscription sync - for users who had issues during checkout
  app.post('/api/paypal/manual-sync', getUserMiddleware, async (req: any, res) => {
    const { subscriptionId } = req.body;
    const userId = req.dbUser.id;

    if (!subscriptionId) {
      return res.status(400).json({ message: "PayPal Subscription ID is required" });
    }

    // Generate stable event ID for deduplication
    const eventId = `paypal_approved_${subscriptionId}_${userId}`;

    try {
      // Check if already processed
      const existingEvent = await storage.checkEventProcessed(eventId);
      if (existingEvent) {
        console.log(`PayPal subscription ${subscriptionId} already synced for user ${userId}`);
        const subscription = await storage.getSubscription(userId);
        return res.json({
          success: true,
          message: "Subscription already synced",
          tier: subscription?.tier || "unknown"
        });
      }

      const verification = await verifyPayPalSubscription(subscriptionId);

      if (!verification.valid) {
        console.error("PayPal subscription verification failed:", verification.error);
        return res.status(400).json({
          message: verification.error || "Invalid PayPal subscription"
        });
      }

      if (!verification.tier) {
        return res.status(400).json({
          message: "Could not determine subscription tier"
        });
      }

      // Security: Block guest users (must be authenticated with verified email)
      const userEmail = req.dbUser.email;
      if (!userEmail) {
        console.error("Manual sync blocked: Guest user attempted sync (no verified email)");
        return res.status(401).json({
          message: "You must be logged in with a verified account to sync subscriptions."
        });
      }

      // Security: Verify subscription ownership - subscriber email must match authenticated user's email
      if (!verification.subscriberEmail) {
        console.error("Manual sync blocked: PayPal subscription has no subscriber email");
        return res.status(400).json({
          message: "Unable to verify subscription ownership. Contact support."
        });
      }

      if (verification.subscriberEmail.toLowerCase() !== userEmail.toLowerCase()) {
        console.error(`Manual sync blocked: Email mismatch. Subscriber: ${verification.subscriberEmail}, User: ${userEmail}`);
        return res.status(403).json({
          message: "This subscription belongs to a different account. Please use the correct PayPal account."
        });
      }

      const tierLower = verification.tier;
      const currentDate = new Date();
      const nextBillingDate = new Date(currentDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const existingSubscription = await storage.getSubscription(userId);
      let subscriptionDbId: string;

      if (existingSubscription) {
        await storage.updateSubscription(existingSubscription.id, {
          tier: tierLower,
          status: "active",
          paypalSubscriptionId: subscriptionId,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = existingSubscription.id;

        await storage.logSubscriptionEvent({
          subscriptionId: existingSubscription.id,
          eventType: "subscription.manual_sync",
          eventData: {
            eventId,
            previousTier: existingSubscription.tier,
            newTier: tierLower,
            paypalSubscriptionId: subscriptionId,
            status: verification.status,
          },
        });
      } else {
        const newSub = await storage.createSubscription({
          userId,
          tier: tierLower,
          status: "active",
          paypalSubscriptionId: subscriptionId,
          currentPeriodStart: currentDate,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = newSub.id;

        await storage.logSubscriptionEvent({
          subscriptionId: newSub.id,
          eventType: "subscription.manual_sync_created",
          eventData: {
            eventId,
            tier: tierLower,
            paypalSubscriptionId: subscriptionId,
            status: verification.status,
          },
        });
      }

      await pointsEngine.awardMonthlySubscriptionPoints(userId, tierLower, subscriptionId);

      res.json({
        success: true,
        message: "Subscription synced successfully!",
        tier: tierLower
      });
    } catch (error: any) {
      console.error("Error syncing PayPal subscription:", error);
      res.status(500).json({
        message: error.message || "Failed to sync subscription"
      });
    }
  });

  app.post('/api/paypal/subscription-approved', getUserMiddleware, async (req: any, res) => {
    const { subscriptionId } = req.body;
    const userId = req.dbUser.id;

    if (!subscriptionId) {
      return res.status(400).json({ message: "Missing subscription ID" });
    }

    // Generate stable event ID for deduplication (based on subscription ID, not timestamp)
    const eventId = `paypal_approved_${subscriptionId}_${userId}`;

    try {
      // Check if this approval has already been processed (deduplication)
      const existingEvent = await storage.checkEventProcessed(eventId);
      if (existingEvent) {
        console.log(`PayPal subscription ${subscriptionId} already processed, skipping`);
        const subscription = await storage.getSubscription(userId);
        return res.json({
          message: "Subscription already activated",
          tier: subscription?.tier || "unknown"
        });
      }

      const verification = await verifyPayPalSubscription(subscriptionId);

      if (!verification.valid) {
        console.error("PayPal subscription verification failed:", verification.error);

        // Log verification failure event
        try {
          const sub = await storage.getSubscription(userId);
          if (sub) {
            await storage.logSubscriptionEvent({
              subscriptionId: sub.id,
              eventType: "subscription.verification_failed",
              eventData: {
                eventId,
                error: verification.error,
                paypalSubscriptionId: subscriptionId,
                status: verification.status,
              },
            });
          }
        } catch (logError) {
          console.error("Failed to log verification failure:", logError);
        }

        return res.status(400).json({
          message: verification.error || "Invalid subscription"
        });
      }

      if (!verification.tier) {
        return res.status(400).json({
          message: "Could not determine tier from PayPal subscription"
        });
      }

      const tierLower = verification.tier;
      const currentDate = new Date();
      const nextBillingDate = new Date(currentDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const existingSubscription = await storage.getSubscription(userId);
      let subscriptionDbId: string;

      if (existingSubscription) {
        await storage.updateSubscription(existingSubscription.id, {
          tier: tierLower,
          status: "active",
          paypalSubscriptionId: subscriptionId,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = existingSubscription.id;

        // Log subscription update event with stable ID
        await storage.logSubscriptionEvent({
          subscriptionId: existingSubscription.id,
          eventType: "subscription.updated",
          eventData: {
            eventId,
            previousTier: existingSubscription.tier,
            newTier: tierLower,
            paypalSubscriptionId: subscriptionId,
            status: verification.status,
          },
        });
      } else {
        const newSub = await storage.createSubscription({
          userId,
          tier: tierLower,
          status: "active",
          paypalSubscriptionId: subscriptionId,
          currentPeriodStart: currentDate,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = newSub.id;

        // Log subscription created event with stable ID
        await storage.logSubscriptionEvent({
          subscriptionId: newSub.id,
          eventType: "subscription.created",
          eventData: {
            eventId,
            tier: tierLower,
            paypalSubscriptionId: subscriptionId,
            status: verification.status,
          },
        });
      }

      await pointsEngine.awardMonthlySubscriptionPoints(userId, tierLower, subscriptionId);

      res.json({
        message: "Subscription activated successfully",
        tier: tierLower
      });
    } catch (error: any) {
      console.error("Error processing PayPal subscription:", error);

      // Log failure event with error details
      try {
        const sub = await storage.getSubscription(userId);
        if (sub) {
          await storage.logSubscriptionEvent({
            subscriptionId: sub.id,
            eventType: "subscription.processing_failed",
            eventData: {
              error: error.message,
              paypalSubscriptionId: subscriptionId,
              stack: error.stack,
            },
          });
        }
      } catch (logError) {
        console.error("Failed to log processing error:", logError);
      }

      res.status(500).json({ message: error.message || "Failed to process subscription" });
    }
  });

  // PayPal Webhook Handler - Recurring Payments
  app.post('/api/webhooks/paypal', async (req, res) => {
    try {
      // Verify webhook signature for security
      const verification = await verifyPayPalWebhook(req.headers as Record<string, string>, req.body);
      if (!verification.valid) {
        console.error(`[PayPal Webhook] Signature verification failed: ${verification.error}`);
        return res.status(401).json({ message: 'Webhook signature verification failed' });
      }

      const event = req.body;
      const eventType = event.event_type;

      console.log(`[PayPal Webhook] Verified event: ${eventType}`);

      // Handle PAYMENT.SALE.COMPLETED (monthly recurring payment)
      if (eventType === 'PAYMENT.SALE.COMPLETED') {
        const subscriptionId = event.resource?.billing_agreement_id;
        const saleId = event.resource?.id;

        if (!subscriptionId || !saleId) {
          console.error('[PayPal Webhook] Missing subscription or sale ID');
          return res.status(400).json({ message: 'Missing required data' });
        }

        // Find user by PayPal subscription ID
        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.paypalSubscriptionId, subscriptionId))
          .limit(1);

        if (!subscription[0]) {
          console.error(`[PayPal Webhook] Subscription not found: ${subscriptionId}`);
          return res.status(404).json({ message: 'Subscription not found' });
        }

        const userId = subscription[0].userId;
        const tier = subscription[0].tier;

        // Check idempotency
        const eventId = `paypal_sale_${saleId}`;
        const existingEvent = await storage.checkEventProcessed(eventId);
        if (existingEvent) {
          console.log(`[PayPal Webhook] Sale ${saleId} already processed`);
          return res.json({ received: true, message: 'Already processed' });
        }

        // Award monthly points
        await pointsEngine.awardMonthlySubscriptionPoints(userId, tier, saleId);

        // Log event
        await storage.logSubscriptionEvent({
          subscriptionId: subscription[0].id,
          eventType: 'payment.sale.completed',
          eventData: {
            eventId,
            saleId,
            paypalSubscriptionId: subscriptionId,
            tier,
          },
        });

        console.log(`[PayPal Webhook] Awarded monthly points for ${tier} tier to user ${userId}`);
      }

      // Handle BILLING.SUBSCRIPTION.CANCELLED
      if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
        const subscriptionId = event.resource?.id;

        if (!subscriptionId) {
          return res.status(400).json({ message: 'Missing subscription ID' });
        }

        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.paypalSubscriptionId, subscriptionId))
          .limit(1);

        if (subscription[0]) {
          await storage.updateSubscription(subscription[0].id, { status: 'canceled' });
          console.log(`[PayPal Webhook] Subscription ${subscriptionId} cancelled`);
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('[PayPal Webhook] Error:', error);
      res.status(500).json({ message: error.message || 'Webhook processing failed' });
    }
  });

  app.post('/api/subscription/cancel', getUserMiddleware, async (req: any, res) => {
    const userId = req.dbUser.id;

    try {
      const subscription = await storage.getSubscription(userId);

      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Generate stable event ID for deduplication
      const eventId = `cancel_${subscription.paypalSubscriptionId}_${userId}`;

      // Check if cancellation already processed
      const existingEvent = await storage.checkEventProcessed(eventId);
      if (existingEvent) {
        console.log(`Subscription ${subscription.paypalSubscriptionId} already being canceled`);
        return res.json({ message: "Subscription cancellation already in progress" });
      }

      if (subscription.paypalSubscriptionId) {
        await cancelPayPalSubscription(
          subscription.paypalSubscriptionId,
          "User requested cancellation"
        );
      }

      await storage.updateSubscription(subscription.id, {
        status: "canceling"
      });

      // Log subscription cancellation event with stable ID
      await storage.logSubscriptionEvent({
        subscriptionId: subscription.id,
        eventType: "subscription.canceled",
        eventData: {
          eventId,
          tier: subscription.tier,
          paypalSubscriptionId: subscription.paypalSubscriptionId,
          reason: "user_requested",
        },
      });

      res.json({ message: "Subscription will be canceled at period end" });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);

      // Log cancellation failure
      try {
        const subscription = await storage.getSubscription(userId);
        if (subscription) {
          const eventId = `cancel_${subscription.paypalSubscriptionId}_${userId}`;
          await storage.logSubscriptionEvent({
            subscriptionId: subscription.id,
            eventType: "subscription.cancel_failed",
            eventData: {
              eventId,
              error: error.message,
              tier: subscription.tier,
              paypalSubscriptionId: subscription.paypalSubscriptionId,
            },
          });
        }
      } catch (logError) {
        console.error("Failed to log cancellation error:", logError);
      }

      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  app.post('/api/webhooks/gaming/match-win', webhookAuth, async (req, res) => {
    try {
      const result = matchWinWebhookSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          issues: result.error.errors
        });
      }
      const { apiKey, userId, gameId, externalEventId, timestamp, matchData } = result.data;

      // Partner already authenticated by webhookAuth middleware (adds partnerId to req)
      const partnerId = req.partnerId!;
      const partner = await storage.getApiPartner(apiKey);
      if (!partner || partner.id !== partnerId) {
        return res.status(401).json({ message: "Partner ID mismatch" });
      }

      const existingEvent = await storage.getEventByExternalId(partner.id, externalEventId);
      if (existingEvent) {
        return res.json({ message: "Event already processed", eventId: existingEvent.id });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscription = await storage.getSubscription(userId);
      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({ message: "User must have active subscription" });
      }

      const basePoints = 10;
      // Tier multipliers for match win webhooks (legacy - match-based points deprecated)
      const tierMultiplier = subscription.tier === "elite" ? 1.5 : subscription.tier === "pro" ? 1.2 : 1.0;
      const pointsToAward = Math.floor(basePoints * tierMultiplier);

      const event = await storage.logGamingEvent({
        partnerId: partner.id,
        userId,
        gameId: gameId || null,
        eventType: "MATCH_WIN",
        eventData: matchData || {},
        externalEventId,
        pointsAwarded: null,
        transactionId: null,
        errorMessage: null,
      });

      try {
        const transaction = await pointsEngine.awardPoints(
          userId,
          pointsToAward,
          "MATCH_WIN",
          event.id,
          "gaming_event",
          `Match win - ${partner.name}`
        );

        await storage.updateGamingEvent(event.id, {
          status: "processed",
          pointsAwarded: pointsToAward,
          transactionId: transaction.id,
          processedAt: new Date(),
        });

        res.json({
          success: true,
          eventId: event.id,
          pointsAwarded: pointsToAward,
          newBalance: transaction.balanceAfter
        });
      } catch (error: any) {
        await storage.updateGamingEvent(event.id, {
          status: "failed",
          errorMessage: error.message,
          retryCount: 1,
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Error processing match win:", error);
      res.status(500).json({ message: error.message || "Failed to process match win" });
    }
  });

  app.post('/api/webhooks/gaming/achievement', webhookAuth, async (req, res) => {
    try {
      const result = achievementWebhookSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          issues: result.error.errors
        });
      }
      const { apiKey, userId, gameId, externalEventId, timestamp, achievementData } = result.data;

      // Partner already authenticated by webhookAuth middleware (adds partnerId to req)
      const partnerId = req.partnerId!;
      const partner = await storage.getApiPartner(apiKey);
      if (!partner || partner.id !== partnerId) {
        return res.status(401).json({ message: "Partner ID mismatch" });
      }

      const existingEvent = await storage.getEventByExternalId(partner.id, externalEventId);
      if (existingEvent) {
        return res.json({ message: "Event already processed", eventId: existingEvent.id });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscription = await storage.getSubscription(userId);
      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({ message: "User must have active subscription" });
      }

      const pointsToAward = Math.min(achievementData.pointsAwarded, 100);

      const event = await storage.logGamingEvent({
        partnerId: partner.id,
        userId,
        gameId: gameId || null,
        eventType: "ACHIEVEMENT",
        eventData: achievementData,
        externalEventId,
        pointsAwarded: null,
        transactionId: null,
        errorMessage: null,
      });

      try {
        const transaction = await pointsEngine.awardPoints(
          userId,
          pointsToAward,
          "ACHIEVEMENT",
          event.id,
          "gaming_event",
          achievementData.title || `Achievement - ${partner.name}`
        );

        await storage.updateGamingEvent(event.id, {
          status: "processed",
          pointsAwarded: pointsToAward,
          transactionId: transaction.id,
          processedAt: new Date(),
        });

        res.json({
          success: true,
          eventId: event.id,
          pointsAwarded: pointsToAward,
          newBalance: transaction.balanceAfter
        });
      } catch (error: any) {
        await storage.updateGamingEvent(event.id, {
          status: "failed",
          errorMessage: error.message,
          retryCount: 1,
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Error processing achievement:", error);
      res.status(500).json({ message: error.message || "Failed to process achievement" });
    }
  });

  app.post('/api/webhooks/gaming/tournament', webhookAuth, async (req, res) => {
    try {
      const result = tournamentWebhookSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          issues: result.error.errors
        });
      }
      const { apiKey, userId, gameId, externalEventId, timestamp, tournamentData } = result.data;

      // Partner already authenticated by webhookAuth middleware (adds partnerId to req)
      const partnerId = req.partnerId!;
      const partner = await storage.getApiPartner(apiKey);
      if (!partner || partner.id !== partnerId) {
        return res.status(401).json({ message: "Partner ID mismatch" });
      }

      const existingEvent = await storage.getEventByExternalId(partner.id, externalEventId);
      if (existingEvent) {
        return res.json({ message: "Event already processed", eventId: existingEvent.id });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscription = await storage.getSubscription(userId);
      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({ message: "User must have active subscription" });
      }

      let pointsToAward = 25;
      if (tournamentData.placement === 1) pointsToAward = 100;
      else if (tournamentData.placement === 2) pointsToAward = 75;
      else if (tournamentData.placement === 3) pointsToAward = 50;

      const event = await storage.logGamingEvent({
        partnerId: partner.id,
        userId,
        gameId: gameId || null,
        eventType: "TOURNAMENT_PLACEMENT",
        eventData: tournamentData,
        externalEventId,
        pointsAwarded: null,
        transactionId: null,
        errorMessage: null,
      });

      try {
        const transaction = await pointsEngine.awardPoints(
          userId,
          pointsToAward,
          "TOURNAMENT_PLACEMENT",
          event.id,
          "gaming_event",
          `Tournament placement #${tournamentData.placement} - ${partner.name}`
        );

        await storage.updateGamingEvent(event.id, {
          status: "processed",
          pointsAwarded: pointsToAward,
          transactionId: transaction.id,
          processedAt: new Date(),
        });

        res.json({
          success: true,
          eventId: event.id,
          pointsAwarded: pointsToAward,
          newBalance: transaction.balanceAfter
        });
      } catch (error: any) {
        await storage.updateGamingEvent(event.id, {
          status: "failed",
          errorMessage: error.message,
          retryCount: 1,
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Error processing tournament placement:", error);
      res.status(500).json({ message: error.message || "Failed to process tournament placement" });
    }
  });

  // Referral System Routes
  app.post('/api/referrals/start-trial', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { referralCode } = req.body;

      // Check if user already has trial or subscription
      if (req.dbUser.freeTrialStartedAt) {
        return res.status(400).json({ message: "You've already started a free trial" });
      }

      const subscription = await storage.getSubscription(userId);
      if (subscription && subscription.status === "active") {
        return res.status(400).json({ message: "You already have an active subscription" });
      }

      // Start free trial
      const updatedUser = await storage.startFreeTrial(userId);

      // If user was referred, create referral record
      if (referralCode && referralCode.trim()) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer && referrer.id !== userId) {
          // Check if referral already exists
          const existingReferral = await storage.getReferralByUsers(referrer.id, userId);
          if (!existingReferral) {
            await storage.createReferral({
              referrerId: referrer.id,
              referredUserId: userId,
              activatedAt: new Date(),
            });
          }
        }
      }

      res.json({
        success: true,
        trialEndsAt: updatedUser.freeTrialEndsAt,
        message: `Welcome! Your ${FREE_TRIAL_DURATION_DAYS}-day trial has started.`
      });
    } catch (error: any) {
      console.error("Error starting trial:", error);
      res.status(500).json({ message: error.message || "Failed to start trial" });
    }
  });

  app.get('/api/referrals/my-stats', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Ensure user has a referral code - generate if missing
      let referralCode = req.dbUser.referralCode;
      if (!referralCode) {
        const { generateReferralCode } = await import('./lib/referral');
        referralCode = generateReferralCode();

        // Update user with new code
        await db.update(users)
          .set({ referralCode })
          .where(eq(users.id, userId));

        console.log(`Generated referral code ${referralCode} for user ${userId}`);
      }

      const referrals = await storage.getReferralsByReferrer(userId);
      const completedCount = referrals.filter(r => r.status === 'completed').length;
      const pendingCount = referrals.filter(r => r.status === 'pending').length;

      const { tier, totalPoints } = calculateReferralReward(completedCount);

      res.json({
        referralCode,
        totalReferrals: referrals.length,
        completedReferrals: completedCount,
        pendingReferrals: pendingCount,
        currentTier: tier,
        totalPointsEarned: totalPoints,
        referrals: referrals.map(r => ({
          id: r.id,
          status: r.status,
          username: r.referredUser.username || 'Anonymous',
          createdAt: r.createdAt,
          completedAt: r.completedAt,
          pointsAwarded: r.pointsAwarded,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: error.message || "Failed to fetch referral stats" });
    }
  });

  // Check and award squad milestone bonuses
  app.post('/api/referrals/check-squad-milestones', isAuthenticated, getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const { checkSquadMilestones, SQUAD_MILESTONES } = await import('./lib/referral');

      // Get all user's referrals with dates
      const referrals = await storage.getReferralsByReferrer(userId);
      const completedReferrals = referrals.filter(r => r.status === 'completed');

      // Check which milestones have been earned
      const previouslyAwarded = req.dbUser.squadMilestonesAwarded || [];
      const milestoneResults = checkSquadMilestones(completedReferrals, previouslyAwarded);

      let totalBonusAwarded = 0;
      const newlyEarned = [];

      // Award points for newly earned milestones
      for (const { milestone, earned } of milestoneResults) {
        if (earned) {
          await pointsEngine.awardPoints(
            userId,
            milestone.bonusPoints,
            'squad_milestone',
            userId,
            `Squad Milestone: ${milestone.name}`
          );
          totalBonusAwarded += milestone.bonusPoints;
          newlyEarned.push(milestone.name);
        }
      }

      // Save awarded milestones to prevent duplicate awards (would need schema update for persistence)
      // For MVP, this runs per request - future: store in users.squadMilestonesAwarded

      res.json({
        milestones: SQUAD_MILESTONES,
        userProgress: milestoneResults.map(({ milestone, earned }) => ({
          name: milestone.name,
          description: milestone.description,
          bonusPoints: milestone.bonusPoints,
          earned,
        })),
        newlyEarnedCount: newlyEarned.length,
        totalBonusAwarded,
      });
    } catch (error: any) {
      console.error("Error checking squad milestones:", error);
      res.status(500).json({ message: error.message || "Failed to check squad milestones" });
    }
  });


  app.get('/api/referrals/leaderboard', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getReferralLeaderboard(limit);

      res.json({
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          username: entry.user.username || 'Anonymous',
          referralCount: entry.referralCount,
          totalPoints: entry.totalPoints,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: error.message || "Failed to fetch leaderboard" });
    }
  });

  // Webhook to complete referrals when user subscribes
  app.post('/api/referrals/complete/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Find all pending referrals for this user
      const user = await storage.getUser(userId);
      if (!user || !user.referredBy) {
        return res.json({ message: "No referrals to complete" });
      }

      const referral = await storage.getReferralByUsers(user.referredBy, userId);
      if (!referral || referral.status !== 'pending') {
        return res.json({ message: "Referral already completed or not found" });
      }

      // Get referrer's total completed referrals
      const allReferrals = await storage.getReferralsByReferrer(user.referredBy);
      const completedCount = allReferrals.filter(r => r.status === 'completed').length + 1; // +1 for this new completion

      const { tier, totalPoints } = calculateReferralReward(completedCount);
      const previousReward = calculateReferralReward(completedCount - 1);
      const pointsForThisReferral = totalPoints - previousReward.totalPoints;

      // Award points to referrer
      const transaction = await pointsEngine.awardPoints(
        user.referredBy,
        pointsForThisReferral,
        "REFERRAL",
        referral.id,
        "referral",
        `Referral bonus - ${user.username || 'user'} subscribed`
      );

      // Update referral status
      await storage.updateReferral(referral.id, {
        status: 'completed',
        pointsAwarded: pointsForThisReferral,
        tier: tier?.minReferrals || 0,
        completionReason: 'subscription_started',
        completedAt: new Date(),
      });

      res.json({
        success: true,
        pointsAwarded: pointsForThisReferral,
        message: "Referral completed successfully"
      });
    } catch (error: any) {
      console.error("Error completing referral:", error);
      res.status(500).json({ message: error.message || "Failed to complete referral" });
    }
  });

  // Admin endpoint to manually trigger stream verification (for testing)
  app.post('/api/admin/verify-streams', adminMiddleware, async (req: any, res) => {
    try {
      const { streamingVerifier } = await import("./streamingVerifier");
      await streamingVerifier.checkActiveStreams();
      res.json({ success: true, message: "Stream verification triggered" });
    } catch (error: any) {
      console.error("Error verifying streams:", error);
      res.status(500).json({ message: error.message || "Failed to verify streams" });
    }
  });

  // Admin endpoint to check specific user's stream
  app.post('/api/admin/verify-user-stream/:userId', adminMiddleware, async (req: any, res) => {
    try {
      const { streamingVerifier } = await import("./streamingVerifier");
      await streamingVerifier.checkUserStream(req.params.userId);
      res.json({ success: true, message: "User stream verified" });
    } catch (error: any) {
      console.error("Error verifying user stream:", error);
      res.status(500).json({ message: error.message || "Failed to verify user stream" });
    }
  });

  // Free Tier Routes
  app.get('/api/free-tier/status', getUserMiddleware, async (req: any, res) => {
    try {
      const { getFreeTierStatus } = await import('./lib/freeTier');
      const status = await getFreeTierStatus(req.dbUser.id);
      res.json(status);
    } catch (error: any) {
      console.error("Error getting free tier status:", error);
      res.status(500).json({ message: error.message || "Failed to get free tier status" });
    }
  });

  app.post('/api/free-tier/redeem-trial', getUserMiddleware, async (req: any, res) => {
    try {
      const { redeemBasicTrial } = await import('./lib/freeTier');
      await redeemBasicTrial(req.dbUser.id);
      res.json({
        success: true,
        message: "Basic trial activated! Enjoy 7 days of premium features."
      });
    } catch (error: any) {
      console.error("Error redeeming trial:", error);
      res.status(400).json({ message: error.message || "Failed to redeem trial" });
    }
  });

  // Sponsor Management Routes (Admin Only)
  app.get('/api/admin/sponsors', adminMiddleware, async (req: any, res) => {
    try {
      const allSponsors = await db.select().from(sponsors);
      res.json(allSponsors);
    } catch (error: any) {
      console.error("Error fetching sponsors:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sponsors" });
    }
  });

  app.post('/api/admin/sponsors', adminMiddleware, async (req: any, res) => {
    try {
      const validatedData = insertSponsorSchema.parse(req.body);
      const [newSponsor] = await db.insert(sponsors)
        .values(validatedData)
        .returning();
      res.json(newSponsor);
    } catch (error: any) {
      console.error("Error creating sponsor:", error);
      res.status(400).json({ message: error.message || "Failed to create sponsor" });
    }
  });

  app.patch('/api/admin/sponsors/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertSponsorSchema.partial().parse(req.body);

      const [updatedSponsor] = await db.update(sponsors)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(sponsors.id, id))
        .returning();

      if (!updatedSponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      res.json(updatedSponsor);
    } catch (error: any) {
      console.error("Error updating sponsor:", error);
      res.status(400).json({ message: error.message || "Failed to update sponsor" });
    }
  });

  app.delete('/api/admin/sponsors/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Check if sponsor has ANY challenges (active or historical)
      const allChallenges = await db.select()
        .from(challenges)
        .where(eq(challenges.sponsorId, id));

      if (allChallenges.length > 0) {
        return res.status(400).json({
          message: `Cannot delete sponsor with ${allChallenges.length} linked challenges. Set sponsor to 'inactive' instead.`
        });
      }

      await db.delete(sponsors).where(eq(sponsors.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting sponsor:", error);
      res.status(500).json({ message: error.message || "Failed to delete sponsor" });
    }
  });

  // Sponsor budget management
  app.post('/api/admin/sponsors/:id/add-budget', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }

      const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, id));
      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      const [updated] = await db.update(sponsors)
        .set({
          totalBudget: sponsor.totalBudget + amount,
          updatedAt: new Date()
        })
        .where(eq(sponsors.id, id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error adding sponsor budget:", error);
      res.status(500).json({ message: error.message || "Failed to add budget" });
    }
  });

  // Migration utility endpoints
  app.post('/api/admin/sponsors/migrate', adminMiddleware, async (req: any, res) => {
    try {
      const { backfillSponsors } = await import('./lib/sponsorMigration');
      const result = await backfillSponsors();
      res.json({
        success: true,
        message: `Created ${result.created} sponsors and linked ${result.linked} challenges`
      });
    } catch (error: any) {
      console.error("Error migrating sponsors:", error);
      res.status(500).json({ message: error.message || "Migration failed" });
    }
  });

  app.post('/api/admin/sponsors/sync-budgets', adminMiddleware, async (req: any, res) => {
    try {
      const { syncSponsorBudgets } = await import('./lib/sponsorMigration');
      const updated = await syncSponsorBudgets();
      res.json({
        success: true,
        message: `Synced budgets for ${updated} sponsors`
      });
    } catch (error: any) {
      console.error("Error syncing sponsor budgets:", error);
      res.status(500).json({ message: error.message || "Sync failed" });
    }
  });

  // Sponsor Analytics
  app.get('/api/admin/sponsors/:id/analytics', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Get sponsor
      const [sponsor] = await db.select()
        .from(sponsors)
        .where(eq(sponsors.id, id))
        .limit(1);

      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      // Get all challenges for this sponsor
      const sponsorChallenges = await db.select()
        .from(challenges)
        .where(eq(challenges.sponsorId, id));

      // Calculate aggregate metrics
      const totalChallenges = sponsorChallenges.length;
      const activeChallenges = sponsorChallenges.filter((c: any) => c.isActive).length;
      const totalBudgetAllocated = sponsorChallenges.reduce((sum: number, c: any) => sum + c.totalBudget, 0);
      const totalPointsDistributed = sponsorChallenges.reduce((sum: number, c: any) => sum + c.pointsDistributed, 0);

      // Get completion stats for all sponsor challenges
      const challengeIds = sponsorChallenges.map((c: any) => c.id);
      const completions = challengeIds.length > 0
        ? await db.select()
          .from(challengeCompletions)
          .where(inArray(challengeCompletions.challengeId, challengeIds))
        : [];

      const totalParticipants = new Set(completions.map(c => c.userId)).size;

      // Count unique users who completed (met requirement)
      const completedUsers = new Set(
        completions
          .filter(c => {
            const challenge = sponsorChallenges.find(ch => ch.id === c.challengeId);
            return challenge && c.progress >= challenge.requirementCount;
          })
          .map(c => c.userId)
      );
      const totalCompletions = completedUsers.size;

      // Count unique users who claimed
      const claimedUsers = new Set(
        completions
          .filter(c => c.claimed)
          .map(c => c.userId)
      );
      const totalClaims = claimedUsers.size;

      // Build per-challenge analytics from completions data (no N+1 queries)
      const challengeAnalytics = sponsorChallenges.map((challenge) => {
        const challengeCompletionData = completions.filter(c => c.challengeId === challenge.id);

        // Unique participants for this challenge
        const participants = new Set(challengeCompletionData.map(c => c.userId)).size;

        // Unique users who completed (met requirement)
        const completed = new Set(
          challengeCompletionData
            .filter(c => c.progress >= challenge.requirementCount)
            .map(c => c.userId)
        ).size;

        // Unique users who claimed
        const claimed = new Set(
          challengeCompletionData
            .filter(c => c.claimed)
            .map(c => c.userId)
        ).size;

        const completionRate = participants > 0 ? (completed / participants) * 100 : 0;
        const claimRate = completed > 0 ? (claimed / completed) * 100 : 0;

        return {
          challengeId: challenge.id,
          title: challenge.title,
          isActive: challenge.isActive,
          budget: challenge.totalBudget,
          distributed: challenge.pointsDistributed,
          participants,
          completed,
          claimed,
          completionRate: Math.round(completionRate),
          claimRate: Math.round(claimRate),
          costPerClaim: claimed > 0 ? Math.round(challenge.pointsDistributed / claimed) : 0
        };
      });

      res.json({
        sponsor: {
          id: sponsor.id,
          name: sponsor.name,
          status: sponsor.status
        },
        overview: {
          totalBudget: sponsor.totalBudget,
          spentBudget: sponsor.spentBudget,
          remainingBudget: sponsor.totalBudget - sponsor.spentBudget,
          totalChallenges,
          activeChallenges,
          totalBudgetAllocated,
          totalPointsDistributed,
          totalParticipants,
          totalCompletions,
          totalClaims,
          avgCompletionRate: totalParticipants > 0
            ? Math.round((totalCompletions / totalParticipants) * 100)
            : 0,
          avgClaimRate: totalCompletions > 0
            ? Math.round((totalClaims / totalCompletions) * 100)
            : 0
        },
        challenges: challengeAnalytics
      });
    } catch (error: any) {
      console.error("Error fetching sponsor analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch analytics" });
    }
  });

  // ==================== FOUNDER CONTROLS ====================
  // Import founder controls functionality
  const { adjustUserPoints, getUserAuditLog, getAllAuditLogs, getSystemHealth, checkSpendingLimits } = await import('./founderControls');

  // Manual Point Adjustment
  app.post('/api/admin/points/adjust', adminMiddleware, async (req: any, res) => {
    try {
      const schema = z.object({
        targetUserId: z.string().uuid(),
        amount: z.number().int(),
        reason: z.string().min(5, "Reason must be at least 5 characters"),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: parsed.error.errors
        });
      }

      const { targetUserId, amount, reason } = parsed.data;
      const adminUser = req.dbUser;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;

      const result = await adjustUserPoints(
        adminUser.id,
        adminUser.email || 'unknown',
        targetUserId,
        amount,
        reason,
        ipAddress
      );

      res.json({
        ...result,
        message: amount > 0
          ? `Successfully added ${amount} points`
          : `Successfully removed ${Math.abs(amount)} points`
      });
    } catch (error: any) {
      console.error("Error adjusting points:", error);
      res.status(500).json({ message: error.message || "Failed to adjust points" });
    }
  });

  // Get Audit Log (all or for specific user)
  app.get('/api/admin/audit-log', adminMiddleware, async (req: any, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;

      const logs = userId
        ? await getUserAuditLog(userId, limit)
        : await getAllAuditLogs(limit);

      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: error.message || "Failed to fetch audit log" });
    }
  });

  // System Health Dashboard
  app.get('/api/admin/system-health', adminMiddleware, async (req: any, res) => {
    try {
      const health = await getSystemHealth();
      res.json(health);
    } catch (error: any) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ message: error.message || "Failed to fetch system health" });
    }
  });

  // Check Spending Limits (for testing/debugging)
  app.post('/api/admin/check-spending-limit', adminMiddleware, async (req: any, res) => {
    try {
      const schema = z.object({
        userId: z.string().uuid(),
        rewardValue: z.number().positive(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: parsed.error.errors
        });
      }

      const { userId, rewardValue } = parsed.data;
      const result = await checkSpendingLimits(userId, rewardValue);

      res.json(result);
    } catch (error: any) {
      console.error("Error checking spending limits:", error);
      res.status(500).json({ message: error.message || "Failed to check limits" });
    }
  });

  const tiktokCopySchema = z.object({
    templateId: z.string().min(1)
  });

  app.post('/api/tiktok/track-copy', getUserMiddleware, async (req: any, res) => {
    try {
      const parsed = tiktokCopySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { templateId } = parsed.data;
      const userId = req.dbUser.id;

      // Check if user already earned points for this template
      const existingTransaction = await db.select()
        .from(require('@shared/schema').pointTransactions)
        .where(and(
          eq(require('@shared/schema').pointTransactions.userId, userId),
          eq(require('@shared/schema').pointTransactions.sourceType, 'tiktok_template'),
          eq(require('@shared/schema').pointTransactions.sourceId, templateId)
        ))
        .limit(1);

      if (existingTransaction.length > 0) {
        return res.json({
          pointsAwarded: 0,
          message: "You've already earned points for this template"
        });
      }

      const POINTS_PER_TEMPLATE = 50;
      await pointsEngine.awardPoints(
        userId,
        POINTS_PER_TEMPLATE,
        "CONTENT_CREATION",
        templateId,
        "tiktok_template",
        `Created TikTok content using template #${templateId}`
      );

      res.json({
        pointsAwarded: POINTS_PER_TEMPLATE,
        message: `+${POINTS_PER_TEMPLATE} points earned! Post your content to help grow GG Loop.`
      });
    } catch (error: any) {
      console.error("Error tracking TikTok copy:", error);
      res.status(500).json({ message: error.message || "Failed to track content creation" });
    }
  });

  // ====================
  // AFFILIATE PROGRAM ROUTES
  // ====================

  // GET /api/affiliate/stats - Get current user's affiliate stats
  app.get('/api/affiliate/stats', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Get affiliate application for this user
      const [application] = await db
        .select()
        .from(affiliateApplications)
        .where(eq(affiliateApplications.userId, userId))
        .limit(1);

      // Get user's referral code from users table
      const [user] = await db
        .select({ referralCode: users.referralCode })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // Count total referrals (people this user has referred)
      const referralCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));

      res.json({
        status: application?.status || 'not_applied',
        totalReferrals: referralCount[0]?.count || 0,
        monthlyEarnings: application?.monthlyEarnings || 0,
        totalEarnings: application?.totalEarnings || 0,
        commissionTier: application?.commissionTier || 'standard',
        referralCode: user?.referralCode || '',
      });
    } catch (error: any) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ message: "Failed to fetch affiliate stats" });
    }
  });

  // POST /api/affiliate/apply - Submit affiliate application
  app.post('/api/affiliate/apply', getUserMiddleware, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;

      // Check if user already applied
      const [existing] = await db
        .select()
        .from(affiliateApplications)
        .where(eq(affiliateApplications.userId, userId))
        .limit(1);

      if (existing) {
        return res.status(400).json({ message: "You already have an affiliate application" });
      }

      const schema = z.object({
        platform: z.string().min(1),
        audience: z.string().min(1),
        contentType: z.string().min(1),
        reason: z.string().min(50),
        payoutEmail: z.string().email(),
      });

      const validated = schema.parse(req.body);

      await db.insert(affiliateApplications).values({
        userId,
        status: 'pending',
        applicationData: validated,
        commissionTier: 'standard',
        payoutEmail: validated.payoutEmail,
      });

      res.json({ success: true, message: "Application submitted successfully" });
    } catch (error: any) {
      console.error("Error submitting affiliate application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data" });
      }
      res.status(500).json({ message: error.message || "Failed to submit application" });
    }
  });

  // ADMIN: GET /api/admin/affiliate-stats - Get affiliate program stats
  app.get('/api/admin/affiliate-stats', adminMiddleware, async (req: any, res) => {
    try {
      const totalApplications = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(affiliateApplications);

      const pendingReview = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(affiliateApplications)
        .where(eq(affiliateApplications.status, 'pending'));

      const activeAffiliates = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(affiliateApplications)
        .where(eq(affiliateApplications.status, 'approved'));

      const totalEarnings = await db
        .select({ sum: sql<number>`coalesce(sum(total_earnings), 0)::int` })
        .from(affiliateApplications);

      res.json({
        totalApplications: totalApplications[0]?.count || 0,
        pendingReview: pendingReview[0]?.count || 0,
        activeAffiliates: activeAffiliates[0]?.count || 0,
        totalPaid: totalEarnings[0]?.sum || 0,
      });
    } catch (error: any) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ADMIN: GET /api/admin/affiliates - Get all affiliate applications
  app.get('/api/admin/affiliates', adminMiddleware, async (req: any, res) => {
    try {
      const applications = await db
        .select({
          id: affiliateApplications.id,
          userId: affiliateApplications.userId,
          status: affiliateApplications.status,
          applicationData: affiliateApplications.applicationData,
          commissionTier: affiliateApplications.commissionTier,
          monthlyEarnings: affiliateApplications.monthlyEarnings,
          totalEarnings: affiliateApplications.totalEarnings,
          reviewNotes: affiliateApplications.reviewNotes,
          approvedAt: affiliateApplications.approvedAt,
          createdAt: affiliateApplications.createdAt,
          username: users.username,
          email: users.email,
        })
        .from(affiliateApplications)
        .leftJoin(users, eq(affiliateApplications.userId, users.id))
        .orderBy(desc(affiliateApplications.createdAt));

      const enriched = applications.map(app => ({
        ...app,
        user: {
          id: app.userId,
          username: app.username,
          email: app.email,
        },
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching affiliates:", error);
      res.status(500).json({ message: "Failed to fetch affiliates" });
    }
  });

  // ADMIN: PATCH /api/admin/affiliates/:id - Update affiliate application
  app.patch('/api/admin/affiliates/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        reviewNotes: z.string().optional(),
        commissionTier: z.enum(['standard', 'silver', 'gold', 'platinum']).optional(),
        monthlyEarnings: z.number().int().min(0).optional(),
        totalEarnings: z.number().int().min(0).optional(),
      });

      const validated = schema.parse(req.body);
      const updateData: any = { ...validated, updatedAt: new Date() };

      if (validated.status === 'approved') {
        updateData.approvedAt = new Date();
        updateData.reviewedBy = req.dbUser.id;
      }

      await db
        .update(affiliateApplications)
        .set(updateData)
        .where(eq(affiliateApplications.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating affiliate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update affiliate" });
    }
  });

  // ====================
  // GG LOOP CARES ROUTES
  // ====================

  // PUBLIC: GET /api/charities - Get active charities
  app.get('/api/charities', async (req, res) => {
    try {
      const activeCharities = await db
        .select()
        .from(charities)
        .where(eq(charities.isActive, true))
        .orderBy(charities.featuredOrder);

      res.json(activeCharities);
    } catch (error: any) {
      console.error("Error fetching charities:", error);
      res.status(500).json({ message: "Failed to fetch charities" });
    }
  });

  // PUBLIC: GET /api/charity-campaigns - Get active campaigns with charity data
  app.get('/api/charity-campaigns', async (req, res) => {
    try {
      const activeCampaigns = await db
        .select({
          id: charityCampaigns.id,
          charityId: charityCampaigns.charityId,
          title: charityCampaigns.title,
          description: charityCampaigns.description,
          goalAmount: charityCampaigns.goalAmount,
          currentAmount: charityCampaigns.currentAmount,
          startDate: charityCampaigns.startDate,
          endDate: charityCampaigns.endDate,
          isActive: charityCampaigns.isActive,
          createdAt: charityCampaigns.createdAt,
          charity: charities,
        })
        .from(charityCampaigns)
        .leftJoin(charities, eq(charityCampaigns.charityId, charities.id))
        .where(and(
          eq(charityCampaigns.isActive, true),
          eq(charities.isActive, true)
        ))
        .orderBy(desc(charityCampaigns.createdAt));

      res.json(activeCampaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // ADMIN: GET /api/admin/charities - Get all charities
  app.get('/api/admin/charities', adminMiddleware, async (req: any, res) => {
    try {
      const allCharities = await db
        .select()
        .from(charities)
        .orderBy(charities.featuredOrder);

      res.json(allCharities);
    } catch (error: any) {
      console.error("Error fetching charities:", error);
      res.status(500).json({ message: "Failed to fetch charities" });
    }
  });

  // ADMIN: POST /api/admin/charities - Create new charity
  app.post('/api/admin/charities', adminMiddleware, async (req: any, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string(),
        website: z.string().url().optional().or(z.literal('')),
        logo: z.string().optional(),
        category: z.enum(['gaming', 'education', 'health', 'environment', 'youth', 'other']),
        impactMetric: z.string().optional(),
        impactValue: z.string().optional(),
        totalDonated: z.number().int().min(0).default(0),
        featuredOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
      });

      const validated = schema.parse(req.body);

      const result = await db
        .insert(charities)
        .values(validated)
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error creating charity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid charity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create charity" });
    }
  });

  // ADMIN: PATCH /api/admin/charities/:id - Update charity
  app.patch('/api/admin/charities/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
        logo: z.string().optional(),
        category: z.enum(['gaming', 'education', 'health', 'environment', 'youth', 'other']).optional(),
        impactMetric: z.string().optional(),
        impactValue: z.string().optional(),
        totalDonated: z.number().int().min(0).optional(),
        featuredOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = schema.parse(req.body);

      await db
        .update(charities)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(charities.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating charity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update charity" });
    }
  });

  // ADMIN: DELETE /api/admin/charities/:id - Delete charity
  app.delete('/api/admin/charities/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      await db
        .delete(charities)
        .where(eq(charities.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting charity:", error);
      res.status(500).json({ message: "Failed to delete charity" });
    }
  });

  // ADMIN: GET /api/admin/charity-campaigns - Get all campaigns
  app.get('/api/admin/charity-campaigns', adminMiddleware, async (req: any, res) => {
    try {
      const allCampaigns = await db
        .select({
          id: charityCampaigns.id,
          charityId: charityCampaigns.charityId,
          title: charityCampaigns.title,
          description: charityCampaigns.description,
          goalAmount: charityCampaigns.goalAmount,
          currentAmount: charityCampaigns.currentAmount,
          startDate: charityCampaigns.startDate,
          endDate: charityCampaigns.endDate,
          isActive: charityCampaigns.isActive,
          createdAt: charityCampaigns.createdAt,
          charity: charities,
        })
        .from(charityCampaigns)
        .leftJoin(charities, eq(charityCampaigns.charityId, charities.id))
        .orderBy(desc(charityCampaigns.createdAt));

      res.json(allCampaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // ADMIN: POST /api/admin/charity-campaigns - Create new campaign
  app.post('/api/admin/charity-campaigns', adminMiddleware, async (req: any, res) => {
    try {
      const schema = z.object({
        charityId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string(),
        goalAmount: z.number().positive(),
        currentAmount: z.number().default(0),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isActive: z.boolean().default(true),
      });

      const validated = schema.parse(req.body);

      const result = await db
        .insert(charityCampaigns)
        .values({
          ...validated,
          startDate: validated.startDate ? new Date(validated.startDate) : null,
          endDate: validated.endDate ? new Date(validated.endDate) : null,
        })
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data" });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // ADMIN: PATCH /api/admin/charity-campaigns/:id - Update campaign
  app.patch('/api/admin/charity-campaigns/:id', adminMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        charityId: z.string().uuid().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        goalAmount: z.number().optional(),
        currentAmount: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = schema.parse(req.body);

      await db
        .update(charityCampaigns)
        .set({
          ...validated,
          startDate: validated.startDate ? new Date(validated.startDate) : undefined,
          endDate: validated.endDate ? new Date(validated.endDate) : undefined,
          updatedAt: new Date()
        })
        .where(eq(charityCampaigns.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  const httpServer = createServer(app);

  // Get referral leaderboard
  app.get("/api/referrals/leaderboard", async (req, res) => {
    try {
      const leaderboardData = await db
        .select({
          referrerId: referrals.referrerId,
          count: sql<number>`count(*)`,
          username: users.username,
          totalPoints: users.totalPoints,
          profileImageUrl: users.profileImageUrl,
        })
        .from(referrals)
        .leftJoin(users, eq(referrals.referrerId, users.id))
        .groupBy(referrals.referrerId, users.username, users.totalPoints, users.profileImageUrl)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      const formattedLeaderboard = leaderboardData.map((entry, index) => ({
        rank: index + 1,
        username: entry.username || "Unknown",
        referralCount: Number(entry.count),
        totalPoints: entry.totalPoints || 0,
        profileImageUrl: entry.profileImageUrl,
      }))

      res.json({ leaderboard: formattedLeaderboard });
    } catch (error) {
      console.error("Error fetching referral leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Admin Routes (Founder Control Pack)
  app.use("/api/admin", adminRouter);

  return httpServer;
}
