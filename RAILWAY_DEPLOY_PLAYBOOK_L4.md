# RAILWAY DEPLOY PLAYBOOK - LEVEL 4
**GG LOOP LLC - Production Deployment Guide**

**Purpose:** Resolve stale frontend deployment issue and ensure latest code from `main` branch is live on ggloop.io

**Current Situation:**
- ✅ Code merged to `main` (commit dd83286 + daf229b footer fix)
- ✅ Railway configuration is correct
- ❌ Production still serving old frontend assets
- **Action Required:** Manual Railway dashboard intervention

---

## 🚀 STEP-BY-STEP DEPLOYMENT CHECKLIST

### PHASE 1: VERIFY CURRENT DEPLOYMENT STATUS

**1. Access Railway Dashboard**
- Go to https://railway.app
- Log in with your Railway account
- Select the **GG Loop Platform** project

**2. Check Active Deployment**
- Click on the **Production** environment (or your main deployment)
- Look at the **Deployments** tab
- Find the most recent deployment entry

**3. Verify Deployment Details**
Check the following:
- [ ] **Commit Hash:** Does it match `dd83286` or later?
- [ ] **Status:** Does it say "Success" or "Failed"?
- [ ] **Build Time:** When did it complete?
- [ ] **Branch:** Is it deploying from `main`?

**If Status = "Failed":**
- Click on the failed deployment
- Scroll to **Build Logs**
- Look for error messages (usually in red)
- Common issues:
  - `npm install` failures (dependency issues)
  - `npm run build` failures (TypeScript errors)
  - Out of memory errors
- **Action:** Screenshot the error and send to AG for diagnosis

**If Status = "Success" but frontend is stale:**
- Proceed to Phase 2 (Cache Clearing)

---

### PHASE 2: CLEAR CACHES AND FORCE REDEPLOY

**4. Clear Railway Cache**
- In the deployment settings, look for **"Clear Build Cache"** option
- Click it to remove cached build artifacts
- This ensures a fresh build on next deploy

**5. Trigger Manual Redeploy**
- Option A: Click **"Redeploy"** button on the latest deployment
- Option B: Go to **Settings** → **Triggers** → Click **"Deploy Now"**
- Option C: Make a trivial commit to `main` (add newline to README) and push

**Recommended:** Use Option A (Redeploy button) first

**6. Monitor New Deployment**
- Watch the **Build Logs** in real-time
- Look for these key steps:
  ```
  ✓ Installing dependencies...
  ✓ Running build command: npm run build
  ✓ vite v5.4.21 building for production...
  ✓ 2432 modules transformed
  ✓ built in ~8s
  ✓ Starting server: npm start
  ```
- Wait for status to change to **"Success"**
- Note the new deployment URL (should be same as before)

---

### PHASE 3: VERIFY DEPLOYMENT SETTINGS

**7. Double-Check Build Configuration**
Go to **Settings** → **Build** and verify:

- [ ] **Build Command:** `npm run build`
- [ ] **Start Command:** `npm start`
- [ ] **Root Directory:** `.` (or blank)
- [ ] **Watch Paths:** (leave default or blank)

**8. Check Environment Variables**
Go to **Settings** → **Variables** and confirm:

- [ ] `NODE_ENV` = `production` (or not set, defaults to production)
- [ ] All required secrets are present (DATABASE_URL, SESSION_SECRET, etc.)
- [ ] No typos in variable names

**9. Verify Branch Deployment**
Go to **Settings** → **Triggers** and confirm:

- [ ] **Branch:** `main` (not `ggloop-staging`)
- [ ] **Auto-deploy:** Enabled (checkbox checked)
- [ ] **PR Previews:** (optional, can be disabled)

---

### PHASE 4: VERIFY LIVE SITE

**10. Hard Refresh Production Site**
After deployment succeeds:

- Open https://ggloop.io in **Incognito/Private** window
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
- Check the following:

**Homepage (/):**
- [ ] Hero text says "request rewards (manual fulfillment)"
- [ ] Footer appears exactly **once** at bottom

**Shop (/shop):**
- [ ] "Manual Fulfillment Process" banner is visible
- [ ] Reward buttons say "Request Reward" (if rewards visible)
- [ ] Footer appears exactly **once**

**Stats (/stats):**
- [ ] Login required or shows "Browse Rewards" button (if logged in)

**11. Check Browser Console**
- Press `F12` to open DevTools
- Go to **Console** tab
- Look for errors (red text)
- Common issues:
  - 404 errors for missing assets
  - CORS errors
  - JavaScript errors

