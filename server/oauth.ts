import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

interface AuthUser {
  provider: 'google' | 'twitch' | 'discord';
  providerId: string;
  oidcSub: string; // Format: "google:12345", "twitch:67890", or "discord:abc123"
  email: string;
  displayName: string;
  profileImage?: string;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      state: true, // Enable CSRF protection
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email from Google"));
        }

        const oidcSub = `google:${profile.id}`;
        const authUser: AuthUser = {
          provider: 'google',
          providerId: profile.id,
          oidcSub,
          email,
          displayName: profile.displayName,
          profileImage: profile.photos?.[0]?.value,
        };

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: authUser.profileImage,
        });

        done(null, authUser);
      } catch (error) {
        done(error as Error);
      }
    }));
  }

  // Twitch OAuth Strategy
  if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
    passport.use(new TwitchStrategy({
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: "/api/auth/twitch/callback",
      scope: ['user:read:email'],
      state: true, // Enable CSRF protection
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const email = profile.email;
        if (!email) {
          return done(new Error("No email from Twitch"));
        }

        const oidcSub = `twitch:${profile.id}`;
        const authUser: AuthUser = {
          provider: 'twitch',
          providerId: profile.id,
          oidcSub,
          email,
          displayName: profile.display_name || profile.login,
          profileImage: profile.profile_image_url,
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
        done(error as Error);
      }
    }));
  }

  // Discord OAuth Strategy
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/api/auth/discord/callback",
      scope: ['identify', 'email'],
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.email;
        if (!email) {
          return done(new Error("No email from Discord"));
        }

        const oidcSub = `discord:${profile.id}`;
        const authUser: AuthUser = {
          provider: 'discord',
          providerId: profile.id,
          oidcSub,
          email,
          displayName: profile.username,
          profileImage: profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined,
        };

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: profile.username,
          lastName: '',
          profileImageUrl: authUser.profileImage,
        });

        done(null, authUser);
      } catch (error) {
        done(error as Error);
      }
    }));
  }

  // Google OAuth routes
  app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req, res) => {
      // Regenerate session for security
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect("/");
        }
        req.login(user!, async (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect("/");
          }
          
          // Update login streak and award GG Coins
          try {
            const dbUser = await storage.getUserByOidcSub((user as any).oidcSub);
            if (dbUser) {
              const { updateLoginStreak } = await import('./lib/freeTier');
              const streakResult = await updateLoginStreak(dbUser.id);
              if (streakResult.coinsAwarded > 0) {
                console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
              }
            }
          } catch (error) {
            console.error('[Login] Failed to update streak:', error);
            // Don't block login on streak error
          }
          
          res.redirect("/");
        });
      });
    }
  );

  // Twitch OAuth routes
  app.get("/api/auth/twitch",
    passport.authenticate("twitch")
  );

  app.get("/api/auth/twitch/callback",
    passport.authenticate("twitch", { failureRedirect: "/" }),
    async (req, res) => {
      // Regenerate session for security
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect("/");
        }
        req.login(user!, async (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect("/");
          }
          
          // Update login streak and award GG Coins
          try {
            const dbUser = await storage.getUserByOidcSub((user as any).oidcSub);
            if (dbUser) {
              const { updateLoginStreak } = await import('./lib/freeTier');
              const streakResult = await updateLoginStreak(dbUser.id);
              if (streakResult.coinsAwarded > 0) {
                console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
              }
            }
          } catch (error) {
            console.error('[Login] Failed to update streak:', error);
            // Don't block login on streak error
          }
          
          res.redirect("/");
        });
      });
    }
  );

  // Discord OAuth routes
  app.get("/api/auth/discord",
    passport.authenticate("discord")
  );

  app.get("/api/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    async (req, res) => {
      // Regenerate session for security
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect("/");
        }
        req.login(user!, async (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect("/");
          }
          
          // Update login streak and award GG Coins
          try {
            const dbUser = await storage.getUserByOidcSub((user as any).oidcSub);
            if (dbUser) {
              const { updateLoginStreak } = await import('./lib/freeTier');
              const streakResult = await updateLoginStreak(dbUser.id);
              if (streakResult.coinsAwarded > 0) {
                console.log(`[Login] Awarded ${streakResult.coinsAwarded} GG Coins for ${streakResult.currentStreak}-day streak`);
              }
            }
          } catch (error) {
            console.error('[Login] Failed to update streak:', error);
            // Don't block login on streak error
          }
          
          res.redirect("/");
        });
      });
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
