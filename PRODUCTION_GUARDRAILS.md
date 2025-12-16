# 🛡️ GG LOOP PRODUCTION GUARDRAILS

**Last Updated:** 2025-12-16 01:25 CST  
**Status:** ACTIVE - ENFORCED IN CODE

---

## 🔴 CRITICAL RULES (NON-NEGOTIABLE)

### 1. **AUTH MUST NEVER DEPEND ON OPTIONAL SYSTEMS**

✅ **ENFORCED:** Login/authentication is completely independent of:
- PayPal subscriptions
- Reward systems  
- Analytics
- Third-party integrations

❌ **VIOLATION:** Any endpoint that blocks auth flow if optional systems fail

**Implementation:**
- `/api/subscription/status` returns `null` instead of 500 on DB errors
- All optional queries wrapped in try-catch with safe defaults
- Schema reconciliation runs on startup but doesn't block boot

---

### 2. **OPTIONAL SYSTEMS MUST FAIL SOFT**

✅ **ENFORCED:** All non-critical systems return safe defaults on failure:
```typescript
// ✅ CORRECT
try {
  const subscription = await storage.getSubscription(userId);
  res.json(subscription || null);
} catch (error) {
  console.warn('[SAFE MODE] Subscription query failed, returning null');
  res.json(null); // Safe default
}

// ❌ WRONG
const subscription = await storage.getSubscription(userId);
res.json(subscription); // Crashes if DB schema mismatch
```

**Implementation:**
- `server/routes.ts` line 3619: Subscription status endpoint has nested try-catch
- `server/schemaReconciliation.ts`: Auto-adds missing columns without crashing

---

### 3. **STARTUP MUST SURVIVE MISSING SCHEMA**

✅ **ENFORCED:** App boots even if database schema is out of sync

**Implementation:**
- `server/index.ts` runs schema reconciliation before routes
- Schema reconciliation failures are logged but don't crash app
- All DB queries that might fail have fallbacks

---

### 4. **NO PROD CHANGES WITHOUT EXPLICIT APPROVAL**

✅ **ENFORCED:** Code changes require:
1. Clear description of what's changing
2. Reason for the change
3. Confirmation that it won't break existing functionality

❌ **VIOLATION:** Silent additions, assumption-based behavior, "helpful" modifications

---

### 5. **HEALTH CHECKS MUST REFLECT ACTUAL USER EXPERIENCE**

✅ **ENFORCED:** 
- `/health` checks if server is running
- `/health/detailed` checks if critical systems work
- `/ready` checks if app can serve traffic

❌ **VIOLATION:** Green health checks while users can't log in

**Current Issue (FIXED):**
- Health checks were green while login was broken
- Root cause: Optional systems (PayPal) crashed core auth flow

---

## 🔧 TECHNICAL SAFEGUARDS

### Schema Reconciliation
**File:** `server/schemaReconciliation.ts`

Automatically adds missing columns on startup:
```typescript
// Checks for paypal_subscription_id column
// Adds it if missing
// Logs but doesn't crash if it fails
```

### Safe Subscription Queries
**File:** `server/routes.ts` line 3619

```typescript
// Double try-catch protection
app.get('/api/subscription/status', getUserMiddleware, async (req, res) => {
  try {
    const userId = req.dbUser.id;
    try {
      const subscription = await storage.getSubscription(userId);
      res.json(subscription || null);
    } catch (dbError) {
      console.warn('[SAFE MODE] Subscription query failed, returning null');
      res.json(null); // Safe default
    }
  } catch (error) {
    res.json(null); // Never return 500
  }
});
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying to production, verify:

- [ ] **Build passes locally:** `npm run build` succeeds
- [ ] **Auth works:** Can log in with Google/Discord/Twitch
- [ ] **App renders:** Homepage loads without white screen
- [ ] **No console errors:** Browser console is clean
- [ ] **Health checks accurate:** `/health/detailed` reflects actual state
- [ ] **Schema is synced:** Production DB has all required columns
- [ ] **Rollback plan ready:** Know how to revert if deployment fails

---

## 🚨 INCIDENT RESPONSE

### If Production Goes Down:

1. **Check Railway logs** for startup errors
2. **Check browser console** for frontend errors
3. **Verify health endpoint:** `curl https://ggloop.io/health/detailed`
4. **Check database schema:** Compare prod DB to `shared/schema.ts`
5. **Rollback if needed:** Deploy last known good commit

### Common Issues:

| Symptom | Root Cause | Fix |
|---------|------------|-----|
| White screen | Frontend build failed | Check Railway build logs |
| Login broken | Auth crashed during init | Check for 500s in `/api/auth/*` |
| 500 on startup | DB schema mismatch | Run schema reconciliation |
| Health green but broken | Optional system crashed auth | Check subscription/payment endpoints |

---

## 🎯 WHAT WAS FIXED (2025-12-16)

### Root Cause
`/api/subscription/status` endpoint queried `paypal_subscription_id` column that didn't exist in production database. This caused:
1. 500 error on endpoint
2. Frontend crashed during initialization
3. Auth flow blocked (white screen)
4. All logins failed

### Exact Fixes Applied

1. **Made subscription endpoint fail-safe** (`server/routes.ts`)
   - Returns `null` instead of 500 on DB errors
   - Double try-catch protection
   - Never blocks app initialization

2. **Added schema reconciliation** (`server/schemaReconciliation.ts`)
   - Auto-adds missing columns on startup
   - Runs before routes are registered
   - Logs failures but doesn't crash

3. **Updated startup sequence** (`server/index.ts`)
   - Schema check runs first
   - Routes register only after schema is validated
   - Failures are logged but don't block boot

### Guardrails Established

- **Auth independence:** Login never depends on subscriptions
- **Fail-soft pattern:** Optional systems return safe defaults
- **Schema validation:** Auto-reconciliation on startup
- **Explicit consent:** No silent prod changes

---

## 📞 CONTACT

**Founder:** Jayson Quindao  
**Platform:** GG Loop LLC  
**Domain:** https://ggloop.io  
**Environment:** Railway (Production)

---

**This document is enforced in code. Violations will cause deployment failures.**
