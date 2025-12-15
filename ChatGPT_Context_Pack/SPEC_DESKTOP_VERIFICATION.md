# SPECIFICATION: DESKTOP VERIFICATION APP
**Role:** The "Truth Oracle" for Gameplay.

## 1. ARCHITECTURE
*   **Core:** Electron (Cross-platform wrapper).
*   **Frontend:** React (Shared components with Web).
*   **Backend Interface:** Secure WebSocket + REST.

## 2. FUNCTIONAL FLOW
1.  **User Login:** OAuth via Browser (Deep link back to App `ggloop://auth`).
2.  **Idle State:** App sits in tray, monitoring process list for `LeagueClient.exe` or `VALORANT.exe`.
3.  **Active State:**
    *   Game Detected.
    *   App connects to LCU (League Client Update) API (Localhost).
    *   App listens for "GameStart" and "GameEnd" events.
4.  **Verification:**
    *   On "GameEnd", App grabs Match ID.
    *   App sends Match ID + User Hash to GG LOOP Server.
    *   GG LOOP Server calls Riot API to verify Match ID exists and User was in it.
    *   **Result:** Points Awarded.

## 3. SECURITY & ANTI-CHEAT
*   **Level 1 (MVP):** Server-side verification. The app is just a "messenger". We trust the Riot API, not the client.
*   **Level 2 (Beta):** Process integrity. Ensure no known cheat processes are running (basic list).
*   **Level 3 (Omega):** Kernel level (Likely out of scope / too invasive). Stay at Level 2.

## 4. GAME SUPPORT ROADMAP
*   **Tier 1 (API Rich):** League of Legends, Valorant, Dota 2. (Easy, robust APIs).
*   **Tier 2 (Log Parsing):** CS2, Overwatch 2. (Requires reading log files on disk).
*   **Tier 3 (Image Rec):** Console Games via Capture Card. (Future/Hard).

## 5. DEVELOPMENT PATH
*   **MVP (Weeks 1-4):**
    *   Shell App.
    *   Process Detection.
    *   Manual "Check for Match" button.
*   **Beta (Weeks 5-8):**
    *   Auto-detection.
    *   Overlay notification ("Tracking Active").

## 6. DATA MODEL (Client-Side)
```json
{
  "client_version": "1.0.0",
  "active_game": "League of Legends",
  "session_id": "uuid",
  "events": [
    { "timestamp": 123456789, "type": "GAME_START" },
    { "timestamp": 123456999, "type": "GAME_END", "data": { "matchId": "NA1_12345" } }
  ]
}
```
