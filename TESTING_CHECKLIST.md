# ✅ Pre-Launch Testing Checklist

## 🎯 Core Functionality Tests

### Authentication & User Management
- [ ] **Discord Login**
  - Visit `/login`
  - Click "Sign in with Discord"
  - Verify redirect to Discord OAuth
  - Verify successful login and redirect back
  - Check user profile is created in database
  
- [ ] **Session Persistence**
  - Login and refresh the page
  - Verify user stays logged in
  - Check session in browser cookies
  
- [ ] **User Profile**
  - Visit `/profile/[your-user-id]`
  - Verify profile information displays
  - Check points balance
  - Verify stats are visible

### Database Connectivity
- [ ] **PostgreSQL Connection**
  - Check Railway logs for "🐘 Using PostgreSQL database"
  - Verify no database connection errors
  - Check users table exists
  
- [ ] **Schema Migration**
  - Verify `npm run db:push` completed in deployment logs
  - Check all tables created successfully
  - No migration errors

### API Endpoints
- [ ] **GET /api/user**
  - Should return current user when logged in
  - Should return 401 when not logged in
  
- [ ] **GET /api/games**
  - Should return list of available games
  - Should include League of Legends, Valorant, TFT, etc.
  
- [ ] **GET /api/rewards**
  - Should return list of available rewards
  - Check reward tier and points display correctly

### Frontend Rendering
- [ ] **Homepage** (`/`)
  - Hero section loads
  - Navigation header works
  - Footer displays
  - No console errors
  
- [ ] **Public Pages**
  - `/about` - About page loads
  - `/partners` - Partners page loads
  - `/shop` - Shop/Rewards page loads
  - `/terms` - Terms page loads
  - `/privacy` - Privacy page loads
  
- [ ] **Authenticated Pages** (requires login)
  - `/stats` - Stats dashboard loads
  - `/settings` - User settings loads
  - `/my-rewards` - Rewards history loads
  - `/referrals` - Referral program loads

## 🔐 Security Tests

### Environment Variables
- [ ] `DATABASE_URL` is set correctly
- [ ] `SESSION_SECRET` is set and secure
- [ ] `RIOT_API_KEY` is set
- [ ] OAuth credentials set (Discord, Google, Twitch)
- [ ] `BASE_URL` matches your domain
- [ ] No secrets exposed in client-side code

### HTTPS & SSL
- [ ] Site loads over HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate is valid
- [ ] Redirects from HTTP to HTTPS work

## 🎮 Game Integration Tests

### Riot Games API
- [ ] **Account Linking**
  - Go to `/settings`
  - Link Riot account
  - Verify account name appears
  
- [ ] **Match Detection**
  - Play a League of Legends match
  - Wait for match sync (5-10 minutes)
  - Verify match appears in stats
  - Check points were awarded

### Twitch Integration (if configured)
- [ ] Connect Twitch account
- [ ] Verify streaming sessions tracked
- [ ] Check bonus points for streaming

## 💰 Points & Rewards System

### Points Earning
- [ ] **Founder Bonus**
  - New users (first 100) get 1,000 bonus points
  - Verify founder number assigned correctly
  
- [ ] **Match Points**
  - Play a match
  - Verify points awarded
  - Check point transaction history
  
- [ ] **Achievement Points**
  - Complete an achievement
  - Verify achievement unlocked
  - Check bonus points awarded

### Rewards Redemption
- [ ] Browse rewards in `/shop`
- [ ] Verify point costs display correctly
- [ ] Test reward redemption (if enough points)
- [ ] Check reward appears in `/my-rewards`
- [ ] Verify points deducted from balance

## 📊 Admin & Management

### Daily Operations (`/admin/daily-ops`)
- [ ] Daily checklist loads
- [ ] Can check/uncheck items
- [ ] Metrics display correctly
- [ ] Founder count accurate

### Fulfillment Dashboard
- [ ] Pending rewards show up
- [ ] Can mark rewards as fulfilled
- [ ] Founder rewards prioritized

## 🌐 Performance Tests

### Page Load Times
- [ ] Homepage loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] No excessive loading spinners

### API Response Times
- [ ] `/api/user` responds in < 500ms
- [ ] `/api/games` responds in < 500ms
- [ ] `/api/leaderboard` responds in < 1s

## 📱 Responsive Design

### Mobile Testing
- [ ] Open site on mobile device
- [ ] Navigation menu works
- [ ] Forms are usable
- [ ] Images load properly
- [ ] No horizontal scroll

### Desktop Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (if Mac)
- [ ] Test on Edge

## 🐛 Error Handling

### Expected Errors
- [ ] 404 page works for invalid routes
- [ ] Unauthorized access redirects to login
- [ ] Form validation shows errors
- [ ] Network errors show user-friendly messages

### Railway Logs
- [ ] No critical errors in logs
- [ ] Database queries executing
- [ ] Auth flow working
- [ ] API requests logged

## 🚀 Deployment Verification

### Railway Dashboard
- [ ] Build completed successfully
- [ ] No deployment errors
- [ ] Service is running
- [ ] Custom domain connected

### Domain Configuration
- [ ] `ggloop.io` resolves to Railway app
- [ ] `www.ggloop.io` redirects to `ggloop.io`
- [ ] SSL certificate active
- [ ] DNS propagation complete

### Environment
- [ ] `NODE_ENV=production`
- [ ] Database connected to PostgreSQL
- [ ] Session store working
- [ ] OAuth callbacks pointing to correct domain

## ✅ Pre-Launch Readiness

### Critical (Must Fix Before Launch)
- [ ] No critical security issues
- [ ] Database working properly
- [ ] User authentication working
- [ ] Points system functional
- [ ] No major bugs or errors

### Important (Should Fix Before Launch)
- [ ] All OAuth providers configured
- [ ] Rewards system tested
- [ ] Admin dashboard accessible
- [ ] Mobile experience good
- [ ] Performance acceptable

### Nice to Have (Can Fix After Launch)
- [ ] All analytics tracking
- [ ] Email notifications
- [ ] Advanced features
- [ ] Minor UI polish

## 📝 Notes

**Testing Date:** _____________

**Tested By:** _____________

**Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Critical Blockers:**
- [ ] None
- [ ] List here: _____________________________

**Ready for Launch:** [ ] YES [ ] NO

---

## Quick Test Commands

### Check Health Endpoint
```bash
curl https://ggloop.io/api/health
```

### Check User API
```bash
curl https://ggloop.io/api/user -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Check Games API
```bash
curl https://ggloop.io/api/games
```

### Monitor Railway Logs
1. Go to Railway dashboard
2. Click on your service
3. Click "Logs" tab
4. Watch for errors

---

**Remember:** Test everything twice - once on Railway's URL, once on your custom domain!
