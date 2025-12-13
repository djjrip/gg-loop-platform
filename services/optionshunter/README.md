# OPTIONS HUNTER SERVICE

**Version:** 2.0.0-fused  
**Status:** Production Ready  
**Integration:** Unified into GG LOOP platform

---

## Overview

Options Hunter is now a **first-class service within GG LOOP platform**. All market data, options analysis, and Tradier API calls flow through this unified service instead of scattered across multiple repos.

### What This Service Provides

- **Unified Tradier API Client** - Single source of truth for market data
- **HTTP API Endpoints** - RESTful API for internal services to consume
- **Signal Generation** - Automated trading signals for bots and alerts
- **Options Scanning** - Affordable options discovery for any budget
- **Unusual Activity Detection** - Real-time alerts for unusual volume/OI

---

## Architecture

```
GG LOOP PLATFORM
├── services/optionshunter/
│   ├── __init__.py           # Package initialization
│   ├── tradier_client.py     # Unified Tradier API client
│   └── api.py                # HTTP endpoints Blueprint
│
├── antisocial-bot/           # Consumes /api/optionshunter/signals
├── Empire Hub/               # Monitors /api/optionshunter/health
└── Main App/                 # Uses /api/optionshunter/* for premium features
```

---

## API Endpoints

All endpoints are prefixed with `/api/optionshunter`

### Health & Status

**`GET /api/optionshunter/health`**
- Health check for monitoring systems
- Returns: Service status + Tradier API accessibility

**`GET /api/optionshunter/status`**
- Detailed service information
- Returns: Version, mode, endpoints, integration status

### Market Data

**`GET /api/optionshunter/quote/<symbol>`**
- Get real-time stock quote
- Example: `/api/optionshunter/quote/AAPL`
- Returns: Price, volume, bid/ask, change

**`GET /api/optionshunter/options/<symbol>?max_cost=500`**
- Get affordable options for symbol
- Query params:
  - `max_cost`: Maximum cost per contract (default: 500)
- Returns: Cheapest calls and puts within budget

### Scanning & Signals

**`GET /api/optionshunter/scan?symbols=AAPL,MSFT&max_cost=500`**
- Scan multiple symbols for opportunities
- Query params:
  - `symbols`: Comma-separated symbols (optional, uses default watchlist)
  - `max_cost`: Maximum cost per contract
- Returns: Affordable options across all symbols

**`GET /api/optionshunter/signals`**
- **DESIGNED FOR BOTS** - Auto-formatted signals ready for posting
- Returns top 5 signals with:
  - `headline`: Human-readable summary
  - `tweet_ready`: Pre-formatted tweet text
  - `symbol`, `type`, `volume`, `OI`, etc.
- **Used by:** antisocial-bot for automated market tweets

**`GET /api/optionshunter/unusual?symbols=AAPL&limit=20`**
- Detect unusual options activity
- Query params:
  - `symbols`: Symbols to scan (optional)
  - `limit`: Max results (default: 20)
- Returns: Alerts for volume > 2x open interest

---

## Environment Variables

Required or recommended environment variables:

```env
# REQUIRED for production
TRADIER_API_KEY=your_tradier_api_key_here

# OPTIONAL
TRADIER_ACCOUNT_ID=your_account_id
TRADIER_SANDBOX=false   # Set to 'true' to use sandbox API
```

### Getting Tradier API Key

