# GG LOOP Desktop verification Strategy

**Status:** STRATEGY ONLY (No Code Yet)
**Date:** 2025-12-19

## 1. Core Functionality
The desktop app serves one primary purpose: **High-Fidelity Human Verification.**
Web APIs (OAuth) prove you *own* an account. The Desktop App proves you are *playing* on it right now, on a real machine.

### Key Signals:
1.  **Process Presence:** Is the game (e.g., `LeagueClient.exe`) running?
2.  **Session Heartbeat:** Is the process active for a human-like duration?
3.  **Hardware Signature:** Is this a unique, physical machine (not a VM farm)?

## 2. Multi-Game Architecture
We will not build a separate app for every game. We will build **One Launcher with Pluggable Adapters**.

*   **The Core:** Handle update, auth, heartbeat, and signal transmission to GG LOOP servers.
*   **The Adapters:** Tiny logic blocks specific to each game.
    *   *Adapter A (League):* Checks for `LeagueClient.exe`.
    *   *Adapter B (Valorant):* Checks for `VALORANT.exe`.
    *   *Adapter C (CS2):* Checks for `cs2.exe`.

## 3. Boundaries (What We Will NOT Do)
*   **No Kernel Access:** We are not building Vanguard or EasyAntiCheat. We operate in user-space.
*   **No Personal Spying:** We do not read browser history, keystrokes (outside game focus), or personal files.
*   **No Screen Recording:** We do not stream your desktop.

## 4. New Game Intake Process
How do we decide which game to add next?
1.  **Demand:** User requests (via Feedback Loop).
2.  **Feasibility:** strictly strictly requires publicly visible process signals or local logs we can parse safely.
3.  **Integrity:** Can we trust the signal? (High-risk games for botting may be deprioritized).

**Implementation Priority:**
1.  League of Legends (MVP)
2.  Valorant (Primary Shooter)
3.  Community Vote Winner
