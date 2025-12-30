# 🎯 VIBE CODING CONVERSION TRACKING

## Revenue Goals
- **Week 1 Target**: 10+ Builder Tier signups ($12/mo each = $120 MRR)
- **Conversion Path**: Reddit/Email → `/vibe-coding` → Signup → Builder Tier purchase
- **Key Metric**: Conversion rate from landing page visit to Builder Tier activation

## Tracking Implementation

### Analytics Events to Monitor
```javascript
// Landing page visit
event: 'vibe_coding_landing_view'
properties: { source: 'reddit' | 'email' | 'twitter' | 'organic' }

// CTA click
event: 'vibe_coding_cta_click'
properties: { cta_text: 'START EARNING XP NOW' }

// Signup initiated
event: 'vibe_coding_signup_start'

// Builder Tier purchase
event: 'builder_tier_purchase'
properties: { 
  amount: 12.00,
  source_campaign: 'vibe_coding',
  user_id: string
}
```

### Manual Tracking (Week 1)
**Daily Checks:**
1. **Reddit Engagement**
   - Check r/BuildYourVibe post comments
   - Track upvotes, comment count
   - Respond to questions within 2 hours

2. **Email Open/Click Rates**
   - AWS SES dashboard: check delivery rate
   - Monitor bounce/complaint rates
   - Track unique opens (if using tracking pixels)

3. **Builder Tier Signups**
   - Check PayPal dashboard for new subscriptions
   - Query database: `SELECT COUNT(*) FROM subscriptions WHERE tier='elite' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`

4. **Landing Page Traffic**
   - Check Railway logs for `/vibe-coding` requests
   - Monitor 200 vs 404 responses

### Success Metrics (Week 1)
- ✅ **Reddit Post**: 50+ upvotes, 20+ comments
- ✅ **Email Campaign**: 40%+ open rate, 10%+ click rate
- ✅ **Landing Page**: 200+ unique visits
- ✅ **Conversions**: 10+ Builder Tier signups
- ✅ **Revenue**: $120+ MRR

### Pivot Triggers
If after 72 hours:
- **< 5 signups**: Adjust pricing (offer $8/mo early bird)
- **< 100 visits**: Increase Reddit engagement, post to more communities
- **< 20% email open**: Improve subject line, resend with urgency hook
- **High bounce rate on landing**: Simplify CTA, add social proof

## Database Queries for Tracking

### Get Builder Tier signups (last 7 days)
```sql
SELECT 
  u.email,
  u.username,
  s.tier,
  s.status,
  s.created_at
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.tier = 'elite' 
  AND s.created_at >= NOW() - INTERVAL '7 days'
ORDER BY s.created_at DESC;
```

### Get campaign attribution
```sql
SELECT 
  COUNT(*) as total_signups,
  DATE(created_at) as signup_date
FROM subscriptions
WHERE tier = 'elite'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

## Community Engagement Protocol

### Reddit Response Template
**For "How does this work?" questions:**
```
Good question! Here's the flow:

1. Download the VS Code extension (link in bio)
2. Code like you normally do—no extra work
3. Extension auto-tracks your active coding time
4. Earn 10 XP per minute (20 XP/min with Builder Tier 2x multiplier)
5. Redeem XP for real rewards in the shop

The 2x multiplier pays for itself if you code 60+ minutes per month. Most devs hit that in a single weekend session.

Join us: https://ggloop.io/vibe-coding
```

**For "Is this legit?" skepticism:**
```
100% legit. I built this to solve my own problem—wanted to get rewarded for the grind.

Already tracking 500+ coding sessions. Users have redeemed for Amazon gift cards, dev tools, and subscriptions.

Early adopters get the "Vibe Coder" badge. When we build the Studio, this badge proves you were here from day one.

Check the GitHub: [link if public]
Join the Empire: https://ggloop.io/vibe-coding
```

### Email Follow-up Campaign (48 hours after initial)
**Subject:** "You started coding. Here's your XP 💎"

**Body:**
```
Your coding session from [DATE] just earned you [XP_AMOUNT] XP.

But you're leaving money on the table.

With Builder Tier ($12/mo), that same session would have earned 2x.

Upgrade now and we'll retroactively apply the 2x multiplier to your last 7 days of sessions.

[UPGRADE TO BUILDER TIER]

Already coding. Already earning. Why not multiply?

- Master Chief Protocol
```

**Status**: Campaign tracking ready. Monitoring begins once production deploys successfully.
