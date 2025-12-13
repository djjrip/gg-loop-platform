# 🎮 SEED REWARDS TO PRODUCTION - QUICK GUIDE

**Goal**: Get `ggloop.io/shop` live with 12 rewards ready for users to redeem

---

## ✅ What's Ready

- ✅ **12 Rewards Created**: Gift cards, subscriptions, gaming gear ($10 - $75,000 value)
- ✅ **Seed Script**: `server/seed-rewards.ts` (production-safe with `sql\`NOW()\``)
- ✅ **Helper Script**: `scripts/seed-production.mjs` (with safety checks)
- ✅ **NPM Commands**: `npm run seed:production`

---

## 🚀 OPTION 1: Seed via Railway CLI (Recommended)

**Fastest and safest way to seed production:**

### Step 1: Install Railway CLI (if not installed)
```powershell
npm install -g @railway/cli
```

### Step 2: Login to Railway
```powershell
railway login
```

### Step 3: Link to Your Project
```powershell
cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
railway link
```
- Select your GG Loop project
- Select the production environment

### Step 4: Run Seed Command
```powershell
railway run npm run seed:rewards
```

**This will:**
- ✅ Automatically use Railway's production DATABASE_URL
- ✅ Seed all 12 rewards
- ✅ Verify the data was inserted
- ✅ Show you the count

---

## 🔧 OPTION 2: Seed via Local Script (Manual)

**If you prefer to run from your local machine:**

### Step 1: Get Railway DATABASE_URL

1. Go to https://railway.app
2. Open your GG Loop project
3. Click on the **PostgreSQL** service
4. Go to **Variables** tab
5. Copy the `DATABASE_URL` value (starts with `postgresql://`)

### Step 2: Set Environment Variable
```powershell
# In PowerShell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.railway.app:5432/railway"
```

### Step 3: Run Seed Script
```powershell
npm run seed:production
```

---

## 🎯 OPTION 3: Seed via Railway Dashboard (Web UI)

**If you want to use Railway's web interface:**

### Step 1: Open Railway Dashboard
1. Go to https://railway.app
2. Open your GG Loop project
3. Click on your **main service** (the one running the app)

### Step 2: Open Shell
1. Click **"Settings"** tab
2. Scroll to **"Service Settings"**
3. Click **"Open Shell"** or **"Deploy"** → **"Shell"**

### Step 3: Run Seed Command
```bash
npm run seed:rewards
```

---

## ✅ Verify It Worked

After seeding, verify rewards are live:

### 1. Check Database (via Railway)
```bash
railway run npx drizzle-kit studio
```
- Opens Drizzle Studio
- Navigate to `rewards` table
- Should see 12 rows

### 2. Check API Endpoint
Visit: https://ggloop.io/api/rewards

Should return JSON with 12 rewards

### 3. Check Shop Page
Visit: https://ggloop.io/shop

Should display all rewards with:
- Images
- Titles
- Point costs
- Categories

---

## 🎮 The 12 Rewards Being Seeded

### Gift Cards (Tier 1-4)
1. **$10 Amazon Gift Card** - 1,000 points
2. **$25 Steam Gift Card** - 2,500 points
3. **$50 PlayStation Store Card** - 5,000 points
4. **$100 Best Buy Gift Card** - 10,000 points

### Subscriptions (Tier 2-3)
5. **1 Month Discord Nitro** - 1,500 points
6. **3 Months Spotify Premium** - 3,000 points
7. **1 Month Xbox Game Pass Ultimate** - 4,000 points

### Gaming Gear (Tier 3-4)
8. **HyperX Cloud II Gaming Headset** - 8,000 points
9. **Logitech GPro X Superlight** - 12,000 points
10. **Razer BlackWidow V3 Keyboard** - 15,000 points

### High-Value (Tier 4 - Legendary)
11. **NVIDIA RTX 4060 Graphics Card** - 50,000 points
12. **PlayStation 5 Console** - 75,000 points (out of stock)

---

## 🔥 RECOMMENDED: Use Option 1 (Railway CLI)

**Why?**
- ✅ No need to manually copy DATABASE_URL
- ✅ Automatically uses production environment
- ✅ Safer (no risk of pasting wrong URL)
- ✅ Faster (one command)

**Command:**
```powershell
railway run npm run seed:rewards
```

---

## ⚠️ Important Notes

1. **Run Once Only**: This script will add 12 NEW rewards each time you run it
2. **Duplicate Check**: If you need to re-seed, first delete existing rewards:
   ```sql
   DELETE FROM rewards WHERE title LIKE '%Gift Card%' OR title LIKE '%Nitro%';
   ```
3. **Images**: The seed script references `/assets/rewards/*.png` - make sure these images exist or update the paths

---

## 🎯 Next Steps After Seeding

1. ✅ **Verify Shop Page**: Visit `ggloop.io/shop`
2. ✅ **Test Redemption**: Try redeeming a low-cost reward
3. ✅ **Check Fulfillment**: Ensure the fulfillment system is ready (see `FULFILLMENT_SOP.md`)
4. ✅ **Monitor**: Watch for user redemptions and errors

---

## 🚨 Troubleshooting

### "Cannot find module '../shared/schema'"
- ✅ **Fixed**: Import path corrected to `../shared/schema`

### "Date serialization error"
- ✅ **Fixed**: Using `sql\`NOW()\`` instead of `new Date()`

### "DATABASE_URL not set"
- Use Railway CLI: `railway run npm run seed:rewards`
- Or set manually: `$env:DATABASE_URL="..."`

### "Rewards not showing on shop page"
- Check API: `https://ggloop.io/api/rewards`
- Check browser console for errors
- Verify shop page is fetching from `/api/rewards`

---

## 🎮 READY TO EXECUTE?

**Run this command now:**

```powershell
# Option 1 (Recommended)
railway run npm run seed:rewards

# Option 2 (If Railway CLI not installed)
npm run seed:production
```

**Expected output:**
```
Seeding rewards...
✅ Seeded 12 rewards
Total rewards in DB: 12
```

---

**Status**: ⏸️ Ready to execute - Waiting for your command
