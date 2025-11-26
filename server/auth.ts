import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";

// ============================================================================
// SESSION SETUP
// ============================================================================

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
            createTableIfMissing: true, // Auto-create session table if missing
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
            sameSite: 'lax',
        },
    });
}

// ============================================================================
// PASSPORT SERIALIZATION - CRITICAL: ONLY STORE USER ID
// ============================================================================

passport.serializeUser((user: any, done) => {
    // ONLY store the user ID - never store Date objects or entire user object
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        // Fetch fresh user data from database on each request
        const user = await storage.getUser(id);
        done(null, user || null);
    } catch (error) {
        console.error('[Auth] Error deserializing user:', error);
        done(error, null);
    }
});

// ============================================================================
// OAUTH SETUP
// ============================================================================

export async function setupAuth(app: Express) {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    const baseUrl = process.env.BASE_URL || 'https://ggloop.io';
    console.log(`🌍 Auth Base URL: ${baseUrl}`);

    // Track which strategies are enabled
    const enabledStrategies = {
        google: false,
        discord: false,
        twitch: false,
    };

    // -------------------------------------------------------------------------
    // GOOGLE OAUTH
    // -------------------------------------------------------------------------
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/google/callback`,
            state: true,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                console.log(`✅ Google OAuth callback for: ${profile.id}`);
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error("No email from Google"));
                }

                const oidcSub = `google:${profile.id}`;
                const user = await storage.upsertUser({
                    oidcSub,
                    email,
                    firstName: profile.name?.givenName || profile.displayName || email.split('@')[0],
                    lastName: profile.name?.familyName || '',
                    profileImageUrl: profile.photos?.[0]?.value,
                });

                done(null, user);
            } catch (error) {
                console.error('[Google OAuth] Error:', error);
                done(error as Error);
            }
        }));

        app.get('/api/auth/google', passport.authenticate('google', {
            scope: ['profile', 'email']
        }));

        app.get('/api/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/' }),
            (req, res) => res.redirect('/')
        );

        enabledStrategies.google = true;
        console.log('✅ Google OAuth enabled');
    }

    // -------------------------------------------------------------------------
    // DISCORD OAUTH
    // -------------------------------------------------------------------------
    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        passport.use(new DiscordStrategy({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/discord/callback`,
            scope: ['identify', 'email'],
        }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                console.log(`✅ Discord OAuth callback for: ${profile.id}`);
                const email = profile.email;

                if (!email) {
                    return done(new Error("No email from Discord"));
                }

                const oidcSub = `discord:${profile.id}`;
                const user = await storage.upsertUser({
                    oidcSub,
                    email,
                    firstName: profile.username || email.split('@')[0],
                    lastName: '',
                    profileImageUrl: profile.avatar
                        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                        : undefined,
                });

                done(null, user);
            } catch (error) {
                console.error('[Discord OAuth] Error:', error);
                done(error as Error);
            }
        }));

        app.get('/api/auth/discord', passport.authenticate('discord'));

        app.get('/api/auth/discord/callback',
            passport.authenticate('discord', { failureRedirect: '/' }),
            (req, res) => res.redirect('/')
        );

        enabledStrategies.discord = true;
        console.log('✅ Discord OAuth enabled');
    }

    // -------------------------------------------------------------------------
    // TWITCH OAUTH
    // -------------------------------------------------------------------------
    if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
        passport.use(new TwitchStrategy({
            clientID: process.env.TWITCH_CLIENT_ID,
            clientSecret: process.env.TWITCH_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/twitch/callback`,
            scope: ['user:read:email'],
            state: true,
        }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            try {
                console.log(`✅ Twitch OAuth callback for: ${profile.id}`);
                const email = profile.email;

                if (!email) {
                    return done(new Error("No email from Twitch"));
                }

                const oidcSub = `twitch:${profile.id}`;
                const user = await storage.upsertUser({
                    oidcSub,
                    email,
                    firstName: profile.display_name || profile.login || email.split('@')[0],
                    lastName: '',
                    profileImageUrl: profile.profile_image_url,
                });

                done(null, user);
            } catch (error) {
                console.error('[Twitch OAuth] Error:', error);
                done(error as Error);
            }
        }));

        app.get('/api/auth/twitch', passport.authenticate('twitch'));

        app.get('/api/auth/twitch/callback',
            passport.authenticate('twitch', { failureRedirect: '/' }),
            (req, res) => res.redirect('/')
        );

        enabledStrategies.twitch = true;
        console.log('✅ Twitch OAuth enabled');
    }

    // -------------------------------------------------------------------------
    // LOGOUT ROUTE
    // -------------------------------------------------------------------------
    app.post('/api/auth/logout', (req, res) => {
        req.logout(() => {
            res.json({ success: true });
        });
    });

    // -------------------------------------------------------------------------
    // DEBUG ENDPOINT (development only)
    // -------------------------------------------------------------------------
    if (process.env.NODE_ENV !== 'production') {
        app.get('/debug/session', (req: Request, res: Response) => {
            res.json({
                session: req.session,
                user: req.user,
                isAuthenticated: req.isAuthenticated()
            });
        });
    }

    console.log('🔐 Auth system initialized:', enabledStrategies);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
