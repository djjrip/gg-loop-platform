# INNOVATION SPEC: Verification Confidence Meter

**Status:** DESIGN ONLY — NO IMPLEMENTATION  
**Created:** 2026-01-03T21:06:08Z  
**Owner:** AG (Antigravity) — Innovation Track

---

## Feature Overview

Display a 0–100% confidence score for each gameplay verification session.

Higher confidence = more certainty that gameplay is legitimate.

---

## Confidence Factors

### Positive Signals (+%)

| Signal | Impact | Max Contribution |
|--------|--------|------------------|
| Game process detected | High | +30% |
| Game window foreground | High | +25% |
| Session duration > 30 min | Medium | +15% |
| Consistent heartbeats | Medium | +10% |
| Known device/IP | Low | +5% |
| Account age > 7 days | Low | +5% |
| Previous verified sessions | Low | +5% |
| Trust score history | Low | +5% |

### Negative Signals (-%)

| Signal | Impact | Reduction |
|--------|--------|-----------|
| Game in background | High | -30% |
| Heartbeat gaps | Medium | -15% |
| First-time user | Low | -5% |
| New device | Low | -5% |
| Suspicious input patterns | High | -20% |
| Multiple sessions same time | Critical | -50% |

---

## Confidence Tiers

| Score | Label | UI Color | Trust |
|-------|-------|----------|-------|
| 90-100% | Verified | 🟢 Green | Full points |
| 70-89% | High | 🟢 Green | Full points |
| 50-69% | Medium | 🟡 Yellow | Reduced points (75%) |
| 30-49% | Low | 🟠 Orange | Held for review |
| 0-29% | Suspicious | 🔴 Red | Rejected |

---

## User Interface (Conceptual)

### Desktop App

```
┌─────────────────────────────────────┐
│ Verification Status                 │
├─────────────────────────────────────┤
│ Game: VALORANT                      │
│ Session: 47 minutes                 │
│                                     │
│ Confidence: ████████░░ 82%          │
│ Status: VERIFIED ✅                 │
│                                     │
│ Points this session: +47            │
└─────────────────────────────────────┘
```

### Web Dashboard

```
┌───────────────────────────────────────────────────────────────┐
│ Recent Sessions                                               │
├───────────────────────────────────────────────────────────────┤
│ VALORANT     │ 1h 23m │ +83 pts │ ████████░░ 85% │ ✅ Verified │
│ League       │ 45m    │ +45 pts │ ███████░░░ 72% │ ✅ Verified │
│ Apex Legends │ 12m    │ +8 pts  │ █████░░░░░ 54% │ 🟡 Medium   │
└───────────────────────────────────────────────────────────────┘
```

---

## Backend Calculation

```typescript
function calculateConfidence(session: VerificationSession): number {
  let score = 0;
  
  // Positive signals
  if (session.gameProcessDetected) score += 30;
  if (session.gameIsForeground) score += 25;
  if (session.durationMinutes >= 30) score += 15;
  if (session.heartbeatConsistent) score += 10;
  if (session.knownDevice) score += 5;
  if (session.accountAgedays > 7) score += 5;
  if (session.previousVerifiedCount > 0) score += 5;
  if (session.trustScore > 200) score += 5;
  
  // Negative signals
  if (session.wasInBackground) score -= 30;
  if (session.heartbeatGaps > 2) score -= 15;
  if (session.isFirstSession) score -= 5;
  if (session.newDevice) score -= 5;
  if (session.suspiciousInputPattern) score -= 20;
  if (session.concurrentSessions > 1) score -= 50;
  
  return Math.max(0, Math.min(100, score));
}
```

---

## Use Cases

### For Users
- Understand why a session is trusted or flagged
- Build confidence over time with legitimate play
- Transparency in point earning

### For GG LOOP
- Automatic fraud detection
- Graduated trust system
- Reduced manual review load
- Scalable verification

---

## Implementation Priority

| Phase | Scope |
|-------|-------|
| Now | Spec only (this document) |
| Phase 1 | Basic binary (verified/not) |
| Phase 2 | Confidence meter if demand |

---

*Design spec only. Implements after basic verification is certified.*
