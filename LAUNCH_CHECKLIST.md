# 🚀 GG LOOP PRE-LAUNCH CHECKLIST

## Critical Environment Variables (Required Before Launch)

### 1. Update Riot API Key (Do This First!)
- [ ] Open **Secrets** tab (🔒 icon in left sidebar)
- [ ] Find `RIOT_API_KEY`
- [ ] Update to: `RGAPI-d4667bcf-5bf8-48e0-b0dc-2f9591dd60b7`
- [ ] Save changes

### 2. PayPal Production Configuration
- [ ] `PAYPAL_CLIENT_ID` - Your live PayPal client ID
- [ ] `PAYPAL_CLIENT_SECRET` - Your live PayPal secret
- [ ] `PAYPAL_BASIC_PLAN_ID` - Live Basic plan ID ($5/month)
- [ ] `PAYPAL_PRO_PLAN_ID` - Live Pro plan ID ($12/month)
- [ ] `PAYPAL_ELITE_PLAN_ID` - Live Elite plan ID ($25/month)

**⚠️ CRITICAL**: Do NOT use sandbox plan IDs in production. The app will reject them.

### 3. Admin Access
- [ ] `ADMIN_EMAILS` - Comma-separated list of admin emails
  - Example: `admin@ggloop.io,support@ggloop.io`

### 4. Production Mode
- [ ] `NODE_ENV` - Set to `production`

### 5. Base URL (If deploying)
- [ ] `BASE_URL` - Your production domain (e.g., `https://ggloop.io`)

## Pre-Launch Verification

### Security ✓
- [x] PayPal sandbox ID rejection in production
- [x] Admin-only route protection (`/api/admin/*`)
- [x] Shipping address validation (regex-based)
- [x] Idempotent event logging
- [x] SQL injection protection (parameterized queries)

### Features ✓
- [x] Multi-provider OAuth (Discord, Twitch, Google)
- [x] Riot account linking (League/Valorant)
- [x] Automatic match sync (every 10 minutes)
- [x] PayPal subscription management
- [x] Points engine with 12-month expiry
- [x] Rewards catalog & redemption
- [x] Manual fulfillment workflow
- [x] Admin dashboard (centralized)
- [x] Trophy case system
- [x] Sponsored challenges
- [x] Free tier with GG Coins

### Database ✓
- [x] Production PostgreSQL configured
- [x] All migrations applied
- [x] Transactional integrity for points

## Deployment Steps

1. **Configure all required secrets** (see above)
2. **Test admin access** - Log in and verify `/admin` dashboard loads
3. **Test PayPal subscription** - Create test account, subscribe to Basic tier
4. **Verify Riot API** - Link a League account, check match sync logs
5. **Click the Publish button** in Replit to deploy

## Rate Limits & Monitoring

### Riot API Production
- **Rate limits**: 20 req/1s, 100 req/2min
- **Coverage**: League of Legends only
- **Note**: Need separate approval for Valorant/TFT

### PayPal
- Production PayPal API has higher rate limits than sandbox

## Post-Launch

- Monitor `/tmp/logs/` for errors
- Check match sync logs every 10 minutes
- Review admin dashboard for pending reward fulfillments
- Monitor Riot API rate limit usage

---

**Ready to launch?** Once all secrets are configured, click the **Publish** button in Replit to deploy your app! 🎉
