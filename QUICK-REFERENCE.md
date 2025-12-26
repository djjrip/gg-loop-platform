# GG LOOP - Quick Reference
**Essential commands and links for CEO**

---

## ⚡ ULTRA-QUICK DEPLOY

**One-click morning routine:**
```powershell
Right-click: CEO-AUTO-DEPLOY.ps1
Select: "Run with PowerShell"
```
**Does everything:** Commit → Push → Wait → Verify → Email

---

## 🚀 DEPLOY COMMANDS

```batch
# Automated (recommended)
CEO-AUTO-DEPLOY.ps1       # One script does it all

# Manual
DEPLOY-ALL.bat            # Deploy everything
DEPLOY-ROADMAP.bat        # Fix roadmap 404s
DEPLOY-TWITTER-FIX.bat    # Stop Twitter spam

# Test before deploying
TEST-DEPLOYMENT.bat       # Run validation checks
```

## 🤖 DISCORD BOT

```batch
# Setup (one-time)
SETUP-DISCORD-BOT.bat

# Test configuration
TEST-DISCORD-BOT.bat

# Run bot
cd discord-bot
npm run dev
```

**Setup Guide:** discord-bot/README.md

## 🔗 IMPORTANT LINKS

**Production:**
- Site: https://ggloop.io
- Roadmap: https://ggloop.io/roadmap
- AWS Roadmap: https://ggloop.io/aws-roadmap
- Admin: https://ggloop.io/admin

**Services:**
- Railway: https://railway.app
- GitHub: https://github.com/djjrip/gg-loop-platform
- SendGrid: https://sendgrid.com
- Discord Dev: https://discord.com/developers

**Social:**
- Discord: https://discord.gg/X6GXg2At2D
- Twitter: @ggloopllc
- TikTok: @gg.loop
- LinkedIn: /company/ggloop

## 📧 EMAIL COMMANDS

```powershell
# Send Early Access email
$env:SENDGRID_API_KEY="YOUR_SENDGRID_API_KEY_HERE"
# NOTE: Never commit real keys to the repository. Use environment variables.
node send-the-real-one.cjs
```

**Automated:** CEO-AUTO-DEPLOY.ps1 does this for you

## 🗂️ KEY DOCUMENTS

**Start Here:**
- WAKE-UP-CHECKLIST.md - Morning routine
- CEO_ACTION_PLAN.md - Master guide
- GOOD_MORNING.md - Today's briefing

**Implementation:**
- DISCORD_BOT_COMPLETE.md - Bot walkthrough
- DESKTOP_APP_ARCHITECTURE.md - Gameplay verifier design
- PRIORITY_MATRIX.md - What to build next

**Reference:**
- SESSION_COMPLETE.md - Full auto-mode summary
- DEPLOYMENT_VERIFICATION.md - Post-deploy checklist
- MASTER_INDEX.md - All 40+ files cataloged

## 🔧 TROUBLESHOOTING

**Site Down:**
1. Check Railway dashboard
2. View deployment logs
3. Check server/routes.ts for errors

**Build Failing:**
1. Run `npm run build` locally
2. Check for TypeScript errors
3. Verify all imports exist

**Discord Bot Not Responding:**
1. Check bot token in .env
2. Verify Message Content Intent enabled
3. Check bot role is high enough

**Email Not Sending:**
1. Verify SENDGRID_API_KEY is set
2. Check SendGrid dashboard
3. Test: `node send-the-real-one.cjs`

## 📊 MONITORING

**Check Site Status:**
```powershell
# Test if site is up
Invoke-WebRequest -Uri "https://ggloop.io" -UseBasicParsing
```

**View Logs:**
- Railway: Click project → Deployments → View logs

**Analytics:**
- SendGrid: Dashboard → Activity Feed
- Discord: Server Insights

## 🆘 EMERGENCY CONTACTS

**If Everything Breaks:**
1. Check #1: Railway deployment logs
2. Check #2: Server console errors  
3. Rollback: `git revert HEAD && git push`
4. Contact: dev@ggloop.io (AI support)

## ⚡ QUICK FIXES

**502 Error:**
- Usually Railway deployment issue
- Check env vars are set
- Restart: Railway dashboard → Restart

**404 on New Route:**
- Clear browser cache (Ctrl+Shift+R)
- Verify build completed
- Check dist/ folder has updated files

**Email Not Sending:**
- Verify SENDGRID_API_KEY set
- Check SendGrid dashboard for blocks
- Use CEO-AUTO-DEPLOY.ps1 (sets key automatically)

## 🎯 DAILY TASKS

**Morning:**
- [ ] Run CEO-AUTO-DEPLOY.ps1 (or check deployment manually)
- [ ] Verify ggloop.io is up
- [ ] Review SendGrid email metrics

**Weekly:**
- [ ] Update roadmap-progress.json
- [ ] Check outreach bot results
- [ ] Review Discord community

## 📈 SUCCESS METRICS

**Track Weekly:**
- New user signups
- Email open rates
- Discord member count
- Outreach response rate
- Site uptime %

**Targets:**
- Uptime: > 99%
- Email open: > 20%
- Outreach response: > 5%
- User growth: +10% weekly

---

**🚀 TIP:** Bookmark `CEO-AUTO-DEPLOY.ps1` for fastest morning launches!
