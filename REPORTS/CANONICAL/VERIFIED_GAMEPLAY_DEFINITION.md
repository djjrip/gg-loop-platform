# VERIFIED GAMEPLAY DEFINITION

**Status:** MINIMUM VIABLE DEFINED  
**Last Updated:** 2026-01-03T17:56:53Z  
**Owner:** AG (Ops)

---

## What Counts as "Verified" Today

### Level 1: Game Detection (Current)

| Requirement | Status |
|-------------|--------|
| Desktop app running | ✅ Required |
| Game process detected | ✅ Required |
| Session reported to backend | ✅ Required |
| Backend logs session | ✅ Required |

**Result:** Points awarded for detected gameplay sessions.

---

## What Does NOT Count as Verified Today

| Scenario | Status | Why |
|----------|--------|-----|
| Self-reported gameplay | ❌ Not verified | No proof |
| Mobile-only claims | ❌ Not verified | No desktop app |
| Match outcome verification | ❌ Not implemented | API integration needed |
| Anti-tamper checks | ❌ Not implemented | Can be spoofed |

---

## Minimum Viable Verification (Target)

To claim "verified gameplay," we need:

### Required (Must Have)
1. Desktop app detects game running
2. App submits session start/end timestamps
3. Backend validates timestamps are reasonable
4. Backend stores session record with status
5. User sees verification status in UI

### Nice to Have (Later)
1. Match ID verification via game API
2. Session proof cryptographic signing
3. Anti-tamper detection
4. Community reports integration

---

## Verification Flow

```
1. User opens desktop app
2. App detects game (VALORANT, League, etc.)
3. App sends: { gameId, startTime, deviceId, userId }
4. Backend receives and logs
5. Backend validates:
   - Timestamp reasonable?
   - Rate limits OK?
   - No duplicate sessions?
6. Backend returns: { sessionId, status: 'pending' }
7. Session ends → App sends: { sessionId, endTime }
8. Backend validates duration
9. Status updated: 'verified' or 'failed'
10. User sees status in dashboard
```

---

## Verification Statuses

| Status | Meaning | Points |
|--------|---------|--------|
| ✅ Verified | Session validated | Awarded |
| ⏳ Pending | Awaiting validation | Held |
| ❌ Failed | Validation failed | Not awarded |
| 🔍 Review | Flagged for manual review | Held |

---

## What User Sees

### In Desktop App
- Current session status
- Last verification result
- "Verified sessions today: X"

### In Web Dashboard
- Verification history
- Points from verified sessions
- Status of pending sessions

---

## Honest Assessment

| Claim | Reality |
|-------|---------|
| "Verified gameplay" | Game detection only (no match proof) |
| "Can't be cheated" | Can be spoofed with effort |
| "Fully automated" | Manual review still needed |

**We're honest about this. We don't pretend we've solved anti-cheat.**

---

## Path to Stronger Verification

| Phase | What | When |
|-------|------|------|
| Now | Game detection + session logging | ✅ Built |
| Month 1 | Rate limits + anomaly flags | In progress |
| Month 2 | Match API verification | Planned |
| Month 3+ | Cryptographic proofs | Future |

---

*Verified = detected + logged + validated. Not perfect, but honest.*
