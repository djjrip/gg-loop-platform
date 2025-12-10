# COPY AUDIT - LEVEL 3
**Overpromising Text & Suggested Safer Alternatives**

**Audit Date:** December 10, 2025  
**Purpose:** Identify frontend copy that incorrectly implies live features we don't have yet

---

## 🚨 HIGH PRIORITY: Payment/Subscription Copy

### 1. Subscription Page - Free Trial Card
**File:** `client/src/pages/Subscription.tsx`  
**Lines:** 464-552

**Problematic Text:**
```tsx
"Start Your Free Trial"
"7 Days Free"
"Try GG Loop risk-free. No credit card required."
"Start 7-Day Free Trial" (button text)
```

**Issue:** Implies users can immediately start a paid subscription with a free trial, but PayPal checkout is disabled.

**Suggested Alternative:**
```tsx
"Early Access Preview"
"7 Days Free (Founders Only)"
"Experience GG Loop features. Payment integration coming soon."
"Request Early Access" (button text)
```

---

### 2. Subscription Page - Tier Cards
**File:** `client/src/pages/Subscription.tsx`  
**Lines:** 610-800

**Problematic Text:**
```tsx
"Log in to Subscribe" (button)
"Subscribe" (button)
"7-day free trial, then $12/month"
"3-day free trial, then $25/month"
```

**Issue:** Buttons say "Subscribe" but PayPal is disabled. Users will see "Coming Soon" message, creating confusion.

**Suggested Alternative:**
```tsx
"Join Waitlist" (button)
"Request Access" (button)
"Early access preview - payment integration in development"
```

---

### 3. Subscription Page - Trial Active Card
**File:** `client/src/pages/Subscription.tsx`  
**Lines:** 556-607

**Problematic Text:**
```tsx
"Subscribe before your trial ends to keep your points and continue earning rewards!"
```

**Issue:** Implies users can subscribe, but they can't (PayPal disabled).

**Suggested Alternative:**
```tsx
"Payment integration coming soon. Your trial progress is saved - you'll be able to subscribe when we launch!"
```

---

## ⚠️ MEDIUM PRIORITY: Rewards/Redemption Copy

### 4. Shop Page - Header
**File:** `client/src/pages/Shop.tsx`  
**Line:** 116

**Problematic Text:**
```tsx
"Redeem your points for gift cards and rewards (Manual fulfillment subject to availability)"
```

**Issue:** "Manual fulfillment subject to availability" is buried in parentheses. Users may expect instant delivery.

**Suggested Alternative:**
```tsx
"Browse rewards catalog - Redemptions processed manually by our team (2-5 business days)"
```

---

### 5. Shop Page - Redemption Toast
**File:** `client/src/pages/Shop.tsx`  
**Lines:** 68-72

**Problematic Text:**
```tsx
title: "Reward Redeemed!",
description: "Your request has been received. We will process it shortly and email you the details."
```

**Issue:** "Redeemed" implies completion. "Shortly" is vague.

**Suggested Alternative:**
```tsx
title: "Redemption Request Submitted",
description: "Our team will process your request within 2-5 business days. You'll receive an email with fulfillment details."
```

---

### 6. Home Page - Hero Subtitle
**File:** `client/src/pages/Home.tsx`  
**Line:** 78

**Problematic Text:**
```tsx
"The gaming rewards platform built for the culture. Join the community, earn points, and redeem rewards."
```

**Issue:** "redeem rewards" implies instant, automated redemption.

**Suggested Alternative:**
```tsx
"The gaming rewards platform built for the culture. Join the community, earn points, and request rewards (manual fulfillment)."
```

---

### 7. Stats Page - Redeem Points Button
**File:** `client/src/pages/Stats.tsx`  
**Lines:** 137-139

**Problematic Text:**
```tsx
<Button size="lg" data-testid="button-redeem-points">
  Redeem Points
</Button>
```

**Issue:** "Redeem" implies instant action.

**Suggested Alternative:**
```tsx
<Button size="lg" data-testid="button-browse-rewards">
  Browse Rewards
</Button>
```

---

## ℹ️ LOW PRIORITY: Informational Copy

### 8. Subscription Page - Feature Lists
**File:** `client/src/pages/Subscription.tsx`  
**Lines:** 192, 237

**Problematic Text:**
```tsx
"Start redeeming rewards (Manual fulfillment)"
"Access rewards catalog - redeem rewards (Subject to availability)"
```

**Issue:** Inconsistent disclaimers. Some say "manual fulfillment", some say "subject to availability".

**Suggested Alternative:**
Standardize to:
```tsx
"Access rewards catalog (Manual fulfillment, 2-5 business days)"
```

---

### 9. Referrals Page
**File:** `client/src/pages/Referrals.tsx`  
**Line:** 119

**Problematic Text:**
```tsx
"Invite friends and earn rewards for every subscriber you bring"
```

**Issue:** "subscriber" implies paid subscriptions are live.

**Suggested Alternative:**
```tsx
"Invite friends and earn rewards for every member you bring"
```

---

## 📊 SUMMARY OF FINDINGS

**Total Issues Found:** 9  
**High Priority (Payment/Subscription):** 3  
**Medium Priority (Rewards/Redemption):** 4  
**Low Priority (Informational):** 2  

**Common Patterns:**
1. **"Subscribe" language** when PayPal is disabled
2. **"Redeem" implies instant** when it's manual (2-5 days)
3. **Vague timelines** ("shortly", "soon") instead of specific SLAs
4. **Inconsistent disclaimers** across pages

**Recommended Global Changes:**
1. Replace "Subscribe" buttons with "Join Waitlist" or "Request Access"
2. Replace "Redeem" with "Request Reward" or "Browse Rewards"
3. Add consistent disclaimer: "(Manual fulfillment, 2-5 business days)"
4. Remove free trial language until PayPal is live

---

## ⚠️ IMPORTANT NOTE

**DO NOT apply these changes automatically.** This audit is for review only. The CEO will decide which changes to implement and when. Some copy may be intentionally aspirational for marketing purposes.
