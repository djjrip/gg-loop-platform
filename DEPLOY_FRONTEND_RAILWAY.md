# Deploy Frontend to Railway - Step-by-Step Guide

## 🚀 Quick Deploy (30 minutes)

### Step 1: Create New Railway Service (Via Dashboard)

1. **Go to Railway:** https://railway.app
2. **Open your project** (should see `reward-fulfillment` service)
3. **Click "New Service"** (top right)
4. **Select "GitHub Repo"**
5. **Choose:** `djjrip/gg-loop-platform`
6. **Service Name:** `gg-loop-frontend`

### Step 2: Configure Service Settings

**In the new service settings:**

1. **Click "Settings" tab**
2. **Build Command:**
   ```
   npm install && npm run build
   ```

3. **Start Command:**
   ```
   npx serve dist/public -p $PORT -s
   ```

4. **Root Directory:** Leave as `/` (default)

### Step 3: Add Environment Variables

**Click "Variables" tab, add these:**

```
VITE_API_BASE_URL=https://reward-fulfillment-production.up.railway.app
NODE_ENV=production
```

### Step 4: Deploy

1. **Click "Deploy"** (Railway will auto-deploy on save)
2. **Wait for build** (~5-10 minutes)
3. **Check deployment logs** for success

### Step 5: Get Your Railway URL

1. **Click "Settings" tab**
2. **Scroll to "Domains"**
3. **Copy the Railway domain** (e.g., `gg-loop-frontend-production.up.railway.app`)

### Step 6: Update DNS (Cloudflare or your DNS provider)

**Option A: If using Cloudflare:**
1. Go to https://dash.cloudflare.com
2. Select your domain `ggloop.io`
3. Click "DNS" tab
4. Find the CNAME record for `ggloop.io`
5. Change target from `ns9rw1ux.up.railway.app` to your new frontend URL
6. Save

**Option B: If using another DNS provider:**
1. Log in to your DNS provider
2. Find DNS records for `ggloop.io`
3. Update CNAME to point to new Railway frontend URL
4. Save changes

### Step 7: Wait for DNS Propagation (5-10 minutes)

```bash
# Check if DNS updated
nslookup ggloop.io
```

Should show your new Railway frontend URL.

### Step 8: Test Live Site

1. Open https://ggloop.io (may need to clear cache: Ctrl+Shift+R)
2. Verify homepage loads
3. Test login
4. Check /shop page
5. Verify /subscription shows PayPal buttons

---

## ✅ Success Criteria

- [ ] Railway frontend service created
- [ ] Build completes successfully
- [ ] Service is running (green status)
- [ ] DNS points to new frontend
- [ ] https://ggloop.io loads homepage
- [ ] All pages accessible (shop, subscription, etc.)
- [ ] No console errors

---

## 🔧 Alternative: Deploy via Railway CLI

If you prefer command line:

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Create new service
railway service create gg-loop-frontend

# Set environment variables
railway variables set VITE_API_BASE_URL=https://reward-fulfillment-production.up.railway.app
railway variables set NODE_ENV=production

# Deploy
railway up
```

---

## 🆘 Troubleshooting

**Build fails:**
- Check Railway logs for specific error
- Verify `npm run build` works locally
- Ensure all dependencies in package.json

**Site still shows 502:**
- Wait 10 minutes for DNS propagation
- Clear browser cache (Ctrl+Shift+R)
- Check Railway service is running (green status)

**Pages load but API calls fail:**
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is still running

---

## 📞 Need Help?

If you get stuck at any step, share:
1. Which step you're on
2. Screenshot of error (if any)
3. Railway deployment logs

I'll help you debug immediately!
