# 🚂 Railway Deployment Guide - GG Loop

## Why Railway?
- ✅ $5 free credit to start
- ✅ $5/month after (vs $20-40 on Replit)
- ✅ Auto-deploy from GitHub
- ✅ PostgreSQL database included
- ✅ Custom domain support (ggloop.io)

---

## Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (easiest)
4. Authorize Railway to access your repos

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`djjrip/gg-loop-platform`** (or your repo name)
4. Railway will detect it's a Node.js app automatically

---

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway creates database automatically
4. Copy the **DATABASE_URL** (we'll use it in Step 4)

---

## Step 4: Configure Environment Variables

Click on your **web service** → **"Variables"** tab → Add these:

### Required Variables:
```env
NODE_ENV=production
PORT=5000
BASE_URL=https://gg-loop-platform-production.up.railway.app
SESSION_SECRET=<copy from your .env file>
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Riot API
RIOT_API_KEY=<your riot api key>

# Google OAuth (if you have it)
GOOGLE_CLIENT_ID=<your google client id>
GOOGLE_CLIENT_SECRET=<your google client secret>
```

### Optional (add later):
```env
# Stripe
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLIC_KEY=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Tremendous (for automated rewards)
TREMENDOUS_API_KEY=
```

**Note:** The `${{Postgres.DATABASE_URL}}` syntax automatically uses the Railway PostgreSQL connection string.

---

## Step 5: Update Database Config

Railway uses PostgreSQL, not SQLite. We need to switch back to PostgreSQL schema.

**I'll handle this for you in the next step.**

---

## Step 6: Deploy!

1. Railway will **auto-deploy** when you push to GitHub
2. Watch the **deployment logs** in Railway dashboard
3. First deploy takes ~3-5 minutes
4. You'll get a URL like: `https://gg-loop-platform-production.up.railway.app`

---

## Step 7: Run Database Migration

After first deploy:

1. Go to your Railway project
2. Click on your **web service**
3. Click **"Settings"** → **"Deploy"** → **"Custom Start Command"**
4. Add: `npm run db:push && npm start`

This runs the database migration before starting the server.

---

## Step 8: Point Your Domain (ggloop.io)

### In Railway:
1. Click your web service → **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter: `ggloop.io`
4. Railway gives you a **CNAME** record

### In Your Domain Provider (GoDaddy/Namecheap/etc):
1. Go to DNS settings
2. Add **CNAME** record:
   - **Name:** `@` (or leave blank)
   - **Value:** `<your-railway-app>.up.railway.app`
   - **TTL:** 3600
3. Save changes
4. Wait 10-60 minutes for DNS propagation

---

## Step 9: Update OAuth Callbacks

Update your OAuth redirect URLs:

### Google Cloud Console:
- Old: `https://your-replit-url.replit.dev/api/auth/google/callback`
- New: `https://ggloop.io/api/auth/google/callback`

### Discord Developer Portal:
- Old: `https://your-replit-url.replit.dev/api/auth/discord/callback`
- New: `https://ggloop.io/api/auth/discord/callback`

### Twitch Developer Console:
- Old: `https://your-replit-url.replit.dev/api/auth/twitch/callback`
- New: `https://ggloop.io/api/auth/twitch/callback`

---

## Step 10: Test Everything

1. Visit `https://ggloop.io`
2. Test login with Google/Discord/Twitch
3. Check that database is working
4. Verify points system works

---

## Step 11: Cancel Replit 🎉

Once everything works on Railway:

1. Go to Replit
2. Settings → Billing
3. Cancel subscription
4. **Save $15-35/month!**

---

## Troubleshooting

### Build fails:
- Check Railway logs for errors
- Make sure all env vars are set
- Verify `package.json` has correct build script

### Database connection error:
- Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running
- Run `npm run db:push` manually in Railway console

### OAuth not working:
- Update callback URLs in OAuth providers
- Check `BASE_URL` env var matches your domain
- Verify SSL is working (Railway provides free SSL)

---

## Cost Breakdown

**Railway Pricing:**
- First $5: FREE (trial credit)
- After: ~$5/month for hobby plan
- PostgreSQL: Included
- SSL: Included
- Custom domain: Included

**vs Replit:**
- Replit: $20-40/month
- **You save: $15-35/month = $180-420/year**

---

## Next Steps After Deployment

1. ✅ Deploy to Railway
2. ✅ Point domain
3. ✅ Cancel Replit
4. 🎯 Set up Tremendous API (automated rewards)
5. 🎯 Configure Stripe payments
6. 🎯 Launch and get customers!

---

**Questions?** Check Railway docs: https://docs.railway.app
