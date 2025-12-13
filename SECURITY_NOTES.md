# GG Loop Security Documentation

## Payment Security

### PayPal Integration

**Current Implementation:**
- PayPal subscriptions use a **redirect-based approval flow** where users are redirected to PayPal for payment
- After approval, the frontend calls `/api/paypal/subscription-approved` with the `subscriptionId`
- The server **verifies the subscription directly with PayPal API** using the official PayPal SDK
- This verification ensures the subscription is valid and active before awarding points

**Security Measures:**
1. **Direct API Verification**: Every subscription is verified by calling PayPal's API to confirm:
   - Subscription exists
   - Subscription status is ACTIVE or APPROVED
   - Plan ID matches expected tier
   
2. **Environment-Driven Configuration**: 
   - PayPal plan IDs are configurable via environment variables (`PAYPAL_BASIC_PLAN_ID`, `PAYPAL_PRO_PLAN_ID`, `PAYPAL_ELITE_PLAN_ID`)
   - Falls back to sandbox IDs for testing
   - Supports production/sandbox environments via `NODE_ENV`

3. **Subscription Lifecycle Logging**:
   - All subscription events (creation, updates, cancellations) are logged to `subscriptionEvents` table
   - Provides audit trail for compliance and debugging

**Production Recommendation:**
For production at scale, consider implementing **PayPal Webhooks** with signature validation for:
- Automatic subscription renewal notifications
- Subscription cancellation events
- Payment failure notifications
- Reduced API calls (webhooks push events vs. polling)

PayPal webhook signature validation should use `PAYPAL_WEBHOOK_ID` and verify signatures using PayPal's SDK.

### Stripe Integration

**Current Implementation:**
- Stripe webhooks use **full signature verification** (line 1777 in routes.ts)
- Uses `STRIPE_WEBHOOK_SECRET` to validate webhook signatures
- Events are deduplicated using `stripeEventId` to prevent double processing

**Security Measures:**
1. Webhook signature verification prevents forged events
2. Idempotency checks prevent duplicate processing
3. Full lifecycle event logging

## Authentication & Authorization

### Admin Access Control

**Implementation:**
- Admin routes protected by `adminMiddleware` (60+ lines in server/routes.ts)
- Email-based access control using `ADMIN_EMAILS` environment variable
- Comma-separated list of authorized admin emails

**Protected Endpoints:**
- `/api/admin/pending-rewards` - View pending fulfillments
- `/api/admin/rewards/fulfill` - Mark rewards as fulfilled
- `/api/admin/rewards/tracking` - Add tracking numbers
- `/api/admin/sponsors/*` - Sponsor management
- All admin endpoints verified: ✅

### Multi-Provider OAuth

**Supported Providers:**
- Discord OAuth
- Twitch OAuth
- Google OAuth
- Riot Games OAuth (pending production approval)
- Replit Auth (OIDC)
- Guest accounts (session-based)

**CSRF Protection:**
All OAuth flows use `state` parameter for CSRF protection (verified in oauth.ts and twitchAuth.ts)

## Input Validation

### Server-Side Validation

**All user inputs validated using Zod schemas:**
- Request body validation on all POST/PATCH endpoints
- Schema definitions in `@shared/schema.ts`
- Insert schemas use `createInsertSchema` from drizzle-zod

### SQL Injection Protection

**Drizzle ORM provides automatic parameterization:**
- All queries use Drizzle ORM with neon-serverless
- Values sent separately from SQL commands
- No raw SQL queries without parameterization

### Shipping Address Validation

**Enhanced validation for physical rewards:**
```typescript
// Checks for:
- Non-empty fields (trim whitespace)
- Minimum lengths: 5 chars (address), 2 chars (city/state), 3 chars (ZIP)
- Prevents placeholder/test data
- Clear error messages showing missing fields
```

## Rate Limiting

### Riot API Rate Limiting

**Current Implementation:**
- In-memory rate limiter in `server/lib/riot.ts`
- Enforces Riot's rate limits: requests per second and per 2 minutes
- `waitForSlot()` method queues requests when limit reached

**Production Scaling Note:**
For horizontal scaling (multiple server instances), upgrade to distributed rate limiting using Redis (e.g., @fightmegg/riot-rate-limiter)

### Webhook Rate Limiting

**Gaming webhooks use HMAC-SHA256 validation:**
- `createWebhookSignatureMiddleware` in webhookSecurity.ts
- Validates webhook signatures using partner secret keys
- Prevents unauthorized webhook calls

## Points System Integrity

### Transaction Safety

**All points operations are transactional:**
- Points Engine uses database transactions
- Deduction and addition operations are atomic
- Balance updates are consistent

### Match Sync Deduplication

**Race condition prevention:**
- `processedRiotMatches` table tracks all synced matches
- Matches checked against this table before recording (lines 89-98, 151-159, 202-210 in matchSyncService.ts)
- **Note**: Match sync only tracks stats, does NOT award points (lines 122, 186, 237)
- Points awarded monthly via subscription tier, not per-match

### Webhook Deduplication

