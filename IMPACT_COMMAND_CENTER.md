# IMPACT.COM COMMAND CENTER
**GG LOOP LLC Affiliate Revenue System**

Last Updated: December 10, 2025  
Owner: Jayson BQ, Founder & CEO  
Status: ACTIVE - Revenue Generation Mode

---

## OVERVIEW

Impact.com is GG LOOP's affiliate revenue engine. It connects Jayson's personal brand (@jaysonbq on TikTok, ~2k followers) with brands that pay commissions when people buy through his links.

**What This Does:**
- Generates creator income for Jayson (personal revenue stream)
- Builds toward future GG LOOP integration (users earn points for using affiliate links)
- Aligns with brand pillars: gaming, hoops, sneakers, travel, Filipino-American culture

**Current Setup:**
- Impact.com media partner account: "GG LOOP"
- Connected platform: TikTok @jaysonbq
- Revenue model: Commission-based (CPA, CPS, hybrid)

---

## JAYSON'S BRAND PILLARS

### 1. Gaming Setup
**What:** PC hardware, peripherals, gaming chairs, RGB everything  
**Vibe:** "This is what I actually use" + "Budget vs. Premium" comparisons  
**Affiliate Fit:** High-ticket items (keyboards, mice, monitors, GPUs)  
**Example Brands:** Razer, Logitech, HyperX, Corsair, NZXT

### 2. Travel & Points
**What:** Flights, hotels, credit card points, travel hacks  
**Vibe:** "How I flew to Manila for $200" + "Points game explained"  
**Affiliate Fit:** Travel booking sites, credit card referrals, points programs  
**Example Brands:** Alaska Airlines, Points.com, Chase, Amex

### 3. Sneakers & Fit
**What:** Sneakers, streetwear, basketball gear  
**Vibe:** "Hoops culture meets Filipino drip" + "What I'm wearing today"  
**Affiliate Fit:** Sneaker drops, fashion collabs, athletic wear  
**Example Brands:** Nike, Adidas, StockX, GOAT, Uniqlo

### 4. Creator Tools
**What:** Software, cameras, mics, editing tools  
**Vibe:** "How I make content on a budget" + "Tools that actually work"  
**Affiliate Fit:** SaaS subscriptions, creator gear, productivity apps  
**Example Brands:** Adobe, Epidemic Sound, Streamlabs, Notion

### 5. Filipino-American Culture
**What:** Filipino food, culture, community, identity  
**Vibe:** "For the culture" + "Things my lola taught me"  
**Affiliate Fit:** Filipino brands, cultural products, community-driven companies  
**Example Brands:** Filipino-owned businesses, cultural merch, food brands

---

## HOW AFFILIATE LINKS FLOW

### TikTok (@jaysonbq)
- **Primary Channel:** Short-form video content
- **Link Placement:** Bio link, pinned comments, captions
- **UTM Strategy:** `utm_source=tiktok&utm_medium=social&utm_campaign=<pillar>`
- **Tracking:** Impact.com click tracking + TikTok analytics

### Discord (GG LOOP Community)
- **Channel:** #deals-and-steals or #jayson-recommends
- **Link Placement:** Announcements, weekly drops
- **UTM Strategy:** `utm_source=discord&utm_medium=community&utm_campaign=<pillar>`
- **Tracking:** Impact.com click tracking

### GG LOOP Website (ggloop.io)
- **Future Integration:** "Earn points by shopping" section
- **Link Placement:** Dedicated affiliate page, blog posts, reward catalog
- **UTM Strategy:** `utm_source=ggloop&utm_medium=website&utm_campaign=<pillar>`
- **Tracking:** Impact.com + Google Analytics

### Email (Future)
- **Channel:** Newsletter, weekly drops
- **Link Placement:** Featured deals, curated lists
- **UTM Strategy:** `utm_source=email&utm_medium=newsletter&utm_campaign=<pillar>`
- **Tracking:** Impact.com + email platform analytics

---

## HOW TO USE THIS SYSTEM

### For Jayson (Non-Technical)

