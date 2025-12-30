# HOW TO MIGRATE TO AWS - NON-TECHNICAL GUIDE

**For:** Jayson (non-technical)  
**Time Required:** 2-3 hours (mostly waiting)  
**Difficulty:** Easy - just follow steps  
**Cost:** Saves $5/month ($60/year)  

---

## WHY WE'RE DOING THIS

**Problem:** Railway keeps failing (17 failed deployments, rate limit bans)  
**Solution:** Move to AWS (more stable, cheaper, no rate limits)  

**You'll get:**
- No more deployment failures
- No more rate limit bans
- $5/month cheaper hosting
- Better monitoring tools
- Scheduled autonomous systems

---

## BEFORE YOU START

**You need:**
- [ ] Computer with internet
- [ ] AWS account (you have this)
- [ ] Cloudflare account (you have this)
- [ ] GitHub access (you have this)
- [ ] 2-3 hours of time

**You DON'T need:**
- ❌ Technical knowledge
- ❌ AWS experience
- ❌ Command line skills (I'll give you exact commands)

---

## STEP 1: CHECK IF READY (2 MINUTES)

### What to Do

1. **Open PowerShell:**
   - Press `Windows Key + X`
   - Click "Windows PowerShell" or "Terminal"
   - A black window opens with text

2. **Go to project folder:**
   - Copy this EXACT command:
     ```
     cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
     ```
   - Paste into PowerShell (right-click to paste)
   - Press `Enter`

3. **Run the check:**
   - Copy this EXACT command:
     ```
     npm run check:aws
     ```
   - Paste and press `Enter`
   - Wait ~30 seconds

### What You'll See

**If ready:**
```
🔍 GG LOOP - AWS MIGRATION PRE-FLIGHT CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  Checking AWS CLI...
   ✅ AWS CLI installed
2️⃣  Checking AWS credentials...
   ✅ AWS_ACCESS_KEY_ID configured
   ✅ AWS_SECRET_ACCESS_KEY configured
3️⃣  Checking environment variables...
   ✅ .env file found (15 variables)
4️⃣  Checking GitHub repository...
   ✅ GitHub repo configured correctly
5️⃣  Checking required files...
   ✅ amplify.yml
   ✅ scripts/deploy-aws.sh
   ... (more files)
6️⃣  Testing local build...
   ✅ Server builds successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRE-FLIGHT CHECK PASSED
Ready to deploy to AWS!
```

**What this means:** You're ready to continue to Step 2

**If NOT ready:**
- You'll see ❌ marks next to what's wrong
- Read the error message
- Most common issue: AWS CLI not installed
  - Fix: Download from https://aws.amazon.com/cli/
  - Install, then try again

---

## STEP 2: DEPLOY TO AWS (30-40 MINUTES)

### What to Do

1. **Same PowerShell window from Step 1**
   - If you closed it, open again and run:
     ```
     cd "C:\Users\Jayson Quindao\Desktop\GG LOOP\GG-LOOP-PLATFORM"
     ```

2. **Start deployment:**
   - Copy this EXACT command:
     ```
     npm run deploy:aws
     ```
   - Paste and press `Enter`

3. **Authorize GitHub (one-time):**
   - After ~10 seconds, script will print a URL
   - Copy that URL
   - Open in your browser
   - Click "Authorize AWS Amplify"
   - Come back to PowerShell
   - Press `Enter` when it says "Press Enter after connecting GitHub..."

4. **Wait for deployment:**
   - Script will show progress messages
   - This takes 30-40 minutes total
   - **Don't close PowerShell** - let it run
   - You can minimize it and do other things

### What You'll See

**Progress messages (every few minutes):**
```
🚀 GG LOOP - AWS MIGRATION DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ AWS CLI found
✅ AWS credentials configured

🏗️  Step 1: Creating AWS Amplify app...
✅ Created Amplify app: d2a3b4c5d6e7f

🔗 Step 2: Connecting GitHub repository...
⚠️  MANUAL STEP REQUIRED:
   Go to: https://console.aws.amazon.com/amplify/...
   Click 'Connect branch'
   Authorize GitHub
   
⚙️  Step 3: Setting environment variables...
Setting: DATABASE_URL
Setting: AWS_ACCESS_KEY_ID
... (more variables)
✅ Environment variables configured

🚀 Step 5: Triggering deployment...
✅ Deployment started

⏰ Step 6: Setting up EventBridge schedules...
✅ Master loop scheduled (every 6 hours)
✅ Revenue tracking scheduled (daily 9 AM)

📊 Step 7: Setting up CloudWatch monitoring...
✅ CloudWatch dashboard created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AWS DEPLOYMENT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
1. Wait for Amplify build to complete (~5-10 minutes)
   Monitor: https://console.aws.amazon.com/amplify/...
   
2. Test temporary AWS URL: https://[app-id].amplifyapp.com
```

**What this means:** Deployment to AWS started, now waiting for build

**The temporary URL:**
- Will look like: `https://d2a3b4c5d6e7f.amplifyapp.com`
- This is your site running on AWS (test version)
- You'll use this to test before changing DNS

---

## STEP 3: WATCH AWS BUILD (5-10 MINUTES)

### What to Do

1. **Open AWS Console:**
   - Go to the link from Step 2 output (starts with console.aws.amazon.com/amplify)
   - Or manually:
     - Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1
     - Click on "gg-loop-platform"

2. **Watch the build:**
   - You'll see a progress bar
   - Shows: Provision → Build → Deploy → Verify
   - Each stage takes 1-3 minutes
   - Total: 5-10 minutes

### What You'll See

**AWS Amplify Console:**
- Big green "Provision" (30 seconds)
- Big green "Build" (2-3 minutes)
- Big green "Deploy" (1-2 minutes)
- Big green "Verify" (30 seconds)

**When all are green:**
- Build succeeded!
- You'll see a URL: `https://[something].amplifyapp.com`
- Copy this URL (you need it for next step)

**If any stage is red:**
- Build failed
- Click on the red stage to see error
- Most common: TypeScript errors
- Fix: See troubleshooting section below

---

## STEP 4: TEST TEMPORARY URL (10-15 MINUTES)

### What to Do

1. **Open the temporary URL in browser:**
   - Use the URL from Step 3
   - Example: `https://d2a3b4c5d6e7f.amplifyapp.com`

2. **Test these pages:**
   - [ ] Homepage loads
   - [ ] Click "Shop" - shop page loads
   - [ ] Try to log in (Google or Twitch)
   - [ ] After login, profile page loads
   - [ ] Go to `/dev-console` (type in address bar)

3. **Everything should work exactly like ggloop.io**

### What You'll See

**Success:**
- Site loads normally
- All pages work
- Login works
- Looks exactly like current ggloop.io

**Problems:**
- Login redirects to wrong URL
  - **Fix:** OAuth redirect URIs need updating (see troubleshooting)
- Page doesn't load
  - **Fix:** Check AWS Amplify logs (see troubleshooting)
- 500 errors
  - **Fix:** Check CloudWatch logs (see troubleshooting)

**DON'T proceed to Step 5 until everything works**

---

## STEP 5: GET DNS RECORDS (2 MINUTES)

### What to Do

1. **In AWS Amplify Console:**
   - You're already there from Step 3
   - Click "Domain management" in left sidebar

2. **Add custom domain:**
   - Click blue "Add domain" button
   - Type: `ggloop.io`
   - Click "Configure domain"

3. **Amplify shows DNS records:**
   - You'll see something like:
     ```
     Type: CNAME
     Name: www
     Value: d2a3b4c5d6e7f.cloudfront.net
     
     Type: ANAME
     Name: @
     Value: d2a3b4c5d6e7f.cloudfront.net
     ```
   
4. **Copy these values** - you need them for next step
   - Write them down or screenshot

### What You'll See

**AWS Domain Configuration Screen:**
- Big text: "Add DNS records to your DNS provider"
- Table with Type, Name, Value columns
- Two rows (usually CNAME for www, ANAME for root)

**What this means:** AWS is telling you what to set in Cloudflare

---

## STEP 6: UPDATE CLOUDFLARE DNS (5 MINUTES)

### What to Do

1. **Open Cloudflare:**
   - Go to: https://dash.cloudflare.com
   - Log in
   - Click on `ggloop.io` domain

2. **Go to DNS tab:**
   - Click "DNS" in top menu
   - You'll see current DNS records

3. **Add new AWS records:**
   - Click blue "Add record" button
   
   **For www subdomain:**
   - Type: `CNAME`
   - Name: `www`
   - Content: (paste the Value from AWS for www)
   - Proxy status: Click orange cloud (Proxied)
   - Click "Save"
   
   **For root domain:**
   - Click "Add record" again
   - Type: `CNAME`
   - Name: `@` (or just leave blank - same thing)
   - Content: (paste the Value from AWS for @)
   - Proxy status: Click orange cloud (Proxied)
   - Click "Save"

4. **DON'T delete Railway records yet** (we keep them as backup)

### What You'll See

**Cloudflare DNS page after adding:**
- Old Railway records still there (A or CNAME pointing to up.railway.app)
- New AWS records added (CNAME pointing to cloudfront.net)
- Both coexist for now (this is fine - we delete Railway later)

**What this means:** DNS is being updated to point to AWS

---

## STEP 7: WAIT FOR DNS (5 MINUTES - 2 HOURS)

### What to Do

1. **Wait 5-10 minutes:**
   - DNS propagation takes time
   - Cloudflare is fast (5-10 minutes typical)
   - Worst case: 24 hours globally

2. **Test if DNS changed:**
   - Open PowerShell
   - Run:
     ```
     nslookup ggloop.io
     ```
   - Look for cloudfront.net in the result
   - If you see cloudfront.net: DNS updated!
   - If you still see railway.app: Wait longer

3. **Clear your browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"
   - Or just use Incognito mode

### What You'll See

**When DNS is updated:**
```
> nslookup ggloop.io
Server:  your-router.local
Address:  192.168.1.1

Non-authoritative answer:
Name:    ggloop.io
Address:  [AWS IP addresses]
Aliases:  d2a3b4c5d6e7f.cloudfront.net
```

**Key thing:** See "cloudfront.net" mentioned

**If still seeing railway.app:** Wait longer, check again in 10 minutes

---

## STEP 8: TEST PRODUCTION (10 MINUTES)

### What to Do

1. **Open https://ggloop.io in browser:**
   - Use Incognito mode (Ctrl + Shift + N)
   - Go to: https://ggloop.io

2. **Test everything:**
   - [ ] Homepage loads
   - [ ] No SSL warning (green lock icon)
   - [ ] Shop page works
   - [ ] Login works
   - [ ] Profile loads after login
   - [ ] /dev-console works

3. **Check CloudWatch:**
   - Go to: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=gg-loop-platform-dashboard
   - Should see graphs with data
   - Requests going up
   - Low error rates

### What You'll See

**Success:**
- ggloop.io loads from AWS (looks same as before)
- Everything works
- CloudWatch shows traffic

**This means:** Migration successful! Site is now on AWS.

**Still seeing Railway version:**
- DNS not propagated yet
- Wait longer
- Try from different wifi/mobile connection
- Check nslookup again

---

## STEP 9: DELETE RAILWAY (5 MINUTES)

**WAIT:** Do this only after 24-48 hours of AWS working perfectly

### What to Do

1. **Confirm AWS working:**
   - ggloop.io loads from AWS for 24-48 hours
   - No errors
   - Everything stable

2. **Log in to Railway:**
   - Go to: https://railway.app
   - Log in

3. **Delete project:**
   - Click on "GG LOOP" project
   - Settings (bottom left)
   - Scroll to bottom
   - "Danger" section
   - Click "Delete Project"
   - Type project name to confirm
   - Click "Delete"

4. **Delete old DNS records in Cloudflare:**
   - Go to Cloudflare DNS tab
   - Find old Railway records (pointing to railway.app)
   - Click trash icon
   - Confirm delete

### What You'll See

**After Railway deleted:**
- Project removed from Railway dashboard
- Railway stops billing immediately
- Save $20/month starting next billing cycle

**After old DNS deleted:**
- Only AWS records in Cloudflare
- Clean DNS configuration

**This means:** Migration complete! No more Railway.

---

## TROUBLESHOOTING

### Problem: AWS CLI not installed

**Error message:**
```
❌ AWS CLI not found
```

**Fix:**
1. Go to: https://aws.amazon.com/cli/
2. Download Windows installer (msiexec)
3. Run installer
4. Restart PowerShell
5. Try `npm run check:aws` again

---

### Problem: Build fails with TypeScript errors

**Error message in AWS Amplify:**
```
Build failed
error TS7006: Parameter 'req' implicitly has an 'any' type
```

**Fix:**
1. Open PowerShell in project folder
2. Run: `npm run build:server`
3. See errors listed
4. For each error, add type annotations (or ask me to fix)
5. Commit and push:
   ```
   git add .
   git commit -m "fix: TS errors"
   git push
   ```
6. AWS auto-rebuilds (wait 5-10 min)

---

### Problem: Login redirects wrong

**Error:** After clicking Google login, redirected to railway.app

**Fix:**
1. Go to Google Cloud Console
2. OAuth credentials
3. Add new redirect URI: `https://[your-app-id].amplifyapp.com/auth/google/callback`
4. Save
5. Do same for Twitch, Discord
6. Try login again

---

### Problem: DNS not propagating

**Error:** ggloop.io still shows Railway after 1 hour

**Fix:**
1. Clear local DNS cache:
   ```
   ipconfig /flushdns
   ```
2. Use different internet connection
3. Wait up to 24 hours (worst case)
4. Check `nslookup ggloop.io` - should show cloudfront.net

---

### Problem: 500 errors on AWS

**Error:** Site loads but clicking pages gives 500 errors

**Fix:**
1. Check CloudWatch logs:
   - Go to: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Famplify$252Fgg-loop-platform
2. Look for ERROR messages
3. Most common: Database connection error
   - Verify DATABASE_URL in Amplify env vars
4. Or environment variable missing
   - Check all vars were copied from .env

---

## ROLLBACK (IF NEEDED)

**If AWS isn't working after 2 hours:**

### Quick Rollback (5 minutes)

1. **Go to Cloudflare DNS:**
   - Delete AWS CNAME records (cloudfront.net)
   - Keep old Railway records

2. **Wait 5-10 minutes**

3. **Test ggloop.io:**
   - Should point back to Railway
   - Everything works like before

**This means:** Back to Railway, AWS failed, try again later

---

## WHAT SUCCESS LOOKS LIKE

**After complete migration:**
- ✅ https://ggloop.io loads from AWS
- ✅ No SSL warnings
- ✅ All pages work (shop, login, profile, dev-console)
- ✅ CloudWatch shows metrics
- ✅ EventBridge runs autonomous systems (check every 6 hours)
- ✅ Railway deleted
- ✅ Saving $5/month

**Ongoing:**
- Check CloudWatch dashboard weekly
- Monitor email alerts for errors
- Autonomous systems run automatically (no manual work)

---

## SUMMARY CHECKLIST

**Before Migration:**
- [ ] Run `npm run check:aws`
- [ ] All checks pass
- [ ] Have 2-3 hours available

**Migration:**
- [ ] Run `npm run deploy:aws`
- [ ] Authorize GitHub (one-time)
- [ ] Wait for AWS build (5-10 min)
- [ ] Test temporary URL
- [ ] Get DNS records from AWS
- [ ] Add DNS records in Cloudflare
- [ ] Wait for DNS propagation (5 min - 2 hours)
- [ ] Test https://ggloop.io
- [ ] All features work

**After Migration:**
- [ ] Monitor for 24-48 hours
- [ ] Delete Railway project
- [ ] Delete old DNS records
- [ ] Confirm $5/month savings

---

## NEED HELP?

**Issues during migration:**
- Read error message carefully
- Check troubleshooting section above
- Ask me (Antigravity) for help

**Want to rollback:**
- Follow rollback section
- You can always go back to Railway

**Everything working:**
- You're done!
- AWS is now hosting ggloop.io
- Saving $5/month
- More stable than Railway

---

**Ready to start?**
1. Open this guide: `HOW_TO_MIGRATE_AWS_NON_TECHNICAL.md`
2. Start at Step 1
3. Follow each step exactly
4. Don't skip steps
5. You've got this!

**Master Chief, standing by to assist.**
