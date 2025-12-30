# 💰 REVENUE PLAN: THE BUILDER TIER

**Objective:** Monetize the `r/BuildYourVibe` traffic immediately.
**Target Audience:** "Vibe Coders" who want to level up faster and show off their status.

---

## 1. The Offer
**Plan Name:** `BUILDER` (or `THE LAB`)
**Price:** $12/month (Same price point as "The Park" - aimed at creators/builders)
**Tagline:** "Build Different. Earn Faster."

## 2. The Perks
1.  **2x XP Multiplier** for all "Vibe Coding" sessions (VS Code, Cursor, Windsurf).
2.  **"Verified Builder" Badge** on public profile.
3.  **Early Access** to new Dev Tools integration (GitHub, Terminal).
4.  **Priority Support** in the Discord "Builders" channel.

## 3. Implementation Strategy
### A. Database / Backend
- Update `Subscription` model to handle `TIER_BUILDER`.
- Update `PointCalculationService` to apply `2.0x` multiplier if `gameId` is `vscode`, `cursor`, or `windsurf` AND user is `TIER_BUILDER`.

### B. Frontend (UI)
- Update `Subscription.tsx` to add the new card.
- **Visuals:** Dark Blueprint / Cyberpunk Yellow aesthetic (distinct from the Orange/Green of gamer tiers).

### C. The Upsell
- **Trigger:** When a user completes a "Vibe Coding" session on the Free Tier.
- **Message:** "You earned 100 XP. You could have earned 200 XP with the Builder Tier."

---

## 4. Execution Checklist
- [ ] Define Tier in Code
- [ ] Add UI Card in `Subscription.tsx`
- [ ] Add Multiplier Logic in `PointService`
- [ ] Push to Prod
