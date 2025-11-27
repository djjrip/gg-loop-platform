# Riot Games Production API Key Application Guide

## 🎯 Why You Need This

Your current **Development API Key** expires every 24 hours and has low rate limits. A **Production API Key**:
- ✅ **Never expires** - No more daily regeneration
- ✅ **Higher rate limits** - 100-3000 requests/minute (vs 20/second)
- ✅ **Official support** - Direct help from Riot if issues arise
- ✅ **Looks professional** - Shows you're serious about your platform

## 📝 Application Process

### Step 1: Go to Riot Developer Portal

1. Visit https://developer.riotgames.com/
2. Sign in with your Riot account
3. Click on **"Dashboard"** or **"My Applications"**

### Step 2: Create/Select Your App

1. If you haven't already, click **"Register Product"**
2. Fill in basic info:
   - **Product Name**: GG Loop
   - **Description**: Gaming rewards platform that tracks match performance

### Step 3: Request Production Key

1. Click **"Request Production API Key"** or **"Apply for Personal/Production"**
2. Fill out the application form (see template below)

---

## 📄 Application Template

Use this as a guide for your application:

### Product Name
```
GG Loop
```

### Product Description
```
GG Loop is a gaming rewards platform that allows players to earn points by playing League of Legends, VALORANT, and Teamfight Tactics. Players connect their Riot accounts and automatically earn points for wins, achievements, and competitive play. Points can be redeemed for real-world rewards like gift cards, gaming peripherals, and exclusive merchandise.
```

### Intended Use of Riot API
```
We use the Riot Games API for the following purposes:

1. **Account Verification**: Verify player identities using the Account-v1 API (Riot ID lookup)

2. **Match Tracking**: 
   - Fetch recent match history for League of Legends, VALORANT, and TFT
   - Determine match outcomes (wins/losses)
   - Track player performance metrics

3. **Points Distribution**:
   - Award points for match wins
   - Track ranked play for tiered rewards
   - Verify achievement unlocks

4. **Leaderboards**:
   - Display competitive rankings among our users
   - Show weekly/monthly performance stats

We do NOT:
- Store sensitive player data beyond what's necessary for rewards
- Create third-party matchmaking or game analysis tools
- Scrape data for commercial resale
```

### Expected API Usage
```
Current: ~500 requests/day (early beta with 10-50 users)
6 months: ~10,000 requests/day (500-1000 active users)
12 months: ~50,000-100,000 requests/day (5,000+ active users)

Primary endpoints:
- Account

-v1 (account verification): 20%
- Match-v5 (League match data): 40%
- Val/Match-v1 (VALORANT match data): 30%
- TFT/Match-v1 (TFT match data): 10%
```

### How will you handle rate limits?
```
We implement comprehensive rate limiting using:
1. Per-endpoint request queuing
2. Exponential backoff on 429 responses
3. Distributed caching to minimize redundant requests
4. Batch processing for non-realtime data

Our current implementation respects Riot's rate limits and will scale to production limits when approved.
```

### Website/Platform URL
```
https://ggloop.io
```

### Contact Email
```
jaysonquindao@ggloop.io
(or use your primary email)
```

---

## ⏱️ Timeline

- **Submission**: Instant
- **Review**: 24-72 hours (usually 1-2 business days)
- **Approval**: You'll get an email with your production key

## ✅ What Happens After Approval

1. You'll receive an email with your **Production API Key**
2. Update Railway environment variable:
   - Variable: `RIOT_API_KEY`
   - Value: `[your-new-production-key]`
3. Railway will automatically redeploy
4. **Done!** No more expiring keys

## 🚨 Getting Rejected?

Common rejection reasons and fixes:

### "Unclear use case"
**Fix**: Be more specific about HOW you use the API (see template above)

### "Low expected usage"
**Fix**: That's okay! Start with conservative estimates. You can always request limit increases later.

### "App not live yet"
**Fix**: Deploy to ggloop.io first, then reapply with the live URL

### "Violates ToS"
**Fix**: Make sure you're not:
- Selling raw match data
- Creating unauthorized clients
- Using data for gambling/betting

---

## 📞 Need Help?

If your application is rejected or you need clarification:
- Email: **devrel@riotgames.com**
- Discord: Join the Riot Games Third Party Developer Community
- Forum: https://discussion.developer.riotgames.com/

---

## 🎯 Pro Tips

1. **Be honest** about your current usage (even if low)
2. **Show your live site** - Having ggloop.io live helps a LOT
3. **Explain the value** - Show how you're enhancing the player experience
4. **Follow up** - If no response after 3 days, politely email devrel@riotgames.com

---

**Ready to apply?** Go to https://developer.riotgames.com/ and use the template above!
