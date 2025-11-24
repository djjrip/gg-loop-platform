import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { twitchErrorLogger } from "./middleware/twitchErrorLogger";
import { setupVite, serveStatic, log } from "./vite";

console.log("Starting server... (Arctic Fix v3 - Force Redeploy)");

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: string
  }
}
app.use(express.json({
  verify: (req, _res, buf, encoding) => {
    req.rawBody = buf.toString((encoding as BufferEncoding) || 'utf8');
  }
}));
app.use(twitchErrorLogger);
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '8080', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);

    // Start streaming verification monitoring
    import("./streamingVerifier").then(({ streamingVerifier }) => {
      streamingVerifier.startMonitoring();
    }).catch((err) => {
      console.error("Failed to start streaming verifier:", err);
    });

    // NOTE: Points expiration disabled for beta launch
    // TODO: Implement proper FIFO allocation tracking post-beta
    // See server/pointsExpirationService.ts for details

    // Start Riot match sync service with achievement detection
    Promise.all([
      import("./matchSyncService"),
      import("./storage")
    ]).then(([{ startMatchSyncService, stopMatchSyncService, initializeAchievementDetector }, { storage }]) => {
      // Initialize achievement detector with storage instance
      initializeAchievementDetector(storage);

      // Start match sync service
      startMatchSyncService();

      // Graceful shutdown handlers
      process.on('SIGTERM', () => {
        log('SIGTERM received, stopping match sync service...');
        stopMatchSyncService();
      });

      process.on('SIGINT', () => {
        log('SIGINT received, stopping match sync service...');
        stopMatchSyncService();
      });

      server.on('close', () => {
        stopMatchSyncService();
      });
    }).catch((err) => {
      console.error("Failed to start match sync service:", err);
    });
  });
})();
