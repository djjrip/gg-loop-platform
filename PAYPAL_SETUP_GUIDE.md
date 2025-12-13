# PAYPAL SUBSCRIPTION SETUP GUIDE
**Complete Environment Configuration & Testing Checklist**

**Last Updated:** December 10, 2025  
**Purpose:** Configure PayPal sandbox and production credentials for GG Loop subscriptions

---

## 📋 QUICK REFERENCE: REQUIRED ENVIRONMENT VARIABLES

### Frontend (Vite)
```
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

### Backend (Node.js)
```
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here (optional for now)
```

### Optional (Production Only)
```
PAYPAL_BASIC_PLAN_ID=P-xxxxxxxxxxxxx (Bronze tier)
PAYPAL_PRO_PLAN_ID=P-xxxxxxxxxxxxx (Silver tier)
PAYPAL_ELITE_PLAN_ID=P-xxxxxxxxxxxxx (Gold tier)
```

---

## 1️⃣ EXACT ENVIRONMENT VARIABLES REQUIRED

### Frontend Variables (Vite)

**VITE_PAYPAL_CLIENT_ID**
- **Purpose:** PayPal SDK client ID for frontend button rendering
- **Format:** String (e.g., `AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUed1TLjYTKpJq0v`)
- **Required:** YES
- **Sandbox vs Production:** Use sandbox client ID for testing, production client ID for live
- **Where to get:** PayPal Developer Dashboard → My Apps & Credentials

### Backend Variables (Node.js)

**PAYPAL_CLIENT_ID**
- **Purpose:** PayPal API authentication (backend verification)
- **Format:** String (same as VITE_PAYPAL_CLIENT_ID)
- **Required:** YES
- **Note:** Should match frontend VITE_PAYPAL_CLIENT_ID

**PAYPAL_CLIENT_SECRET**
- **Purpose:** PayPal API secret for backend authentication
- **Format:** String (e.g., `EHLhS0KuBHDenU3g0Z9xWLNzKKh1WL-YjHEWGfwlqJ8v0pTbCpgAU-H9hQuXAN09UIcOr2fK4t2zruha`)
- **Required:** YES
- **Security:** NEVER commit to Git, NEVER expose to frontend
- **Where to get:** PayPal Developer Dashboard → My Apps & Credentials → Show Secret

**PAYPAL_WEBHOOK_ID** (Optional for now)
- **Purpose:** Webhook signature verification
- **Format:** String (e.g., `1AB23456CD789012E`)
- **Required:** NO (not critical for initial testing)
- **When needed:** For production webhook security
- **Where to get:** PayPal Developer Dashboard → Webhooks → Webhook ID

### Production Plan IDs (Optional)

**PAYPAL_BASIC_PLAN_ID** (Bronze Tier - $4.99/month)
- **Purpose:** Map PayPal plan to Bronze tier
- **Format:** String starting with `P-` (e.g., `P-6A485619U8349492UNEK4RRA`)
- **Required:** NO (sandbox has fallback IDs)
- **When needed:** Production deployment

**PAYPAL_PRO_PLAN_ID** (Silver Tier - $9.99/month)
- **Purpose:** Map PayPal plan to Silver tier
- **Format:** String starting with `P-`
- **Required:** NO (sandbox has fallback IDs)
- **When needed:** Production deployment

**PAYPAL_ELITE_PLAN_ID** (Gold Tier - $19.99/month)
- **Purpose:** Map PayPal plan to Gold tier
- **Format:** String starting with `P-`
- **Required:** NO (sandbox has fallback IDs)
- **When needed:** Production deployment

---

## 2️⃣ EXACT LOCATIONS TO ADD ENVIRONMENT VARIABLES

### Local Development

**File: `.env` (root directory)**
```bash
# PayPal Sandbox Credentials (Development)
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

