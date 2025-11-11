import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as TwitchStrategy } from "passport-twitch-new";
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
  provider: 'google' | 'twitch';
  providerId: string;
  oidcSub: string; // Format: "google:12345" or "twitch:67890"
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
    }, async (accessToken, refreshToken, profile, done) => {
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

  // Google OAuth routes
  app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      // Regenerate session for security
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect("/");
        }
        req.login(user!, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect("/");
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
    (req, res) => {
      // Regenerate session for security
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect("/");
        }
        req.login(user!, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect("/");
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
