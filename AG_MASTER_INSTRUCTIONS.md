# 🎯 MASTER INSTRUCTIONS FOR AG (ANTIGRAVITY)

**CRITICAL: Read this entire document before doing ANYTHING**

---

## ⚠️ **AUTHENTICITY FIRST - NON-NEGOTIABLE**

### **THIS IS A REAL BUSINESS - NO FAKE DATA EVER**

**Before you write ANY code or create ANY automation:**

1. ✅ **ALWAYS query the database** - Never hardcode numbers
2. ✅ **ALWAYS use real data** - No mock/test/example data
3. ✅ **ALWAYS use environment variables** - Never hardcode credentials
4. ✅ **ALWAYS show 0 or "No data"** - Never fake numbers for empty states

### **❌ NEVER DO THIS:**
```typescript
// ❌ WRONG - Never do this
const revenue = 1250; // Hardcoded
const users = 156; // Example number
const data = [{ id: 'test', name: 'Example' }]; // Mock data
```

### **✅ ALWAYS DO THIS:**
```typescript
// ✅ CORRECT - Always do this
const [revenue] = await db
  .select({ total: sql<number>`SUM(amount)` })
  .from(pointTransactions)
  .where(gte(createdAt, today));

const [users] = await db
  .select({ count: sql<number>`count(*)` })
  .from(users);
```

**If you create ANY code with fake data, you're breaking the business. This is REAL. Every number must be REAL.**

---

## 📋 **WHAT TO WORK ON RIGHT NOW**

### **Priority 1: Verify & Fix Any Fake Data**

**Task:** Search the entire codebase for fake/mock/test data and replace with real database queries.

**What to look for:**
- Hardcoded numbers (revenue, user counts, etc.)
- Mock/test data arrays
- Example data in reports
- Placeholder numbers in calculations
- Comments saying "mock" or "example"

**Files to check:**
- `server/routes.ts` - Already fixed (brand data)
- `server/revenueOptimizer.ts` - Already fixed (LTV calculation)
- `server/businessAutomation.ts` - Verify all queries are real
- `server/analytics.ts` - Check for fake metrics
- Any dashboard/report files

**How to fix:**
1. Find the fake data
2. Replace with database query
3. If no data exists, return 0 or empty array (NOT fake data)
4. Test that it works with real database

**Reference:** See `AUTHENTICITY_GUARDRAILS.md` for examples

---

### **Priority 2: Test Browser Automation**

**Task:** Test the affiliate signup automation that Cursor built.

**File:** `server/automation/browserAutomation.ts`

**Steps:**
1. Install Puppeteer: `npm install puppeteer`
2. Set environment variables:
   ```bash
   export BUSINESS_EMAIL=your-email@ggloop.io
   export BUSINESS_NAME="GG LOOP LLC"
   export BASE_URL=https://ggloop.io
   ```
3. Test Amazon Associates signup:
   ```bash
   npx tsx server/automation/browserAutomation.ts amazon
   ```
4. Verify:
   - Browser opens (headless: false)
   - Form fills with real business data from env vars
   - No hardcoded data anywhere
   - Pauses for manual CAPTCHA verification
5. Report back: Success or what needs fixing

**What to verify:**
- ✅ Uses environment variables (not hardcoded)
- ✅ Shows browser for verification
- ✅ Pauses before final submission
- ✅ No fake data anywhere

---

### **Priority 3: Set Up Business Automation Cron Job**

**Task:** Add the business automation to Railway cron jobs.

**File:** `server/businessAutomation.ts` (already built by Cursor)

**What it does:**
- Runs every hour
- Monitors business health (real data from database)
- Auto-approves safe redemptions (< $50)
- Sends daily report at 8 AM

**Railway Cron Job Setup:**
```
Name: Business Automation Engine
Schedule: 0 * * * *  (every hour)
Command: npx tsx server/businessAutomation.ts
```

**Before deploying:**
- ✅ Verify all queries use real database data
- ✅ Check that no fake numbers exist
- ✅ Test locally first
- ✅ Verify email sending works

**Reference:** See `setup-cron-jobs.ts` for format

---

### **Priority 4: Audit All Reports & Dashboards**

**Task:** Find and fix any reports/dashboards showing fake data.

**What to check:**
- Admin dashboard (`/admin`)
- Business health reports
- Revenue reports
- User analytics
- Any email templates with numbers

**For each report:**
1. Find where numbers come from
2. Verify it's a database query (not hardcoded)
3. If it's hardcoded, replace with real query
4. Test with real database

