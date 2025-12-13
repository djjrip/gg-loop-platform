# ═══════════════════════════════════════════════════════════════
# EMPIRE MONITORING STACK - HEALTH CHECK
# Automated verification of all monitoring services
# ═══════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          EMPIRE MONITORING STACK - HEALTH CHECK          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Docker is running
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check Prometheus
Write-Host "📊 Checking Prometheus (http://localhost:9090)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Prometheus is healthy" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Prometheus is not responding" -ForegroundColor Red
}

# Check Grafana
Write-Host "📈 Checking Grafana (http://localhost:3030)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3030/api/health" -UseBasicParsing -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    if ($health.database -eq "ok") {
        Write-Host "✅ Grafana is healthy" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Grafana is not responding" -ForegroundColor Red
}

# Check Loki
Write-Host "📝 Checking Loki (http://localhost:3100)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3100/ready" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Loki is healthy" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Loki is starting or unhealthy (this is okay for now)" -ForegroundColor Yellow
}

Write-Host ""

# Check Docker containers
Write-Host "🔍 Checking Docker containers..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "label=empire.type=monitoring"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 ACCESS YOUR MONITORING:" -ForegroundColor Green
Write-Host "   📊 Prometheus:  http://localhost:9090" -ForegroundColor White
Write-Host "   📈 Grafana:     http://localhost:3030 (admin/admin)" -ForegroundColor White
Write-Host "   📝 Loki:        http://localhost:3100" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
