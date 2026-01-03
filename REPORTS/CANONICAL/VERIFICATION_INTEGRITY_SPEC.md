# VERIFICATION INTEGRITY SPEC

**Status:** MANDATORY STANDARD  
**Created:** 2026-01-03T21:06:08Z  
**Owner:** AG (Antigravity) — Governance  
**Enforcement:** Cursor AI (Implementation)

---

## Executive Summary

Points must ONLY accrue during verifiable in-game activity.

Keyboard/mouse input alone is **NOT** sufficient evidence of gameplay.
This spec defines what counts as "real play" and how to prove it.

---

## What Counts as "Real Play"

### Required Signals (ALL must be true)

| Signal | Description | Weight |
|--------|-------------|--------|
| Game Process Active | Recognized game .exe running | Required |
| Game Window Foreground | Game is the active window | Required |
| Session Duration | Minimum 5 minutes continuous | Required |
| Heartbeat Consistency | Regular heartbeats from desktop app | Required |
| Account Binding | Valid userId attached to all data | Required |

### Signals That Do NOT Count

| Signal | Why Not |
|--------|---------|
| Keyboard activity alone | Could be typing in Discord/browser |
| Mouse movement alone | Could be clicking anywhere |
| Game installed | Not running ≠ playing |
| Game in background | Not active focus |
| Self-reported gameplay | No verification |

---

## Verification States

| State | Definition | Points? |
|-------|------------|---------|
| NOT_PLAYING | No recognized game process | ❌ No |
| GAME_DETECTED | Game process found, not yet confirmed | ❌ No |
| ACTIVE_PLAY_CONFIRMED | Game foreground + duration met | ✅ Yes |
| PAUSED / IDLE | Game running but no activity | ❌ No |
| ERROR | Verification failure (explain why) | ❌ No |

**Points accrue ONLY in ACTIVE_PLAY_CONFIRMED state.**

---

## Fraud Vectors + Mitigations

### Vector 1: Fake Process Names
**Attack:** Rename any .exe to "VALORANT.exe"
**Mitigation:** 
- Process hash validation
- Check parent process chain
- Verify window title matches expected pattern

### Vector 2: Game Running in Background
**Attack:** Launch game, minimize, do other things
**Mitigation:**
- Require game window to be foreground
- Check window focus periodically
- Idle detection within game context

### Vector 3: Keyboard/Mouse Spamming
**Attack:** Use autoclicker or typing macro
**Mitigation:**
- Input activity alone does NOT count
- Require game process + foreground + input
- Pattern detection for inhuman input rates

### Vector 4: Session Spoofing
**Attack:** Send fake heartbeats to server
**Mitigation:**
- Server-side session validation
- Heartbeat must include process verification
- Anomaly detection (impossible session lengths)

### Vector 5: Account Hijacking
**Attack:** Earn points on someone else's account
**Mitigation:**
- Explicit account binding on desktop app
- Display current user prominently
- One device per active session

---

## Required Signals for ACTIVE_PLAY_CONFIRMED

To transition to ACTIVE_PLAY_CONFIRMED, ALL of the following must be true:

```
1. game_process_detected: true
   - Process name matches recognized games list
   - Process hash validates (optional, future)

2. game_window_foreground: true
   - Game window has active focus
   - Checked every 10 seconds

3. session_duration: >= 300 seconds (5 min)
   - Continuous foreground time
   - Resets on alt-tab or minimize

4. heartbeat_valid: true
   - Last heartbeat < 60 seconds ago
   - Contains userId, gameId, timestamp

5. user_authenticated: true
   - Valid session token
   - Matches desktop app binding
```

---

## Server-Side Enforcement

### Validation Rules

| Rule | Action on Failure |
|------|-------------------|
| Missing game_process | Reject heartbeat, log |
| Session < 5 min | Hold points, don't award |
| Heartbeat gap > 2 min | Mark session incomplete |
| Multiple sessions same user | Reject newest, alert |
| Suspicious patterns | Flag for manual review |

### Logging

All verification events must be logged:
- Session start/stop
- State transitions
- Points awarded
- Rejections with reason

---

## Desktop App UI Requirements

### Always Visible

| Element | Purpose |
|---------|---------|
| Connected user | "Connected as: [username]" |
| Current state | "ACTIVE_PLAY_CONFIRMED" etc. |
| Points status | "Points accruing" or "Points paused" |
| Reason | "Game detected: VALORANT" or "No game running" |

### Real-time Feedback

- Why points are/aren't accruing (plain English)
- Current session duration
- Game detected (name + icon if possible)

---

## Web Dashboard Requirements

### Verified Sessions View

| Field | Description |
|-------|-------------|
| Game | Which game was played |
| Duration | How long (verified) |
| Points earned | Amount awarded |
| Verified badge | ✅ if fully verified |
| Timestamp | When session ended |

---

## Recognized Games List (Initial)

| Game | Process Names |
|------|---------------|
| VALORANT | VALORANT.exe, VALORANT-Win64-Shipping.exe |
| League of Legends | LeagueClient.exe, LeagueClientUx.exe, League of Legends.exe |
| Fortnite | FortniteClient-Win64-Shipping.exe |
| Apex Legends | r5apex.exe |
| CS2 | cs2.exe |
| Overwatch | Overwatch.exe |

**Expandable via config, not hardcoded.**

---

## Certification Criteria

For Cursor to pass AG certification:

1. ✅ Points only accrue in ACTIVE_PLAY_CONFIRMED
2. ✅ Game process detection implemented
3. ✅ Foreground check implemented
4. ✅ Account binding visible and enforced
5. ✅ Server rejects unverified heartbeats
6. ✅ Desktop UI shows verification state
7. ✅ Web shows verified sessions

---

*This spec is the source of truth for verification integrity.*
