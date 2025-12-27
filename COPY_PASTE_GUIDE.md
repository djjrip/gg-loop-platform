# 📋 COPY-PASTE GUIDE - Everything You Need

**All values and commands ready to copy-paste!**

---

## 🔐 STEP 1: PayPal Credentials (Verify First)

### **Go to PayPal Dashboard:**
```
https://developer.paypal.com/
```

### **Check Your Credentials:**
1. Login → Dashboard → My Apps & Credentials
2. Find your app
3. Copy these values:

**Client ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**Client Secret:**
```
EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL
```

**If these DON'T match your PayPal dashboard, use the values from PayPal instead!**

---

## 🚂 STEP 2: Fix Railway Variable

### **Go to Railway:**
```
https://railway.app
```

### **Delete All Duplicates:**
1. Your Project → Web Service → Variables tab
2. Find ALL `VITE_PAYPAL_CLIENT_ID` entries
3. Delete EVERY SINGLE ONE

### **Add ONE Correctly:**

**Variable Name:**
```
VITE_PAYPAL_CLIENT_ID
```

**Variable Value:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**IMPORTANT:** 
- Name and Value are SEPARATE fields
- NO `=` sign
- NO spaces before/after
- NO quotes

---

## 🤖 STEP 3: Add Cron Jobs

### **Option A: Create New Service (Recommended)**

**Service 1: Master Automation**

**Name:**
```
Master Automation
```

**Start Command:**
```
npx tsx server/masterAutomation.ts
```

**Cron Schedule:**
```
0 * * * *
```

**Service 2: Reward Fulfillment**

**Name:**
```
Reward Fulfillment
```

**Start Command:**
```
npx tsx server/automation/rewardFulfillment.ts
```

**Cron Schedule:**
```
*/15 * * * *
```

### **Option B: If Railway Has Cron Jobs Tab**

**Cron Job 1:**

**Name:**
```
Master Automation Orchestrator
```

**Schedule:**
```
0 * * * *
```

**Command:**
```
npx tsx server/masterAutomation.ts
```

**Cron Job 2:**

**Name:**
```
Automated Reward Fulfillment
```

**Schedule:**
```
*/15 * * * *
```

**Command:**
```
npx tsx server/automation/rewardFulfillment.ts
```

---

## 🔑 STEP 4: Environment Variables (Copy All)

### **Backend Variables (Already Set - Just Verify):**

**PAYPAL_CLIENT_ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**PAYPAL_CLIENT_SECRET:**
```
EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL
```

**PAYPAL_MODE:**
```
sandbox
```

**ADMIN_EMAILS:**
```
jaysonquindao@ggloop.io
```

**BUSINESS_EMAIL:**
```
jaysonquindao@ggloop.io
```

**BUSINESS_NAME:**
```
GG LOOP LLC
```

**BASE_URL:**
```
https://ggloop.io
```

### **Frontend Variable (MUST ADD):**

**VITE_PAYPAL_CLIENT_ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

---

## ✅ STEP 5: Verification Commands

### **Test Master Automation (Local):**
```bash
npx tsx server/masterAutomation.ts
```

### **Test Reward Fulfillment (Local):**
```bash
npx tsx server/automation/rewardFulfillment.ts
```

### **Test Business Automation (Local):**
```bash
npx tsx server/businessAutomation.ts
```

---

## 📧 STEP 6: Check Your Email

**After 1 hour, check for:**
- Automation report (if errors)
- Daily business report (8 AM)

**Email Address:**
```
jaysonquindao@ggloop.io
```

---

## 🔗 QUICK LINKS

**Railway Dashboard:**
```
https://railway.app
```

**PayPal Developer Dashboard:**
```
https://developer.paypal.com/
```

**Your Site:**
```
https://ggloop.io
```

**Subscription Page (Test PayPal Buttons):**
```
https://ggloop.io/subscription
```

---

## 📝 CHECKLIST

- [ ] Verified PayPal credentials match dashboard
- [ ] Deleted all duplicate `VITE_PAYPAL_CLIENT_ID` in Railway
- [ ] Added ONE correctly formatted `VITE_PAYPAL_CLIENT_ID`
- [ ] Added Master Automation cron job
- [ ] Added Reward Fulfillment cron job
- [ ] Verified all environment variables are set
- [ ] Waited 1 hour for first automation run
- [ ] Checked email for automation report
- [ ] Tested subscription page - PayPal buttons appear

---

## 🚨 TROUBLESHOOTING

### **If PayPal Buttons Don't Show:**

**Check Railway Variables:**
- `VITE_PAYPAL_CLIENT_ID` exists
- No duplicates
- Correct format (no `=`, no spaces)

**Check Railway Logs:**
- Look for errors about `VITE_PAYPAL_CLIENT_ID`
- Check deployment succeeded

### **If Automation Doesn't Run:**

**Check Cron Jobs:**
- Both jobs are added
- Schedules are correct
- Commands are correct

**Check Environment Variables:**
- `ADMIN_EMAILS` is set
- `DATABASE_URL` is set
- All required vars are present

---

**Everything you need in copy-paste format!** 🚀

