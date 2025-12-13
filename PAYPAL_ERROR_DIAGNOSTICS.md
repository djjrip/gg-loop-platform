# PAYPAL ERROR DIAGNOSTICS
**All Failure States + Fixes**

Last Updated: December 10, 2025

---

## FRONTEND ERRORS

### Error: "PayPal not configured"
**Symptom:** Button shows error message instead of PayPal button  
**Cause:** `VITE_PAYPAL_CLIENT_ID` not set in Railway  
**Fix:**
1. Go to Railway dashboard
2. Add `VITE_PAYPAL_CLIENT_ID` env var
3. Redeploy
4. Verify button appears

### Error: "Failed to load PayPal SDK"
**Symptom:** Button shows error, console shows script load failure  
**Cause:** PayPal SDK script blocked or network issue  
**Fix:**
1. Check ad blocker (disable for ggloop.io)
2. Check network tab for `paypal.com/sdk/js` request
3. Verify `VITE_PAYPAL_CLIENT_ID` is correct
4. Try different browser

### Error: Popup shows about:blank
**Symptom:** PayPal popup opens but shows blank page  
**Cause:** `/api/paypal/create-subscription` failing  
**Fix:**
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify route exists in `server/routes.ts` (line 2551)
4. Test route manually: `curl -X POST https://ggloop.io/api/paypal/create-subscription`

---

## BACKEND ERRORS

### Error: "Plan ID and tier are required"
**Symptom:** Subscription creation fails  
**Cause:** Frontend not sending planId/tier  
**Fix:**
1. Check `PayPalSubscriptionButton.tsx` line 67-71
2. Verify `planId` and `tier` props are passed correctly
3. Check network tab for request payload

### Error: "Invalid subscription tier"
**Symptom:** Subscription creation fails  
**Cause:** Tier not in valid list  
**Fix:**
1. Check `server/routes.ts` line 2561
2. Valid tiers: basic, pro, elite, Basic, Pro, Elite
3. Verify frontend is sending correct tier

### Error: "Failed to verify subscription"
**Symptom:** Subscription approval fails  
**Cause:** PayPal API error or invalid subscription ID  
**Fix:**
1. Check server logs for PayPal API response
2. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
3. Check if subscription exists in PayPal dashboard
4. Verify plan IDs match (sandbox vs production)

---

## DATABASE ERRORS

### Error: Subscription not saved
**Symptom:** Subscription approved but not in database  
**Cause:** Database write failure  
**Fix:**
1. Check server logs for database errors
2. Verify database connection (`DATABASE_URL`)
3. Check if `subscriptions` table exists
4. Verify user exists in `users` table

### Error: Points not awarded
**Symptom:** Subscription active but no points  
**Cause:** Points awarding logic failed  
**Fix:**
1. Check server logs around line 2710-2720 in `routes.ts`
2. Verify `point_transactions` table exists
3. Check tier → points mapping (basic=1,000, pro=2,500, elite=5,000)

---

## PAYPAL API ERRORS

### Error: "AUTHENTICATION_FAILURE"
**Symptom:** PayPal API returns 401  
**Cause:** Invalid client ID or secret  
**Fix:**
1. Verify `PAYPAL_CLIENT_ID` matches PayPal dashboard
2. Verify `PAYPAL_CLIENT_SECRET` matches PayPal dashboard
3. Check if using sandbox vs production credentials correctly

### Error: "INVALID_RESOURCE_ID"
**Symptom:** PayPal API returns 404  
**Cause:** Plan ID doesn't exist  
**Fix:**
1. Check plan IDs in PayPal dashboard
2. Verify `PAYPAL_BASIC_PLAN_ID`, `PAYPAL_PRO_PLAN_ID`, `PAYPAL_ELITE_PLAN_ID`
3. Ensure using correct environment (sandbox vs production)

### Error: "SUBSCRIPTION_STATUS_INVALID"
**Symptom:** Subscription exists but can't be verified  
**Cause:** Subscription in wrong state  
**Fix:**
1. Check subscription status in PayPal dashboard
2. Valid states: ACTIVE, SUSPENDED, CANCELLED
3. May need to recreate subscription

---

## COMMON ISSUES

### Issue: Subscription works in sandbox but not production
**Cause:** Using sandbox plan IDs in production  
**Fix:**
1. Create production plans in PayPal dashboard
2. Update env vars with production plan IDs
3. Switch `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` to production

### Issue: Multiple subscriptions for same user
**Cause:** No deduplication logic  
**Fix:**
1. Check `server/routes.ts` line 2685-2695 for deduplication
2. Verify `paypal_subscription_id` is unique in database
3. Add unique constraint if missing

### Issue: Subscription cancelled but still shows active
**Cause:** Webhook not received or processed  
**Fix:**
1. Check webhook endpoint: `POST /api/paypal/webhook`
2. Verify `PAYPAL_WEBHOOK_ID` is set
3. Check PayPal dashboard for webhook delivery status
4. Manually sync: use `/api/paypal/manual-sync`

---

## DEBUGGING CHECKLIST

```
PAYPAL ERROR DEBUGGING - [DATE]

ENVIRONMENT
[ ] VITE_PAYPAL_CLIENT_ID set
[ ] PAYPAL_CLIENT_ID set
[ ] PAYPAL_CLIENT_SECRET set
[ ] PAYPAL_BASIC_PLAN_ID set
[ ] PAYPAL_PRO_PLAN_ID set
[ ] PAYPAL_ELITE_PLAN_ID set

FRONTEND
[ ] PayPal button appears
[ ] No console errors
[ ] SDK loads successfully

BACKEND
[ ] /api/paypal/create-subscription exists
[ ] /api/paypal/subscription-approved exists
[ ] Server logs show no errors

DATABASE
[ ] Subscriptions table exists
[ ] Point_transactions table exists
[ ] User exists

PAYPAL API
[ ] Credentials valid
[ ] Plan IDs valid
[ ] Subscription created successfully

NOTES:
_________________________________
_________________________________
```

---

**Still stuck? Check server logs and contact support.**
