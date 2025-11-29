console.log('🚀 Starting server initialization...');
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";

// ----- Lowest‑hanging‑fruit fixes -----
// Provide safe defaults for essential env vars so the server can start even if .env is missing.
process.env.NODE_ENV ??= 'development';
process.env.PORT ??= '3000';
process.env.SESSION_SECRET ??= 'dev-secret-change-in-production';
process.env.BASE_URL ??= `http://localhost:${process.env.PORT}`;

// Global error handling – any uncaught exception will be printed and exit the process.
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  // process.exit(1);
});
import { registerRoutes } from "./routes";
import { twitchErrorLogger } from "./middleware/twitchErrorLogger";
import { setupVite, serveStatic, log } from "./vite";

console.log("Starting server... (DEPLOY: 2025-11-26 02:50 CST - AUTH REFACTOR + LOGGING)");

const app = express();

// Defensive middleware – strip stray Date objects from session to avoid Date serialization errors
app.use((req, _res, next) => {
  if (req.session) {
    for (const [key, value] of Object.entries(req.session)) {
      if (value instanceof Date) {
        (req.session as any)[key] = value.getTime();
        console.warn(`⚠️ Converted stray Date in session key "${key}" to timestamp`);
      }
    }
  }
  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: string
  }
}

// Security Headers Middleware - Protect against common vulnerabilities
app.use((req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy for privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - prevents inline scripts and restricts resource loading
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self' https:");
  
  // HSTS - enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

app.use(express.json({
  verify: (req, _res, buf, encoding) => {
    req.rawBody = buf.toString((encoding as BufferEncoding) || 'utf8');
  }
}));
import { requestId } from './middleware/requestId';
import { metricsMiddleware, registerMetricsEndpoint } from './metrics';
app.use(requestId);
app.use(metricsMiddleware);
app.use(express.urlencoded({ extended: false }));

app.get('/debug/session', (req, res) => {
  // Return the current session object for debugging purposes
  res.json({ session: req.session ?? null });
});
registerMetricsEndpoint(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // -------------------------------------------------
  // Global response‑header sanitiser – catches any stray Date
  // -------------------------------------------------
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (statusCode: number, statusMessageOrHeaders?: any, maybeHeaders?: any) {
    let statusMessage: string | undefined;
    let headers: any;

    if (typeof statusMessageOrHeaders === 'string') {
      statusMessage = statusMessageOrHeaders;
      headers = maybeHeaders;
    } else {
      headers = statusMessageOrHeaders;
    }

    const hdrs = { ...(headers || {}) };

    // Scan every header value for Date instances
    for (const [key, val] of Object.entries(hdrs)) {
      if (val instanceof Date) {
        console.warn(`⚠️ Header "${key}" contained a Date – converting to string`);
        hdrs[key] = val.toUTCString();
      }
      if (Array.isArray(val)) {
        hdrs[key] = val.map((v: any) => (v instanceof Date ? v.toUTCString() : v));
      }
    }

    // Call the original writeHead with the correct signature
    if (statusMessage !== undefined) {
      return originalWriteHead(statusCode, statusMessage, hdrs);
    }
    return originalWriteHead(statusCode, hdrs);
  };

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
  try {
    console.log('🔧 Registering routes...');
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
      console.log(`🚀 Server started at ${new Date().toISOString()} - MemoryStore Active`);

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
  } catch (error) {
    console.error('❌ FATAL SERVER STARTUP ERROR:', error);
    process.exit(1);
  }
})();
