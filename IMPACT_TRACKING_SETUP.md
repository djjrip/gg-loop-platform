# IMPACT.COM TRACKING SETUP
**SubID Strategy + Publisher Tag Integration Plan**

Last Updated: December 10, 2025

---

## CURRENT STATE (NO CODE CHANGES)

**What We Have:**
- 16 Impact.com vanity URLs (already created in Impact dashboard)
- No Publisher Tag installed on ggloop.io
- No subId tracking configured

**What We're Using Now:**
- Plain vanity URLs for TikTok, Discord posts
- Manual tracking via Impact.com dashboard

**This Works For:**
- Quick testing
- Low-volume promotion
- Simple click tracking

---

## WHEN TO USE VANITY URLs (DEFAULT - NOW)

**Use Plain Vanity URLs When:**
- ✅ Posting to TikTok (bio link, pinned comments)
- ✅ Posting to Discord (announcements, deal drops)
- ✅ Sharing on social media (Twitter, Instagram stories)
- ✅ Quick testing of new programs
- ✅ You don't need granular tracking

**How to Use:**
1. Copy vanity URL from Impact dashboard (e.g., `gearup.sjv.io/09rPQM`)
2. Paste into TikTok bio, Discord post, etc.
3. Track clicks/conversions in Impact dashboard
4. That's it - no code needed

**Pros:**
- ✅ Zero setup required
- ✅ Works everywhere (TikTok, Discord, email, etc.)
- ✅ Easy to share
- ✅ No technical knowledge needed