1. Sign up at [Tradier](https://tradier.com)
2. Navigate to API Access
3. Generate API key
4. Add to `.env` file

---

## Usage Examples

### From Python (Internal Services)

```python
# Import the unified client
from services.optionshunter import get_tradier_client

# Get client instance
client = get_tradier_client()

# Get a quote
quote = client.get_quote('AAPL')
print(f"AAPL: ${quote['last']}")

# Scan for affordable options
options = client.scan_affordable_options('AAPL', max_cost=300)
print(f"Found {len(options['calls'])} calls under $300")

# Get unusual activity
signals = client.get_unusual_activity(['AAPL', 'MSFT', 'TSLA'])
for signal in signals:
    print(f"{signal['symbol']}: {signal['headline']}")
```

### From Flask App (Register Routes)

```python
from flask import Flask
from services.optionshunter import init_optionshunter_routes

app = Flask(__name__)
init_optionshunter_routes(app)

# Now all /api/optionshunter/* routes are available
```

### From antisocial-bot (HTTP Requests)

```python
import requests

# Get signals for tweeting
response = requests.get('http://ggloop-app:3000/api/optionshunter/signals')
signals = response.json()['signals']

for signal in signals:
    # Tweet the pre-formatted content
    tweet_text = signal['tweet_ready']
    post_to_twitter(tweet_text)
```

### From cURL (Testing)

```bash
# Health check
curl http://localhost:3000/api/optionshunter/health

# Get quote
curl http://localhost:3000/api/optionshunter/quote/AAPL

# Scan for opportunities
curl "http://localhost:3000/api/optionshunter/scan?symbols=AAPL,MSFT&max_cost=500"

# Get bot signals
curl http://localhost:3000/api/optionshunter/signals
```

---

## Integration Guide

### Main GG LOOP App

Add to your main server file (e.g., `server/index.ts` or `index.js`):

```javascript
// Import and initialize Options Hunter routes
const { exec } = require('child_process');

// Option 1: Use Python API directly (if compatible)
// Option 2: Proxy through Express middleware
app.use('/api/optionshunter', createProxyMiddleware({
    target: 'http://localhost:8700',
    changeOrigin: true
}));
```

### antisocial-bot

Update bot to call internal API instead of external URLs:

```python
# OLD (external repo dependency)
# response = requests.get('https://optionshunter-production.railway.app/api/signals')

# NEW (internal service)
response = requests.get('http://ggloop-app:3000/api/optionshunter/signals')
signals = response.json()['signals']

# Signals are pre-formatted for posting
for signal in signals:
    post_to_twitter(signal['tweet_ready'])
```

### Empire Hub

Monitor Options Hunter health:

```javascript
// Add to Empire Hub monitoring
const checkOptionsHunter = async () => {
    const response = await fetch('http://ggloop-app:3000/api/optionshunter/health');
    const health = await response.json();
    
    return {
        service: 'Options Hunter',
        status: health.status,
        mode: health.tradier_api.mode
    };
};
```

---

## Docker Integration

Options Hunter is now **part of the main GG LOOP app container** instead of a separate service.

### Environment in docker-compose.yml

```yaml
ggloop-app:
  environment:
    # ... other env vars ...
    TRADIER_API_KEY: ${TRADIER_API_KEY}
    TRADIER_ACCOUNT_ID: ${TRADIER_ACCOUNT_ID}
    TRADIER_SANDBOX: ${TRADIER_SANDBOX:-false}
```

### Rebuild After Changes

```bash
# Rebuild main app (includes Options Hunter now)
docker-compose build ggloop-app

# Restart
docker-compose restart ggloop-app

# Verify
curl http://localhost:3000/api/optionshunter/health
```

---

## Monitoring & Health Checks

### Prometheus Metrics

Options Hunter can export Prometheus metrics (TODO: implement):

```yaml
# monitoring/prometheus.yml
- job_name: 'optionshunter'
  metrics_path: '/api/optionshunter/metrics'
  static_configs:
    - targets: ['ggloop-app:3000']
```

### Health Check Endpoint

```bash
curl http://localhost:3000/api/optionshunter/health
```

Expected response (healthy):
```json
{
  "service": "Options Hunter",
  "status": "healthy",
  "version": "2.0.0-fused",
  "tradier_api": {
    "status": "healthy",
    "mode": "production",
    "api_accessible": true
  },
  "timestamp": "2025-12-05T21:00:00.000Z"
}
```

---

## Troubleshooting

### Issue: "No API key configured"

**Solution:** Add `TRADIER_API_KEY` to `.env` file:
```bash
TRADIER_API_KEY=your_key_here
```

### Issue: "API returned invalid response"

**Possible causes:**
- Wrong API key
- Sandbox key used in production mode (or vice versa)
- Tradier API temporarily unavailable

**Solution:**
1. Verify API key is correct
2. Check `TRADIER_SANDBOX` environment variable
3. Test with curl: `curl https://api.tradier.com/v1/markets/quotes?symbols=SPY -H 'Authorization: Bearer YOUR_KEY'`

### Issue: Routes not found (404)

**Solution:** Ensure routes are initialized in main app:
```python
from services.optionshunter import init_optionshunter_routes
init_optionshunter_routes(app)
```

---

## Migration from Old Repo

### What Changed

| Old (djjrip/optionshunter) | New (GG LOOP platform) |
|----------------------------|------------------------|
| Separate repository | `/services/optionshunter/` |
| External API calls | Internal unified client |
| Deployed independently | Part of main app |
| Multiple Tradier clients | Single `TradierClient` |
| Copy-pasted code | Shared service |

### Deprecated Files

The following can be removed from old repo once fusion is verified:
- All Tradier API integration code
- Duplicate bot posting scripts
- Separate deployment configs

---

## Future Enhancements

### Planned Features

- [ ] Prometheus metrics export
- [ ] Redis caching for quotes
- [ ] WebSocket real-time updates
- [ ] Machine learning signal confidence
- [ ] Backtesting API
- [ ] Paper trading integration

### API Versioning

Currently: `v1` (default)  
Future: Support for `/api/v2/optionshunter/*`

---

## Support

For issues or questions:
- Check logs: `docker-compose logs ggloop-app | grep optionshunter`
- Test health: `curl http://localhost:3000/api/optionshunter/health`
- Review integration: See `services/optionshunter/api.py`

---

**Last Updated:** 2025-12-05  
**Maintained by:** GG LOOP LLC  
**License:** Proprietary
