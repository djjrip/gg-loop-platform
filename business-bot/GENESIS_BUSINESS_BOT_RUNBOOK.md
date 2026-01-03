# GG LOOP Business Bot - Genesis Runbook

**Created:** January 2, 2026  
**Purpose:** Autonomous monitoring and self-healing for GG LOOP platform

---

## What This Bot Does

The Business Bot continuously monitors:

| System | What It Checks | Why It Matters |
|--------|----------------|----------------|
| **Frontend** | Homepage loads (not 503) | Users can access the site |
| **Backend** | API health endpoint responds | Server is running |
| **Database** | Connection status | Data is accessible |
| **Deployment** | Latest commit vs running version | No silent deploy failures |
| **Freshness** | Days since last update | Business is active |

---

## Understanding States

| State | Emoji | Meaning | Required Action |
|-------|-------|---------|-----------------|
| **HEALTHY** | 🟢 | All systems operational | None |
| **DEGRADED** | 🟡 | Minor issues detected | Review warnings |
| **BROKEN** | 🔴 | Critical failure | Immediate action required |

---

## Running the Bot

### Manual Check (Local)
```bash
npm run business-bot:run
```

This will:
1. Check all systems
2. Print results to console
3. Generate `business-bot/status.json`
4. Generate `business-bot/STATUS.md`

### Scheduled Check (Future)
The bot can be scheduled via:
- Railway cron job
- GitHub Actions workflow
- Node-cron within the server

---

## What To Do When State is BROKEN

### If Frontend is Down (503)

**Cause:** `dist/public/` directory is missing on Railway

**Fix:**
1. Go to https://railway.app/dashboard
2. Click **GG-LOOP-PLATFORM**
3. Click **Deployments** (left sidebar)
4. Click **Deploy** button (top right)
5. Select latest commit
6. Wait 3-5 minutes

**Verify:** https://ggloop.io should show homepage (not maintenance)

---

### If Backend is Down

**Cause:** Server crashed or database connection failed

**Fix:**
1. Go to https://railway.app/dashboard
2. Click **GG-LOOP-PLATFORM**
3. Check **Logs** for error messages
4. If database error: Check NeonDB status
5. Click **Restart** if needed

**Verify:** https://ggloop.io/api/health returns `{"status":"healthy"}`

---

### If Deploy is Stale

**Cause:** Commits pushed but Railway didn't auto-deploy

**Fix:**
1. Go to https://railway.app/dashboard
2. Click **Settings** → **Triggers**
3. Ensure "Deploy on push" is enabled for `main`
4. If already enabled, click **Deploy** manually

**Verify:** Run `npm run business-bot:run` again — should show uptime < 5 min

---

## Output Files

| File | Format | Location | Purpose |
|------|--------|----------|---------|
| `status.json` | JSON | `business-bot/` | Machine-readable status |
| `STATUS.md` | Markdown | `business-bot/` | Human-readable report |

---

## How To Verify a Fix Worked

After taking corrective action:

1. Wait 3-5 minutes for deployment
2. Run: `npm run business-bot:run`
3. Check: State should be **HEALTHY** 🟢
4. Verify: https://ggloop.io loads properly

---

## Notification Hooks (Future)

The bot is designed to support notifications via:

| Channel | Environment Variable | Status |
|---------|---------------------|--------|
| Discord | `DISCORD_FOUNDER_WEBHOOK_URL` | Hook ready |
| Email | `FOUNDER_ALERT_EMAIL` | Hook ready |

These are not wired yet but can be enabled by setting the environment variables.

---

## Architecture

```
business-bot/
├── index.ts            # Main orchestrator
├── config.ts           # Configuration values
├── types.ts            # TypeScript types
├── watchdog-frontend.ts    # 503/maintenance detection
├── watchdog-backend.ts     # API health checks
├── deployment-agent.ts     # Stale deploy detection
├── freshness-agent.ts      # Business activity tracking
├── status-reporter.ts      # Artifact generation
├── status.json         # [Generated] Machine status
└── STATUS.md           # [Generated] Human status
```

---

## Design Philosophy

1. **Detection over Alerts** — Find problems before they're reported
2. **Visibility over Silence** — Always produce status artifacts
3. **Simplicity over Complexity** — Node scripts, not heavy infra
4. **Autonomy over Instructions** — Bot knows what to check

---

*This runbook is part of the GG LOOP Genesis Business Bot system.*
