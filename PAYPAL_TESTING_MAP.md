# PAYPAL TESTING MAP
**Step-by-Step Testing Procedure for CEO**

Last Updated: December 10, 2025

---

## WHEN TO USE THIS GUIDE

Use this guide AFTER adding the 3 PayPal environment variables to Railway:
- `VITE_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

**DO NOT test until env vars are set. The system will not work without them.**

---

## PRE-TESTING CHECKLIST

Before starting tests, verify:
- [ ] Railway has redeployed after adding env vars (check deployment logs)
- [ ] https://ggloop.io is accessible (200 OK)
- [ ] https://ggloop.io/health returns `{"status":"ok"}`
- [ ] You have a PayPal Sandbox account (https://developer.paypal.com/dashboard)
- [ ] You have a test buyer account in PayPal Sandbox

---

## TEST 1: VERIFY PAYPAL SDK LOADS

**Goal:** Confirm PayPal JavaScript SDK loads on subscription page

**Steps:**
1. Go to https://ggloop.io/subscription
2. Log in with Twitch/Google/Discord
3. Open browser DevTools (F12)
4. Go to Console tab
5. Look for PayPal SDK script loading

**Expected Result:**
- ✅ No errors in console related to PayPal
- ✅ PayPal button appears (gold button, not error message)
- ✅ Button says "Subscribe" or shows PayPal logo

**If Failed:**
- ❌ Error: "VITE_PAYPAL_CLIENT_ID not set"
  - **Fix:** Check Railway env vars, ensure `VITE_PAYPAL_CLIENT_ID` is set
  - **Fix:** Redeploy Railway after adding env var

- ❌ Error: "Failed to load PayPal SDK"
  - **Fix:** Check network tab, verify `paypal.com/sdk/js` loads
  - **Fix:** Check if ad blocker is blocking PayPal

- ❌ Button shows "PayPal not configured"
  - **Fix:** `VITE_PAYPAL_CLIENT_ID` is missing or incorrect
  - **Fix:** Verify client ID matches PayPal dashboard

---

## TEST 2: CREATE SUBSCRIPTION (SANDBOX)

**Goal:** Test full subscription flow from button click to approval

**Steps:**
1. On https://ggloop.io/subscription, click PayPal button on Bronze tier
2. PayPal popup should open
3. Log in with PayPal Sandbox test buyer account
4. Review subscription details (Bronze, $4.99/month)
5. Click "Subscribe" or "Agree & Subscribe"
6. Popup should close automatically
7. Success toast should appear on GG LOOP

**Expected Result:**
- ✅ PayPal popup opens (not about:blank)
- ✅ Subscription details show correct tier and price
- ✅ After approval, popup closes
- ✅ Success toast: "Subscription Activated! You're now subscribed to the basic tier"
- ✅ Page redirects to /subscription/success
- ✅ Database updated: `subscription_status = "active"`, `tier = "basic"`

**If Failed:**
- ❌ Popup shows about:blank
  - **Fix:** Check console for errors
  - **Fix:** Verify `/api/paypal/create-subscription` route exists
  - **Fix:** Check server logs for errors

- ❌ Error: "Plan ID and tier are required"
  - **Fix:** Frontend not sending planId/tier correctly
  - **Fix:** Check `PayPalSubscriptionButton.tsx` line 67-71

- ❌ Error: "Failed to create subscription"
  - **Fix:** Check server logs for PayPal API errors
  - **Fix:** Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
  - **Fix:** Verify plan IDs are correct for sandbox

- ❌ Popup closes but no success toast
  - **Fix:** Check `/api/paypal/subscription-approved` route
  - **Fix:** Check server logs for errors
  - **Fix:** Verify PayPal API response

---

## TEST 3: VERIFY DATABASE UPDATE

**Goal:** Confirm subscription data is saved correctly

**Steps:**
1. After successful subscription (Test 2), check database
2. Query: `SELECT * FROM subscriptions WHERE user_id = '<your_test_user_id>';`
3. Verify fields

**Expected Result:**
- ✅ `status` = "active"
- ✅ `tier` = "basic" (or "pro"/"elite" depending on tier)
- ✅ `paypal_subscription_id` = PayPal subscription ID (starts with "I-")
- ✅ `created_at` = recent timestamp
- ✅ `updated_at` = recent timestamp

**If Failed:**
- ❌ No subscription record
  - **Fix:** Check `/api/paypal/subscription-approved` route
  - **Fix:** Check server logs for database errors
  - **Fix:** Verify database connection

- ❌ `status` = "pending" or null
  - **Fix:** PayPal verification failed
  - **Fix:** Check PayPal API response in server logs

- ❌ `tier` is incorrect
  - **Fix:** Check tier mapping in `/api/paypal/subscription-approved`
  - **Fix:** Verify plan ID → tier logic

---

## TEST 4: VERIFY POINTS AWARDED

**Goal:** Confirm monthly subscription points are awarded

**Steps:**
1. After successful subscription (Test 2), check points balance
2. Go to https://ggloop.io/profile or check database
3. Query: `SELECT * FROM point_transactions WHERE user_id = '<your_test_user_id>' ORDER BY created_at DESC LIMIT 5;`

**Expected Result:**
- ✅ New point transaction exists
- ✅ `amount` = 1,000 (Bronze), 2,500 (Pro), or 5,000 (Elite)
- ✅ `description` = "Monthly subscription points (basic/pro/elite tier)"
- ✅ User's total points increased by correct amount

**If Failed:**
- ❌ No point transaction
  - **Fix:** Check `/api/paypal/subscription-approved` route
  - **Fix:** Verify points awarding logic (lines ~2710-2720 in routes.ts)

- ❌ Wrong point amount
  - **Fix:** Check tier → points mapping
  - **Fix:** Verify: basic=1,000, pro=2,500, elite=5,000

---

## TEST 5: TEST ALL 3 TIERS

**Goal:** Verify Bronze, Pro, and Elite tiers all work

**Steps:**
1. Repeat Test 2 for Bronze tier
2. Cancel subscription in PayPal Sandbox
3. Repeat Test 2 for Pro tier
4. Cancel subscription in PayPal Sandbox
5. Repeat Test 2 for Elite tier

**Expected Result:**
- ✅ All 3 tiers create subscriptions successfully
- ✅ All 3 tiers show correct prices ($4.99, $9.99, $19.99)
- ✅ All 3 tiers update database correctly
- ✅ All 3 tiers award correct points (1,000, 2,500, 5,000)

**If Failed:**
- ❌ One tier fails
  - **Fix:** Check plan ID for that tier
  - **Fix:** Verify plan exists in PayPal dashboard
  - **Fix:** Check tier mapping in code

---

## TEST 6: TEST CANCELLATION FLOW

**Goal:** Verify user can cancel subscription

**Steps:**
1. After successful subscription, click "Cancel" button on PayPal popup
2. Verify cancellation toast appears
3. Check database - subscription should still be active until end of billing period

**Expected Result:**
- ✅ Cancellation toast: "Subscription Cancelled"
- ✅ Database: `status` = "active" (until end of period)
- ✅ No errors in console or server logs

**If Failed:**
- ❌ No cancellation toast
  - **Fix:** Check `onCancel` callback in `PayPalSubscriptionButton.tsx`

---

## TEST 7: TEST ERROR HANDLING

**Goal:** Verify graceful error handling

**Steps:**
1. Try to subscribe without logging in
2. Try to subscribe with invalid plan ID
3. Try to subscribe with network disconnected

**Expected Result:**
- ✅ All errors show user-friendly toast messages
- ✅ No crashes or white screens
- ✅ Errors logged to server for debugging

**If Failed:**
- ❌ White screen or crash
  - **Fix:** Add try/catch blocks
  - **Fix:** Improve error handling in PayPal callbacks

---

## TEST 8: PRODUCTION READINESS CHECK

**Goal:** Final verification before going live

**Steps:**
1. Switch PayPal credentials from Sandbox to Live
2. Repeat Tests 1-7 with real PayPal account
3. Verify real money transactions work
4. Test with small amount first ($4.99 Bronze)

**Expected Result:**
- ✅ All tests pass with live credentials
- ✅ Real subscription created
- ✅ Real money charged
- ✅ Database updated correctly

**If Failed:**
- ❌ Any test fails
  - **Fix:** Revert to sandbox
  - **Fix:** Debug issue
  - **Fix:** Re-test in sandbox before trying live again

---

## TESTING CHECKLIST (PRINT & USE)

```
PAYPAL SUBSCRIPTION TESTING - [DATE]

