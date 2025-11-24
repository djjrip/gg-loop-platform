import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
// import { Strategy as DiscordStrategy } from "passport-discord"; // No longer used – replaced by arctic
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import axios from "axios";

import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;

  // Use PostgreSQL session store if DATABASE_URL is available, otherwise use MemoryStore
  if (process.env.DATABASE_URL) {
    const PgStore = connectPg(session);
    const sessionStore = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl / 1000, // convert to seconds
      tableName: "sessions",
    });

    return session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTtl,
      },
    });
  } else {
    // Fallback to MemoryStore for local dev without DATABASE_URL
    const MemoryStore = createMemoryStore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    return session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTtl,
      },
    });
  }
}

interface AuthUser {
  provider: 'google' | 'twitch' | 'discord' | 'riot' | 'tiktok';
  providerId: string;
  oidcSub: string; // Format: "google:12345", "twitch:67890", "discord:abc123", "riot:puuid123", or "tiktok:openid123"
  email: string;
  displayName: string;
  profileImage?: string;
  riotPuuid?: string; // For Riot OAuth - the unique player ID
  riotGameName?: string; // For Riot OAuth - the in-game name
  riotTagLine?: string; // For Riot OAuth - the tag line (#NA1, etc)
  tiktokOpenId?: string; // For TikTok OAuth - the unique open ID
  tiktokUnionId?: string; // For TikTok OAuth - union ID across apps
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Prevent caching of auth routes to avoid stale redirects
  app.use("/api/auth", (req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    next();
  });

  passport.serializeUser((user: any, cb) => {
    // Only store oidcSub to prevent Date serialization issues
    cb(null, { oidcSub: user.oidcSub });
  });

  passport.deserializeUser((obj: any, cb) => {
    // Return the minimal user object
    cb(null, obj);
  });

  // Determine base URL - use custom domain if available, otherwise use Replit URL
  const baseUrl = process.env.BASE_URL || 'https://ggloop.io';

  // Track registered strategies to conditionally register routes
  const strategies = {
    google: false,
    twitch: false,
    discord: false,
    tiktok: false,
    riot: false
  };

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/google/callback`,
      state: true, // Enable CSRF protection
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email from Google"));
        }

        const oidcSub = `google:${profile.id}`;

        // Create a clean user object with ONLY primitive types (no Date objects)
        const authUser: AuthUser = {
          provider: 'google',
          providerId: String(profile.id),
          oidcSub: String(oidcSub),
          email: String(email),
          displayName: String(profile.displayName || email.split('@')[0]),
          profileImage: profile.photos?.[0]?.value ? String(profile.photos[0].value) : undefined,
        };

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: profile.name?.givenName || authUser.displayName,
          lastName: profile.name?.familyName || '',
          profileImageUrl: authUser.profileImage,
        });

        // Return ONLY the clean authUser object (no profile, no tokens)
        done(null, authUser);
      } catch (error) {
        console.error('[Google OAuth] Error:', error);
        done(error as Error);
      }
    }));
    strategies.google = true;
  }

  // Twitch OAuth Strategy
  if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
    passport.use(new TwitchStrategy({
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/twitch/callback`,
      scope: ['user:read:email'],
      state: true, // Enable CSRF protection
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const email = profile.email;
        if (!email) {
          return done(new Error("No email from Twitch"));
        }

        const oidcSub = `twitch:${profile.id}`;

