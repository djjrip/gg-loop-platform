# 🚀 Quick Deploy to Railway

## What You Need:
1. Railway account (sign up at railway.app with GitHub)
2. Your GitHub repo pushed with latest changes
3. 10 minutes

## Steps:

### 1. Commit and Push Your Code
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Go to Railway
1. Visit **https://railway.app**
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`djjrip/gg-loop-platform`**

### 3. Add PostgreSQL Database
1. In your project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates it automatically

### 4. Configure Environment Variables
Click your web service → **"Variables"** → Add these:

**Copy from your .env file:**
```
SESSION_SECRET=<from your .env>
RIOT_API_KEY=<from your .env>
```

**Add these new ones:**
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
BASE_URL=https://gg-loop-platform-production.up.railway.app
```

### 5. Update Start Command
1. Click your web service → **"Settings"**
2. Find **"Start Command"**
3. Set to: `npm run db:push && npm start`

### 6. Deploy!
- Railway auto-deploys
- Watch logs in dashboard
- Get your URL: `https://[your-app].up.railway.app`

### 7. Point Your Domain (ggloop.io)
1. In Railway: Settings → Domains → Custom Domain → Enter `ggloop.io`
2. Railway gives you a CNAME
3. In your domain provider: Add CNAME record pointing to Railway
4. Wait 10-60 minutes for DNS

### 8. Update OAuth Callbacks
Update redirect URLs in:
- Google Cloud Console
- Discord Developer Portal  
- Twitch Developer Console

Change from Replit URL to: `https://ggloop.io/api/auth/[provider]/callback`

### 9. Test Everything
1. Visit your Railway URL
2. Test login
3. Test points system
4. Verify database works

### 10. Cancel Replit! 🎉
Settings → Billing → Cancel

---

## Troubleshooting

**Build fails?**
- Check Railway logs
- Verify all env vars are set

**Database error?**
- Make sure `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running

**OAuth not working?**
- Update callback URLs in OAuth providers
- Check `BASE_URL` matches your domain

---

## Cost: $5/month (vs $20-40 on Replit)
**You save $180-420/year!**
