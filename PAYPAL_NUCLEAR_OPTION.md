# NUCLEAR OPTION: Hardcode PayPal Client ID

## When to Use This
- Railway environment variables aren't working
- Vite define not picking up the variable
- Every other method failed
- **USE ONLY AS LAST RESORT**

## The Fix

**File:** `client/src/components/PayPalSubscriptionButton.tsx`

**Find this line (~25):**
```typescript
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
```

**Replace with:**
```typescript
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu";
```

This uses the env var if available, falls back to hardcoded value if not.

## Security Note
- Client ID is PUBLIC (not secret)
- Safe to hardcode in frontend
- Secret keys (PAYPAL_CLIENT_SECRET) stay on server

## Deploy
```bash
git add client/src/components/PayPalSubscriptionButton.tsx
git commit -m "NUCLEAR: Hardcode PayPal client ID as fallback"
git push
```

## Why This Works
- Bypasses ALL environment variable issues
- Guarantees the value is in the bundle
- Frontend gets the ID no matter what

## After This Works
- Figure out why Railway env vars aren't working
- Fix the root cause
- Remove hardcoded value
- Use env vars properly

## DO THIS NOW IF:
- PayPal still broken after all other fixes
- Need revenue active TODAY
- Can't wait for Railway support

This is the "break glass in case of emergency" solution.