PRE-TESTING
[ ] Railway env vars set
[ ] Railway redeployed
[ ] Site accessible
[ ] Health check passes

TEST 1: SDK LOADS
[ ] PayPal button appears
[ ] No console errors
[ ] Button shows "Subscribe"

TEST 2: CREATE SUBSCRIPTION
[ ] Popup opens
[ ] Subscription details correct
[ ] Approval works
[ ] Success toast appears
[ ] Redirect to success page

TEST 3: DATABASE UPDATE
[ ] Subscription record exists
[ ] Status = "active"
[ ] Tier correct
[ ] PayPal ID saved

TEST 4: POINTS AWARDED
[ ] Point transaction exists
[ ] Correct amount
[ ] User balance updated

TEST 5: ALL TIERS
[ ] Bronze works
[ ] Pro works
[ ] Elite works

TEST 6: CANCELLATION
[ ] Cancel flow works
[ ] Toast appears
[ ] Database updated

TEST 7: ERROR HANDLING
[ ] Errors show toasts
[ ] No crashes
[ ] Errors logged

TEST 8: PRODUCTION
[ ] Live credentials work
[ ] Real transactions work
[ ] All tests pass

NOTES:
_________________________________
_________________________________
_________________________________
```

---

## NEXT STEPS AFTER TESTING

**If All Tests Pass:**
1. Switch to live PayPal credentials
2. Test with real account (small amount)
3. Announce PayPal subscriptions are live
4. Monitor for issues

**If Any Test Fails:**
1. Check PAYPAL_ERROR_DIAGNOSTICS.md for fixes
2. Fix issue
3. Redeploy
4. Re-test

---

**Questions? Issues during testing?**  
Contact: Jayson BQ (info@ggloop.io)
