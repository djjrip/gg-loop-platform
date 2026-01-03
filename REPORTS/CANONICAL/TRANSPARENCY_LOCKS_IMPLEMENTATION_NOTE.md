# TRANSPARENCY LOCKS IMPLEMENTATION NOTE

**Status:** READY FOR IMPLEMENTATION  
**Last Updated:** 2026-01-03T17:56:53Z  
**Owner:** AG (Ops) / Cursor (Implementation)

---

## Required Transparency Locks

These exact statements MUST appear on all relevant user-facing pages:

### Lock 1: Points Disclaimer
> "Points are not currency and have no cash value."

### Lock 2: Verification Requirement
> "Rewards require verified gameplay."

### Lock 3: Manual Phase Disclosure
> "During validation, Founding Member upgrades are processed manually within 24 hours."

### Lock 4: Fair Play Statement
> "Suspicious activity is reviewed. Cheaters are removed."

---

## Where Locks Must Appear

| Page | Lock 1 | Lock 2 | Lock 3 | Lock 4 |
|------|--------|--------|--------|--------|
| Homepage CTA | - | ✅ | - | - |
| /founding-member | ✅ | ✅ | ✅ | ✅ |
| /subscription | ✅ | ✅ | - | ✅ |
| Rewards/Shop | ✅ | ✅ | - | ✅ |
| Points display | ✅ | - | - | - |

---

## Implementation Checklist

### Homepage CTA Section
- [ ] Add small text under CTA: "Rewards require verified gameplay."

### /founding-member Page
- [ ] Add all 4 locks in a "Transparency" section
- [ ] Position: Below payment button, above footer
- [ ] Style: Subtle but readable (gray text, smaller font OK)

### /subscription Page
- [ ] Add Lock 1, 2, 4 near pricing
- [ ] Position: Below tier cards

### Rewards/Shop Section
- [ ] Add Lock 1, 2, 4 at top of rewards listing
- [ ] Make visible before claiming any reward

### Points Display (Dashboard/Profile)
- [ ] Add Lock 1 as tooltip or small text near points count

---

## Screenshot Verification Checklist

After implementation, capture screenshots showing:

- [ ] Homepage with Lock 2 visible
- [ ] /founding-member with all 4 locks
- [ ] /subscription with Locks 1, 2, 4
- [ ] Rewards page with Locks 1, 2, 4
- [ ] Points display with Lock 1

Save to: `/REPORTS/CANONICAL/TRANSPARENCY_SCREENSHOTS_YYYY-MM-DD/`

---

## Copy Guidelines

- Use exact wording from locks (no paraphrasing)
- Position where user will see before taking action
- Style can be subtle but must be readable
- Never hide behind "terms and conditions" links only

---

## Enforcement

- Cursor implements locks in code
- AG verifies via screenshots
- Any page missing required locks = not done
- Locks are permanent (never remove without explicit founder approval)

---

*Transparency is non-negotiable. These locks protect the brand.*
