import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import axios from "axios";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // Clean up expired sessions every 24h
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

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Determine base URL - use custom domain if available, otherwise use Replit URL
  const baseUrl = process.env.BASE_URL || 'https://ggloop.io';

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
      callbackURL: `${baseUrl}/api/auth/discord/callback`,
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

        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: tiktokUser.display_name || 'TikTok',
          lastName: 'User',
          profileImageUrl: authUser.profileImage,
        });

        done(null, authUser);
      } catch (error) {
        console.error('[TikTok OAuth] Error fetching user info:', error);
        done(error as Error);
      }
    }));
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
              
              // Store notification in session for frontend to display
              if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
                req.session.loginNotification = {
                  streak: streakResult.currentStreak,
                  coinsAwarded: streakResult.coinsAwarded,
                  badgeUnlocked: streakResult.badgeUnlocked,
                  timestamp: Date.now(),
                };
              }
              
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
              
              // Store notification in session for frontend to display
              if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
                req.session.loginNotification = {
                  streak: streakResult.currentStreak,
                  coinsAwarded: streakResult.coinsAwarded,
                  badgeUnlocked: streakResult.badgeUnlocked,
                  timestamp: Date.now(),
                };
              }
              
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
              
              // Store notification in session for frontend to display
              if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
                req.session.loginNotification = {
                  streak: streakResult.currentStreak,
                  coinsAwarded: streakResult.coinsAwarded,
                  badgeUnlocked: streakResult.badgeUnlocked,
                  timestamp: Date.now(),
                };
              }
              
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

  // Riot OAuth routes
  app.get("/api/auth/riot",
    passport.authenticate("riot")
  );

  app.get("/api/auth/riot/callback",
    passport.authenticate("riot", { failureRedirect: "/" }),
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
              
              // Store notification in session for frontend to display
              if (streakResult.coinsAwarded > 0 || streakResult.badgeUnlocked || streakResult.currentStreak > 1) {
                req.session.loginNotification = {
                  streak: streakResult.currentStreak,
                  coinsAwarded: streakResult.coinsAwarded,
                  badgeUnlocked: streakResult.badgeUnlocked,
                  timestamp: Date.now(),
                };
              }
              
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