        // Create a clean user object with ONLY primitive types
        const authUser: AuthUser = {
          provider: 'twitch',
          providerId: String(profile.id),
          oidcSub: String(oidcSub),
          email: String(email),
          displayName: String(profile.display_name || profile.login || email.split('@')[0]),
          profileImage: profile.profile_image_url ? String(profile.profile_image_url) : undefined,
        };

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: authUser.displayName,
          lastName: '',
          profileImageUrl: authUser.profileImage,
        });

        done(null, authUser);
      } catch (error) {
        console.error('[Twitch OAuth] Error:', error);
        done(error as Error);
      }
    }));
    strategies.twitch = true;
  }

  // Old Passport Discord strategy removed – replaced by arctic implementation

  // TikTok OAuth Strategy (Login Kit)
  if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
    passport.use('tiktok', new OAuth2Strategy({
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      clientID: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/tiktok/callback`,
      scope: ['user.info.basic'],
      state: true, // Enable CSRF protection
    }, async (accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
      try {
        // Fetch user info from TikTok API
        const userInfoResponse = await axios.get(
          'https://open.tiktokapis.com/v2/user/info/',
          {
            params: { fields: 'open_id,union_id,avatar_url,display_name' },
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        const tiktokUser = userInfoResponse.data.data.user;
        const oidcSub = `tiktok:${tiktokUser.open_id}`;

        // TikTok doesn't provide email, create virtual email
        const virtualEmail = `${tiktokUser.open_id}@tiktok.ggloop.io`;

        const authUser: AuthUser = {
          provider: 'tiktok',
          providerId: tiktokUser.open_id,
          oidcSub,
          email: virtualEmail,
          displayName: tiktokUser.display_name || 'TikTok User',
          profileImage: tiktokUser.avatar_url,
          tiktokOpenId: tiktokUser.open_id,
          tiktokUnionId: tiktokUser.union_id,
        };

        // Upsert user with basic info
        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: tiktokUser.display_name || 'TikTok',
          lastName: 'User',
          profileImageUrl: authUser.profileImage,
        });

        // Connect TikTok account with tokens and TikTok-specific fields
        await storage.connectTiktokAccount(oidcSub, {
          openId: tiktokUser.open_id,
          unionId: tiktokUser.union_id,
          username: tiktokUser.display_name || 'TikTok User',
          accessToken,
          refreshToken,
        });

        done(null, authUser);
      } catch (error) {
        console.error('[TikTok OAuth] Error fetching user info:', error);
        done(error as Error);
      }
    }));
    strategies.tiktok = true;
  }

  // Riot OAuth Strategy (RSO - Riot Sign-On)
  if (process.env.RIOT_CLIENT_ID && process.env.RIOT_CLIENT_SECRET) {
    passport.use('riot', new OAuth2Strategy({
      authorizationURL: 'https://auth.riotgames.com/authorize',
      tokenURL: 'https://auth.riotgames.com/token',
      clientID: process.env.RIOT_CLIENT_ID,
      clientSecret: process.env.RIOT_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/riot/callback`,
      scope: ['openid'], // openid for basic account info
      state: true, // Enable CSRF protection
      customHeaders: {
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.RIOT_CLIENT_ID}:${process.env.RIOT_CLIENT_SECRET}`
        ).toString('base64')
      }
    }, async (accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
      try {
        // Fetch user account info from Riot API
        // Use americas routing for account API (works for all regions)
        const accountResponse = await axios.get(
          'https://americas.api.riotgames.com/riot/account/v1/accounts/me',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Riot-Token': process.env.RIOT_API_KEY // Also include API key
            }
          }
        );

        const riotAccount = accountResponse.data;
        const oidcSub = `riot:${riotAccount.puuid}`;

        // Create email from Riot account (Riot OAuth doesn't provide email directly)
        // Format: gameName-tagLine@riot.gg (virtual email for our system)
        const virtualEmail = `${riotAccount.gameName.toLowerCase()}-${riotAccount.tagLine.toLowerCase()}@riot.gg`;

        const authUser: AuthUser = {
          provider: 'riot',
          providerId: riotAccount.puuid,
          oidcSub,
          email: virtualEmail,
          displayName: `${riotAccount.gameName}#${riotAccount.tagLine}`,
          riotPuuid: riotAccount.puuid,
          riotGameName: riotAccount.gameName,
          riotTagLine: riotAccount.tagLine,
        };

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: riotAccount.gameName,
          lastName: `#${riotAccount.tagLine}`,
          profileImageUrl: undefined, // Riot doesn't provide avatar in account API
        });

        done(null, authUser);
      } catch (error) {
        console.error('[Riot OAuth] Error fetching account:', error);
        done(error as Error);
      }
    }));
    strategies.riot = true;
  }

  // Helper to handle missing strategy errors
  const checkStrategy = (strategy: keyof typeof strategies) => (req: any, res: any, next: any) => {
    if (!strategies[strategy]) {
      return res.status(501).json({
        message: `Authentication strategy '${strategy}' is not configured. Please check environment variables.`
      });
    }
    next();
  };

  // Import arctic Discord handlers (disabled)
  // import { getDiscordAuthUrl, handleDiscordCallback } from "./arcticDiscord";

  // Discord OAuth routes using arctic (disabled)
  // app.get("/api/auth/discord", getDiscordAuthUrl);
  // app.get("/api/auth/discord/callback", handleDiscordCallback);

  // Version check endpoint
  app.get("/api/version", (req, res) => res.json({ version: "arctic-fix-v2", timestamp: Date.now() }));

  // Google OAuth routes
  app.get("/api/auth/google",
    checkStrategy('google'),
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    checkStrategy('google'),
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req, res) => {
      try {
        // User is already authenticated by passport.authenticate
        // No need to regenerate session or call req.login again

        // Update login streak and award GG Coins
        if (req.user && (req.user as any).oidcSub) {
          const dbUser = await storage.getUserByOidcSub((req.user as any).oidcSub);
          if (dbUser) {
            const { updateLoginStreak } = await import('./lib/freeTier');
            const streakResult = await updateLoginStreak(dbUser.id);

            // Store ONLY primitive values in session
            if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
              req.session.loginNotification = {
                streak: Number(streakResult.currentStreak),
                coinsAwarded: Number(streakResult.coinsAwarded),
                badgeUnlocked: streakResult.badgeUnlocked ? String(streakResult.badgeUnlocked) : undefined,
                timestamp: Number(Date.now()),
              };
            }

            if (streakResult.coinsAwarded > 0) {
              console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
            }
          }
        }

        res.redirect("/");
      } catch (error) {
        console.error('[Google OAuth Callback] Error:', error);
        res.redirect("/");
      }
    }
  );

  // Twitch OAuth routes
  app.get("/api/auth/twitch",
    checkStrategy('twitch'),
    passport.authenticate("twitch")
  );

  app.get("/api/auth/twitch/callback",
    checkStrategy('twitch'),
    passport.authenticate("twitch", { failureRedirect: "/" }),
    async (req, res) => {
      try {
        // User is already authenticated by passport.authenticate
        // No need to regenerate session or call req.login again

        // Update login streak and award GG Coins
        if (req.user && (req.user as any).oidcSub) {
          const dbUser = await storage.getUserByOidcSub((req.user as any).oidcSub);
          if (dbUser) {
            const { updateLoginStreak } = await import('./lib/freeTier');
            const streakResult = await updateLoginStreak(dbUser.id);

            // Store ONLY primitive values in session
            if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
              req.session.loginNotification = {
                streak: Number(streakResult.currentStreak),
                coinsAwarded: Number(streakResult.coinsAwarded),
                badgeUnlocked: streakResult.badgeUnlocked ? String(streakResult.badgeUnlocked) : undefined,
                timestamp: Number(Date.now()),
              };
            }

            if (streakResult.coinsAwarded > 0) {
              console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
            }
          }
        }

        res.redirect("/");
      } catch (error) {
        console.error('[Twitch OAuth Callback] Error:', error);
        res.redirect("/");
      }
    }
  );

  // TikTok OAuth routes
  app.get("/api/auth/tiktok",
    checkStrategy('tiktok'),
    passport.authenticate("tiktok")
  );

  app.get("/api/auth/tiktok/callback",
    checkStrategy('tiktok'),
    passport.authenticate("tiktok", { failureRedirect: "/" }),
    async (req, res) => {
      try {
        // User is already authenticated by passport.authenticate
        // No need to regenerate session or call req.login again

        // Update login streak and award GG Coins
        if (req.user && (req.user as any).oidcSub) {
          const dbUser = await storage.getUserByOidcSub((req.user as any).oidcSub);
          if (dbUser) {
            const { updateLoginStreak } = await import('./lib/freeTier');
            const streakResult = await updateLoginStreak(dbUser.id);

            // Store ONLY primitive values in session
            if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
              req.session.loginNotification = {
                streak: Number(streakResult.currentStreak),
                coinsAwarded: Number(streakResult.coinsAwarded),
                badgeUnlocked: streakResult.badgeUnlocked ? String(streakResult.badgeUnlocked) : undefined,
                timestamp: Number(Date.now()),
              };
            }

            if (streakResult.coinsAwarded > 0) {
              console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
            }
          }
        }

        res.redirect("/");
      } catch (error) {
        console.error('[TikTok OAuth Callback] Error:', error);
        res.redirect("/");
      }
    }
  );

  // Riot OAuth routes
  app.get("/api/auth/riot",
    checkStrategy('riot'),
    passport.authenticate("riot")
  );

  app.get("/api/auth/riot/callback",
    checkStrategy('riot'),
    passport.authenticate("riot", { failureRedirect: "/" }),
    async (req, res) => {
      try {
        // User is already authenticated by passport.authenticate
        // No need to regenerate session or call req.login again

        // Update login streak and award GG Coins
        if (req.user && (req.user as any).oidcSub) {
          const dbUser = await storage.getUserByOidcSub((req.user as any).oidcSub);
          if (dbUser) {
            const { updateLoginStreak } = await import('./lib/freeTier');
            const streakResult = await updateLoginStreak(dbUser.id);

            // Store ONLY primitive values in session
            if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
              req.session.loginNotification = {
                streak: Number(streakResult.currentStreak),
                coinsAwarded: Number(streakResult.coinsAwarded),
                badgeUnlocked: streakResult.badgeUnlocked ? String(streakResult.badgeUnlocked) : undefined,
                timestamp: Number(Date.now()),
              };
            }

            if (streakResult.coinsAwarded > 0) {
              console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
            }
          }
        }

        res.redirect("/");
      } catch (error) {
        console.error('[Riot OAuth Callback] Error:', error);
        res.redirect("/");
      }
    }
  );

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
