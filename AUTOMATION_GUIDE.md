# 🤖 Automation Setup Guide

Three automation tools to run GG Loop on autopilot and manage your job search.

---

## 1. Health Monitor (GG Loop Uptime)

**What it does:** Pings ggloop.io every hour, sends Discord alerts on failures

**Setup:**
```bash
# Test it first
node scripts/auto-health-monitor.js

# Run in background (keeps checking even if you close terminal)
# Windows PowerShell:
Start-Process node -ArgumentList "scripts/auto-health-monitor.js" -WindowStyle Hidden

# Or use Windows Task Scheduler for auto-start on boot
```

**Optional - Discord Alerts:**
1. Go to your Discord server settings
2. Integrations → Webhooks → New Webhook
3. Copy webhook URL
4. Add to `.env`: `DISCORD_FOUNDER_WEBHOOK_URL=https://discord.com/api/webhooks/...`

**Logs:** Check `logs/health-monitor.log` for uptime history

---

## 2. Job Application Tracker

**What it does:** Track applications, interviews, responses with stats dashboard

**Setup:**
```bash
# Open in browser (double-click the file or):
start scripts/job-tracker.html

# Or serve it locally:
npx http-server scripts -p 8080
# Then visit: http://localhost:8080/job-tracker.html
```

**Features:**
- Add applications (company, role, date, status)
- Track response rate automatically
- Export to CSV for analysis
- Data saved in browser (no server needed)

**Pro tip:** Open it once daily, update statuses, see your progress

---

## 3. LinkedIn Content Generator

**What it does:** Generate LinkedIn posts about GG Loop using AI

**Setup:**
```bash
# Make sure AWS credentials are configured
# (They should be if Twitter automation works)

# Generate one post
node scripts/linkedin-auto-content.js

# Generate 3 posts at once
node scripts/linkedin-auto-content.js --batch --count=3

# Custom topic
node scripts/linkedin-auto-content.js --topic="shipped new feature" --tone="excited"

# List saved posts
node scripts/linkedin-auto-content.js --list
```

**Generated posts saved to:** `linkedin-posts/` folder

**Workflow:**
1. Run generator weekly
2. Review posts in `linkedin-posts/`
3. Pick best one, copy to LinkedIn
4. Maintain visibility without writing from scratch

---

## Recommended Schedule

**Daily:**
- Health monitor runs automatically (no action needed)
- Update job tracker with new applications (2 min)

**Weekly:**
- Generate 3 LinkedIn posts (5 min)
- Post best one to LinkedIn (2 min)
- Review health monitor logs (1 min)

**Total time:** ~10 min/week for full automation + visibility

---

## Troubleshooting

**Health monitor not working?**
- Check `logs/health-monitor.log` for errors
- Verify ggloop.io is accessible in browser
- Run `node scripts/auto-health-monitor.js` manually to see errors

**LinkedIn generator failing?**
- Check AWS credentials: `aws sts get-caller-identity`
- Verify Bedrock model access in AWS console
- Fallback posts will generate even if AI fails

**Job tracker not saving?**
- Enable browser cookies/localStorage
- Try different browser (Chrome/Firefox)
- Data is browser-specific (won't sync across devices)

---

## Next Steps

1. Start health monitor NOW (keep GG Loop alive)
2. Open job tracker, bookmark it
3. Generate your first LinkedIn post

Let automation handle the boring stuff. You focus on revenue.
