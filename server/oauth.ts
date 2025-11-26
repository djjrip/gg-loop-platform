import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
// import { Strategy as DiscordStrategy } from "passport-discord"; // No longer used ΓÇô replaced by arctic
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import axios from "axios";

import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  let store;

  if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    // Use PostgreSQL session store for production persistence
    const PgStore = connectPg(session);
    store = new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
    console.log('🐘 Using PostgreSQL session store');
  } else {
    // Use MemoryStore for local development
    const MemoryStore = createMemoryStore(session);
    store = new MemoryStore({
      checkPeriod: 86400000,
    });
    console.log('🧠 Using MemoryStore for sessions (local dev)');
  }

  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax', // Important for OAuth callbacks
    },
  });
}

interface AuthUser {
  provider: 'google' | 'twitch' | 'discord' | 'riot' | 'tiktok';
  providerId: string;
  oidcSub: string;
  email: string;
  displayName: string;
  profileImage?: string;
  riotPuuid?: string;
  riotGameName?: string;
  riotTagLine?: string;
  tiktokOpenId?: string;
  tiktokUnionId?: string;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // -----------------------------------------------------------------
  // Debug endpoint
  // -----------------------------------------------------------------
  app.get('/debug/session/:provider?', (req: Request, res: Response) => {
    if (!req.session) return res.json({ error: 'no session' });
    res.json({ session: req.session });
  });

  // Determine base URL - use custom domain if available, otherwise use Replit URL
  const baseUrl = process.env.BASE_URL || 'https://ggloop.io';
  console.log(`🌍 Auth Base URL configured as: ${baseUrl}`);

  // Track registered strategies to conditionally register routes
  const strategies = {
    google: false,
    twitch: false,
    discord: false,
    tiktok: false,
    riot: false,
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
        console.log(`🔑 Google OAuth callback received for ID: ${profile.id}`);
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('❌ No email found in Google profile');
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

        const user = await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: profile.name?.givenName || authUser.displayName,
          lastName: profile.name?.familyName || '',
          profileImageUrl: authUser.profileImage,
        });

        // No need to sanitize - we are serializing only the ID now
        done(null, user);
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
        console.log(`🔑 Twitch OAuth callback received for ID: ${profile.id}`);
        const email = profile.email;
        if (!email) {
          console.error('❌ No email found in Twitch profile');
          return done(new Error("No email from Twitch"));
        }

        const oidcSub = `twitch:${profile.id}`;

        const authUser: AuthUser = {
          provider: 'twitch',
          providerId: String(profile.id),
          oidcSub: String(oidcSub),
          email: String(email),
          displayName: String(profile.display_name || profile.login || email.split('@')[0]),
          profileImage: profile.profile_image_url ? String(profile.profile_image_url) : undefined,
        };

        const user = await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: authUser.displayName,
          lastName: '',
          profileImageUrl: authUser.profileImage,
        });

        done(null, user);
      } catch (error) {
        console.error('[Twitch OAuth] Error:', error);
        done(error as Error);
      }
    }));
    strategies.twitch = true;
  }

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

        const user = await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: tiktokUser.display_name || 'TikTok',
          lastName: 'User',
          profileImageUrl: authUser.profileImage,
        });

        await storage.connectTiktokAccount(oidcSub, {
          openId: tiktokUser.open_id,
          unionId: tiktokUser.union_id,
          username: tiktokUser.display_name || 'TikTok User',
          accessToken,
          refreshToken,
        });

        done(null, user);
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
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Riot does not provide email, use puuid as identifier
        const oidcSub = `riot:${profile.id}`;
        const authUser: AuthUser = {
          provider: 'riot',
          providerId: String(profile.id),
          oidcSub,
          email: `${profile.id}@riot.ggloop.io`,
          displayName: profile.username || 'Riot User',
        };
        // Store user (you may want to fetch more info from Riot API here)
        const user = await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: authUser.displayName,
          lastName: '',
          profileImageUrl: undefined,
        });
        done(null, user);
      } catch (error) {
        console.error('[Riot OAuth] Error:', error);
        done(error as Error);
      }
    }));
    strategies.riot = true;
  }

  // Register routes for each enabled strategy
  if (strategies.google) {
    app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/');
    });
  }

  if (strategies.twitch) {
    app.get('/api/auth/twitch', passport.authenticate('twitch'));
    app.get('/api/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/');
    });
  }

  if (strategies.tiktok) {
    app.get('/api/auth/tiktok', passport.authenticate('tiktok'));
    app.get('/api/auth/tiktok/callback', passport.authenticate('tiktok', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/');
    });
  }

  if (strategies.riot) {
    app.get('/api/auth/riot', passport.authenticate('riot'));
    app.get('/api/auth/riot/callback', passport.authenticate('riot', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/');
    });
  }

  // -----------------------------------------------------------------
  // Global error handler ΓÇô must be after all routes
  // -----------------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('ΓÜá∩╕Å Uncaught error in request chain:', err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    }
  });
}