**Step 1: Add New Affiliate Programs**
1. Join program on Impact.com
2. Copy program details (brand name, commission rate, cookie window)
3. Paste into `IMPACT_PROGRAMS_DB.json` following the schema
4. Assign a priority score (1-10, 10 = highest)

**Step 2: Create Content**
1. Check `IMPACT_CONTENT_CALENDAR.md` for Day 1-30 templates
2. Pick a pillar (Gaming, Travel, Sneakers, Tools, Culture)
3. Use hook lines from calendar
4. Grab CTA from `IMPACT_CTA_LIBRARY.md`
5. Post to TikTok/Discord with affiliate link

**Step 3: Track Performance**
1. Check Impact.com dashboard weekly
2. Update `IMPACT_KPI_DASHBOARD.md` with clicks, conversions, revenue
3. Follow "When X happens, do Y" rules in KPI dashboard
4. Rotate out low-performing links, double down on winners

**Step 4: Optimize**
1. High clicks + low conversions = Bad CTA or wrong audience
2. Low clicks + high conversions = Good offer, bad visibility
3. High clicks + high conversions = WINNER, make more content
4. Low clicks + low conversions = Kill it, move on

---

## INTEGRATION WITH GG LOOP

### Phase 1: Personal Revenue (NOW)
- Jayson posts affiliate links on TikTok/Discord
- Users click and buy
- Jayson earns commissions
- Revenue goes to Jayson personally

### Phase 2: Points Integration (LATER)
- Add "Shop & Earn" section to GG LOOP
- Users click affiliate links from GG LOOP site
- Users earn GG LOOP points for purchases
- Jayson earns commissions
- Win-win: users get points, Jayson gets revenue

### Phase 3: Automated Deals (DREAM)
- Auto-sync Impact.com programs to GG LOOP
- Auto-generate "Top Deals" posts for Discord/TikTok
- Auto-update reward catalog with affiliate-backed items
- Fully automated revenue engine

---

## RULES & GUIDELINES

### Content Rules
- ✅ Be honest: "I actually use this" or "I haven't tried this but it looks fire"
- ✅ Disclose: "This is an affiliate link, I earn a small commission"
- ✅ Add value: Reviews, comparisons, tutorials, not just "buy this"
- ❌ Never overpromise: No "get rich quick" or "guaranteed results"
- ❌ Never mislead: No fake urgency, no fake scarcity

### Link Rules
- ✅ Use short links: `/go/alaska-flights` not `impact.com/xyz123`
- ✅ Use UTM tags: Track source, medium, campaign
- ✅ Test links: Click before posting to ensure they work
- ❌ Never spam: Max 1-2 affiliate posts per day across all platforms

### Brand Safety
- ✅ Only promote brands that align with GG LOOP values
- ✅ Prioritize Filipino-owned, culture-first, community-driven brands
- ❌ No sketchy brands, no MLMs, no crypto scams
- ❌ No brands that conflict with GG LOOP (e.g., competing gaming platforms)

---

## NEXT STEPS

1. **Immediate:** Paste Impact.com program data into `IMPACT_PROGRAMS_DB.json`
2. **This Week:** Create 3 TikToks using content calendar templates
3. **This Month:** Track KPIs weekly, optimize based on performance
4. **Q1 2026:** Build "Shop & Earn" section on GG LOOP for points integration

---

## FILES IN THIS SYSTEM

- `IMPACT_COMMAND_CENTER.md` (this file) - Overview and how-to
- `IMPACT_PROGRAMS_DB.json` - Database of all affiliate programs
- `IMPACT_LINK_MAP.md` - Link structure and UTM strategy
- `IMPACT_CONTENT_CALENDAR.md` - 30-day content templates
- `IMPACT_CTA_LIBRARY.md` - Pre-written CTAs for all platforms
- `IMPACT_KPI_DASHBOARD.md` - Weekly performance tracking
- `IMPACT_AUTOMATION_PLAYBOOK.md` - Future automation roadmap

---

**Questions? Issues? Ideas?**  
Contact: Jayson BQ (info@ggloop.io)
