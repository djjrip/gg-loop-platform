# ═══════════════════════════════════════════════════════════════
# GG LOOP EMPIRE - HOMELAB DEPLOYMENT GUIDE
# Complete 24/7 Self-Hosted Operation
# ═══════════════════════════════════════════════════════════════

**Status:** PRIMARY PRODUCTION DEPLOYMENT  
**Infrastructure:** Docker Compose on local/homelab hardware  
**Updated:** 2025-12-05

---

## ARCHITECTURE SUMMARY

**Homelab is now the PRIMARY production environment for GG Loop Empire.**

**Services Deployed:**
- 🌐 **Caddy** - Reverse proxy with automatic HTTPS
- 🎮 **GG Loop App** - Main platform (ggloop.io)
- 🤖 **Antisocial Bot** - Marketing automation + campaign engine
- 📊 **Empire Hub** - Overmind dashboard
- 🔍 **Prometheus** - Metrics collection
- 📈 **Grafana** - Visualization dashboards
- 📝 **Loki + Promtail** - Log aggregation
- 🗄️ **PostgreSQL 16** - Primary database
- ⚡ **Redis 7** - Cache + session store
- 🏥 **AutoHeal** - Automatic container recovery

**Total:** 11 services, all with health checks and auto-restart

---

## FILES CREATED

### Core Configuration:
```
docker-compose.homelab.yml    # Production stack definition
.env.homelab                  # All environment variables
infra/homelab/Caddyfile       # Reverse proxy + HTTPS config
```

### Startup Scripts:
```
START-HOMELAB.bat             # Windows: Start everything
STOP-HOMELAB.bat              # Windows: Stop everything
VIEW-HOMELAB-LOGS.bat         # Windows: Live log monitoring
```

### AWS Templates (Future):
```
infra/aws/README.md                   # AWS deployment guide
infra/aws/docker-compose.aws.yml      # EC2 deployment
.github/workflows/deploy-aws.yml      # CI/CD pipeline
```

### Documentation:
```
RAILWAY_DEPRECATION_NOTICE.md  # Why Railway is no longer production
HOMELAB_DEPLOYMENT.md          # This file
```

---

## FILES MODIFIED

None - this is a clean addition to existing infrastructure.

**Existing `docker-compose.yml`** - Preserved for legacy/development use  
**Railway config** - Still present for preview deployments only

---

## HOMELAB COMMANDS

### Start Everything (ONE COMMAND):
```bash
# Windows
START-HOMELAB.bat

# Or manually
docker-compose -f docker-compose.homelab.yml --env-file .env.homelab up -d
```

### Stop Everything:
```bash
# Windows
STOP-HOMELAB.bat

# Or manually
docker-compose -f docker-compose.homelab.yml down
```

### View Logs:
```bash
# All services
docker-compose -f docker-compose.homelab.yml logs -f

# Specific service
docker-compose -f docker-compose.homelab.yml logs -f ggloop-app

# Last 100 lines
docker-compose -f docker-compose.homelab.yml logs --tail=100
```

### Check Status:
```bash
# List running services
docker-compose -f docker-compose.homelab.yml ps

# Check health
docker-compose -f docker-compose.homelab.yml ps | findstr healthy
```

### Restart Single Service:
```bash
docker-compose -f docker-compose.homelab.yml restart ggloop-app
```

### Update & Rebuild:
```bash
# Pull code changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.homelab.yml up -d --build
```

---

## AWS TEMPLATE STATUS

**Location:** `infra/aws/`

**What's Ready:**
- ✅ Docker Compose template for EC2
- ✅ GitHub Actions CI/CD workflow
- ✅ Deployment guide with 3 options
- ✅ Cost estimates ($60-175/mo)
- ✅ Environment variable mapping
- ✅ RDS + ElastiCache integration points

**What's NOT Done:**
- ⏸️ AWS account provisioning (do when ready)
- ⏸️ ECR repository creation
- ⏸️ RDS database setup
- ⏸️ ElastiCache cluster
- ⏸️ Load balancer configuration
- ⏸️ Route53 DNS management

**To Use Later:**
1. Create AWS account
2. Run GitHub Actions workflow: `deploy-aws.yml`
3. Configure secrets in GitHub
4. Deploy to EC2 or ECS/Fargate

**See:** `infra/aws/README.md` for full guide

---

## RAILWAY STATUS

**Current Role:** PREVIEW/SANDBOX ONLY

**What Railway is Good For:**
- ✅ Quick PR previews
- ✅ Demo environments
- ✅ Disposable testing

