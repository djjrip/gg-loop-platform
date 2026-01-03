# ANTI-CHEAT LEVEL 1 ENFORCEMENT

**Status:** ENFORCEABLE TODAY  
**Last Updated:** 2026-01-03T17:56:53Z  
**Owner:** AG (Ops)

---

## Level 1 Controls (Active Now)

### 1. Rate Limits

| Limit | Value | Action on Violation |
|-------|-------|---------------------|
| Points per hour | 500 max | Flag + hold excess |
| Sessions per day | 20 max | Flag + reject new |
| Verifications per minute | 2 max | Reject + log |
| Account age < 24h | Limited trust | 50% point cap |

### 2. Anomaly Flags

| Pattern | Flag Type | Action |
|---------|-----------|--------|
| Session < 5 minutes | Low quality | Warning |
| Session > 8 hours | Suspicious | Review |
| 10+ sessions same game/day | Grinding | Review |
| Points spike (5x normal) | Anomaly | Hold + review |
| Multiple accounts same device | Abuse | Immediate hold |

### 3. Trust Score

| Score | Meaning | Privileges |
|-------|---------|------------|
| 100 | New account | Limited (50% cap) |
| 200 | 7 days clean | Normal |
| 300 | 30 days clean | Trusted |
| 400+ | Verified human | Priority payouts |
| 0 | Flagged/Banned | Suspended |

**Score increases:** +10/day for clean activity  
**Score decreases:** -50 per flag, -100 per confirmed violation

---

## Review Queue

### Automatic Queue Entry
Accounts flagged enter manual review queue when:
- Trust score < 100
- Anomaly flags > 3 in 24h
- Points request > 1000 in single day
- Device binding conflict

### Review Process
1. AG or admin reviews flagged account
2. Check session history
3. Check device/IP patterns
4. Decision: Clear / Warn / Suspend / Ban

### Timeline
- Review within 48 hours
- User notified of outcome
- Appeal path available

---

## Consequences

| Violation | First Offense | Second | Third |
|-----------|---------------|--------|-------|
| Minor anomaly | Warning | 7-day cap | Review |
| Rate limit abuse | Points reversed | 14-day suspend | Ban |
| Multi-account | Merge or ban | Ban | - |
| Confirmed fraud | Permanent ban | - | - |

---

## Appeal Path

1. User contacts support (Discord or email)
2. Provide account details + context
3. Review within 72 hours
4. Decision: Reinstate / Uphold / Partial

**Principle:** Assume good faith unless evidence proves otherwise.

---

## Device/Session Binding

| Binding | Implementation | Status |
|---------|----------------|--------|
| Device ID | Generated on desktop app install | ✅ Built |
| Account-Device link | 1 account per device (default) | 🟡 Partial |
| Session tokens | Signed per-session | ❌ Not yet |
| IP logging | For review only | ✅ Built |

---

## What This Does NOT Do

| Claim | Reality |
|-------|---------|
| "Prevents all cheating" | ❌ No - determined cheaters can bypass |
| "Detects game hacks" | ❌ No - we don't have kernel access |
| "100% automated" | ❌ No - manual review still needed |

**We're honest: Level 1 catches obvious fraud. Sophisticated cheaters need Level 2+.**

---

## Monitoring Dashboard

AG monitors:
- Flagged accounts count
- Review queue length
- False positive rate
- Ban rate
- Appeal success rate

Logged to: NEXUS_ACTIVITY_FEED.md

---

## Escalation

| Situation | Escalation |
|-----------|------------|
| > 50 flags/day | Investigate pattern |
| > 10% false positive | Tune rules |
| Organized fraud ring | Founder notification |
| Legal/PR risk | Immediate founder escalation |

---

*Level 1 = honest protection. Not magic, but real.*
