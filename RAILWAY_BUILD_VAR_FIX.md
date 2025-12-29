# CRITICAL: Railway Environment Variable Fix

## Problem
`VITE_PAYPAL_CLIENT_ID` is not being embedded in the frontend bundle during Railway's build process.

## Root Cause
Railway runs the build in a container where environment variables might not be passed to the Vite build process, even with our `export` command.

## Solution
Railway needs the variable set as a **build-time** environment variable, not just a runtime variable.

## Fix Steps

### Option 1: Railway Dashboard (RECOMMENDED)
1. Go to Railway dashboard → GG LOOP project
2. Click on your service
3. Go to **Variables** tab
4. Find `VITE_PAYPAL_CLIENT_ID`
5. Make sure it's checked as **both**:
   - ✅ Build time
   - ✅ Runtime

### Option 2: Use Railway CLI
```bash
railway variables set VITE_PAYPAL_CLIENT_ID=AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu --build
```

### Option 3: Hardcode in vite.config.ts (NOT RECOMMENDED)
Only if Railway absolutely won't pass build vars:

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(
      process.env.VITE_PAYPAL_CLIENT_ID || 'AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu'
    ),
  },
  // ... rest of config
});
```

## Verification
After fixing, redeploy and check:
```javascript
// In browser console at ggloop.io/subscription
console.log(import.meta.env.VITE_PAYPAL_CLIENT_ID); // Should show actual ID, not $VITE_PAYPAL_CLIENT_ID
```

## Why This Happens
Vite does **compile-time replacement** of `import.meta.env.*` variables. If the variable isn't available when `vite build` runs, it stays as `undefined` or the literal string in the output bundle.

Railway's standard behavior:
- ✅ Runtime variables: Available to running server
- ❌ Build variables: Not automatically passed to build commands

Our `export` command in nixpacks helps, but Railway might still need the explicit "build-time" flag checked in the dashboard.
