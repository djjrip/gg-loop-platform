displayName: string;
profileImage ?: string;
riotPuuid ?: string; // For Riot OAuth - the unique player ID
riotGameName ?: string; // For Riot OAuth - the in-game name
riotTagLine ?: string; // For Riot OAuth - the tag line (#NA1, etc)
tiktokOpenId ?: string; // For TikTok OAuth - the unique open ID
tiktokUnionId ?: string; // For TikTok OAuth - union ID across apps
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // -----------------------------------------------------------------
  // Middleware: strip any Date objects from the authenticated user object
  // -----------------------------------------------------------------
  app.use((req, _res, next) => {
    if ((req as any).user) {
      const sanitize = (obj: any): any => {
        if (obj instanceof Date) return obj.getTime();
        if (Array.isArray(obj)) return obj.map(sanitize);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const [k, v] of Object.entries(obj)) {
            out[k] = sanitize(v);
          }
          return out;
        }
        return obj;
      };
      (req as any).user = sanitize((req as any).user);
    }
    next();
  });

  // -----------------------------------------------------------------
  // Helper to sanitise AuthUser before storing in session
  // -----------------------------------------------------------------
  const sanitiseAuthUser = (user: AuthUser): AuthUser => {
    const recurse = (obj: any): any => {
      if (obj instanceof Date) return obj.getTime();
      if (Array.isArray(obj)) return obj.map(recurse);
      if (obj && typeof obj === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(obj)) {
          out[k] = recurse(v);
        }
        return out;
      }
      return obj;
    };
    return recurse(user) as AuthUser;
  };

  // -----------------------------------------------------------------
  // Debug endpoint – dumps current session (useful for inspecting leftovers)
  // -----------------------------------------------------------------
  app.get('/debug/session/:provider?', (req: Request, res: Response) => {
    if (!req.session) return res.json({ error: 'no session' });
    res.json({ session: req.session });
  });

  // -----------------------------------------------------------------
  // OAuth routes – unchanged but now run after the sanitising middleware
  // -----------------------------------------------------------------

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

        console.log('🔍 Google authUser before sanitise:', authUser);

        // Sanitize before storing in session
        done(null, sanitiseAuthUser(authUser));
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

        const authUser: AuthUser = {
          provider: 'twitch',
          providerId: String(profile.id),
          oidcSub: String(oidcSub),
          email: String(email),
          displayName: String(profile.display_name || profile.login || email.split('@')[0]),
          profileImage: profile.profile_image_url ? String(profile.profile_image_url) : undefined,
        };

        console.log('🔍 Twitch authUser before sanitise:', authUser);

        done(null, sanitiseAuthUser(authUser));
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

        await storage.upsertUser({
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

        done(null, sanitiseAuthUser(authUser));
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
        await storage.upsertUser({
          oidcSub,
          email: authUser.email,
          firstName: authUser.displayName,
          lastName: '',
          profileImageUrl: undefined,
        });
        done(null, sanitiseAuthUser(authUser));
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
  // Global error handler – must be after all routes
  // -----------------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('⚠️ Uncaught error in request chain:', err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    }
  });
}