**Important Notes:**
- ✅ Create `.env` file in project root if it doesn't exist
- ✅ Add `.env` to `.gitignore` (should already be there)
- ❌ NEVER commit `.env` to Git
- ✅ Restart dev server after adding env vars (`npm run dev`)

### Railway Production

**Location:** Railway Dashboard → Project → Variables

**Steps:**
1. Go to https://railway.app
2. Select "GG Loop Platform" project
3. Click "Variables" tab
4. Click "New Variable" for each:

**Add these variables:**
```
VITE_PAYPAL_CLIENT_ID = your_production_client_id
PAYPAL_CLIENT_ID = your_production_client_id
PAYPAL_CLIENT_SECRET = your_production_client_secret
```

**Optional (Production):**
```
PAYPAL_BASIC_PLAN_ID = P-xxxxxxxxxxxxx
PAYPAL_PRO_PLAN_ID = P-xxxxxxxxxxxxx
PAYPAL_ELITE_PLAN_ID = P-xxxxxxxxxxxxx
PAYPAL_WEBHOOK_ID = your_webhook_id
```

**Important Notes:**
- ✅ Railway auto-redeploys when you add/change variables
- ✅ Use PRODUCTION credentials, not sandbox
- ✅ Click "Add" after entering each variable
- ❌ Don't use quotes around values

### Vite-Specific Naming Rules

**CRITICAL: Frontend env vars MUST start with `VITE_`**

✅ **Correct:**
```
VITE_PAYPAL_CLIENT_ID=ABC123
```

