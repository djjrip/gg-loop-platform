# 📋 INSTRUCTIONS FOR AG (ANTIGRAVITY)

**From:** Cursor AI  
**To:** AG (Antigravity)  
**Subject:** Browser Automation Setup for GG LOOP

---

## 🎯 YOUR MISSION

Set up browser automation for affiliate program signups. The code is already written, you just need to:
1. Install dependencies
2. Configure environment variables
3. Test the automation
4. Verify everything uses REAL data

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### Step 1: Install Puppeteer
```bash
cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
npm install puppeteer
```

### Step 2: Set Environment Variables

Add these to Railway dashboard (Variables tab) or .env file:

```
BUSINESS_NAME=GG LOOP LLC
BUSINESS_EMAIL=user-email@ggloop.io
BUSINESS_TAX_ID=user-tax-id-here
BASE_URL=https://ggloop.io
ADMIN_EMAILS=user-email@ggloop.io
```

**⚠️ IMPORTANT:** Get the real email and tax ID from the user. Never hardcode.

### Step 3: Test Browser Automation

```bash
npm run automate:affiliates
```

**What should happen:**
1. Browser opens (you can see it)
2. Navigates to Amazon Associates signup page
3. Fills form with business info from env vars
4. Waits 30 seconds for user to verify
5. Reports success/failure

### Step 4: Add Business Automation to Cron

In Railway Dashboard → Settings → Cron Jobs:

```
Name: Business Automation Engine
Schedule: 0 * * * *  (every hour)
Command: npx tsx server/businessAutomation.ts
```

---

## 🔐 CRITICAL RULES

### Privacy:
- ✅ All sensitive data in environment variables
- ✅ Never hardcode email, tax ID, passwords
- ✅ Browser visible (headless: false) for verification

### Authenticity:
- ✅ All numbers must be REAL (from database)
- ✅ No fake/test data in reports
- ✅ All metrics from actual database queries
- ✅ This is a REAL business, not a demo

---

## 📁 FILES TO REVIEW

1. `server/automation/browserAutomation.ts` - Browser automation code
2. `server/businessAutomation.ts` - Business automation engine
3. `FOR_AG_AUTOMATION_STATUS.md` - Complete status document
4. `AUTHENTICITY_GUARDRAILS.md` - Rules for real data

---

## ✅ VERIFICATION CHECKLIST

Before finishing:
- [ ] Puppeteer installed successfully
- [ ] Environment variables set (get real values from user)
- [ ] Browser automation tested (form fills correctly)
- [ ] All database queries use REAL data (check businessAutomation.ts)
- [ ] No hardcoded example numbers anywhere
- [ ] Business automation added to Railway cron jobs
- [ ] Daily reports will use real email from ADMIN_EMAILS

---

## 🚨 COMMON ISSUES

**Issue:** Puppeteer fails to install
**Fix:** Make sure Node.js version is 18+ and run `npm install puppeteer` again

**Issue:** Browser doesn't open
**Fix:** Check that headless is set to false in browserAutomation.ts

**Issue:** Form doesn't fill
**Fix:** Website structure may have changed. Check selectors in browserAutomation.ts

**Issue:** Environment variables not found
**Fix:** Make sure they're set in Railway Variables tab, not just .env file

---

## 💡 TIPS

1. Test with one affiliate program first (Amazon Associates)
2. Verify form fills correctly before automating more
3. Always check that numbers are REAL (query database, don't assume)
4. Show user the browser so they can verify what's happening

---

## 📞 IF YOU GET STUCK

1. Check `FOR_AG_AUTOMATION_STATUS.md` for detailed info
2. Verify environment variables are set correctly
3. Make sure Puppeteer installed successfully
4. Check that all database queries use real data (not test data)

---

**AG - The code is ready. Just set it up, test it, and verify everything uses REAL data. The user is non-technical, so make it work smoothly.** ✅

