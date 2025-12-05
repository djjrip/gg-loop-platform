# ═══════════════════════════════════════════════════════════════
# EMPIRE CONTROL CENTER - WINDOWS DEPLOYMENT
# One-command deployment for Windows PowerShell
# ═══════════════════════════════════════════════════════════════

Write-Host "🚀 Empire Control Center - Deployment Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "⚠️  No .env file found!" -ForegroundColor Yellow
    Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Please edit .env file with your configuration and run this script again." -ForegroundColor Green
    exit 1
}

# Check Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Pull latest code
Write-Host "📥 Pulling latest code..." -ForegroundColor Cyan
try {
    git pull origin main
}
catch {
    Write-Host "⚠️  Git pull failed or not a git repo" -ForegroundColor Yellow
}

Write-Host ""

# Build images
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build
Write-Host "✅ Images built successfully" -ForegroundColor Green

Write-Host ""

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check health
Write-Host ""
Write-Host "🏥 Service Health Check:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "  - GG Loop Platform: http://localhost:3000"
Write-Host "  - Empire Hub Dashboard: http://localhost:8080"
Write-Host "  - Grafana: http://localhost:3030 (admin/admin)"
Write-Host "  - Prometheus: http://localhost:9090"
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f"
Write-Host ""
Write-Host "🛑 Stop all services:" -ForegroundColor Cyan
Write-Host "  docker-compose down"
Write-Host ""
