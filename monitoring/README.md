# 🎯 Empire Monitoring Stack

Automated monitoring and observability for the GG Loop Platform using Prometheus, Grafana, Loki, and Promtail.

---

## 🚀 Quick Start

### One-Click Start (Windows)
Double-click `START_MONITORING.bat` to automatically:
1. Start all monitoring containers
2. Run health checks
3. Open Grafana in your browser

### Manual Start
```bash
docker-compose up -d prometheus grafana loki promtail
```

### Health Check
```bash
powershell -ExecutionPolicy Bypass -File CHECK_MONITORING.ps1
```

---

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3030 | `admin` / `admin` |
| **Prometheus** | http://localhost:9090 | None |
| **Loki** | http://localhost:3100 | None (access via Grafana) |

---

## 📊 Services Overview

### Prometheus
- **Purpose**: Metrics collection and time-series database
- **Port**: 9090
- **Config**: `monitoring/prometheus.yml`
- **Retention**: 30 days

### Grafana
- **Purpose**: Visualization dashboards and alerting
- **Port**: 3030
- **Dashboards**: Auto-provisioned from `monitoring/grafana/dashboards/`
- **Datasources**: Auto-configured (Prometheus + Loki)

### Loki
- **Purpose**: Log aggregation
- **Port**: 3100
- **Config**: `monitoring/loki-config.yml`
- **Storage**: Docker volume `loki-data`

### Promtail
- **Purpose**: Log collection from Docker containers
- **Config**: `monitoring/promtail-config.yml`
- **Targets**: All Docker containers in the empire network

---

## 📈 Pre-Configured Dashboards

1. **Empire Command Center - Overview**
   - Container status monitoring
   - CPU & Memory usage
   - Request rates
   - Live application logs

---

## 🔧 Configuration

### Environment Variables

Set these in your `.env` file to customize:

```bash
# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_password
GRAFANA_PORT=3030

# Prometheus
PROMETHEUS_PORT=9090

# Loki
LOKI_PORT=3100
```

### Custom Dashboards

1. Place JSON dashboard files in: `monitoring/grafana/dashboards/`
2. Restart Grafana: `docker-compose restart grafana`
3. Dashboards will auto-load

---

## 🛠️ Common Commands

### View Logs
```bash
# Prometheus logs
docker logs empire-prometheus

# Grafana logs
docker logs empire-grafana

# Loki logs
docker logs empire-loki
```

### Restart Services
```bash
docker-compose restart prometheus
docker-compose restart grafana
docker-compose restart loki
```

### Stop All Monitoring
```bash
docker-compose stop prometheus grafana loki promtail
```

### Remove All (including data)
```bash
docker-compose down -v
```

---

## 🎨 Grafana First-Time Setup

1. Navigate to http://localhost:3030
2. Login with `admin` / `admin`
3. Change your password (recommended)
4. Click the **Grafana logo** (top left)
5. Navigate to **Dashboards** → **Empire** folder
6. Select **Empire Command Center - Overview**

---

##  Troubleshooting

### Loki shows "unhealthy"
This is normal during startup. Wait 1-2 minutes and run the health check again.

### Grafana can't connect to Prometheus
1. Ensure all containers are in the same network: `docker network ls`
2. Check Prometheus is running: `docker ps | grep prometheus`
3. Test connection: `docker exec empire-grafana ping prometheus`

### No data in dashboards
1. Verify Prometheus is scraping targets: http://localhost:9090/targets
2. Check datasources in Grafana: **Configuration** → **Data sources**
3. Ensure your application is exposing metrics on `/metrics` endpoint

---

## 📦 Data Persistence

All data is stored in Docker volumes:
- `prometheus-data`: Metrics storage
- `grafana-data`: Dashboards and settings
- `loki-data`: Log storage

These persist even when containers are stopped.

---

## 🔐 Production Recommendations

1. **Change default passwords** immediately
2. **Enable HTTPS** with a reverse proxy (nginx/Caddy)
3. **Set up alerts** in Grafana for critical metrics
4. **Configure backup** for Grafana dashboards
5. **Limit retention** based on your storage capacity

---

## 🎯 Next Steps

- [ ] Customize retention periods in `prometheus.yml`
- [ ] Add custom metrics to your application
- [ ] Create application-specific dashboards
- [ ] Set up alerting rules
- [ ] Configure notification channels (Slack, Discord, Email)

---

**Questions?** Check the [Grafana Documentation](https://grafana.com/docs/) or [Prometheus Documentation](https://prometheus.io/docs/)
