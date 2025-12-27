# 👀 VISUAL GUIDE - Where to Click

## 🎯 STEP 1: Add Variable to Railway

### **What You'll See:**

```
Railway Dashboard
├── Projects
    └── GG LOOP Project  ← CLICK HERE
        ├── Services
            └── web (or your service name)  ← CLICK HERE
                ├── Deployments tab
                ├── Variables tab  ← CLICK HERE
                ├── Settings tab
                └── Logs tab
```

### **In Variables Tab:**

```
Variables
├── Existing variables (DATABASE_URL, etc.)
└── [+ New Variable] button  ← CLICK HERE
    └── Form appears:
        ├── Variable Name: [type here]  ← Type: VITE_PAYPAL_CLIENT_ID
        ├── Variable Value: [paste here]  ← Paste the long string
        └── [Add] button  ← CLICK HERE
```

---

## 🎯 STEP 2: Check Subscription Page

### **What You Should See:**

```
Subscription Page
├── Header (GG LOOP logo, navigation)
├── "Choose Your Plan" heading
└── Tier Cards (4 columns):
    ├── Free Tier
    │   └── [View Stats Dashboard] button
    ├── Basic Tier ($5/month)
    │   └── [PayPal Button]  ← SHOULD APPEAR HERE ✅
    ├── Pro Tier ($12/month)
    │   └── [PayPal Button]  ← SHOULD APPEAR HERE ✅
    └── Elite Tier ($25/month)
        └── [PayPal Button]  ← SHOULD APPEAR HERE ✅
```

### **PayPal Button Looks Like:**
- Gold/yellow button
- Says "Subscribe" or has PayPal logo
- May show loading spinner first, then button appears

---

## 🎯 STEP 3: Set Up Cron Job

### **What You'll See:**

```
Railway Project
├── Services
│   └── web (your service)
└── [+ New] button  ← CLICK HERE
    └── Dropdown menu:
        ├── Database
        ├── Cron Job  ← CLICK HERE
        └── Other options...
```

### **Cron Job Form:**

```
Create Cron Job
├── Name: [Business Automation Engine]  ← Type this
├── Schedule: [0 * * * *]  ← Type this exactly
├── Command: [npm run automate:business]  ← Type this
├── Service: [Select your service]  ← Choose from dropdown
└── [Create] button  ← CLICK HERE
```

---

## 🎯 STEP 4: Test Payment Flow

### **User Journey:**

```
1. Visit /subscription
   ↓
2. See tier cards with PayPal buttons
   ↓
3. Click PayPal button on desired tier
   ↓
4. Redirected to PayPal checkout
   ↓
5. Log in with PayPal (sandbox account)
   ↓
6. Approve payment
   ↓
7. Redirected back to /subscription/success
   ↓
8. See "Subscription Activated!" message
   ↓
9. Points awarded automatically
   ↓
10. Subscription shows as "active" in admin panel
```

---

## 🔍 HOW TO VERIFY IT'S WORKING

### **Check 1: Variable is Set**
1. Railway → Variables tab
2. Look for `VITE_PAYPAL_CLIENT_ID` in the list
3. ✅ Should be there

### **Check 2: Deployment Succeeded**
1. Railway → Deployments tab
2. Latest deployment should have ✅ green checkmark
3. ✅ Should say "Deployed" or "Active"

### **Check 3: Buttons Appear**
1. Visit https://ggloop.io/subscription
2. Scroll to Basic/Pro/Elite tiers
3. ✅ Should see PayPal buttons at bottom of each card

### **Check 4: Buttons Work**
1. Click a PayPal button
2. Should redirect to PayPal
3. ✅ Should see PayPal checkout page

---

## 🎯 EXACT TEXT TO COPY/PASTE

### **Variable Name:**
```
VITE_PAYPAL_CLIENT_ID
```

### **Variable Value:**
```
AW4YgjL5NXw5TgdDZrQ5vV2Zi0rjqjop913D1xEgRrkhRvGgxyjYrgtQdoR1RF_9V7g6nVaQWKc3Ndpu
```

### **Cron Schedule:**
```
0 * * * *
```

### **Cron Command:**
```
npm run automate:business
```

---

**Copy and paste these exactly as shown!** ✅

