# IMPACT.COM ROADMAP (LITE)
**3-Stage Revenue System**

Last Updated: December 10, 2025

---

## STAGE 1: NOW (Manual Promotion)

**Status:** ACTIVE - Start Immediately  
**Timeline:** Weeks 1-4  
**Goal:** Generate first $100-500 in affiliate revenue

### What This Stage Looks Like
- Post affiliate content to TikTok + Discord using vanity URLs
- No code changes to GG LOOP
- Manual tracking via Impact dashboard
- Focus: Content creation, not tech

### What AG Can Prep
- ✅ IMPACT_PROGRAMS_DB.json (priority programs identified)
- ✅ IMPACT_TOP_OFFERS.md (promotion strategy)
- ✅ IMPACT_CONTENT_CALENDAR.md (14-day templates)
- ✅ IMPACT_CTA_LIBRARY.md (pre-written CTAs)
- ✅ IMPACT_TRACKING_SETUP.md (subID naming scheme)

### What CEO Must Do
1. **This Week:**
   - [ ] Go to Impact dashboard, fill in commission rates for priority programs
   - [ ] Create 3 TikToks using content calendar templates (GearUP, Alaska, Shopify)
   - [ ] Post vanity URLs in TikTok bio + pinned comments
   - [ ] Post 1-2 deals in Discord #deals channel

2. **Weekly:**
   - [ ] Post 5-7 TikToks with affiliate links
   - [ ] Post 2-3 Discord announcements
   - [ ] Check Impact dashboard for clicks/conversions
   - [ ] Update IMPACT_KPI_DASHBOARD.md with performance data

3. **Monthly:**
   - [ ] Review which programs are performing
   - [ ] Double down on winners (make more content)
   - [ ] Rotate out losers (pause or archive)
   - [ ] Test 1-2 new programs from "supporting" tier

### Dependencies
- None - can start immediately

### Success Metrics
- **Minimum:** $100 revenue in first month
- **Target:** $250-500 revenue in first month
- **Stretch:** 1,000+ clicks, 10+ conversions

---

## STAGE 2: SOON (Visual Integration)

**Status:** PENDING - After Stage 1 Success  
**Timeline:** Weeks 5-8  
**Goal:** Integrate affiliate offers into GG LOOP visually

### What This Stage Looks Like
- Create "Deals" or "Jayson Recommends" section on ggloop.io
- Display priority programs as cards/sections
- Use `/go/` redirects for clean URLs (e.g., `/go/gearup`, `/go/alaska-miles`)
- Still using plain vanity URLs (no Publisher Tag yet)

### What AG Can Prep
- Design mockup for "Deals" section (cards with program info)
- Create `/go/` redirect system (simple Express routes)
- Write copy for each program card
- Set up Google Analytics for `/go/` link tracking

### What CEO Must Do
1. **Before Starting:**
   - [ ] Confirm Stage 1 is successful ($250+ revenue)
   - [ ] Approve "Deals" section design mockup
   - [ ] Decide which 3-5 programs to feature first

2. **During Integration:**
   - [ ] Review AG's code changes (routes for `/go/` redirects)
   - [ ] Test `/go/` links on staging
   - [ ] Approve deployment to production

3. **After Launch:**
   - [ ] Promote "Deals" section on TikTok ("new section on GG LOOP")
   - [ ] Post in Discord with link to deals page
   - [ ] Track clicks via Google Analytics

### Dependencies
- Stage 1 success ($250+ revenue)
- CEO approval for code changes
- Design mockup approval

### Success Metrics
- **Minimum:** 100+ clicks to `/go/` links in first week
- **Target:** 5-10 conversions from GG LOOP site traffic
- **Stretch:** 20% of affiliate revenue comes from site (vs TikTok/Discord)

---

## STAGE 3: LATER (Publisher Tag + Automation)

**Status:** FUTURE - After Stage 2 Success  
**Timeline:** Weeks 9-12+  
**Goal:** Automate tracking and optimize attribution

### What This Stage Looks Like
- Add Impact Publisher Tag to ggloop.io
- Automatic link rewriting (plain URLs → Impact tracking URLs)
- Impression tracking (not just clicks)
- SubID automation (auto-append platform/campaign data)
- Basic reporting loops (weekly email with top performers)

### What AG Can Prep
- Publisher Tag integration plan (already in IMPACT_TRACKING_SETUP.md)
- Automated reporting script (pull Impact API data weekly)
- SubID automation logic (auto-append based on page/campaign)
- Testing checklist (before/after Publisher Tag)

### What CEO Must Do
1. **Before Starting:**
   - [ ] Confirm Stage 2 is successful (100+ clicks from site)
   - [ ] Approve Publisher Tag integration
   - [ ] Review testing plan