❌ **Wrong (won't work):**
```
PAYPAL_CLIENT_ID=ABC123  // Backend only, not accessible in frontend
REACT_APP_PAYPAL_CLIENT_ID=ABC123  // Wrong prefix (React, not Vite)
```

**How Vite exposes env vars:**
- Only `VITE_*` variables are exposed to frontend code
- Access in code: `import.meta.env.VITE_PAYPAL_CLIENT_ID`
- Backend variables (without `VITE_`) are only accessible in Node.js via `process.env`

---

## 3️⃣ EXACT PAYPAL SANDBOX SETUP INSTRUCTIONS

### Step 1: Access PayPal Developer Dashboard

1. Go to https://developer.paypal.com
2. Log in with your PayPal account (or create one)
3. Click "Dashboard" in top navigation

### Step 2: Create Sandbox Business Account

1. Click "Sandbox" → "Accounts" in left sidebar
2. Click "Create Account" button
3. Configure account:
   - **Account Type:** Business
   - **Email:** `business@example.com` (or auto-generate)
   - **Password:** (auto-generated or custom)
   - **PayPal Balance:** $5,000 (default)
   - **Country:** United States
4. Click "Create Account"
5. **Save credentials** (email + password) for later

### Step 3: Create Sandbox Personal Account (Test Buyer)

1. Click "Create Account" again
2. Configure account:
   - **Account Type:** Personal
   - **Email:** `buyer@example.com` (or auto-generate)
   - **Password:** (auto-generated or custom)
   - **PayPal Balance:** $1,000 (default)
   - **Country:** United States
3. Click "Create Account"
4. **Save credentials** (email + password) for testing

### Step 4: Create Sandbox App & Get Credentials

1. Click "Apps & Credentials" in left sidebar
2. Ensure "Sandbox" tab is selected (not "Live")
3. Click "Create App" button
4. Configure app:
   - **App Name:** "GG Loop Subscriptions Sandbox"
   - **Sandbox Business Account:** Select the business account you created
5. Click "Create App"
6. **Copy credentials:**
   - **Client ID:** Copy the long string under "Client ID"
   - **Secret:** Click "Show" next to "Secret", then copy

### Step 5: Create Subscription Plans (Bronze, Silver, Gold)

1. In PayPal Developer Dashboard, click "Sandbox" → "Subscriptions"
2. Click "Create Plan" button

**Bronze Plan ($4.99/month):**
- **Plan Name:** GG Loop Bronze
- **Plan ID:** (auto-generated, copy this)
- **Billing Cycle:** Monthly
- **Price:** $4.99 USD
- **Setup Fee:** $0
- **Trial Period:** None
- Click "Create Plan"
- **Copy Plan ID** (starts with `P-`)

**Silver Plan ($9.99/month):**
- Repeat above with:
  - **Plan Name:** GG Loop Silver
  - **Price:** $9.99 USD
- **Copy Plan ID**

**Gold Plan ($19.99/month):**
- Repeat above with:
  - **Plan Name:** GG Loop Gold
  - **Price:** $19.99 USD
- **Copy Plan ID**

### Step 6: Add Credentials to .env

Update your `.env` file:
```bash
# PayPal Sandbox Credentials
VITE_PAYPAL_CLIENT_ID=your_copied_client_id
PAYPAL_CLIENT_ID=your_copied_client_id
PAYPAL_CLIENT_SECRET=your_copied_secret

# Optional: Sandbox Plan IDs
PAYPAL_BASIC_PLAN_ID=P-xxxxx (Bronze plan ID)
PAYPAL_PRO_PLAN_ID=P-xxxxx (Silver plan ID)
PAYPAL_ELITE_PLAN_ID=P-xxxxx (Gold plan ID)
```

---

## 4️⃣ TESTING SUBSCRIPTION FLOWS (SANDBOX)

### Prerequisites
- ✅ Sandbox business account created
- ✅ Sandbox personal account (test buyer) created
- ✅ Sandbox app created with Client ID + Secret
- ✅ Subscription plans created (Bronze, Silver, Gold)
- ✅ `.env` file updated with credentials
- ✅ Dev server restarted (`npm run dev`)

### Test Flow: Subscribe to Bronze Tier

**Step 1: Start Local Server**
```bash
npm run dev
```
- Server should start on http://localhost:5000
- Check console for "PayPal SDK loaded" (if you add logging)

**Step 2: Navigate to Subscription Page**
1. Open http://localhost:5000/subscription
2. You should see three tiers: Bronze, Silver, Gold
3. Each tier should have a PayPal button (gold color)

**Step 3: Click PayPal Button (Bronze)**
1. Click the PayPal button under Bronze tier
2. PayPal popup should open (not stuck on about:blank)
3. If popup doesn't open:
   - Check browser console for errors
   - Verify `VITE_PAYPAL_CLIENT_ID` is set correctly
   - Hard refresh page (Ctrl+Shift+R)

**Step 4: Log In to Sandbox Account**
1. In PayPal popup, click "Log In"
2. Use your **sandbox personal account** credentials:
   - Email: `buyer@example.com` (or your test buyer email)
   - Password: (your test buyer password)
3. Click "Log In"

**Step 5: Review Subscription**
1. PayPal shows subscription details:
   - Plan: GG Loop Bronze
   - Price: $4.99/month
   - Billing: Monthly
2. Click "Agree & Subscribe" button

**Step 6: Verify Success**
1. Popup closes automatically
2. Frontend shows success toast: "Subscription Activated!"
3. You're redirected to `/subscription/success`
4. Check your user profile - subscription tier should be "bronze"

**Step 7: Verify Backend**
1. Check server console logs:
   - `PayPal subscription verification succeeded`
   - `Subscription created/updated for user`
   - `Monthly subscription points awarded`
2. Check database:
   - `subscriptions` table should have new row
   - `status` = "active"
   - `tier` = "bronze"
   - `paypalSubscriptionId` = subscription ID from PayPal

### Test Flow: Cancel Subscription

**Step 1: Navigate to Subscription Page**
1. Go to http://localhost:5000/subscription
2. You should see "Current Tier: Bronze"
3. Click "Cancel Subscription" button

**Step 2: Confirm Cancellation**
1. Confirm cancellation in modal/dialog
2. Backend calls PayPal API to cancel subscription
3. Success toast: "Subscription cancelled"

**Step 3: Verify Cancellation**
1. Subscription status should change to "cancelled"
2. User should still have access until end of billing period
3. Check PayPal sandbox dashboard - subscription should show "Cancelled"

### Common Issues & Solutions

**Issue: PayPal popup stuck on about:blank**
- **Cause:** Missing or incorrect `VITE_PAYPAL_CLIENT_ID`
- **Fix:** Verify env var is set, restart dev server

**Issue: "PayPal not configured" error**
- **Cause:** Backend missing `PAYPAL_CLIENT_ID` or `PAYPAL_CLIENT_SECRET`
- **Fix:** Add to `.env`, restart server

**Issue: "Unrecognized subscription plan" error**
- **Cause:** Plan ID from PayPal doesn't match any tier
- **Fix:** Add plan IDs to `.env` or use sandbox fallback IDs

**Issue: Subscription verification fails**
- **Cause:** PayPal API credentials invalid or expired
- **Fix:** Regenerate credentials in PayPal Developer Dashboard

**Issue: Points not awarded**
- **Cause:** `pointsEngine.awardMonthlySubscriptionPoints` failing
- **Fix:** Check server logs for errors, verify points system is working

---

## 5️⃣ PRODUCTION DEPLOYMENT CHECKLIST

### Before Going Live

- [ ] Create **production** PayPal app (not sandbox)
- [ ] Create **production** subscription plans (Bronze, Silver, Gold)
- [ ] Copy **production** Client ID + Secret
- [ ] Add production credentials to Railway environment variables
- [ ] Test with **real** PayPal account (not sandbox)
- [ ] Verify webhook endpoint is accessible (https://ggloop.io/api/paypal/webhook)
- [ ] Set up webhook in PayPal Dashboard
- [ ] Add `PAYPAL_WEBHOOK_ID` to Railway
- [ ] Test full subscription flow on production
- [ ] Test cancellation flow on production
- [ ] Monitor logs for errors

### Production Environment Variables (Railway)

```
VITE_PAYPAL_CLIENT_ID = <production_client_id>
PAYPAL_CLIENT_ID = <production_client_id>
PAYPAL_CLIENT_SECRET = <production_client_secret>
PAYPAL_BASIC_PLAN_ID = <bronze_plan_id>
PAYPAL_PRO_PLAN_ID = <silver_plan_id>
PAYPAL_ELITE_PLAN_ID = <gold_plan_id>
PAYPAL_WEBHOOK_ID = <webhook_id>
NODE_ENV = production
```

### Production Testing

1. Use **real PayPal account** (not sandbox)
2. Subscribe to Bronze tier ($4.99/month)
3. Verify charge appears in PayPal account
4. Verify subscription activates in GG Loop
5. Verify points are awarded
6. Cancel subscription
7. Verify cancellation processes correctly
8. Refund test charge if needed

---

## 6️⃣ CALLBACK URLs & WEBHOOKS

### Callback URLs (Not Required for Subscriptions)

PayPal subscriptions use popup flow, not redirect flow, so no callback URLs are needed.

### Webhook URL (Optional for Now)

**Webhook Endpoint:** `https://ggloop.io/api/paypal/webhook`

**Purpose:** Receive real-time notifications from PayPal about subscription events:
- `BILLING.SUBSCRIPTION.ACTIVATED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

**Setup (Production Only):**
1. Go to PayPal Developer Dashboard → Webhooks
2. Click "Add Webhook"
3. **Webhook URL:** `https://ggloop.io/api/paypal/webhook`
4. **Event types:** Select all `BILLING.SUBSCRIPTION.*` events
5. Click "Save"
6. Copy **Webhook ID**
7. Add to Railway: `PAYPAL_WEBHOOK_ID=<webhook_id>`

**Note:** Webhooks are not critical for initial testing. The subscription flow works without them. They're mainly for handling edge cases (failed payments, suspensions, etc.).

---

## 7️⃣ VERIFICATION CHECKLIST

After setting up environment variables, verify:

### Frontend Verification
- [ ] `import.meta.env.VITE_PAYPAL_CLIENT_ID` is defined
- [ ] PayPal SDK script loads without errors
- [ ] PayPal button renders on subscription page
- [ ] Clicking button opens PayPal popup (not about:blank)

### Backend Verification
- [ ] `process.env.PAYPAL_CLIENT_ID` is defined
- [ ] `process.env.PAYPAL_CLIENT_SECRET` is defined
- [ ] `/api/paypal/create-subscription` route exists
- [ ] `/api/paypal/subscription-approved` route exists
- [ ] Server starts without PayPal configuration warnings

### End-to-End Verification
- [ ] Can subscribe to Bronze tier
- [ ] Can subscribe to Silver tier
- [ ] Can subscribe to Gold tier
- [ ] Subscription activates in database
- [ ] Points are awarded correctly
- [ ] Can cancel subscription
- [ ] Cancellation processes correctly

---

## 8️⃣ TROUBLESHOOTING GUIDE

### PayPal SDK Not Loading

**Symptoms:**
- No PayPal button appears
- Console error: "Failed to load PayPal SDK"

**Solutions:**
1. Verify `VITE_PAYPAL_CLIENT_ID` is set in `.env`
2. Restart dev server (`npm run dev`)
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console for specific error
5. Verify client ID is correct (copy from PayPal Dashboard)

### Popup Stuck on about:blank

**Symptoms:**
- PayPal popup opens but shows blank page
- No login form appears

**Solutions:**
1. Check `VITE_PAYPAL_CLIENT_ID` is correct
2. Verify using sandbox client ID for development
3. Check browser console for errors
4. Try different browser (disable popup blockers)
5. Clear browser cache and cookies

### Subscription Verification Fails

**Symptoms:**
- Backend error: "PayPal subscription verification failed"
- Subscription not activated in database

**Solutions:**
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
2. Check they match the sandbox app credentials
3. Verify PayPal API is accessible (not blocked by firewall)
4. Check server logs for specific error message
5. Test PayPal API credentials using curl:
   ```bash
   curl -v https://api-m.sandbox.paypal.com/v1/oauth2/token \
     -H "Accept: application/json" \
     -H "Accept-Language: en_US" \
     -u "CLIENT_ID:CLIENT_SECRET" \
     -d "grant_type=client_credentials"
   ```

### Points Not Awarded

**Symptoms:**
- Subscription activates but no points added
- Server log: "Failed to award subscription points"

**Solutions:**
1. Check `pointsEngine.awardMonthlySubscriptionPoints` function exists
2. Verify points system is working (test manual point awards)
3. Check database `points_transactions` table for errors
4. Review server logs for specific error
5. Verify tier mapping is correct (bronze/silver/gold)

---

## 9️⃣ NEXT STEPS AFTER SETUP

1. **Add env vars to `.env`** (see Section 2)
2. **Restart dev server** (`npm run dev`)
3. **Test subscription flow** (see Section 4)
4. **Verify database updates** (check subscriptions table)
5. **Test cancellation flow**
6. **Fix any errors** (see Section 8)
7. **Report results to CEO**
8. **Get approval for production deployment**

---

**IMPORTANT REMINDERS:**

❌ **NEVER commit `.env` to Git**  
❌ **NEVER expose `PAYPAL_CLIENT_SECRET` to frontend**  
❌ **NEVER use production credentials in development**  
✅ **ALWAYS use sandbox for testing**  
✅ **ALWAYS verify credentials before deploying**  
✅ **ALWAYS test end-to-end before going live**

---

**Last Updated:** December 10, 2025  
**Created By:** AG (Technical Execution Agent)  
**For:** GG LOOP LLC - PayPal Subscription Integration
