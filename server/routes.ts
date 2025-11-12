import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  userGames, riotAccounts, sponsors, insertSponsorSchema, challenges, 
  challengeCompletions, insertChallengeSchema, insertChallengeCompletionSchema,
  insertGameSchema, insertUserGameSchema, insertLeaderboardEntrySchema, 
  insertAchievementSchema, insertUserRewardSchema,
  matchWinWebhookSchema, achievementWebhookSchema, tournamentWebhookSchema,
  insertReferralSchema, processedRiotMatches
} from "@shared/schema";
import { and, eq, sql, inArray, desc } from "drizzle-orm";
import { setupAuth, isAuthenticated } from "./oauth";
import { setupTwitchAuth } from "./twitchAuth";
import { z } from "zod";
import Stripe from "stripe";
import { pointsEngine } from "./pointsEngine";
import { createWebhookSignatureMiddleware } from "./webhookSecurity";
import { twitchAPI } from "./lib/twitch";
import { calculateReferralReward, FREE_TRIAL_DURATION_DAYS } from "./lib/referral";
import crypto from 'crypto';
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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

  // Get user's linked Riot account
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

      res.json({
        linked: true,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        region: riotAccount.region,
        verifiedAt: riotAccount.createdAt,
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
      
      // Server-side calculation of pointsSpent (security critical)
      const validated = insertUserRewardSchema.parse({ 
        userId, 
        rewardId,
        pointsSpent: reward.pointsCost
      });
      
      const userReward = await storage.redeemReward(validated);
      
      // IMPORTANT: Notification for fulfillment
      console.log(`
🎁 REWARD REDEMPTION ALERT 🎁
━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: ${req.dbUser.email} (${req.dbUser.firstName || 'Unknown'})
Reward: ${reward.title}
Points Spent: ${reward.pointsCost}
Real Value: $${reward.realValue}
Fulfillment Type: ${reward.fulfillmentType}
Time: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION NEEDED: Buy and email gift card code to ${req.dbUser.email}
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

  app.post('/api/subscription/cancel', getUserMiddleware, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe not configured" });
      }

      const userId = req.dbUser.id;
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await storage.updateSubscription(subscription.id, {
        status: "canceling"
      });

      res.json({ message: "Subscription will be canceled at period end" });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
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

            const basePoints = existingSub.tier === "premium" ? 300 : 150;
            
            await pointsEngine.awardPoints(
              userId,
              basePoints,
              "SUBSCRIPTION_MONTHLY",
              invoice.id,
              "invoice",
              `Monthly subscription points - ${existingSub.tier}`
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
      const tierMultiplier = subscription.tier === "premium" ? 1.5 : 1.0;
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

  const httpServer = createServer(app);

  return httpServer;
}
