# SPECIFICATION: SPONSOR SELECTION MVP
**Role:** The "Marketing Hook" made real.

## 1. OBJECTIVE
Allow users to "Sign a Deal" with a brand, persisting that choice to the database, and reflecting it in the UI.

## 2. DATABASE SCHEMA
**New Table:** `user_sponsors`
```sql
CREATE TABLE user_sponsors (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  sponsor_id INT REFERENCES sponsors(id),
  status VARCHAR(50) DEFAULT 'active', -- active, terminated, completed
  tier VARCHAR(50) DEFAULT 'rookie', -- rookie, pro, elite
  signed_at TIMESTAMP DEFAULT NOW(),
  contract_end_at TIMESTAMP
);
```

**Updates to:** `users`
*   Add: `current_sponsor_id` (Cache for fast lookup).

## 3. FRONTEND UI FLOW

### Step 1: Trigger
*   **Post-Onboarding:** After verifying email/subscription.
*   **Dashboard:** "Sign a Deal" card if no sponsor selected.

### Step 2: The Selector Modal
*   **Headline:** "CHOOSE YOUR SPONSOR"
*   **Subhead:** "Select the brand you want to represent. This unlocks their specific reward track."
*   **Grid:**
    *   Card 1: Logitech G (Logo, "Peripherals Track", "Open")
    *   Card 2: Nike (Logo, "Lifestyle Track", "Waitlist")
    *   Card 3: Razer (Logo, "Tech Track", "Open")
*   **Action:** Click Brand -> "Confirm Contract" -> Animation (Confetti/Signature effect).

### Step 3: The Dashboard Reflection
*   **Header:** "Welcome, [User] | [Logitech G] Rookie"
*   **Theme:** (Optional) UI accents change to Brand Color (Blue for Logitech, Green for Razer).
*   **Badge:** Display "Logitech G Contract Active" badge.

## 4. ADMIN REVIEW PANEL
*   **View:** `Detailed User View`
*   **Section:** "Sponsorship History"
*   **Actions:**
    *   "Terminate Contract" (Reset user).
    *   "Upgrade Tier" (Manual promotion).

## 5. ESTIMATED EFFORT
*   **Backend:** 2 Hours (Schema + API).
*   **Frontend:** 4 Hours (Modal + Cards + Animations).
*   **Total:** ~1 Day.
