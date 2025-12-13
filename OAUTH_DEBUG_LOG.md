# 🔍 OAuth Login Debugging Log

## Issue Timeline

### **Problem**: Discord OAuth login fails with Date serialization error
**Error Message**: `"The \"string\" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Date"`

---

## Attempted Fixes

### ❌ Fix #1: Add explicit session.save() (Commit: 39f3e75)
**Time**: 1:49 PM
**What**: Added `req.session.save()` callback before redirect in OAuth callbacks
**Result**: FAILED - Error persisted
**Why it failed**: Didn't address root cause of Date serialization

### ❌ Fix #2: Serialize only oidcSub in passport (Commit: 4bc34a5)
**Time**: 1:51 PM
**What**: Changed passport.serializeUser to only store oidcSub string instead of full user object
```typescript
passport.serializeUser((user: any, cb) => {
  cb(null, user.oidcSub); // Only string, no Date objects
});
```
**Result**: FAILED - Error persisted
**Why it failed**: The full user object was still being passed to req.login()

### ❌ Fix #3: Pass only oidcSub to req.login() (Commit: f0dbb91)
**Time**: 1:53 PM
**What**: Extract oidcSub before session regeneration and only pass `{ oidcSub }` to req.login()
```typescript
const oidcSub = (req.user as any).oidcSub;
req.login({ oidcSub }, async (err) => { ... });
```
**Result**: FAILED - Error persisted
**Why it failed**: Issue is in PostgreSQL session store (connect-pg-simple), not in our serialization

### 🔄 Fix #4: Switch to memory store temporarily (Commit: a7cc368)
**Time**: 1:56 PM
**What**: Disabled PostgreSQL session store, using memory store instead
**Status**: TESTING NOW
**Purpose**: Confirm if the issue is specifically with connect-pg-simple

---

## Root Cause Analysis

The error is coming from **connect-pg-simple** (PostgreSQL session store) when it tries to serialize the session data. Even though we're only storing `oidcSub` (a string), something in the session object contains a Date.

**Possible culprits**:
1. ✅ `loginNotification.timestamp` - Already converted to string with `Date.now().toString()`
2. ❓ Session cookie expiration - Uses `maxAge` (number), should be fine
3. ❓ Internal passport session data
4. ❓ connect-pg-simple internal handling

---

## Next Steps

1. **If memory store works**: The issue is definitely with connect-pg-simple
   - Solution: Use a different session store (Redis, or fix connect-pg-simple config)
   
2. **If memory store fails**: The issue is in our code
   - Need to find where Date objects are being added to session

---

## Railway Logs to Check

To see actual server errors, check Railway logs:
1. Go to Railway dashboard
2. Click your project
3. Click "Deployments" → Latest deployment
4. Click "View Logs"
5. Look for errors around the time of login attempts

---

## Current Status

**Deployment**: a7cc368 (using memory store)
**Testing**: In progress
**ETA**: 2-3 minutes

---

*Last updated: 2025-11-23 1:56 PM*
