# 🎯 RAILWAY CRON SETUP - EXACT STEPS

**What you're looking at:** The Cron Schedule section in Railway's Deploy settings

---

## ⚠️ IMPORTANT: This Interface is for ONE Service

**What you see:**
- "+ Add Schedule" button
- This sets a cron schedule for the CURRENT service

**The Problem:**
- We need TWO different cron jobs with different commands:
  1. Master Automation (every hour)
  2. Reward Fulfillment (every 15 minutes)

**You can't run both from one service** - you need separate services.

---

## ✅ SOLUTION: Two Options

### **Option 1: Create Separate Services (RECOMMENDED)**

**For Master Automation:**
1. Go back to your project dashboard
2. Click **"+ New"** → **"Empty Service"**
3. **Name:** `master-automation`
4. **Source:** Connect GitHub → `djjrip/gg-loop-platform`
5. **Branch:** `main`
6. **Root Directory:** `/`
7. **Build Command:** `npm install`
8. **Start Command:** `npx tsx server/masterAutomation.ts`
9. Go to **Deploy** tab → **Cron Schedule** section
10. Click **"+ Add Schedule"**
11. Enter: `0 * * * *` (every hour)
12. Copy ALL environment variables from main service
13. Click **"Deploy"**

**For Reward Fulfillment:**
1. Click **"+ New"** → **"Empty Service"** again
2. **Name:** `reward-fulfillment`
3. **Source:** Connect GitHub → `djjrip/gg-loop-platform`
4. **Branch:** `main`
5. **Root Directory:** `/`
6. **Build Command:** `npm install`
7. **Start Command:** `npx tsx server/automation/rewardFulfillment.ts`
8. Go to **Deploy** tab → **Cron Schedule** section
9. Click **"+ Add Schedule"**
10. Enter: `*/15 * * * *` (every 15 minutes)
11. Copy ALL environment variables from main service
12. Click **"Deploy"**

---

### **Option 2: Use Current Service (ONE Cron Job Only)**

**If you want to use the interface you're looking at:**
1. Click **"+ Add Schedule"**
2. Enter: `0 * * * *` (every hour)
3. **BUT:** This will run your main service on a schedule
4. **Problem:** Your main service runs the web app, not automation scripts
5. **This won't work** for automation

**Better:** Create separate services (Option 1)

---

## 🎯 WHAT TO DO RIGHT NOW

**You're in the right place, but:**

1. **Go back** to your project dashboard
2. **Create a NEW service** (not modify the current one)
3. **Set it up** as "master-automation" (see steps above)
4. **Then create another** for "reward-fulfillment"

**The interface you're looking at is correct** - just use it on NEW services, not your main web service!

---

## ✅ QUICK ANSWER

**Yes, that's the right interface!**

**But:** Use it on NEW services, not your main service.

**Steps:**
1. Create new service → "master-automation"
2. Use that Cron Schedule interface → Add `0 * * * *`
3. Create another service → "reward-fulfillment"  
4. Use that Cron Schedule interface → Add `*/15 * * * *`

**Done!** ✅

