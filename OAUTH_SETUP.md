# OAuth Login Setup Guide

**Your OAuth logins are currently broken because redirect URLs don't match.**

## Quick Fix (5 minutes)

Your current Replit domain: `https://3d3cea8a-85cf-4f88-8c67-be4be4d6239a-00-3jb9yp194k6jl.janeway.replit.dev`

### 1. Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Select your GG Loop application
3. Click "OAuth2" in left sidebar
4. Under "Redirects", click "Add Redirect"
5. Paste: `https://3d3cea8a-85cf-4f88-8c67-be4be4d6239a-00-3jb9yp194k6jl.janeway.replit.dev/api/auth/discord/callback`
6. Click "Save Changes"

### 2. Twitch OAuth Setup

1. Go to https://dev.twitch.tv/console/apps
2. Select your GG Loop application
3. Under "OAuth Redirect URLs", click "Add a new URL"
4. Paste: `https://3d3cea8a-85cf-4f88-8c67-be4be4d6239a-00-3jb9yp194k6jl.janeway.replit.dev/api/auth/twitch/callback`
5. Click "Save"

### 3. Google OAuth Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client
3. Under "Authorized redirect URIs", click "Add URI"
4. Paste: `https://3d3cea8a-85cf-4f88-8c67-be4be4d6239a-00-3jb9yp194k6jl.janeway.replit.dev/api/auth/google/callback`
5. Click "Save"

---

## ⚠️ Important Notes

### Domain Changes
**Every time your Replit domain changes, you'll need to update these URLs again.**

To get your current domain:
```bash
echo $REPLIT_DOMAINS
```

### Better Solution: Use Custom Domain

Once you have ggloop.io set up, use these permanent URLs instead:

- Discord: `https://ggloop.io/api/auth/discord/callback`
- Twitch: `https://ggloop.io/api/auth/twitch/callback`
- Google: `https://ggloop.io/api/auth/google/callback`

These will never change!

---

## Testing After Setup

1. Go to `/login`
2. Try each login button
3. You should be redirected to Discord/Twitch/Google
4. After authorizing, you should return to GG Loop homepage
5. Your profile should appear in the header

---

## If Login Still Fails

Check browser console for errors:
- Press F12
- Click "Console" tab
- Try logging in again
- Copy any error messages

Common issues:
- ❌ "redirect_uri_mismatch" → URL not added to developer portal
- ❌ "invalid_client" → Wrong client ID/secret in env variables
- ❌ "access_denied" → User canceled authorization
