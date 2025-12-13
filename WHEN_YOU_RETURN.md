# GG LOOP - HOMELAB DEPLOYMENT ONLY

**Deployment Status:** Homelab is the sole production environment.  
**Railway:** Completely deprecated and removed from codebase.

## LIVE SITE

**Production URL:** https://ggloop.io  
**Deployment:** Homelab (Docker Compose)  
**Infrastructure:** Self-hosted, $0/month

## KEY PAGES

- **Main Site:** https://ggloop.io
- **Roadmap:** https://ggloop.io/roadmap
- **Subscription:** https://ggloop.io/subscription
- **Shop:** https://ggloop.io/shop
- **Stats:** https://ggloop.io/stats

## DEPLOYMENT COMMANDS

**Start Production Stack:**
```bash
START-HOMELAB.bat
```

**Stop Production Stack:**
```bash
STOP-HOMELAB.bat
```

**View Status:**
```bash
docker-compose -f docker-compose.homelab.yml ps
```

**View Logs:**
```bash
docker-compose -f docker-compose.homelab.yml logs -f
```

## SERVICES

All services run via `docker-compose.homelab.yml`:

| Service | Port | Health Check | Auto-Restart |
|---------|------|--------------|--------------|
| Caddy (Reverse Proxy) | 80, 443 | ✅ | ✅ |
| GG Loop App | 3000 | ✅ | ✅ |
| PostgreSQL | 5432 | ✅ | ✅ |
| Redis | 6379 | ✅ | ✅ |
| Antisocial Bot | 3001 | ✅ | ✅ |
| Empire Hub | 8080 | ✅ | ✅ |
| Prometheus | 9090 | ✅ | ✅ |
| Grafana | 3030 | ✅ | ✅ |
| Loki | 3100 | ✅ | ✅ |
| Promtail | - | - | ✅ |
| AutoHeal | - | - | ✅ |

## MONITORING

- **Empire Hub:** http://localhost:8080
- **Grafana:** http://localhost:3030
- **Prometheus:** http://localhost:9090

## DOCUMENTATION

- **Homelab Deployment Guide:** `HOMELAB_DEPLOYMENT.md`
- **Infrastructure Report:** `DEPLOYMENT_ARCHITECTURE_COMPLETE.md`
- **Railway Deprecation:** `RAILWAY_DEPRECATION_NOTICE.md`

**Note:** Railway was completely removed from codebase as of 2025-12-05.  
All production traffic is served from self-hosted homelab infrastructure.
