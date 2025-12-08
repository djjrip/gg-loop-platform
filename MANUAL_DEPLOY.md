# 🚀 MANUAL DEPLOYMENT GUIDE

**Git is not installed.** Use GitHub Desktop instead.

---

## STEP 1: DEPLOY CODE (2 MINUTES)

### Option A: GitHub Desktop (Recommended)
1. Open GitHub Desktop
2. You should see all new files in "Changes" tab
3. Write commit message: "Revenue Engine - 13 cycles complete"
4. Click "Commit to main"
5. Click "Push origin"

**Railway will auto-deploy in ~3 minutes.**

### Option B: GitHub Web
1. Go to github.com/your-repo
2. Upload these new files manually:
   - `server/lib/analytics.ts`
   - `server/lib/emailSequence.ts`
   - `server/lib/freeTrial.ts`
   - `server/lib/paypalWebhook.ts`
   - `server/lib/privacyContact.ts`
   - `server/marketing/` (entire folder)
   - `server/seed-shop.ts`
   - `server/emailQueueWorker.ts`
   - `server/referralContest.ts`
   - `client/src/components/ConversionOptimization.tsx`
   - `client/src/components/SocialShare.tsx`
   - `client/src/components/TrialBanner.tsx`
   - `client/src/components/ReferralContestLeaderboard.tsx`
   - `client/src/pages/admin/RevenueAnalytics.tsx`
3. Commit message: "Revenue system complete"

---

## STEP 2: WAIT FOR DEPLOY (3 MIN)

Check Railway: https://railway.app

- Go to Deployments tab
- Wait for "Success" ✓
- Check logs for errors

---

## STEP 3: ACTIVATE REVENUE (3 MIN)

### 3A: Seed Shop
Railway Dashboard → "..." menu → Run Command:
```
npx tsx server/seed-shop.ts
```

### 3B: Flip PayPal Live
Railway → Variables → Change:
```
PAYPAL_MODE=live
```
Click "Redeploy"

### 3C: Post on Reddit
Copy templates from `QUICK_START.md`

Post to:
- r/beermoney
- r/gaming
- r/sidehustle

---

## ✅ DONE!

Revenue system activated. Money flows automatically.

Check results: https://ggloop.io/admin/revenue-analytics

---

## VERIFY DEPLOYMENT

1. Visit ggloop.io/shop - see 6 rewards?
2. Sign up new account - get 7-day trial?
3. Check email - welcome sequence sent?

All YES = Success! 🎉

---

**Need help? Just ask.**
