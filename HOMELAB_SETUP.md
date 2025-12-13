# EMPIRE HOMELAB - Complete Setup Guide

## Prerequisites

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and restart your PC
   - Ensure Docker Desktop is running (system tray icon)

2. **Verify Installation**
   ```powershell
   docker --version
   docker compose version
   ```

## Initial Setup

### Step 1: Configure Environment Variables

```powershell
# Copy template
cp .env.homelab .env

# Edit .env with your actual credentials
notepad .env
```

**Required Changes:**
- `POSTGRES_PASSWORD` - Strong password for database
- `REDIS_PASSWORD` - Strong password for Redis
- `SESSION_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `RIOT_API_KEY` - Your Riot API key
- OAuth credentials (Google, Discord, Twitch)
- PayPal credentials

### Step 2: Build and Start All Services

```powershell
# Build all Docker images
docker compose -f docker-compose.homelab.yml build

# Start all services in background
docker compose -f docker-compose.homelab.yml up -d

# View logs
docker compose -f docker-compose.homelab.yml logs -f
```

### Step 3: Verify Services

Check that all containers are running:
```powershell
docker compose -f docker-compose.homelab.yml ps
```

All services should show `Up` and `healthy`.

## Access URLs

Once deployed, access your services at:

| Service | URL | Description |
|---------|-----|-------------|
| **Empire API** | http://localhost:3000 | Backend API |
| **Empire Frontend** | http://localhost:8080 | Main dashboard |
| **Empire Hub** | http://localhost:8081 | Monitoring dashboard |
| **Uptime Kuma** | http://localhost:3001 | Uptime monitoring |
| **Grafana** | http://localhost:3030 | Metrics visualization (admin/admin) |
| **Prometheus** | http://localhost:9090 | Raw metrics |

## Configure Uptime Kuma

1. Open http://localhost:3001
2. Create admin account on first visit
3. Add monitors for each service:
   - **Empire API**: HTTP(s), URL: http://empire-api:3000/health, Interval: 60s
   - **Empire Frontend**: HTTP(s), URL: http://empire-frontend/health, Interval: 60s
   - **Empire Hub**: HTTP(s), URL: http://empire-hub:8080/health, Interval: 60s

## Heartbeat Monitor (Optional)

Run the local heartbeat monitor to see service status in your terminal:

```powershell
cd heartbeat-monitor
npm install
npm start
```

This will ping all services every 30 seconds and log their status.

## Management Commands

### View Logs
```powershell
# All services
docker compose -f docker-compose.homelab.yml logs -f

# Specific service
docker compose -f docker-compose.homelab.yml logs -f empire-api
```

### Restart Services
```powershell
# All services
docker compose -f docker-compose.homelab.yml restart

# Specific service
docker compose -f docker-compose.homelab.yml restart empire-api
```

### Stop All Services
```powershell
docker compose -f docker-compose.homelab.yml down
```

### Stop and Remove Volumes (CAUTION: Deletes data)
```powershell
docker compose -f docker-compose.homelab.yml down -v
```

### Rebuild After Code Changes
```powershell
docker compose -f docker-compose.homelab.yml up -d --build
```

## Troubleshooting

### Service Won't Start

1. Check logs:
   ```powershell
   docker compose -f docker-compose.homelab.yml logs empire-api
   ```

2. Check if port is in use:
   ```powershell
   netstat -ano | findstr :3000
   ```

3. Rebuild the service:
   ```powershell
   docker compose -f docker-compose.homelab.yml up -d --build empire-api
   ```

### Database Connection Issues

1. Ensure PostgreSQL is healthy:
   ```powershell
   docker exec empire-postgres pg_isready -U empire
   ```

2. Check DATABASE_URL in .env matches PostgreSQL credentials

### Can't Access Services

1. Verify Docker Desktop is running
2. Check firewall isn't blocking ports
3. Ensure services are healthy:
   ```powershell
   docker compose -f docker-compose.homelab.yml ps
   ```

## 24/7 Operation

**Auto-start on Windows Boot:**

1. Open Docker Desktop settings
2. Go to "General"
3. Enable "Start Docker Desktop when you log in"
4. Save

**Auto-start containers:**

All services use `restart: unless-stopped`, meaning they will:
- Restart automatically if they crash
- Start automatically when Docker Desktop starts
- NOT start if you manually stopped them

**Keep Your PC Running:**
- Disable sleep in Windows Power Settings
- Consider UPS (Uninterruptible Power Supply) for power outages

## Backup Strategy

### Daily Database Backups

Create a scheduled task to run:
```powershell
docker exec empire-postgres pg_dump -U empire empire_db > backup_$(date +%Y%m%d).sql
```

### Full System Backup

```powershell
# Stop services
docker compose -f docker-compose.homelab.yml down

# Backup volumes
docker run --rm -v empire_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restart services
docker compose -f docker-compose.homelab.yml up -d
```

## Performance Tuning

**Docker Desktop Resource Limits:**
1. Open Docker Desktop Settings
2. Resources tab
3. Recommended:
   - CPUs: 4+ cores
   - Memory: 8+ GB
   - Swap: 2 GB

**Database Tuning:**
Edit `docker-compose.homelab.yml` PostgreSQL command to add:
```yaml
command:
  - postgres
  - -c
  - max_connections=200
  - -c
  - shared_buffers=256MB
```

## Updating

### Update Code
```powershell
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.homelab.yml up -d --build
```

### Update Docker Images
```powershell
# Pull latest base images
docker compose -f docker-compose.homelab.yml pull

# Rebuild
docker compose -f docker-compose.homelab.yml up -d --build
```

---

**Your Empire is now running 24/7 on your homelab!**
