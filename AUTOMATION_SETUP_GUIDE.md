# 🤖 AUTOMATION SETUP GUIDE

## Quick Start: Browser Automation for Affiliate Signups

### Step 1: Install Dependencies
```bash
npm install puppeteer
```

### Step 2: Set Environment Variables

Add these to your `.env` file or Railway variables:

```bash
# Business Information (PRIVATE - use your real data)
BUSINESS_NAME=GG LOOP LLC
BUSINESS_EMAIL=your-email@ggloop.io
BUSINESS_TAX_ID=your-tax-id-here
BASE_URL=https://ggloop.io

# Optional: Business Address (JSON format)
BUSINESS_ADDRESS={"street":"123 Main St","city":"City","state":"ST","zip":"12345","country":"US"}

# Admin Email (for daily reports)
ADMIN_EMAILS=your-email@ggloop.io
```

**⚠️ IMPORTANT:** Never commit these values to git. Use environment variables only.

### Step 3: Run Browser Automation

```bash
# Automate affiliate signups
npm run automate:affiliates

# Or directly:
npx tsx server/automation/browserAutomation.ts
```

### Step 4: What Happens

1. ✅ Browser opens (you can see it)
2. ✅ Navigates to affiliate signup page
3. ✅ Fills form with your business info
4. ⏸️ **Pauses for 30 seconds** - You verify and complete CAPTCHA
5. ✅ Reports success/failure

---

## 🔐 Privacy & Security

### ✅ What's Safe:
- Environment variables (never in code)
- Browser shows you what it's doing (headless: false)
- Pauses for manual verification
- No credentials hardcoded

### ❌ What's NOT Safe:
- Hardcoding email in code
- Committing .env to git
- Auto-submitting without verification
- Storing passwords in code

---

## 📋 Available Automation Commands

```bash
# Browser automation (affiliate signups)
npm run automate:affiliates

# Business automation (health monitoring)
npm run automate:business

# Both (run business automation hourly via cron)
# Add to Railway cron jobs
```

---

## 🎯 What Gets Automated

### ✅ Automated:
- Form filling (uses your real business data)
- Navigation to signup pages
- Data entry from environment variables

### ⏸️ Manual (You Do):
- CAPTCHA solving
- Final form submission (you verify first)
- Reviewing filled information
- Approving high-value redemptions (> $50)

---

## ✅ Authenticity Guarantee

All automation uses:
- ✅ Real database queries (no fake numbers)
- ✅ Real business data (from env vars)
- ✅ Real metrics (calculated from actual data)
- ✅ Real user counts (from database)

**No test data, no fake numbers, 100% authentic.** ✅

---

## 🚀 Next Steps

1. Set environment variables
2. Install Puppeteer: `npm install puppeteer`
3. Test with one affiliate program
4. Verify form fills correctly
5. Add to cron jobs for business automation

---

**For AG:** See `FOR_AG_AUTOMATION_STATUS.md` for complete status and next steps.

