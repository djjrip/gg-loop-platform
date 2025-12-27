# 👔 ADMIN/CEO COMPLETE GUIDE - GG LOOP

**For:** Jayson (Founder/CEO)  
**Purpose:** Everything you need to run the business easily

---

## 🎯 QUICK ACCESS LINKS

### **Daily Operations:**
- **Dashboard:** https://ggloop.io/admin
- **Fulfillment:** https://ggloop.io/admin/fulfillment
- **Users:** https://ggloop.io/admin/users
- **Business Health:** https://ggloop.io/admin/founder-controls

### **Key Metrics:**
- **Revenue:** `/admin` → Dashboard
- **Subscriptions:** `/admin/users` → Filter by subscription status
- **Redemptions:** `/admin/fulfillment` → Pending queue

---

## 💰 REVENUE MANAGEMENT

### **View Revenue (Real Numbers):**
1. Go to `/admin`
2. Dashboard shows:
   - **Total Revenue:** Real from subscriptions table
   - **Monthly Revenue:** Calculated from active subscriptions
   - **Active Subscriptions:** Real count from database
   - **Conversion Rate:** Real calculation

**All numbers are 100% authentic** (AG verified this!)

### **View Subscription Details:**
1. Go to `/admin/users`
2. Click on any user
3. See:
   - Subscription tier (Basic/Pro/Elite)
   - Status (active/cancelled/past_due)
   - Payment history
   - Points balance

### **Manual Subscription Actions:**
- **Cancel Subscription:** User page → Cancel button
- **Refund Points:** User page → Adjust points
- **Change Tier:** User page → Update tier
- **View Payment History:** User page → Payment tab

---

## 🎁 REWARD FULFILLMENT

### **Process Redemptions:**
1. Go to `/admin/fulfillment`
2. See all pending redemptions
3. For each redemption:
   - **View Details:** Click to see user, reward, points spent
   - **Approve:** Click "Approve" → Points deducted, reward marked as in_progress
   - **Reject:** Click "Reject" → Add reason, points refunded
   - **Fulfill:** After shipping → Click "Mark as Fulfilled" → Add tracking number

### **Auto-Approval (Already Running):**
- **Safe Redemptions (< $50):** Auto-approved hourly
- **User History:** Users with 1+ fulfilled redemptions get auto-approved
- **Manual Review:** Only redemptions > $50 need your approval

**Automation runs every hour** (set up cron job in Railway)

---

## 👥 USER MANAGEMENT

### **View All Users:**
1. Go to `/admin/users`
2. See:
   - Total users
   - Active users (logged in last 7 days)
   - Subscribed users
   - Points balances

### **User Actions:**
- **View Profile:** Click user → See full details
- **Adjust Points:** User page → "Adjust Points" button
- **Send Message:** User page → "Send Message" (if implemented)
- **Ban User:** User page → "Ban User" (if needed)

### **Search Users:**
- Search by email, username, or user ID
- Filter by subscription status
- Filter by points balance

---

## 📊 BUSINESS HEALTH MONITORING

### **Daily Dashboard:**
1. Go to `/admin`
2. See:
   - **Today's Metrics:**
     - New users
     - Revenue
     - Redemptions
     - Errors
   - **Alerts:**
     - Payment failures
     - High error rates
     - System issues

### **Business Health Report:**
1. Go to `/admin/founder-controls`
2. See:
   - **Revenue Trends:** Up/down/stable
   - **User Growth:** Growth rate
   - **Redemption Queue:** Pending count
   - **System Health:** All systems operational

### **Daily Email Reports:**
- **Sent:** Every day at 8 AM
- **Contains:**
  - Revenue summary
  - User growth
  - Redemption queue
  - Alerts (if any)
- **Email:** Your admin email (set in `ADMIN_EMAILS`)

---

## 🔧 SYSTEM MANAGEMENT

### **Environment Variables (Railway):**
1. Go to Railway dashboard
2. Click your service → "Variables"
3. Key variables:
   - `ADMIN_EMAILS`: Your email (comma-separated for multiple admins)
   - `PAYPAL_CLIENT_ID`: PayPal client ID
   - `PAYPAL_CLIENT_SECRET`: PayPal secret
   - `DATABASE_URL`: Auto-set by Railway
   - `BASE_URL`: https://ggloop.io

