import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { twitchAPI } from "./lib/twitch";
import crypto from "crypto";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

function getTwitchRedirectUri(hostname: string) {
  return `https://${hostname}/api/auth/twitch/callback`;
}

export function setupTwitchAuth(app: Express) {
  // Link Twitch account (must be logged in)
  app.get('/api/auth/twitch/link', isAuthenticated, (req: any, res) => {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');
    req.session.twitchState = state;
    
    const scopes = 'user:read:email';
    const redirectUri = getTwitchRedirectUri(req.hostname);
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;
    res.redirect(authUrl);
  });

  // Twitch OAuth callback
  app.get('/api/auth/twitch/callback', isAuthenticated, async (req: any, res) => {
    const { code, state } = req.query;

    // Validate state to prevent CSRF attacks
    if (!state || state !== req.session.twitchState) {
      console.error('Invalid OAuth state parameter');
      return res.redirect('/settings?error=twitch_security_failed');
    }

    // Clear state after validation
    delete req.session.twitchState;

    if (!code) {
      return res.redirect('/settings?error=twitch_auth_failed');
    }

    try {
      const redirectUri = getTwitchRedirectUri(req.hostname);
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from Twitch');
      }

      // Get Twitch user info
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      });

      const userData = await userResponse.json();
      const twitchUser = userData.data[0];

      if (!twitchUser) {
        throw new Error('Failed to fetch Twitch user data');
      }

      const oidcSub = req.user.claims.sub;

      // Encrypt tokens before storing
      const encryptedAccessToken = await twitchAPI.encryptToken(tokenData.access_token);
      const encryptedRefreshToken = tokenData.refresh_token 
        ? await twitchAPI.encryptToken(tokenData.refresh_token)
        : '';

      // Link Twitch account to logged-in user
      await storage.connectTwitchAccount(oidcSub, {
        twitchId: twitchUser.id,
        twitchUsername: twitchUser.login,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      });

      res.redirect('/settings?twitch=connected');

    } catch (error) {
      console.error('Twitch OAuth error:', error);
      res.redirect('/settings?error=twitch_link_failed');
    }
  });

  // Unlink Twitch account
  app.post('/api/auth/twitch/unlink', isAuthenticated, async (req: any, res) => {
    try {
      const oidcSub = req.user.claims.sub;
      const user = await storage.getUserByOidcSub(oidcSub);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.disconnectTwitchAccount(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error unlinking Twitch:', error);
      res.status(500).json({ message: 'Failed to unlink Twitch account' });
    }
  });
}