**Cons:**
- ❌ Limited tracking (can't see which specific post drove clicks)
- ❌ No automatic link rewriting
- ❌ Manual URL management

---

## WHEN TO USE SUBIDS (MANUAL - NOW)

**Use SubIDs When:**
- ✅ You want to track which platform/campaign drove conversions
- ✅ You're running A/B tests (different CTAs, different content)
- ✅ You want to see which TikTok video performed best
- ✅ You're ready for more granular tracking

**SubID Naming Scheme:**

### subId1 = Platform
- `tiktok` - TikTok posts
- `discord` - Discord server
- `site` - GG LOOP website
- `email` - Email newsletter (future)
- `stories` - TikTok/Instagram stories

### subId2 = Campaign or Series
- `alaska_miles_szn1` - Alaska miles content series season 1
- `gearup_ranked_grind` - GearUP ranked grind campaign
- `shopify_side_hustle` - Shopify side hustle series
- `gemini_broke_investing` - Gemini broke gamer investing
- `dhgate_budget_builds` - DHgate budget gaming builds

### subId3 = Content ID
- `20251210` - Date (YYYYMMDD)
- `video_001` - Video number
- `post_abc` - Short slug

**Example URLs with SubIDs:**

**TikTok GearUP Video (Dec 10, 2025):**
```
gearup.sjv.io/09rPQM?subId1=tiktok&subId2=gearup_ranked_grind&subId3=20251210
```

**Discord Alaska Miles Post:**
```
alaska.gqco.net/xLWL01?subId1=discord&subId2=alaska_miles_szn1&subId3=post_001
```

**How to Add SubIDs:**
1. Take vanity URL: `gearup.sjv.io/09rPQM`
2. Add `?subId1=tiktok&subId2=gearup_ranked_grind&subId3=20251210`
3. Final URL: `gearup.sjv.io/09rPQM?subId1=tiktok&subId2=gearup_ranked_grind&subId3=20251210`
4. Use this URL in your post
5. Check Impact dashboard to see subId breakdown

**Pros:**
- ✅ Granular tracking (know exactly which post drove conversions)
- ✅ A/B testing capability
- ✅ Campaign performance insights
- ✅ No code changes needed

**Cons:**
- ❌ Manual work (add subIds to each URL)
- ❌ Longer URLs (less clean for TikTok bio)
- ❌ Easy to forget or mess up

---

## WHEN TO USE PUBLISHER TAG (FUTURE - LATER)

**Publisher Tag Code:**
```html
<script type="text/javascript">
(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A6697820-1814-4369-90fc-06b608d88f4e1.js','script','impactStat',document,window);
impactStat('transformLinks');
impactStat('trackImpression');
</script>
```

**Use Publisher Tag When:**
- ✅ GG LOOP has a dedicated "Deals" or "Partner Offers" section
- ✅ You're embedding affiliate links in blog posts or guides
- ✅ You want automatic link rewriting (plain URLs → Impact tracking URLs)
- ✅ You want impression tracking (not just clicks)
- ✅ You're ready to invest in more advanced tracking

**What Publisher Tag Does:**
1. **Automatic Link Rewriting:** Converts plain URLs (e.g., `https://www.gearupbooster.com`) to Impact tracking URLs
2. **Impression Tracking:** Tracks when users SEE the link, not just click it
3. **Conversion Attribution:** Better attribution for multi-touch conversions

**Example Use Case:**
- You write a blog post on GG LOOP: "Best Gaming Tools for Ranked Grind"
- You mention GearUP Booster with a plain link: `https://www.gearupbooster.com`
- Publisher Tag automatically converts it to: `gearup.sjv.io/09rPQM?irclickid=xyz123`
- You get credit for the click/conversion without manually creating tracking links

**Pros:**
- ✅ Automatic link tracking
- ✅ Impression tracking
- ✅ Better conversion attribution
- ✅ Less manual work once set up

**Cons:**
- ❌ Requires code changes (adding script to site)
- ❌ Only works on ggloop.io (not TikTok, Discord)
- ❌ Adds page load time (small impact)
- ❌ Requires testing before/after

---

## PUBLISHER TAG INTEGRATION PLAN (⚠️ FUTURE LEVEL)

### Step 1: Prepare (Before Code Changes)
- [ ] Create "Deals" or "Partner Offers" section on GG LOOP
- [ ] Write 3-5 blog posts or guides with affiliate links
- [ ] Test Publisher Tag on staging environment (if available)
- [ ] Get CEO approval for code changes

### Step 2: Add Publisher Tag to React App
**⚠️ FUTURE LEVEL: Requires CEO approval before editing code**

**Where to Add:**
- **Option A:** `client/index.html` (root HTML template)
  - Location: Inside `<head>` tag, before closing `</head>`
  - Pros: Loads on every page
  - Cons: Adds to initial page load

- **Option B:** `client/src/App.tsx` (main layout component)
  - Location: Inside `useEffect` hook on mount
  - Pros: More control over when it loads
  - Cons: Slightly more complex

**Recommended:** Option A (simpler, standard practice)

**Code Change:**
```html
<!-- In client/index.html, add before </head> -->
<script type="text/javascript">
(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A6697820-1814-4369-90fc-06b608d88f4e1.js','script','impactStat',document,window);
impactStat('transformLinks');
impactStat('trackImpression');
</script>
```

### Step 3: Test Before Deploy
- [ ] Test on local dev server (`npm run dev`)
- [ ] Check browser console for errors
- [ ] Verify links are being transformed (inspect element)
- [ ] Test click tracking in Impact dashboard
- [ ] Check page load time (before/after)

### Step 4: Deploy to Production
- [ ] Merge to `ggloop-staging` branch
- [ ] Test on staging environment
- [ ] Get CEO approval
- [ ] Merge to `main` branch
- [ ] Deploy to Railway
- [ ] Verify Publisher Tag is active on ggloop.io

### Step 5: Monitor Post-Deploy
- [ ] Check Impact dashboard for impression tracking
- [ ] Verify link transformations are working
- [ ] Monitor page load time (should be minimal impact)
- [ ] Check for any JavaScript errors
- [ ] Compare click/conversion rates (before/after)

---

## TRACKING STRATEGY ROADMAP

### Stage 1: NOW (Manual Vanity URLs)
**What to Do:**
- Use plain vanity URLs for TikTok, Discord
- No subIds yet (keep it simple)
- Track performance in Impact dashboard
- Focus on creating content, not tracking

**Tools Needed:**
- Impact.com dashboard (already have)
- Vanity URLs (already created)

**Time Investment:** 0 hours (already set up)

---

### Stage 2: SOON (Manual SubIDs)
**What to Do:**
- Add subIds to vanity URLs for granular tracking
- Track which platform/campaign drives conversions
- A/B test different CTAs
- Optimize based on data

**Tools Needed:**
- Impact.com dashboard
- SubID naming scheme (defined above)
- Spreadsheet for tracking (optional)

**Time Investment:** 5-10 min per post (adding subIds)

**When to Start:**
- After posting 10-20 pieces of content
- When you want to know which TikToks perform best
- When you're ready for A/B testing

---

### Stage 3: LATER (Publisher Tag + Automation)
**What to Do:**
- Add Publisher Tag to ggloop.io
- Create "Deals" section with affiliate links
- Automatic link rewriting
- Impression tracking

**Tools Needed:**
- Publisher Tag code (provided above)
- Code changes to `client/index.html`
- Testing environment
- CEO approval

**Time Investment:** 2-4 hours (integration + testing)

**When to Start:**
- After GG LOOP has dedicated affiliate section
- After 50+ pieces of affiliate content posted
- When manual tracking becomes too painful
- When you're ready for advanced attribution

---

## DECISION TREE: WHICH TRACKING METHOD?

**Question 1: Where are you posting?**
- TikTok/Discord/Social → Use vanity URLs
- GG LOOP website → Consider Publisher Tag (later)

**Question 2: Do you need to know which specific post drove conversions?**
- No → Use plain vanity URLs
- Yes → Add subIds

**Question 3: Do you have a dedicated affiliate section on GG LOOP?**
- No → Stick with vanity URLs
- Yes → Consider Publisher Tag

**Question 4: Are you posting 10+ affiliate links per week?**
- No → Manual vanity URLs are fine
- Yes → Consider subIds or Publisher Tag

---

## NEXT STEPS

**This Week:**
- [ ] Use plain vanity URLs for first 10-20 posts
- [ ] Track performance in Impact dashboard
- [ ] Focus on content, not tracking

**Next Month:**
- [ ] Start adding subIds to track platform/campaign
- [ ] Identify top-performing content
- [ ] Double down on winners

**Q1 2026:**
- [ ] Build "Deals" section on GG LOOP
- [ ] Get CEO approval for Publisher Tag
- [ ] Integrate Publisher Tag
- [ ] Test and monitor

---

**⚠️ CRITICAL REMINDER:**

DO NOT add Publisher Tag to ggloop.io without:
1. CEO approval
2. Testing on staging
3. Verifying it doesn't break anything
4. Having a rollback plan

This is a FUTURE integration. For now, use vanity URLs.