**What Railway NO LONGER Does:**
- ❌ Production ggloop.io (now homelab/AWS)
- ❌ User database (PostgreSQL on homelab)
- ❌ Session storage (Redis on homelab)
- ❌ Critical APIs (all self-hosted)

**See:** `RAILWAY_DEPRECATION_NOTICE.md` for full details

---

## MONITORING & SELF-CHECKS

### Access Monitoring:
- **Grafana:** http://localhost/grafana (or https://grafana.ggloop.io)
- **Prometheus:** http://localhost/prometheus
- **Empire Hub:** http://localhost/hub

### Health Check Endpoints:
```bash
# Main app
curl http://localhost:3000/health

# Antisocial bot
curl http://localhost:3001/health

# Empire Hub
curl http://localhost:8080/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3030/api/health
```

### AutoHeal Monitoring:
AutoHeal automatically restarts unhealthy containers.

**Check AutoHeal logs:**
```bash
docker logs empire-autoheal
```

**Manually restart a failed container:**
```bash
docker restart empire-ggloop
```

---

## TROUBLESHOOTING

### Services Won't Start

**1. Check Docker is running:**
```bash
docker info
```

**2. Check .env.homelab exists:**
```bash
# Should show the file
ls .env.homelab
```

**3. View errors:**
```bash
docker-compose -f docker-compose.homelab.yml logs
```

### Database Connection Issues

**Check PostgreSQL is healthy:**
```bash
docker-compose -f docker-compose.homelab.yml ps postgres
```

**Connect to database:**
```bash
docker exec -it empire-postgres psql -U empire -d ggloop_production
```

### Redis Connection Issues

**Test Redis:**
```bash
docker exec -it empire-redis redis-cli -a your_redis_password ping
```

### SSL/HTTPS Not Working

**Check Caddy logs:**
```bash
docker-compose -f docker-compose.homelab.yml logs caddy
```

**Verify domain DNS points to your server:**
```bash
nslookup ggloop.io
```

### High Memory Usage

**Check resource usage:**
```bash
docker stats
```

**Adjust PostgreSQL memory in `.env.homelab`:**
```bash
POSTGRES_SHARED_BUFFERS=256MB  # Lower if needed
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
```

---

## BACKUP & RECOVERY

### Backup Database:
```bash
docker exec empire-postgres pg_dump -U empire ggloop_production > backup.sql
```

### Backup Volumes:
```bash
# List volumes
docker volume ls

# Backup specific volume
docker run --rm -v empire_postgres-data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

### Restore Database:
```bash
docker exec -i empire-postgres psql -U empire ggloop_production < backup.sql
```

---

## PRODUCTION CHECKLIST

Before going live with homelab:

- [ ] .env.homelab configured with production secrets
- [ ] All OAuth providers set to production redirect URIs
- [ ] PayPal in LIVE mode (not sandbox)
- [ ] Riot API production key configured
- [ ] Domain DNS pointed to homelab IP
- [ ] SSL certificate generated (Caddy auto-generates)
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Backups automated (cron job or similar)
- [ ] Monitoring dashboards configured
- [ ] Health check alerts set up
- [ ] Empire Hub accessible
- [ ] All services showing "healthy"

---

## ADVANTAGES OF HOMELAB

**vs. Railway:**
- Full infrastructure control
- Predictable $0/month hosting cost
- No vendor lock-in
- Custom networking/security
- Unlimited resources (within hardware limits)
- No surprise billing

**vs. AWS (for now):**
- $0/month (vs. $60-175/month)
- Simpler to manage (for small scale)
- Faster iteration (no cloud deployment delay)
- Good for MVP/early stage

**When to Move to AWS:**
- Traffic exceeds homelab capacity
- Need 99.9%+ uptime SLA
- Global CDN required
- Team collaboration needs
- Compliance mandates (HIPAA, etc.)

---

## NEXT STEPS

**Immediate (Today):**
1. Run `START-HOMELAB.bat`
2. Verify all services healthy
3. Test ggloop.io access
4. Check Empire Hub dashboard

**This Week:**
1. Configure production DNS
2. Test SSL certificate generation
3. Set up automated backups
4. Configure monitoring alerts
5. Test all OAuth flows

**Future (When Ready):**
1. Deploy to AWS using templates
2. Set up CloudFront CDN
3. Configure auto-scaling
4. Implement multi-region

---

**HOMELAB STATUS:** Ready for Production  
**SINGLE BOOT COMMAND:** `START-HOMELAB.bat`  
**ZERO ONGOING COSTS:** Self-hosted  
**24/7 OPERATION:** Auto-heal + health checks

**You now have complete infrastructure independence.**
