# GG LOOP Desktop Verification Strategy: System Design

**Status:** ARCHITECTURE & STRATEGY (No Code)
**Date:** 2025-12-19
**Type:** Technical Foundation

## 1. Executive Summary
The GG LOOP Desktop App is a **High-Fidelity Trust Engine**. It is NOT a kernel-level anti-cheat, nor is it spyware. Its sole purpose is to verify **human presence** and **session consistency** to unlock higher-value rewards.

## 2. Core Architecture: "The Launcher"
The app is a lightweight shell that handles:
1.  **Auth Integration:** Secure handshake with `ggloop.io` via OAuth/JWT.
2.  **Heartbeat:** Sending a signed pulse every 30-60s confirming "App is active".
3.  **Update Engine:** Auto-updating itself and its adapters.
4.  **Signal Aggregator:** Collecting data from adapters and encrypting it for transmission.

### 2.1 What It Does NOT Do
*   **NO Kernel Drivers:** We operate strictly in user-space (ring 3).
*   **NO Personal Scanning:** No reading browser history, emails, or unrelated files.
*   **NO "Cheat Guarantee":** We verify *effort*, not strict competitive integrity (we leave that to Vanguard/VAC).

## 3. The Adapter System (Plug-in Model)
To support many games without bloating the core, we use an **Adapter Pattern**.

### 3.1 Adapter Structure
Each supported game has a dedicated "Adapter" (a small JS/DLL module) that knows how to check for that specific game.

*   **ProcessAdapter:** Checks if specific `.exe` is running (e.g., `LeagueClient.exe`).
*   **LogAdapter:** Safe parsing of local log files (e.g., Riot LCU logs) for events like "GameStart", "GameEnd".
*   **RichPresenceAdapter:** Reading Discord Rich Presence (if available/reliable).

### 3.2 Deployment Strategy
1.  **Core Launcher:** Installed once.
2.  **Adapters:** Downloaded on-demand. If user plays League, they get the League Adapter.

## 4. Priority Roadmap
### Tier 1: Competitive Anchors
*   **League of Legends:** LCU API + Process check.
*   **Valorant:** Process check + Log parsing.
*   **Counter-Strike 2:** Game State Integration (GSI) + Process check.

### Tier 2: Community Requests (Phase 3 Signal)
*   Driven by data from `/request-game`.
*   Games with verifiable public APIs prioritized.

## 5. Security & Trust
*   **Transparencyst:** The app will have a "Debug View" showing users exactly what data is being sent.
*   **Privacy:** Data is ephemeral where possible.
*   **Signature:** All heartbeats are HMAC signed to prevent replay attacks.

