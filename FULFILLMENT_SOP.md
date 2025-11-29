# GG LOOP Reward Fulfillment SOP
**Standard Operating Procedure for Manual Reward Fulfillment**

---

## Overview

This SOP covers the **manual fulfillment process** for GG LOOP rewards using Raise.com to purchase discounted gift cards. This is the launch strategy until we integrate Tremendous API.

**Key Benefits:**
- 15-20% profit margin on each redemption
- No API integration needed (launch immediately)
- Full control over fulfillment
- Learn redemption patterns before automating

---

## Part 1: One-Time Setup (Do Once)

### Step 1: Create Raise.com Account

1. Go to [raise.com](https://www.raise.com)
2. Click "Sign Up" (top right)
3. Use **business email** (not personal) - e.g., `admin@ggloop.io`
4. Verify email
5. Add payment method:
   - **Recommended:** Business debit card for tracking
   - **Alternative:** PayPal linked to business account
6. Enable 2FA for security

**Time:** 5-10 minutes

---

### Step 2: Set Up Email Templates

Create saved email templates for common fulfillments:

**Template 1: Gift Card Delivery**
```
Subject: Your GG LOOP Reward - [REWARD NAME]

Hi [USERNAME],

Congrats on redeeming your [REWARD NAME]!

Your gift card code is: [CODE]
PIN (if applicable): [PIN]

To redeem:
1. [PLATFORM-SPECIFIC INSTRUCTIONS]
2. Enter the code above
3. Enjoy!

Thanks for gaming with GG LOOP!

- The GG LOOP Team
```

**Template 2: Fulfillment Delay**
```
Subject: Your GG LOOP Reward - Processing

Hi [USERNAME],

We received your redemption request for [REWARD NAME].

Your reward will be delivered within 24 hours. We're manually processing this to ensure everything is perfect!

Thanks for your patience!

- The GG LOOP Team
```

Save these in Gmail/Outlook as draft templates.

**Time:** 5 minutes

---

## Part 2: Daily Fulfillment Process

### When to Check for Redemptions

**Recommended Schedule:**
- Morning: 9am
- Afternoon: 3pm  
- Evening: 9pm

**Where to Check:**
1. Admin Dashboard → Fulfillment Queue
2. OR check `/api/admin/pending-fulfillments` endpoint

---

### Step-by-Step Fulfillment

#### 1. Log into GG LOOP Admin Dashboard
- Navigate to `/fulfillment` page
- Review pending rewards list

#### 2. For Each Pending Reward:

**a) Verify Legitimacy (Fraud Check)**
- Check user account age (< 24 hours = suspicious)
- Check redemption history (10+ redemptions/day = flag)
- Check user activity (0 matches played = suspicious)
- **If suspicious:** Mark for manual review, contact user

**b) Purchase Gift Card on Raise.com**
1. Open Raise.com in new tab
2. Search for the specific card (e.g., "Steam $50")
3. **Key tip:** Sort by "Best Discount" to maximize profit
4. Verify:
   - Card denomination matches reward
   - Card is from verified seller (4+ star rating)
   - Card is digital/instant delivery
5. Click "Buy Now"
6. Complete purchase
7. **Immediately** copy the gift card code + PIN

**c) Deliver to User**
1. Copy gift card code from Raise.com
2. In GG LOOP admin:
   - Click "Fulfill" on the pending reward
   - Paste gift card code
   - Paste PIN (if applicable)
   - Click "Mark as Fulfilled"
3. System automatically emails user with code

**d) Record in Spreadsheet (Optional but Recommended)**
Track in Google Sheets for financial records:
```
Date | User | Reward | Points | Face Value | Cost | Profit
11/29 | user@example.com | Steam $50 | 5000 | $50 | $42 | $8
```

**Time per redemption:** 2-3 minutes

---

## Part 3: Common Gift Cards & Tips

### Where to Find Each Card on Raise.com

