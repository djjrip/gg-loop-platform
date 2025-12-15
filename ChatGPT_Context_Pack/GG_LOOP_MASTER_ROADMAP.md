# GG LOOP ALPHA → OMEGA ROADMAP

## 🗺️ PHASE SUMMARY
*   **PHASE 0: FOUNDATION (Active Today)** - Identity, Billing, Web Presence.
*   **PHASE 1: SPONSOR MVP (Sprint)** - The "Selection" Interface.
*   **PHASE 2: GAMEPLAY MVP (Desktop)** - The "Proof of Work" (Verification).
*   **PHASE 3: PILOT ENGINE (B2B)** - The "Value Delivery" (Reporting).
*   **PHASE 4: ECONOMY (Scale)** - Reward Logic & Inventory.
*   **PHASE 5: OMEGA (Global)** - Decentralized Teams / API.

---

## 🏗️ PHASE 0: FOUNDATION (CURRENT STATE)
**Status:** ✅ LIVE
**Goal:** Establish Brand Identity & Take Payments.
*   **Features:**
    *   Web Frontend (React/Vite).
    *   Auth (Google/Discord/Twitch).
    *   Subscription Payments (Stripe/PayPal).
    *   Manual Content Management.
*   **Honesty Check:**
    *   ✅ Web App works.
    *   ✅ Billing works.
    *   ❌ "Choose Sponsor" is fake.
    *   ❌ "Gameplay Tracking" is fake.

---

## 🚀 PHASE 1: SPONSOR SELECTION MVP
**Status:** 🚧 NEXT UP (Sprint)
**Goal:** Make the "Sign Your Deal" promise visually true.
*   **Features:**
    *   **Sponsor Selector Modal:** "Who do you grind for?"
    *   **Database:** Store `user.sponsorPreference`.
    *   **Dashboard Badge:** "Logitech G Rookie".
    *   **Email Trigger:** "Welcome to Team Logitech".
*   **Tech Spec:**
    *   New Table: `sponsor_preferences` (user_id, brand_id, tier, joined_at).
    *   API: `POST /api/user/sponsor`.
*   **Safe to Advertise:** "Join and select your team."

---

## 🖥️ PHASE 2: GAMEPLAY VERIFICATION MVP (DESKTOP)
**Status:** 📅 Q1 2026
**Goal:** Verify gameplay without relying solely on unstable web APIs.
*   **Rationale:** Web APIs (Riot) are rate-limited and slow. Desktop app allows local log reading overlay = "Instant Feedback".
*   **Features:**
    *   **Electron App:** Simple tray application.
    *   **Local Polling:** Read game logs for active match.
    *   **Server Validation:** Send match result to API for "Server Auth" (Prevents local spoofing).
*   **Tech Spec:**
    *   Stack: Electron, React, Node.
    *   Security: Hash check on game executable.
*   **Safe to Advertise:** "Download the Tracker to earn."

---

## 📊 PHASE 3: BRAND PILOT ENGINE
**Status:** 📅 Q1 2026 (Parallel with Phase 2)
**Goal:** Give brands the data they paid for.
*   **Features:**
    *   **Campaign Manager:** Set "Missions" (e.g., Play 10 Games).
    *   **Redemption Control:** Manual approval of high-value items.
    *   **Reporting:** CSV Export of User Demographics & Engagement.
*   **Tech Spec:**
    *   Admin Routes: `/admin/campaigns`, `/admin/reports`.
*   **Safe to Advertise:** "Launch a data-backed pilot."

---

## 💰 PHASE 4: REWARD + ECONOMY INFRASTRUCTURE
**Status:** 📅 Q2 2026
**Goal:** Automate the "Earning" loop.
*   **Features:**
    *   **Point & Wallet System:** Ledger-based point tracking (prevent double-spend).
    *   **Inventory System:** Digital codes + Physical shipping tracking.
    *   **Fraud Detection:** Analysis of win-trading or botting.
*   **Safe to Advertise:** "Complete missions, auto-redeem rewards."

---

## 🌍 PHASE 5: GLOBAL PLATFORM (OMEGA)
**Status:** 📅 2027+
**Goal:** Decentralized NIL for Gamers.
*   **Features:**
    *   **Smart Contracts:** On-chain record of "Pro Status".
    *   **Team Accounts:** Create squads/guilds.
    *   **Global Payouts:** Localized currency support.
