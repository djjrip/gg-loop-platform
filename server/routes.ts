import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertGameSchema, insertUserGameSchema, insertLeaderboardEntrySchema, 
  insertAchievementSchema, insertUserRewardSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.get('/api/user/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userGames = await storage.getUserGames(userId);
      res.json(userGames);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.status(500).json({ message: "Failed to fetch user games" });
    }
  });

  app.post('/api/user/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/user/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/user/rewards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRewards = await storage.getUserRewards(userId);
      res.json(userRewards);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      res.status(500).json({ message: "Failed to fetch user rewards" });
    }
  });

  app.post('/api/user/rewards/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertUserRewardSchema.parse({ ...req.body, userId });
      const userReward = await storage.redeemReward(validated);
      res.json(userReward);
    } catch (error: any) {
      console.error("Error redeeming reward:", error);
      res.status(400).json({ message: error.message || "Failed to redeem reward" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
