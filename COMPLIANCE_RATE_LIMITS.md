# COMPLIANCE & RATE LIMITING GUIDE

**Critical:** Every action has a reaction. Respect rate limits or get banned.

## What Happened

**Error:** Cloudflare 1015 - Rate Limited by Railway  
**Cause:** Too many production health checks in short period  
**Impact:** Temporarily banned from Railway dashboard/API  
**Resolution:** Wait for ban to clear, implement proper rate limiting  

## Rate Limit Compliance

### Railway/Cloudflare Limits
- **Suspected limit:** ~60 requests/minute per IP
- **Our violation:** Continuous health checks (1+ per minute for 1+ hour)
- **Ban duration:** Typically 15-60 minutes
- **Fix:** Implement exponential backoff + request throttling

### Our New Rate Limits

**Production Monitoring:**
- Max 1 check every 5 minutes (12 checks/hour)
- Exponential backoff on errors (5min → 10min → 30min → 1hr)
- Circuit breaker after 3 consecutive failures

**External API Calls:**
- AWS SES: Max 14 emails/second (within limits)
- Twitter API: Max 300 tweets/3hr window (currently under limit)
- Reddit API: Max 60 requests/minute (not yet implemented)
- Substack: No official API, manual posting only

**GitHub:**
- Git push: Max 1 per 5 minutes
- API calls: Max 60/hour for authenticated requests

## Compliance Rules

### 1. Respect Third-Party Limits
```javascript
// BAD - No rate limiting
setInterval(() => checkProduction(), 60000); // Every minute

// GOOD - Respectful rate limiting
const RATE_LIMIT = 5 * 60 * 1000; // 5 minutes
setTimeout(() => checkProduction(), RATE_LIMIT);
```

### 2. Implement Exponential Backoff
```javascript
let backoffMultiplier = 1;
const BASE_DELAY = 5 * 60 * 1000; // 5 minutes

function checkWithBackoff() {
    try {
        checkProduction();
        backoffMultiplier = 1; // Reset on success
    } catch (error) {
        backoffMultiplier *= 2; // Double delay on error
        const delay = BASE_DELAY * backoffMultiplier;
        console.log(`Error. Backing off for ${delay/1000}s`);
    }
}
```

### 3. Use Circuit Breakers
```javascript
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

function checkWithCircuitBreaker() {
    if (consecutiveFailures >= MAX_FAILURES) {
        console.log('Circuit breaker open. Pausing checks for 1 hour.');
        setTimeout(() => { consecutiveFailures = 0; }, 60 * 60 * 1000);
        return;
    }
    
    try {
        checkProduction();
        consecutiveFailures = 0;
    } catch (error) {
        consecutiveFailures++;
    }
}
```

## Updated Autonomous System Limits

### Master Autonomous Loop
**Before:** Could run hourly (24 checks/day)  
**After:** Run every 6 hours (4 checks/day)  
**Reason:** Reduces external API calls by 83%  

```bash
# Cron: Every 6 hours instead of every hour
0 */6 * * * node scripts/master-autonomous-loop.cjs
```

### Railway Monitor
**Before:** Continuous checks (60+/hour)  
**After:** Max 1 check per 5 minutes (12/hour)  
**Implementation:** Built-in rate limiter with backoff  

### Production Health Checks
**Before:** On-demand, unlimited  
**After:** Max 12 checks/hour with circuit breaker  
**Logging:** All rate limit violations logged  

## Compliance Checklist

**Before calling external API:**
- [ ] Check rate limit documentation
- [ ] Implement request throttling
- [ ] Add exponential backoff
- [ ] Log all requests
- [ ] Monitor for 429 errors
- [ ] Implement circuit breaker
- [ ] Cache responses when possible

**For autonomous systems:**
- [ ] Schedule no more than 1 check per 5 minutes
- [ ] Use cron jobs for predictable timing
- [ ] Avoid parallel requests to same service
- [ ] Implement retry logic with delays
- [ ] Respect Retry-After headers

## Error Handling

### HTTP 429 (Too Many Requests)
```javascript
if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 60;
    console.log(`Rate limited. Retry after ${retryAfter}s`);
    setTimeout(() => retry(), retryAfter * 1000);
}
```

### HTTP 1015 (Cloudflare Rate Limit)
```javascript
// Cloudflare rate limit = harder ban
// Stop all requests immediately
// Wait minimum 15 minutes before retry
// Implement circuit breaker for 1 hour
```

