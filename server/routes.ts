import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  users, userGames, riotAccounts, sponsors, insertSponsorSchema, challenges, 
  challengeCompletions, insertChallengeSchema, insertChallengeCompletionSchema,
  insertGameSchema, insertUserGameSchema, insertLeaderboardEntrySchema, 
  insertAchievementSchema, insertRewardSchema, insertUserRewardSchema, userRewards,
  matchWinWebhookSchema, achievementWebhookSchema, tournamentWebhookSchema,
  insertReferralSchema, processedRiotMatches
} from "@shared/schema";
import { and, eq, sql, inArray, desc } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "./oauth";
import { setupTwitchAuth } from "./twitchAuth";
import { z } from "zod";
import Stripe from "stripe";
import { verifyPayPalSubscription, cancelPayPalSubscription } from "./paypal";
import { pointsEngine } from "./pointsEngine";
import { createWebhookSignatureMiddleware } from "./webhookSecurity";
import { twitchAPI } from "./lib/twitch";
import { calculateReferralReward, FREE_TRIAL_DURATION_DAYS } from "./lib/referral";
import crypto from 'crypto';
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { tangoCardService } from "./tangoCardService";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

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
    
    // MVP: Owner email check (replace with proper admin flag later)
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

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  setupTwitchAuth(app);
  
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

  // Guest account creation
  app.post('/api/auth/guest', async (req: any, res) => {
    try {
      const { email, game, riotId, tagLine, region } = req.body;
      
      if (!email || !game || !riotId || !tagLine || !region) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Generate UUID-based username for guest
      const guestId = crypto.randomUUID();
      const guestUsername = `guest_${guestId.split('-')[0]}`;
      
      // Verify Riot account exists and get PUUID
      const { RiotApiService } = await import('./riotApi');
      const riotApi = new RiotApiService();
      
      let account;
      try {
        account = await riotApi.verifyAccount(riotId, tagLine, region);
      } catch (error) {
        return res.status(400).json({ 
          message: `Could not verify Riot account "${riotId}#${tagLine}" in ${region} region. Please check your Riot ID and try again.` 
        });
      }
      
      // Create guest user with null oidcSub
      const user = await storage.createUser({
        oidcSub: null,
        email,
        username: guestUsername,
        firstName: riotId,
        lastName: `#${tagLine}`,
        profileImageUrl: null,
      });
      
      // Link Riot account to user
      await storage.linkRiotAccount(user.id, game, {
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        region
      });
      
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
      
      const redirectUri = `${process.env.REPL_ID ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/api/twitch/callback`;
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
      
      const redirectUri = `${process.env.REPL_ID ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/api/twitch/callback`;
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
      res.status(500).json({ 
        message: error.message || 'Failed to verify Riot account. Please check your Riot ID and try again.' 
      });
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
      const claimedRewards = await storage.getUserRewards(userId);
      const claimedBadges = claimedRewards
        .filter(cr => cr.reward.fulfillmentType === "automatic" && cr.status === "pending")
        .map(cr => ({
          id: cr.id,
          title: cr.reward.title,
          redeemedAt: cr.redeemedAt
        }));

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          totalPoints: user.totalPoints,
          gamesConnected: user.gamesConnected,
          isFounder: user.isFounder,
          founderNumber: user.founderNumber,
          twitchUsername: user.twitchUsername,
          createdAt: user.createdAt,
        },
        achievements,
        leaderboardRankings,
        stats: {
          totalAchievements: allAchievements.length,
          totalMatchesPlayed: 0, // TODO: Add match tracking
          avgRank,
          joinedDaysAgo,
        },
        claimedBadges
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
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

  // Link Riot account for LoL/Valorant verification
  app.post('/api/riot/link-account', getUserMiddleware, async (req: any, res) => {
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
      
      const accountIds = userRiotAccounts.map(acc => acc.id);
      
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
      
      const formattedMatches = matches.map(m => ({
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

  // Tango Card Catalog Endpoint
  app.get('/api/tango/catalog', async (req, res) => {
    try {
      const catalog = await tangoCardService.getCatalog();
      
      // Transform Tango items to match our shop format
      const transformedCatalog = catalog.map(item => ({
        id: item.utid,
        utid: item.utid,
        title: item.rewardName,
        description: item.description || `${item.rewardType} - ${item.currencyCode}`,
        pointsCost: item.faceValue * 100, // Convert dollars to points (e.g., $25 = 2,500 points)
        category: item.rewardType,
        imageUrl: null,
        stock: null, // Tango has unlimited stock
        minValue: item.minValue,
        maxValue: item.maxValue,
        valueType: item.valueType,
        isExpirable: item.isExpirable,
      }));

      res.json(transformedCatalog);
    } catch (error) {
      console.error("Error fetching Tango catalog:", error);
      res.status(500).json({ message: "Failed to fetch catalog" });
    }
  });

  // Tango Card Redemption Endpoint
  app.post('/api/tango/redeem', getUserMiddleware, async (req: any, res) => {
    try {
      const { utid, amount } = z.object({
        utid: z.string(),
        amount: z.number().positive(),
      }).parse(req.body);

      const userId = req.dbUser.id;
      const userEmail = req.dbUser.email;

      if (!userEmail) {
        return res.status(400).json({ message: "User email required for redemption" });
      }

      // Get item details
      const item = await tangoCardService.getItemByUtid(utid);
      if (!item) {
        return res.status(404).json({ message: "Item not found in catalog" });
      }

      // Calculate points cost
      const pointsCost = amount * 100; // $1 = 100 points

      // Check if user has enough points
      if (req.dbUser.totalPoints < pointsCost) {
        return res.status(400).json({ 
          message: "Insufficient points",
          required: pointsCost,
          available: req.dbUser.totalPoints
        });
      }

      // Place order with Tango Card
      const order = await tangoCardService.placeOrder(utid, amount, userEmail);

      // Deduct points using points engine
      await pointsEngine.spendPoints(
        userId,
        pointsCost,
        'TANGO_REDEMPTION',
        utid,
        'tango_card',
        `Redeemed ${item.rewardName} - $${amount}`,
        db
      );

      // Record redemption in database (using raw insert since this is a Tango item)
      const [userReward] = await db.insert(userRewards).values({
        userId,
        rewardId: utid,
        pointsSpent: pointsCost,
        status: 'fulfilled',
        trackingInfo: order.referenceOrderID,
      }).returning();

      res.json({
        success: true,
        order,
        pointsDeducted: pointsCost,
        remainingPoints: req.dbUser.totalPoints - pointsCost,
      });
    } catch (error: any) {
      console.error("Error redeeming Tango item:", error);
      res.status(500).json({ message: error.message || "Failed to redeem item" });
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
      
      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      // Check if user has linked Riot account for LoL/Valorant
      const riotAccount = await storage.getRiotAccount(userId, gameId);
      
      if (!riotAccount || !riotAccount.riotPuuid) {
        return res.status(400).json({ 
          message: 'Please link your Riot account first to verify wins and earn points!' 
        });
      }

      // AUTO-VERIFY via Riot API
      try {
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
            await db.transaction(async (tx) => {
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

      } catch (apiError: any) {
        console.error("Riot API verification error:", apiError);
        return res.status(500).json({ 
          message: 'Unable to verify match with Riot API. Please try again later.' 
        });
      }
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
      const enriched = await Promise.all(activeChallenges.map(async (challenge) => {
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
      const result = await db.transaction(async (tx) => {
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
        const reservedBudget = activeChallenges.reduce((sum, c) => 
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

  app.post('/api/create-checkout-session', getUserMiddleware, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
      }

      const user = req.dbUser;

      const { tier = "basic" } = req.body;
      
      let priceId: string | undefined;
      if (tier === "basic") {
        priceId = process.env.STRIPE_BASIC_PRICE_ID;
      } else if (tier === "pro") {
        priceId = process.env.STRIPE_PRO_PRICE_ID;
      } else if (tier === "elite") {
        priceId = process.env.STRIPE_ELITE_PRICE_ID;
      } else {
        return res.status(400).json({ message: `Invalid tier: ${tier}` });
      }

      if (!priceId) {
        return res.status(400).json({ message: `Price ID not configured for ${tier} tier` });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId: user.id }
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.id, customerId);
      }

      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${baseUrl}/subscription/success`,
        cancel_url: `${baseUrl}/subscription/cancel`,
        metadata: { userId: user.id, tier },
        subscription_data: {
          metadata: { userId: user.id, tier }
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: error.message || "Failed to create checkout session" });
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
              stripeEventId: `${eventId}_failed`,
              eventData: {
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
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = existingSubscription.id;
        
        // Log subscription update event with stable ID
        await storage.logSubscriptionEvent({
          subscriptionId: existingSubscription.id,
          eventType: "subscription.updated",
          stripeEventId: eventId,
          eventData: {
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
          stripeSubscriptionId: subscriptionId,
          currentPeriodStart: currentDate,
          currentPeriodEnd: nextBillingDate,
        });
        subscriptionDbId = newSub.id;
        
        // Log subscription created event with stable ID
        await storage.logSubscriptionEvent({
          subscriptionId: newSub.id,
          eventType: "subscription.created",
          stripeEventId: eventId,
          eventData: {
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
            stripeEventId: `${eventId}_error`,
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

  app.post('/api/subscription/cancel', getUserMiddleware, async (req: any, res) => {
    const userId = req.dbUser.id;
    
    try {
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Generate stable event ID for deduplication
      const eventId = `cancel_${subscription.stripeSubscriptionId}_${userId}`;
      
      // Check if cancellation already processed
      const existingEvent = await storage.checkEventProcessed(eventId);
      if (existingEvent) {
        console.log(`Subscription ${subscription.stripeSubscriptionId} already being canceled`);
        return res.json({ message: "Subscription cancellation already in progress" });
      }

      if (subscription.stripeSubscriptionId) {
        const paypalResult = await cancelPayPalSubscription(
          subscription.stripeSubscriptionId,
          "User requested cancellation"
        );
        
        if (!paypalResult.success && stripe) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
          });
        }
      }

      await storage.updateSubscription(subscription.id, {
        status: "canceling"
      });
      
      // Log subscription cancellation event with stable ID
      await storage.logSubscriptionEvent({
        subscriptionId: subscription.id,
        eventType: "subscription.canceled",
        stripeEventId: eventId,
        eventData: {
          tier: subscription.tier,
          paypalSubscriptionId: subscription.stripeSubscriptionId,
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
          const eventId = `cancel_${subscription.stripeSubscriptionId}_${userId}`;
          await storage.logSubscriptionEvent({
            subscriptionId: subscription.id,
            eventType: "subscription.cancel_failed",
            stripeEventId: `${eventId}_error`,
            eventData: {
              error: error.message,
              tier: subscription.tier,
              paypalSubscriptionId: subscription.stripeSubscriptionId,
            },
          });
        }
      } catch (logError) {
        console.error("Failed to log cancellation error:", logError);
      }
      
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  app.post('/api/webhooks/stripe', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      const eventExists = await storage.checkEventProcessed(event.id);
      if (eventExists) {
        console.log(`Event ${event.id} already processed, skipping`);
        return res.json({ received: true, status: "duplicate" });
      }

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const userId = subscription.metadata?.userId;
          const tier = subscription.metadata?.tier || "basic";

          if (!userId) {
            console.error("No userId in subscription metadata");
            break;
          }

          const periodStart = subscription.currentPeriod?.start || subscription.current_period_start;
          const periodEnd = subscription.currentPeriod?.end || subscription.current_period_end;

          let existingSub = await storage.getSubscription(userId);
          
          if (existingSub) {
            existingSub = await storage.updateSubscription(existingSub.id, {
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              tier,
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date()
            });
          } else {
            existingSub = await storage.createSubscription({
              userId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              tier,
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date()
            });
          }

          await storage.logSubscriptionEvent({
            subscriptionId: existingSub.id,
            eventType: event.type,
            stripeEventId: event.id,
            eventData: event.data.object as any
          });

          // Complete referrals when user subscribes
          if (subscription.status === 'active') {
            const user = await storage.getUser(userId);
            if (user?.referredBy) {
              const referral = await storage.getReferralByUsers(user.referredBy, userId);
              if (referral && referral.status === 'pending') {
                const allReferrals = await storage.getReferralsByReferrer(user.referredBy);
                const completedCount = allReferrals.filter(r => r.status === 'completed').length + 1;
                
                const { tier, totalPoints } = calculateReferralReward(completedCount);
                const previousReward = calculateReferralReward(completedCount - 1);
                const pointsForThisReferral = totalPoints - previousReward.totalPoints;

                await pointsEngine.awardPoints(
                  user.referredBy,
                  pointsForThisReferral,
                  "REFERRAL",
                  referral.id,
                  "referral",
                  `Referral bonus - ${user.username || 'user'} subscribed`
                );

                await storage.updateReferral(referral.id, {
                  status: 'completed',
                  pointsAwarded: pointsForThisReferral,
                  tier: tier?.minReferrals || 0,
                  completionReason: 'subscription_started',
                  completedAt: new Date(),
                });
              }
            }
          }

          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const userId = subscription.metadata?.userId;

          if (!userId) break;

          const existingSub = await storage.getSubscription(userId);
          if (existingSub) {
            await storage.logSubscriptionEvent({
              subscriptionId: existingSub.id,
              eventType: event.type,
              stripeEventId: event.id,
              eventData: event.data.object as any
            });

            await storage.updateSubscription(existingSub.id, {
              status: "canceled"
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          
          // Only process regular subscription invoices (initial + renewals), skip prorations/upgrades
          const validBillingReasons = ['subscription_create', 'subscription_cycle'];
          if (invoice.billing_reason && !validBillingReasons.includes(invoice.billing_reason)) {
            console.log(`Skipping invoice ${invoice.id} with billing_reason: ${invoice.billing_reason}`);
            break;
          }
          
          const subscriptionId = invoice.subscription 
            || (invoice.lines?.data?.[0]?.subscription);
          
          if (!subscriptionId) {
            console.log("No subscription ID found in invoice");
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = (subscription as any).metadata?.userId;

          if (!userId) {
            console.log("No userId in subscription metadata");
            break;
          }

          const existingSub = await storage.getSubscription(userId);
          if (existingSub) {
            await storage.logSubscriptionEvent({
              subscriptionId: existingSub.id,
              eventType: event.type,
              stripeEventId: event.id,
              eventData: event.data.object as any
            });

            // Award monthly subscription points (compliance-friendly model)
            await pointsEngine.awardMonthlySubscriptionPoints(
              userId,
              existingSub.tier,
              invoice.id
            );
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          
          const subscriptionId = invoice.subscription 
            || (invoice.lines?.data?.[0]?.subscription);

          if (!subscriptionId) {
            console.log("No subscription ID found in invoice");
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = (subscription as any).metadata?.userId;

          if (!userId) {
            console.log("No userId in subscription metadata");
            break;
          }

          const existingSub = await storage.getSubscription(userId);
          if (existingSub) {
            await storage.logSubscriptionEvent({
              subscriptionId: existingSub.id,
              eventType: event.type,
              stripeEventId: event.id,
              eventData: event.data.object as any
            });

            await storage.updateSubscription(existingSub.id, {
              status: "past_due"
            });
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
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
      
      const referrals = await storage.getReferralsByReferrer(userId);
      const completedCount = referrals.filter(r => r.status === 'completed').length;
      const pendingCount = referrals.filter(r => r.status === 'pending').length;
      
      const { tier, totalPoints } = calculateReferralReward(completedCount);

      res.json({
        referralCode: req.dbUser.referralCode,
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
      const activeChallenges = sponsorChallenges.filter(c => c.isActive).length;
      const totalBudgetAllocated = sponsorChallenges.reduce((sum, c) => sum + c.totalBudget, 0);
      const totalPointsDistributed = sponsorChallenges.reduce((sum, c) => sum + c.pointsDistributed, 0);
      
      // Get completion stats for all sponsor challenges
      const challengeIds = sponsorChallenges.map(c => c.id);
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

  const httpServer = createServer(app);

  return httpServer;
}
