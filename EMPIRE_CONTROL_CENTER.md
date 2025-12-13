# Empire Control Center - Quick Start Guide

## 🚀 One-Command Deployment

### Windows
```powershell
.\deploy.ps1
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Prerequisites

1. **Docker Desktop** installed and running
2. **Git** (optional, for updates)
3. **.env file** configured (script will create from .env.example)

## 🔧 First-Time Setup

1. Copy environment variable template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your credentials:
   - Database passwords
   - OAuth credentials (Google, Discord, Twitch)
   - Riot API key
   - PayPal credentials
   - Session secret

3. Run deployment script (see above)

## 🌐 Access Points

After deployment, access your services at:

- **GG Loop Platform**: http://localhost:3000
- **Empire Hub Dashboard**: http://localhost:8080
- **Grafana Dashboards**: http://localhost:3030 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090

## 📊 Monitoring

The Empire Hub dashboard at http://localhost:8080 provides:
- Real-time service health status
- Key business metrics (users, revenue, subscriptions)
- Embedded Grafana dashboards
- API performance monitoring

## 🛑 Managing Services

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f ggloop-app

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart ggloop-app

# View running services
docker-compose ps
```

## 🔄 Updating

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs service-name

# Rebuild image
docker-compose build service-name
docker-compose up -d service-name
```

### Port already in use
Edit `.env` file and change the port variables

### Database connection failed
Ensure PostgreSQL is healthy:
```bash
docker-compose logs postgres
docker-compose exec postgres pg_isready
```

## 📚 Architecture

- **ggloop-app**: Main gaming rewards platform (Node.js/Express/React)
- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 cache and session store
- **prometheus**: Metrics collection
- **grafana**: Visualization dashboards
- **loki**: Log aggregation
- **promtail**: Log shipping
- **empire-hub**: Unified control dashboard

## 🎯 What's Next

1. Configure OAuth providers in their respective consoles
2. Set up Riot API production key
3. Configure PayPal for live mode
4. Clone optionshunter repo for full stack
5. Customize Grafana dashboards
6. Set up Discord webhooks for alerts

---

Built with ❤️ for 24/7 autonomous operation