**Example check:**
```typescript
// ❌ BAD - If you see this, fix it
const revenue = 1250;

// ✅ GOOD - Should be this
const [revenue] = await db
  .select({ total: sql<number>`SUM(amount)` })
  .from(pointTransactions);
```

---

## 🚫 **WHAT NOT TO DO**

### **❌ DO NOT:**
1. Create fake data for demos
2. Use hardcoded example numbers
3. Create mock/test data in production code
4. Show "example" metrics to users
5. Use placeholder data in calculations
6. Hardcode credentials (use env vars)
7. Create automation that generates fake transactions

### **✅ DO:**
1. Query database for all data
2. Return 0 or empty array if no data
3. Show "No data yet" instead of fake numbers
4. Use environment variables for all sensitive data
5. Test with real database
6. Verify authenticity before deploying

---

## 📁 **FILES TO READ FIRST**

**Before you start coding, read these:**

1. **`AUTHENTICITY_GUARDRAILS.md`** - Rules for authentic data
2. **`AUTHENTICITY_AUDIT.md`** - What Cursor already fixed
3. **`FOR_AG_AUTOMATION_STATUS.md`** - Current status
4. **`server/businessAutomation.ts`** - Example of authentic code
5. **`server/automation/browserAutomation.ts`** - Browser automation example

---

## ✅ **AUTHENTICITY CHECKLIST**

**Before you deploy ANY code:**

- [ ] All revenue numbers come from `pointTransactions` table
- [ ] All user counts come from `users` table
- [ ] All redemption data comes from `rewardClaims` table
- [ ] All calculations use real database queries
- [ ] No hardcoded example numbers
- [ ] No mock/test data in production code
- [ ] Empty states show 0 or "No data", not fake numbers
- [ ] All metrics are calculated, not assumed
- [ ] Environment variables used for all sensitive data
- [ ] Tested with real database (not fake data)

**If you can't check all boxes, DON'T DEPLOY. Fix it first.**

---

## 🎯 **YOUR IMMEDIATE TASKS (In Order)**

### **Task 1: Authenticity Audit** (30 min)
- Search codebase for fake data
- Fix any hardcoded numbers
- Replace with real database queries
- Test with real database

### **Task 2: Test Browser Automation** (1 hour)
- Install Puppeteer
- Set env variables
- Test affiliate signup
- Verify no hardcoded data
- Report results

### **Task 3: Set Up Cron Job** (15 min)
- Add business automation to Railway
- Test locally first
- Verify all queries are real
- Deploy and monitor

### **Task 4: Report Back** (15 min)
- What you found (fake data or all good?)
- What you fixed
- What's working
- What needs Cursor's help

---

## 💬 **HOW TO COMMUNICATE**

**When reporting back, use this format:**

```
✅ AUTHENTICITY CHECK:
- Found X instances of fake data
- Fixed: [list what you fixed]
- Verified: [list what's authentic]

✅ BROWSER AUTOMATION:
- Status: [working / needs fixes]
- Issues: [list any problems]
- Ready: [yes / no]

✅ CRON JOB:
- Status: [deployed / needs help]
- Working: [yes / no]

❓ NEEDS CURSOR:
- [List anything you can't fix]
```

---

## 🔥 **REMEMBER**

**This is a REAL business. Every number must be REAL.**

**If you're not sure if something is authentic:**
1. Check if it queries the database
2. If not, it's probably fake - fix it
3. When in doubt, ask Cursor

**Your job is to:**
- ✅ Verify everything is authentic
- ✅ Fix any fake data
- ✅ Test automation
- ✅ Set up cron jobs
- ✅ Report back honestly

**NOT to:**
- ❌ Create fake data
- ❌ Use example numbers
- ❌ Hide problems
- ❌ Deploy unauthentic code

---

## 📞 **IF YOU GET STUCK**

**If you find something you can't fix:**
1. Document what you found
2. Explain why it's a problem
3. Ask Cursor for help
4. Don't deploy broken code

**If you're not sure if something is authentic:**
1. Check the code
2. See if it queries database
3. If not, it's probably fake
4. Ask Cursor to verify

---

## ✅ **FINAL REMINDER**

**This is GG LOOP LLC - a REAL business with REAL users and REAL revenue.**

**Every number must come from the REAL database.**

**No fake data. No examples. No mock numbers.**

**100% authentic. Always.**

---

**Now go verify everything is authentic and report back.** 🚀

