# UI DISCLAIMER INVENTORY
**Where to Add Disclaimers to Avoid Overpromising**

**Last Updated:** December 10, 2025  
**Purpose:** Identify pages that need clearer disclaimers about current limitations

---

## 🔴 HIGH PRIORITY (Needs Disclaimers)

### 1. Subscription Page (`/subscription`)
**Current State:** ✅ FIXED (Level 3 copy updates applied)
- "Early Access Preview" language added
- "Join Waitlist" buttons instead of "Subscribe"
- "Payment integration coming soon" disclaimers added

**Remaining Needs:**
- Consider adding banner at top: "Payment processing in development. Free trials available now."

---

### 2. Shop Page (`/shop`)
**Current State:** ⚠️ PARTIAL
- Has disclaimer: "(Manual fulfillment subject to availability)"
- Redemption toast says "request received"

**Recommended Additions:**
- **Top Banner:** "All rewards processed manually (2-5 business days)"
- **Footer Disclaimer:** "Rewards subject to availability. No guaranteed delivery timelines."
- **Redemption Button Tooltip:** "Manual processing - expect 2-5 days"

---

### 3. Home Page (`/`)
**Current State:** ⚠️ NEEDS REVIEW
- Hero says: "earn points, and redeem rewards"
- No disclaimer about manual fulfillment

**Recommended Additions:**
- **Hero Subtitle:** Add "(Manual fulfillment)" after "redeem rewards"
- **OR:** Change to "request rewards (manual fulfillment)"

---

### 4. Stats/Dashboard Page (`/stats`)
**Current State:** ⚠️ NEEDS REVIEW
- "Redeem Points" button
- No disclaimer about manual process

**Recommended Additions:**
- **Button Text:** Change "Redeem Points" → "Browse Rewards"
- **OR:** Add tooltip: "Manual fulfillment (2-5 days)"

---

## 🟡 MEDIUM PRIORITY (Could Use Disclaimers)

### 5. My Rewards Page (`/my-rewards`)
**Current State:** ⚠️ NEEDS REVIEW
- Shows claimed rewards
- No timeline expectations set

**Recommended Additions:**
- **Status Labels:** "Pending (2-5 days)" for unfulfilled rewards
- **Help Text:** "Rewards are processed manually by our team"

---

### 6. Referrals Page (`/referrals`)
**Current State:** ⚠️ NEEDS REVIEW
- Says "earn rewards for every subscriber you bring"
- Implies subscriptions are live

**Recommended Additions:**
- **Change Copy:** "subscriber" → "member" or "user"
- **Disclaimer:** "Subscription payments coming soon"

---

### 7. Fulfillment Dashboard (`/fulfillment` - Admin Only)
**Current State:** ✅ OK
- Admin-only page
- No user-facing promises

**No Changes Needed**

---

## 🟢 LOW PRIORITY (Acceptable As-Is)

### 8. Login Page (`/login`)
**Current State:** ✅ OK
- No promises made
- Just OAuth buttons

**No Changes Needed**

---

### 9. Terms of Service (`/terms`)
**Current State:** ✅ OK
- Already has legal disclaimers
- Points have no cash value clause

**No Changes Needed**

---

### 10. Privacy Policy (`/privacy`)
**Current State:** ✅ OK
- Standard privacy policy
- No feature promises

**No Changes Needed**

---

## 📋 RECOMMENDED DISCLAIMER TEMPLATES

### Template 1: Payment Integration
```
⚠️ Payment processing is currently in development. Free trials and early access are available now. Paid subscriptions coming Q1 2026.
```

### Template 2: Manual Fulfillment
```
All reward redemptions are processed manually by our team. Please allow 2-5 business days for fulfillment. Rewards subject to availability.
```

### Template 3: Beta Platform
```
GG Loop is currently in beta. Features may change, and some functionality is still in development. Thank you for your patience!
```

### Template 4: Points Disclaimer
```
Points have no cash value and cannot be sold, transferred, or exchanged for money. Points can only be redeemed for rewards in our catalog, subject to availability.
```

---

## 🎯 IMPLEMENTATION PRIORITY

**Immediate (Level 3.5):**
- ✅ Subscription page copy (DONE)
- Shop page banner
- Home page hero disclaimer

**Next Sprint (Level 4):**
- Stats page button text
- My Rewards status labels
- Referrals page copy fix

**Future:**
- Consider global disclaimer banner for beta status
- Add FAQ page with common questions about fulfillment

---

## 🚨 CRITICAL RULE

**Never promise:**
- Instant delivery
- Guaranteed availability
- Automated fulfillment
- Live subscription payments (until backend is ready)
- Cash value for points

**Always clarify:**
- Manual processing timelines (2-5 days)
- Subject to availability
- Beta platform status
- No payment required for trials
