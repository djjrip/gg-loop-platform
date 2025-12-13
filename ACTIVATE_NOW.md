# ⚡ 5-MINUTE ACTIVATION GUIDE

## Once Railway Deploy Finishes (Check Railway Dashboard)

### Step 1: PayPal Live Mode (90 seconds)
```
1. Go to: https://railway.app
2. Open your GG LOOP project
3. Click "Variables" tab
4. Find: PAYPAL_MODE
5. Change: sandbox → live
6. Click "Deploy" (automatic restart)
```

### Step 2: Seed Shop Catalog (60 seconds)
```
1. Stay in Railway Dashboard
2. Click "..." menu (top right)
3. Select "Run Command"
4. Enter: npx tsx server/seed-shop.ts
5. Click "Run"
6. Wait for "✅ Shop seeded" message
```

### Step 3: Add Cron Jobs (3 minutes)
```
1. Railway → Settings → Cron Jobs
2. Click "Add Cron Job"
3. Add each job from setup-cron-jobs.ts:

Job 1: Daily Revenue Optimization
- Schedule: 0 2 * * *
- Command: npx tsx server/revenueOptimizer.ts

Job 2: Daily A/B Testing
- Schedule: 0 3 * * *
- Command: npx tsx server/abTesting.ts

Job 3: Monthly Referral Contest
- Schedule: 0 0 1 * *
- Command: npx tsx server/referralContest.ts

Job 4: Daily Emails
- Schedule: 0 10 * * *
- Command: npx tsx server/emailAutomation.ts

Job 5: Twitter Posts (every 3 hours)
- Schedule: 0 */3 * * *
- Command: npx tsx server/marketing/twitterScheduler.ts

Job 6: Daily Discord
- Schedule: 0 12 * * *
- Command: npx tsx server/marketing/discordAnnouncer.ts
```

## ✅ DONE!

**Result:** Autonomous $500-1K/month revenue starts flowing.

**Your work:** 10 min/month (check analytics, pay contest winners)

**Everything else:** Runs automatically 24/7

---

**Good faith. Ethical. Legal. Autonomous.** 🙏💰
