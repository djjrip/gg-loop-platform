# BRAND METRICS REQUIREMENTS
**What Brands Care About + How to Track**

Last Updated: December 10, 2025

---

## OVERVIEW

This document defines the metrics brands will care about during pilots, how to track them "in principle," and where they'll live in dashboards/reports.

**⚠️ CRITICAL:** This document complies with the "NO FAKE METRICS" rule. All metrics are defined as SAMPLE/HYPOTHETICAL until real data is collected.

---

## CORE METRICS BRANDS CARE ABOUT

### 1. PARTICIPATION METRICS

**What Brands Want to Know:**
- How many people engaged with the mission?
- What's the completion rate?
- How does this compare to other campaigns?

**Metrics to Track:**
| Metric | Definition | How to Track | Sample Target |
|--------|-----------|--------------|---------------|
| Mission Starts | # of users who started mission | Count of `user_missions` records with `status = "active"` | 500+ |
| Mission Completions | # of users who completed mission | Count of `user_missions` records with `status = "completed"` | 250+ |
| Completion Rate | % of starters who finished | (Completions ÷ Starts) × 100 | 50%+ |
| Avg Time to Complete | Days from start to finish | AVG(`completed_at` - `started_at`) | 15 days |

**Where This Lives:**
- **Dashboard:** "Pilot Performance" section
- **Report:** "Participation Overview" slide

---

### 2. ENGAGEMENT METRICS

**What Brands Want to Know:**
- How active were participants?
- What's the quality of engagement?
- Did this drive behavior change?

**Metrics to Track:**
| Metric | Definition | How to Track | Sample Target |
|--------|-----------|--------------|---------------|
| Total Games Played | # of games played during mission | Sum of `games_played` from mission logs | 10,000+ |
| Total Hours Played | Hours spent gaming during mission | Sum of `hours_played` from mission logs | 5,000+ |
| Avg Games Per User | Games played per participant | Total Games ÷ Participants | 20+ |
| Daily Active Users | Users active each day | Count of unique users per day | 100+ |

**Where This Lives:**
- **Dashboard:** "Engagement Metrics" section
- **Report:** "User Activity" slide

---

### 3. CONVERSION METRICS

**What Brands Want to Know:**
- How many people redeemed rewards?
- What's the redemption rate?
- What's the total value distributed?

**Metrics to Track:**
| Metric | Definition | How to Track | Sample Target |
|--------|-----------|--------------|---------------|
| Rewards Redeemed | # of rewards claimed | Count of `redemptions` records for this brand | 100+ |
| Redemption Rate | % of completers who redeemed | (Redemptions ÷ Completions) × 100 | 80%+ |
| Total Reward Value | $ value of all rewards | Sum of `reward_value` from redemptions | $5,000+ |
| Avg Reward Value | $ per redemption | Total Value ÷ Redemptions | $50 |

**Where This Lives:**
- **Dashboard:** "Conversion Metrics" section
- **Report:** "Redemption Overview" slide

---

### 4. AMPLIFICATION METRICS

**What Brands Want to Know:**
- How much social buzz did this generate?
- What's the reach beyond participants?
- Did creators amplify the campaign?

**Metrics to Track:**
| Metric | Definition | How to Track | Sample Target |
|--------|-----------|--------------|---------------|
| TikTok Views | Views on mission-related TikToks | Manual tracking from TikTok analytics | 50,000+ |
| Discord Messages | Messages in mission channel | Count of messages in `#[brand]-mission` | 1,000+ |
| Social Mentions | Brand mentions on social media | Manual tracking (search "[brand] GG LOOP") | 100+ |
| Creator Content | # of creator videos/posts | Manual tracking (tag creators, count posts) | 5+ |

**Where This Lives:**
- **Dashboard:** "Social Amplification" section
- **Report:** "Reach & Awareness" slide

---

### 5. DEMOGRAPHIC METRICS

**What Brands Want to Know:**
- Who participated?
- Does this align with our target demographic?
- What insights can we learn?

