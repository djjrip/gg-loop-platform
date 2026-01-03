# PAYMENTS LAUNCH RUNBOOK

**Status:** READY FOR FOUNDER ACTION  
**Last Updated:** 2026-01-03T17:56:53Z  
**Owner:** AG (Ops) + Founder

---

## Founder Required Actions (5 Minutes Total)

### Step 1: Create PayPal "Buy Now" Link (2 min)

1. Go to PayPal Business → **PayPal.Me** or **Payment Buttons**
2. Create a button for **$29 USD**
3. Set description: "GG LOOP Founding Member - Lifetime"
4. Copy the hosted payment link URL

**Expected result:** A URL like `https://www.paypal.com/paypalme/ggloop/29` or `https://www.paypal.com/cgi-bin/webscr?cmd=...`

### Step 2: Add Railway Environment Variable (2 min)

1. Go to Railway dashboard → GG LOOP project
2. Navigate to **Variables**
3. Add new variable:
   - **KEY:** `PAYPAL_FOUNDING_MEMBER_URL`
   - **VALUE:** `<your PayPal link from Step 1>`
4. Save and trigger redeploy

### Step 3: Verify (1 min)

1. Wait for Railway deploy to complete
2. Visit: `https://ggloop.io/founding-member`
3. Confirm: PayPal button appears

---

## What "Live" Looks Like

| Check | Expected |
|-------|----------|
| Visit /founding-member | Page loads |
| PayPal button visible | Yes (big, obvious) |
| Click PayPal button | Opens PayPal checkout |
| Complete payment | Success message |
| Manual upgrade | Founder receives PayPal notification |

---

## Current State (Before Founder Action)

| Component | Status |
|-----------|--------|
| /founding-member page | ✅ Built |
| Join Now routing | ✅ Works |
| PayPal env var | ❌ Not set |
| PayPal button | ❌ Not visible |
| Payment flow | ❌ Not live |

---

## After Founder Action

| Component | Status |
|-----------|--------|
| /founding-member page | ✅ Built |
| Join Now routing | ✅ Works |
| PayPal env var | ✅ Set |
| PayPal button | ✅ Visible |
| Payment flow | ✅ Live |

---

## If Founder Cannot Do This Now

The system will display:

> "Founding Member payments are being configured. Leave your email to be notified when ready."

This is honest. No broken clicks. No dead buttons.

---

## Manual Fulfillment Process

When a payment is received:

1. Founder receives PayPal notification
2. Identify user by email (PayPal → GG LOOP account lookup)
3. Manually upgrade user to Founding Member tier in database
4. Add 2x point multiplier
5. Send welcome message via Discord or email

**Timeline:** Within 24 hours of payment.

---

## Verification Checklist

After deploying, verify each:

- [ ] /founding-member page loads
- [ ] PayPal button is visible
- [ ] Clicking button opens PayPal
- [ ] "Join Now" on homepage goes to /founding-member
- [ ] No console errors
- [ ] Works logged in
- [ ] Works logged out

---

*Payments will be live within 5 minutes of founder action.*
