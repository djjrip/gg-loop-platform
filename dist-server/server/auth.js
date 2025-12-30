import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
// @ts-ignore - no type definitions available for passport-twitch-new
import { Strategy as TwitchStrategy } from "passport-twitch-new";
import session from "express-session";
import connectRedis from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import { storage } from "./storage";
import { sendWelcomeEmail } from "./services/email";
// ============================================================================
// SESSION SETUP - PURE MEMORY STORE (NO POSTGRES)
// ============================================================================
export function getSession() {
    const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
    const sessionStoreType = (process.env.SESSION_STORE || 'memory').toLowerCase();
    // Always enforce that production does not use MemoryStore.
    if (process.env.NODE_ENV === 'production' && sessionStoreType === 'memory') {
        console.warn('⚠️  WARNING: Using MemoryStore in production. Sessions will not persist and may leak memory.');
        console.warn('⚠️  Set SESSION_STORE=redis and REDIS_URL for production-grade sessions.');
        // process.exit(1); // REMOVED: Allow startup for hotfix
    }
    // Default MemoryStore (safe for local/dev only)
    let store = new session.MemoryStore();
    if (sessionStoreType === 'redis') {
        if (!process.env.REDIS_URL) {
            console.error('🚨 SESSION_STORE=redis requires REDIS_URL.');
            process.exit(1);
        }
        try {
            const RedisStore = connectRedis(session);
            const rClient = createRedisClient({ url: process.env.REDIS_URL });
            rClient.on('error', (err) => console.error('[Redis] Client error', err));
            rClient.on('connect', () => console.log('[Redis] Connected to session store'));
            rClient.connect().catch((err) => {
                console.error('[Redis] connect error', err);
                process.exit(1);
            });
            store = new RedisStore({ client: rClient });
            console.log('🧠 Using Redis-backed session store');
        }
        catch (err) {
            console.error('[Session] Failed to initialize Redis store', err);
            process.exit(1);
        }
    }
    else {
        console.log('🧠 Using MemoryStore (non-production only)');
    }
    return session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400000, // 24 hours
            sameSite: 'lax',
        },
    });
}
// ============================================================================
// PASSPORT SERIALIZATION
// ============================================================================
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await storage.getUser(id);
        done(null, user || null);
    }
    catch (error) {
        console.error('[Auth] Error deserializing user:', error);
        done(error, null);
    }
});
// ============================================================================
// OAUTH SETUP
// ============================================================================
export async function setupAuth(app) {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
    const baseUrl = process.env.BASE_URL || 'https://ggloop.io';
    console.log(`🌍 Auth Base URL: ${baseUrl}`);
    const enabledStrategies = {
        google: false,
        discord: false,
        twitch: false,
    };
    // GOOGLE
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/google/callback`,
            state: true,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email)
                    return done(new Error("No email from Google"));
                const user = await storage.upsertUser({
                    oidcSub: `google:${profile.id}`,
                    email,
                    firstName: profile.name?.givenName || profile.displayName || email.split('@')[0],
                    lastName: profile.name?.familyName || '',
                    profileImageUrl: profile.photos?.[0]?.value,
                });
                // Defensive check: upsertUser should always return a user, but handle edge case
                if (!user) {
                    console.error('[Auth] CRITICAL: upsertUser returned undefined for Google user', { email, oidcSub: `google:${profile.id}` });
                    return done(new Error('Failed to create or retrieve user from database'));
                }
                // Check if this is a new user (created within last 10 seconds)
                const isNewUser = user.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime() < 10000);
                if (isNewUser) {
                    // Fire and forget welcome email
                    sendWelcomeEmail(user.email, user.firstName || user.username || 'Gamer').catch(console.error);
                }
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        }));
        app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
        app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
        enabledStrategies.google = true;
    }
    // DISCORD
    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        passport.use(new DiscordStrategy({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/discord/callback`,
            scope: ['identify', 'email'],
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email;
                if (!email)
                    return done(new Error("No email from Discord"));
                const user = await storage.upsertUser({
                    oidcSub: `discord:${profile.id}`,
                    email,
                    firstName: profile.username || email.split('@')[0],
                    lastName: '',
                    profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
                });
                // Defensive check: upsertUser should always return a user, but handle edge case
                if (!user) {
                    console.error('[Auth] CRITICAL: upsertUser returned undefined for Discord user', { email, oidcSub: `discord:${profile.id}` });
                    return done(new Error('Failed to create or retrieve user from database'));
                }
                // Check if this is a new user (created within last 10 seconds)
                const isNewUser = user.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime() < 10000);
                if (isNewUser) {
                    sendWelcomeEmail(user.email, user.firstName || user.username || 'Gamer').catch(console.error);
                }
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        }));
        app.get('/api/auth/discord', passport.authenticate('discord'));
        app.get('/api/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
        enabledStrategies.discord = true;
    }
    // TWITCH
    if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
        passport.use(new TwitchStrategy({
            clientID: process.env.TWITCH_CLIENT_ID,
            clientSecret: process.env.TWITCH_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/twitch/callback`,
            scope: ['user:read:email'],
            state: true,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email;
                if (!email)
                    return done(new Error("No email from Twitch"));
                const user = await storage.upsertUser({
                    oidcSub: `twitch:${profile.id}`,
                    email,
                    firstName: profile.display_name || profile.login || email.split('@')[0],
                    lastName: '',
                    profileImageUrl: profile.profile_image_url,
                });
                // Defensive check: upsertUser should always return a user, but handle edge case
                if (!user) {
                    console.error('[Auth] CRITICAL: upsertUser returned undefined for Twitch user', { email, oidcSub: `twitch:${profile.id}` });
                    return done(new Error('Failed to create or retrieve user from database'));
                }
                // Check if this is a new user (created within last 10 seconds)
                const isNewUser = user.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime() < 10000);
                if (isNewUser) {
                    sendWelcomeEmail(user.email, user.firstName || user.username || 'Gamer').catch(console.error);
                }
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        }));
        app.get('/api/auth/twitch', passport.authenticate('twitch'));
        app.get('/api/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
        enabledStrategies.twitch = true;
    }
    app.post('/api/auth/logout', (req, res) => {
        req.logout(() => res.json({ success: true }));
    });
    console.log('🔐 Auth system initialized:', enabledStrategies);
}
export const isAuthenticated = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