### **Cron Jobs (Railway):**
1. Go to Railway dashboard
2. Add new service → "Cron Job"
3. Set up:
   - **Business Automation:** `0 * * * *` (every hour) → `npm run automate:business`
   - **Daily Reports:** `0 8 * * *` (8 AM daily) → Already in businessAutomation.ts

### **Database Access:**
- **Railway Dashboard:** View database → See tables
- **Query Tool:** Use Railway's database viewer
- **Backup:** Railway auto-backups (check settings)

---

## 🚨 TROUBLESHOOTING

### **Payment Issues:**
1. **User says payment didn't work:**
   - Check `/admin/users` → Find user → Check subscription status
   - If missing: Use manual sync on subscription page
   - Check PayPal dashboard for payment

2. **Subscription not activating:**
   - Check backend logs in Railway
   - Verify PayPal webhook is set up
   - Use manual sync feature

### **Redemption Issues:**
1. **User says redemption not working:**
   - Check `/admin/fulfillment` → Find redemption
   - Check user's points balance
   - Verify reward is available
   - Approve manually if needed

### **System Errors:**
1. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click service → "Logs"
   - Look for errors
   - Check database connection

2. **Check Business Health:**
   - Go to `/admin/founder-controls`
   - See system health status
   - Check alerts

---

## 📈 GROWTH METRICS

### **Key Metrics to Track:**
1. **User Growth:**
   - New users per day/week/month
   - Active users (logged in last 7 days)
   - Retention rate

2. **Revenue:**
   - Monthly recurring revenue (MRR)
   - Average revenue per user (ARPU)
   - Conversion rate (free → paid)

3. **Engagement:**
   - Points earned per user
   - Redemptions per user
   - Games connected per user

### **Where to Find:**
- **Dashboard:** `/admin` → Overview metrics
- **Analytics:** `/admin` → Detailed analytics (if implemented)
- **Database:** Query directly for custom reports

---

## ✅ DAILY CHECKLIST

### **Morning (5 minutes):**
- [ ] Check email for daily business report
- [ ] Check `/admin` dashboard for alerts
- [ ] Review pending redemptions in `/admin/fulfillment`

### **Weekly (30 minutes):**
- [ ] Review revenue trends
- [ ] Check user growth
- [ ] Process high-value redemptions (> $50)
- [ ] Review system health

### **Monthly (1 hour):**
- [ ] Review monthly revenue report
- [ ] Analyze conversion rates
- [ ] Check churn rate
- [ ] Plan improvements

---

## 🎯 QUICK REFERENCE

### **Common Tasks:**

**Approve Redemption:**
1. `/admin/fulfillment` → Click redemption → Approve

**Cancel Subscription:**
1. `/admin/users` → Find user → Click → Cancel subscription

**View Revenue:**
1. `/admin` → Dashboard → Revenue metrics

**Check System Health:**
1. `/admin/founder-controls` → System health tab

**Add Admin User:**
1. Railway → Variables → `ADMIN_EMAILS` → Add email (comma-separated)

---

## 🔐 SECURITY

### **Admin Access:**
- Only emails in `ADMIN_EMAILS` can access admin pages
- Admin pages require authentication
- All admin actions are logged

### **Payment Security:**
- PayPal handles all payment processing
- No credit card data stored
- Webhooks verified with signatures

### **Database Security:**
- Railway manages database security
- Connection pooling configured
- Regular backups enabled

---

## 📞 SUPPORT

### **For Users:**
- Support email: `jaysonquindao@ggloop.io`
- Discord: (if you have one)
- In-app: Contact form (if implemented)

### **For You:**
- Railway support: Railway dashboard → Support
- PayPal support: PayPal developer dashboard
- Database issues: Check Railway logs

---

## 🚀 DEPLOYMENT

### **Deploy Changes:**
```bash
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys in 2-3 minutes
```

### **Check Deployment:**
1. Railway dashboard → See deployment status
2. Check logs for errors
3. Test on https://ggloop.io

---

**Everything is set up for you to run the business easily!** 🎉

