# GG LOOP Public Changelog

All notable changes to the GG LOOP platform will be documented in this file.

## [2025-12-13] - Level 9: GG LOOP Passport Launched

### Added
- 🎫 **GG LOOP Passport**: User identity dashboard with stats, badges, and verification history
- 🏆 **Dynamic Badges**: Rookie (0-9K), Veteran (10K+), Champion (25K+), Elite (50K+)
- 📊 **Transparency Dashboard**: Fraud score, trust score, and verification timeline visible to users
- 💬 **Feedback System**: Users can dispute verification decisions
- 🔍 **Verification History**: Complete timeline of proof submissions and verdicts

### Technical Details
- 3 endpoints: GET /passport/stats, GET /passport/history, POST /passport/feedback
- Badge system: Automatic rank assignment based on verified points
- Trust score: Calculated as (100 - fraud score)
- History tracking: Last 20 verification submissions displayed

### User Experience
- Real-time stats: Points, rank, fraud score, rewards claimed, sponsor unlocks
- Visual timeline: Verification history with status indicators
- Dispute mechanism: Submit feedback on verification decisions
- Badge progression: Clear path from Rookie to Elite

---

## [2025-12-13] - Level 8: Brand Marketplace Deployed

### Added
- 🏷️ **Brand Marketplace**: Tiered sponsorship system with 3 sample brands (Razer, Logitech G, HyperX)
- 🎯 **Tiered Unlocks**: Basic (10K), Pro (25K), Elite (50K) point requirements
- 📝 **Brand Signup**: Partner registration form with tier offer builder
- 👨‍💼 **Admin Brand Panel**: Approval/rejection workflow for brand partnerships
- 🔐 **Validation Gating**: Desktop verification + fraud score ≤30 required

### Technical Details
- 7 endpoints: 4 public (GET /brands, POST /signup, GET /:id, POST /unlock) + 3 admin (GET pending, POST approve, POST reject)
- Tier-based filtering: Only shows brands user is eligible for
- Admin approval: All brands require manual review before going live
- Progress tracking: Visual tier unlock progress bars

### Security
- Desktop verification required for tier unlocks
- Fraud score must be ≤30
- Points balance validated for each tier
- Only approved brands visible in marketplace

---

## [2025-12-13] - Level 7: Reward Engine Deployed

### Added
- 🎁 **Reward Catalog**: 8 rewards across 4 categories (2K-20K points)
- 💰 **Claim System**: 3 endpoints (GET /rewards, POST /claim, GET /status)
- 🔐 **Multi-Layer Validation**: Desktop session + points + fraud score ≤30
- 👨‍💼 **Admin Rewards Panel**: Catalog view + claim approval/rejection workflow
- 📝 **Smart Contract Stub**: RewardPayout.sol with Hardhat tests

### Technical Details
- Claim validation: Points balance, desktop verification, fraud score, stock check
- Admin endpoints: GET /admin/rewards, POST approve, POST reject (with points refund)
- Smart contract: storeClaim, fulfillClaim, getClaim functions
- Full gameplay → proof → reward flow operational

### Security
- All claims require verified desktop session
- Fraud score must be ≤30
- Admin approval required for fulfillment
- Points automatically refunded on rejection

---

## [2025-12-13] - Level 6: Desktop Validator Integration

### Added
- 🖥️ **Desktop Verifier App**: 4 modules (SessionTracker, FileVerifier, AppHeartbeat, AuthBridge)
- 🔄 **Backend Sync**: 5 endpoints (session/start, session/end, verification/payload, heartbeat, version)
- 📊 **Verification Scoring**: 0-100 scale based on logs + screenshots
- 🔐 **Device Authentication**: Machine ID hashing for security

### Technical Details
- Game detection: League of Legends, VALORANT, TFT
- File verification: SHA-256 hashing for match logs and screenshots
- Heartbeat system: 30-second pings with 3-miss tolerance
- Cross-platform: Windows and macOS support

### Deployment
- Railway-ready with config files
- Comprehensive README with setup guide
- Environment variables template included

---

## [2025-12-13] - Level 5: Verification Engine Complete

### Added
- 🧠 **6 Verification API Endpoints**: submit-proof, queue, review, stats, bulk-action, fraud-alerts
- 🎨 **4 Admin UI Components**: VerificationDashboard, ProofUploader, AdminReview, FraudAlertBanner
- 📚 **Complete API Documentation**: GG_LOOP_Verification_API_Docs.md with fraud scoring matrix
- 🔐 **Admin Verification System**: Full queue management and review workflow

### Technical Details
- Verification queue with priority sorting (1-4 scale)
- Fraud detection integration (6 detection types, 0-100 risk scoring)
- Bulk action processing for admin efficiency
- Real-time stats and alerts with auto-refresh

### Security
- Admin-only endpoints with middleware protection
- Fraud scoring: Low (0-30), Medium (31-50), High (51-70), Critical (71-100)
- All admin actions logged and auditable

---

## [2025-12-13] - Platform Realignment & Verification System

### Added
- ✅ **Homepage Pricing Section**: Full tier display (Free, Basic $5, Pro $12, Elite $25) with monthly point allocations
- ✅ **Sponsor Gating System**: Access locked behind 10,000+ verified points, desktop app verification, and fraud score ≤30
- ✅ **Points Engine Logic**: New gameplay-based calculation formula with verification multipliers
- ✅ **Discord Transparency Bot**: Railway-ready bot with slash commands (/ggstatus, /roadmap, /tiers, /howitworks)
- ✅ **Sponsor Eligibility API**: Backend endpoint to check user eligibility for sponsor features
- ✅ **Verification Score System**: Desktop app validation hooks for gameplay points

### Changed
- 🔄 **Homepage CTA**: Updated to "Start Earning Rewards" (scrolls to pricing) and "Join the Discord" (new URL)
- 🔄 **Messaging**: Simplified to "Verified gameplay. Real rewards. No fluff."
- 🔄 **Partners Page**: Now shows locked state with requirements for ineligible users

### Technical Details
- **Points Formula**: `basePoints = (minutes_played / 60) * tierMultiplier; bonusPoints = activityScore * engagementMultiplier; finalPoints = (basePoints + bonusPoints) * verificationScoreMultiplier`
- **Tier Multipliers**: Free 1.0x, Basic 1.5x, Pro 2.5x, Elite 4.0x
- **Sponsor Requirements**: 10K+ verified points + desktop verification + fraud ≤30
- **Discord Bot**: Auto-posts to #changelog, #build-log, welcomes new members, logs all activity

### Security
- All sponsor access properly gated behind verification
- Points require desktop app validation (Level 5 pending)
- Fraud detection integrated into eligibility checks
- All rewards locked behind verified points

### Deployment Status
- Frontend: Homepage + sponsor gating deployed
- Backend: Eligibility API + points engine active
- Discord Bot: Railway deployment package ready
- Verification Backend: In progress (Phases 3-7)

---

## [2025-12-11] - Phase 1 Database Schema

### Added
- Database schema extensions for verification system
- New tables: verificationProofs, fraudDetectionLogs, verificationQueue
- Extended matchSubmissions and streamingSessions with verification fields

---

*For detailed technical documentation, see GG_LOOP_Verification_API_Docs.md*
