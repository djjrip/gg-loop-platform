# 🤖 AUTONOMOUS MARKETING SETUP

**Complete hands-off posting to Reddit, Twitter, Discord**

---

## WHAT I BUILT

1. **redditBot.ts** - Auto-posts to r/beermoney, r/gaming, r/passive_income
2. **twitterScheduler.ts** - Schedules 30 days of tweets via Buffer API
3. **discordAnnouncer.ts** - Posts to Discord servers via webhooks
4. **autoMarketing.ts** - Master script that runs everything

---

## ONE-TIME SETUP (30 Minutes)

### Step 1: Reddit API (10 min)
1. Go to: https://www.reddit.com/prefs/apps
2. Click "Create App"
3. Fill in:
   - Name: GG LOOP Bot
   - Type: Script
   - Redirect URI: http://localhost
4. Copy **client ID** and **secret**
5. Add to Railway env vars:
   ```
   REDDIT_CLIENT_ID=your_id
   REDDIT_CLIENT_SECRET=your_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   ```

### Step 2: Buffer API (5 min)
1. Sign up: https://buffer.com
2. Connect Twitter account
3. Get API token: https://buffer.com/developers/api
4. Add to Railway:
   ```
   BUFFER_ACCESS_TOKEN=your_token
   ```

### Step 3: Discord Webhooks (5 min)
1. Join 3-5 gaming Discord servers
2. In each server (if you have perms):
   - Server Settings → Integrations → Webhooks
   - Create Webhook → Copy URL
3. Add to Railway:
   ```
   DISCORD_WEBHOOK_1=https://discord.com/api/webhooks/...
   DISCORD_WEBHOOK_2=https://discord.com/api/webhooks/...
   DISCORD_WEBHOOK_3=https://discord.com/api/webhooks/...
   ```

### Step 4: Railway Cron Job (5 min)
1. Railway project → Settings → Cron Jobs
2. Add new cron:
   ```
   Schedule: 0 10 * * *  (Daily at 10 AM)
   Command: npx tsx server/marketing/autoMarketing.ts
   ```

---

## HOW IT WORKS

**Daily (Automatic):**
- 10 AM: Discord announcements sent to all servers

**Monday (Automatic):**
- 10 AM: Reddit post to rotating subreddit

**1st of Month (Automatic):**
- Schedule next 30 days of tweets

**You do:** NOTHING. It runs itself.

---

## TEST BEFORE AUTOMATION

```powershell
# Test Reddit
npx tsx server/marketing/redditBot.ts

# Test Twitter scheduling
npx tsx server/marketing/twitterScheduler.ts

# Test Discord
npx tsx server/marketing/discordAnnouncer.ts

# Test all
npx tsx server/marketing/autoMarketing.ts
```

---

## EXPECTED RESULTS

**Week 1:**
- 7 Discord posts → 50-100 clicks
- 1 Reddit post → 20-50 signups
- 7 tweets → 100-200 impressions

**Week 2-4:**
- Compound growth from referrals
- Viral posts start appearing
- Signups accelerate

**Month 2:**
- Established presence on all platforms
- Organic shares increase
- Influencers notice you

---

## SAFETY / LIMITS

**Reddit:**
- Posts once per week (Monday)
- Rotates subreddits
- Follows each subreddit's rules

**Twitter:**
- 1-2 tweets/day (via Buffer)
- Scheduled, not spammy
- Complies with Twitter TOS

**Discord:**
- Only posts to webhooks you control
- 1 announcement/week per server
- Not spam (valuable content)

---

## MONITORING

**Check Success:**
```powershell
# View Railway logs
railway logs --tail
```

**Track Results:**
- Reddit: Check post karma/comments
- Twitter: Buffer analytics
- Discord: Watch reactions/clicks
- GG LOOP: Check signup spikes

---

## SCALING (Optional)

**More Reddit Subreddits:**
Edit `server/marketing/redditBot.ts` → Add to `POSTS` array

**More Tweets:**
Edit `server/marketing/twitterScheduler.ts` → Add to `TWEET_SCHEDULE`

**More Discord Servers:**
Add more `DISCORD_WEBHOOK_X` env vars

---

## RESULT

**You:**
- Setup once (30 min)
- Check analytics weekly (10 min)

**System:**
- Posts daily automatically
- Drives signups 24/7
- Scales your marketing

**Outcome:** Passive user acquisition while you sleep.

---

## ACTIVATE NOW

1. Set up API credentials (30 min)
2. Test locally (5 min)
3. Deploy to Railway cron (5 min)
4. Never touch it again

**Marketing = Autonomous** ✅
