# PAYPAL LAUNCH CHECKLIST
**What Happens After Env Vars Are Entered**

Last Updated: December 10, 2025

---

## PHASE 1: PRE-LAUNCH (Before Env Vars)

**Status:** ✅ COMPLETE
- [x] PayPal code deployed to production
- [x] Routes exist: create-subscription, subscription-approved, manual-sync
- [x] Frontend button integrated with SDK
- [x] Database schema ready
- [x] Testing documentation created

**What's Missing:** Environment variables

---

## PHASE 2: ENV VAR SETUP (CEO Action Required)

**Action:** Add 3 env vars to Railway

### Required Variables
```
VITE_PAYPAL_CLIENT_ID = <your_paypal_client_id>
PAYPAL_CLIENT_ID = <your_paypal_client_id>
PAYPAL_CLIENT_SECRET = <your_paypal_client_secret>
```

### Optional Variables (Use Sandbox Defaults if Not Set)
```
PAYPAL_BASIC_PLAN_ID = P-xxxxx
PAYPAL_PRO_PLAN_ID = P-xxxxx
PAYPAL_ELITE_PLAN_ID = P-xxxxx
```

### Steps
1. Go to https://railway.app
2. Select GG Loop project
3. Click "Variables" tab
4. Add each variable
5. Railway will auto-redeploy (~2 minutes)

---

## PHASE 3: AUTO-DEPLOY (Automatic)

**What Happens:**
1. Railway detects env var changes
2. Triggers new build
3. Builds client bundle with `VITE_PAYPAL_CLIENT_ID`
4. Deploys new bundle to production
5. Server restarts with new env vars

**Timeline:** 2-3 minutes

**How to Monitor:**
1. Go to Railway dashboard
2. Click "Deployments" tab
3. Watch build logs
4. Wait for "Deployment successful"

---

## PHASE 4: VERIFICATION (CEO Action Required)

**Use PAYPAL_TESTING_MAP.md for full testing procedure**

### Quick Verification (5 minutes)
1. Go to https://ggloop.io/subscription
2. Log in
3. Check if PayPal button appears (not error message)
4. Click button
5. Verify PayPal popup opens (not about:blank)
6. Cancel popup (don't complete subscription yet)

**Expected:** Button appears, popup opens correctly

### Full Testing (30 minutes)
1. Follow PAYPAL_TESTING_MAP.md
2. Test all 3 tiers (Bronze, Pro, Elite)
3. Verify database updates
4. Verify points awarded
5. Test error handling

**Expected:** All tests pass

---

## PHASE 5: SANDBOX → PRODUCTION (CEO Decision)

**When to Switch:**
- ✅ All sandbox tests pass
- ✅ Database updates correctly
- ✅ Points awarded correctly
- ✅ No errors in logs

**How to Switch:**
1. Go to PayPal dashboard (https://developer.paypal.com)
2. Switch from "Sandbox" to "Live" tab
3. Get production client ID and secret
4. Update Railway env vars with production credentials
5. Update plan IDs with production plan IDs
6. Railway will auto-redeploy

**Test with Real Money:**
1. Subscribe to Bronze tier ($4.99)
2. Verify real charge on PayPal
3. Verify database update
4. Cancel subscription immediately if just testing

---

## PHASE 6: GO LIVE (CEO Announcement)

**When Ready:**
- ✅ Production tests pass
- ✅ Real money transaction works
- ✅ Confident in system stability

**Announcement Channels:**
1. **TikTok:** "PayPal subscriptions are now live on GG LOOP"
2. **Discord:** @everyone announcement with link
3. **GG LOOP Site:** Remove any "coming soon" disclaimers

**Monitor First 24 Hours:**
- Check for errors in Railway logs
- Monitor Discord for user issues
- Track first 5-10 subscriptions closely
- Be ready to pause if major issues

---

## PHASE 7: ONGOING MONITORING

### Daily (5 minutes)
- [ ] Check Railway logs for errors
- [ ] Check PayPal dashboard for new subscriptions
- [ ] Verify database sync (subscriptions match PayPal)

### Weekly (15 minutes)
- [ ] Review subscription metrics (new, cancelled, active)
- [ ] Check for failed payments
- [ ] Verify webhook deliveries
- [ ] Test manual sync if needed

### Monthly (30 minutes)
- [ ] Full system audit
- [ ] Review error logs
- [ ] Test subscription flow end-to-end
- [ ] Update documentation if needed

---

## ROLLBACK PLAN

**If Major Issues After Launch:**

### Option 1: Pause Subscriptions (Soft Rollback)
1. Add "Temporarily Unavailable" message to subscription page
2. Disable PayPal button (set `disabled` prop)
3. Keep existing subscriptions active
4. Fix issues
5. Re-enable when ready

### Option 2: Remove Env Vars (Hard Rollback)
1. Remove `VITE_PAYPAL_CLIENT_ID` from Railway
2. Railway auto-redeploys
3. Button shows "PayPal not configured"
4. Existing subscriptions still active
5. Fix issues
6. Re-add env vars when ready

### Option 3: Revert Code (Nuclear Option)
1. Revert to previous commit (before PayPal integration)
2. Push to main
3. Railway auto-deploys old code
4. PayPal button gone
5. Existing subscriptions managed manually
6. Re-integrate when ready

---

## SUCCESS METRICS

### Week 1
- **Goal:** 5-10 new subscriptions
- **Monitor:** No errors, smooth flow

### Month 1
- **Goal:** 50-100 new subscriptions
- **Monitor:** Churn rate, failed payments

### Month 3
- **Goal:** 200-500 active subscriptions
- **Monitor:** MRR (monthly recurring revenue)

---

## LAUNCH CHECKLIST (PRINT & USE)

```
PAYPAL LAUNCH - [DATE]

PHASE 1: PRE-LAUNCH
[x] Code deployed
[x] Routes exist
[x] Frontend integrated
[x] Database ready

PHASE 2: ENV VARS
[ ] VITE_PAYPAL_CLIENT_ID added
[ ] PAYPAL_CLIENT_ID added
[ ] PAYPAL_CLIENT_SECRET added
[ ] Railway redeployed

PHASE 3: AUTO-DEPLOY
[ ] Build successful
[ ] Deployment successful
[ ] Server restarted

PHASE 4: VERIFICATION
[ ] Button appears
[ ] Popup opens
[ ] All tests pass (PAYPAL_TESTING_MAP.md)

PHASE 5: PRODUCTION
[ ] Switch to live credentials
[ ] Test with real money
[ ] All tests pass

PHASE 6: GO LIVE
[ ] Announce on TikTok
[ ] Announce on Discord
[ ] Monitor first 24 hours

PHASE 7: ONGOING
[ ] Daily monitoring
[ ] Weekly review
[ ] Monthly audit

NOTES:
_________________________________
_________________________________
```

---

**Questions? Issues during launch?**  
Contact: Jayson BQ (info@ggloop.io)
