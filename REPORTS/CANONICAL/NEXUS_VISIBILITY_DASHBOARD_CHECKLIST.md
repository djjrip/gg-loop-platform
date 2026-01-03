# NEXUS VISIBILITY DASHBOARD CHECKLIST

**Status:** VALIDATION READY  
**Last Updated:** 2026-01-03T17:56:53Z  
**Owner:** AG (Ops)

---

## What Pages Show Movement

### 1. FounderHub (Desktop App)

| Panel | Should Show | Status |
|-------|-------------|--------|
| Last heartbeat | Timestamp + status emoji | 🟡 Needs work |
| Last deploy | Commit hash + time | 🟡 Needs work |
| Revenue status | $X / Founding Members count | 🟡 Needs work |
| Payments live? | Boolean (yes/no) | 🟡 Needs work |
| Activity feed | Last 5 entries | 🟡 Needs work |

### 2. Files in Detailed CHATGPT Reports Folder

| File | Purpose | Freshness Check |
|------|---------|-----------------|
| NEXUS_HEARTBEAT.md | Is system alive? | < 90 min old |
| NEXUS_ACTIVITY_FEED.md | What happened? | Entries today |
| NEXUS_DAILY_SNAPSHOT.md | Daily summary | Today's date |
| REVENUE_SIGNAL_SCOREBOARD.md | Revenue tracking | Updated today |

### 3. Repo /REPORTS/CANONICAL/

| File | Purpose |
|------|---------|
| All operational reports | Canonical source |
| Mirrored to local folder | Founder visibility |

---

## How to Validate Movement

### 30-Second Test (Founder)

1. Open: `C:\Users\Jayson Quindao\Desktop\GG LOOP\Detailed CHATGPT reports\`
2. Check NEXUS_HEARTBEAT.md:
   - Is status 🟢?
   - Is LAST PULSE within 90 minutes?
3. Check NEXUS_ACTIVITY_FEED.md:
   - Are there entries from today?
4. Check NEXUS_DAILY_SNAPSHOT.md:
   - Is date today?

**If all pass → System is alive.**

---

## Public-Lite Mode (No Login Required)

For proving system is alive without exposing private data:

### What Should Be Public
- Last heartbeat time
- System status (🟢/🔴)
- Payments configured? (yes/no)
- Last deploy time

### What Stays Private
- Revenue numbers
- User data
- Activity feed details
- Internal metrics

### Implementation
Create `/api/public/status` endpoint returning:
```json
{
  "alive": true,
  "lastPulse": "2026-01-03T17:56:53Z",
  "paymentsConfigured": false,
  "lastDeploy": "2026-01-03T17:46:03Z"
}
```

Display on homepage or /status page.

---

## Validation Checklist

### Files (Check Daily)
- [ ] NEXUS_HEARTBEAT.md in local folder
- [ ] NEXUS_ACTIVITY_FEED.md in local folder
- [ ] NEXUS_DAILY_SNAPSHOT.md in local folder
- [ ] All files < 24 hours old

### App (If Implemented)
- [ ] FounderHub shows live data
- [ ] No "Login required" blocking observability
- [ ] Refresh shows updated timestamps

### API (If Implemented)
- [ ] /api/public/status returns valid JSON
- [ ] Status reflects actual system state
- [ ] No errors in response

---

## Failure States

| Symptom | Meaning | Fix |
|---------|---------|-----|
| HEARTBEAT > 90 min old | AG not pulsing | Check AG process |
| No activity entries today | Nothing logged | Check automation |
| Snapshot wrong date | Not regenerated | Trigger daily snapshot |
| Local folder empty | Mirror failed | Run mirror script |

---

## SLA Commitment

| Metric | Target |
|--------|--------|
| Heartbeat freshness | < 90 min |
| Activity feed entries | > 0 per day |
| Daily snapshot | Updated by midnight |
| Local mirror sync | < 5 min after update |

---

*Visibility without login = trust without guessing.*