**External gaming webhooks use idempotency:**
- `externalEventId` checked before processing (line 1939 in routes.ts)
- Events deduplicated to prevent double-awarding
- Event status tracked (pending → processed → failed)

## Environment Variables

### Required for Production

**Payment Processing:**
- `PAYPAL_CLIENT_ID` - PayPal production client ID
- `PAYPAL_CLIENT_SECRET` - PayPal production secret
- `PAYPAL_BASIC_PLAN_ID` - Basic tier plan ID
- `PAYPAL_PRO_PLAN_ID` - Pro tier plan ID  
- `PAYPAL_ELITE_PLAN_ID` - Elite tier plan ID
- `STRIPE_SECRET_KEY` - Stripe API key (optional, PayPal primary)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature validation

**Admin Access:**
- `ADMIN_EMAILS` - Comma-separated list of admin emails

**Gaming APIs:**
- `RIOT_API_KEY` - Riot Games API key (renew before Nov 14, 2025)

**Session Security:**
- `SESSION_SECRET` - Session encryption secret (generate random 32+ char string)

**Deployment:**
- `BASE_URL` - Production base URL
- `NODE_ENV=production` - Enables production PayPal environment

## Security Checklist for Launch

### ✅ Completed Security Hardening
- [x] All admin endpoints protected with adminMiddleware (14 endpoints verified)
- [x] PayPal plan IDs production-safe with environment enforcement
  - Production requires PAYPAL_BASIC_PLAN_ID, PAYPAL_PRO_PLAN_ID, PAYPAL_ELITE_PLAN_ID
  - Rejects unrecognized plan IDs (prevents sandbox ID misuse in production)
  - Development mode has safe sandbox fallbacks
- [x] Comprehensive shipping address validation
  - Regex validation for US/CA/UK postal codes
  - Prevents purely numeric addresses and cities
  - Country-aware validation with clear error messages
- [x] Subscription event logging idempotent and complete
  - Stable event IDs for deduplication (not timestamp-based)
  - Failure path logging (verification_failed, processing_failed, cancel_failed)
  - Early return for duplicate requests via `storage.checkEventProcessed()`
- [x] CSRF protection on OAuth flows (state parameter)
- [x] SQL injection protection via Drizzle ORM
- [x] Input validation with Zod schemas on all POST/PATCH endpoints
- [x] Points system transaction safety (atomic operations)
- [x] Webhook signature validation (Stripe HMAC, Gaming webhooks HMAC-SHA256)
- [x] Match sync deduplication (processedRiotMatches table)

### 🚀 Pre-Launch Configuration Requirements

**CRITICAL - Must Set Before Production:**
1. **PayPal Configuration:**
   - `PAYPAL_CLIENT_ID` - Production client ID
   - `PAYPAL_CLIENT_SECRET` - Production secret
   - `PAYPAL_BASIC_PLAN_ID` - Basic tier production plan ID
   - `PAYPAL_PRO_PLAN_ID` - Pro tier production plan ID
   - `PAYPAL_ELITE_PLAN_ID` - Elite tier production plan ID

2. **Admin Access:**
   - `ADMIN_EMAILS` - Comma-separated list (e.g., "admin@example.com,support@example.com")

3. **Gaming APIs:**
   - Renew `RIOT_API_KEY` before Nov 14, 2025 at https://developer.riotgames.com/

4. **Session Security:**
   - Ensure `SESSION_SECRET` is cryptographically random (32+ characters)

5. **Deployment:**
   - Set `NODE_ENV=production`
   - Verify `BASE_URL` points to production domain

### 📋 Pre-Launch Testing Checklist

1. **Staging PayPal Flow:**
   - [ ] Test subscription approval with production plan IDs
   - [ ] Verify event logging creates entries in subscriptionEvents table
   - [ ] Confirm deduplication prevents double-processing (refresh page after approval)
   - [ ] Test cancellation flow and verify event logging

2. **Shipping Validation:**
   - [ ] Test US ZIP code validation (valid: 12345, 12345-6789; invalid: 1234A)
   - [ ] Test Canadian postal code (valid: A1A 1A1; invalid: 12345)
   - [ ] Test address rejection (purely numeric like "12345" should fail)

3. **Admin Access:**
   - [ ] Verify ADMIN_EMAILS restricts /api/admin/* endpoints correctly
   - [ ] Test fulfillment dashboard with admin account
   - [ ] Test rejection with non-admin account

### 🔮 Future Enhancements (Post-Launch)

- [ ] **PayPal Webhooks:** Implement webhook listeners for automatic renewal/cancellation notifications (reduces API calls, real-time updates)
- [ ] **Redis Rate Limiting:** Upgrade from in-memory to Redis-backed rate limiting for horizontal scaling
- [ ] **Riot OAuth Production:** Complete Riot OAuth approval process for production use
- [ ] **Enhanced Fraud Detection:** IP-based rate limiting, address verification API integration
- [ ] **Monitoring & Alerting:** Set up alerts for failed subscriptions, shipping validation failures, suspicious activity
