# COSMIC EMPIRE HUB

**Single-file dashboard showing Past · Present · Future of your GG Loop Empire**

## Features

- **Cosmic Map**: Visual orbits of all services (Empire Hub, Options Hunter, Antisocial Bot, GG LOOP)
- **Timeline**: Past events, current status, future projections
- **Failure Sentry**: Auto-reads from `IMPERIAL_SENTRY_REPORT_CORRECTED.md`
- **Founder DNA**: Your operational rules encoded

## Quick Start

### Option 1: Windows Batch File
```batch
START_COSMIC_HUB.bat
```

### Option 2: Direct Command
```powershell
node cosmic_empire_hub.js
```

### Option 3: Custom Port
```powershell
$env:COSMIC_PORT=8081
node cosmic_empire_hub.js
```

## Access

Once running, open your browser to:
```
http://localhost:8080
```

## APIs

The hub exposes 4 JSON APIs:

### 1. Service Status
```
GET /api/cosmic/status
```
Returns health of all services (Empire Hub, Options Hunter, Antisocial Bot, ggloop.io)

### 2. Timeline Events
```
GET /api/cosmic/events
```
Returns timeline (reads from `events.json` if present, otherwise sample data)

### 3. Failure Sentry
```
GET /api/cosmic/failures
```
Returns failures (reads from `IMPERIAL_SENTRY_REPORT_CORRECTED.md`)

### 4. Founder DNA
```
GET /api/founder/dna
```
Returns your operational rules

## Customization

### Add Custom Events

Create `events.json` in the root directory:
```json
[
  {
    "time": "Past · 2h ago",
    "label": "New feature deployed",
    "impact": "Revenue increased 15%"
  },
  {
    "time": "Now",
    "label": "Bot posting to Twitter",
    "impact": "Active engagement"
  },
  {
    "time": "Future · 12h",
    "label": "Scheduled maintenance",
    "impact": "2 min downtime expected"
  }
]
```

### Modify Service Checks

Edit `cosmic_empire_hub.js` line ~90:
```javascript
const services = [
  {
    name: "Your Service",
    type: "port",      // or "url"
    target: 9000,      // port number or URL string
    stability: 15      // orbit rotation speed (seconds)
  },
  // ... add more services
];
```

### Change Founder DNA

Edit `cosmic_empire_hub.js` line ~22:
```javascript
const FOUNDER_DNA = {
  fallbackURL: "https://ggloop.io",
  rules: [
    "Your custom rule 1",
    "Your custom rule 2",
    // ... add more rules
  ]
};
```

## Integration with ETERNAL SENTRY

The Cosmic Hub automatically integrates with the Imperial Sentry system:

1. **Reads failures** from `IMPERIAL_SENTRY_REPORT_CORRECTED.md`
2. **Displays health** of all monitored services
3. **Updates every 30 seconds** with live data

## Architecture

```
cosmic_empire_hub.js
  ├─ Express server (port 8080)
  ├─ Service health checks (TCP ports + HTTP URLs)
  ├─ File readers (events.json, IMPERIAL_SENTRY_REPORT_CORRECTED.md)
  └─ Single-page HTML app with auto-refresh
```

## Dependencies

- `express` - Web server
- `node-fetch@2` - HTTP client for URL checks

Already installed with:
```powershell
npm install express node-fetch@2
```

## Troubleshooting

### Port 8080 already in use
```powershell
$env:COSMIC_PORT=8081
node cosmic_empire_hub.js
```

### Dependencies missing
```powershell
npm install
```

### Can't access from browser
- Check firewall
- Verify server started without errors
- Try http://127.0.0.1:8080 instead

## ETERNAL AUTOPILOT Integration

The Cosmic Hub is fully integrated with the ETERNAL AUTOPILOT + IMPERIAL FAILURE SENTRY system:

- **Automatic failure detection** from sentry reports
- **Real-time service monitoring** (health checks every 30s)
- **Founder DNA enforcement** (operational rules displayed)
- **Timeline tracking** (past/present/future events)

**Status**: ✅ DEPLOYED & OPERATIONAL
