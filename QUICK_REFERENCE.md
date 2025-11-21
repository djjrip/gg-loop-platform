# 🚀 Railway Deployment - Quick Reference Card

## ⚡ Deploy in 5 Steps

### 1️⃣ Create Railway Project
- Go to: **railway.app**
- Click: **"New Project"** → **"Deploy from GitHub"**
- Select: **`djjrip/gg-loop-platform`**

### 2️⃣ Add Database
- Click: **"+ New"** → **"Database"** → **"PostgreSQL"**

### 3️⃣ Set Environment Variables
Copy-paste into Railway Variables tab:
```
NODE_ENV=production
BASE_URL=https://ggloop.io
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=1266d2677444f863e2e794613bbaea2f9c36110903cd000ee1b6b9535aa02392
RIOT_API_KEY=RGAPI-d3fe3d17-b466-462a-9843-3642b4d4b83c
DISCORD_CLIENT_ID=1437711568925098034
DISCORD_CLIENT_SECRET=ajAFv8eiuMMalUaig3mHlQCjczsc1gyc
```

### 4️⃣ Set Start Command
- Go to: **Settings → Deploy**
- Set Custom Start Command: `npm run db:push && npm start`

### 5️⃣ Configure Domain
- **Railway**: Settings → Domains → Add `ggloop.io`
- **DNS Provider**: Add CNAME record pointing to Railway

---

## 🔑 Important URLs

| What | URL |
|------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| GitHub Repo | https://github.com/djjrip/gg-loop-platform |
| Your Site (after deploy) | https://ggloop.io |

---

## 📞 OAuth Callback URLs (Update After Deploy)

### Discord Developer Portal
- URL: https://discord.com/developers/applications
- Callback: `https://ggloop.io/api/auth/discord/callback`

### Google Cloud Console (when ready)
- URL: https://console.cloud.google.com
- Callback: `https://ggloop.io/api/auth/google/callback`

### Twitch Developer Console (when ready)
- URL: https://dev.twitch.tv/console
- Callback: `https://ggloop.io/api/auth/twitch/callback`

---

## ✅ Deployment Checklist

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Custom start command set
- [ ] Build completed successfully
- [ ] No errors in logs
- [ ] Site accessible via Railway URL
- [ ] Domain DNS configured
- [ ] Domain working (may take 10-60 min)
- [ ] Discord OAuth callback updated
- [ ] Tested login with Discord
- [ ] Verified database working

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check env vars are set, check logs |
| Blank page | Wait for build, check BASE_URL, check logs |
| Database error | Verify DATABASE_URL is `${{Postgres.DATABASE_URL}}` |
| OAuth not working | Update callback URLs in provider portals |
| Domain not working | Check DNS records, wait for propagation |

---

## 📊 Cost Breakdown

| Item | Cost |
|------|------|
| Railway Starter | $5/month |
| PostgreSQL | Included |
| SSL Certificate | Included |
| Custom Domain | Included |
| **Total** | **$5/month** |

**vs Replit: $20-40/month**  
**You save: $180-420/year! 🎉**

---

## 🆘 Emergency Contacts

- **Railway Docs**: docs.railway.app
- **Railway Discord**: railway.app/discord
- **GitHub Issues**: github.com/djjrip/gg-loop-platform/issues

---

## 📝 Local Development

### Start Local Server
```powershell
.\start-dev.ps1
```

### Access Locally
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

---

**Print this page and keep it handy! 📄**
