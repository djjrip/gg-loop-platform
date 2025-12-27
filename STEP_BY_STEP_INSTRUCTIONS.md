# 📋 STEP-BY-STEP: How to Fix PayPal Buttons

**Time:** 5 minutes  
**Difficulty:** Easy (just clicking buttons)

---

## 🎯 STEP 1: Add PayPal Client ID to Railway

### **1.1: Open Railway**
1. Go to: **https://railway.app**
2. **Log in** with your GitHub account (or Railway account)
3. You'll see your projects dashboard

### **1.2: Find Your Project**
1. Look for your **GG LOOP** project
2. **Click on it** to open the project

### **1.3: Open Your Service**
1. You'll see services listed (like "web", "api", or your service name)
2. **Click on your main web service** (the one that runs your app)

### **1.4: Go to Variables Tab**
1. At the top, you'll see tabs: **"Deployments"**, **"Variables"**, **"Settings"**, etc.
2. **Click "Variables"** tab

### **1.5: Add New Variable**
1. You'll see a list of existing variables
2. Click the **"+ New Variable"** button (usually at the top right)
3. A form will appear

### **1.6: Enter the Variable**
1. **Variable Name:** Type exactly: `VITE_PAYPAL_CLIENT_ID`
   - Must be exact: `VITE_PAYPAL_CLIENT_ID` (with VITE_ prefix)
2. **Variable Value:** Paste this:
   ```
   AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
   ```
3. **Click "Add"** or **"Save"**

### **1.7: Wait for Redeploy**
- Railway will **automatically redeploy** your app
- You'll see a deployment starting in the "Deployments" tab
- **Wait 2-3 minutes** for it to finish

### **1.8: Verify It's Set**
1. Go back to **"Variables"** tab
2. You should see `VITE_PAYPAL_CLIENT_ID` in the list
3. ✅ **Done!**

---

## 🎯 STEP 2: Test the Payment Buttons

### **2.1: Visit Your Site**
1. Go to: **https://ggloop.io/subscription**
2. You should see the subscription page with tier cards

### **2.2: Check for Buttons**
1. Look at the **Basic**, **Pro**, and **Elite** tier cards
2. At the bottom of each paid tier, you should see:
   - **PayPal button** (gold/yellow button that says "Subscribe")
   - OR a loading spinner that becomes a PayPal button

### **2.3: If Buttons Still Don't Show**
1. **Hard refresh** the page: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache** and try again
3. **Check browser console:**
   - Press `F12` to open developer tools
   - Click "Console" tab
   - Look for errors about PayPal
   - If you see "VITE_PAYPAL_CLIENT_ID not set", the variable didn't save correctly

### **2.4: If Still Not Working**
1. Go back to Railway
2. Check the **"Deployments"** tab
3. Make sure the latest deployment **succeeded** (green checkmark)
4. If it failed, check the logs for errors

---

## 🎯 STEP 3: Set Up Cron Job (Optional - For Automation)

### **3.1: Go to Railway Dashboard**
1. Back at Railway dashboard
2. Click your **GG LOOP project**

### **3.2: Add New Service**
1. Click the **"+ New"** button (usually top right)
2. Select **"Cron Job"** from the dropdown

### **3.3: Configure Cron Job**
1. **Name:** `Business Automation Engine`
2. **Schedule:** Type exactly: `0 * * * *`
   - This means "every hour"
3. **Command:** Type exactly: `npm run automate:business`
4. **Service:** Select your main web service from dropdown
5. Click **"Create"** or **"Add"**

### **3.4: Verify It's Running**
1. Go to **"Deployments"** tab
2. You should see the cron job listed
3. It will run automatically every hour

**What it does:**
- Monitors business health
- Auto-approves safe redemptions (< $50)
- Sends you daily reports at 8 AM

---

## 🎯 STEP 4: Test Complete Payment Flow

### **4.1: Test Subscription (Use Sandbox Account)**
1. Go to: **https://ggloop.io/subscription**
2. **Log in** (or create account)
3. Click **"Subscribe"** on any tier (Basic/Pro/Elite)
4. PayPal button should appear
5. Click the **PayPal button**

### **4.2: PayPal Checkout**
1. You'll be redirected to PayPal
2. **Log in with PayPal sandbox account:**
   - If you don't have one, create at: https://developer.paypal.com
   - Go to Sandbox → Accounts → Create test account
3. **Approve the payment**
4. You'll be redirected back to your site

### **4.3: Verify Subscription**
1. After redirect, you should see "Subscription Activated!"
2. Go to `/admin/users` (if you're admin)
3. Find your user
4. Check subscription status - should be "active"
5. Check points balance - should have received points

---

## 🆘 TROUBLESHOOTING

### **Problem: Can't Find Railway Dashboard**
- **Solution:** Go to https://railway.app and log in
- If you don't have an account, sign up with GitHub

### **Problem: Can't Find Variables Tab**
- **Solution:** Make sure you clicked on your **service**, not just the project
- Variables are per-service, not per-project

### **Problem: Variable Won't Save**
- **Solution:** 
  - Make sure name is exactly: `VITE_PAYPAL_CLIENT_ID`
  - No spaces, no quotes around the value
  - Try refreshing the page and adding again

### **Problem: Deployment Fails**
- **Solution:**
  - Check "Deployments" tab → Click failed deployment → See logs
  - Common issues: Build errors, missing dependencies
  - Check Railway logs for specific error

### **Problem: Buttons Still Don't Show After Fix**
- **Solution:**
  1. Hard refresh: `Ctrl + Shift + R`
  2. Clear browser cache
  3. Try incognito/private window
  4. Check browser console for errors (F12)
  5. Verify variable is set in Railway (go back and check)

### **Problem: PayPal Checkout Fails**
- **Solution:**
  - Make sure you're using **sandbox** PayPal account
  - Check PayPal mode is set to "sandbox" in Railway variables
  - Verify PayPal plan IDs are correct

---

## ✅ CHECKLIST

Before you start:
- [ ] Have Railway account
- [ ] Have access to your Railway project
- [ ] Know your PayPal sandbox credentials (for testing)

After Step 1:
- [ ] Variable `VITE_PAYPAL_CLIENT_ID` is in Railway
- [ ] Deployment completed successfully
- [ ] No errors in Railway logs

After Step 2:
- [ ] Can see PayPal buttons on subscription page
- [ ] Buttons are clickable
- [ ] No errors in browser console

After Step 3 (Optional):
- [ ] Cron job created in Railway
- [ ] Cron job shows in deployments
- [ ] Will run every hour automatically

After Step 4:
- [ ] Can complete test subscription
- [ ] Subscription activates in database
- [ ] Points are awarded
- [ ] Can see subscription in admin panel

---

## 📞 NEED HELP?

### **If You Get Stuck:**
1. **Check Railway Logs:**
   - Railway dashboard → Service → "Logs" tab
   - Look for error messages
   - Copy error and ask for help

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for red error messages
   - Copy error and ask for help

3. **Verify Variables:**
   - Railway → Variables tab
   - Make sure `VITE_PAYPAL_CLIENT_ID` is there
   - Check spelling (must be exact)

---

## 🎯 QUICK REFERENCE

**Railway Dashboard:** https://railway.app  
**Your Site:** https://ggloop.io/subscription  
**Variable Name:** `VITE_PAYPAL_CLIENT_ID`  
**Variable Value:** `AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu`

**That's it! Follow these steps and you're done!** 🚀

