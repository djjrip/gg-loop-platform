# GG LOOP OPERATIONS OS
**Daily CEO Routine + All Systems**

Last Updated: December 10, 2025

---

## DAILY CEO ROUTINE (30 MINUTES)

### Morning Block (10 min - 9:00 AM)
**Revenue Check:**
- [ ] Check Impact.com dashboard (overnight conversions)
- [ ] Check PayPal dashboard (new subscriptions)
- [ ] Note revenue in daily log

**Platform Health:**
- [ ] Visit ggloop.io (verify site is up)
- [ ] Check Railway logs (any errors?)
- [ ] Quick Discord scan (any urgent issues?)

### Midday Block (10 min - 12:00 PM)
**Community Engagement:**
- [ ] Reply to top 10 TikTok comments
- [ ] Check Discord for questions
- [ ] Post 1 deal/update if relevant

### Evening Block (10 min - 6:00 PM)
**Content & Growth:**
- [ ] Post today's TikTok (using IMPACT_14DAY_TIKTOK_SCRIPTS.md)
- [ ] Pin affiliate link in comment
- [ ] Update bio link if needed

---

## REVENUE LEVERS (PULL AS NEEDED)

### Lever 1: Impact.com Affiliate Revenue
**Current State:** 16 programs, 5 priority  
**How to Pull:**
- Post more TikToks (increase frequency)
- Add new programs (test supporting tier)
- Expand to Instagram Reels

**Files:** IMPACT_DAILY_LOOP.md, IMPACT_14DAY_TIKTOK_SCRIPTS.md

### Lever 2: PayPal Subscriptions
**Current State:** CODE-COMPLETE, awaiting env vars  
**How to Pull:**
- Add env vars to Railway (activate system)
- Announce on TikTok/Discord
- Create subscription-focused content

**Files:** PAYPAL_LAUNCH_CHECKLIST.md, PAYPAL_TESTING_MAP.md

### Lever 3: GG LOOP Points Economy
**Current State:** Active, manual fulfillment  
**How to Pull:**
- Add more rewards to shop
- Partner with brands for rewards
- Automate fulfillment (future)

**Files:** GG_LOOP_STATE_OF_PRODUCTION.md

### Lever 4: Creator Partnerships
**Current State:** Not active yet  
**How to Pull:**
- Reach out to creators (use CREATOR_OUTREACH_LIBRARY.md)
- Offer revenue share
- Build creator network

**Files:** CREATOR_OUTREACH_LIBRARY.md, CREATOR_REVENUE_MODEL.md

---

## SUBSCRIPTION FLOW TROUBLESHOOTING

### Issue: User can't subscribe
**Check:**
1. Are PayPal env vars set in Railway?
2. Is site accessible (ggloop.io/subscription)?
3. Is PayPal button showing (not error message)?

**Fix:** See PAYPAL_ERROR_DIAGNOSTICS.md

### Issue: Subscription created but not in database
**Check:**
1. Check Railway logs for errors
2. Check database connection
3. Verify `/api/paypal/subscription-approved` route

**Fix:** See PAYPAL_ERROR_DIAGNOSTICS.md

### Issue: Points not awarded
**Check:**
1. Check `point_transactions` table
2. Verify tier → points mapping
3. Check server logs

**Fix:** See PAYPAL_ERROR_DIAGNOSTICS.md

---

## COPY RULES (BRAND VOICE)

### Tone
- **Casual:** "This is how I do it" not "Here's how to do it"
- **Honest:** "Yeah it's affiliate but it works" not "Amazing opportunity!"
- **Direct:** "Link in bio" not "Check out the link in my bio for more information"
- **Real:** "I'm broke but optimizing" not "I'm a successful entrepreneur"

### What to Say
- ✅ "This is what I actually use"
- ✅ "Broke gamer investing 101"
- ✅ "How I flew to Manila for $287"
- ✅ "Ranked sweats: this is your sign"
- ✅ "For the culture"

### What NOT to Say
- ❌ "You NEED this NOW"
- ❌ "This will change your life"
- ❌ "Limited time offer" (unless actually true)
- ❌ "Get rich quick"
- ❌ "Guaranteed results"

**Full guide:** GG_LOOP_BIBLE.md

---

## OUTREACH TEMPLATES

### Creator Outreach (Cold DM)
```
Hey [Name],

Love your [gaming/travel/content] content. I run GG LOOP - we help gamers earn rewards for playing.

Would you be down to promote it to your community? We'd give you a custom referral link + revenue share.

No pressure, just thought it might fit your vibe.

- Jayson
```

### Brand Partnership (Email)
```
Subject: Partnership Opportunity - GG LOOP

Hi [Name],

I'm Jayson, founder of GG LOOP (ggloop.io). We're a gaming rewards platform with 2k+ users.

We're looking to partner with [brand type] brands for our rewards catalog. Would you be interested in offering products/discounts to our community?

Happy to hop on a quick call to discuss.

Best,
Jayson BQ
Founder, GG LOOP LLC
info@ggloop.io
```

**Full library:** CREATOR_OUTREACH_LIBRARY.md

---

## PRODUCT ROADMAP (SIMPLE STEPS)

### Q1 2026
- [ ] Activate PayPal subscriptions (add env vars)
- [ ] Hit $500/month affiliate revenue
- [ ] Reach 5k TikTok followers
- [ ] Add 10 new rewards to shop

### Q2 2026
- [ ] Integrate Impact offers into GG LOOP site
- [ ] Hit $1,000/month affiliate revenue
- [ ] Launch creator partnership program
- [ ] Reach 10k TikTok followers

### Q3 2026
- [ ] Automate reward fulfillment
- [ ] Hit $2,000/month affiliate revenue
- [ ] Expand to Instagram Reels
- [ ] Reach 20k TikTok followers

### Q4 2026
- [ ] Launch email newsletter
- [ ] Hit $5,000/month affiliate revenue
- [ ] 100+ active subscriptions
- [ ] Reach 50k TikTok followers

---

## AG → CEO FEEDBACK LOOP

### When CEO Needs AG
**For Documentation:**
- "AG, create a guide for [topic]"
- "AG, update [file] with [changes]"

**For Analysis:**
- "AG, review [data] and give recommendations"
- "AG, audit [system] for issues"

**For Automation:**
- "AG, design automation for [task]"
- "AG, create workflow for [process]"

### When AG Reports to CEO
**Daily:** Not needed (CEO checks dashboards)

**Weekly:** If major issues detected
- "Revenue dropped 50%+ this week"
- "Site is down"
- "Critical error in logs"

**Monthly:** Performance summary
- "Here's what worked this month"
- "Here's what didn't work"
- "Here's what to try next"

---

## QUICK REFERENCE

### Daily Tasks
- Check revenue (Impact + PayPal)
- Engage with community (TikTok + Discord)
- Post content (1 TikTok)

### Weekly Tasks
- Review performance (IMPACT_KPI_DASHBOARD.md)
- Plan next week's content
- Batch film/edit (optional)

### Monthly Tasks
- Full system audit
- Archive losers, test new programs
- Update roadmap

### Files to Know
- **Impact:** IMPACT_DAILY_LOOP.md, IMPACT_14DAY_TIKTOK_SCRIPTS.md
- **PayPal:** PAYPAL_LAUNCH_CHECKLIST.md, PAYPAL_ERROR_DIAGNOSTICS.md
- **Brand:** GG_LOOP_BIBLE.md
- **Creator:** CREATOR_OUTREACH_LIBRARY.md

---

**Questions? Need AG support?**  
Just ask - AG is always ready to help.
