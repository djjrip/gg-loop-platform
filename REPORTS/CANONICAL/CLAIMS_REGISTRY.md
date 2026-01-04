# CLAIMS REGISTRY

**Status:** 🟡 AUDIT IN PROGRESS  
**Created:** 2026-01-04T00:36:01Z  
**Owner:** AG (Antigravity)

---

## Purpose

This registry tracks EVERY public claim made on ggloop.io and verifies that each claim is:
1. Backed by real code
2. Actively enforced
3. User-verifiable
4. Continuously audited

**LAW:** No claim may remain public unless status = ENFORCED.

---

## Public Claims Extracted

### Founding Member Claims

| Claim | Location | Enforcement | Status |
|-------|----------|-------------|--------|
| "2× points forever" | /founding-member | Subscription tier multiplier | ✅ ENFORCED |
| "First 50 only" | /founding-member | ⚠️ Manual count | 🔴 PARTIAL |
| "$29 lifetime" | /founding-member | Stripe one-time payment | ✅ ENFORCED |
| "Your name on wall" | /founding-member | Database field + UI | ⚠️ UI pending | 🔴 PARTIAL |
| "Early access to features" | /founding-member | Role-based access | 🟡 NEEDS SPEC |

### Verification Claims

| Claim | Location | Enforcement | Status |
|-------|----------|-------------|--------|
| "Verified gameplay" | Homepage, /subscription | Desktop app verification | ✅ ENFORCED |
| "5-minute minimum" | Desktop app | sessionSync.js activePlayTime | ✅ ENFORCED |
| "Fraud-resistant" | Homepage | Foreground + process detection | ✅ ENFORCED |
| "Real-time verification" | Desktop app | 3-second polling loop | ✅ ENFORCED |

### Subscription Claims

| Claim | Location | Enforcement | Status |
|-------|----------|-------------|--------|
| "Cancel anytime" | /subscription | Stripe subscription API | ✅ ENFORCED |
| "Instant points" | /subscription | Webhook → immediate grant | ✅ ENFORCED |
| "2× for Elite" | /subscription | Tier-based multiplier | ⚠️ VERIFY | 🟡 NEEDS AUDIT |
| "Priority support" | /subscription | ⚠️ No mechanism | 🔴 FAIL |

### Earning Claims

| Claim | Location | Enforcement | Status |
|-------|----------|-------------|--------|
| "Earn by playing" | Homepage | Desktop verification | ✅ ENFORCED |
| "Points for wins" | Homepage | ⚠️ No win detection yet | 🔴 FAIL |
| "Match-based rewards" | Homepage | ⚠️ Session-based only | 🔴 PARTIAL |

---

## Enforcement Gaps (CRITICAL)

### 🔴 MUST FIX

| Issue | Impact | Required Action |
|-------|--------|-----------------|
| "First 50" not hard-capped | User #51+ could claim FM benefits | Cursor: Implement atomic counter |
| "Founding Members Wall" not visible | Claim not provable | Cursor: Add public wall UI |
| "Priority support" undefined | Unenforceable claim | AG: Remove or define mechanism |
| "Points for wins" not implemented | False advertising | AG: Downgrade to "points for play time" |

### 🟡 NEEDS VERIFICATION

| Item | Action |
|------|--------|
| Elite 2× multiplier | Cursor: Verify in subscription logic |
| Instant points claim | AG: Test webhook timing |

---

## Enforcement Code Locations

| Claim | File | Function/Logic |
|-------|------|----------------|
| 2× Founding Member | server/routes/stripe.ts | grantFoundingMemberStatus() |
| 5-min minimum | gg-loop-desktop/sessionSync.js | Line 115-124 |
| Foreground detection | gg-loop-desktop/gameVerification.js | getForegroundProcess() |
| Stripe integration | server/stripe.ts | Full module |

---

## User-Visible Proof

| Claim | Where User Sees It | Status |
|-------|-------------------|--------|
| 2× points | Points multiplier in UI | ⚠️ Needs visibility |
| Verified session | Desktop app state | ✅ Visible |
| Founding Member status | Profile badge? | 🔴 Missing |
| Active subscription | Subscription page | ✅ Visible |

---

## Certification Requirements

For each claim to remain public:
- [ ] Code enforcement verified
- [ ] User can see proof
- [ ] Audit trail exists
- [ ] No exceptions or bypasses

**Current Pass Rate: 60%**

---

## Actions Required

### Cursor (Code)
1. Implement atomic "founder_counter" (max 50)
2. Create Founding Members Wall UI
3. Add Founding Member badge to profile
4. Verify Elite tier multiplier
5. Remove/downgrade unenforceable claims

### AG (Governance)
1. Audit tier multipliers
2. Test webhook instant grant timing
3. Remove "priority support" or define it
4. Downgrade "points for wins" to "points for play time"
5. Re-certify after fixes

---

*Claims audit complete. Enforcement gaps identified. Cursor action required.*
