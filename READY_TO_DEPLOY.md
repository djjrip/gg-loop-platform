# 🚀 Railway Deployment - Ready to Deploy

## Current Status: ✅ READY TO DEPLOY

This project is configured and ready to be deployed to Railway. All necessary configuration files are in place.

## What's Already Done:

✅ PostgreSQL schema (`shared/schema.ts`)  
✅ Database auto-detection (PostgreSQL for production, SQLite for local)  
✅ Railway configuration (`railway.json`, `nixpacks.toml`)  
✅ Build and start scripts optimized  
✅ Environment variable template (`.env.template`)  
✅ GitHub repository connected

## Quick Deploy Steps:

### 1. Push to GitHub (DO THIS FIRST)
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Go to Railway
1. Visit **https://railway.app**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`djjrip/gg-loop-platform`**

### 3. Add PostgreSQL Database
In your Railway project:
1. Click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway creates it automatically

### 4. Configure Environment Variables
Click your web service → **"Variables"** tab → Add these:

```env
# Required
NODE_ENV=production
BASE_URL=https://ggloop.io
SESSION_SECRET=1266d2677444f863e2e794613bbaea2f9c36110903cd000ee1b6b9535aa02392
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Riot API
RIOT_API_KEY=RGAPI-d3fe3d17-b466-462a-9843-3642b4d4b83c

# Discord OAuth (already configured)
DISCORD_CLIENT_ID=1437711568925098034
DISCORD_CLIENT_SECRET=ajAFv8eiuMMalUaig3mHlQCjczsc1gyc

# Google OAuth (add when ready)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Twitch OAuth (add when ready)
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

**IMPORTANT:** `${{Postgres.DATABASE_URL}}` is Railway's syntax to automatically reference the PostgreSQL database.

### 5. Set Custom Start Command (Important!)
1. Click your web service → **"Settings"**
2. Find **"Deploy"** section
3. Set **"Custom Start Command"** to:
   ```
   npm run db:push && npm start
   ```

This ensures the database schema is pushed before starting the server.

### 6. Point Your Domain (ggloop.io)

#### In Railway:
1. Click web service → **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter: `ggloop.io`
4. Railway will show you a CNAME value

#### In Your Domain Provider:
1. Go to your DNS settings
2. Add/Update CNAME record:
   - **Type:** CNAME
   - **Name:** `@` (or blank for root domain)
   - **Value:** `[your-app].up.railway.app` (from Railway)
   - **TTL:** 3600
3. Also add for www subdomain:
   - **Name:** `www`
   - **Value:** Same as above
   - **TTL:** 3600
4. Save and wait 10-60 minutes for DNS propagation

### 7. Watch the Deployment
1. Railway will auto-detect Node.js and start building
2. Check **"Deployments"** tab for progress
3. Check **"Logs"** tab if anything fails
4. First deploy takes 3-5 minutes

### 8. Test Your Site
Once deployed:
1. Visit `https://ggloop.io` (after DNS propagation)
2. Or use the Railway URL: `https://[your-app].up.railway.app`
3. Test login with Discord
4. Verify the home page loads

### 9. Update OAuth Callbacks (When Domain is Live)
Update redirect URLs in:

**Discord Developer Portal:**
- Old: Any old URLs
- New: `https://ggloop.io/api/auth/discord/callback`

**Google Cloud Console (when you set it up):**
- New: `https://ggloop.io/api/auth/google/callback`

**Twitch Developer Console (when you set it up):**
- New: `https://ggloop.io/api/auth/twitch/callback`

## Troubleshooting

### Build Fails?
- Check Railway logs in the "Deployments" tab
- Ensure all environment variables are set
- Make sure PostgreSQL service is running

### Database Connection Error?
- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service status
- Try redeploying

### Blank Page?
- Check if build completed successfully
- Verify `BASE_URL` environment variable
- Check browser console for errors

### OAuth Not Working?
- Update callback URLs in OAuth provider portals
- Verify `BASE_URL` matches your domain
- Check that HTTPS is working (Railway provides free SSL)

## What Happens on Replit?

**DON'T WORRY** - Publishing from Replit won't affect your Railway deployment:
- Replit and Railway are completely separate
- Your GitHub repo is the source of truth
- Railway deploys from GitHub, not Replit
- You can safely keep your Replit project as a backup

Once Railway is working and stable, you can cancel your Replit subscription.

## Cost Comparison

**Railway:**
- First $5: FREE (trial credit)
- After: ~$5/month
- PostgreSQL: Included
- SSL: Included
- Custom domain: Included

**Replit:**
- $20-40/month

**Savings: $180-420/year!** 🎉

## Next Steps After Deployment

1. ✅ Verify site is live at ggloop.io
2. ✅ Test all core features
3. ✅ Update OAuth callbacks
4. 🎯 Set up monitoring/alerts in Railway
5. 🎯 Configure Stripe payments (when ready)
6. 🎯 Set up Tremendous API for automated rewards
7. 🎯 Launch and get customers!

---

**Railway Dashboard:** https://railway.app/dashboard  
**Railway Docs:** https://docs.railway.app

Created: 2025-11-21
Status: Ready for deployment