| Card Type | Raise.com Search | Typical Discount | Notes |
|-----------|------------------|------------------|-------|
| Steam | "Steam Wallet" | 10-15% | High demand, lower discount |
| Amazon | "Amazon" | 5-10% | Always available |
| PlayStation | "PlayStation Store" | 15-20% | Great margins |
| Xbox | "Xbox Gift Card" | 15-20% | Great margins |
| Visa Prepaid | "Visa Gift Card" | 5-8% | Use for custom amounts |
| Instacart | "Instacart" | 15-20% | Good margins |
| Walmart | "Walmart eGift Card" | 10-15% | Always in stock |

### Pro Tips:
1. **Buy in bulk on Sunday nights** - Better selection
2. **Avoid physical cards** - Only buy digital/instant
3. **Screenshot every code** - Backup in case of disputes
4. **Keep receipts** - For accounting/taxes

---

## Part 4: Edge Cases & Problems

### User Says "Code Doesn't Work"
1. Check if code was entered correctly (common typo)
2. Verify card balance on seller's website
3. If truly invalid:
   - Screenshot the error
   - Contact Raise.com support (they'll refund or replace)
   - Issue user a replacement code ASAP
   - Log incident

### Raise.com is Out of Stock
1. Check alternative platforms:
   - CardCash.com
   - Cardpool.com
   - GiftCardGranny.com (aggregator)
2. If still unavailable, email user:
   - "Your reward is temporarily delayed"
   - Offer alternative card of equal value
   - Or offer to wait 24-48 hours

### Large Redemption (>$100)
1. **Always manually review** before fulfilling
2. Check user's activity patterns
3. Consider:
   - Split into 2 smaller cards (reduce risk)
   - Add 24-hour cooling period
   - Contact user to confirm legitimacy

### User Wants Refund/Exchange
**Policy:** No refunds after code is delivered
- Codes are non-reversible
- Make this clear in ToS
- Exception: If our error (wrong code, invalid code)

---

## Part 5: Financial Tracking

### Daily Close-Out
At end of day, calculate:
```
Total redemptions: X
Total face value: $Y
Total cost: $Z
Profit margin: $(Y - Z)
Average margin %: ((Y - Z) / Y) * 100
```

### Monthly Review
Track in spreadsheet:
- Total redemptions
- Most popular rewards
- Average fulfillment time
- Profit margins by card type
- User satisfaction (support tickets)

**Goal:** 15-20% average margin across all cards

---

## Part 6: When to Automate

**Switch to Tremendous API when:**
- Processing 50+ redemptions/week (too much manual work)
- Margins become less important than time
- Monthly revenue exceeds $5K

**Until then:** Manual fulfillment is the smart move.

---

## Quick Reference Checklist

**Daily Tasks:**
- [ ] Check pending fulfillments (3x/day)
- [ ] Purchase cards on Raise.com
- [ ] Deliver codes to users
- [ ] Update fulfillment status in admin
- [ ] Log in tracking spreadsheet

**Weekly Tasks:**
- [ ] Review fraud alerts
- [ ] Calculate weekly margins
- [ ] Restock commonly needed cards (buy ahead)

**Monthly Tasks:**
- [ ] Financial review (revenue vs costs)
- [ ] Update reward catalog based on demand
- [ ] Review Raise.com alternatives for better margins

---

## Support Contacts

**Raise.com Support:**
- Email: support@raise.com
- Live chat: raise.com/help
- Phone: 1-888-7RAISE1

**When to contact them:**
- Invalid card code
- Card balance dispute
- Bulk purchase pricing
- Technical issues

---

## Appendix: Cost Examples

**Real-world pricing (as of setup):**

| Reward | Face Value | Raise.com Cost | Your Profit | Margin % |
|--------|------------|----------------|-------------|----------|
| Steam $50 | $50 | $43-45 | $5-7 | 10-14% |
| Amazon $100 | $100 | $92-95 | $5-8 | 5-8% |
| PlayStation $50 | $50 | $40-42 | $8-10 | 16-20% |
| Instacart $50 | $50 | $40-43 | $7-10 | 14-20% |

**Buffer needed for 100 users:**
- 20% redemption rate/month = 20 users
- Average redemption = $50
- Total = $1,000/month liability
- Cost via Raise = ~$850
- **Keep $1,000 buffer in account**

---

**Last Updated:** [DATE]  
**Owner:** GG LOOP Admin Team