**12. Verify Asset Versions**
- In DevTools, go to **Network** tab
- Refresh the page
- Look for `index-*.js` file
- Check the hash in filename (e.g., `index-C8Fd5Xz3.js`)
- **New hash = new build deployed**
- **Same hash as before = still cached**

---

## 🔧 TROUBLESHOOTING

### Issue: Build Succeeds but Frontend Still Stale

**Possible Causes:**
1. **CDN Cache:** Railway uses edge caching
2. **Browser Cache:** Even with hard refresh
3. **Service Worker:** Old service worker cached

**Solutions:**

**A) Clear Railway CDN Cache:**
- Railway doesn't have a manual CDN purge button
- Wait 5-10 minutes for cache TTL to expire
- OR: Change a static asset (add comment to index.html) and redeploy

**B) Clear Browser Cache Completely:**
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Firefox: Settings → Privacy → Clear Data → Cached Web Content
- Safari: Develop → Empty Caches

**C) Check Service Worker:**
- In DevTools, go to **Application** tab → **Service Workers**
- Click **Unregister** if one is registered
- Refresh the page

**D) Test from Different Device/Network:**
- Use your phone on cellular data (not WiFi)
- Use a VPN to different location
- Ask a friend to check the site

---

### Issue: Build Fails

**Common Errors:**

**1. "Cannot find module" or "Module not found"**
- **Cause:** Missing dependency in package.json
- **Fix:** Run `npm install` locally, commit package-lock.json, push to main

**2. "TypeScript error" or "Type 'X' is not assignable"**
- **Cause:** Type errors in code
- **Fix:** Run `npm run check` locally, fix errors, commit, push

**3. "ENOSPC: no space left on device"**
- **Cause:** Railway runner out of disk space
- **Fix:** Clear build cache (Step 4), redeploy

**4. "Killed" or "Out of memory"**
- **Cause:** Build process uses too much RAM
- **Fix:** Upgrade Railway plan or optimize build

---

## 📋 EXPECTED RESULTS AFTER SUCCESSFUL DEPLOY

Once you complete this playbook and deployment succeeds, you should see:

### Production Site (ggloop.io)

**Homepage:**
- ✅ Hero: "...earn points, and request rewards (manual fulfillment)"
- ✅ Footer appears once at bottom
- ✅ No duplicate footer

**Shop Page:**
- ✅ Blue/info alert banner: "Manual Fulfillment Process - All reward redemptions are processed manually by our team. Please allow 2-5 business days for fulfillment. Rewards are subject to availability."
- ✅ Reward buttons: "Request Reward" (not "Redeem Reward")
- ✅ Footer appears once

**Stats Page (logged in):**
- ✅ Main CTA button: "Browse Rewards" (not "Redeem Points")
- ✅ Footer appears once

**My Rewards Page (logged in):**
- ✅ Empty state: "...request rewards with your points (manual fulfillment, 2-5 days)!"
- ✅ Footer appears once

**Backend:**
- ✅ `/health` returns `{"status":"ok"}`
- ✅ Error handlers log and exit on fatal errors
- ✅ Match sync has circuit breaker (stops after 3 failures)

---

## 🆘 IF ALL ELSE FAILS

**Nuclear Option: Force Fresh Deploy**

1. Create a new Railway service from scratch
2. Connect to same GitHub repo
3. Set environment variables
4. Deploy from `main` branch
5. Update DNS to point to new service
6. Delete old service once confirmed working

**OR: Contact Railway Support**

- Go to Railway Dashboard → Help → Contact Support
- Explain: "Latest deployment shows success but serves stale frontend assets"
- Provide: Project name, deployment ID, commit hash
- Ask: "How to force cache purge or verify build artifacts are being served"

---

## ✅ COMPLETION CHECKLIST

Before considering this playbook complete:

- [ ] Verified latest deployment status in Railway
- [ ] Checked build logs for errors
- [ ] Confirmed build command and start command are correct
- [ ] Triggered manual redeploy
- [ ] Waited for new deployment to succeed
- [ ] Hard refreshed ggloop.io in incognito mode
- [ ] Verified homepage shows "request rewards (manual fulfillment)"
- [ ] Verified shop shows manual fulfillment banner
- [ ] Verified footer appears exactly once on all pages
- [ ] Checked browser console for errors
- [ ] Verified new asset hash in Network tab

**If all checkboxes are checked and site still shows old content:**
- Screenshot the Railway deployment page
- Screenshot the browser Network tab showing asset hashes
- Send to AG for further diagnosis

---

**Last Updated:** December 10, 2025  
**Created By:** AG (Technical Execution Agent)  
**For:** GG LOOP LLC - Level 4 System Safety & Platform Hardening
