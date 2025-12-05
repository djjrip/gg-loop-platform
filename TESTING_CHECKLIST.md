# GG LOOP - TESTING CHECKLIST

**Deployment:** Homelab (Docker Compose)  
**URL:** https://ggloop.io

## QUICK START TESTING

1. **Verify Site is Live:**
   ```bash
   curl -I https://ggloop.io
   # Should return 200 OK
   ```

2. **Check All Services:**
   ```bash
   docker-compose -f docker-compose.homelab.yml ps
   # All services should show "healthy"
   ```

3. **View Logs:**
   ```bash
   docker-compose -f docker-compose.homelab.yml logs -f ggloop-app
   ```

## CRITICAL PAGES

Test each of these URLs:

- [ ] https://ggloop.io (Home)
- [ ] https://ggloop.io/roadmap (Empire Vision)
- [ ] https://ggloop.io/subscription (Payment Flow)
- [ ] https://ggloop.io/shop (Armory)
- [ ] https://ggloop.io/stats (User Stats)
- [ ] https://ggloop.io/about (Mission)

## FUNCTIONALITY TESTS

### 1. OAuth Login

Test all OAuth providers:
- [ ] Google Login
- [ ] Discord Login  
- [ ] Twitch Login

### 2. Database Connection

```bash
docker exec -it empire-postgres psql -U empire -d ggloop_production -c "SELECT COUNT(*) FROM users;"
```

### 3. Redis Cache

```bash
docker exec -it empire-redis redis-cli -a YOUR_PASSWORD ping
# Should return: PONG
```

### 4. Payment Processing

- [ ] Subscription page loads
- [ ] PayPal checkout works
- [ ] Payment confirmation displays

### 5. Stats Integration

- [ ] Riot API key configured
- [ ] Match data syncs
- [ ] Stats page displays data

## MONITORING CHECKS

### Empire Hub
```
http://localhost:8080
```

- [ ] All services show "healthy"
- [ ] No failures in status
- [ ] Monitoring graphs display

### Grafana
```
http://localhost:3030
```

- [ ] Login works (admin/password from .env.homelab)
- [ ] Dashboards load
- [ ] Metrics displaying

### Prometheus
```
http://localhost:9090
```

- [ ] Targets showing "UP"
- [ ] Metrics scraping
- [ ] Queries work

## PERFORMANCE TESTS

### Load Testing
```bash
# Test 100 concurrent requests
ab -n 1000 -c 100 https://ggloop.io/
```

### Response Time
```bash
curl -w "@-" -o /dev/null -s https://ggloop.io/ <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

## SECURITY CHECKS

- [ ] HTTPS working (SSL certificate valid)
- [ ] Security headers present
- [ ] No exposed credentials in logs
- [ ] Database accessible only internally
- [ ] Redis password protected

## AUTOMATED SYSTEMS

### Antisocial Bot
```bash
docker-compose -f docker-compose.homelab.yml logs antisocial-bot
```

- [ ] Bot is running
- [ ] Posting to social platforms
- [ ] Using correct ggloop.io URLs
- [ ] No errors in logs

### AutoHeal
```bash
docker logs empire-autoheal
```

- [ ] Monitoring all containers
- [ ] Auto-restart working
- [ ] No stuck containers

## FULL SYSTEM RESTART TEST

```bash
# Stop everything
STOP-HOMELAB.bat

# Wait 10 seconds

# Start everything
START-HOMELAB.bat

# Verify all services come back healthy
docker-compose -f docker-compose.homelab.yml ps
```

**All services should return to healthy state within 60 seconds.**

## BACKUP VERIFICATION

- [ ] Database backups exist
- [ ] Backup script runs successfully
- [ ] Restoration process documented

## FINAL CHECKLIST

Before declaring production-ready:

- [ ] All tests above pass
- [ ] No critical errors in logs
- [ ] All OAuth providers work
- [ ] Payment processing functional
- [ ] Monitoring stack operational
- [ ] Auto-heal working
- [ ] SSL certificate valid
- [ ] DNS pointing to homelab IP
- [ ] All URLs use https://ggloop.io

**Remember:** All testing is done against Homelab deployment (`docker-compose.homelab.yml`).  
Railway has been completely removed from the infrastructure.