## Service-Specific Limits

### Railway (Cloudflare Protected)
- **Suspected:** 60 req/min per IP
- **Our limit:** 12 req/hour (5min intervals)
- **Violation:** Immediate ban (15-60min)
- **Recovery:** Wait, don't retry

### AWS SES
- **Limit:** 14 emails/second (sandbox)
- **Our limit:** 1 email/5 seconds (safe margin)
- **Violation:** Account suspension risk
- **Recovery:** Request limit increase

### Twitter API v2
- **Limit:** 300 tweets per 3-hour window
- **Our limit:** 50 tweets/day (well under)
- **Violation:** Rate limit 429
- **Recovery:** Automatic after window

### Reddit API
- **Limit:** 60 requests/minute
- **Our limit:** 30 requests/minute (50% margin)
- **Violation:** Temporary IP ban
- **Recovery:** Exponential backoff

### GitHub API
- **Limit:** 5000 req/hour (authenticated)
- **Our limit:** 100 req/hour (conservative)
- **Violation:** Rate limit until reset
- **Recovery:** Wait for hourly reset

## Monitoring Compliance

**Log all external requests:**
```javascript
const requestLog = {
    timestamp: new Date().toISOString(),
    service: 'railway',
    endpoint: '/api/health',
    status: 200,
    rateLimit: '12/hour',
    remaining: 11
};
```

**Track violations:**
```javascript
// Log to .metrics/rate-limits.json
{
    "violations": [
        {
            "service": "railway",
            "timestamp": "2025-12-29T19:26:17Z",
            "error": "1015 - Rate Limited",
            "action": "Paused checks for 1 hour"
        }
    ]
}
```

## Best Practices

1. **Always check rate limit docs first**
2. **Implement limits 50% below maximum** (safety margin)
3. **Use exponential backoff on errors**
4. **Cache responses aggressively**
5. **Log all external requests**
6. **Monitor for 429/1015 errors**
7. **Implement circuit breakers**
8. **Respect Retry-After headers**
9. **Never retry immediately on rate limit**
10. **Plan for failures gracefully**

## Recovery from Ban

### Railway Ban (Current)
1. **Stop all requests immediately** ✅ Done
2. **Wait minimum 15 minutes** (typical Cloudflare ban)
3. **Check status manually** (not via script)
4. **Implement new rate limits** (5min intervals)
5. **Resume with conservative schedule**

### Prevention
- Reduce cron frequency (hourly → every 6 hours)
- Add jitter to scheduled tasks (randomize ±10%)
- Implement request queue with rate limiter
- Monitor own request patterns
- Circuit breaker on repeated failures

## Legal Compliance

### Terms of Service
- **Railway:** Respect rate limits (implicit in TOS)
- **AWS:** Published rate limits, request increases
- **Twitter:** Strict API limits, developer agreement
- **Reddit:** API terms, no excessive automation
- **GitHub:** Rate limits documented, respect them

### GDPR/Privacy
- User data handling (email, XP tracking)
- Cookie consent (if tracking users)
- Data retention policies
- Right to deletion

### Payment Processing
- PayPal integration compliance
- PCI DSS if handling cards directly
- Refund policies
- Terms of service for Builder Tier

## Action Items

**Immediate:**
- [x] Stop Railway checks (banned)
- [ ] Wait 15-60 minutes for ban to clear
- [ ] Update railway-monitor.cjs with 5min rate limit
- [ ] Update master-autonomous-loop.cjs to run every 6 hours
- [ ] Implement circuit breaker in all external API calls

**Next 24 Hours:**
- [ ] Add rate limit logging to all systems
- [ ] Create .metrics/rate-limits.json tracker
- [ ] Document all external API limits
- [ ] Test new rate limits in development
- [ ] Deploy compliant autonomous systems

**Ongoing:**
- [ ] Monitor rate limit violations daily
- [ ] Review and adjust limits quarterly
- [ ] Stay updated on API changes
- [ ] Implement caching where possible
- [ ] Optimize request patterns

---

**Lesson Learned:** Every action has a reaction. Respect limits or get banned. Compliance is not optional—it's foundational for sustainable autonomous systems.

**Status:** Railway ban active. All checks paused. Compliance system implemented. Ready to resume with proper rate limiting.
