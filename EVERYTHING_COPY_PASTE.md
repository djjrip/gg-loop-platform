# 📋 EVERYTHING COPY-PASTE - Complete Guide

**All links, values, and commands in one place!**

---

## 🔐 STEP 1: Verify PayPal Credentials

### **PayPal Developer Dashboard:**
```
https://developer.paypal.com/
```

### **Login Steps:**
1. Go to: `https://developer.paypal.com/`
2. Click "Log In" (top right)
3. Use your PayPal business account
4. Click "Dashboard" → "My Apps & Credentials"

### **Your Current Credentials (Verify These Match):**

**Client ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**Client Secret:**
```
EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL
```

**If these DON'T match, copy the CORRECT ones from PayPal dashboard!**

---

## 🚂 STEP 2: Fix Railway Variable

### **Railway Dashboard:**
```
https://railway.app
```

### **Full Steps:**
1. Go to: `https://railway.app`
2. Login
3. Click your **"gg-loop-platform"** project
4. Click your **web service** (the one that's failing)
5. Click **"Variables"** tab

### **Delete All Duplicates:**
- Find ALL `VITE_PAYPAL_CLIENT_ID` entries
- Click the **⋮** menu → **Delete** on EACH ONE
- Make sure they're ALL gone

### **Add ONE Correctly:**

**Click "+ New Variable"**

**Variable Name (paste this):**
```
VITE_PAYPAL_CLIENT_ID
```

**Variable Value (paste this):**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**Click "Add"**

**Railway will auto-redeploy (wait 2-3 minutes)**

---

## 🤖 STEP 3: Add Cron Jobs

### **Railway Dashboard:**
```
https://railway.app
```

### **Option A: Create New Service (Recommended)**

**Go to Railway:**
```
https://railway.app
```

**Click "+ New" → "Empty Service"**

**Service 1: Master Automation**

**Name:**
```
Master Automation
```

**Source:**
- Connect to GitHub repo: `djjrip/gg-loop-platform`

**Root Directory:**
```
/
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npx tsx server/masterAutomation.ts
```

**Cron Schedule:**
```
0 * * * *
```

**Environment Variables:**
- Copy ALL variables from your main service
- Especially: `DATABASE_URL`, `ADMIN_EMAILS`, `BUSINESS_EMAIL`, etc.

**Service 2: Reward Fulfillment**

**Name:**
```
Reward Fulfillment
```

**Source:**
- Connect to GitHub repo: `djjrip/gg-loop-platform`

**Root Directory:**
```
/
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npx tsx server/automation/rewardFulfillment.ts
```

**Cron Schedule:**
```
*/15 * * * *
```

**Environment Variables:**
- Copy ALL variables from your main service

---

## 🔑 STEP 4: All Environment Variables

### **Railway Variables Tab:**
```
https://railway.app → Your Project → Web Service → Variables
```

### **Backend Variables (Verify These Exist):**

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

**DATABASE_URL:**
```
${{Postgres.DATABASE_URL}}
```
*(This is auto-set by Railway, don't change it)*

**NODE_ENV:**
```
production
```

**SESSION_SECRET:**
```
1266d2677444f863e2e794613bbaea2f9c36110903cd000ee1b6b9535aa02392
```

### **Frontend Variable (MUST ADD):**

**VITE_PAYPAL_CLIENT_ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

---

## ✅ STEP 5: Test Everything

### **Test Subscription Page:**
```
https://ggloop.io/subscription
```

**What to Check:**
- PayPal buttons appear
- No errors in browser console
- Can click buttons (they'll redirect to PayPal)

### **Test Main Site:**
```
https://ggloop.io
```

### **Test Admin Dashboard:**
```
https://ggloop.io/admin
```

---

## 📧 STEP 6: Check Email After 1 Hour

### **Your Email:**
```
jaysonquindao@ggloop.io
```

**What to Look For:**
- Automation report (if errors occurred)
- Daily business report (at 8 AM)
- Check spam folder if nothing appears

---

## 🔗 ALL LINKS IN ONE PLACE

### **Railway:**
```
https://railway.app
```

### **PayPal Developer:**
```
https://developer.paypal.com/
```

### **Your Site:**
```
https://ggloop.io
```

### **Subscription Page:**
```
https://ggloop.io/subscription
```

### **Admin Dashboard:**
```
https://ggloop.io/admin
```

### **GitHub Repo:**
```
https://github.com/djjrip/gg-loop-platform
```

---

## 📝 COMPLETE CHECKLIST

### **PayPal:**
- [ ] Go to: `https://developer.paypal.com/`
- [ ] Login
- [ ] Verify Client ID matches: `AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu`
- [ ] Verify Client Secret matches: `EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL`
- [ ] If different, copy correct values from PayPal

### **Railway - Fix Variable:**
- [ ] Go to: `https://railway.app`
- [ ] Project → Web Service → Variables
- [ ] Delete ALL `VITE_PAYPAL_CLIENT_ID` entries
- [ ] Add ONE: Name = `VITE_PAYPAL_CLIENT_ID`, Value = `AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu`
- [ ] Wait for redeploy (2-3 minutes)

### **Railway - Add Cron Jobs:**
- [ ] Create Service 1: `Master Automation`
- [ ] Start Command: `npx tsx server/masterAutomation.ts`
- [ ] Schedule: `0 * * * *`
- [ ] Create Service 2: `Reward Fulfillment`
- [ ] Start Command: `npx tsx server/automation/rewardFulfillment.ts`
- [ ] Schedule: `*/15 * * * *`

### **Verify:**
- [ ] Test: `https://ggloop.io/subscription` - PayPal buttons appear
- [ ] Wait 1 hour
- [ ] Check email: `jaysonquindao@ggloop.io` for automation report

---

## 🚨 IF SOMETHING GOES WRONG

### **PayPal Buttons Not Showing:**
1. Check Railway Variables: `VITE_PAYPAL_CLIENT_ID` exists
2. Check Railway Logs: Look for errors
3. Check Browser Console: `F12` → Console tab → Look for errors
4. Verify deployment succeeded in Railway

### **Automation Not Running:**
1. Check Railway Cron Jobs are created
2. Check Railway Logs for errors
3. Verify environment variables are set
4. Check `ADMIN_EMAILS` is correct

### **Need Help:**
- Check Railway logs: `https://railway.app` → Your Service → Logs
- Check deployment status: `https://railway.app` → Your Service → Deployments

---

## 🎯 QUICK REFERENCE

**PayPal Dashboard:**
```
https://developer.paypal.com/
```

**Railway Dashboard:**
```
https://railway.app
```

**Your Site:**
```
https://ggloop.io
```

**Subscription Page:**
```
https://ggloop.io/subscription
```

**PayPal Client ID:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**PayPal Client Secret:**
```
EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL
```

**Master Automation Command:**
```
npx tsx server/masterAutomation.ts
```

**Reward Fulfillment Command:**
```
npx tsx server/automation/rewardFulfillment.ts
```

**Master Automation Schedule:**
```
0 * * * *
```

**Reward Fulfillment Schedule:**
```
*/15 * * * *
```

---

**Everything you need in one place! Just copy-paste!** 🚀

