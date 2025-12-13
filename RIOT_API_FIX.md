# Quick Fix: Riot API Key Not Loading

## The Issue
Your Riot account connection is failing with:
`400: {"message":"RIOT_API_KEY environment variable not set"}`

## Solution

### Option 1: Check Your .env File (Recommended)
1. Open your `.env` file (it's gitignored, so I can't see it)
2. Make sure it has this line:
   ```
   RIOT_API_KEY=RGAPI-d3fe3d17-b466-462a-9843-3642b4d4b83c
   ```
3. **Restart your dev server** (`npm run dev`)
4. Try connecting your Riot account again

### Option 2: Verify .env Is Being Loaded
Run this in PowerShell to check if the key is set:
```powershell
npm run dev
```

Then in a new terminal:
```powershell
$env:RIOT_API_KEY
```

If it shows nothing, your `.env` isn't being loaded.

### Option 3: Set It Manually (Temporary)
In PowerShell before starting the server:
```powershell
$env:RIOT_API_KEY="RGAPI-d3fe3d17-b466-462a-9843-3642b4d4b83c"
npm run dev
```

## Note About This API Key
The key in `.env.template` (`RGAPI-d3fe3d17-b466-462a-9843-3642b4d4b83c`) might be expired. Riot API development keys expire every 24 hours.

### To Get a Fresh Key:
1. Go to https://developer.riotgames.com/
2. Sign in with your Riot account
3. Click "Regenerate API Key"
4. Copy the new key
5. Update your `.env` file with the new key
6. Restart your server

## For Railway Deployment
You also need to add `RIOT_API_KEY` to Railway's environment variables:
1. Go to Railway dashboard
2. Click your service → Variables
3. Add: `RIOT_API_KEY=<your-key-here>`
4. Redeploy

## Quick Test
After setting the key and restarting, you should be able to connect your Riot account at:
- http://localhost:5000 (if running dev server)
- Settings page → Connect League of Legends / Valorant
