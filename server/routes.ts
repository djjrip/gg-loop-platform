import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertGameSchema, insertUserGameSchema, insertLeaderboardEntrySchema, 
  insertAchievementSchema, insertUserRewardSchema,
  matchWinWebhookSchema, achievementWebhookSchema, tournamentWebhookSchema
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import { pointsEngine } from "./pointsEngine";
import { createWebhookSignatureMiddleware } from "./webhookSecurity";
import { twitchAPI } from "./lib/twitch";
import crypto from 'crypto';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

const getUserMiddleware = async (req: any, res: any, next: any) => {
  try {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const oidcSub = req.user.claims.sub;
    const dbUser = await storage.getUserByOidcSub(oidcSub);
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  
  // HMAC signature validation middleware for gaming webhooks
  const webhookAuth = createWebhookSignatureMiddleware(storage);

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const oidcSub = req.user.claims.sub;
      const user = await storage.getUserByOidcSub(oidcSub);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      
      const oidcSub = req.user.claims.sub;
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

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          totalPoints: user.totalPoints,
          gamesConnected: user.gamesConnected,
          createdAt: user.createdAt,
        },
        achievements,
        leaderboardRankings,
        stats: {
          totalAchievements: allAchievements.length,
          totalMatchesPlayed: 0, // TODO: Add match tracking
          avgRank,
          joinedDaysAgo,
        }
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
      const { gameId, matchType, notes } = req.body;
      
      if (!gameId || !matchType) {
        return res.status(400).json({ message: "Game ID and match type are required" });
      }

      // For now, auto-approve and award points based on match type
      // In production, this would require manual review
      const pointsMap: Record<string, number> = {
        'win': 10,
        'ranked': 15,
        'tournament': 50,
      };
      
      const pointsAwarded = pointsMap[matchType] || 10;
      
      // Create submission (auto-approved for MVP)
      const submission = await storage.createMatchSubmission({
        userId,
        gameId,
        matchType,
        notes: notes || null,
        screenshotUrl: null, // File upload will be added later
      });

      // Auto-approve and award points
      await storage.updateMatchSubmission(submission.id, {
        status: 'approved',
        pointsAwarded,
        reviewedAt: new Date(),
      });

      // Award points using points engine
      await pointsEngine.awardPoints(
        userId,
        pointsAwarded,
        'MATCH_WIN',
        submission.id,
        'match_submission',
        `Match win: ${matchType}`
      );

      res.json({ success: true, pointsAwarded });
    } catch (error: any) {
      console.error("Error creating match submission:", error);
      res.status(500).json({ message: error.message || "Failed to submit match" });
    }
  });

  app.post('/api/create-checkout-session', getUserMiddleware, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
      }

      const user = req.dbUser;

      const { tier = "basic" } = req.body;
      const priceId = tier === "premium" 
        ? process.env.STRIPE_PREMIUM_PRICE_ID 
        : process.env.STRIPE_BASIC_PRICE_ID;

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

  const httpServer = createServer(app);

  return httpServer;
}