2. **During Integration:**
   - [ ] Review AG's code changes (Publisher Tag in `client/index.html`)
   - [ ] Test on staging (verify links transform correctly)
   - [ ] Approve deployment to production

3. **After Launch:**
   - [ ] Monitor Impact dashboard for impression tracking
   - [ ] Check page load time (should be minimal impact)
   - [ ] Review weekly automated reports

### Dependencies
- Stage 2 success (100+ clicks from site)
- CEO approval for Publisher Tag
- Impact.com API access (for automated reporting)

### Success Metrics
- **Minimum:** Publisher Tag active, no errors
- **Target:** 10% improvement in conversion attribution
- **Stretch:** Automated weekly reports save 30+ min/week

---

## DECISION POINTS

### When to Move from Stage 1 → Stage 2
**Go if:**
- ✅ $250+ revenue in first month
- ✅ 1,000+ clicks across all platforms
- ✅ 10+ conversions
- ✅ Clear winners identified (2-3 programs performing well)

**Wait if:**
- ❌ Less than $100 revenue in first month
- ❌ Less than 500 clicks
- ❌ No clear winners (all programs performing equally poorly)
- ❌ Not posting consistently (less than 5 posts/week)

### When to Move from Stage 2 → Stage 3
**Go if:**
- ✅ 100+ clicks from GG LOOP site per week
- ✅ 5-10 conversions from site traffic
- ✅ Manual tracking is becoming painful (too many links to manage)
- ✅ Ready to invest in advanced attribution

**Wait if:**
- ❌ Less than 50 clicks from site per week
- ❌ No conversions from site traffic
- ❌ Manual tracking is still manageable
- ❌ Not ready for code changes

---

## ROLLBACK PLAN

### If Stage 1 Fails
**Symptoms:**
- Less than $50 revenue in first month
- Less than 100 clicks total
- No conversions

**Actions:**
1. Review content quality (are hooks compelling?)
2. Review CTA effectiveness (are people clicking?)
3. Review program fit (do programs align with audience?)
4. Pause affiliate content, focus on value content
5. Revisit in 30 days with new strategy

### If Stage 2 Fails
**Symptoms:**
- Less than 20 clicks from site in first week
- No conversions from site traffic
- Users complaining about "too many ads"

**Actions:**
1. Remove "Deals" section from main nav
2. Keep `/go/` redirects but don't promote heavily
3. Focus back on TikTok/Discord (Stage 1)
4. Revisit site integration in 60 days

### If Stage 3 Fails
**Symptoms:**
- Publisher Tag causing errors
- Page load time increased significantly
- Conversion rate dropped after Publisher Tag

**Actions:**
1. Remove Publisher Tag immediately
2. Revert to manual vanity URLs
3. Investigate what went wrong
4. Fix issues before re-attempting

---

## TIMELINE OVERVIEW

**Week 1-4:** Stage 1 (Manual Promotion)
- Post 20-30 TikToks with affiliate links
- Track performance in Impact dashboard
- Identify top 2-3 programs

**Week 5-8:** Stage 2 (Visual Integration)
- Build "Deals" section on GG LOOP
- Add `/go/` redirects
- Promote site section on TikTok/Discord

**Week 9-12:** Stage 3 (Publisher Tag + Automation)
- Add Publisher Tag to ggloop.io
- Set up automated reporting
- Optimize based on data

**Week 13+:** Optimization & Scale
- Double down on winners
- Test new programs
- Expand to email newsletter (future)

---

## RESOURCE REQUIREMENTS

### Stage 1
**Time:** 5-10 hours/week (content creation)  
**Money:** $0 (no paid tools)  
**Tech:** None (just TikTok + Discord)

### Stage 2
**Time:** 10-15 hours (one-time setup) + 5 hours/week (maintenance)  
**Money:** $0 (no paid tools)  
**Tech:** Code changes (AG handles), CEO approval needed

### Stage 3
**Time:** 5-10 hours (one-time setup) + 2 hours/week (monitoring)  
**Money:** $0 (Impact API is free)  
**Tech:** Code changes (AG handles), CEO approval needed

---

## NEXT ACTIONS

**CEO (This Week):**
1. Fill in commission rates in IMPACT_TOP_OFFERS.md
2. Create 3 TikToks (GearUP, Alaska, Shopify)
3. Post vanity URLs in bio + pinned comments

**AG (On Standby):**
1. Wait for Stage 1 success metrics
2. Prepare Stage 2 design mockup when requested
3. Ready to implement `/go/` redirects when approved

---

**Questions? Need help deciding when to move to next stage?**  
Contact: Jayson BQ (info@ggloop.io)
