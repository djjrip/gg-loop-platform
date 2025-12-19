# Game Request Strategy (Feedback Loop)

**Status:** IMPLEMENTED (Phase 3 Complete)
**Date:** 2025-12-19

## 1. Technical Implementation
*   **Table:** `game_requests` (id, user_id, game_name, platform, notes).
*   **API:** `POST /api/requests/games`.
*   **UI:** `/request-game` (Simple React Hook Form + Zod validation).
*   **Access:** Authenticated users only.

## 2. The Strategy: "Lean Database Intake"


Instead of an external form (disconnected data) or a complex voting system (over-engineering), we will implement a **Simple Request Table**.

### 1. Database Schema (Draft)
```sql
TABLE game_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. User Interface
*   **Location:** A small section on the "Dashboard" or "Games" page.
*   **UI:** 
    *   Simple Input Field: "Request a Game..."
    *   Submit Button.
    *   Underneath: "Top Requested: [Game A], [Game B]" (Cached count).

### 3. Logic
*   **Throttle:** 1 request per user per day (prevent spam).
*   **Normalization:** Basic lowercase trim to group "Valorant" and "valorant".

### Why this approach?
*   **Low Tech Debt:** It's one table and one endpoint.
*   **Integrated:** Keeps the user on the platform.
*   **Data Ownership:** We own the interest data directly.

*Note: This is a design document. Implementation waits for Phase 3 Approval.*