**Metrics to Track:**
| Metric | Definition | How to Track | Sample Target |
|--------|-----------|--------------|---------------|
| Age Distribution | % by age group (18-24, 25-34, etc.) | Query `users` table, group by `age_group` | 70% 18-34 |
| Gender Distribution | % male/female/other | Query `users` table, group by `gender` | N/A (report only) |
| Geographic Distribution | % by region/country | Query `users` table, group by `country` | 80% US |
| Subscriber Status | % free vs paid | Query `users` table, group by `subscription_tier` | 20% paid |

**Where This Lives:**
- **Dashboard:** "Audience Insights" section
- **Report:** "Demographic Breakdown" slide

---

## TRACKING METHODOLOGY

### Data Sources

**Primary:**
- **Database:** `user_missions`, `redemptions`, `users`, `point_transactions`
- **Analytics:** Google Analytics (website traffic), TikTok Analytics (video views)
- **Manual:** Discord message counts, social media mentions, creator content

**Secondary:**
- **Impact.com:** Affiliate link clicks (if applicable)
- **PayPal:** Subscription conversions (if applicable)
- **Surveys:** Post-pilot user feedback (optional)

### Tracking Frequency

**Real-Time:**
- Mission starts/completions
- Reward redemptions
- Daily active users

**Daily:**
- Games played
- Hours played
- Discord messages

**Weekly:**
- TikTok views
- Social mentions
- Creator content

**End of Pilot:**
- Full demographic analysis
- Total reward value
- Completion rate

---

## DASHBOARD DESIGN (IN PRINCIPLE)

### Dashboard Sections

**1. Overview (Top of Page)**
```
┌─────────────────────────────────────────────┐
│ [Brand] × GG LOOP Pilot Dashboard          │
│                                             │
│ Mission Starts: [X]                         │
│ Completions: [X]                            │
│ Redemptions: [X]                            │
│ Total Value: $[X]                           │
└─────────────────────────────────────────────┘
```

**2. Participation Metrics**
```
┌─────────────────────────────────────────────┐
│ Participation                               │
│                                             │
│ Starts: [X] (Target: 500)                  │
│ Completions: [X] (Target: 250)             │
│ Completion Rate: [X]% (Target: 50%)        │
│                                             │
│ [Bar Chart: Starts vs Completions]         │
└─────────────────────────────────────────────┘
```

**3. Engagement Metrics**
```
┌─────────────────────────────────────────────┐
│ Engagement                                  │
│                                             │
│ Total Games: [X] (Target: 10,000)          │
│ Total Hours: [X] (Target: 5,000)           │
│ Avg Games/User: [X] (Target: 20)           │
│                                             │
│ [Line Chart: Daily Active Users]           │
└─────────────────────────────────────────────┘
```

**4. Conversion Metrics**
```
┌─────────────────────────────────────────────┐
│ Conversions                                 │
│                                             │
│ Redemptions: [X] (Target: 100)             │
│ Redemption Rate: [X]% (Target: 80%)        │
│ Total Value: $[X] (Target: $5,000)         │
│                                             │
│ [Pie Chart: Reward Distribution]           │
└─────────────────────────────────────────────┘
```

**5. Social Amplification**
```
┌─────────────────────────────────────────────┐
│ Social Amplification                        │
│                                             │
│ TikTok Views: [X] (Target: 50,000)         │
│ Discord Messages: [X] (Target: 1,000)      │
│ Social Mentions: [X] (Target: 100)         │
│ Creator Content: [X] (Target: 5)           │
└─────────────────────────────────────────────┘
```

---

## REPORT TEMPLATE (SAMPLE LANGUAGE)

### Slide 1: Executive Summary
```
[Brand] × GG LOOP Pilot Results

30-Day Performance Overview

• [X] mission starts (Target: 500)
• [X] completions ([X]% completion rate)
• [X] rewards redeemed ($[X] total value)
• [X] TikTok views, [X] social mentions

Key Takeaway: [1-2 sentence summary]
```

