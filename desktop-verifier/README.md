# GG LOOP Desktop Verifier

Electron-based desktop app for verifying gameplay sessions and generating proof of play.

## Features

- **Session Tracking**: Monitors active windows and processes to detect game activity
- **File Verification**: Locates and verifies match logs and screenshots
- **Heartbeat System**: Maintains connection with backend via 30-second pings
- **Authentication Bridge**: Secures desktop app with web token authentication

## Modules

### SessionTracker.js
- Tracks active window titles and process names
- Detects League of Legends, VALORANT, TFT processes
- Logs session data with timestamps
- Sends session start/end to backend

### FileVerifier.js
- Finds Riot Games match logs
- Locates recent screenshots
- Generates file hashes for verification
- Calculates verification score (0-100)

### AppHeartbeat.js
- Sends heartbeat every 30 seconds
- Tracks missed beats (stops after 3 failures)
- Maintains session alive status

### AuthBridge.js
- Authenticates with web token
- Generates device hash for security
- Refreshes tokens automatically
- Provides auth headers for API calls

## Installation

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL and web token

# Run in development mode
npm run dev
```

### Production Build

```bash
# Build for current platform
npm run build

# Output will be in dist/ directory
```

## Railway Deployment

1. Push to GitHub repository
2. Connect repository to Railway
3. Railway will auto-detect Node.js and use `railway.json` config
4. Set environment variables in Railway dashboard:
   - `API_URL`
   - `WEB_TOKEN`
   - `HEARTBEAT_INTERVAL`

## Usage

1. Launch the desktop app
2. App will authenticate using web token from .env
3. Session tracking starts automatically
4. Play League of Legends, VALORANT, or TFT
5. App detects game processes and logs activity
6. Heartbeat maintains connection with backend
7. Session data sent to backend on app close

## API Endpoints Used

- `POST /api/desktop/session/start` - Start tracking session
- `POST /api/desktop/session/end` - End session and send data
- `POST /api/desktop/verification/payload` - Submit verification proof
- `POST /api/desktop/heartbeat` - Send heartbeat ping
- `GET /api/desktop/version` - Check app version

## Security

- Device hash generated from machine ID
- All API calls use Bearer token authentication
- File hashes prevent tampering
- Session data encrypted in transit

## Supported Games

- League of Legends
- VALORANT
- Teamfight Tactics (TFT)

## Requirements

- Node.js 18+
- Electron 28+
- Active GG LOOP account
- Valid web authentication token

## Troubleshooting

**App won't authenticate**:
- Check API_URL in .env
- Verify WEB_TOKEN is valid
- Ensure backend is running

**Game not detected**:
- Make sure game is running
- Check process names in SessionTracker.js
- Verify game client is up to date

**Heartbeat failures**:
- Check internet connection
- Verify API_URL is accessible
- Review backend logs for errors

## License

MIT - GG LOOP LLC
