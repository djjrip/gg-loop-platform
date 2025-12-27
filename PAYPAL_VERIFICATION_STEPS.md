# ✅ VERIFY PAYPAL CREDENTIALS

**Before deploying, let's make sure your PayPal credentials are correct!**

---

## 🔍 STEP 1: Check PayPal Developer Dashboard

1. **Go to:** https://developer.paypal.com/
2. **Login** with your PayPal business account
3. **Click:** "Dashboard" → "My Apps & Credentials"
4. **Find your app** (or create one if needed)

---

## 📋 STEP 2: Verify Your Credentials

### **What You Should See:**

**Client ID:**
- Should start with `AW` (for sandbox) or `A` (for production)
- Current value: `AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu`
- **Verify this matches what's in PayPal dashboard**

**Client Secret:**
- Should be a long string
- Current value: `EPYCdf_WuwRPUFeLX2RvfVbxBdB2CufcS5HvEWN1RCRPF6zwJL4tGVm4VmhGqzRjV01FhEQ_KLbUjqjL`
- **Verify this matches what's in PayPal dashboard**

**Mode:**
- Check if you're using **Sandbox** or **Live**
- Current setting: `sandbox` (for testing)
- **For production, switch to `live`**

---

## ✅ STEP 3: Update if Needed

### **If Credentials Don't Match:**

1. **Copy the CORRECT Client ID** from PayPal dashboard
2. **Copy the CORRECT Client Secret** from PayPal dashboard
3. **Update Railway Variables:**
   - `VITE_PAYPAL_CLIENT_ID` = (new client ID)
   - `PAYPAL_CLIENT_ID` = (new client ID - same as above)
   - `PAYPAL_CLIENT_SECRET` = (new client secret)
   - `PAYPAL_MODE` = `sandbox` or `live`

---

## 🎯 STEP 4: Check Subscription Plans

### **In PayPal Dashboard:**

1. **Go to:** Products → Subscriptions
2. **Check if you have plans created:**
   - Basic Plan ($5/month)
   - Pro Plan ($12/month)
   - Elite Plan ($25/month)

### **If Plans Don't Exist:**

1. **Create them in PayPal dashboard**
2. **Copy the Plan IDs** (they start with `P-`)
3. **Add to Railway Variables:**
   - `PAYPAL_BASIC_PLAN_ID` = `P-xxxxx`
   - `PAYPAL_PRO_PLAN_ID` = `P-xxxxx`
   - `PAYPAL_ELITE_PLAN_ID` = `P-xxxxx`

---

## ⚠️ IMPORTANT NOTES

### **Sandbox vs Live:**

- **Sandbox:** For testing (doesn't charge real money)
- **Live:** For production (charges real money)

**Current Status:** Using `sandbox` mode

**For Production:**
1. Switch to `live` mode in PayPal dashboard
2. Update `PAYPAL_MODE=live` in Railway
3. Use live Client ID and Secret
4. Create live subscription plans

---

## ✅ VERIFICATION CHECKLIST

- [ ] PayPal Client ID matches dashboard
- [ ] PayPal Client Secret matches dashboard
- [ ] Mode is correct (sandbox for testing, live for production)
- [ ] Subscription plans exist (if using subscriptions)
- [ ] Plan IDs are in Railway variables (if using subscriptions)

---

**Once verified, you're good to deploy!** 🚀

