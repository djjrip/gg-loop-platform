# GG Loop - Quick Deployment Fix Guide

## Current Status: 502 Bad Gateway on Railway

### Most Likely Causes:
1. **Missing Environment Variables** - Railway needs all required env vars
2. **Database Migration Failing** - `npm run db:push` might be failing
3. **Port Configuration** - Railway auto-assigns PORT, we need to respect it

## Immediate Fixes to Deploy

### Fix 1: Update nixpacks.toml Start Command
The current start command runs db:push which might be failing. Let's make it more resilient:

```toml
[start]
cmd = "npm start"
```

### Fix 2: Verify Environment Variables on Railway
Required variables (check Railway dashboard):
- ✅ `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- ✅ `NODE_ENV` = `production`
- ✅ `SESSION_SECRET` = (any random string)
- ✅ `BASE_URL` = `https://ggloop.io`
- ⚠️ `PORT` = (Railway sets this automatically - don't override)
- ⚠️ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (for OAuth)
- ⚠️ `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` (for OAuth)
- ⚠️ `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` (for OAuth)
- ⚠️ `RIOT_API_KEY` (for Riot API)

### Fix 3: Ensure Database Migrations Run
Railway should run migrations automatically. If not, manually trigger:
1. Go to Railway dashboard
2. Click your service → Settings → Deploy
3. Under "Custom Start Command" use: `npm run db:push && npm start`

### Fix 4: Check Railway Logs
1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments" tab
4. Click on the latest deployment
5. Check "Build Logs" and "Deploy Logs" for errors

## Common Railway Error Patterns

### Error: "Cannot find module"
**Fix:** Ensure `npm run build` completes successfully in Railway logs

### Error: "ECONNREFUSED" or "Database connection failed"
**Fix:** Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`

### Error: "Port already in use"
**Fix:** Don't set PORT in env vars - let Railway assign it

### Error: "Session store error"
**Fix:** Our app uses MemoryStore, no additional config needed

## Quick Test Locally
```bash
# Build production bundle
npm run build

# Set required env vars
$env:NODE_ENV="production"
$env:DATABASE_URL="your-railway-postgres-url-here"
$env:SESSION_SECRET="test-secret"
$env:BASE_URL="https://ggloop.io"

# Run
npm start
```

## Next Steps
1. Update nixpacks.toml (simpler start command)
2. Verify all env vars in Railway
3. Push to GitHub
4. Monitor Railway deployment logs
5. Test ggloop.io

## Emergency Rollback
If needed, you can rollback to previous deployment in Railway:
1. Go to Deployments tab
2. Find last working deployment
3. Click "Redeploy"
