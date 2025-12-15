# SPECIFICATION: BRAND PILOT ENGINE
**Role:** The "B2B Value Deliverer".

## 1. OBJECTIVE
Prove to brands that the users are real, engaged, and valuable.

## 2. PILOT CAMPAIGN MODEL
A "Pilot" is a contained event with:
*   **Brand:** e.g., Target.
*   **Duration:** 30 Days.
*   **Budget:** Fixed Point Pool (e.g., 1,000,000 points).
*   **Goal:** e.g., "Drive awareness of new gaming aisle."

## 3. REPORTING METRICS (The "Truth" Report)
We need to generate a PDF/CSV for the brand at the end of 30 days.

### Section A: Demographics (Anonymized)
*   **Age Range Distribution.**
*   **Game Preference:** % League vs % Valorant.
*   **Geographic Heatmap:** (If IP data available).

### Section B: Engagement
*   **Impressions:** How many times was the "Target Mission" viewed?
*   **Completions:** How many users finished the mission?
*   **Conversion Rate:** Completions / Impressions.

### Section C: Redemptions
*   **Speed:** How fast did the physical rewards claim out?
*   **Preference:** Did they choose the Headset or the Mousepad?

## 4. DASHBOARD FOR BRANDS (Future)
*   *Phase 3 Goal is Manual Reports, Phase 4 is Self-Serve.*
*   **Route:** `/partners/portal`
*   **Login:** Specific Partner Account.
*   **View:** Real-time graph of "Points Distributed" vs "Budget Cap".

## 5. BUDGET CONTROLS
*   **Hard Cap:** If `points_distributed >= total_budget`, automatically pause all Brand Missions.
*   **Why:** Prevents GG LOOP from owing users rewards we cannot afford.
