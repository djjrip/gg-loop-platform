# 🚂 RAILWAY CRON JOBS SETUP

**The interface you're looking at is for the MAIN SERVICE schedule, not separate cron jobs.**

---

## ⚠️ IMPORTANT: Railway Cron Jobs Work Differently

Railway has **two ways** to run scheduled tasks:

### **Option 1: Separate Cron Service** (Recommended)
- Create a **new service** in Railway
- Set it to run on a cron schedule
- Runs independently from your main web service

### **Option 2: Cron Jobs Tab** (If Available)
- Some Railway plans have a "Cron Jobs" tab
- Add cron jobs directly there

---

## 🎯 HOW TO ADD CRON JOBS (Step-by-Step)

### **Method 1: Create Cron Service** (Most Common)

1. **In Railway Dashboard:**
   - Click **"+ New"** button
   - Select **"Empty Service"** or **"Cron"**

2. **Configure the Service:**
   - **Name:** `Master Automation`
   - **Source:** Connect to your GitHub repo
   - **Root Directory:** `/` (root)
   - **Build Command:** (leave empty or `npm install`)
   - **Start Command:** `npx tsx server/masterAutomation.ts`

3. **Set Cron Schedule:**
   - In the service settings, find **"Cron Schedule"**
   - Set to: `0 * * * *` (every hour)
   - Or use the dropdown: Select "Hourly"

4. **Add Environment Variables:**
   - Copy all variables from your main service
   - Especially: `DATABASE_URL`, `ADMIN_EMAILS`, etc.

5. **Repeat for Second Cron Job:**
   - Create another service: `Reward Fulfillment`
   - Start Command: `npx tsx server/automation/rewardFulfillment.ts`
   - Schedule: `*/15 * * * *` (every 15 minutes)

---

### **Method 2: Use Cron Jobs Tab** (If Available)

1. **In Railway Dashboard:**
   - Go to your project
   - Look for **"Cron Jobs"** tab (if it exists)

2. **Add Cron Job:**
   - Click **"+ New Cron Job"**
   - **Name:** `Master Automation`
   - **Schedule:** `0 * * * *`
   - **Command:** `npx tsx server/masterAutomation.ts`

3. **Repeat for Second:**
   - **Name:** `Reward Fulfillment`
   - **Schedule:** `*/15 * * * *`
   - **Command:** `npx tsx server/automation/rewardFulfillment.ts`

---

## 📋 CRON SCHEDULE REFERENCE

```
0 * * * *        = Every hour (at :00)
*/15 * * * *     = Every 15 minutes
0 8 * * *        = Daily at 8 AM
0 0 * * *        = Daily at midnight
0 0 1 * *        = First of month at midnight
```

---

## ✅ WHAT YOU'RE LOOKING AT

The **"Cron Schedule"** section you see is for:
- Scheduling when your **main web service** runs
- **NOT** for adding separate cron jobs

**For separate cron jobs, you need to:**
- Create a new service, OR
- Use the Cron Jobs tab (if available)

---

## 🎯 QUICK ANSWER

**The interface you're looking at is for the main service schedule.**

**To add cron jobs:**
1. Create a **new service** in Railway
2. Set it to run on a cron schedule
3. Point it to your automation scripts

**OR**

1. Look for a **"Cron Jobs"** tab (if your plan has it)
2. Add cron jobs there

---

**Need help? Check Railway docs or create a new service for each automation task!** 🚀

