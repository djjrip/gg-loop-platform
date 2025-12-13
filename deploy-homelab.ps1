# ═══════════════════════════════════════════════════════════════
# EMPIRE HOMELAB - ONE-COMMAND DEPLOY (PowerShell)
# ═══════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       EMPIRE HOMELAB - DEPLOYMENT SCRIPT                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then start Docker Desktop and run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

# Check if .env exists
Write-Host ""
Write-Host "[2/6] Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Write-Host "⚠ No .env file found - creating from template..." -ForegroundColor Yellow
    Copy-Item .env.homelab .env
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env with your credentials before deploying!" -ForegroundColor Red
    Write-Host "Opening .env in notepad..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    notepad .env
    Write-Host ""
    Write-Host "Have you configured .env? (Press Enter when ready)" -ForegroundColor Yellow
    Read-Host
}

# Stop existing containers
Write-Host ""
Write-Host "[3/6] Stopping existing containers..." -ForegroundColor Yellow
docker compose -f docker-compose.homelab.yml down 2>&1 | Out-Null
Write-Host "✓ Cleaned up old containers" -ForegroundColor Green

# Build images
Write-Host ""
Write-Host "[4/6] Building Docker images..." -ForegroundColor Yellow
Write-Host "(This may take 5-10 minutes on first run)" -ForegroundColor Gray
docker compose -f docker-compose.homelab.yml build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✓ Images built successfully" -ForegroundColor Green

# Start services
Write-Host ""
Write-Host "[5/6] Starting all services..." -ForegroundColor Yellow
docker compose -f docker-compose.homelab.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start services!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✓ All services started" -ForegroundColor Green

# Wait for health checks
Write-Host ""
Write-Host "[6/6] Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host "(This may take up to 60 seconds)" -ForegroundColor Gray
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "SERVICE STATUS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
docker compose -f docker-compose.homelab.yml ps

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              DEPLOYMENT COMPLETE!                         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 ACCESS YOUR SERVICES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Empire Frontend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Empire API:       " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Uptime Kuma:      " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3001" -ForegroundColor Yellow
Write-Host "  Grafana:          " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3030" -ForegroundColor Yellow
Write-Host "  Empire Hub:       " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8081" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 MANAGEMENT COMMANDS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View logs:        " -NoNewline -ForegroundColor White
Write-Host "docker compose -f docker-compose.homelab.yml logs -f" -ForegroundColor Gray
Write-Host "  Restart all:      " -NoNewline -ForegroundColor White
Write-Host "docker compose -f docker-compose.homelab.yml restart" -ForegroundColor Gray
Write-Host "  Stop all:         " -NoNewline -ForegroundColor White
Write-Host "docker compose -f docker-compose.homelab.yml down" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
