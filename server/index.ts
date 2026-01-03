console.log('🚀 Starting server initialization...');
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";

// ----- CRITICAL: Import alerts FIRST for error handlers -----
// Must be imported before error handler registration to avoid 'Cannot access alerts_1 before initialization'
import { notify, type AlertPayload } from './alerts';

// ----- Set Environment Defaults FIRST -----
// Provide safe defaults for essential env vars so the server can start even if .env is missing.
process.env.NODE_ENV ??= 'development';
process.env.PORT ??= '3000';
// SESSION_SECRET: handled by serverStartupValidator (auto-generates secure value if missing)
process.env.BASE_URL ??= `http://localhost:${process.env.PORT}`;

// ----- Security Validation -----
// Validate critical environment variables after defaults are set
import { enforceSecureStartup } from './serverStartupValidator';
enforceSecureStartup();
import { validateRequiredEnv, logEnvChecks } from './envValidation';
logEnvChecks(validateRequiredEnv());

// Global error handling – graceful shutdown on fatal errors
// Note: notify is now safely available as it was imported above
process.on('uncaughtException', async (err) => {
  console.error('❌ FATAL: Uncaught Exception:', err);
  try {
    if (typeof notify === 'function') {
      await notify({ severity: 'critical', source: 'server.uncaughtException', message: `Server crash: ${err.message}` });
    }
  } catch (notifyError) {
    console.error('Failed to send crash alert:', notifyError);
  }
  // Allow time for logging before exit
  setTimeout(() => {
    console.error('Exiting due to uncaught exception...');
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', async (reason) => {
  console.error('❌ FATAL: Unhandled Rejection:', reason);
  try {
    if (typeof notify === 'function') {
      await notify({ severity: 'critical', source: 'server.unhandledRejection', message: `Unhandled rejection: ${reason}` });
    }
  } catch (notifyError) {
    console.error('Failed to send rejection alert:', notifyError);
  }
  // Allow time for logging before exit
  setTimeout(() => {
    console.error('Exiting due to unhandled rejection...');
    process.exit(1);
  }, 1000);
});
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { startTwitterAutomation } from "./services/twitter";
import { twitchErrorLogger } from "./middleware/twitchErrorLogger";
import { serveStatic, log } from "./staticServer";
import { getMetrics, setHealthStatus } from './monitoring';
import { storage } from './storage';
import bedrockRoutes from './bedrock-routes';

console.log("Starting server... (DEPLOY: 2025-11-26 02:50 CST - AUTH REFACTOR + LOGGING)");

const app = express();

// CORS - MUST BE FIRST
import cors from "cors";
const corsOptions = {
  origin: '*', // NUCLEAR OPTION: Allow keys to open all doors momentarily to confirm connectivity
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS moved to top

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

  // Content Security Policy - allows PayPal SDK and payment widgets
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://www.paypalobjects.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://*.paypal.com; img-src 'self' https: data: blob:; font-src 'self' https:; connect-src 'self' https: wss:; frame-src https://*.paypal.com; child-src https://*.paypal.com blob:");

  // HSTS - enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});
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
    // PHASE 1: Schema Reconciliation (CRITICAL - must run before routes)
    console.log('🔍 Checking database schema...');
    try {
      const { reconcileSubscriptionSchema } = await import('./schemaReconciliation');
      await reconcileSubscriptionSchema();
    } catch (schemaError: any) {
      console.warn('⚠️ Schema reconciliation failed, continuing with safe defaults:', schemaError.message);
      // Don't crash - the app will use safe defaults
    }

    console.log('🔧 Registering routes...');

    // AWS Bedrock Dev Console routes
    app.use('/api/bedrock', bedrockRoutes);
    console.log('✅ AWS Bedrock routes registered');

    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');

    // ═══════════════════════════════════════════════════════════════
    // EMPIRE CONTROL CENTER - ENHANCED HEALTH & METRICS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Simple health check for Railway/Docker
     * Returns 200 OK if server is running - no external dependencies
     */
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    /**
     * Detailed health check with component validation
     * Use /health/detailed for monitoring dashboards
     */
    app.get('/health/detailed', async (req, res) => {
      const checks: Record<string, { status: 'ok' | 'error', message?: string, latency?: number }> = {
        overall: { status: 'ok' },
      };

      // Check database connectivity
      try {
        const dbStart = Date.now();
        const user = await storage.getUser('health-check-dummy');
        checks.database = { status: 'ok', latency: Date.now() - dbStart };
        setHealthStatus('database', true);
      } catch (err: any) {
        checks.database = { status: 'error', message: err.message };
        checks.overall.status = 'error';
        setHealthStatus('database', false);
      }

      // Check Riot API (if configured)
      if (process.env.RIOT_API_KEY) {
        try {
          const riotStart = Date.now();
          const response = await fetch('https://na1.api.riotgames.com/lol/status/v4/platform-data', {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
          });

          if (response.ok) {
            checks.riot_api = { status: 'ok', latency: Date.now() - riotStart };
            setHealthStatus('riot_api', true);
          } else {
            checks.riot_api = { status: 'error', message: `HTTP ${response.status}` };
            setHealthStatus('riot_api', false);
          }
        } catch (err: any) {
          checks.riot_api = { status: 'error', message: err.message };
          setHealthStatus('riot_api', false);
        }
      }

      // Set overall health
      setHealthStatus('overall', checks.overall.status === 'ok');

      const statusCode = checks.overall.status === 'ok' ? 200 : 503;
      res.status(statusCode).json({
        status: checks.overall.status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
      });
    });

    /**
     * Kubernetes readiness probe
     * Returns 200 only when fully ready to serve traffic
     */
    app.get('/ready', async (req, res) => {
      try {
        await storage.getUser('readiness-check-dummy');
        res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
      } catch (err) {
        res.status(503).json({ ready: false, error: 'Database not ready' });
      }
    });

    /**
     * Prometheus metrics endpoint
     * Scraped by Prometheus for monitoring
     */
    app.get('/metrics', async (req, res) => {
      try {
        const metrics = await getMetrics();
        res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.send(metrics);
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to generate metrics', message: err.message });
      }
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      const source = (err?.stack && err.stack.includes('riot')) ? 'riot' : 'server';
      const severity: AlertPayload['severity'] = (status >= 500 || message.includes('RIOT_API_KEY')) ? 'critical' : 'warning';
      if (severity === 'critical') {
        notify({ severity, source: 'global-error', message, details: { status, stack: err?.stack } }).catch(() => { });
      }
      res.status(status).json({ message });
    });

    // Setup vite in development, serve static files in production
    // Important that this comes last, so that the API routes take precedence
    // and the wildcard route in serveStatic (which falls through to index.html) 
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      (async () => {
        // Dynamic import to avoid loading vite in production
        const { setupVite } = await import("./vite");
        await setupVite(app, server);
      })();
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
    }, async () => {
      log(`serving on port ${port}`);
      startTwitterAutomation();

      // Start monitoring systems
      try {
        const { startTwitterMonitoring } = await import("./services/twitterMonitor");
        const { startRevenueTracking } = await import("./monitoring/revenueTracker");

        startTwitterMonitoring();
        startRevenueTracking();
        console.log('✅ Monitoring systems initialized');

        // Start Business Bot autonomous scheduler
        try {
          const { startBusinessBotScheduler } = await import('../business-bot/scheduler');
          startBusinessBotScheduler();
        } catch (botErr) {
          console.warn('⚠️ Business Bot scheduler failed to start:', botErr);
        }
      } catch (err) {
        console.log(' ℹ️ Monitoring systems skipped (optional dependencies)');
      }

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