### Slide 2: Participation
```
Participation Metrics

Mission Starts: [X]
- [X]% of GG LOOP active users
- [X]% growth week-over-week

Completions: [X]
- [X]% completion rate (vs [X]% industry avg)
- Avg time to complete: [X] days

Insight: [What this tells us about engagement]
```

### Slide 3: Engagement
```
Engagement Metrics

Total Games Played: [X]
Total Hours Played: [X]
Avg Games Per User: [X]

Daily Active Users:
- Week 1: [X]
- Week 2: [X]
- Week 3: [X]
- Week 4: [X]

Insight: [What this tells us about user behavior]
```

### Slide 4: Conversions
```
Conversion Metrics

Rewards Redeemed: [X]
Redemption Rate: [X]%
Total Reward Value: $[X]

Top Rewards:
1. [Reward Name] - [X] redemptions
2. [Reward Name] - [X] redemptions
3. [Reward Name] - [X] redemptions

Insight: [What this tells us about reward appeal]
```

### Slide 5: Social Amplification
```
Social Amplification

TikTok Views: [X]
Discord Messages: [X]
Social Mentions: [X]
Creator Content: [X] pieces

Sample Content:
- [Creator Name]: [X] views
- [Creator Name]: [X] views

Insight: [What this tells us about reach]
```

### Slide 6: Demographics
```
Audience Insights

Age Distribution:
- 18-24: [X]%
- 25-34: [X]%
- 35+: [X]%

Geographic Distribution:
- US: [X]%
- International: [X]%

Subscriber Status:
- Free: [X]%
- Paid: [X]%

Insight: [What this tells us about audience fit]
```

### Slide 7: Learnings
```
Key Learnings

What Worked:
• [Specific success point]
• [Specific success point]

What Could Be Improved:
• [Specific improvement area]
• [Specific improvement area]

Unexpected Insights:
• [Surprising finding]
```

### Slide 8: Next Steps
```
Recommendations

Based on these results, we recommend:

Option 1: Continue & Scale
- Extend pilot to 90 days
- Increase reward budget by [X]%
- Add [X] new mission packs

Option 2: Adjust & Retry
- Focus on [specific game/demographic]
- Test different rewards
- Shorter mission duration

Option 3: Pause & Reassess
- Pilot didn't meet targets
- Revisit in [X] months
- Explore different approach

Next Call: [Proposed date/time]
```

---

## COMPLIANCE & PRIVACY

### Data Collection Rules
- ✅ Only collect data users consent to
- ✅ Anonymize demographic data in reports
- ✅ No PII (personally identifiable information) shared with brands
- ✅ Comply with GDPR/CCPA where applicable

### What Brands CAN See
- ✅ Aggregate metrics (total starts, completions, etc.)
- ✅ Demographic breakdowns (age groups, regions)
- ✅ Social amplification data (public posts only)

### What Brands CANNOT See
- ❌ Individual user names/emails
- ❌ Specific user activity logs
- ❌ Private Discord messages
- ❌ Payment information

---

## SAMPLE TARGETS (HYPOTHETICAL)

**⚠️ THESE ARE SAMPLE TARGETS ONLY - NOT REAL DATA**

### Small Pilot (500 Users)
- Mission Starts: 500
- Completions: 250 (50% rate)
- Redemptions: 200 (80% rate)
- Total Value: $5,000
- TikTok Views: 50,000
- Social Mentions: 100

### Medium Pilot (1,000 Users)
- Mission Starts: 1,000
- Completions: 600 (60% rate)
- Redemptions: 500 (83% rate)
- Total Value: $15,000
- TikTok Views: 150,000
- Social Mentions: 300

### Large Pilot (2,000 Users)
- Mission Starts: 2,000
- Completions: 1,200 (60% rate)
- Redemptions: 1,000 (83% rate)
- Total Value: $50,000
- TikTok Views: 500,000
- Social Mentions: 1,000

---

**Questions? Need help setting up tracking?**  
Contact: Jayson BQ (info@ggloop.io)
