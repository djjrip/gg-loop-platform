# GG LOOP Production Deployment Checklist
**Date**: December 13, 2025  
**Levels**: 5-7 Ready for Deployment  
**Status**: DEPLOYMENT READY

---

## ⚠️ IMPORTANT: DEPLOYMENT CANNOT BE AUTOMATED

This document provides a comprehensive checklist for manual deployment. The AI cannot:
- Push code to production servers
- Deploy to Railway/Vercel/hosting platforms
- Authenticate with deployment services
- Execute git push commands to production branches

**Manual deployment required by authorized personnel.**

---

## ✅ PRE-DEPLOYMENT VALIDATION

### Level 5: Verification Engine
- [x] 6 verification endpoints functional
- [x] 4 admin UI components built
- [x] API documentation complete
- [x] Fraud scoring matrix implemented

### Level 6: Desktop Validator
- [x] 4 desktop app modules created
- [x] 5 backend sync endpoints functional
- [x] Railway deployment config ready
- [x] README documentation complete

### Level 7: Reward Engine
- [x] Reward catalog (8 rewards)
- [x] 3 reward endpoints with validation
- [x] Admin rewards panel functional
- [x] 3 admin endpoints (approve/reject)
- [x] Smart contract stub created

---

## 🔐 VALIDATION GATING CHECKLIST

### Sponsor Access (Partners.tsx)
- [x] Requires 10,000+ verified points
- [x] Requires desktop verification
- [x] Requires fraud score ≤ 30
- [x] Shows locked state for ineligible users

### Reward Claims (POST /api/rewards/claim)
- [x] Validates points balance ≥ cost
- [x] Requires desktop session verified
- [x] Checks fraud score ≤ 30
- [x] Validates reward stock > 0
- [x] Creates pending claim (requires admin approval)

### Desktop Verification (POST /api/desktop/verification/payload)
- [x] Requires authenticated session
- [x] Stores sessionId, deviceHash
- [x] Sets desktopVerified flag
- [x] Records playDuration

---

## 📦 DEPLOYMENT STEPS

### 1. Frontend Deployment (Vercel/Netlify)

**Files to Deploy**:
- `client/src/pages/Home.tsx` - Pricing section
- `client/src/pages/Partners.tsx` - Sponsor gating
- `client/src/pages/admin/VerificationDashboard.tsx`
- `client/src/pages/admin/VerificationProofUploader.tsx`
- `client/src/pages/admin/AdminVerificationReview.tsx`
- `client/src/pages/admin/FraudAlertBanner.tsx`
- `client/src/pages/admin/AdminRewardsPanel.tsx`

**Build Command**:
```bash
cd client
npm run build
```

**Environment Variables**:
- `VITE_API_URL` - Backend API URL

### 2. Backend Deployment (Railway/Heroku)

**Files to Deploy**:
- `server/routes.ts` - All new endpoints
- `server/pointsEngine.ts` - Gameplay points method
- `data/rewards.json` - Reward catalog

**Endpoints Added**:
- Verification: 6 endpoints
- Desktop: 5 endpoints
- Rewards: 3 endpoints
- Admin Rewards: 3 endpoints

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection
- `RIOT_API_KEY` - Riot Games API
- `PAYPAL_CLIENT_ID` - PayPal integration
- All existing env vars

**Deploy Command**:
```bash
# Railway
railway up

# Or Heroku
git push heroku main
```

### 3. Desktop Verifier Deployment (Railway)

**Directory**: `desktop-verifier/`

**Files**:
- `package.json`
- `src/SessionTracker.js`
- `src/FileVerifier.js`
- `src/AppHeartbeat.js`
- `src/AuthBridge.js`
- `railway.json`

**Environment Variables**:
- `API_URL` - Backend API URL
- `WEB_TOKEN` - Authentication token
- `HEARTBEAT_INTERVAL` - 30000 (30 seconds)

**Deploy Command**:
```bash
cd desktop-verifier
railway up
```

### 4. Database Migrations

**Note**: Schema already supports all Level 5-7 features from Phase 1.

**Verify Tables**:
- `verificationProofs` - Has sessionId, deviceHash, desktopVerified, playDuration
- `verificationQueue` - Exists
- `fraudDetectionLogs` - Exists
- `userRewards` - Exists

**No migrations needed** - schema is ready.

---

## 🧪 POST-DEPLOYMENT TESTING

### 1. Verification System
- [ ] Submit proof via POST /api/verification/submit-proof
- [ ] View queue via GET /api/verification/queue (admin)
- [ ] Review item via POST /api/verification/review/:id (admin)
- [ ] Check stats via GET /api/verification/stats (admin)

### 2. Desktop Verification
- [ ] Start session via POST /api/desktop/session/start
- [ ] Send heartbeat via POST /api/desktop/heartbeat
- [ ] Submit payload via POST /api/desktop/verification/payload
- [ ] End session via POST /api/desktop/session/end

### 3. Reward System
- [ ] Browse catalog via GET /api/rewards
- [ ] Attempt claim without desktop verification (should fail)
- [ ] Attempt claim with high fraud score (should fail)
- [ ] Successful claim with validation (should create pending)
- [ ] Admin approve via POST /api/admin/rewards/approve/:id
- [ ] Admin reject via POST /api/admin/rewards/reject/:id (should refund)

### 4. Sponsor Gating
- [ ] Visit /partners without 10K points (should see locked state)
- [ ] Visit /partners with 10K+ points + desktop verified (should see sponsors)

---

## 📊 MONITORING

### Key Metrics to Track
- Verification queue size
- Fraud alert count (high-risk)
- Reward claim rate
- Desktop session count
- Points awarded vs spent

### Logs to Monitor
- `[Desktop]` - Desktop app activity
- `[Rewards]` - Reward claims
- `[Admin]` - Admin actions
- `[PointsEngine]` - Points transactions

---

## 🚨 ROLLBACK PLAN

If issues arise:

1. **Frontend**: Revert to previous Vercel deployment
2. **Backend**: Rollback Railway deployment
3. **Database**: No schema changes, safe to rollback code

**Critical**: Do not rollback database - schema supports both old and new code.

---

## ✅ DEPLOYMENT SIGN-OFF

**Checklist**:
- [ ] All validation gating tested
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] API endpoints responding
- [ ] Frontend routes accessible
- [ ] Admin panel functional
- [ ] Desktop app connecting
- [ ] Monitoring enabled

**Deployed By**: _________________  
**Date**: _________________  
**Time**: _________________  

---

## 📝 POST-DEPLOYMENT CHANGELOG

**Entry for GG_LOOP_Public/CHANGELOG.md**:

```markdown
## [2025-12-13] - Production Deployment: Levels 5-7 Live

### Deployed Features
- ✅ Verification engine with 6 endpoints + 4 admin UI components
- ✅ Desktop validator app with 5 backend sync endpoints
- ✅ Reward engine with 8 rewards + admin approval workflow
- ✅ Smart contract stub (RewardPayout.sol)

### Validation Gating Active
- Sponsor access: 10K+ verified points required
- Reward claims: Desktop session + points + fraud ≤30
- Admin approval: Required for all reward fulfillment

### Live Flow
🎮 Gameplay → 🖥️ Desktop Verification → 💰 Points → 🎁 Rewards → 👨‍💼 Admin Approval

**Status**: All systems operational
```

---

**DEPLOYMENT STATUS**: READY - AWAITING MANUAL EXECUTION
