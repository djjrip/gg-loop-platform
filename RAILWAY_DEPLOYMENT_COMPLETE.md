# 🚂 RAILWAY DEPLOYMENT - COMPLETE GUIDE

**Current Status:** ✅ Connected to GitHub, auto-deploys on push  
**Domain:** https://ggloop.io  
**Database:** PostgreSQL (Railway managed)

---

## ✅ CURRENT SETUP

### **What's Already Working:**
- ✅ GitHub connected to Railway
- ✅ Auto-deploy on git push
- ✅ PostgreSQL database connected
- ✅ Backend environment variables set
- ✅ Domain configured (ggloop.io)

### **What Needs Fixing:**
- ❌ Frontend PayPal client ID missing
- ⏳ Cron jobs not set up
- ⏳ Business automation not running

---

## 🔧 FIX PAYPAL BUTTONS (URGENT)

### **The Problem:**
Payment buttons don't show on `/subscription` because frontend needs `VITE_PAYPAL_CLIENT_ID`

### **The Fix (5 minutes):**

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Click your project
   - Click your **web service** (or frontend service if separate)

2. **Add Environment Variable:**
   - Click **"Variables"** tab
   - Click **"+ New Variable"**
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu`
   - Click **"Add"**

3. **Redeploy:**
   - Railway will auto-redeploy
   - Or click **"Deploy"** → **"Redeploy"**
   - Wait 2-3 minutes

4. **Test:**
   - Visit https://ggloop.io/subscription
   - **PayPal buttons should now appear!** ✅

---

## 📋 COMPLETE ENVIRONMENT VARIABLES CHECKLIST

### **Backend Variables (Already Set):**
```bash
✅ DATABASE_URL=${{Postgres.DATABASE_URL}}
✅ PAYPAL_CLIENT_ID=AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
✅ PAYPAL_CLIENT_SECRET=EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL
✅ PAYPAL_MODE=sandbox
✅ NODE_ENV=production
✅ BASE_URL=https://ggloop.io
✅ SESSION_SECRET=[your secret]
✅ RIOT_API_KEY=[your key]
✅ ADMIN_EMAILS=jaysonquindao@ggloop.io
✅ BUSINESS_EMAIL=jaysonquindao@ggloop.io
✅ BUSINESS_NAME=GG LOOP LLC
```

### **Frontend Variables (NEEDS TO BE ADDED):**
```bash
❌ VITE_PAYPAL_CLIENT_ID=AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

**Add this NOW!**

---

## ⏰ SET UP CRON JOBS

### **Business Automation (Every Hour):**
1. Go to Railway dashboard
2. Click **"+ New"** → **"Cron Job"**
3. Configure:
   - **Name:** `Business Automation Engine`
   - **Schedule:** `0 * * * *` (every hour)
   - **Command:** `npm run automate:business`
   - **Service:** Your main service
4. Click **"Create"**

**What it does:**
- Monitors business health
- Auto-approves safe redemptions (< $50)
- Sends daily reports at 8 AM
- Only alerts when action needed

---

## 🚀 DEPLOYMENT WORKFLOW

### **How to Deploy Changes:**

**Option 1: Automatic (Recommended)**
```bash
# Make your changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds your app
# 3. Deploys to production
# 4. Takes 2-3 minutes
```

**Option 2: Manual Trigger**
1. Go to Railway dashboard
2. Click your service
3. Click **"Deploy"** → **"Redeploy"**
4. Wait for deployment

### **Check Deployment Status:**
1. Railway dashboard → See deployment logs
2. Check for errors
3. Test on https://ggloop.io

---

## 🔍 TROUBLESHOOTING

### **Deployment Fails:**
1. **Check Logs:**
   - Railway dashboard → Service → "Logs"
   - Look for error messages
   - Common issues: Missing env vars, build errors

2. **Check Environment Variables:**
   - Verify all required vars are set
   - Check for typos
   - Ensure no quotes around values

3. **Check Build:**
   - Railway dashboard → See build logs
   - Check for npm install errors
   - Verify package.json is correct

### **Site Not Loading:**
1. **Check Service Status:**
   - Railway dashboard → See if service is running
   - Check health check endpoint: `/health`

2. **Check Domain:**
   - Verify domain is configured
   - Check DNS settings
   - Wait for DNS propagation (up to 24 hours)

3. **Check Database:**
   - Verify database is connected
   - Check `DATABASE_URL` is set
   - Test connection in Railway dashboard

---

## 📊 MONITORING

### **Railway Dashboard:**
- **Metrics:** CPU, memory, network usage
- **Logs:** Real-time application logs
- **Deployments:** Deployment history
- **Database:** Database metrics

### **Application Health:**
- **Health Check:** `/health` endpoint
- **Business Health:** `/admin/founder-controls`
- **Daily Reports:** Email at 8 AM

---

## 🔐 SECURITY

### **Environment Variables:**
- ✅ Never commit secrets to GitHub
- ✅ Use Railway's variable system
- ✅ Rotate secrets regularly
- ✅ Use different values for dev/prod

### **Database:**
- ✅ Railway manages database security
- ✅ Connection pooling configured
- ✅ Regular backups enabled
- ✅ Access restricted to your service

### **Payments:**
- ✅ PayPal handles payment processing
- ✅ No credit card data stored
- ✅ Webhooks verified with signatures

---

## ✅ DEPLOYMENT CHECKLIST

### **Before Deploying:**
- [ ] All environment variables set
- [ ] Database connected
- [ ] PayPal configured
- [ ] Domain configured
- [ ] Admin email set

### **After Deploying:**
- [ ] Test homepage loads
- [ ] Test login works
- [ ] Test subscription page (buttons show)
- [ ] Test payment flow
- [ ] Check admin dashboard
- [ ] Verify cron jobs running

---

## 🎯 QUICK REFERENCE

### **Railway Dashboard:**
- **URL:** https://railway.app
- **Project:** Your GG LOOP project
- **Service:** Main web service

### **Key URLs:**
- **Production:** https://ggloop.io
- **Admin:** https://ggloop.io/admin
- **Health Check:** https://ggloop.io/health

### **Common Commands:**
```bash
# Deploy changes
git push origin main

# Check deployment status
# (Railway dashboard → Deployments)

# View logs
# (Railway dashboard → Logs)
```

---

## 📞 SUPPORT

### **Railway Support:**
- **Docs:** https://docs.railway.app
- **Discord:** Railway Discord community
- **Email:** support@railway.app

### **Your Setup:**
- **GitHub Repo:** Your repo URL
- **Railway Project:** Your project name
- **Domain:** ggloop.io

---

**Everything is ready! Just add `VITE_PAYPAL_CLIENT_ID` and you're good to go!** 🚀

