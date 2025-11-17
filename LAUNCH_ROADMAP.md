# 🚀 GG Loop: 100% MVP Launch Roadmap

**Current Status**: ~75% MVP Ready  
**Target Launch**: 7-10 Days  
**Critical Path**: Payments → Auth → Points → QA

---

## ✅ **JUST FIXED**
- [x] **Subscription tier button bug** - Pro/Elite payment buttons now visible for upgrades

---

## 🔴 **CRITICAL BLOCKERS** (Must Fix Before Launch)

### 1. **Tango Card API Configuration** ⚠️ BROKEN
**Status**: URGENT - Rewards catalog broken  
**Issue**: `TANGO_CARD_API_URL` secret contains email addresses instead of API URL  
**Fix Time**: 5 minutes  
**Action**:
1. Update `TANGO_CARD_API_URL` secret to: `https://sandbox.tangocard.com/raas/v2` (sandbox) or `https://integration-api.tangocard.com/raas/v2` (production)
2. Restart server
3. Test `/shop` page loads rewards

**Why Critical**: Users can't see or redeem ANY rewards right now

---

### 2. **Payment Flows End-to-End Testing** 
**Status**: Untested  
**Fix Time**: 2-3 hours  
**Test Checklist**:
- [ ] New subscription (Basic → PayPal/Stripe)
- [ ] Upgrade flow (Basic → Pro, Pro → Elite)
- [ ] Downgrade prevention (Elite can't downgrade to Pro)
- [ ] Cancellation webhook
- [ ] Payment failure handling
- [ ] Points allocation after successful payment

**Why Critical**: Can't charge users if payment doesn't work

---

### 3. **Guest → OAuth Account Linking**
**Status**: Partially implemented, needs QA  
**Fix Time**: 1-2 hours  
**Test Scenarios**:
- [ ] Guest creates account → Links Discord → Keeps points
- [ ] Guest creates account → Links Twitch → Preserves achievements
- [ ] Two accounts try to link same Discord (should fail gracefully)

**Why Critical**: Users will lose data without proper merge

---

## 🟡 **HIGH PRIORITY** (Launch Degraded Without These)

### 4. **Points Expiration Enforcement**
**Status**: DB schema exists, cron job missing  
**Fix Time**: 4 hours  
**Action**:
1. Create daily cron job to check `pointTransactions.expiresAt`
2. Auto-deduct expired points from `users.totalPoints`
3. Send notification 7 days before expiration

**Why Important**: You promised 12-month expiration in your model

---

### 5. **Rewards Fulfillment Status UI**
**Status**: Backend logs exist, no user-facing status  
**Fix Time**: 3 hours  
**Action**:
1. Add "My Rewards" page showing order status
2. Display Tango Card order tracking
3. Show error messages if fulfillment fails
4. Add "Retry" button for failed orders

**Why Important**: Users need to know if their reward is coming

---

### 6. **Match Sync Error Handling**
**Status**: Logs errors but doesn't surface to users  
**Fix Time**: 2 hours  
**Action**:
1. Add health check dashboard in `/stats`
2. Show "Riot API Disconnected" banner when sync fails
3. Add manual "Re-sync Now" button
4. Notify users if account needs re-authentication

**Why Important**: Silent failures = frustrated users

---

## 🟢 **NICE TO HAVE** (Can Launch Without)

### 7. **Admin Dashboard Polish**
- Add audit logging for manual point adjustments
- Role-based access control (beyond email whitelist)
- Bulk user operations

### 8. **Email Notifications**
- Welcome email on signup
- Payment confirmation
- Reward shipped notification
- Points expiring soon alert

### 9. **SEO & Landing Page**
- Meta tags for social sharing
- Testimonials from beta users
- FAQ section
- How it works video

---

## 📋 **DAILY ACTION PLAN**

### **Day 1-2: Payments & Subscriptions** 🔴
- [ ] Fix Tango API URL secret
- [ ] Test Stripe checkout end-to-end
- [ ] Test PayPal checkout end-to-end
- [ ] Test upgrade flow (Basic → Pro → Elite)
- [ ] Verify webhook processing
- [ ] Add payment failure banner

### **Day 3: Auth & Account Lifecycle** 🟡
- [ ] Test guest → OAuth linking (all providers)
- [ ] Test Riot account re-linking
- [ ] Document manual account recovery process
- [ ] Add "Account Linked Successfully" confirmation UI

### **Day 4-5: Points & Rewards** 🟡
- [ ] Build points expiration cron job
- [ ] Create "My Rewards" status page
- [ ] Add Tango order tracking integration
- [ ] Test redemption race conditions (2 users claiming last stock item)

### **Day 6: Match Sync & Leaderboards** 🟡
- [ ] Add match sync health dashboard
- [ ] Fix Riot API error surfacing
- [ ] Test leaderboard cache invalidation
- [ ] Verify achievement unlock notifications

### **Day 7: Final QA & Polish** ✅
- [ ] Full regression test: signup → subscribe → earn → redeem
- [ ] Mobile responsiveness check
- [ ] Test all error states
- [ ] Verify all `data-testid` attributes present
- [ ] Run accessibility audit

### **Day 8: Soft Launch** 🚀
- [ ] Give 10 free Elite memberships to beta testers
- [ ] Monitor logs for errors
- [ ] Fix critical bugs
- [ ] Collect feedback

---

## 🎯 **GO/NO-GO LAUNCH CHECKLIST**

**Must Have** ✅:
- [ ] Tango API working (can see rewards catalog)
- [ ] Payment processing works (Stripe + PayPal)
- [ ] Users can subscribe and upgrade
- [ ] Points allocated correctly after payment
- [ ] Users can redeem rewards without errors
- [ ] Match submissions work
- [ ] Leaderboards update correctly

**Can Fix Post-Launch** 📌:
- Points expiration automation
- Email notifications
- Admin dashboard polish
- Advanced error handling

---

## 🆘 **EMERGENCY SUPPORT RUNBOOK**

### If payments fail:
1. Check Stripe/PayPal dashboard for failed webhooks
2. Manually allocate points via admin panel
3. Refund if necessary

### If rewards fail:
1. Check Tango Card logs in `/tmp/logs/`
2. Look for `pending-order` entries in DB
3. Retry order manually or refund points

### If user loses data:
1. Check `pointTransactions` table for history
2. Manually restore from DB backup
3. Document incident for future prevention

---

## 💰 **COST TO LAUNCH**

**Total Spend**: $0 - $250

- Tango Card API: Sandbox (FREE) → Production (pay per redemption)
- Stripe fees: 2.9% + $0.30 per transaction
- PayPal fees: Similar to Stripe
- Beta user rewards: ~$250 (10 users × $25 Elite tier value for 1 month)

**Better ROI than $249 consultant** - You're doing this yourself!

---

## 🎬 **NEXT IMMEDIATE ACTIONS** (Right Now)

1. **Fix Tango API URL** (5 min) ⚠️
2. **Test subscription flow** (30 min)
3. **Pick 3 Twitch streamers to DM** (15 min)
4. **Record 1 TikTok showing the platform** (20 min)

**Then come back and knock out Days 1-7 above.**

You got this! 💪
