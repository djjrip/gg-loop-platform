# 🔍 COMPLETE ENVIRONMENT VARIABLE AUDIT

**Audit Date:** December 6, 2025 - 5:28 PM CST

---

## ✅ CRITICAL (REQUIRED FOR PRODUCTION)

### **1. ADMIN_EMAILS** ⚠️ **MUST BE SET**
- **Purpose:** Admin access control
- **Status:** REQUIRED - Server won't start without it
- **Example:** `admin@ggloop.io,jayson@ggloop.io`
- **Location:** Railway Variables
- **Validation:** `serverStartupValidator.ts` line 19-35

### **2. SESSION_SECRET** ⚠️ **AUTO-GENERATED IF MISSING**
- **Purpose:** Session encryption
- **Status:** Auto-generates if missing (but sessions won't persist)
- **Recommendation:** Set a permanent 32+ character string
- **Example:** `your-super-secure-random-32-character-string-here`
- **Location:** Railway Variables

### **3. DATABASE_URL** ✅ **AUTO-PROVIDED BY RAILWAY**
- **Purpose:** PostgreSQL connection
- **Status:** Railway provides this automatically when you add PostgreSQL service
- **Action:** None - Railway handles this

### **4. BASE_URL** ⚠️ **SHOULD BE SET**
- **Purpose:** OAuth callbacks
- **Current:** Should be `https://ggloop.io`
- **Status:** Defaults to localhost if not set
- **Location:** Railway Variables

---

## ✅ OAUTH PROVIDERS (REQUIRED FOR LOGIN)

### **5. GOOGLE_CLIENT_ID** ⚠️
### **6. GOOGLE_CLIENT_SECRET** ⚠️
- **Purpose:** Google OAuth login
- **Status:** Required for Google login to work
- **Get From:** https://console.cloud.google.com/apis/credentials

### **7. DISCORD_CLIENT_ID** ⚠️
### **8. DISCORD_CLIENT_SECRET** ⚠️
- **Purpose:** Discord OAuth login
- **Status:** Required for Discord login to work
- **Get From:** https://discord.com/developers/applications

### **9. TWITCH_CLIENT_ID** ⚠️
### **10. TWITCH_CLIENT_SECRET** ⚠️
- **Purpose:** Twitch OAuth login
- **Status:** Required for Twitch login to work
- **Get From:** https://dev.twitch.tv/console/apps

---

## ✅ GAME APIS

### **11. RIOT_API_KEY** ⚠️ **REQUIRED FOR RIOT GAMES**
- **Purpose:** League of Legends / Valorant account linking
- **Status:** Required for Riot account verification
- **Get From:** https://developer.riotgames.com/
- **Note:** Needs renewal every 24 hours (dev key) or apply for production key

---

## ✅ PAYMENT (ALREADY CONFIGURED)

### **12. PAYPAL_CLIENT_ID** ✅ **SHOULD BE SET**
### **13. PAYPAL_CLIENT_SECRET** ✅ **SHOULD BE SET**
- **Purpose:** PayPal payments
- **Status:** Auto-switches to production based on NODE_ENV
- **Note:** Code already handles sandbox vs production automatically
- **Get From:** https://developer.paypal.com/dashboard/

### **14. PAYPAL_BASIC_PLAN_ID** (Optional)
### **15. PAYPAL_PRO_PLAN_ID** (Optional)
### **16. PAYPAL_ELITE_PLAN_ID** (Optional)
- **Purpose:** Subscription plan IDs
- **Status:** Optional - has fallback sandbox IDs for dev
- **Production:** Should be set for production

### **17. PAYPAL_WEBHOOK_ID** (Optional)
- **Purpose:** PayPal webhook verification
- **Status:** Optional but recommended for security

---

## 📧 OPTIONAL (NICE TO HAVE)

### **18. RESEND_API_KEY** (Optional)
- **Purpose:** Email notifications
- **Status:** Optional - platform works without it
- **Get From:** https://resend.com/

### **19. DISCORD_FOUNDER_WEBHOOK_URL** (Optional)
- **Purpose:** Discord notifications for new users
- **Status:** Optional

### **20. DISCORD_ADMIN_WEBHOOK_URL** (Optional)
- **Purpose:** Discord notifications for admin actions
- **Status:** Optional

### **21. TWILIO_ACCOUNT_SID** (Optional)
### **22. TWILIO_AUTH_TOKEN** (Optional)
### **23. TWILIO_FROM_NUMBER** (Optional)
- **Purpose:** SMS alerts
- **Status:** Optional

### **24. ENCRYPTION_KEY** (Optional)
- **Purpose:** Data encryption
- **Status:** Optional - has fallback

---

## 🚫 NOT NEEDED (AUTO-HANDLED)

### **NODE_ENV** ✅ **AUTO-SET BY RAILWAY**
- Railway sets this to `production` automatically

### **PORT** ✅ **AUTO-SET BY RAILWAY**
- Railway provides this automatically

### **POSTGRES_USER, POSTGRES_PASSWORD, etc.** ✅ **AUTO-SET**
- All handled by Railway's PostgreSQL service

---

## 📊 PRIORITY CHECKLIST

### **MUST SET (Platform won't work without these):**
1. ⚠️ **ADMIN_EMAILS** - Server won't start
2. ⚠️ **BASE_URL** - Set to `https://ggloop.io`
3. ⚠️ **SESSION_SECRET** - For persistent sessions
4. ⚠️ **GOOGLE_CLIENT_ID + SECRET** - For Google login
5. ⚠️ **DISCORD_CLIENT_ID + SECRET** - For Discord login
6. ⚠️ **TWITCH_CLIENT_ID + SECRET** - For Twitch login
7. ⚠️ **RIOT_API_KEY** - For Riot account linking
8. ⚠️ **PAYPAL_CLIENT_ID + SECRET** - For payments

### **SHOULD SET (Platform works but limited):**
9. 📧 **RESEND_API_KEY** - For email notifications
10. 💳 **PAYPAL_PLAN_IDs** - For subscription tiers

### **NICE TO HAVE:**
11. 🔔 Discord webhooks
12. 📱 Twilio SMS
13. 🔐 ENCRYPTION_KEY

---

## 🎯 RAILWAY SETUP CHECKLIST

**Go to:** https://railway.app/dashboard → Your Project → Variables

**Add these variables:**

```env
# CRITICAL
ADMIN_EMAILS=your@email.com
BASE_URL=https://ggloop.io
SESSION_SECRET=generate-a-secure-random-32-character-string

# OAUTH
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-secret
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-secret

# GAME APIs
RIOT_API_KEY=RGAPI-your-key-here

# PAYMENTS
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# OPTIONAL
RESEND_API_KEY=re_your-key-here
```

---

## ⚠️ WHAT HAPPENS IF NOT SET

| Variable | If Missing | Impact |
|----------|-----------|--------|
| ADMIN_EMAILS | ❌ Server won't start | CRITICAL |
| SESSION_SECRET | ⚠️ Auto-generated | Sessions reset on redeploy |
| BASE_URL | ⚠️ Uses localhost | OAuth won't work |
| GOOGLE_* | ⚠️ Google login disabled | Users can't login with Google |
| DISCORD_* | ⚠️ Discord login disabled | Users can't login with Discord |
| TWITCH_* | ⚠️ Twitch login disabled | Users can't login with Twitch |
| RIOT_API_KEY | ⚠️ Riot features disabled | Can't link Riot accounts |
| PAYPAL_* | ⚠️ Payments disabled | Can't accept payments |
| RESEND_API_KEY | ℹ️ No emails | Platform still works |

---

## 🔍 HOW TO CHECK WHAT'S SET

**In Railway:**
1. Go to https://railway.app/dashboard
2. Click your project
3. Click "Variables" tab
4. See all set variables

**Locally:**
```powershell
# Check specific variable
$env:ADMIN_EMAILS

# Check all PayPal vars
Get-ChildItem Env: | Where-Object {$_.Name -like "*PAYPAL*"}
```

---

## ✅ BOTTOM LINE

**MUST SET IN RAILWAY (8 variables):**
1. ADMIN_EMAILS
2. BASE_URL
3. SESSION_SECRET
4. GOOGLE_CLIENT_ID + SECRET
5. DISCORD_CLIENT_ID + SECRET
6. TWITCH_CLIENT_ID + SECRET
7. RIOT_API_KEY
8. PAYPAL_CLIENT_ID + SECRET

**AUTO-PROVIDED BY RAILWAY:**
- DATABASE_URL
- NODE_ENV
- PORT

**OPTIONAL:**
- Everything else

**Once these 8 are set → Platform is fully functional**
