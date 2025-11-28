# Riot API Key Management Guide

## Current Situation
- **Development Key**: Expires every 24 hours
- **Production Key**: Pending approval from Riot
- **Current Key**: `RGAPI-e9659c60-c7a9-435f-b6c6-5c6fbcd12a91` (expires in 24 hours)

---

## Daily Development Workflow (Until Production Approval)

### Every 24 Hours:
1. Go to https://developer.riotgames.com/
2. Sign in
3. Click **"REGENERATE API KEY"** button
4. Copy the new key
5. Update your `.env` file:
   ```bash
   RIOT_API_KEY=RGAPI-your-new-key-here
   ```
6. **Restart your dev server** (Ctrl+C, then `npm run dev`)

---

## For Railway (Production Environment)

Once your production key is approved:

### One-Time Setup:
1. Go to Railway dashboard → Your service → **Variables**
2. Add or update:
   ```
   RIOT_API_KEY=RGAPI-your-production-key
   ```
3. **Production keys don't expire** - set it once and forget it!

### Until Then (Using Dev Key on Railway):
- You'll need to update Railway's `RIOT_API_KEY` variable daily
- Each update triggers a redeploy (~3-5 minutes)
- Not ideal, but works while waiting for production approval

---

## Production Key Approval Timeline

Typical approval time: **1-2 weeks**

**What Riot Looks For**:
1. ✅ Clear product description
2. ✅ How you're using the API
3. ✅ Rate limiting compliance
4. ✅ Data retention policies
5. ✅ User privacy measures

**Your Application Status**: Check at https://developer.riotgames.com/app-type

---

## Alternative: Provisional Valorant Linking

For **Valorant only**, you can use provisional linking (no verification):
- Users can link their Riot ID without API verification
- Stats are self-reported
- Works without API key
- See code: `server/routes.ts` - `/api/riot/:gameId/link-provisional`

**For League of Legends**: API key required for verification

---

## Auto-Renewal (Not Possible)

Unfortunately, automatic key renewal isn't possible because:
- ❌ Riot doesn't provide an API to regenerate keys
- ❌ Would require storing your Riot credentials (security risk)
- ❌ Developer portal requires interactive login (2FA, CAPTCHA, etc.)

**Best Practice**: 
- Manually regenerate daily during development
- Apply for production key ASAP
- Once approved, production keys are permanent

---

## Quick Commands

### Check current key:
```powershell
Get-Content .env | Select-String "RIOT_API_KEY"
```

### Update key:
```powershell
(Get-Content .env) -replace 'RIOT_API_KEY=.*', 'RIOT_API_KEY=your-new-key' | Set-Content .env
```

### Restart dev server:
```powershell
# Press Ctrl+C in the terminal running the server
npm run dev
```

---

## Current Status

✅ **Local Environment**: Updated with new key  
⚠️ **Railway**: Needs manual update if deployed  
⏳ **Production Key**: Awaiting Riot approval  
📅 **Next Key Rotation**: Tomorrow ~13:21 CST
